

import pool from '../db.js';
import Joi from "joi";
import { DateTime } from "luxon";
import bwipjs from "bwip-js";
import multer from 'multer';
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { do_ma_query } from '../db.js';
import { logActivity } from '../services/activityService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputDir = path.join(__dirname, "../barcodes");
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);


// Utility Functions
// export function generateUniqueSKU(productName) {
//   const prefix = productName.substring(0, 3).toUpperCase();
//   const timestamp = Date.now().toString(36).toUpperCase();
//   const randomStr = Math.random().toString(36).substring(2, 4).toUpperCase();
//   return `${prefix}-${timestamp}-${randomStr}`;
// }



const invoiceStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/invoices');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'invoice-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const invoiceUpload = multer({
  storage: invoiceStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx|xlsx|xls/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  }
});

export const uploadInvoice = invoiceUpload.single('invoice_file');

function formatDateLabel(dateKey, period) {
  if (!dateKey) return 'Unknown';
  
  switch(period) {
    case 'daily':
      return DateTime.fromISO(dateKey.toString()).toFormat('MMM dd');
    case 'weekly':
      const year = dateKey.toString().substring(0, 4);
      const week = dateKey.toString().substring(4);
      return `Week ${week}, ${year}`;
    case 'monthly':
      return DateTime.fromFormat(dateKey.toString(), 'yyyy-MM').toFormat('MMM yyyy');
    default:
      return dateKey.toString();
  }
}


function luhnChecksum(numStr) {
  let sum = 0;
  let doubleDigit = true;
  for (let i = numStr.length - 1; i >= 0; i--) {
    let n = parseInt(numStr[i], 10);
    if (doubleDigit) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    doubleDigit = !doubleDigit;
  }
  return (10 - (sum % 10)) % 10;
}

export function generateBarcodeNumber(productName) {
  
  const prefix = productName.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, 'X');
  const timestamp36 = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 4).toUpperCase();

  const numericStr = (
    prefix
      .split('')
      .map(c => ('0' + (c.charCodeAt(0) - 64)).slice(-2))
      .join('') +
    parseInt(timestamp36, 36).toString().slice(-6) +
    Math.floor(Math.random() * 90 + 10)
  ).slice(-12);

  const checkDigit = luhnChecksum(numericStr);

  return numericStr + checkDigit;
}


export function generateBarcodeImage(barcodeNumber) {
  return new Promise((resolve, reject) => {
    bwipjs.toBuffer(
      {
        bcid: 'code128',   
        text: barcodeNumber,
        scale: 3,            
        height: 20,          
        includetext: true,   
        textxalign: 'center',
        backgroundcolor: 'FFFFFF',
        type:'svg'
      },
      (err, svg) => {
        if (err) return reject(err);

        const filename = `${barcodeNumber}.svg`;
        const filePath = path.join(outputDir, filename);
        fs.writeFileSync(filePath, svg);

        resolve(`/barcodes/${filename}`); 
      }
    );
  });
}


// GET
export const getProduct = async (req, res) => {
  try {
    const {warehouseFilter} = req;
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      warehouse_id = "",
      article_profile_id = "",
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

  
    let whereConditions = [];
    let queryParams = [];

    	if (warehouseFilter) {
			whereConditions.push("p.warehouse_id = ?");
			queryParams.push(warehouseFilter);
		} else if (warehouse_id) {
			whereConditions.push("p.warehouse_id = ?");
			queryParams.push(warehouse_id);
		}

    if (search) {
      whereConditions.push("(p.title LIKE ? OR p.barcode LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`);
    }

  

    if (status) {
      whereConditions.push("p.status = ?");
      queryParams.push(status);
    }

    if (warehouse_id) {
      whereConditions.push("p.warehouse_id = ?");
      queryParams.push(warehouse_id);
    }

    if (article_profile_id) {
      whereConditions.push("p.article_profile_id = ?");
      queryParams.push(article_profile_id);
    }

    const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

  
    const allowedSortFields = ["created_at", "updated_at", "title", "count", "status"];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
    const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    // Main query with joins
    const query = `
      SELECT 
        p.*,
        ap.title as article_profile_name,
        w.title as warehouse_name,
       
        updater.name as updated_by_name
      FROM product p
      LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
      LEFT JOIN warehouse w ON p.warehouse_id = w.id

      LEFT JOIN users updater ON p.last_updated_by = updater.id
      ${whereClause}
      ORDER BY p.${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(parseInt(limit), parseInt(offset));

    // const queryParamsWithPagination = [...queryParams, parseInt(limit), parseInt(offset)];

    const products = await do_ma_query(query, queryParams);

    // Count total for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM product p
      ${whereClause}
    `;

    const countResult = await do_ma_query(countQuery, queryParams.slice(0, -2));

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        total: countResult[0].total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(countResult[0].total / limit),
      },
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching products",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

// GET single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const id_schema = Joi.object({
      id: Joi.number().integer().min(1).required().label("product ID"),
    });

    const { error } = id_schema.validate({ id }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        data: null,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

    const query = `
      SELECT 
  p.*,
  ap.title AS article_profile_name,
  ap.art_prof_uuid AS article_profile_id,
  w.title AS warehouse_name,
  w.id AS warehouse_id,
  creator.name AS created_by_name
FROM product p
LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
LEFT JOIN warehouse w ON p.warehouse_id = w.id
LEFT JOIN users creator ON p.last_updated_by = creator.id
WHERE p.id = ?

    `;

    const products = await do_ma_query(query, [id]);

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    res.status(200).json({
      success: true,
      data: products[0],
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};


export const getProductByScan = async (req, res) => {
  try {
    const { code } = req.params; 

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Scan code is required",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    // Search by Barcode
    const query = `
      SELECT 
        p.*,
        ap.title as article_profile_name,
        w.title as warehouse_name,
        creator.name as created_by_name
      FROM product p
      LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      LEFT JOIN users creator ON p.last_updated_by = creator.id
      WHERE p.barcode = ?
      LIMIT 1
    `;

    const products = await do_ma_query(query, [code, code]);

   if (products.length === 0) {
  return res.status(200).json({
    success: true,
    is_found: false,
    data: null,
    timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
  });
}

return res.status(200).json({
  success: true,
  is_found: true,
  data: products[0],
  timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
});
  } catch (error) {
    console.error("Error fetching product by scan:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching product",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

//comment for testing new barcode creation with scanner

// export const createProduct = async (req, res) => {
//   try {
//     const product_schema = Joi.object({
//       title: 
//       Joi.string().min(3).max(127).required().label("product title"),
//       article_profile_id: 
//       Joi.string().guid({version: ["uuidv7"]}).required().label("article profile ID"),
//       warehouse_id: 
//       Joi.number().integer().min(1).required().label("warehouse ID"),
//       location: 
//       Joi.string().max(255).allow("", null).label("location"),
//       status: 
//       Joi.string().valid("new", "used", "repaired", "broken", "installed").default("new").label("status"),
//       count: 
//       Joi.number().integer().min(0).required().label("count"),
//       description: 
//       Joi.string().max(255).allow("", null).label("description"),
//       last_updated_by: 
//       Joi.number().integer().min(1).required().label("user ID"),
//     });

//     const { error, value } = product_schema.validate(req.body, { abortEarly: false });

//     if (error) {
//       return res.status(400).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: error.details[0].message,
//       });
//     }

//     // Verify article profile exists
//     const article_check = await do_ma_query("SELECT COUNT(*) AS count FROM article_profile WHERE art_prof_uuid = ?", [
//       value.article_profile_id,
//     ]);

//     if (article_check[0].count === 0) {
//       return res.status(404).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Article profile not found",
//       });
//     }

//     // Verify warehouse exists
//     const warehouse_check = await do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE id = ?", [
//       value.warehouse_id,
//     ]);

//     if (warehouse_check[0].count === 0) {
//       return res.status(404).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Warehouse not found",
//       });
//     }

//     // Verify user exists
//     const user_check = await do_ma_query("SELECT COUNT(*) AS count FROM users WHERE id = ?", [
//       value.last_updated_by,
//     ]);

//     if (user_check[0].count === 0) {
//       return res.status(404).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "User not found",
//       });
//     }


  
//     const barcodeNumber = generateBarcodeNumber(value.title);
//     let barcodeImagePath;

//     try {
//       barcodeImagePath = await generateBarcodeImage(barcodeNumber);
//     } catch (barcodeError) {
//       console.error("Error generating barcode:", barcodeError);
//       return res.status(500).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Error generating barcode",
//       });
//     }

  
//     const product_insert_res = await do_ma_query(
//       `INSERT INTO product
//         (title, article_profile_id, warehouse_id, location, status, count,  barcode, barcode_image,
//          description, created_at, updated_at, last_updated_by)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
//       [
//         value.title,
//         value.article_profile_id,
//         value.warehouse_id,
//         value.location || null,
//         value.status,
//         value.count,
        
//         barcodeNumber,
//         barcodeImagePath,
//         value.description || null,
//         value.last_updated_by,
//       ]
//     );

//      if (product_insert_res.affectedRows === 1) {
    
//       const [warehouse] = await do_ma_query(
//         "SELECT title FROM warehouse WHERE id = ?",
//         [value.warehouse_id]
//       );
//       const [user] = await do_ma_query(
//         "SELECT name FROM users WHERE id = ?",
//         [value.last_updated_by]
//       );

//       await logActivity({
//         activity_type: 'product',
//         action: 'created',
//         entity_id: product_insert_res.insertId,
//         entity_name: value.title,
//         description: `"${value.title}" created with ${value.count} items`,
//         user_id: req.user?.id || value.user_id,
//         user_name: req.user?.name || 'System',
//         warehouse_id: value.warehouse_id,
//         warehouse_name: warehouse[0]?.title || 'Unknown',
//         metadata: {
//           barcode: barcodeNumber,
//           status: value.status,
//           count: value.count
//         }
//       });

//       res.status(201).json({
//         success: true,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Product created successfully",
//         data: {
//           id: product_insert_res.insertId,
//           barcode: barcodeNumber,
//           barcode_image: barcodeImagePath,
//         },
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Product creation failed",
//       });
//     }
//   } catch (err) {
//     console.error("Error creating product:", err);
//     res.status(500).json({
//       success: false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message: "Internal server error",
//     });
//   }
// };


//to-do when prodcut exists after scan  user  can only edit product or view  and redirect edit modal and unable to add product


// export const createProduct = async (req, res) => {
//   try {
//     const product_schema = Joi.object({
//       title: Joi.string().min(3).max(127).label("product title"),
//       article_profile_id: Joi.string().guid({version: ["uuidv7"]}).required().label("article profile ID"),
//       warehouse_id: Joi.number().integer().min(1).required().label("warehouse ID"),
//       location: Joi.string().max(255).allow("", null).label("location"),
//       status: Joi.string().valid("new", "used", "repaired", "broken", "installed").default("new").label("status"),
//       count: Joi.number().integer().min(0).required().label("count"),
//       description: Joi.string().max(255).allow("", null).label("description"),
//       last_updated_by: Joi.number().integer().min(1).required().label("user ID"),
//       barcode: Joi.string().max(255).allow("", null).label("barcode"),
//     });

//     const { error, value } = product_schema.validate(req.body, { abortEarly: false });

//     if (error) {
//       return res.status(400).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: error.details[0].message,
//       });
//     }

//     // Verify article profile exists
//     const article_check = await do_ma_query(
//       "SELECT COUNT(*) AS count FROM article_profile WHERE art_prof_uuid = ?",
//       [value.article_profile_id]
//     );

//     if (article_check[0].count === 0) {
//       return res.status(404).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Article profile not found",
//       });
//     }

//     // Verify warehouse exists
//     const warehouse_check = await do_ma_query(
//       "SELECT COUNT(*) AS count FROM warehouse WHERE id = ?",
//       [value.warehouse_id]
//     );

//     if (warehouse_check[0].count === 0) {
//       return res.status(404).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Warehouse not found",
//       });
//     }

//     // Verify user exists
//     const user_check = await do_ma_query(
//       "SELECT COUNT(*) AS count FROM users WHERE id = ?",
//       [value.last_updated_by]
//     );

//     if (user_check[0].count === 0) {
//       return res.status(404).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "User not found",
//       });
//     }

//     let barcodeNumber;
//     let barcodeImagePath;
//     let barcodeSource = 'generated';

//     // Determine barcode source
//     if (value.barcode && value.barcode.trim() !== "") {
//       // SCENARIO 1: Scanned barcode provided
//       barcodeNumber = value.barcode.trim();
//       barcodeSource = 'scanned';
      
//       // CRITICAL: Always check for duplicates in production
//       const barcode_check = await do_ma_query(
//         "SELECT id, title FROM product WHERE barcode = ?",
//         [barcodeNumber]
//       );

//       if (barcode_check.length > 0) {
//         return res.status(409).json({
//           success: false,
//           timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//           message: "Product with this barcode already exists",
//           data: {
//             existing_product_id: barcode_check[0].id,
//             existing_product_title: barcode_check[0].title,
//           },
//         });
//       }

//       // Generate barcode image for the scanned barcode
//       try {
//         barcodeImagePath = await generateBarcodeImage(barcodeNumber);
//       } catch (barcodeError) {
//         console.error("Error generating barcode image:", barcodeError);
//         return res.status(500).json({
//           success: false,
//           timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//           message: "Error generating barcode image",
//         });
//       }
//     } else {
//       // SCENARIO 2: Auto-generate barcode from title
//       if (!value.title || value.title.trim() === "") {
//         return res.status(400).json({
//           success: false,
//           timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//           message: "Product title is required when barcode is not provided",
//         });
//       }

//       barcodeNumber = generateBarcodeNumber(value.title);
//       barcodeSource = 'generated';

//       try {
//         barcodeImagePath = await generateBarcodeImage(barcodeNumber);
//       } catch (barcodeError) {
//         console.error("Error generating barcode:", barcodeError);
//         return res.status(500).json({
//           success: false,
//           timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//           message: "Error generating barcode",
//         });
//       }
//     }

//     // Insert product
//     const product_insert_res = await do_ma_query(
//       `INSERT INTO product
//         (title, article_profile_id, warehouse_id, location, status, count, barcode, barcode_image,
//          description, created_at, updated_at, last_updated_by)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
//       [
//         value.title || `Product-${barcodeNumber}`, // Fallback title
//         value.article_profile_id,
//         value.warehouse_id,
//         value.location || null,
//         value.status,
//         value.count,
//         barcodeNumber,
//         barcodeImagePath,
//         value.description || null,
//         value.last_updated_by,
//       ]
//     );

//     if (product_insert_res.affectedRows === 1) {
//       const [warehouse] = await do_ma_query(
//         "SELECT title FROM warehouse WHERE id = ?",
//         [value.warehouse_id]
//       );

//       await logActivity({
//         activity_type: 'product',
//         action: 'created',
//         entity_id: product_insert_res.insertId,
//         entity_name: value.title || `Product-${barcodeNumber}`,
//         description: `"${value.title || `Product-${barcodeNumber}`}" created with ${value.count} items (${barcodeSource} barcode)`,
//         user_id: req.user?.id || value.last_updated_by,
//         user_name: req.user?.name || 'System',
//         warehouse_id: value.warehouse_id,
//         warehouse_name: warehouse[0]?.title || 'Unknown',
//         metadata: {
//           barcode: barcodeNumber,
//           barcode_source: barcodeSource,
//           status: value.status,
//           count: value.count,
//         },
//       });

//       res.status(201).json({
//         success: true,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Product created successfully",
//         data: {
//           id: product_insert_res.insertId,
//           barcode: barcodeNumber,
//           barcode_image: barcodeImagePath,
//           barcode_source: barcodeSource,
//         },
//       });
//     } else {
//       res.status(500).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Product creation failed",
//       });
//     }
//   } catch (err) {
//     console.error("Error creating product:", err);
//     res.status(500).json({
//       success: false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message: "Internal server error",
//     });
//   }
// };


export const createProduct = async (req, res) => {
  try {
    const product_schema = Joi.object({
      title: Joi.string().min(3).max(127).label("product title"),
      article_profile_id: Joi.string().guid({version: ["uuidv7"]}).required().label("article profile ID"),
      warehouse_id: Joi.number().integer().min(1).required().label("warehouse ID"),
      location: Joi.string().max(255).allow("", null).label("location"),
      in_wh_location: Joi.string().max(255).allow("", null).label("in warehouse location"),
      status: Joi.string().valid("new", "used", "repaired", "broken", "installed").default("new").label("status"),
      count: Joi.number().integer().min(0).required().label("count"),
      description: Joi.string().max(255).allow("", null).label("description"),
      last_updated_by: Joi.number().integer().min(1).required().label("user ID"),
      barcode: Joi.string().max(255).allow("", null).label("barcode"),
      lot_id: Joi.string().max(50).allow("", null).label("lot ID"), // NEW FIELD
    });

    const { error, value } = product_schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

    // ... existing validation code ...

    let barcodeNumber;
    let barcodeImagePath;
    let barcodeSource = 'generated';

    if (value.barcode && value.barcode.trim() !== "") {
      barcodeNumber = value.barcode.trim();
      barcodeSource = 'scanned';
      
      const barcode_check = await do_ma_query(
        "SELECT id, title FROM product WHERE barcode = ?",
        [barcodeNumber]
      );

      if (barcode_check.length > 0) {
        return res.status(409).json({
          success: false,
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
          message: "Product with this barcode already exists",
          data: {
            existing_product_id: barcode_check[0].id,
            existing_product_title: barcode_check[0].title,
          },
        });
      }

      try {
        barcodeImagePath = await generateBarcodeImage(barcodeNumber);
      } catch (barcodeError) {
        console.error("Error generating barcode image:", barcodeError);
        return res.status(500).json({
          success: false,
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
          message: "Error generating barcode image",
        });
      }
    } else {
      if (!value.title || value.title.trim() === "") {
        return res.status(400).json({
          success: false,
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
          message: "Product title is required when barcode is not provided",
        });
      }

      barcodeNumber = generateBarcodeNumber(value.title);
      barcodeSource = 'generated';

      try {
        barcodeImagePath = await generateBarcodeImage(barcodeNumber);
      } catch (barcodeError) {
        console.error("Error generating barcode:", barcodeError);
        return res.status(500).json({
          success: false,
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
          message: "Error generating barcode",
        });
      }
    }

    // ✅ UPDATED: Insert product with lot_id
    const product_insert_res = await do_ma_query(
      `INSERT INTO product
        (title, article_profile_id, warehouse_id, location, status, count, barcode, barcode_image,
         description, lot_id, created_at, updated_at, last_updated_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
      [
        value.title || `Product-${barcodeNumber}`,
        value.article_profile_id,
        value.warehouse_id,
        value.in_wh_location || null,
        value.status,
        value.count,
        barcodeNumber,
        barcodeImagePath,
        value.description || null,
        value.lot_id || null, // ✅ NEW: Store lot_id
        value.last_updated_by,
      ]
    );

    if (product_insert_res.affectedRows === 1) {
      const [warehouse] = await do_ma_query(
        "SELECT title FROM warehouse WHERE id = ?",
        [value.warehouse_id]
      );

      await logActivity({
        activity_type: 'product',
        action: 'created',
        entity_id: product_insert_res.insertId,
        entity_name: value.title || `Product-${barcodeNumber}`,
        description: `"${value.title || `Product-${barcodeNumber}`}" created with ${value.count} items (${barcodeSource} barcode)${value.lot_id ? ` in lot ${value.lot_id}` : ''}`,
        user_id: req.user?.id || value.last_updated_by,
        user_name: req.user?.name || 'System',
        warehouse_id: value.warehouse_id,
        warehouse_name: warehouse[0]?.title || 'Unknown',
        metadata: {
          barcode: barcodeNumber,
          barcode_source: barcodeSource,
          status: value.status,
          count: value.count,
          lot_id: value.lot_id || null,
        },
      });

      res.status(201).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Product created successfully",
        data: {
          id: product_insert_res.insertId,
          barcode: barcodeNumber,
          barcode_image: barcodeImagePath,
          barcode_source: barcodeSource,
          lot_id: value.lot_id || null,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Product creation failed",
      });
    }
  } catch (err) {
    console.error("Error creating product:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
    });
  }
};

// Bulk Create Products API - Add this to your product controller


export const bulkCreateProductsWithLot = async (req, res) => {
  try {
    let { products, lot_id } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Products array is required and cannot be empty",
      });
    }

    if (products.length > 100) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Maximum 100 products allowed per bulk creation",
      });
    }

    const userId = req.user?.id || 1;

    // Validation schema
    const product_schema = Joi.object({
      title: Joi.string().min(3).max(127).allow("", null).label("product title"),
      article_profile_id: Joi.string().guid({ version: ["uuidv7"] }).required().label("article profile ID"),
      warehouse_id: Joi.number().integer().min(1).required().label("warehouse ID"),
      location: Joi.string().max(255).allow("", null).label("location"),
      in_wh_location: Joi.string().max(255).allow("", null).label("in warehouse location"),
      status: Joi.string().valid("new", "used", "repaired", "broken", "installed").default("new").label("status"),
      count: Joi.number().integer().min(0).default(1).label("count"),
      description: Joi.string().max(255).allow("", null).label("description"),
      last_updated_by: Joi.number().integer().min(1).required().label("user ID"),
      barcode: Joi.string().max(255).required().label("barcode"),
    });

    // Validate all products
    const validatedProducts = [];
    const validationErrors = [];

    for (let i = 0; i < products.length; i++) {
      const { error, value } = product_schema.validate(products[i], { abortEarly: false });
      
      if (error) {
        validationErrors.push({
          index: i,
          barcode: products[i].barcode || "unknown",
          errors: error.details.map(detail => detail.message),
        });
      } else {
        validatedProducts.push(value);
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: `Validation failed for ${validationErrors.length} product(s)`,
        errors: validationErrors,
      });
    }

    // Verify entities exist
    const articleProfileIds = [...new Set(validatedProducts.map(p => p.article_profile_id))];
    const warehouseIds = [...new Set(validatedProducts.map(p => p.warehouse_id))];
    const userIds = [...new Set(validatedProducts.map(p => p.last_updated_by))];

    const article_check = await do_ma_query(
      `SELECT art_prof_uuid FROM article_profile WHERE art_prof_uuid IN (?)`,
      [articleProfileIds]
    );

    const existingArticleIds = article_check.map(row => row.art_prof_uuid);
    const missingArticleIds = articleProfileIds.filter(id => !existingArticleIds.includes(id));

    if (missingArticleIds.length > 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "One or more article profiles not found",
        missing_article_profile_ids: missingArticleIds,
      });
    }

    const warehouse_check = await do_ma_query(
      `SELECT id FROM warehouse WHERE id IN (?)`,
      [warehouseIds]
    );

    const existingWarehouseIds = warehouse_check.map(row => row.id);
    const missingWarehouseIds = warehouseIds.filter(id => !existingWarehouseIds.includes(id));

    if (missingWarehouseIds.length > 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "One or more warehouses not found",
        missing_warehouse_ids: missingWarehouseIds,
      });
    }

    const user_check = await do_ma_query(
      `SELECT id FROM users WHERE id IN (?)`,
      [userIds]
    );

    const existingUserIds = user_check.map(row => row.id);
    const missingUserIds = userIds.filter(id => !existingUserIds.includes(id));

    if (missingUserIds.length > 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "One or more users not found",
        missing_user_ids: missingUserIds,
      });
    }

    // Check for duplicate barcodes
    const barcodes = validatedProducts.map(p => p.barcode.trim());
    const duplicateBarcodes = barcodes.filter((barcode, index) => barcodes.indexOf(barcode) !== index);
    
    if (duplicateBarcodes.length > 0) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Duplicate barcodes found in request",
        duplicate_barcodes: [...new Set(duplicateBarcodes)],
      });
    }

    const existing_barcode_check = await do_ma_query(
      `SELECT barcode, id, title FROM product WHERE barcode IN (?)`,
      [barcodes]
    );

    if (existing_barcode_check.length > 0) {
      return res.status(409).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "One or more barcodes already exist in the database",
        existing_products: existing_barcode_check.map(row => ({
          barcode: row.barcode,
          id: row.id,
          title: row.title,
        })),
      });
    }

    // Generate barcode images and prepare products
    const productsToInsert = [];
    const barcodeGenerationErrors = [];

    for (let i = 0; i < validatedProducts.length; i++) {
      const product = validatedProducts[i];
      
      try {
        const barcodeNumber = product.barcode.trim();
        let barcodeImagePath;

        try {
          barcodeImagePath = await generateBarcodeImage(barcodeNumber);
        } catch (barcodeError) {
          barcodeGenerationErrors.push({
            index: i,
            barcode: barcodeNumber,
            error: "Failed to generate barcode image",
          });
          continue;
        }

        productsToInsert.push({
          title: product.title || null,
          article_profile_id: product.article_profile_id,
          warehouse_id: product.warehouse_id,
          location: product.in_wh_location || null,
          status: product.status || "new",
          count: product.count || 1,
          barcode: barcodeNumber,
          barcode_image: barcodeImagePath,
          description: product.description || null,
          last_updated_by: product.last_updated_by,
          lot_id: lot_id || null,
        });
      } catch (error) {
        barcodeGenerationErrors.push({
          index: i,
          barcode: product.barcode,
          error: error.message,
        });
      }
    }

    if (barcodeGenerationErrors.length > 0) {
      return res.status(500).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: `Failed to generate barcodes for ${barcodeGenerationErrors.length} product(s)`,
        errors: barcodeGenerationErrors,
      });
    }

    // Insert all products
    const insertPromises = productsToInsert.map(product => 
      do_ma_query(
        `INSERT INTO product
          (title, article_profile_id, warehouse_id, location, status, count, barcode, barcode_image,
           description, lot_id, created_at, updated_at, last_updated_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), ?)`,
        [
          product.title,
          product.article_profile_id,
          product.warehouse_id,
          product.location,
          product.status,
          product.count,
          product.barcode,
          product.barcode_image,
          product.description,
          product.lot_id,
          product.last_updated_by,
        ]
      )
    );

    const insertResults = await Promise.all(insertPromises);

    // Update lot status to 'submitted'
    if (lot_id) {
      await do_ma_query(
        `UPDATE product_lots_upload SET 
          lot_status = 'submitted',
          submitted_at = NOW(),
          total_products = ?
        WHERE lot_id = ?`,
        [productsToInsert.length, lot_id]
      );
    }

    // Log activities
    const warehouseNames = await do_ma_query(
      `SELECT id, title FROM warehouse WHERE id IN (?)`,
      [[...new Set(validatedProducts.map(p => p.warehouse_id))]]
    );

    const warehouseMap = {};
    warehouseNames.forEach(wh => {
      warehouseMap[wh.id] = wh.title;
    });

    const activityPromises = productsToInsert.map((product, index) => 
      logActivity({
        activity_type: 'product',
        action: 'created',
        entity_id: insertResults[index].insertId,
        entity_name: product.title,
        description: `"${product.title}" created with ${product.count} items (bulk creation - scanned barcode)${lot_id ? ` in lot ${lot_id}` : ''}`,
        user_id: req.user?.id || product.last_updated_by,
        user_name: req.user?.name || 'System',
        warehouse_id: product.warehouse_id,
        warehouse_name: warehouseMap[product.warehouse_id] || 'Unknown',
        metadata: {
          barcode: product.barcode,
          barcode_source: 'scanned',
          status: product.status,
          count: product.count,
          bulk_creation: true,
          lot_id: lot_id || null,
        },
      })
    );

    await Promise.all(activityPromises);

    const createdProducts = productsToInsert.map((product, index) => ({
      id: insertResults[index].insertId,
      barcode: product.barcode,
      title: product.title,
      status: product.status,
    }));

    res.status(201).json({
      success: true,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: `Successfully created ${createdProducts.length} products${lot_id ? ` and submitted lot ${lot_id}` : ''}`,
      data: {
        total_created: createdProducts.length,
        products: createdProducts,
        lot_id: lot_id || null,
        lot_status: lot_id ? 'submitted' : null,
      },
    });

  } catch (err) {
    console.error("Error in bulk product creation:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error during bulk product creation",
      error: err.message,
    });
  }
};


// export const bulkCreateProducts = async (req, res) => {
//   try {
//     const productSchema = Joi.object({
//       title: Joi.string().min(3).max(127).label("product title").required(),
//       article_profile_id: Joi.string().guid({ version: ["uuidv7"] }).required().label("article profile ID"),
//       warehouse_id: Joi.number().integer().min(1).required().label("warehouse ID"),
//       count: Joi.number().integer().min(0).required().label("count"),
//       status: Joi.string().valid("new", "used", "repaired", "broken", "installed").default("new").label("status"),
//       description: Joi.string().max(255).allow("", null).label("description"),
//       last_updated_by: Joi.number().integer().min(1).required().label("user ID"),
//     });

//     const { products } = req.body;
//     const userId = req.user?.id || 'System';

//     if (!Array.isArray(products) || products.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: 'Products array is required and cannot be empty'
//       });
//     }

//     if (products.length > 5000) {
//       return res.status(400).json({
//         success: false,
//         message: 'Maximum 5000 products can be uploaded at once'
//       });
//     }

//     const createdProducts = [];
//     const failedProducts = [];
//     const duplicateBarcodes = [];


//     for (let i = 0; i < products.length; i++) {
//       const productData = products[i];


//       const { error } = productSchema.validate(productData, { abortEarly: false });

//       if (error) {
//         failedProducts.push({
//           index: i + 1,
//           data: productData,
//           error: error.details.map(e => e.message).join(', ')
//         });
//         continue;
//       }

//       try {
        
//         const baseName = productData.title || `Product_${Date.now()}_${i}`;
//         const barcode = generateBarcodeNumber(baseName);

    
//         const existingProduct = await do_ma_query(
//           "SELECT id, title FROM product WHERE barcode = ?",
//           [barcode]
//         );

//         if (existingProduct.length > 0) {
//           duplicateBarcodes.push({
//             index: i + 1,
//             barcode: barcode,
//             title: baseName,
//             reason: 'Barcode already exists in system'
//           });
//           continue;
//         }

      
//         let barcodeImagePath;
//         try {
//           barcodeImagePath = await generateBarcodeImage(barcode);
//         } catch (barcodeError) {
//           console.error(`Failed to generate barcode image:`, barcodeError);
//           barcodeImagePath = null;
//         }

        
//         const insertResult = await do_ma_query(
//           `INSERT INTO product
//             (title, article_profile_id, warehouse_id, count, status, 
//              barcode, barcode_image, last_updated_by, created_at, updated_at)
//            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
//           [
//             baseName,
//             productData.article_profile_id,
//             productData.warehouse_id || null,
//             productData.count || 0,
//             productData.status || 'new',
//             barcode,
//             barcodeImagePath,
//             productData.last_updated_by || userId
//           ]
//         );

//         if (insertResult.affectedRows === 1) {
//           createdProducts.push({
//             id: insertResult.insertId,
//             title: baseName,
//             barcode: barcode
//           });
//         }

//       } catch (error) {
//         console.error(`Error creating product at index ${i}:`, error);
//         failedProducts.push({
//           index: i + 1,
//           data: productData,
//           error: error.message
//         });
//       }
//     }

//     const response = {
//       success: true,
//       message: 'Bulk upload completed',
//       summary: {
//         total: products.length,
//         created: createdProducts.length,
//         failed: failedProducts.length,
//         duplicates: duplicateBarcodes.length
//       },
//       data: createdProducts,
//     };

//     if (failedProducts.length > 0) {
//       response.failedProducts = failedProducts;
//     }

//     if (duplicateBarcodes.length > 0) {
//       response.duplicateBarcodes = duplicateBarcodes;
//     }

//     return res.status(createdProducts.length > 0 ? 201 : 400).json(response);

//   } catch (error) {
//     console.error('Error in bulk product creation:', error);
//     return res.status(500).json({
//       success: false,
//       message: 'Failed to process bulk upload',
//       error: error.message
//     });
//   }
// };





export const updateProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product_schema = Joi.object({
      title: Joi.string().min(3).max(127).required().label("product title"),
      article_profile_id:
      Joi.string().guid({version: ["uuidv7"]}).required().label("article profile ID"),
      warehouse_id: Joi.number().integer().min(1).required().label("warehouse ID"),
      location: Joi.string().max(255).allow("", null).label("location"),
      status: Joi.string()
        .valid("new", "used", "repaired", "broken", "installed")
        .required()
        .label("status"),
      count: Joi.number().integer().min(0).required().label("count"),
      description: Joi.string().max(255).allow("", null).label("description"),
      // last_updated_by: Joi.number().integer().min(1).required().label("user ID"),
    });

    const { error, value } = product_schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

        
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Unauthorized",
      });
      
    }

    // Check if product exists
    const product_check = await do_ma_query("SELECT * FROM product WHERE id = ?", [id]);

    if (product_check.length === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Product not found",
      });
    }

    const oldProduct = product_check[0];

    // Verify article profile exists
    const article_check = await do_ma_query("SELECT COUNT(*) AS count FROM article_profile WHERE art_prof_uuid = ?", [
      value.article_profile_id,
    ]);

    if (article_check[0].count === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Article profile not found",
      });
    }

    // Verify warehouse exists
    const warehouse_check = await do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE id = ?", [
      value.warehouse_id,
    ]);

    if (warehouse_check[0].count === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse not found",
      });
    }

  
    const product_update_res = await do_ma_query(
      `UPDATE product SET
        title = ?, article_profile_id = ?, warehouse_id = ?, location = ?, 
        status = ?, count = ?, description = ?, updated_at = NOW(), last_updated_by = ?
      WHERE id = ?`,
      [
        value.title,
        value.article_profile_id,
        value.warehouse_id,
        value.location || null,
        value.status,
        value.count,
        value.description || null,
        req.user.id,
        // value.last_updated_by,
        id,
      ]
    );

        if (product_update_res.changedRows === 0) {
      return res.status(200).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "No changes detected",
      });
        }

    if (product_update_res.affectedRows === 1) {
        const [warehouse] = await do_ma_query(
        "SELECT title FROM warehouse WHERE id = ?",
        [value.warehouse_id]
      );


      // const [user] = await do_ma_query(
      //   "SELECT name FROM users WHERE id = ?",
      //   [value.last_updated_by]
      // );

  
      const changes = [];
      if (oldProduct.count !== value.count) {
        changes.push(`count: ${oldProduct.count} → ${value.count}`);
      }
      if (oldProduct.status !== value.status) {
        changes.push(`status: ${oldProduct.status} → ${value.status}`);
      }

      await logActivity({
        activity_type: 'product',
        action: 'updated',
        entity_id: id,
        entity_name: value.title,
        description: `"${value.title}" updated${changes.length ? ': ' + changes.join(', ') : ''}`,
        user_id: req.user?.id || null,
        user_name:req.user?.name || 'System',
        warehouse_id: value.warehouse_id,
        warehouse_name: warehouse[0]?.title || 'System',
        metadata: {
          changes: changes,
          old_count: oldProduct.count,
          new_count: value.count
        }
      });

      res.status(200).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Product updated successfully",
      });
    }
  } catch (err) {
    console.error("Error updating product:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
    });
  }
};

// DELETE product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const id_schema = Joi.object({
      id: Joi.number().integer().min(1).required().label("product ID"),
    });

    const { error } = id_schema.validate({ id }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

    // Check if product exists and get barcode path
    // const product_check = await do_ma_query("SELECT barcode FROM product WHERE id = ?", [id]);
        const product_check = await do_ma_query(
      "SELECT p.*, w.title as warehouse_name FROM product p LEFT JOIN warehouse w ON p.warehouse_id = w.id WHERE p.id = ?",
      [id]
    );

    if (product_check.length === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Product not found",
      });
    }

      const product = product_check[0];

    // Delete barcode file if exists
    const barcodePath = product_check[0].barcode;
    if (barcodePath) {
      const fullPath = path.join(__dirname, "..", barcodePath);
      if (fs.existsSync(fullPath)) {
        try {
          fs.unlinkSync(fullPath);
        } catch (fileError) {
          console.error("Error deleting barcode file:", fileError);
        }
      }
    }

    // Delete product
    const product_delete_res = await do_ma_query("DELETE FROM product WHERE id = ?", [id]);

    if (product_delete_res.affectedRows === 1) {
     const [user] = await do_ma_query(
        "SELECT name FROM users WHERE id = ?",
        [product.last_updated_by]
      );

      await logActivity({
        activity_type: 'product',
        action: 'deleted',
        entity_id: id,
        entity_name: product.title,
        description: `"${product.title}" deleted (had ${product.count} items)`,
        user_id:  req.user?.id,
        user_name: req.user?.name  || 'Unknown',
        warehouse_id: product.warehouse_id,
        warehouse_name: product.warehouse_name || 'Unknown',
        metadata: {
          barcode: product.barcode,
          final_count: product.count
        }
      });

      res.status(200).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Product deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Product deletion failed",
      });
    }
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
    });
  }
};






// Generate Lot ID
export function generateLotId() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `LOT-${timestamp}-${randomStr}`;
}
 




export const saveLot = async (req, res) => {
  try {
    const lot_schema = Joi.object({
      lot_id: Joi.string().max(50).label("lot ID"),
      article_profile_id: Joi.string().guid({ version: ["uuidv7"] }).required().label("article profile ID"),
      warehouse_id: Joi.number().integer().min(1).required().label("warehouse ID"),
      in_wh_location: Joi.string().max(255).allow("", null).label("in warehouse location"),
      from_location: Joi.string().max(255).allow("", null).label("from location"),
      transport: Joi.string().valid("bus", "courier", "employee", "transport_co").allow("", null).label("transport"),
      product_status: Joi.string().valid("new", "used", "repaired", "broken", "installed").default("new").label("product status"),
      total_products: Joi.number().integer().min(0).default(0).label("total products"),
      products_draft: Joi.string().allow("", null).label("products draft JSON"),
    });

    const { error, value } = lot_schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

    const userId = req.user?.id;
    const lotId = value.lot_id || generateLotId();

    let productsDraftJson = null;
    if (value.products_draft) {
      try {
        const parsedProducts = JSON.parse(value.products_draft);
        productsDraftJson = JSON.stringify(parsedProducts);
      } catch (parseError) {
        return res.status(400).json({
          success: false,
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
          message: "Invalid products_draft JSON format",
        });
      }
    }

    
    let invoiceFilePath = null;
    if (req.file) {
      invoiceFilePath = `/uploads/invoices/${req.file.filename}`;
    }

  
    const existingLot = await do_ma_query(
      "SELECT * FROM product_lots_upload WHERE lot_id = ?",
      [lotId]
    );

    let result;
    if (existingLot.length > 0) {
    
      const updateFields = [
        value.article_profile_id,
        value.warehouse_id,
        value.in_wh_location || null,
        value.from_location || null,
        value.transport || null,
        value.product_status || 'new',
        value.total_products,
        productsDraftJson,
      ];

      let updateQuery = `UPDATE product_lots_upload SET 
        article_profile_id = ?,
        warehouse_id = ?,
        in_wh_location = ?,
        from_location = ?,
        transport = ?,
        product_status = ?,
        total_products = ?,
        products_draft = ?`;

      if (invoiceFilePath) {
        updateQuery += `, invoice_file = ?`;
        updateFields.push(invoiceFilePath);
      }

      updateQuery += `, updated_at = NOW() WHERE lot_id = ? AND lot_status = 'draft'`;
      updateFields.push(lotId);

      result = await do_ma_query(updateQuery, updateFields);

      if (result.affectedRows === 0) {
        return res.status(400).json({
          success: false,
          timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
          message: "Cannot update submitted lot",
        });
      }
    } else {
    
      result = await do_ma_query(
        `INSERT INTO product_lots_upload 
          (lot_id, article_profile_id, warehouse_id, in_wh_location, from_location, 
           invoice_file, transport, product_status, total_products, products_draft, lot_status, 
           created_by, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', ?, NOW(), NOW())`,
        [
          lotId,
          value.article_profile_id,
          value.warehouse_id,
          value.in_wh_location || null,
          value.from_location || null,
          invoiceFilePath,
          value.transport || null,
          value.product_status || 'new',
          value.total_products,
          productsDraftJson,
          userId
        ]
      );
    }

    res.status(200).json({
      success: true,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: existingLot.length > 0 ? "Lot updated successfully" : "Lot created successfully",
      data: {
        lot_id: lotId,
        status: 'draft',
        products_count: productsDraftJson ? JSON.parse(productsDraftJson).length : 0,
        invoice_file: invoiceFilePath
      },
    });
  } catch (err) {
    console.error("Error saving lot:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
      error: err.message,
    });
  }
};


export const getLotById = async (req, res) => {
  try {
    const { lot_id } = req.params;

    const lotQuery = `
      SELECT 
        l.*,
        ap.title as article_profile_name,
        w.title as warehouse_name,
        u.name as created_by_name
      FROM product_lots_upload l
      LEFT JOIN article_profile ap ON l.article_profile_id = ap.art_prof_uuid
      LEFT JOIN warehouse w ON l.warehouse_id = w.id
      LEFT JOIN users u ON l.created_by = u.id
      WHERE l.lot_id = ?
    `;

    const lots = await do_ma_query(lotQuery, [lot_id]);

    if (lots.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Lot not found",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    const lot = lots[0];

    // Parse products_draft JSON
    let productsDraft = [];
    if (lot.products_draft) {
      try {
        productsDraft = JSON.parse(lot.products_draft);
      } catch (parseError) {
        console.error("Error parsing products_draft:", parseError);
        productsDraft = [];
      }
    }

    // Get submitted products if lot is submitted
    let submittedProducts = [];
    if (lot.lot_status === 'submitted') {
      const productsQuery = `
        SELECT 
          p.*,
          ap.title as article_profile_name,
          w.title as warehouse_name
        FROM product p
        LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
        LEFT JOIN warehouse w ON p.warehouse_id = w.id
        WHERE p.lot_id = ?
        ORDER BY p.created_at ASC
      `;
      submittedProducts = await do_ma_query(productsQuery, [lot_id]);
    }

    res.status(200).json({
      success: true,
      data: {
        lot: lot,
        products_draft: productsDraft,
        products: submittedProducts
      },
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching lot:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lot",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};


export const getLots = async (req, res) => {
  try {
    const userId = req.user?.id;
    const { status = 'all' } = req.query;

    let whereClause = "WHERE l.created_by = ?";
    let queryParams = [userId];

    if (status !== 'all') {
      whereClause += " AND l.lot_status = ?";
      queryParams.push(status);
    }

    const query = `
      SELECT 
        l.*,
        ap.title as article_profile_name,
        w.title as warehouse_name,
        u.name as created_by_name,
        COUNT(p.id) as actual_product_count
      FROM product_lots_upload l
      LEFT JOIN article_profile ap ON l.article_profile_id = ap.art_prof_uuid
      LEFT JOIN warehouse w ON l.warehouse_id = w.id
      LEFT JOIN users u ON l.created_by = u.id
      LEFT JOIN product p ON l.lot_id = p.lot_id
      ${whereClause}
      GROUP BY l.id
      ORDER BY l.created_at DESC
    `;

    const lots = await do_ma_query(query, queryParams);


    const lotsWithCounts = lots.map(lot => {
      let draftCount = 0;
      if (lot.products_draft) {
        try {
          const parsed = JSON.parse(lot.products_draft);
          draftCount = Array.isArray(parsed) ? parsed.length : 0;
        } catch (e) {
          draftCount = 0;
        }
      }

      return {
        ...lot,
        draft_products_count: draftCount
      };
    });

    res.status(200).json({
      success: true,
      data: lotsWithCounts,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching lots:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching lots",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};


// ============================================
// deleteLot - Delete lot (only drafts)
// ============================================
export const deleteLot = async (req, res) => {
  try {
    const { lot_id } = req.params;
    const userId = req.user?.id;

    // Check if lot exists and is a draft
    const lotCheck = await do_ma_query(
      "SELECT * FROM product_lots_upload WHERE lot_id = ? AND created_by = ? AND lot_status = 'draft'",
      [lot_id, userId]
    );

    if (lotCheck.length === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Draft lot not found or already submitted",
      });
    }

    // Delete all products in this lot
    await do_ma_query("DELETE FROM product WHERE lot_id = ?", [lot_id]);

    // Delete the lot
    await do_ma_query("DELETE FROM product_lots_upload WHERE lot_id = ?", [lot_id]);

    res.status(200).json({
      success: true,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Lot and associated products deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting lot:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
    });
  }
};

// SUBMIT lot (mark as submitted)
export const submitLot = async (req, res) => {
  try {
    const { lot_id } = req.params;
    const userId = req.user?.id;

    // Check if lot exists and is a draft
    const lotCheck = await do_ma_query(
      "SELECT * FROM product_lots_upload WHERE lot_id = ? AND created_by = ? AND status = 'draft'",
      [lot_id, userId]
    );

    if (lotCheck.length === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Draft lot not found",
      });
    }

 
    const productCount = await do_ma_query(
      "SELECT COUNT(*) as count FROM product WHERE lot_id = ?",
      [lot_id]
    );

    if (productCount[0].count === 0) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Cannot submit empty lot",
      });
    }

    // Update lot status
    await do_ma_query(
      `UPDATE product_lots_upload SET 
        status = 'submitted',
        submitted_at = NOW(),
        total_products = ?
      WHERE lot_id = ?`,
      [productCount[0].count, lot_id]
    );

    res.status(200).json({
      success: true,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Lot submitted successfully",
      data: {
        lot_id: lot_id,
        total_products: productCount[0].count
      }
    });
  } catch (err) {
    console.error("Error submitting lot:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
    });
  }
};



// // GET article profiles for dropdown
// export const getArticleProfiles = async (req, res) => {
//   try {
//     const query = "SELECT id, title as name FROM article_profile ORDER BY title ASC";
//     const article_profiles = await do_ma_query(query);

//     res.status(200).json({
//       success: true,
//       data: article_profiles,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (error) {
//     console.error("Error fetching article profiles:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching article profiles",
//       error: error.message,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   }
// };


// // GET warehouses for dropdown
// export const getWarehousesForDropdown = async (req, res) => {
//   try {
//     const query = "SELECT id, title as name FROM warehouse WHERE status = 'active' ORDER BY title ASC";
//     const warehouses = await do_ma_query(query);

//     res.status(200).json({
//       success: true,
//       data: warehouses,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (error) {
//     console.error("Error fetching warehouses:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching warehouses",
//       error: error.message,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   }
// };




//LOW STOCKS and OUT OF STOCKS


// export const getLowStockProducts = async (req, res) => {
//   try {
//     const { warehouseFilter } = req;
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       warehouse_id = "",
//       article_profile_id = "",
//       sortBy = "count",
//       sortOrder = "ASC",
//       threshold = 10,
//     } = req.query;

//     const offset = (page - 1) * limit;

//     let whereConditions = ["p.count > 0 AND p.count <= ?"];
//     let queryParams = [threshold];

//     // Apply warehouse filter for Admin users
//     if (warehouseFilter) {
//       whereConditions.push("p.warehouse_id = ?");
//       queryParams.push(warehouseFilter);
//     } else if (warehouse_id) {
//       whereConditions.push("p.warehouse_id = ?");
//       queryParams.push(warehouse_id);
//     }

//     if (search) {
//       whereConditions.push("(p.title LIKE ? OR p.barcode LIKE ?)");
//       queryParams.push(`%${search}%`, `%${search}%`);
//     }

//     if (article_profile_id) {
//       whereConditions.push("p.article_profile_id = ?");
//       queryParams.push(article_profile_id);
//     }

//     const whereClause = "WHERE " + whereConditions.join(" AND ");

//     const allowedSortFields = ["count", "created_at", "title"];
//     const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "count";
//     const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

//     const query = `
//       SELECT 
//         p.*,
//         ap.title as article_profile_name,
//         w.title as warehouse_name,
//         w.location as store_location
//       FROM product p
//       LEFT JOIN article_profile ap ON p.article_profile_id = ap.id
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       ${whereClause}
//       ORDER BY p.${validSortBy} ${validSortOrder}
//       LIMIT ? OFFSET ?
//     `;

//     queryParams.push(parseInt(limit), parseInt(offset));

//     const products = await do_ma_query(query, queryParams);

//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM product p
//       ${whereClause}
//     `;

//     const countResult = await do_ma_query(countQuery, queryParams.slice(0, -2));

//     res.status(200).json({
//       success: true,
//       data: products,
//       pagination: {
//         total: countResult[0].total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(countResult[0].total / limit),
//       },
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (error) {
//     console.error("Error fetching low stock products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching low stock products",
//       error: error.message,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   }
// };




// export const getLowStockProducts = async (req, res) => {
//   try {
//     const { warehouseFilter } = req;
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       warehouse_id = "",
//       article_profile_id = "",
//       sortBy = "count",
//       sortOrder = "ASC",
//       threshold = 10,
//       period = 'all', // 'all', 'daily', 'weekly', 'monthly'
//     } = req.query;

//     const offset = (page - 1) * limit;

//     // Base conditions
//     let whereConditions = ["p.count > 0 AND p.count <= ?"];
//     let queryParams = [threshold];

//     // Period filtering
//     if (period !== 'all') {
//       let dateCondition;
//       switch(period) {
//         case 'daily':
//           dateCondition = "p.updated_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
//           break;
//         case 'weekly':
//           dateCondition = "p.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
//           break;
//         case 'monthly':
//           dateCondition = "p.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
//           break;
//       }
//       if (dateCondition) whereConditions.push(dateCondition);
//     }

//     // Warehouse filter
//     if (warehouseFilter) {
//       whereConditions.push("p.warehouse_id = ?");
//       queryParams.push(warehouseFilter);
//     } else if (warehouse_id) {
//       whereConditions.push("p.warehouse_id = ?");
//       queryParams.push(warehouse_id);
//     }

  
//     if (search) {
//       whereConditions.push("(p.title LIKE ? OR p.barcode LIKE ?)");
//       queryParams.push(`%${search}%`, `%${search}%`);
//     }

//     // Article profile filter
//     if (article_profile_id) {
//       whereConditions.push("p.article_profile_id = ?");
//       queryParams.push(article_profile_id);
//     }

//     const whereClause = "WHERE " + whereConditions.join(" AND ");

//     // Validate sort parameters
//     const allowedSortFields = ["count", "created_at", "updated_at", "title"];
//     const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "count";
//     const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

//     // Main query
//     const query = `
//       SELECT 
//         p.id,
//         p.title,
//         p.barcode,
//         p.count,
//         p.status,
//         p.location,
//         p.updated_at,
//         p.created_at,
//         w.id as warehouse_id,
//         w.title as warehouse_name,
//         ap.id as article_profile_id,
//         ap.title as article_profile_name,
//         CASE 
//           WHEN p.count <= ? THEN 'critical'
//           WHEN p.count <= ? THEN 'warning'
//           ELSE 'low'
//         END as alert_level
//       FROM product p
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       LEFT JOIN article_profile ap ON p.article_profile_id = ap.id
//       ${whereClause}
//       ORDER BY p.${validSortBy} ${validSortOrder}
//       LIMIT ? OFFSET ?
//     `;

//     // Add alert level thresholds (critical = 5, warning = threshold/2)
//     const criticalThreshold = Math.ceil(threshold / 2);
//     const warningThreshold = threshold;
    
//     queryParams.unshift(criticalThreshold, warningThreshold);
//     queryParams.push(parseInt(limit), parseInt(offset));

//     const products = await do_ma_query(query, queryParams);

//     // Count query
//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM product p
//       ${whereClause}
//     `;
//     const countParams = queryParams.slice(2, -2); 
//     const countResult = await do_ma_query(countQuery, countParams);

//     // Get summary statistics
//     const summaryQuery = `
//       SELECT 
//         w.id,
//         w.title as warehouse_name,
//         COUNT(*) as low_stock_count,
//         SUM(p.count) as total_quantity,
//         MIN(p.count) as min_stock,
//         MAX(p.count) as max_stock,
//         AVG(p.count) as avg_stock
//       FROM product p
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       ${whereClause}
//       GROUP BY w.id, w.title
//       ORDER BY low_stock_count DESC
//     `;
//     const summary = await do_ma_query(summaryQuery, countParams);

//     res.status(200).json({
//       success: true,
//       data: products,
//       summary: summary,
//       pagination: {
//         total: countResult[0].total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(countResult[0].total / limit),
//       },
//       filters: {
//         threshold: parseInt(threshold),
//         period: period,
//         warehouse_id: warehouse_id || warehouseFilter || null,
//       },
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (error) {
//     console.error("Error fetching low stock products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching low stock products",
//       error: error.message,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   }
// };

// // GET out of stock products
// export const getOutOfStockProducts = async (req, res) => {
//   try {
//     const { warehouseFilter } = req;
//     const {
//       page = 1,
//       limit = 10,
//       search = "",
//       warehouse_id = "",
//       article_profile_id = "",
//       sortBy = "updated_at",
//       sortOrder = "DESC",
//       period = 'all', // 'all', 'daily', 'weekly', 'monthly'
//     } = req.query;

//     const offset = (page - 1) * limit;

//     // Base conditions
//     let whereConditions = ["p.count = 0"];
//     let queryParams = [];

//     // Period filtering - when product went out of stock
//     if (period !== 'all') {
//       let dateCondition;
//       switch(period) {
//         case 'daily':
//           dateCondition = "p.updated_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)";
//           break;
//         case 'weekly':
//           dateCondition = "p.updated_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)";
//           break;
//         case 'monthly':
//           dateCondition = "p.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)";
//           break;
//       }
//       if (dateCondition) whereConditions.push(dateCondition);
//     }

//     // Warehouse filter
//     if (warehouseFilter) {
//       whereConditions.push("p.warehouse_id = ?");
//       queryParams.push(warehouseFilter);
//     } else if (warehouse_id) {
//       whereConditions.push("p.warehouse_id = ?");
//       queryParams.push(warehouse_id);
//     }

//     // Search filter
//     if (search) {
//       whereConditions.push("(p.title LIKE ? OR p.barcode LIKE ?)");
//       queryParams.push(`%${search}%`, `%${search}%`);
//     }

//     // Article profile filter
//     if (article_profile_id) {
//       whereConditions.push("p.article_profile_id = ?");
//       queryParams.push(article_profile_id);
//     }

//     const whereClause = "WHERE " + whereConditions.join(" AND ");

//     // Validate sort parameters
//     const allowedSortFields = ["updated_at", "created_at", "title"];
//     const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "updated_at";
//     const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

//     // Main query with additional info
//     const query = `
//       SELECT 
//         p.id,
//         p.title,
//         p.barcode,
//         p.count,
//         p.status,
//         p.location,
//         p.updated_at,
//         p.created_at,
//         w.id as warehouse_id,
//         w.title as warehouse_name,
//         ap.id as article_profile_id,
//         ap.title as article_profile_name,
//         DATEDIFF(NOW(), p.updated_at) as days_out_of_stock,
//         u.name as last_updated_by_name
//       FROM product p
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       LEFT JOIN article_profile ap ON p.article_profile_id = ap.id
//       LEFT JOIN users u ON p.last_updated_by = u.id
//       ${whereClause}
//       ORDER BY p.${validSortBy} ${validSortOrder}
//       LIMIT ? OFFSET ?
//     `;

//     queryParams.push(parseInt(limit), parseInt(offset));
//     const products = await do_ma_query(query, queryParams);

//     // Count query
//     const countQuery = `
//       SELECT COUNT(*) as total
//       FROM product p
//       ${whereClause}
//     `;
//     const countParams = queryParams.slice(0, -2);
//     const countResult = await do_ma_query(countQuery, countParams);

//     // Get summary by warehouse
//     const summaryQuery = `
//       SELECT 
//         w.id,
//         w.title as warehouse_name,
//         COUNT(*) as out_of_stock_count,
//         AVG(DATEDIFF(NOW(), p.updated_at)) as avg_days_out_of_stock
//       FROM product p
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       ${whereClause}
//       GROUP BY w.id, w.title
//       ORDER BY out_of_stock_count DESC
//     `;
//     const summary = await do_ma_query(summaryQuery, countParams);

//     res.status(200).json({
//       success: true,
//       data: products,
//       summary: summary,
//       pagination: {
//         total: countResult[0].total,
//         page: parseInt(page),
//         limit: parseInt(limit),
//         totalPages: Math.ceil(countResult[0].total / limit),
//       },
//       filters: {
//         period: period,
//         warehouse_id: warehouse_id || warehouseFilter || null,
//       },
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (error) {
//     console.error("Error fetching out of stock products:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching out of stock products",
//       error: error.message,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   }
// };

// /**
//  * GET Low/Out of Stock Statistics with Chart Data
//  */
// export const getStockAlertStats = async (req, res) => {
//   try {
//     const { warehouseFilter } = req;
//     const { 
//       threshold = 10,
//       period = 'monthly' // 'daily', 'weekly', 'monthly'
//     } = req.query;

//     let whereClause = "";
//     let queryParams = [];

//     if (warehouseFilter) {
//       whereClause = "WHERE p.warehouse_id = ?";
//       queryParams = [warehouseFilter];
//     }

//     // Overall statistics
//     const overallStatsQuery = `
//       SELECT 
//         COUNT(CASE WHEN p.count > 0 AND p.count <= ? THEN 1 END) as low_stock_count,
//         COUNT(CASE WHEN p.count = 0 THEN 1 END) as out_of_stock_count,
//         COUNT(CASE WHEN p.count > ? THEN 1 END) as healthy_stock_count,
//         COUNT(*) as total_products,
//         SUM(CASE WHEN p.count > 0 AND p.count <= ? THEN p.count END) as low_stock_qty,
//         SUM(p.count) as total_stock_qty,
//         COUNT(DISTINCT p.warehouse_id) as affected_warehouses
//       FROM product p
//       ${whereClause}
//     `;
//     const overallParams = [threshold, threshold, threshold, ...queryParams];
//     const [overallStats] = await do_ma_query(overallStatsQuery, overallParams);

//     // Trend data based on period
//     let dateGrouping, dateRange;
//     switch(period) {
//       case 'daily':
//         dateGrouping = 'DATE(p.updated_at)';
//         dateRange = 'INTERVAL 7 DAY';
//         break;
//       case 'weekly':
//         dateGrouping = 'YEARWEEK(p.updated_at, 1)';
//         dateRange = 'INTERVAL 8 WEEK';
//         break;
//       case 'monthly':
//         dateGrouping = 'DATE_FORMAT(p.updated_at, "%Y-%m")';
//         dateRange = 'INTERVAL 6 MONTH';
//         break;
//       default:
//         dateGrouping = 'DATE(p.updated_at)';
//         dateRange = 'INTERVAL 7 DAY';
//     }

//     const trendQuery = `
//       SELECT 
//         ${dateGrouping} as date_key,
//         COUNT(CASE WHEN p.count > 0 AND p.count <= ? THEN 1 END) as low_stock,
//         COUNT(CASE WHEN p.count = 0 THEN 1 END) as out_of_stock,
//         SUM(CASE WHEN p.count > 0 AND p.count <= ? THEN p.count END) as low_stock_qty
//       FROM product p
//       ${whereClause ? whereClause + ' AND' : 'WHERE'} p.updated_at >= DATE_SUB(NOW(), ${dateRange})
//       GROUP BY ${dateGrouping}
//       ORDER BY date_key ASC
//     `;
//     const trendParams = [threshold, threshold, ...queryParams];
//     const trendData = await do_ma_query(trendQuery, trendParams);

//     // Format trend data
//     const formattedTrend = trendData.map(item => ({
//       date: formatDateLabel(item.date_key, period),
//       low_stock: item.low_stock,
//       out_of_stock: item.out_of_stock,
//       low_stock_qty: item.low_stock_qty || 0
//     }));

//     // Warehouse breakdown
//     const warehouseBreakdownQuery = `
//       SELECT 
//         w.id,
//         w.title as warehouse_name,
//         COUNT(CASE WHEN p.count > 0 AND p.count <= ? THEN 1 END) as low_stock,
//         COUNT(CASE WHEN p.count = 0 THEN 1 END) as out_of_stock,
//         SUM(CASE WHEN p.count > 0 AND p.count <= ? THEN p.count END) as low_stock_qty
//       FROM warehouse w
//       LEFT JOIN product p ON p.warehouse_id = w.id
//       ${whereClause ? whereClause.replace('p.warehouse_id', 'w.id') : ''}
//       GROUP BY w.id, w.title
//       HAVING low_stock > 0 OR out_of_stock > 0
//       ORDER BY (low_stock + out_of_stock) DESC
//     `;
//     const warehouseParams = [threshold, threshold, ...queryParams];
//     const warehouseBreakdown = await do_ma_query(warehouseBreakdownQuery, warehouseParams);

//     res.status(200).json({
//       success: true,
//       data: {
//         overall: overallStats,
//         trend: formattedTrend,
//         warehouseBreakdown: warehouseBreakdown,
//         threshold: parseInt(threshold),
//         period: period
//       },
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (error) {
//     console.error("Error fetching stock alert stats:", error);
//     res.status(500).json({
//       success: false,
//       message: "Error fetching statistics",
//       error: error.message,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   }
// };


















