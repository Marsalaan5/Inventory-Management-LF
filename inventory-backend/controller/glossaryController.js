

import pool from '../db.js';
import Joi from "joi";
// import { v7 as uuidv7 } from "uuid";
import { DateTime } from "luxon";
import { do_ma_query } from '../db.js';




const gloss_ok_spl_chars = "_",
	forbidden_gloss_titles = [
		"id",
		"art_prof_uuid",
		"title",
		"attributes",
		"mfg_yr",
		"sku",
		"weight",
		"dimensions",
		"unit",
		"description",
		"created_at",
		"updated_at",
		"last_updated_by",
		"category",
		"brand",
		"model",
		"more_attr",
		"length",
		"width",
		"height",
	];


export const getGlossaries = async (req, res) => {
    try {
        const db_result = await do_ma_query(
            "SELECT * FROM glossary ORDER BY created_at DESC;",
            []
        );

        if (db_result.length === 0) {
            return res.status(200).json({
                success: true,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                data: {
                    glossaries: [],
                    total: 0
                }
            });
        }

        const glossaries = db_result.map((glossary) => ({
            id: glossary.id,
            title: glossary.title,
            name: glossary.title, 
            created_at: glossary.created_at,
            updated_at: glossary.updated_at,
        }));

        res.status(200).json({
            success: true,
            timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
            data: {
                glossaries: glossaries,
                total: glossaries.length
            }
        });
    } catch (err) {
        console.error(`Route: ${req.originalUrl}, Error:`, err);
        res.status(500).json({
            success: false,
            timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
            message: "Internal server error.",
        });
    }
};

// Get single glossary by ID
export const getGlossaryById = async (req, res) => {
    try {
        const glossaryId = req.params.id;

        if (!glossaryId || isNaN(glossaryId)) {
            return res.status(400).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Invalid glossary ID",
            });
        }

        const db_result = await do_ma_query(
            "SELECT * FROM glossary WHERE id = ?;",
            [glossaryId]
        );

        if (db_result.length === 0) {
            return res.status(404).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Glossary not found",
            });
        }

        const glossary = {
            id: db_result[0].id,
            title: db_result[0].title,
            name: db_result[0].title,
            created_at: db_result[0].created_at,
            updated_at: db_result[0].updated_at,
        };

        res.status(200).json({
            success: true,
            timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
            data: glossary,
        });
    } catch (err) {
        console.error(`Route: ${req.originalUrl}, Error:`, err);
        res.status(500).json({
            success: false,
            timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
            message: "Internal server error.",
        });
    }
};
 

// to-do 

 export const createGLossary =  async (req, res) => {
    try {
        const gloss_label = "glossary title";

        const gloss_schema = Joi.object({
            gloss_title: Joi.string()
                .min(3)
                .max(127)
                .pattern(
                    new RegExp(
                        `^(?![${gloss_ok_spl_chars}])(?!.*[${gloss_ok_spl_chars}]{2})[a-z0-9${gloss_ok_spl_chars}]+(?<![${gloss_ok_spl_chars}])$`
                    )
                )
                .required()
                .label(gloss_label)
                .messages({
                    "string.pattern.base": `${gloss_label} can include letters (a-z), numbers (0-9), and these special characters (${gloss_ok_spl_chars}). You cannot start or end a ${gloss_label} with a special character or use multiple special characters in a row.`,
                }),
        });

        const { error, value } = gloss_schema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: error.details[0].message,
            });
        }

        if (forbidden_gloss_titles.includes(value.gloss_title)) {
            return res.status(400).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: `Invalid "${gloss_label}"`,
            });
        }

        let verify_unique = await do_ma_query("SELECT COUNT(*) AS count FROM glossary WHERE title = ?;", [
            value.gloss_title,
        ]);

        if (verify_unique[0].count > 0) {
            return res.status(422).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Resource already taken.",
            });
        }

        let gloss_insert_res = await do_ma_query(
            `INSERT INTO glossary SET title = ?, created_at = NOW(), updated_at = NOW();`,
            [value.gloss_title]
        );

        if (gloss_insert_res.affectedRows === 1) {
            res.status(201).json({
                success: true,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Glossary word created successfully.",
            });
        } else {
            res.status(304).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Glossary word creation failed.",
            });
        }
    } catch (err) {
        console.error(`Route: ${req.originalUrl}, Error:`, err);
        res.status(500).json({
            success: false,
            timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
            message: "Internal server error.",
        });
    }
};



export const editGlossary = async (req, res) => {
    try {
        const gloss_label = "glossary title";

        const gloss_schema = Joi.object({
            old_gloss_title: Joi.string()
                .min(3)
                .max(127)
                .pattern(
                    new RegExp(
                        `^(?![${gloss_ok_spl_chars}])(?!.*[${gloss_ok_spl_chars}]{2})[a-z0-9${gloss_ok_spl_chars}]+(?<![${gloss_ok_spl_chars}])$`
                    )
                )
                .required()
                .label(gloss_label)
                .messages({
                    "string.pattern.base": `${gloss_label} can include letters (a-z), numbers (0-9), and these special characters (${gloss_ok_spl_chars}). You cannot start or end a ${gloss_label} with a special character or use multiple special characters in a row.`,
                }),
            new_gloss_title: Joi.string()
                .min(3)
                .max(127)
                .pattern(
                    new RegExp(
                        `^(?![${gloss_ok_spl_chars}])(?!.*[${gloss_ok_spl_chars}]{2})[a-z0-9${gloss_ok_spl_chars}]+(?<![${gloss_ok_spl_chars}])$`
                    )
                )
                .required()
                .label(gloss_label)
                .messages({
                    "string.pattern.base": `${gloss_label} can include letters (a-z), numbers (0-9), and these special characters (${gloss_ok_spl_chars}). You cannot start or end a ${gloss_label} with a special character or use multiple special characters in a row.`,
                }),
        });

        const { error, value } = gloss_schema.validate(req.body, { abortEarly: false });

        if (error) {
            return res.status(400).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: error.details[0].message,
            });
        }

        if (
            forbidden_gloss_titles.includes(value.old_gloss_title) ||
            forbidden_gloss_titles.includes(value.new_gloss_title)
        ) {
            return res.status(400).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: `Invalid "${gloss_label}"`,
            });
        }

        let verify_existence, verify_unique;

        await Promise.all([
            do_ma_query("SELECT COUNT(*) AS count FROM glossary WHERE title = ?;", [value.old_gloss_title]),
            do_ma_query("SELECT COUNT(*) AS count FROM glossary WHERE title = ?;", [value.new_gloss_title]),
        ]).then((values) => {
            verify_existence = values[0];
            verify_unique = values[1];
        });

        if (verify_existence[0].count != 1) {
            return res.status(404).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Resource not found.",
            });
        }

        if (verify_unique[0].count > 0) {
            return res.status(422).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Resource already taken.",
            });
        }

        let gloss_update_res = await do_ma_query(`UPDATE glossary SET title = ?, updated_at = NOW() WHERE title = ?;`, [
            value.new_gloss_title,
            value.old_gloss_title,
        ]);

        if (gloss_update_res.changedRows === 1) {
            res.status(200).json({
                success: true,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Glossary word updated successfully.",
            });
        } else {
            res.status(304).json({
                success: false,
                timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
                message: "Glossary word updation failed.",
            });
        }
    } catch (err) {
        console.error(`Route: ${req.originalUrl}, Error:`, err);
        res.status(500).json({
            success: false,
            timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
            message: "Internal server error.",
        });
    }
};
