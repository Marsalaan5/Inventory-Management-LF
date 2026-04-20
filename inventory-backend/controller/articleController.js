
import pool from '../db.js';
import Joi from "joi";
import { v7 as uuidv7 } from "uuid";
import { DateTime } from "luxon";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { do_ma_query } from '../db.js';
// import { logActivity } from '../services/activityService.js';




const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "../barcodes");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);



const wh_ok_spl_chars = " \\-_.",
	gloss_ok_spl_chars = "_",
	art_prof_ok_spl_chars = " \\-_.",
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



function pad(str, max) {
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function extract_initials(str) {
  const words = str.split(/[ \-_.]+/).filter((word) => word.length > 0);

  if (words.length >= 2) {
    const first_initial = words[0][0].toUpperCase();
    const second_initial = words[1][0].toUpperCase();
    return first_initial + second_initial;
  } else {
    return str[0].toUpperCase() + str[1].toUpperCase();
  }
}

function arr_simil(arr1, arr2) {
  const set1 = new Set(arr1);
  const set2 = new Set(arr2);

  if (set1.size !== set2.size) {
    return false;
  }

  for (const element of set1) {
    if (!set2.has(element)) {
      return false;
    }
  }
  return true;
}


  
export const createArticle = async (req, res) => {
  try {
    const prof_title_label = "article profile title";
    const cat_label = "category";
    const brand_label = "brand";
    const model_label = "model";
    const mfg_yr_label = "MFG year";
    const attr_label = "attributes";
    const wt_label = "weight";
    const dim_label = "dimensions";
    const unit_label = "unit";
    const desc_label = "description";
    const user_id_label = "user ID";

    const art_prof_schema = Joi.object({
      art_prof_title: Joi.string()
        .min(3)
        .max(127)
        .pattern(
          new RegExp(
            `^(?![${art_prof_ok_spl_chars}])(?!.*[${art_prof_ok_spl_chars}]{2})[a-zA-Z0-9${art_prof_ok_spl_chars}]+(?<![${art_prof_ok_spl_chars}])$`
          )
        )
        .required()
        .label(prof_title_label)
        .messages({
          "string.pattern.base": `${prof_title_label} can include letters (a-z), numbers (0-9), and these special characters (${art_prof_ok_spl_chars}). You cannot start or end a ${prof_title_label} with a special character or use multiple special characters in a row.`,
        }),
      category: Joi.string() // only allow alphanumerics and word separators in category
        .min(3)
        .max(127)
        .pattern(
          new RegExp(
            `^(?![${art_prof_ok_spl_chars}])(?!.*[${art_prof_ok_spl_chars}]{2})[a-zA-Z0-9${art_prof_ok_spl_chars}]+(?<![${art_prof_ok_spl_chars}])$`
          )
        )
        .custom((value, helpers) => {
          let alphanum_cnt = 0;
          for (const char of value) {
            const char_code = char.charCodeAt(0);

            // numbers (0=48 to 9=57) uppercase letter (A=65 to Z=90) lowercase letter (a=97 to z=122)
            if (
              (char_code >= 48 && char_code <= 57) ||
              (char_code >= 65 && char_code <= 90) ||
              (char_code >= 97 && char_code <= 122)
            ) {
              alphanum_cnt++;
            }
          }

          if (alphanum_cnt < 3) {
            // Return a Joi error if the validation fails
            return helpers.error("string.minAlphaNumerics", { min: 3, value });
          }

          // Return the value if validation passes
          return value;
        }, "minimum 3 alphanumerics check")
        .required()
        .label(cat_label)
        .messages({
          "string.minAlphaNumerics": '"{#label}" must contain at least {#min} alphanumeric characters.',
          "string.pattern.base": `${cat_label} can include letters (a-z), numbers (0-9), and these special characters (${art_prof_ok_spl_chars}). You cannot start or end a ${cat_label} with a special character or use multiple special characters in a row.`,
        }),
      brand: Joi.string()
        .min(3)
        .max(127)
        .custom((value, helpers) => {
          let alphanum_cnt = 0;
          for (const char of value) {
            const char_code = char.charCodeAt(0);

            // numbers (0=48 to 9=57) uppercase letter (A=65 to Z=90) lowercase letter (a=97 to z=122)
            if (
              (char_code >= 48 && char_code <= 57) ||
              (char_code >= 65 && char_code <= 90) ||
              (char_code >= 97 && char_code <= 122)
            ) {
              alphanum_cnt++;
            }
          }

          if (alphanum_cnt < 3) {
            // Return a Joi error if the validation fails
            return helpers.error("string.minAlphaNumerics", { min: 3, value });
          }

          // Return the value if validation passes
          return value;
        }, "minimum 3 alphanumerics check")
        .required()
        .label(brand_label)
        .messages({
          "string.minAlphaNumerics": '"{#label}" must contain at least {#min} alphanumeric characters.',
        }),
      model: Joi.string().min(3).max(127).required().label(model_label),
      mfg_yr: Joi.number().integer().min(2015).max(DateTime.local().year).required().label(mfg_yr_label),
      more_attr: Joi.object()
        .pattern(
          new RegExp(
            `^(?![${gloss_ok_spl_chars}])(?!.*[${gloss_ok_spl_chars}]{2})[a-z0-9${gloss_ok_spl_chars}]+(?<![${gloss_ok_spl_chars}])$`
          ),
          Joi.string()
        )
        .optional()
        .label(attr_label),
      weight: Joi.number().min(1).optional().label(wt_label),
      dim: Joi.object({
        length: Joi.number().min(1).required(),
        width: Joi.number().min(1).required(),
        height: Joi.number().min(1).required(),
      })
        .optional()
        .label(dim_label),
      unit: Joi.string().valid("piece", "gram", "kilogram", "metre", "litre").required().label(unit_label),
      desc: Joi.string().max(255).optional().label(desc_label),
      last_updated_by: Joi.number().integer().min(1).required().label(user_id_label),
    });

    const { error, value } = art_prof_schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

    let duplicate = false;

    await Promise.all([
      do_ma_query("SELECT COUNT(*) AS count FROM article_profile WHERE title = ?;", [value.art_prof_title]),
      do_ma_query("SELECT COUNT(*) AS count FROM model_name WHERE title = ?;", [value.model]),
    ]).then((values) => {
      if (values[0][0].count > 0) duplicate = true;
      if (values[1][0].count > 0) duplicate = true;
    });

    if (duplicate) {
      return res.status(422).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Resource already taken.",
      });
    }

    // also verify user_id existence from the DB

    const read_key = await do_ma_query("SELECT base36_key FROM model_name ORDER BY id DESC LIMIT 1;");

    let key_gen = "";
    if (read_key.length === 0) {
      key_gen = "0000";
    } else {
      let dec_no = parseInt(read_key[0].base36_key, 36);
      dec_no++;
      key_gen = dec_no.toString(36).toUpperCase();
      key_gen = pad(key_gen, 4);
    }

    // remove all special characters from brand name
    const allowed_chars = /[^a-zA-Z0-9 \-_.]/g;
    const brand_sp_chars_rem = value.brand.replace(allowed_chars, "");

    // build SKU
    const SKU =
      extract_initials(value.category) +
      "-" +
      extract_initials(brand_sp_chars_rem) +
      "-" +
      key_gen +
      "-" +
      String(value.mfg_yr).slice(-2);

    // validate extra attributes
    const more_attr_keys = Object.keys(value.more_attr);
    const more_attr_keys_str = '"' + more_attr_keys.join('","') + '"';

    let read_gloss_titles = await do_ma_query(
      `SELECT JSON_ARRAYAGG(title) AS title_arr FROM glossary WHERE title IN (${more_attr_keys_str});`
    );

    read_gloss_titles = JSON.parse(read_gloss_titles[0]["title_arr"]);

    if (!arr_simil(more_attr_keys, read_gloss_titles)) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: `Invalid "${attr_label}"`,
      });
    }

    let insert_sub_qy = "",
      insert_vals_arr = [];

    if (value.more_attr) {
      insert_sub_qy += "attributes = ?, ";
      insert_vals_arr.push(JSON.stringify(value.more_attr));
    }

    if (value.weight) {
      insert_sub_qy += "weight  = ?, ";
      insert_vals_arr.push(value.weight);
    }

    if (value.dim) {
      insert_sub_qy += "dimensions = ?, ";
      insert_vals_arr.push(JSON.stringify(value.dim));
    }

    if (value.desc) {
      insert_sub_qy += "description = ?, ";
      insert_vals_arr.push(value.desc);
    }

    // insert_sub_qy = insert_sub_qy.slice(0, -2);

    let all_insert = false;

    await Promise.all([
      do_ma_query(
        "INSERT INTO model_name SET base36_key = ?, title = ?, created_at = NOW(), updated_at = NOW();",
        [key_gen, value.model]
      ),
      do_ma_query(
        `INSERT INTO article_profile SET art_prof_uuid = "${uuidv7()}", title = ?, category = ?, brand = ?, mfg_yr = ?, sku = ?, ${insert_sub_qy} unit = ?, created_at = NOW(), updated_at = NOW(), last_updated_by = ?;`,
        [
          value.art_prof_title,
          value.category,
          value.brand,
          value.mfg_yr,
          SKU,
          ...insert_vals_arr,
          value.unit,
          value.last_updated_by,
        ]
      ),
    ]).then((values) => {
      if (values[0].affectedRows === 1 && values[1].affectedRows === 1) all_insert = true;
    });

    if (all_insert) {
      res.status(201).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Article profile created successfully.",
      });
    } else {
      res.status(304).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Article profile creation failed.",
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





export const getArticle = async (req, res) => {
  try {
    const db_result = await do_ma_query(
      `SELECT 
        mn.title AS model_name, 
        mid_data.art_prof_uuid, 
        mid_data.title, 
        mid_data.category, 
        mid_data.brand, 
        mid_data.mfg_yr, 
        mid_data.sku, 
        mid_data.attributes, 
        mid_data.weight, 
        mid_data.dimensions, 
        mid_data.unit, 
        mid_data.description, 
        mid_data.created_at, 
        mid_data.updated_at, 
        mid_data.last_updated_by,
        u.name AS updated_by_username
      FROM model_name mn 
      INNER JOIN (
        SELECT 
          ap.*, 
          SUBSTRING_INDEX(SUBSTRING_INDEX(ap.sku, '-', -2), '-', 1) AS model_key 
        FROM article_profile ap
      ) mid_data ON mn.base36_key = mid_data.model_key
      LEFT JOIN users u ON mid_data.last_updated_by = u.id
      ORDER BY mid_data.created_at ASC;`,
      []
    );

    if (db_result.length === 0) {
      return res.status(200).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        data: []
      });
    }

    const art_prof_list = db_result.map((prof_data) => ({
      uuid: prof_data.art_prof_uuid,
      title: prof_data.title,
      category: prof_data.category,
      brand: prof_data.brand,
      model: prof_data.model_name,
      manufacturing_year: prof_data.mfg_yr,
      sku: prof_data.sku,
      attributes: prof_data.attributes ? JSON.parse(prof_data.attributes) : {},
      weight: prof_data.weight,
      dimensions: prof_data.dimensions ? JSON.parse(prof_data.dimensions) : null,
      unit: prof_data.unit,
      description: prof_data.description,
      created_at: prof_data.created_at,
      updated_at: prof_data.updated_at,
      last_updated_by: prof_data.last_updated_by,
      updated_by_username: prof_data.updated_by_username || 'Unknown'
    }));

    res.status(200).json({
      success: true,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      data: art_prof_list,
    });
  } catch (err) {
    console.error(`Route: ${req.originalUrl}, Error:`, err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      error: "Internal Server Error",
    });
  }
};
