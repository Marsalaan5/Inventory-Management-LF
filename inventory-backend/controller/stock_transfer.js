


// "use strict";

// import dotenv from "dotenv";
// import * as fs from "node:fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import Joi from "joi";
// import { DateTime, Settings } from "luxon";
// import { v7 as uuidv7 } from "uuid";
// import * as XLSX from "xlsx/xlsx.mjs";
// XLSX.set_fs(fs);
// import do_ma_query from "../database/mariadb.js";
// import { product_mvmt_log } from "../services/log_service.js";

// const __dirname = path.dirname(fileURLToPath(import.meta.url));
// dotenv.config({ path: path.resolve(__dirname, "../.env") });
// Settings.defaultZone = process.env.SCRIPT_TIMEZONE;

// // ─────────────────────────────────────────────────────────────────────────────
// // Helpers
// // ─────────────────────────────────────────────────────────────────────────────

// /**
//  * Parse a MariaDB ENUM type string such as
//  *   enum('good','faulty','broke/burnt')
//  * into a plain JS array: ["good", "faulty", "broke/burnt"]
//  */
// const parseEnumString = (enumStr = "") =>
//   enumStr
//     .replace(/^enum\(/, "")
//     .replace(/\)$/, "")
//     .split(",")
//     .map((s) => s.replace(/'/g, "").trim())
//     .filter(Boolean);

// /**
//  * Validate that a product still exists in the given warehouse with the
//  * given status and has at least `count` units available.
//  * Returns true if valid, false otherwise.
//  */
// const is_valid_product = async (product) => {
//   const rows = await do_ma_query(
//     "SELECT count FROM product WHERE prod_uuid = ? AND warehouse_id = ? AND status = ?;",
//     [product.prod_uuid, product.warehouse_id, product.status],
//   );
//   if (!rows.length) return false;
//   return product.count <= rows[0].count;
// };

// /**
//  * Generate the next stock_id for a warehouse.
//  * Format: STT-{ABBR}-{ddMMMMyy}-{n}
//  * Increments goods_mvmt_count on the warehouse row.
//  * Returns { stock_id, goods_mvmt_count, goods_mvmt_date }.
//  */
// const generate_stock_id = async (warehouse_id) => {
//   const [wh] = await do_ma_query(
//     "SELECT abbr, goods_mvmt_count, goods_mvmt_date FROM warehouse WHERE wh_uuid = ?;",
//     [warehouse_id],
//   );
//   if (!wh) throw new Error("Warehouse not found");

//   const today       = DateTime.local();
//   const todayStr    = today.toFormat("yyyy-MM-dd");
//   const shortDate   = today.month < 10
//     ? today.toFormat("ddMyy")
//     : today.toFormat("ddMMMyy");

//   let count = wh.goods_mvmt_count || 0;
//   let date  = wh.goods_mvmt_date;

//   if (date === todayStr) {
//     count++;
//   } else {
//     count = 1;
//     date  = todayStr;
//   }

//   const stock_id = `STT-${wh.abbr}-${shortDate}-${count}`;
//   await do_ma_query(
//     "UPDATE warehouse SET goods_mvmt_count = ?, goods_mvmt_date = ? WHERE wh_uuid = ?;",
//     [count, date, warehouse_id],
//   );
//   return { stock_id, goods_mvmt_count: count, goods_mvmt_date: date };
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /auth/stockFlowOptions
// // Returns transport enum values, all product status enum values, and the
// // subset of statuses that are allowed to be transferred.
// //
// // The frontend must NEVER hard-code these values — it reads them here.
// // ─────────────────────────────────────────────────────────────────────────────
// export const stock_flow_options = async (req, res) => {
//   try {
//     const [transportCol, statusCol] = await Promise.all([
//       do_ma_query("SHOW COLUMNS FROM stock_flow LIKE 'transport';"),
//       do_ma_query("SHOW COLUMNS FROM product   LIKE 'status';"),
//     ]);

//     const transport       = parseEnumString(transportCol[0]?.Type);
//     const product_status  = parseEnumString(statusCol[0]?.Type);

//     // Define which statuses are transferable.
//     // Edit this array on the server only — clients read it from here.
//     // Typically: anything that is not a "terminal" state (missing, scrapped, etc.)
//     const NON_TRANSFERABLE = ["missing", "scrapped", "disposed"];
//     const transferable_statuses = product_status.filter(
//       (s) => !NON_TRANSFERABLE.includes(s.toLowerCase()),
//     );

//     return res.status(200).json({
//       success: true,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       data: {
//         transport,
//         product_status,
//         transferable_statuses,
//       },
//     });
//   } catch (err) {
//     console.error("stock_flow_options error:", err);
//     return res.status(500).json({
//       success: false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message: "Internal server error",
//     });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // GET /auth/getExistingLot
// // Returns the current user's unsubmitted draft, if any, including the full
// // product array enriched with warehouse_name and product title so the frontend
// // can restore the complete UI state.
// // ─────────────────────────────────────────────────────────────────────────────
// export const get_existing_stock_flow = async (req, res) => {
//   try {
//     const { user } = req;

//     const rows = await do_ma_query(
//       `SELECT
//          sf.stock_id,
//          sf.to_warehouse,
//          sf.transport,
//          sf.description,
//          sf.product_arr,
//          w.name   AS to_warehouse_name,
//          w.wh_uuid AS to_warehouse_uuid
//        FROM stock_flow sf
//        LEFT JOIN warehouse w ON w.wh_uuid = sf.to_warehouse
//        WHERE sf.created_by = ? AND sf.is_submitted IS FALSE
//        LIMIT 1;`,
//       [user.uuid],
//     );

//     if (!rows.length) {
//       return res.status(200).json({
//         success:   true,
//         is_found:  false,
//         data:      null,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "No active draft found",
//       });
//     }

//     const lot     = rows[0];
//     const rawArr  = JSON.parse(lot.product_arr || "[]");


//     const enriched = await Promise.all(
//       rawArr.map(async (item) => {
//         try {
//           const [prod] = await do_ma_query(
//             `SELECT
//                p.prod_uuid,
//                p.partial_code,
//                p.status,
//                p.count           AS available,
//                ap.name           AS article_profile_name,
//                wh.name           AS warehouse_name,
//                wh.wh_uuid        AS warehouse_id
//              FROM product p
//              LEFT JOIN article_profile ap ON ap.ap_uuid = p.article_profile_id
//              LEFT JOIN warehouse       wh ON wh.wh_uuid = p.warehouse_id
//              WHERE p.prod_uuid = ?
//              LIMIT 1;`,
//             [item.prod_uuid],
//           );

//           if (!prod) return null; 

//           return {
//             prod_uuid:            prod.prod_uuid,
//             partial_code:         prod.partial_code,
//             article_profile_name: prod.article_profile_name || "—",
//             warehouse_name:       prod.warehouse_name        || "—",
//             warehouse_id:         prod.warehouse_id,
//             status:               prod.status,
//             available:            prod.available, 
//             count:                item.count,          
//           };
//         } catch {
//           return null;
//         }
//       }),
//     );

//     const prod_arr = enriched.filter(Boolean);

//     return res.status(200).json({
//       success:  true,
//       is_found: true,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       data: {
//         stock_id:    lot.stock_id,
//         to_warehouse: {
//           wh_uuid: lot.to_warehouse_uuid,
//           name:    lot.to_warehouse_name,
//         },
//         transport:   lot.transport,
//         description: lot.description,
//         prod_arr,
//       },
//       message: "Draft found",
//     });
//   } catch (err) {
//     console.error("get_existing_lot error:", err);
//     return res.status(500).json({
//       success:   false,
//       is_found:  false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Internal server error",
//     });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /auth/stockFlowSync
// // Creates or updates the draft stock_flow row.
// // On the very first call (no existing draft) it generates a stock_id.
// // Every subsequent call updates the existing row.
// //
// // Body: { to_wh, transportation, prod_arr, description? }
// // prod_arr items: { prod_uuid, partial_code, article_profile_name, status, count }
// // ─────────────────────────────────────────────────────────────────────────────
// export const stock_transfer_sync = async (req, res) => {
//   try {
//     if (!req.body || !Object.keys(req.body).length) {
//       return res.status(400).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "Request body cannot be empty",
//       });
//     }

//     // ── Read allowed enum values from DB (never hardcode) ─────────────────
//     const [transportCol, statusCol] = await Promise.all([
//       do_ma_query("SHOW COLUMNS FROM stock_flow LIKE 'transport';"),
//       do_ma_query("SHOW COLUMNS FROM product   LIKE 'status';"),
//     ]);
//     const tpt_arr          = parseEnumString(transportCol[0]?.Type);
//     const prod_status_arr  = parseEnumString(statusCol[0]?.Type);

//     // ── Joi schema ────────────────────────────────────────────────────────
//     const prod_obj_schema = Joi.object({
//       prod_uuid:            Joi.string().guid({ version: ["uuidv7"] }).required().label("Product ID"),
//       partial_code:         Joi.string().min(3).max(127).required().label("Unique Code"),
//       article_profile_name: Joi.string().min(1).max(127).required().label("Article Profile Name"),
//       status:               Joi.string().valid(...prod_status_arr).required().label("Status"),
//       count:                Joi.number().integer().min(1).max(10000).required().label("Count"),
//     });

//     const stock_trf_schema = Joi.object({
//       to_wh:          Joi.string().guid({ version: ["uuidv7"] }).required().label("To Warehouse ID"),
//       transportation: Joi.string().valid(...tpt_arr).required().label("Transport"),
//       prod_arr:       Joi.array().items(prod_obj_schema).min(1).required().label("Products List"),
//       description:    Joi.string().max(255).optional().label("Description"),
//     });

//     const { user } = req;
//     const { error, value } = stock_trf_schema.validate(req.body);

//     if (error) {
//       return res.status(400).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   error.details[0].message,
//       });
//     }

//     // ── Check destination warehouse exists ────────────────────────────────
//     const [toWhRow] = await do_ma_query(
//       "SELECT COUNT(*) AS c FROM warehouse WHERE wh_uuid = ?;",
//       [value.to_wh],
//     );
//     if (!toWhRow || toWhRow.c !== 1) {
//       return res.status(404).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "Destination warehouse not found",
//       });
//     }

//     // ── Check source warehouse exists ─────────────────────────────────────
//     const [fromWhRow] = await do_ma_query(
//       "SELECT COUNT(*) AS c FROM warehouse WHERE wh_uuid = ?;",
//       [user.warehouse_id],
//     );
//     if (!fromWhRow || fromWhRow.c !== 1) {
//       return res.status(400).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "Your warehouse is not assigned or not found",
//       });
//     }

//     // ── Look for an existing unsubmitted draft ────────────────────────────
//     const existingRows = await do_ma_query(
//       "SELECT stock_id FROM stock_flow WHERE created_by = ? AND is_submitted IS FALSE;",
//       [user.uuid],
//     );
//     const draftExists = existingRows.length > 0;
//     let   stock_id    = draftExists ? existingRows[0].stock_id : null;

//     let data_saved = false;

//     if (!draftExists) {
//       // ── First sync: create a new draft row with a generated stock_id ───
//       const generated = await generate_stock_id(user.warehouse_id);
//       stock_id = generated.stock_id;

//       const affectedRows = (await do_ma_query(
//         `INSERT INTO stock_flow
//            (stock_id, from_warehouse, to_warehouse, product_arr, transport,
//             invoice, created_by, is_submitted, status, description, created_at, updated_at)
//          VALUES (?, ?, ?, ?, ?, ?, ?, FALSE, 'approved', ?, NOW(), NOW());`,
//         [
//           stock_id,
//           user.warehouse_id,
//           value.to_wh,
//           JSON.stringify(value.prod_arr),
//           value.transportation,
//           user.upload_dir && user.file_name
//             ? path.join(user.upload_dir, user.file_name)
//             : null,
//           user.uuid,
//           value.description ?? null,
//         ],
//       )).affectedRows;

//       data_saved = affectedRows === 1;
//     } else {
//       // ── Subsequent sync: update existing draft ─────────────────────────
//       const changedRows = (await do_ma_query(
//         `UPDATE stock_flow
//          SET to_warehouse = ?, product_arr = ?, transport = ?, description = ?, updated_at = NOW()
//          WHERE stock_id = ? AND is_submitted IS FALSE;`,
//         [
//           value.to_wh,
//           JSON.stringify(value.prod_arr),
//           value.transportation,
//           value.description ?? null,
//           stock_id,
//         ],
//       )).changedRows;

//       // changedRows is 0 when the data is identical to what's already stored,
//       // which is still a valid "saved" state.
//       data_saved = changedRows >= 0;
//     }

//     if (data_saved) {
//       return res.status(200).json({
//         success:   true,
//         stock_id,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "Products synced successfully.",
//       });
//     }

//     return res.status(500).json({
//       success:   false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Products syncing failed.",
//     });
//   } catch (err) {
//     console.error("stock_transfer_sync error:", err);
//     return res.status(500).json({
//       success:   false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Internal server error",
//     });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // POST /auth/stockFlowSubmit
// // Validates every product in the draft against live inventory then marks the
// // draft as submitted and sets status to 'in-transit'.
// // No request body — server reads the draft by req.user.uuid.
// // ─────────────────────────────────────────────────────────────────────────────
// export const stock_transfer_submit = async (req, res) => {
//   try {
//     const { user } = req;

//     const rows = await do_ma_query(
//       "SELECT * FROM stock_flow WHERE created_by = ? AND is_submitted IS FALSE;",
//       [user.uuid],
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         success:   false,
//         data:      {},
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "No active draft found — please scan products first.",
//       });
//     }

//     const stock_data     = rows[0];
//     stock_data.product_arr = JSON.parse(stock_data.product_arr || "[]");

//     if (!stock_data.product_arr.length) {
//       return res.status(400).json({
//         success:   false,
//         data:      {},
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "Draft contains no products.",
//       });
//     }

//     // ── Validate each product against live inventory ───────────────────────
//     const accurate_prods = [];
//     const mistake_prods  = [];

//     for (const item of stock_data.product_arr) {
//       const curr = {
//         prod_uuid:    item.prod_uuid,
//         status:       item.status,
//         count:        item.count,               // quantity_to_transfer
//         warehouse_id: user.warehouse_id,
//       };
//       const ok = await is_valid_product(curr);
//       (ok ? accurate_prods : mistake_prods).push({
//         prod_uuid: item.prod_uuid,
//         status:    item.status,
//         count:     item.count,
//       });
//     }

//     if (mistake_prods.length) {
//       return res.status(400).json({
//         success:   false,
//         data:      mistake_prods,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "Inconsistent data — please check the error report.",
//       });
//     }

//     // ── All products valid: mark submitted ────────────────────────────────
//     const updateRes = await do_ma_query(
//       `UPDATE stock_flow
//        SET product_arr = ?, is_submitted = TRUE, status = 'in-transit', updated_at = NOW()
//        WHERE stock_id = ?;`,
//       [JSON.stringify(accurate_prods), stock_data.stock_id],
//     );

//     if (updateRes.changedRows === 1) {
//       return res.status(200).json({
//         success:   true,
//         data:      { stock_id: stock_data.stock_id },
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "Stock flow submitted successfully.",
//       });
//     }

//     return res.status(500).json({
//       success:   false,
//       data:      {},
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Stock submission update failed.",
//     });
//   } catch (err) {
//     console.error("stock_transfer_submit error:", err);
//     return res.status(500).json({
//       success:   false,
//       data:      {},
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Internal server error",
//     });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DELETE /auth/removeLotProduct/:partial_code
// // Removes a single product from the user's active draft by partial_code.
// // If the draft becomes empty, the entire draft row is deleted.
// // ─────────────────────────────────────────────────────────────────────────────
// export const remove_stock_product = async (req, res) => {
//   try {
//     const { user }         = req;
//     const { partial_code } = req.params;

//     if (!partial_code) {
//       return res.status(400).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "partial_code is required",
//       });
//     }

//     const rows = await do_ma_query(
//       "SELECT stock_id, product_arr FROM stock_flow WHERE created_by = ? AND is_submitted IS FALSE LIMIT 1;",
//       [user.uuid],
//     );

//     if (!rows.length) {
//       return res.status(404).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "No active draft found",
//       });
//     }

//     const { stock_id } = rows[0];
//     const prod_arr     = JSON.parse(rows[0].product_arr || "[]");

//     const original_length = prod_arr.length;
//     const updated_arr     = prod_arr.filter((p) => p.partial_code !== partial_code);

//     if (updated_arr.length === original_length) {
//       return res.status(404).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   `Product with code "${partial_code}" not found in draft`,
//       });
//     }

//     if (updated_arr.length === 0) {
//       // Draft is now empty — delete the whole row to keep things clean
//       await do_ma_query("DELETE FROM stock_flow WHERE stock_id = ?;", [stock_id]);
//       return res.status(200).json({
//         success:       true,
//         draft_deleted: true,
//         timestamp:     DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:       "Last product removed. Draft deleted.",
//       });
//     }

//     await do_ma_query(
//       "UPDATE stock_flow SET product_arr = ?, updated_at = NOW() WHERE stock_id = ?;",
//       [JSON.stringify(updated_arr), stock_id],
//     );

//     return res.status(200).json({
//       success:       true,
//       draft_deleted: false,
//       timestamp:     DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:       `"${partial_code}" removed from draft.`,
//     });
//   } catch (err) {
//     console.error("remove_lot_product error:", err);
//     return res.status(500).json({
//       success:   false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Internal server error",
//     });
//   }
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // DELETE /auth/discardDraft
// // Deletes the user's entire unsubmitted draft.
// // ─────────────────────────────────────────────────────────────────────────────
// export const discard_draft = async (req, res) => {
//   try {
//     const { user } = req;

//     const result = await do_ma_query(
//       "DELETE FROM stock_flow WHERE created_by = ? AND is_submitted IS FALSE;",
//       [user.uuid],
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({
//         success:   false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message:   "No active draft found to discard",
//       });
//     }

//     return res.status(200).json({
//       success:   true,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Draft discarded successfully.",
//     });
//   } catch (err) {
//     console.error("discard_draft error:", err);
//     return res.status(500).json({
//       success:   false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message:   "Internal server error",
//     });
//   }
// };






// // GET
// export const getProduct = async (req, res) => {
// 	try {
// 		const { warehouseFilter } = req;
// 		// console.log("getProduct warehouseFilter:", warehouseFilter);

// 		const {
// 			page = 1,
// 			limit = 10,
// 			search = "",
// 			status = "",
// 			warehouse_id = "",
// 			article_profile_id = "",
// 			sortBy = "created_at",
// 			sortOrder = "DESC",
// 		} = req.query;

// 		const offset = (page - 1) * limit;

// 		let whereConditions = [];
// 		let queryParams = [];

// 		if (warehouse_id) {
// 			whereConditions.push("p.warehouse_id = ?");
// 			queryParams.push(warehouse_id);
// 		} else if (warehouseFilter) {
// 			whereConditions.push("p.warehouse_id = ?");
// 			queryParams.push(warehouseFilter);
// 		}

// 		if (search) {
// 			whereConditions.push("(p.title LIKE ? OR p.barcode LIKE ?)");
// 			queryParams.push(`%${search}%`, `%${search}%`);
// 		}

// 		if (status) {
// 			whereConditions.push("p.status = ?");
// 			queryParams.push(status);
// 		}

// 		if (article_profile_id) {
// 			whereConditions.push("p.article_profile_id = ?");
// 			queryParams.push(article_profile_id);
// 		}

// 		const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

// 		const allowedSortFields = ["created_at", "updated_at", "title", "count", "status"];
// 		const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
// 		const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

// 		// Main query with joins
// 		const query = `
// 			SELECT p.*,
// 				CONCAT(p.count, ' ', UPPER(LEFT(ap.unit, 1)), LOWER(SUBSTRING(ap.unit, 2))) AS count,
// 				ap.title as article_profile_name,
//     			w.title as warehouse_name,       
//         		updater.name as updated_by_name
//       		FROM product p
//       			LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
//       			LEFT JOIN warehouse w ON p.warehouse_id = w.wh_uuid
//       			LEFT JOIN users updater ON p.last_updated_by = updater.usr_uuid
// 			${whereClause}
//       		ORDER BY p.${validSortBy} ${validSortOrder}
//       		LIMIT ? OFFSET ?`;

// 		queryParams.push(parseInt(limit), parseInt(offset));

// 		const products = await do_ma_query(query, queryParams);

// 		// Count total for pagination
// 		const countQuery = `SELECT COUNT(*) as total FROM product p ${whereClause}`;
// 		const countResult = await do_ma_query(countQuery, queryParams.slice(0, -2));

// 		res.status(200).json({
// 			success: true,
// 			data: products,
// 			pagination: {
// 				total: countResult[0].total,
// 				page: parseInt(page),
// 				limit: parseInt(limit),
// 				totalPages: Math.ceil(countResult[0].total / limit),
// 			},
// 			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 		});
// 	} catch (error) {
// 		console.error("Error fetching products:", error);
// 		res.status(500).json({
// 			success: false,
// 			message: "Error fetching products",
// 			error: error.message,
// 			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 		});
// 	}
// };










import pool from "../db.js";
import { DateTime } from "luxon";
import Joi from "joi";
import { do_ma_query } from "../db.js";
import { sendEmail } from "../services/emailService.js";
import { 
  getNotifications as getNotificationsService,
  createNotification as createNotificationService,
  createNotificationByEmail as createNotificationByEmailService,
  markAsRead as markAsReadService,
  markAllAsRead as markAllAsReadService
} from "../services/notificationService.js";


const buildEmailQuery = ({ category, userId, userEmail, search }) => {
  const categoryMap = {
    inbox: {
      clause: 'recipient_email = ? AND status != "trash"',
      params: [userEmail],
    },
    sent: {
      clause: 'sender_id = ? AND status = "sent"',
      params: [userId],
    },
    starred: {
      clause:
        '(sender_id = ? OR recipient_email = ?) AND is_starred = TRUE AND status != "trash"',
      params: [userId, userEmail],
    },
    drafts: {
      clause: 'sender_id = ? AND status = "draft"',
      params: [userId],
    },
    trash: {
      clause: '(sender_id = ? OR recipient_email = ?) AND status = "trash"',
      params: [userId, userEmail],
    },
  };

  const categoryData = categoryMap[category];
  if (!categoryData) return null;

  let { clause, params } = categoryData;

 
  if (search) {
    clause +=
      " AND MATCH(subject, body, sender_email, recipient_email) AGAINST(? IN BOOLEAN MODE)";
    params.push(`${search}*`);
  }

  return { clause, params };
};

export const getEmails = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10, search = "", lastCreatedAt } = req.query;
    const userId = req.user.id;
    const userEmail = req.user.email;

    let offset = (page - 1) * limit;
    let keysetFilter = "";
    const queryData = buildEmailQuery({ category, userId, userEmail, search });

    if (!queryData) {
      return res.status(400).json({
        success: false,
        message: "Invalid category",
        timestamp: DateTime.local().toISO(),
      });
    }

    let { clause, params } = queryData;

  
    if (lastCreatedAt) {
      keysetFilter = " AND created_at < ?";
      params.push(lastCreatedAt);
      offset = 0; 
    }

    const query = `
      SELECT * FROM emails
      WHERE ${clause} ${keysetFilter}
      ORDER BY created_at DESC
      LIMIT ?
    `;

    const countQuery = `SELECT COUNT(*) as total FROM emails WHERE ${clause}`;

    const emails = await do_ma_query(query, [...params, parseInt(limit)]);
    const countResult = await do_ma_query(countQuery, params);
    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
        lastCreatedAt: emails.length
          ? emails[emails.length - 1].created_at
          : null,
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error(`[Email Fetch Error] ${error.stack}`);
    res.status(500).json({
      success: false,
      message: "Error fetching emails",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};

// get mails
export const getEmailById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const emails = await do_ma_query(
      `SELECT * FROM emails 
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [id, userId, userEmail]
    );

    if (emails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    res.status(200).json({
      success: true,
      data: emails[0],
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching email:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching email",
      error: error.message,
    });
  }
};

//send 
export const sendEmails = async (req, res) => {
  try {
    const emailSchema = Joi.object({
      to: Joi.string().email().required().label("recipient email"),
      subject: Joi.string().min(1).max(500).required().label("subject"),
      body: Joi.string().required().label("body"),
      template: Joi.string().max(100).allow("", null).label("template"),
      enableFollowUp: Joi.boolean().default(false).label("enable follow-up"),
      followUpDays: Joi.number().integer().min(1).max(30).default(2).label("follow-up days"),
      enableEscalation: Joi.boolean().default(false).label("enable escalation"),
      escalationEmail: Joi.string().email().allow("", null).label("escalation email"),
      escalationDays: Joi.number().integer().min(1).max(30).default(3),
    });

    const { error, value } = emailSchema.validate(req.body, {
      abortEarly: false,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;

    
const result = await do_ma_query(
  `INSERT INTO emails (
    sender_id, sender_email, recipient_email, subject, body, 
    status, follow_up_scheduled, follow_up_days, 
    escalation_enabled, escalation_email, template_type
  ) VALUES (?, ?, ?, ?, ?, 'sent', ?, ?, ?, ?, ?)`,
  [
    userId, userEmail, value.to, value.subject, value.body,
    value.enableFollowUp, value.followUpDays,
    value.enableEscalation, value.escalationEmail || null,
    value.template || "none",
  ]
);

    const emailId = result.insertId;

   
    await sendEmail({
      to: value.to,
      from: userEmail,
      subject: value.subject,
      html: value.body,
    });

  
    await do_ma_query(
      "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
      [emailId, "sent", JSON.stringify({ timestamp: new Date() })]
    );

   
  await createNotificationByEmailService({
  userEmail: value.to,
  emailId,
  type: "new_email",
  title: "New Email",
  message: `You have a new email from ${userEmail}`,
});

    res.status(201).json({
      success: true,
      message: "Email sent successfully",
      data: {
        emailId,
        followUpScheduled: value.enableFollowUp,
        escalationEnabled: value.enableEscalation,
      },
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error sending email:", error);
    res.status(500).json({
      success: false,
      message: "Error sending email",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};


export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `UPDATE emails 
       SET is_read = TRUE 
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [id, userId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email marked as read",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating email",
    });
  }
};


export const toggleStar = async (req, res) => {
  try {
    const { id } = req.params;
    const { starred } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `UPDATE emails 
       SET is_starred = ? 
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [starred, id, userId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Star updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error updating email",
    });
  }
};


export const deleteEmail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `UPDATE emails 
       SET status = 'trash'
       WHERE id = ?
         AND (sender_id = ? OR recipient_email = ?)`,
      [id, userId, userEmail]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Email not found or access denied",
      });
    }

    res.status(200).json({
      success: true,
      message: "Email moved to trash",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error deleting email",
    });
  }
};


export const bulkAction = async (req, res) => {
  try {
    const { action } = req.params;
    const { emailIds } = req.body;

    if (!emailIds || emailIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No emails selected",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    const placeholders = emailIds.map(() => "?").join(",");
    const userId = req.user.id;
    const userEmail = req.user.email;

    switch (action) {
      case "read":
        await do_ma_query(
          `UPDATE emails 
           SET is_read = TRUE 
           WHERE id IN (${placeholders}) 
             AND (sender_id = ? OR recipient_email = ?)`,
          [...emailIds, userId, userEmail]
        );
        break;

      case "unread":
        await do_ma_query(
          `UPDATE emails 
           SET is_read = FALSE 
           WHERE id IN (${placeholders}) 
             AND (sender_id = ? OR recipient_email = ?)`,
          [...emailIds, userId, userEmail]
        );
        break;

      case "delete":
        await do_ma_query(
          `UPDATE emails 
           SET status = 'trash'
           WHERE id IN (${placeholders})
             AND (sender_id = ? OR recipient_email = ?)`,
          [...emailIds, userId, userEmail]
        );
        break;

      default:
        return res.status(400).json({
          success: false,
          message: "Invalid action",
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        });
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error performing bulk action:", error);
    res.status(500).json({
      success: false,
      message: "Error performing bulk action",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};


export const getTemplates = async (req, res) => {
  try {
    const templates = await do_ma_query(
      "SELECT * FROM email_templates WHERE is_active = TRUE ORDER BY name"
    );

    res.status(200).json({
      success: true,
      data: templates,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching templates",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

export const getReceivedEmails = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const userEmail = req.user.email;
    const offset = (page - 1) * limit;

    let searchClause = "";
    let params = [userEmail];

    if (search) {
      searchClause = " AND MATCH(subject, body, sender_email) AGAINST(? IN BOOLEAN MODE)";
      params.push(`${search}*`);
    }

    const query = `
      SELECT * FROM emails
      WHERE recipient_email = ? AND status = 'sent' ${searchClause}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;

    const countQuery = `
      SELECT COUNT(*) as total FROM emails 
      WHERE recipient_email = ? AND status = 'sent' ${searchClause}
    `;

    const emails = await do_ma_query(query, [...params, parseInt(limit), offset]);
    const countResult = await do_ma_query(countQuery, params);
    const total = countResult[0].total;

    res.status(200).json({
      success: true,
      data: emails,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error fetching received emails:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching received emails",
      error: error.message,
    });
  }
};


export const saveDraft = async (req, res) => {
  try {
    const { to, subject, body, template } = req.body;
    const userId = req.user.id;
    const userEmail = req.user.email;

    const result = await do_ma_query(
      `INSERT INTO emails (
        sender_id, sender_email, recipient_email, subject, body, 
        status, template_type
      ) VALUES (?, ?, ?, ?, ?, 'draft', ?)
      ON DUPLICATE KEY UPDATE
        subject = VALUES(subject),
        body = VALUES(body),
        updated_at = CURRENT_TIMESTAMP`,
      [userId, userEmail, to || "", subject || "", body || "", template || "none"]
    );

    res.status(201).json({
      success: true,
      message: "Draft saved successfully",
      data: { emailId: result.insertId },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error saving draft:", error);
    res.status(500).json({
      success: false,
      message: "Error saving draft",
      error: error.message,
    });
  }
};




export const sendStockRequest = async (req, res) => {
  try {
    const stockRequestSchema = Joi.object({
      to: Joi.string().email().required(),
      productName: Joi.string().required(),
      quantity: Joi.number().integer().min(1).required(),
      urgency: Joi.string().valid('low', 'medium', 'high').default('medium'),
      notes: Joi.string().allow(''),
      enableFollowUp: Joi.boolean().default(true),
      followUpDays: Joi.number().integer().min(1).max(30).default(2),
      enableEscalation: Joi.boolean().default(false),
      escalationEmail: Joi.string().email().allow('', null),
      escalationDays: Joi.number().integer().min(1).max(30).default(3),
    });

    const { error, value } = stockRequestSchema.validate(req.body);

    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
      });
    }

    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.username || userEmail;

    const subject = `Stock Request: ${value.productName} (${value.quantity} units)`;
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #333;">Stock Request</h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>From:</strong> ${userName} (${userEmail})</p>
          <p style="margin: 5px 0;"><strong>Product:</strong> ${value.productName}</p>
          <p style="margin: 5px 0;"><strong>Quantity:</strong> ${value.quantity}</p>
          <p style="margin: 5px 0;"><strong>Urgency:</strong> <span style="color: ${
            value.urgency === 'high' ? 'red' : value.urgency === 'medium' ? 'orange' : 'green'
          }; font-weight: bold;">${value.urgency.toUpperCase()}</span></p>
        </div>
        
        ${value.notes ? `
          <div style="margin: 15px 0;">
            <p><strong>Additional Notes:</strong></p>
            <p style="background: #fff; padding: 10px; border-left: 3px solid #5bc0de;">${value.notes}</p>
          </div>
        ` : ''}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;"/>
        
        <div style="background: #d9edf7; padding: 10px; border-radius: 5px;">
          <p style="margin: 0; font-size: 14px;">
            <strong>⚠️ Action Required:</strong> Please review and respond to this request. 
            When approving, provide a delivery deadline.
          </p>
        </div>
        
        ${value.enableFollowUp ? `
          <p style="font-size: 12px; color: #777; margin-top: 10px;">
            📅 A follow-up reminder will be sent after ${value.followUpDays} days if no response is received.
          </p>
        ` : ''}
        
        ${value.enableEscalation ? `
          <p style="font-size: 12px; color: #777; margin-top: 5px;">
            🔔 This request will be escalated to ${value.escalationEmail} after ${value.escalationDays} days without response.
          </p>
        ` : ''}
      </div>
    `;

  
    const result = await do_ma_query(
      `INSERT INTO emails (
        sender_id, sender_email, recipient_email, subject, body, 
        status, template_type,
        follow_up_scheduled, follow_up_days,
        escalation_enabled, escalation_email, escalation_days
      ) VALUES (?, ?, ?, ?, ?, 'sent', 'stock_request', ?, ?, ?, ?, ?)`,
      [
        userId, userEmail, value.to, subject, body,
        value.enableFollowUp, value.followUpDays,
        value.enableEscalation, value.escalationEmail || null, value.escalationDays
      ]
    );

    const emailId = result.insertId;

 
    await sendEmail({
      to: value.to,
      from: userEmail,
      subject,
      html: body,
    });

  
    await do_ma_query(
      "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
      [emailId, "sent", JSON.stringify({ 
        timestamp: new Date(),
        type: 'stock_request',
        productName: value.productName,
        quantity: value.quantity
      })]
    );

 
    await createNotificationByEmailService({
      userEmail: value.to,
      emailId,
      type: "stock_request",
      title: "New Stock Request",
      message: `${userName} has requested ${value.quantity} units of ${value.productName}`,
    });

    res.status(201).json({
      success: true,
      message: "Stock request sent successfully",
      data: { 
        emailId,
        followUpScheduled: value.enableFollowUp,
        escalationEnabled: value.enableEscalation
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error sending stock request:", error);
    res.status(500).json({
      success: false,
      message: "Error sending stock request",
      error: error.message,
    });
  }
};





export const respondToStockRequest = async (req, res) => {
  try {
    console.log("REQ.USER:", req.user);
    console.log("REQ.PARAMS:", req.params);
    console.log("REQ.BODY:", req.body);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    const { id } = req.params;
    const { action, deadlineDays, notes } = req.body; 
    const userId = req.user.id;
    const userEmail = req.user.email;
    const userName = req.user.username || userEmail;

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action. Use 'approve' or 'reject'",
      });
    }


    if (action === 'approve' && (!deadlineDays || deadlineDays < 1)) {
      return res.status(400).json({
        success: false,
        message: "Deadline in days is required when approving stock request",
      });
    }


    const originalEmails = await do_ma_query(
      "SELECT * FROM emails WHERE id = ? AND recipient_email = ?",
      [id, userEmail]
    );
    console.log("ORIGINAL EMAILS:", originalEmails);

    if (!originalEmails || originalEmails.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Stock request not found or access denied",
      });
    }

    const originalEmail = originalEmails[0];

   
    let deadlineDate = null;
    let deadlineText = '';
    if (action === 'approve') {
     
      deadlineDate = DateTime.local()
        .plus({ days: parseInt(deadlineDays) })
        .toFormat('yyyy-MM-dd HH:mm:ss'); 
      
      deadlineText = `
        <div style="background: #dff0d8; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #5cb85c;">
          <p style="margin: 0;"><strong>📦 Delivery Deadline:</strong> 
            <span style="color: #5cb85c; font-size: 16px; font-weight: bold;">
              ${deadlineDays} days (by ${DateTime.local().plus({ days: parseInt(deadlineDays) }).toLocaleString(DateTime.DATE_MED)})
            </span>
          </p>
        </div>
      `;
    }


    const subject = `Re: ${originalEmail.subject} - ${action.toUpperCase()}`;
    const body = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: ${action === 'approve' ? '#5cb85c' : '#d9534f'};">
          Stock Request ${action === 'approve' ? 'Approved ✓' : 'Rejected ✗'}
        </h2>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p style="margin: 5px 0;"><strong>Responder:</strong> ${userName} (${userEmail})</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> 
            <span style="color: ${action === 'approve' ? 'green' : 'red'}; font-weight: bold;">
              ${action.toUpperCase()}
            </span>
          </p>
          <p style="margin: 5px 0;"><strong>Response Date:</strong> ${DateTime.local().toLocaleString(DateTime.DATETIME_MED)}</p>
        </div>
        
        ${action === 'approve' ? deadlineText : ''}
        
        ${notes ? `
          <div style="margin: 15px 0;">
            <p><strong>${action === 'approve' ? 'Approval Notes:' : 'Rejection Reason:'}</strong></p>
            <p style="background: #fff; padding: 10px; border-left: 3px solid ${action === 'approve' ? '#5cb85c' : '#d9534f'};">
              ${notes}
            </p>
          </div>
        ` : ''}
        
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #ddd;"/>
        
        <h3 style="color: #666;">Original Request:</h3>
        <div style="background: #f9f9f9; padding: 10px; border-radius: 5px;">
          ${originalEmail.body}
        </div>
      </div>
    `;

   
    const result = await do_ma_query(
      `INSERT INTO emails (
        sender_id, sender_email, recipient_email, subject, body, 
        status, template_type, deadline_date
      ) VALUES (?, ?, ?, ?, ?, 'sent', 'stock_response', ?)`,
      [userId, userEmail, originalEmail.sender_email, subject, body, deadlineDate]
    );

    console.log("INSERT RESULT:", result);
    const responseEmailId = result.insertId;

   
    await do_ma_query(
      "UPDATE emails SET is_read = TRUE WHERE id = ?",
      [id]
    );


    try {
      await sendEmail({
        to: originalEmail.sender_email,
        from: userEmail,
        subject,
        html: body,
      });
      console.log("Email sent successfully");
    } catch (emailErr) {
      console.error("Error sending email:", emailErr);
    }

  
    try {
      await do_ma_query(
        "INSERT INTO email_tracking (email_id, event_type, event_data) VALUES (?, ?, ?)",
        [responseEmailId, "sent", JSON.stringify({ 
          timestamp: new Date(),
          type: 'stock_response',
          action,
          originalEmailId: id,
          deadlineDays: action === 'approve' ? deadlineDays : null,
          deadlineDate: deadlineDate
        })]
      );
      console.log("Email tracking inserted");
    } catch (trackingErr) {
      console.error("Error inserting tracking:", trackingErr);
    }

  
    try {
      await createNotificationByEmailService({
        userEmail: originalEmail.sender_email,
        emailId: responseEmailId,
        type: "stock_response",
        title: `Stock Request ${action === 'approve' ? 'Approved' : 'Rejected'}`,
        message: action === 'approve' 
          ? `${userName} has approved your stock request with ${deadlineDays} days delivery deadline`
          : `${userName} has rejected your stock request`,
      });
      console.log("Notification created");
    } catch (notifErr) {
      console.error("Error creating notification:", notifErr);
    }

    res.status(200).json({
      success: true,
      message: `Stock request ${action}d successfully`,
      data: { 
        responseEmailId,
        deadlineDate: action === 'approve' ? deadlineDate : null,
        deadlineDays: action === 'approve' ? deadlineDays : null
      },
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error responding to stock request:", error);
    res.status(500).json({
      success: false,
      message: "Error responding to stock request",
      error: error.message,
    });
  }
};



//nNotification Controller




export const getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 20 } = req.query;

    const notifications = await getNotificationsService(userId, parseInt(limit));

    res.status(200).json({
      success: true,
      data: notifications,
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching notifications",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};


export const createNotification = async (req, res) => {
  try {
    const { userId, emailId, type, title, message } = req.body;

    await createNotificationService({
      userId,
      emailId,
      type,
      title,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};


export const createNotificationByEmail = async (req, res) => {
  try {
    const { userEmail, emailId, type, title, message } = req.body;

    await createNotificationByEmailService({
      userEmail,
      emailId,
      type,
      title,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Notification created successfully",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error creating notification by email:", error);
    res.status(500).json({
      success: false,
      message: "Error creating notification",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};


export const markNotificationAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await markAsReadService(id, userId);

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notification",
    });
  }
};



export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await markAllAsReadService(userId);

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      message: "Error updating notifications",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};


export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    if (result[0].affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or access denied",
        timestamp: DateTime.local().toISO(),
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
      message: "Notification deleted successfully",
      timestamp: DateTime.local().toISO(),
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting notification",
      error: error.message,
      timestamp: DateTime.local().toISO(),
    });
  }
};
