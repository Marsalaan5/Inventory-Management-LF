"use strict";

import dotenv from "dotenv";
import * as fs from "node:fs";
import path from "path";
import { fileURLToPath } from "url";
import Joi from "joi";
import { DateTime, Settings } from "luxon";
import { v7 as uuidv7 } from "uuid";
import * as XLSX from "xlsx/xlsx.mjs";
XLSX.set_fs(fs);
import do_ma_query from "../database/mariadb.js";
import { product_mvmt_log } from "../services/log_service.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });
Settings.defaultZone = process.env.SCRIPT_TIMEZONE;

function pad(str, max) {
	str = str.toString();
	return str.length < max ? pad("0" + str, max) : str;
}

// only after receiver confirms, make product_mvmt_log and set the status to 'delivered'

const is_valid_product = async (product) => {
	let verifcn_promises = [
		// Add product_status too
		do_ma_query(
			"SELECT * FROM product WHERE prod_uuid = ? AND partial_code = ? AND article_profile_id = ? AND warehouse_id = ? AND status = ?;",
			[product.prod_uuid, product.partial_code, product.article_profile_id, product.warehouse_id, product.status],
		),
	];

	let prod_exist = false,
		db_product;
	await Promise.all(verifcn_promises).then((values) => {
		if (values[0].length > 0) {
			prod_exist = true;
			db_product = values[0][0];
		}
	});

	if (!prod_exist || product.count > db_product.count) {
		return false;
	}

	return true;
};

export const get_existing_stock_flow = async (req, res) => {
	try {
		const { user } = req;

		console.log("[get_existing_stock_flow] called by user:", user?.uuid);

		const rows = await do_ma_query(
			`SELECT sf.stock_id, sf.to_warehouse, sf.transport, sf.description, sf.product_arr, w.title AS to_warehouse_name, w.wh_uuid AS to_warehouse_uuid
    		FROM stock_flow sf
				LEFT JOIN warehouse w ON w.wh_uuid = sf.to_warehouse
    		WHERE sf.created_by = ? AND sf.is_submitted = FALSE
			LIMIT 1;`,
			[user.uuid],
		);

		console.log("[get_existing_stock_flow] draft rows found:", rows.length);

		if (!rows.length) {
			return res.status(200).json({
				success: true,
				is_found: false,
				data: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "No active draft found",
			});
		}

		const lot = rows[0];

		let rawArr = [];
		try {
			rawArr = JSON.parse(lot.product_arr || "[]");
		} catch (parseErr) {
			console.error("[get_existing_stock_flow] Failed to parse product_arr:", parseErr.message);
			rawArr = [];
		}

		console.log("[get_existing_stock_flow] products in draft:", rawArr.length);

		const enriched = await Promise.all(
			rawArr.map(async (item) => {
				try {
					if (!item?.prod_uuid) {
						console.warn("[get_existing_stock_flow] item missing prod_uuid:", item);
						return null;
					}

					const prodRows = await do_ma_query(
						`SELECT 
						p.prod_uuid, p.partial_code, p.status, p.count AS available, ap.title AS article_profile_name, wh.title AS warehouse_name, wh.wh_uuid AS warehouse_id 
						FROM product p 
						LEFT JOIN article_profile ap ON ap.art_prof_uuid = p.article_profile_id 
						LEFT JOIN warehouse wh ON wh.wh_uuid = p.warehouse_id 
						WHERE p.prod_uuid = ? 
						LIMIT 1;`,
						[item.prod_uuid],
					);

					if (!prodRows || prodRows.length === 0) {
						console.warn("[get_existing_stock_flow] product not found in DB:", item.prod_uuid);
						return null;
					}

					const prod = prodRows[0];

					return {
						prod_uuid: prod.prod_uuid,
						partial_code: prod.partial_code,
						article_profile_name: prod.article_profile_name || "—",
						warehouse_name: prod.warehouse_name || "—",
						warehouse_id: prod.warehouse_id,
						status: prod.status,
						available: prod.available,
						count: item.count,
					};
				} catch (itemErr) {
					console.error(
						"[get_existing_stock_flow] error enriching product:",
						item?.prod_uuid,
						itemErr.message,
					);
					return null;
				}
			}),
		);

		const prod_arr = enriched.filter(Boolean);

		console.log("[get_existing_stock_flow] enriched products:", prod_arr.length);

		return res.status(200).json({
			success: true,
			is_found: true,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			data: {
				stock_id: lot.stock_id,
				to_warehouse: {
					wh_uuid: lot.to_warehouse_uuid,
					name: lot.to_warehouse_name,
				},
				transport: lot.transport,
				description: lot.description,
				prod_arr,
			},
			message: "Draft found",
		});
	} catch (err) {
		console.error("[get_existing_stock_flow] UNHANDLED ERROR:", err);
		return res.status(500).json({
			success: false,
			is_found: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const stock_transfer_submit = async (req, res) => {
	try {
		// While submitting stock_transfer, no validation is required
		const { user } = req;

		const verifcn_promises = [
			do_ma_query("SELECT * FROM stock_flow WHERE created_by = ? AND is_submitted IS FALSE;", [user.uuid]),
		];

		let stock_exist = true,
			stock_data;

		await Promise.all(verifcn_promises).then((values) => {
			values[0].length === 1 ? (stock_data = values[0][0]) : (stock_exist = false);
		});

		if (!stock_exist) {
			return res.status(404).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource not found",
			});
		}

		// considering that the product_arr is never empty
		stock_data.product_arr = JSON.parse(stock_data.product_arr);

		let accurate_prods = [],
			mistake_prods = [];
		for (let i = 0; i < stock_data.product_arr.length; i++) {
			const curr_prod = {
				prod_uuid: stock_data.product_arr[i].prod_uuid,
				partial_code: stock_data.product_arr[i].partial_code,
				article_profile_id: stock_data.product_arr[i].article_profile_id,
				article_profile_name: stock_data.product_arr[i].article_profile_name,
				status: stock_data.product_arr[i].status,
				count: stock_data.product_arr[i].count,
			};

			let result = await is_valid_product({
				...curr_prod,
				warehouse_id: user.warehouse_id,
			});

			result ? accurate_prods.push(curr_prod) : mistake_prods.push(curr_prod);
		}

		if (mistake_prods.length > 0) {
			res.status(400).json({
				success: false,
				data: mistake_prods,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Inconsistent data, please check the error report.",
			});
		} else {
			// Update stock_flow as submitted
			const sf_update_res = await do_ma_query(
				"UPDATE stock_flow SET product_arr = ?, is_submitted = TRUE, status = 'in-transit', updated_at = NOW() WHERE stock_id = ?;",
				[JSON.stringify(accurate_prods), stock_data.stock_id],
			);

			if (sf_update_res.changedRows === 1) {
				return res.status(200).json({
					success: true,
					data: {},
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: "Stock submitted successfully",
				});
			} else {
				return res.status(500).json({
					success: false,
					data: {},
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: "Stock submission failed.",
				});
			}
		}
	} catch (err) {
		console.error("Error while stock transfer submit:", err);
		res.status(500).json({
			success: false,
			data: {},
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const create_stock_request = async (req, res) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				error_report: [],
				message: "Request body cannot be empty",
			});
		}

		const prereqs = [
			do_ma_query("SHOW COLUMNS FROM stock_request LIKE 'priority';"),
			do_ma_query("SELECT stock_req_id FROM stock_request ORDER BY id DESC LIMIT 1;"),
		];

		let priority_enum_str, new_req_id, last_req_id;
		await Promise.all(prereqs).then((values) => {
			priority_enum_str = values[0][0].Type;
			last_req_id = values[1].length === 0 ? null : values[1][0].stock_req_id;
		});

		const priority_arr = priority_enum_str
			.substring(6, priority_enum_str.length - 2)
			.split(",")
			.map((item) => item.replace(/'/g, ""));

		const today_date = DateTime.local();
		const short_date = today_date.month < 10 ? today_date.toFormat("Myy") : today_date.toFormat("MMMMMyy");

		if (last_req_id) {
			const last_req_arr = last_req_id.split("-");

			if (last_req_arr[1] === short_date) {
				new_req_id = `SRQ-${short_date}-${pad(Number(last_req_arr[2]) + 1, 3)}`;
			} else {
				new_req_id = "SRQ-" + short_date + "-001";
			}
		} else {
			new_req_id = "SRQ-" + short_date + "-001";
		}

		const art_id_label = "Article Profile ID",
			art_name_label = "Article Profile Name",
			quantity_label = "Quantity";

		const single_article_schema = Joi.object({
			article_profile_id: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label(art_id_label),
			article_profile_name: Joi.string().min(1).max(127).required().label(art_name_label),
			quantity: Joi.number().integer().min(1).max(10000).required().label(quantity_label),
		});

		const priority_label = "Priority",
			dispatcher_label = "Selected User",
			req_art_label = "Requested Articles",
			follow_up_label = "Follow Up",
			escalation_label = "Escalation";

		const stock_request_schema = Joi.object({
			priority: Joi.string()
				.trim()
				.lowercase()
				.valid(...priority_arr)
				.required()
				.label(priority_label),
			dispatcher: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label(dispatcher_label),
			cc_recipients: Joi.array()
				.items(Joi.string().trim().lowercase().email())
				.min(1)
				.max(15)
				.unique()
				.required()
				.label("CC Email IDs"),
			req_articles: Joi.array().items(single_article_schema).min(1).required().label(req_art_label),
			follow_up_selected: Joi.boolean().required().label(follow_up_label),
			follow_up_days: Joi.number().integer().min(1).max(7).optional().label("Follow Up Days"),
			escalation_selected: Joi.boolean().required().label(escalation_label),
			escalation_days: Joi.number().integer().min(1).max(7).optional().label("Escalation Days"),
			description: Joi.string().max(255).optional().label("Description"),
		}).rename("selected_user", "dispatcher");

		const { error, value } = stock_request_schema.validate(req.body);

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				error_report: [],
				message: error.details[0].message,
			});
		}

		// A big query to verify all art profs

		`WITH id_list(uuid) AS (VALUES 
			(CAST('019d627b-1d07-73e8-9ca7-32245675f953' AS UUID)), 
			('019bc108-75df-74f4-9bb8-6233d478845d'), 
			('019d627b-1d0d-7183-8aba-08a80ec28363'), 
			('019bc111-cc11-7279-81d8-6ac801b7d539'), 
			('019bc120-fe94-7528-9e57-2c3a6966c058'), 
			('019d950e-c9ad-7439-bfbd-8f029f396d16') 
		)
		SELECT id_list.uuid 
		FROM id_list
			LEFT JOIN article_profile ap 
			ON id_list.uuid = ap.art_prof_uuid
		WHERE ap.art_prof_uuid IS NULL;`;

		const art_placeholders = value.req_articles.map(() => "(CAST(? AS UUID))").join(", ");
		const art_prof_ids_arr = value.req_articles.map((item) => item.article_profile_id);

		const verify_art_profs_query = `
		WITH id_list(uuid) AS (VALUES ${art_placeholders}) 
		SELECT id_list.uuid AS id
		FROM id_list
			LEFT JOIN article_profile ap 
			ON id_list.uuid = ap.art_prof_uuid
		WHERE ap.art_prof_uuid IS NULL;`;

		const verifcn_promises = [
			do_ma_query("SELECT COUNT(*) AS count FROM users WHERE usr_uuid = ?;", [value.dispatcher]),
			do_ma_query(verify_art_profs_query, art_prof_ids_arr),
		];

		let dsp_exists = false,
			invalid_ap_list;

		await Promise.all(verifcn_promises).then((values) => {
			if (values[0][0].count === 1) {
				dsp_exists = true;
			}

			invalid_ap_list = values[1];
		});

		if (!dsp_exists) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				error_report: [],
				message: `${dispatcher_label} is invalid`,
			});
		}

		if (invalid_ap_list.length > 0) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				error_report: invalid_ap_list,
				message: `Invalid ${req_art_label} found`,
			});
		}

		const { user } = req;

		let stock_request_entry = await do_ma_query(
			"INSERT INTO stock_request SET stock_req_id = ?, stock_id = NULL, priority = ?, requester = ?, dispatcher = ?, cc_recipients = ?, requested_articles = ?, follow_up_enabled = ?, follow_up_days = ?, follow_up_sent_at = NULL, escalation_enabled = ?, escalation_days = ?, escalated_at = NULL, approved_at = NULL, scheduled_dispatch = NULL, deadline_notice_at = NULL, resolution_required_at = NULL, delivered_at = NULL, grn_timestamp = NULL, description = ?, created_at = NOW(), updated_at = NOW();",
			[
				new_req_id,
				value.priority,
				user.uuid,
				value.dispatcher,
				JSON.stringify(value.cc_recipients),
				JSON.stringify(value.req_articles),
				value.follow_up_selected,
				value.follow_up_days ?? null,
				value.escalation_selected,
				value.escalation_days ?? null,
				value.description ?? null,
			],
		);

		if (stock_request_entry.affectedRows === 1) {
			res.status(200).json({
				success: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				error_report: [],
				message: "Stock request created successfully.",
			});
		} else {
			res.status(500).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				error_report: [],
				message: "Stock request creation failed.",
			});
		}
	} catch (err) {
		console.error("Error while creating stock request:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			error_report: [],
			message: "Internal server error",
		});
	}
};

export const approve_request = async (req, res) => {
	try {
		// User input - request ID,
		// Who can approve - verify
		// A person who is dispatcher, can approve requests

		// stock_req_id, requester, approved_at = null - verify
		// stock_request - approved_at, scheduled_dispatch

		// request/approve/:id

		const { user } = req;
		const request_id = req.params.id;
		const { total_days } = req.body;

		const approve_req_schema = Joi.object({
			req_id: Joi.string().min(11).max(15).required().label("Request ID"),
			tot_days: Joi.number().integer().min(1).max(50).required().label("Total Days"),
		});

		const { error, value } = approve_req_schema.validate({
			req_id: request_id,
			tot_days: total_days,
		});

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		await do_ma_query(
			"UPDATE stock_request SET approved_at = NOW(), scheduled_dispatch = DATE_ADD(NOW(), INTERVAL ? DAY), updated_at = NOW() WHERE stock_req_id = ? AND dispatcher = ? AND approved_at IS NULL;",
			[value.tot_days, value.req_id, user.uuid],
		);

		// Update both tables - stock_request and stock_flow
	} catch (err) {
		console.error("Error while delivery confirmation:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const confirm_delivery = async (req, res) => {
	try {
		// Need action here
		// Who can confirm - verify

		const { user } = req;
		user.uuid;

		// Update both tables - stock_request and stock_flow
	} catch (err) {
		console.error("Error while delivery confirmation:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const get_stock_requests = async (req, res) => {
	try {
		const get_stk_req_schema = Joi.object({
			page_no: Joi.number().integer().min(1).default(1).optional().label("Page Number"),
			limit: Joi.number().integer().min(10).max(100).default(10).optional().label("Limit"),
		});

		const { error, value } = get_stk_req_schema.validate(req.query || {});

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				data: [],
				total_records: null,
				message: error.details[0].message,
			});
		}

		const offset = (value.page_no - 1) * value.limit;
		const { user } = req;

		let total_records, stock_request_data;

		await Promise.all([
			do_ma_query("SELECT COUNT(*) AS total_records FROM stock_request WHERE requester = ? OR dispatcher = ?;", [
				user.uuid,
				user.uuid,
			]),
			do_ma_query(
				`SELECT sr.*, u1.name requester_name, w1.title requester_wh, u2.name dispatcher_name, w2.title dispatcher_wh 
				FROM stock_request sr 
					INNER JOIN users u1 ON u1.usr_uuid = sr.requester 
					INNER JOIN warehouse w1 ON w1.wh_uuid = u1.warehouse_id 
					INNER JOIN users u2 ON u2.usr_uuid = sr.dispatcher 
					INNER JOIN warehouse w2 ON w2.wh_uuid = u2.warehouse_id 
				WHERE sr.requester = ? OR sr.dispatcher = ? 
				ORDER BY sr.id DESC 
				LIMIT ? OFFSET ?;`,
				[user.uuid, user.uuid, value.limit, offset],
			),
		]).then((values) => {
			total_records = values[0][0].total_records;
			stock_request_data = values[1];
		});

		let data_xfr_obj = [];

		if (stock_request_data.length > 0) {
			for (let i = 0; i < stock_request_data.length; i++) {
				let total_products = 0;
				const curr_req = stock_request_data[i];

				curr_req.cc_recipients = JSON.parse(curr_req.cc_recipients);
				curr_req.requested_articles = JSON.parse(curr_req.requested_articles);

				curr_req.is_requester = curr_req.requester === user.uuid ? true : false;

				for (let j = 0; j < curr_req.requested_articles.length; j++) {
					total_products += curr_req.requested_articles[j].quantity;
				}

				let req_status, action_required;

				if (curr_req.delivered_at !== null && curr_req.grn_timestamp !== null) {
					// For Supplier and Recipient
					req_status = "Delivered";
					action_required = "No Action - Request Closed"; // ✅

					// For Supplier; Review Discrepancy - Only if the Recipient reported receiving fewer items than you sent.
				} else if (curr_req.delivered_at !== null && curr_req.grn_timestamp === null) {
					// For Supplier and Recipient
					req_status = "Delivered";

					// For Supplier - "Awaiting Receipt Finalization"; // ⏳
					// For Recipient - "Finalise Receipt"; // 🖋️
					action_required = curr_req.is_requester ? "Finalise Receipt" : "Awaiting Receipt Finalization";
				} else if (curr_req.resolution_required_at !== null) {
					// For Supplier and Recipient
					req_status = "Resolution required";
					action_required = "Reschedule / Cancel"; // 🔄
				} else if (
					curr_req.approved_at !== null &&
					curr_req.stock_id === null &&
					curr_req.deadline_notice_at !== null
				) {
					// For Supplier and Recipient
					req_status = "Shipping Deadline Approaching";

					// For Supplier - "Pick & Dispatch Now"; // 🚨
					// For recipient - "Prep Receiving Slot"; // 📅
					action_required = curr_req.is_requester ? "Prep Receiving Slot" : "Pick & Dispatch Now";
				} else if (curr_req.approved_at !== null && curr_req.stock_id === null) {
					// For Supplier - "Scheduled";
					// For recipient - "Awaiting Shipment";
					req_status = curr_req.is_requester ? "Awaiting Shipment" : "Scheduled";

					// For Supplier - "Monitor Stock"; // 📋
					// For Recipient - "Track Progress"; // 📦
					action_required = curr_req.is_requester ? "Track Progress" : "Monitor Stock";
				} else if (
					curr_req.approved_at === null &&
					curr_req.escalation_enabled === 1 &&
					curr_req.escalated_at !== null
				) {
					// For Supplier and Recipient
					req_status = "Escalated Due to No Approval";

					// For Supplier - "Immediate Action Required"; // 🔴
					// For Recipient - "Contact Admin"; // 📞
					action_required = curr_req.is_requester ? "Contact Admin" : "Immediate Action Required";
				} else if (
					curr_req.approved_at === null &&
					curr_req.follow_up_enabled === 1 &&
					curr_req.follow_up_sent_at !== null
				) {
					// For Supplier and Recipient
					req_status = "Followed Up for Approval";

					// For Supplier - "Prioritise Review"; // ⚡
					// For Recipient - "Monitor for Response"; // ⏳
					action_required = curr_req.is_requester ? "Monitor for Response" : "Prioritise Review";
				} else if (curr_req.approved_at === null) {
					// For Supplier and Recipient
					req_status = "Pending for Approval";

					// For Supplier - "Review & Approve"; // 🔍
					// For Recipient - "Awaiting Confirmation"; // ⏳
					action_required = curr_req.is_requester ? "Awaiting Confirmation" : "Review & Approve";
				}

				// in - 📥, 📤

				data_xfr_obj.push({
					req_id: curr_req.stock_req_id,
					type: curr_req.is_requester ? "in" : "out",
					priority: curr_req.priority,
					requester_name: curr_req.requester_name,
					destination: curr_req.requester_wh,
					dispatcher_name: curr_req.dispatcher_name,
					source: curr_req.dispatcher_wh,
					status: req_status,
					action: action_required,
					total_articles: curr_req.requested_articles.length,
					total_quantity: total_products,
					description: curr_req.description,
					created_at: curr_req.created_at,
				});
			}

			res.status(200).json({
				success: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				data: data_xfr_obj,
				total_records,
				message: "Stock requests loaded",
			});
		} else {
			res.status(200).json({
				success: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				data: data_xfr_obj,
				total_records: null,
				message: "No records found",
			});
		}
	} catch (err) {
		console.error("Error while fetching stock requests:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			data: [],
			total_records: null,
			message: "Internal server error",
		});
	}
};

export const stock_transfer_sync = async (req, res) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Request body cannot be empty",
			});
		}

		// read product status enum possible values
		// read transport enum possible values

		const prereqs = [
			do_ma_query("SHOW COLUMNS FROM product LIKE 'status';"),
			do_ma_query("SHOW COLUMNS FROM stock_flow LIKE 'transport';"),
		];

		let prod_enum_str, tpt_enum_str;
		await Promise.all(prereqs).then((values) => {
			prod_enum_str = values[0][0].Type;
			tpt_enum_str = values[1][0].Type;
		});

		const prod_status_arr = prod_enum_str
			.substring(6, prod_enum_str.length - 2)
			.split(",")
			.map((item) => item.replace(/'/g, ""));

		const tpt_arr = tpt_enum_str
			.substring(6, tpt_enum_str.length - 2)
			.split(",")
			.map((item) => item.replace(/'/g, ""));

		const prod_id_label = "Product ID",
			partial_code_label = "Unique Code",
			art_id_label = "Article Profile ID",
			art_name_label = "Article Profile Name",
			prod_status_label = "Status",
			count_label = "Count";

		// partial_code, article_profile_name, status => only for front-end
		const prod_obj_schema = Joi.object({
			prod_uuid: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label(prod_id_label),
			partial_code: Joi.string().min(3).max(127).required().label(partial_code_label),
			article_profile_id: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label(art_id_label),
			article_profile_name: Joi.string().min(1).max(127).required().label(art_name_label),
			status: Joi.string()
				.valid(...prod_status_arr)
				.required()
				.label(prod_status_label),
			count: Joi.number().integer().min(1).max(10000).required().label(count_label),
		});

		const wh_id_label = "To Warehouse ID",
			prod_arr_label = "Products List",
			tpt_label = "Transport",
			desc_label = "Description";

		// stock_id and from_wh from the logged in user's data
		const stock_trf_schema = Joi.object({
			to_wh: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label(wh_id_label),
			prod_arr: Joi.array().items(prod_obj_schema).min(1).required().label(prod_arr_label),
			transportation: Joi.string()
				.valid(...tpt_arr)
				.required()
				.label(tpt_label),
			description: Joi.string().max(255).optional().label(desc_label),
		});

		const { user } = req;

		if (typeof req.body.prod_arr === "string") {
			try {
				req.body.prod_arr = JSON.parse(req.body.prod_arr);
			} catch (_) {
				return res.status(400).json({
					success: false,
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: "Invalid prod_arr format — must be a JSON array.",
				});
			}
		}

		if (!req.body.description) {
			req.body.description = null;
		}

		const { error, value } = stock_trf_schema.validate(req.body);

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		console.log("data:", {
			usr_uuid: user.uuid,
			upload_dir: user.upload_dir,
			file_name: user.file_name,
			file_original_name: user.file_original_name,
			body: req.body,
		});

		// throw new Error("Manual Break");

		const verifcn_promises = [
			do_ma_query(
				"SELECT COUNT(*) AS count, abbr, goods_mvmt_count, goods_mvmt_date FROM warehouse WHERE wh_uuid = ?;",
				[user.warehouse_id],
			),
			do_ma_query("SELECT stock_id FROM stock_flow WHERE created_by = ? AND is_submitted IS FALSE;", [user.uuid]),
			do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE wh_uuid = ?;", [value.to_wh]),
		];

		let wh_exist = false,
			to_wh_exist = false,
			wh_abbr,
			goods_mvmt_count,
			goods_mvmt_date,
			stock_id,
			stock_exist = false;

		await Promise.all(verifcn_promises).then((values) => {
			if (values[0][0].count === 1) {
				wh_exist = true;
				wh_abbr = values[0][0].abbr;
				goods_mvmt_count = values[0][0].goods_mvmt_count;
				goods_mvmt_date = values[0][0].goods_mvmt_date;
			}

			if (values[1].length > 0) {
				stock_id = values[1][0].stock_id;
				stock_exist = true;
			}

			if (values[2][0].count === 1) {
				to_wh_exist = true;
			}
		});

		if (!wh_exist) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Warehouse not assigned",
			});
		}

		if (!to_wh_exist) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource not found",
			});
		}

		const today_date = DateTime.local();

		if (!stock_exist) {
			// when stock_id is undefined, only then generate a new stock_id
			const short_date = today_date.month < 10 ? today_date.toFormat("ddMyy") : today_date.toFormat("ddMMMMMyy");

			if (goods_mvmt_date === today_date.toFormat("yyyy-MM-dd")) {
				// only increase the goods_mvmt_count
				goods_mvmt_count++;
			} else {
				goods_mvmt_count = 1;
				goods_mvmt_date = today_date.toFormat("yyyy-MM-dd");
			}

			stock_id = "STT-" + wh_abbr + "-" + short_date + "-" + goods_mvmt_count;
		}

		let data_saved = false;

		if (!stock_exist) {
			// invoice is optional, also check here for the values of user.upload_dir, user.file_name before using them

			console.log(":: :: CHECK :: :: invoice is optional ::", user.upload_dir, user.file_name);

			const upsert_promises = [
				do_ma_query(
					"INSERT INTO stock_flow SET stock_id = ?, from_warehouse = ?, to_warehouse = ?, product_arr = ?, transport = ?, invoice = ?, created_by = ?, is_submitted = FALSE, status = 'approved', description = ?, created_at = NOW(), updated_at = NOW();",
					[
						stock_id,
						user.warehouse_id,
						value.to_wh,
						JSON.stringify(value.prod_arr),
						value.transportation,
						user.upload_dir && user.file_name ? path.join(user.upload_dir, user.file_name) : null,
						user.uuid,
						value.description ?? null,
					],
				),
				do_ma_query("UPDATE warehouse SET goods_mvmt_count = ?, goods_mvmt_date = ? WHERE wh_uuid = ?;", [
					goods_mvmt_count,
					goods_mvmt_date,
					user.warehouse_id,
				]),
			];

			let stock_flow_entry, wh_update_res;
			await Promise.all(upsert_promises).then((values) => {
				stock_flow_entry = values[0].affectedRows;
				wh_update_res = values[1].changedRows;
			});

			if (stock_flow_entry === 1 && wh_update_res === 1) {
				data_saved = true;
			}
		} else {
			const hasNewInvoice = !!(user.upload_dir && user.file_name);

			let updateSql, updateParams;

			if (hasNewInvoice) {
				updateSql =
					"UPDATE stock_flow SET to_warehouse = ?, product_arr = ?, transport = ?, description = ?, invoice = ?, updated_at = NOW() WHERE stock_id = ?;";
				updateParams = [
					value.to_wh,
					JSON.stringify(value.prod_arr),
					value.transportation,
					value.description ?? null,
					path.join(user.upload_dir, user.file_name),
					stock_id,
				];
			} else {
				updateSql =
					"UPDATE stock_flow SET to_warehouse = ?, product_arr = ?, transport = ?, description = ?, updated_at = NOW() WHERE stock_id = ?;";
				updateParams = [
					value.to_wh,
					JSON.stringify(value.prod_arr),
					value.transportation,
					value.description ?? null,
					stock_id,
				];
			}

			let stock_update_res;
			await Promise.all([do_ma_query(updateSql, updateParams)]).then((values) => {
				stock_update_res = values[0];
			});

			if (stock_update_res.changedRows === 1) {
				data_saved = true;
			}
		}

		if (data_saved) {
			res.status(200).json({
				success: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Products synced successfully.",
			});
		} else {
			res.status(500).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Products syncing failed.",
			});
		}
	} catch (err) {
		console.error("Error while stock transfer sync:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const remove_stock_product = async (req, res) => {
	try {
		const { user } = req;
		const { partial_code } = req.params;

		if (!partial_code) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "partial_code is required",
			});
		}

		const rows = await do_ma_query(
			"SELECT stock_id, product_arr FROM stock_flow WHERE created_by = ? AND is_submitted IS FALSE LIMIT 1;",
			[user.uuid],
		);

		if (!rows.length) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "No active draft found",
			});
		}

		const { stock_id } = rows[0];
		const prod_arr = JSON.parse(rows[0].product_arr || "[]");

		const original_length = prod_arr.length;
		const updated_arr = prod_arr.filter((p) => p.partial_code !== partial_code);

		if (updated_arr.length === original_length) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: `Product with code "${partial_code}" not found in draft`,
			});
		}

		if (updated_arr.length === 0) {
			//delete stock id after last product gets deleted
			await do_ma_query("DELETE FROM stock_flow WHERE stock_id = ?;", [stock_id]);
			return res.status(200).json({
				success: true,
				draft_deleted: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Last product removed. Draft deleted.",
			});
		}

		await do_ma_query("UPDATE stock_flow SET product_arr = ?, updated_at = NOW() WHERE stock_id = ?;", [
			JSON.stringify(updated_arr),
			stock_id,
		]);

		return res.status(200).json({
			success: true,
			draft_deleted: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: `"${partial_code}" removed from draft.`,
		});
	} catch (err) {
		console.error("remove_lot_product error:", err);
		return res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};
