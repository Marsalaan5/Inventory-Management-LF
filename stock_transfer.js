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
			do_ma_query(
				"SELECT setting_value FROM settings WHERE category = 'stock_request' AND setting_key = 'default_cc_emails';",
			),
		];

		let priority_enum_str, new_req_id, last_req_id, cc_emails;
		await Promise.all(prereqs).then((values) => {
			priority_enum_str = values[0][0].Type;
			last_req_id = values[1].length === 0 ? null : values[1][0].stock_req_id;
			cc_emails = values[2].length === 0 ? [] : JSON.parse(values[2][0].setting_value);
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
				.max(15)
				.unique()
				.default([])
				.optional()
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

		const { user } = req;

		// requester and dispatcher cannot be the same person
		if (user.uuid === value.dispatcher) {
			return res.status(403).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				error_report: [],
				message: "Action forbidden: You cannot select yourself as the dispatcher.",
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

		let stock_request_entry = await do_ma_query(
			"INSERT INTO stock_request SET stock_req_id = ?, stock_id = NULL, priority = ?, requester = ?, dispatcher = ?, cc_recipients = ?, requested_articles = ?, follow_up_enabled = ?, follow_up_days = ?, follow_up_sent_at = NULL, escalation_enabled = ?, escalation_days = ?, escalated_at = NULL, approved_at = NULL, scheduled_dispatch = NULL, deadline_notice_at = NULL, resolution_required_at = NULL, delivered_at = NULL, grn_timestamp = NULL, description = ?, created_at = NOW(), updated_at = NOW();",
			[
				new_req_id,
				value.priority,
				user.uuid,
				value.dispatcher,
				JSON.stringify([...new Set([...cc_emails, ...value.cc_recipients])]),
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

		let where_clause, values_arr;
		if (user.isSuperAdmin) {
			where_clause = "";
			values_arr = [];
		} else {
			where_clause = "WHERE sr.requester = ? OR sr.dispatcher = ? ";
			values_arr = [user.uuid, user.uuid];
		}

		let total_records, stock_request_data;

		await Promise.all([
			do_ma_query(`SELECT COUNT(*) AS total_records FROM stock_request sr ${where_clause};`, values_arr),
			do_ma_query(
				`SELECT sr.*, u1.name requester_name, w1.title requester_wh, u2.name dispatcher_name, w2.title dispatcher_wh, sf.submitted_at 
				FROM stock_request sr 
					INNER JOIN users u1 ON u1.usr_uuid = sr.requester 
					INNER JOIN warehouse w1 ON w1.wh_uuid = u1.warehouse_id 
					INNER JOIN users u2 ON u2.usr_uuid = sr.dispatcher 
					INNER JOIN warehouse w2 ON w2.wh_uuid = u2.warehouse_id 
					LEFT JOIN stock_flow sf ON sf.stock_id = sr.stock_id 
				${where_clause}
				ORDER BY sr.id DESC 
				LIMIT ? OFFSET ?;`,
				[...values_arr, value.limit, offset],
			),
		]).then((values) => {
			total_records = values[0][0].total_records;
			stock_request_data = values[1];
		});

		let data_xfr_obj = [];

		// also show if the request is approved or not
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

				// in - 📥, out - 📤

				data_xfr_obj.push({
					req_id: curr_req.stock_req_id,
					stock_id: curr_req.stock_id,
					// type: curr_req.is_requester ? "in" : "out",
					priority: curr_req.priority,
					is_recipient: curr_req.requester === user.uuid,
					recipient_name: curr_req.requester_name,
					destination: curr_req.requester_wh,
					is_supplier: curr_req.dispatcher === user.uuid,
					supplier_name: curr_req.dispatcher_name,
					source: curr_req.dispatcher_wh,
					is_super_admin: user.isSuperAdmin,
					status: req_status,
					action: action_required,
					is_approved: curr_req.approved_at !== null,
					is_stock_submitted: curr_req.submitted_at !== null,
					is_delivered: curr_req.delivered_at !== null,
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

export const get_stock_request_by_id = async (req, res) => {
	// getStockRequestById
	// GET /stock-requests/{id}

	try {
		// no authorization here, i.e., who can view the request
		const { user } = req;
		const request_id = req.params.id;

		const req_id_schema = Joi.string().trim().min(11).max(15).required().label("Request ID");
		const { error, value } = req_id_schema.validate(request_id);

		if (error) {
			return res.status(400).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		const stk_req_data = await do_ma_query(
			`SELECT sr.*, u1.name requester_name, w1.title requester_wh, u2.name dispatcher_name, w2.title dispatcher_wh, sf.submitted_at  
			FROM stock_request sr 
				INNER JOIN users u1 ON u1.usr_uuid = sr.requester 
				INNER JOIN warehouse w1 ON w1.wh_uuid = u1.warehouse_id 
				INNER JOIN users u2 ON u2.usr_uuid = sr.dispatcher 
				INNER JOIN warehouse w2 ON w2.wh_uuid = u2.warehouse_id 
				LEFT JOIN stock_flow sf ON sf.stock_id = sr.stock_id 
			WHERE sr.stock_req_id = ?;`,
			[value],
		);

		if (stk_req_data.length === 0) {
			return res.status(404).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock request ID not found",
			});
		}

		res.status(200).json({
			success: true,
			data: {
				req_id: stk_req_data[0].stock_req_id,
				stock_id: stk_req_data[0].stock_id,
				priority: stk_req_data[0].priority,
				is_recipient: stk_req_data[0].requester === user.uuid,
				recipient_name: stk_req_data[0].requester_name,
				destination: stk_req_data[0].requester_wh,
				is_supplier: stk_req_data[0].dispatcher === user.uuid,
				supplier_name: stk_req_data[0].dispatcher_name,
				source: stk_req_data[0].dispatcher_wh,
				cc_recipients: JSON.parse(stk_req_data[0].cc_recipients),
				requested_articles: JSON.parse(stk_req_data[0].requested_articles),
				follow_up_enabled: stk_req_data[0].follow_up_enabled,
				follow_up_days: stk_req_data[0].follow_up_days,
				follow_up_sent_at: stk_req_data[0].follow_up_sent_at,
				escalation_enabled: stk_req_data[0].escalation_enabled,
				escalation_days: stk_req_data[0].escalation_days,
				escalated_at: stk_req_data[0].escalated_at,
				approved_at: stk_req_data[0].approved_at,
				scheduled_dispatch: stk_req_data[0].scheduled_dispatch,
				deadline_notice_at: stk_req_data[0].deadline_notice_at,
				resolution_required_at: stk_req_data[0].resolution_required_at,
				submitted_at: stk_req_data[0].submitted_at,
				delivered_at: stk_req_data[0].delivered_at,
				grn_timestamp: stk_req_data[0].grn_timestamp,
				description: stk_req_data[0].description,
				created_at: stk_req_data[0].created_at,
				updated_at: stk_req_data[0].updated_at,
			},
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Stock request data loaded",
		});
	} catch (err) {
		console.error("Error while fetching stock request:", err);
		res.status(500).json({
			success: false,
			data: {},
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const approve_request = async (req, res) => {
	try {
		// stock/request/approve/:id

		const { user } = req;
		const request_id = req.params.id;
		const { total_days } = req.body;

		const approve_req_schema = Joi.object({
			req_id: Joi.string().trim().min(11).max(15).required().label("Request ID"),
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

		const verify_req_id = await do_ma_query(
			"SELECT dispatcher, approved_at FROM stock_request WHERE stock_req_id = ?;",
			[value.req_id],
		);

		if (verify_req_id.length === 0) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock request ID not found",
			});
		} else if (verify_req_id[0].dispatcher !== user.uuid) {
			return res.status(403).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Forbidden",
			});
		} else if (verify_req_id[0].approved_at !== null) {
			return res.status(422).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Already approved",
			});
		}

		const update_res = await do_ma_query(
			"UPDATE stock_request SET approved_at = NOW(), scheduled_dispatch = DATE_ADD(NOW(), INTERVAL ? DAY), updated_at = NOW() WHERE stock_req_id = ? AND dispatcher = ? AND approved_at IS NULL;",
			[value.tot_days, value.req_id, user.uuid],
		);

		if (update_res.changedRows === 1) {
			res.status(200).json({
				success: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock request approved successfully",
			});
		} else {
			res.status(500).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock request approval failed",
			});
		}
	} catch (err) {
		console.error("Error while approving request:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const confirm_delivery = async (req, res) => {
	try {
		// stock/deliveries/:id
		// Also check stock_flow is submitted

		const { user } = req;
		const request_id = req.params.id;

		const req_id_schema = Joi.string().trim().min(11).max(15).required().label("Request ID");
		const { error, value } = req_id_schema.validate(request_id);

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		const verify_request = await do_ma_query(
			`SELECT sr.stock_id, sr.requester, sr.delivered_at, sf.submitted_at 
			FROM stock_request AS sr 
				LEFT JOIN stock_flow sf ON sf.stock_id = sr.stock_id 
			WHERE sr.stock_req_id = ?;`,
			[value],
		);

		if (verify_request.length === 0) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock request ID not found",
			});
		} else if (verify_request[0].stock_id === null || verify_request[0].submitted_at === null) {
			return res.status(422).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Invalid stock transition",
			});
		} else if (verify_request[0].requester !== user.uuid) {
			return res.status(403).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Forbidden",
			});
		} else if (verify_request[0].delivered_at !== null) {
			return res.status(422).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Already delivered",
			});
		}

		const sr_update_res = await do_ma_query(
			"UPDATE stock_request sr INNER JOIN stock_flow sf ON sr.stock_id = sf.stock_id SET sr.delivered_at = NOW(), sr.updated_at = NOW() WHERE sr.stock_req_id = ? AND sr.stock_id IS NOT NULL AND sr.requester = ? AND sr.delivered_at IS NULL AND sf.submitted_at IS NOT NULL;",
			[value, user.uuid],
		);

		if (sr_update_res.changedRows === 1) {
			const sf_update_res = await do_ma_query(
				"UPDATE stock_flow sf INNER JOIN stock_request sr ON sf.stock_id = sr.stock_id SET sf.status = 'delivered', sf.updated_at = NOW() WHERE sr.stock_req_id = ?;",
				[value],
			);

			if (sf_update_res.changedRows === 1) {
				res.status(200).json({
					success: true,
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: "Stock delivery confirmed successfully",
				});
			} else {
				res.status(500).json({
					success: false,
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: "Stock delivery confirmation failed",
				});
			}
		}
	} catch (err) {
		console.error("Error while delivery confirmation:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

// [get_active_stock_req] TASK: GET both approved and drafted requests and exclude submitted stocks
export const get_active_stock_req = async (req, res) => {
	try {
		const { user } = req;
		const req_data = await do_ma_query(
			`SELECT sr.stock_req_id, IF(sr.stock_id IS NULL, 'Approved', 'Drafted') req_status 
			FROM stock_request sr 
			LEFT JOIN stock_flow sf ON sr.stock_id = sf.stock_id 
			WHERE sr.dispatcher = ? AND sr.approved_at IS NOT NULL AND sf.submitted_at IS NULL 
			ORDER BY sr.id ASC;`,
			[user.uuid],
		);

		if (req_data.length === 0) {
			return res.status(404).json({
				success: false,
				data: [],
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "No stock request found.",
			});
		}

		res.status(200).json({
			success: true,
			data: req_data,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Stock requests data loaded successfully.",
		});
	} catch (err) {
		console.error("[get_active_stock_req] UNHANDLED ERROR:", err);
		res.status(500).json({
			success: false,
			data: [],
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const get_profile_by_code = async (req, res) => {
	try {
		const partial_code_label = "Barcode";
		const partial_code_schema = Joi.string().trim().min(3).max(127).required().label(partial_code_label);

		const { error, value } = partial_code_schema.validate(req.params.code);

		if (error) {
			return res.status(400).json({
				success: false,
				data: [],
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		const { user } = req;

		// Search the product only in logged-in user's warehouse

		const profiles = await do_ma_query(
			`SELECT p.prod_uuid AS product_id, p.article_profile_id, ap.title AS article_profile_name 
			FROM product AS p 
				INNER JOIN article_profile AS ap ON p.article_profile_id = ap.art_prof_uuid 
				INNER JOIN users AS u ON p.warehouse_id = u.warehouse_id
			WHERE p.partial_code = ? AND u.usr_uuid = ?;`,
			[value, user.uuid],
		);

		if (profiles.length === 0) {
			res.status(404).json({
				success: false,
				data: [],
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: `${partial_code_label} not found`,
			});
		} else {
			res.status(200).json({
				success: true,
				data: profiles,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Profiles retrieved successfully",
			});
		}
	} catch (err) {
		console.error("Error while fetching profiles:", err);
		res.status(500).json({
			success: false,
			data: [],
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const scan_product_for_transfer = async (req, res) => {
	try {
		// users.warehouse_id should not be NULL
		const scan_prod_xfr_schema = Joi.object({
			partial_code: Joi.string().trim().min(3).max(127).required().label("Barcode"),
			product_id: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label("Product ID"),
			stock_id: Joi.string().trim().min(14).max(20).optional().label("Stock Flow ID"),
		});

		const { error, value } = scan_prod_xfr_schema.validate(req.query || {});

		if (error) {
			return res.status(400).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		const { user } = req;

		// Multiple products in the database share the same partial code.

		let already_allocated_stock, in_wh_product_data;

		await Promise.all([
			do_ma_query(
				`SELECT sf.stock_id  
				FROM stock_flow sf
				INNER JOIN stock_request sr ON sf.stock_id = sr.stock_id
				WHERE JSON_CONTAINS(
						sf.product_arr, 
						JSON_OBJECT("prod_uuid", ?)
					) 
					AND sf.from_warehouse = ?
					AND sr.grn_timestamp IS NULL;`,
				[value.product_id, user.warehouse_id],
			),
			do_ma_query(
				`SELECT p.prod_uuid, p.partial_code, p.status, p.count, p.article_profile_id, ap.title AS article_profile_name, w.title AS warehouse_name
				FROM product AS p 
					INNER JOIN article_profile AS ap ON p.article_profile_id = ap.art_prof_uuid 
					INNER JOIN warehouse AS w ON p.warehouse_id = w.wh_uuid 
				WHERE p.prod_uuid = ? AND p.warehouse_id = ?;`,
				[value.product_id, user.warehouse_id],
			),
		]).then((values) => {
			already_allocated_stock = values[0];
			in_wh_product_data = values[1];
		});

		// User inputs "partial_code" and "stock_id" are used solely for generating responses and do not affect code logic.

		if (already_allocated_stock.length > 0) {
			if (value.stock_id === already_allocated_stock[0].stock_id) {
				return res.status(409).json({
					success: false,
					data: {},
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: `The barcode "${value.partial_code}" already exists in the current working stock.`,
				});
			} else {
				return res.status(409).json({
					success: false,
					data: {},
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: `Inventory Conflict: Barcode found in transfer stock "${already_allocated_stock[0].stock_id}".`,
				});
			}
		}

		if (in_wh_product_data.length === 0) {
			return res.status(404).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: `Barcode "${value.partial_code}" not found.`,
			});
		}

		res.status(200).json({
			success: true,
			data: in_wh_product_data[0],
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Product data loaded successfully.",
		});
	} catch (err) {
		console.error("Error while scanning product for transfer:", err);
		res.status(500).json({
			success: false,
			data: {},
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
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
			partial_code_label = "Unique Code";

		// partial_code, article_profile_name, status => only for front-end
		const prod_obj_schema = Joi.object({
			prod_uuid: Joi.string()
				.guid({ version: ["uuidv7"] })
				.required()
				.label(prod_id_label),
			// partial_code: Joi.string().min(3).max(127).required().label(partial_code_label),
			// article_profile_id: Joi.string()
			// 	.guid({ version: ["uuidv7"] })
			// 	.required()
			// 	.label("Article Profile ID"),
			// article_profile_name: Joi.string().min(1).max(127).required().label("Article Profile Name"),
			// status: Joi.string()
			// 	.valid(...prod_status_arr)
			// 	.required()
			// 	.label("Product status"),
			trf_count: Joi.number().integer().min(1).max(10000).required().label("Count"),
		});

		const prod_arr_label = "Products List";

		// stock_id and from_wh from the logged in user's data
		const stock_trf_schema = Joi.object({
			// to_wh: Joi.string().guid({ version: ["uuidv7"] }).required().label("To Warehouse ID"),
			request_id: Joi.string().trim().min(11).max(15).required().label("Request ID"),
			prod_arr: Joi.array().items(prod_obj_schema).min(1).required().label(prod_arr_label),
			transportation: Joi.string()
				.valid(...tpt_arr)
				.required()
				.label("Transport"),
			description: Joi.string().max(255).allow(null).default(null).optional().label("Description"),
		});

		const { user } = req;

		if (typeof req.body.prod_arr === "string") {
			try {
				req.body.prod_arr = JSON.parse(req.body.prod_arr);
			} catch (_) {
				return res.status(400).json({
					success: false,
					timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
					message: `Invalid ${prod_arr_label} format — must be a JSON array.`,
				});
			}
		}

		const { stock_transfer_invoice, ...req_minus_invoice } = req.body;
		const { error, value } = stock_trf_schema.validate(req_minus_invoice);

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
			do_ma_query("SELECT stock_id FROM stock_flow WHERE created_by = ? AND submitted_at IS NULL;", [user.uuid]),
			// do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE wh_uuid = ?;", [value.to_wh]),
			do_ma_query(
				`SELECT sr.dispatcher, sr.approved_at, supplier.name AS supplier_name, source.wh_uuid AS source_uuid, source.title AS source_name, recipient.name AS recipient_name, destination.wh_uuid AS destination_uuid, destination.title AS destination_name 
				FROM stock_request AS sr 
				INNER JOIN users AS recipient ON recipient.usr_uuid = sr.requester 
				INNER JOIN warehouse AS destination ON destination.wh_uuid = recipient.warehouse_id 
				INNER JOIN users AS supplier ON supplier.usr_uuid = sr.dispatcher 
				INNER JOIN warehouse AS source ON source.wh_uuid = supplier.warehouse_id 
				WHERE sr.stock_req_id = ?;`,
				[value.request_id],
			),
		];

		let wh_exist = false,
			// to_wh_exist = false,
			wh_abbr,
			goods_mvmt_count,
			goods_mvmt_date,
			stock_id,
			stock_exist = false,
			stock_req_data;

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

			// if (values[2][0].count === 1) {
			// 	to_wh_exist = true;
			// }

			stock_req_data = values[2];
		});

		if (!wh_exist) {
			return res.status(422).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Warehouse not assigned",
			});
		}

		if (stock_req_data.length === 0) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock request not found",
			});
		} else {
			stock_req_data = stock_req_data[0];
		}

		if (stock_req_data.approved_at === null) {
			return res.status(422).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Creating stock movement requires prior request approval.",
			});
		}

		if (stock_req_data.dispatcher !== user.uuid) {
			// Deny access with a 403 error if the logged-in user is not the designated dispatcher for the request.

			return res.status(403).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Access Denied",
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

		console.log(":: :: CHECK :: :: invoice is optional ::", user.upload_dir, user.file_name);

		if (!stock_exist) {
			// invoice is optional, also check here for the values of user.upload_dir, user.file_name before using them

			const upsert_promises = [
				do_ma_query(
					"INSERT INTO stock_flow SET stock_id = ?, from_warehouse = ?, to_warehouse = ?, product_arr = ?, transport = ?, invoice = ?, invoice_original_name = ?, created_by = ?, submitted_at = NULL, status = 'approved', description = ?, created_at = NOW(), updated_at = NOW();",
					[
						stock_id,
						stock_req_data.source_uuid,
						stock_req_data.destination_uuid,
						JSON.stringify(value.prod_arr),
						value.transportation,
						user.upload_dir && user.file_name ? path.join(user.upload_dir, user.file_name) : null,
						user.upload_dir && user.file_name ? user.file_original_name : null,
						user.uuid,
						value.description,
					],
				),
				do_ma_query("UPDATE warehouse SET goods_mvmt_count = ?, goods_mvmt_date = ? WHERE wh_uuid = ?;", [
					goods_mvmt_count,
					goods_mvmt_date,
					stock_req_data.source_uuid,
				]),
				do_ma_query("UPDATE stock_request SET stock_id = ? WHERE stock_req_id = ?", [
					stock_id,
					value.request_id,
				]),
			];

			let stock_flow_entry, wh_update_res, sr_update_res;
			await Promise.all(upsert_promises).then((values) => {
				stock_flow_entry = values[0].affectedRows;
				wh_update_res = values[1].changedRows;
				sr_update_res = values[2].changedRows;
			});

			if (stock_flow_entry === 1 && wh_update_res === 1 && sr_update_res === 1) {
				data_saved = true;
			}
		} else {
			let invoice_subquery = "";
			if (user.upload_dir && user.file_name) {
				invoice_subquery = "invoice = ?, invoice_original_name = ?,";
			}

			let stock_update_res,
				upd_query_values = [
					stock_req_data.destination_uuid,
					JSON.stringify(value.prod_arr),
					value.transportation,
					value.description,
					stock_id,
				];

			await Promise.all([
				do_ma_query(
					`UPDATE stock_flow 
					SET to_warehouse = ?, product_arr = ?, transport = ?, description = ?, ${invoice_subquery} updated_at = NOW() 
					WHERE stock_id = ?;`,
					invoice_subquery
						? upd_query_values.splice(
								4,
								0,
								path.join(user.upload_dir, user.file_name),
								user.file_original_name,
							)
						: upd_query_values,
				),
			]).then((values) => {
				stock_update_res = values[0];
			});

			if (stock_update_res.changedRows === 1) {
				data_saved = true;
			}
		}

		if (data_saved) {
			// on create stock send stock details back to client

			res.status(200).json({
				success: true,
				...(!stock_exist && {
					data: {
						stock_id,
						stock_req_id: value.request_id,
						supplier_name: stock_req_data.supplier_name,
						source_name: stock_req_data.source_name,
						recipient_name: stock_req_data.recipient_name,
						destination_name: stock_req_data.destination_name,
					},
				}),
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
		console.error("[stock_transfer_sync] UNHANDLED ERROR:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

// [is_valid_product] TASK: Helper function of [stock_transfer_submit]
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

// [stock_transfer_submit] TASK: Submits an existing stock
export const stock_transfer_submit = async (req, res) => {
	try {
		if (!req.body || Object.keys(req.body).length === 0) {
			return res.status(400).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Request body cannot be empty",
			});
		}

		const stock_id_label = "Stock Flow ID";
		const stock_id_schema = Joi.object({
			stock_id: Joi.string().trim().min(14).max(20).required().label(stock_id_label),
		});

		const { error, value } = stock_id_schema.validate(req.body);

		if (error) {
			return res.status(400).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		const stock_data = await do_ma_query(
			`SELECT sf.*, sr.approved_at 
			FROM stock_flow sf 
			INNER JOIN stock_request sr ON sf.stock_id = sr.stock_id 
			WHERE sf.stock_id = ?;`,
			[value.stock_id],
		);

		// verify stock existence
		if (stock_data.length === 0) {
			return res.status(404).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock ID not found",
			});
		}

		const { user } = req;

		// logged-in user owns this stock
		if (stock_data[0].created_by !== user.uuid) {
			return res.status(403).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Action Denied: Insufficient permissions to access this resource.",
			});
		}

		// stock is unapproved
		if (stock_data[0].approved_at === null) {
			return res.status(409).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: `Modification Prohibited: Cannot submit an unapproved stock.`,
			});
		}

		if (stock_data[0].submitted_at !== null) {
			return res.status(422).json({
				success: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock already submitted",
			});
		}

		// considering that the product_arr is never empty
		stock_data[0].product_arr = JSON.parse(stock_data[0].product_arr);

		let accurate_prods = [],
			mistake_prods = [];
		for (let i = 0; i < stock_data[0].product_arr.length; i++) {
			const curr_prod = {
				prod_uuid: stock_data[0].product_arr[i].prod_uuid,
				partial_code: stock_data[0].product_arr[i].partial_code,
				article_profile_id: stock_data[0].product_arr[i].article_profile_id,
				article_profile_name: stock_data[0].product_arr[i].article_profile_name,
				status: stock_data[0].product_arr[i].status,
				count: stock_data[0].product_arr[i].trf_count,
			};

			const is_valid = await is_valid_product({
				...curr_prod,
				warehouse_id: user.warehouse_id,
			});

			is_valid ? accurate_prods.push(curr_prod) : mistake_prods.push(curr_prod);
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
				"UPDATE stock_flow SET product_arr = ?, submitted_at = NOW(), status = 'in-transit', updated_at = NOW() WHERE stock_id = ?;",
				[JSON.stringify(accurate_prods), stock_data[0].stock_id],
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
		console.error("[stock_transfer_submit] UNHANDLED ERROR:", err);
		res.status(500).json({
			success: false,
			data: {},
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

// [get_approved_stock_flow] TASK: GET approved and unsubmitted stock flow
export const get_approved_stock_flow = async (req, res) => {
	try {
		const req_id_label = "Request ID";
		const req_id_schema = Joi.string().trim().min(11).max(15).required().label(req_id_label);

		const { error, value } = req_id_schema.validate(req.params.id);

		if (error) {
			return res.status(400).json({
				success: false,
				is_found: null,
				data: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		const verify_request = await do_ma_query(
			`SELECT sr.dispatcher, sr.approved_at, sf.submitted_at 
			FROM stock_request sr 
			LEFT JOIN stock_flow sf ON sr.stock_id = sf.stock_id 
			WHERE sr.stock_req_id = ?;`,
			[value],
		);

		if (verify_request.length === 0) {
			return res.status(404).json({
				success: false,
				is_found: null,
				data: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock request ID not found",
			});
		}

		// check if the logged-in user is either superuser or dispatcher of the request

		const { user } = req;

		if (!user.isSuperAdmin && verify_request[0].dispatcher !== user.uuid) {
			return res.status(403).json({
				success: false,
				is_found: null,
				data: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Action Denied: Insufficient permissions to access this resource.",
			});
		}

		// check if the request ID is approved

		if (verify_request[0].approved_at === null) {
			return res.status(409).json({
				success: false,
				is_found: null,
				data: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Action Locked: Stock transfer requires prior request approval.",
			});
		}

		// stock already submitted

		if (verify_request[0].submitted_at) {
			return res.status(409).json({
				success: false,
				is_found: null,
				data: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: `Modification Prohibited: Stock is already submitted.`,
			});
		}

		// check and return the preexisting stock / draft

		// Old Query
		`SELECT sf.stock_id, sr.stock_req_id request_id, u2.name supplier_name, w1.title source_name, u1.name recipient_name, w2.title destination_name, sf.transport transportation, sf.description, sf.invoice_original_name, sf.product_arr prod_arr 
		FROM stock_flow sf 
		INNER JOIN stock_request sr ON sf.stock_id = sr.stock_id 
		INNER JOIN warehouse w1 ON sf.from_warehouse = w1.wh_uuid 
		INNER JOIN warehouse w2 ON sf.to_warehouse = w2.wh_uuid 
		INNER JOIN users u1 ON sr.requester = u1.usr_uuid 
		INNER JOIN users u2 ON sr.dispatcher = u2.usr_uuid 
		WHERE sr.stock_req_id = ? AND sr.approved_at IS NOT NULL AND sf.submitted_at IS NULL;`;

		const existing_stock = await do_ma_query(
			`SELECT json_table.request_id, json_table.stock_id, u1.name supplier_name, w1.title source_name, u2.name recipient_name, w2.title destination_name, json_table.transportation, json_table.invoice_original_name, json_table.description, JSON_ARRAYAGG(JSON_OBJECT('prod_uuid', json_table.prod_uuid, 'partial_code', p.partial_code, 'status', p.status, 'available_count', p.count, 'article_profile_id', p.article_profile_id, 'article_profile_name', ap.title, 'transferable_count', json_table.transferable_count)) prod_arr 
			FROM ( 
				SELECT jt.*, sr.stock_req_id request_id, sr.requester, sr.dispatcher, sf.stock_id, sf.from_warehouse, sf.to_warehouse, sf.transport transportation, sf.invoice_original_name, sf.description 
				FROM stock_flow sf 
				INNER JOIN stock_request sr ON sf.stock_id = sr.stock_id 
				INNER JOIN JSON_TABLE( 
					sf.product_arr, 
					'$[*]' COLUMNS( 
						prod_uuid CHAR(36) PATH '$.prod_uuid', 
						transferable_count SMALLINT(6) PATH '$.trf_count' 
					) 
				) AS jt 
				WHERE sr.stock_req_id = ? AND sr.approved_at IS NOT NULL AND sf.submitted_at IS NULL 
			) json_table 
			INNER JOIN product p ON json_table.prod_uuid = p.prod_uuid 
			INNER JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid 
			INNER JOIN warehouse w1 ON json_table.from_warehouse = w1.wh_uuid 
			INNER JOIN warehouse w2 ON json_table.to_warehouse = w2.wh_uuid 
			INNER JOIN users u1 ON json_table.dispatcher = u1.usr_uuid 
			INNER JOIN users u2 ON json_table.requester = u2.usr_uuid;`,
			[value],
		);

		if (existing_stock.length === 0) {
			return res.status(200).json({
				success: true,
				is_found: false,
				data: {},
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: `No draft found for this ${req_id_label}`,
			});
		}

		const stock_data = {
			...existing_stock[0],
			prod_arr: JSON.parse(existing_stock[0].prod_arr),
		};

		res.status(200).json({
			success: true,
			is_found: true,
			data: stock_data,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Stock data loaded",
		});
	} catch (err) {
		console.error("[get_approved_stock_flow] UNHANDLED ERROR:", err);
		res.status(500).json({
			success: false,
			is_found: false,
			data: {},
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const auto_remove_stock = async (req, res) => {
	try {
		const stock_id_label = "Stock Flow ID";
		const stock_id_schema = Joi.string().trim().min(14).max(20).required().label(stock_id_label);

		const { error, value } = stock_id_schema.validate(req.params.id);

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		const stock_data = await do_ma_query(
			`SELECT sf.stock_id, sf.product_arr, sf.created_by, sf.submitted_at 
			FROM stock_flow sf 
			WHERE sf.stock_id = ?;`,
			[value],
		);

		// verify stock existence
		if (stock_data.length === 0) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock ID not found",
			});
		}

		const { user } = req;

	
		if (stock_data[0].created_by !== user.uuid) {
			return res.status(403).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Action Denied: Insufficient permissions to access this resource.",
			});
		}

		// Already submitted conflict
		if (stock_data[0].submitted_at !== null) {
			return res.status(409).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Cannot Remove Stock: The request has already been submitted.",
			});
		}

		stock_data[0].product_arr = JSON.parse(stock_data[0].product_arr);
		if (stock_data[0].product_arr.length > 1) {
			return res.status(422).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Unprocessable Request: The auto-remove feature is limited to a single product.",
			});
		}

		const sf_delete_res = await do_ma_query(
			"DELETE FROM stock_flow WHERE stock_id = ? AND created_by = ? AND submitted_at IS NULL AND JSON_LENGTH(product_arr) = 1;",
			[stock_data[0].stock_id, user.uuid],
		);

		let is_deleted = false;

		if (sf_delete_res.affectedRows === 1) {
			const sr_update_res = await do_ma_query(`UPDATE stock_request SET stock_id = NULL WHERE stock_id = ?;`, [
				stock_data[0].stock_id,
			]);

			if (sr_update_res.changedRows === 1) {
				is_deleted = true;
			}
		}

		if (is_deleted) {
			res.status(200).json({
				success: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock data removed successfully",
			});
		} else {
			res.status(500).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Stock data not removed",
			});
		}
	} catch (err) {
		console.error("[remove_stock] UNHANDLED ERROR:", err);
		res.status(500).json({
			success: false,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error",
		});
	}
};

export const get_existing_stock_flow_old = async (req, res) => {
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
