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

// only after receiver confirms, make product_mvmt_log and set the status to 'delivered'

const is_valid_product = async (product) => {
	let verifcn_promises = [
		// Add product_status too
		do_ma_query("SELECT * FROM product WHERE prod_uuid = ? AND warehouse_id = ? AND status = ?;", [
			product.prod_uuid,
			product.warehouse_id,
			product.status,
		]),
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
//
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
			art_prof_label = "Article Profile Name",
			prod_status_label = "Status",
			count_label = "Count";

		// partial_code, article_profile_name, status => only for front-end
		const prod_obj_schema = Joi.object({
			prod_uuid: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label(prod_id_label),
			partial_code: Joi.string().min(3).max(127).required().label(partial_code_label),
			article_profile_name: Joi.string().min(1).max(127).required().label(art_prof_label),
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

		console.log("data:", {
			usr_uuid: user.uuid,
			upload_dir: user.upload_dir,
			file_name: user.file_name,
			file_original_name: user.file_original_name,
			body: req.body,
		});

		const { error, value } = stock_trf_schema.validate(req.body);

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		

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
			const upsert_promises = [
				do_ma_query(
					"INSERT INTO stock_flow SET stock_id = ?, from_warehouse = ?, to_warehouse = ?, product_arr = ?, transport = ?, invoice = ?, created_by = ?, is_submitted = FALSE, status = 'approved', description = ?, created_at = NOW(), updated_at = NOW();",
					[
						stock_id,
						user.warehouse_id,
						value.to_wh,
						JSON.stringify(value.prod_arr),
						value.transportation,
						path.join(user.upload_dir, user.file_name),
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
			let stock_update_res;
			await Promise.all([
				do_ma_query(
					"UPDATE stock_flow SET to_warehouse = ?, product_arr = ?, transport = ?, description = ?, updated_at = NOW() WHERE stock_id = ?;",
					[
						value.to_wh,
						JSON.stringify(value.prod_arr),
						value.transportation,
						value.description ?? null,
						stock_id,
					],
				),
			]).then((values) => {
				stock_update_res = values[0].changedRows;
			});

			if (stock_update_res === 1) {
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

















