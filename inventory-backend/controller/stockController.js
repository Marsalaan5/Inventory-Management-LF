import pool from '../db.js';
import Joi from "joi";
import { DateTime } from "luxon";
import { do_ma_query } from '../db.js';
import { sendTemplateEmail } from '../services/emailService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { logActivity } from '../services/activityService.js';


fs.mkdirSync('uploads/stock_flow_bills', { recursive: true });
fs.mkdirSync('uploads/delivery_photos', { recursive: true });

const unlinkAsync = promisify(fs.unlink);

// =====================================================
// FILE UPLOAD CONFIG
// =====================================================

const billStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/stock_flow_bills');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `bill-${uniqueSuffix}${ext}`);
  }
});

const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/delivery_photos');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `delivery-${uniqueSuffix}${ext}`);
  }
});

const billFileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
  }
};

const photoFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG and PNG images are allowed.'), false);
  }
};

export const uploadBill = multer({
  storage: billStorage,
  fileFilter: billFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

export const uploadPhoto = multer({
  storage: photoStorage,
  fileFilter: photoFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

// =====================================================
// ENUM OPTIONS CACHE
// =====================================================

let stockFlowOptionsCache = null;

function parseEnumValues(enumType) {
  const matches = enumType.match(/'([^']+)'/g);
  return matches ? matches.map(v => v.replace(/'/g, '')) : [];
}

async function loadStockFlowOptions() {
  if (stockFlowOptionsCache) {
    return stockFlowOptionsCache;
  }

  const columns = await do_ma_query(`
    SHOW COLUMNS
    FROM stock_flow
    WHERE Field IN ('transport','status')
  `);

  const options = {
    transport: [],
    status: [],
    sort: [
      { value: "created_at:DESC", label: "Newest First" },
      { value: "created_at:ASC", label: "Oldest First" },
      { value: "quantity:DESC", label: "Quantity High to Low" },
      { value: "quantity:ASC", label: "Quantity Low to High" },
    ],
  };

  columns.forEach(col => {
    if (col.Type.startsWith("enum(")) {
      const enumValues = parseEnumValues(col.Type);
      options[col.Field] = enumValues.map(value => ({
        value,
        label: formatLabel(value),
      }));
    }
  });

  stockFlowOptionsCache = options;
  return options;
}

function formatLabel(value) {
  const labelMap = {
    'transport_co': 'Transport Company',
    'in-transit': 'In Transit',
    'approved': 'Approved',
    'delivered': 'Delivered',
    'bus': 'Bus',
    'courier': 'Courier',
    'employee': 'Employee',
  };
  return labelMap[value] || value.charAt(0).toUpperCase() + value.slice(1);
}

// =====================================================
// EMAIL NOTIFICATION HELPER
// =====================================================

async function sendStockFlowStatusEmail(stockFlow, userEmail) {
  try {
    const warehouseIds = [stockFlow.from_wh, stockFlow.to_wh].filter(Boolean);

    if (warehouseIds.length === 0) {
      console.log(' No warehouses to send emails to');
      return;
    }

    const warehouses = await do_ma_query(
      'SELECT id, title, email_1 FROM warehouse WHERE id IN (?)',
      [warehouseIds]
    );

    const warehouseMap = {};
    warehouses.forEach(w => warehouseMap[w.id] = w.title);

    const flowPath = `${warehouseMap[stockFlow.from_wh] || '-'} → ${warehouseMap[stockFlow.to_wh] || '-'}`;

    const STATUS_CONFIG = {
      approved: {
        template: 'stock_flow_created',
        subject: 'Stock Flow Created',
      },
      'in-transit': {
        template: 'stock_flow_shipping',
        subject: 'Stock Flow In Transit',
      },
      delivered: {
        template: 'stock_flow_delivered',
        subject: 'Stock Flow Delivered',
      },
    };

    const config = STATUS_CONFIG[stockFlow.status];
    if (!config) {
      console.log(` No email template configured for status: ${stockFlow.status}`);
      return;
    }

    const payload = {
      warehouse_name: '',
      stock_flow_id: stockFlow.id,
      status: formatLabel(stockFlow.status),
      from_wh: warehouseMap[stockFlow.from_wh] || '-',
      to_wh: warehouseMap[stockFlow.to_wh] || '-',
      quantity: stockFlow.quantity,
      transport: formatLabel(stockFlow.transport),
      description: stockFlow.description || '-',
      flow_path: flowPath,
      orderNumber: `SF-${stockFlow.id}`,
      trackingNumber: `TRK-${stockFlow.id}`,
      action_link: `${process.env.FRONTEND_URL}/stock-flows/${stockFlow.id}`,
    };

 
    for (const wh of warehouses) {
      if (!wh.email_1) continue;
      try {
        await sendTemplateEmail(
          config.template,
          wh.email_1,
          { ...payload, warehouse_name: wh.title },
          config.subject
        );
        console.log(` Email sent to ${wh.title} (${wh.email_1})`);
      } catch (err) {
        console.error(` Email failed to ${wh.email_1}:`, err.message);
      }
    }


    if (userEmail) {
      try {
        await sendTemplateEmail(
          config.template,
          userEmail,
          { ...payload, warehouse_name: 'Super Admin' },
          config.subject
        );
        console.log(` Email sent to Super Admin (${userEmail})`);
      } catch (err) {
        console.error(` Email failed to Super Admin:`, err.message);
      }
    }
  } catch (error) {
    console.error('Error in sendStockFlowStatusEmail:', error);

  }
}


// =====================================================
// GET PRODUCT MOVEMENT
// =====================================================


async function logProductMovements(stockFlowId, products, fromWh, toWh, fromLoc, toLoc, userId) {
  try {
    const movements = products.map(product => [
      product.id,
      fromWh || null,
      toWh || null,
      fromLoc || null,
      toLoc || null,
      stockFlowId,
      product.quantity_to_transfer || 1,
      userId,
      new Date(),
      `Product transferred via stock flow #${stockFlowId}`
    ]);

    if (movements.length > 0) {
      await do_ma_query(
        `INSERT INTO product_movement 
          (product_id, from_wh, to_wh, from_loc, to_loc, stock_flow_id, quantity, moved_by, moved_at, remarks)
        VALUES ?`,
        [movements]
      );
    }
  } catch (error) {
    console.error('Error logging product movements:', error);
  }
}

// =====================================================
// GET STOCK FLOW OPTIONS
// =====================================================



export function refreshStockFlowOptionsCache() {
  stockFlowOptionsCache = null;
}  

// =====================================================
// GET STOCK FLOW OPTIONS
// =====================================================

export const getStockFlowOptions = async (req, res) => {
  try {
    const options = await loadStockFlowOptions();
    
    res.status(200).json({
      success: true,
      data: options,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });
  } catch (error) {
    console.error('Error fetching stock flow options:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching options',
      error: error.message,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });
  }
};

// =====================================================
// GET ALL STOCK FLOWS - FIXED WAREHOUSE FILTER
// =====================================================

export const getStockFlows = async (req, res) => {
  try {
    const { warehouseFilter } = req;
    const {
      page = 1,
      limit = 10,
      search = "",
      status = "",
      
      transport = "",
      from_wh = "",
      to_wh = "",
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;

    let whereConditions = [];
    let queryParams = [];

    if (warehouseFilter) {
      whereConditions.push("(sf.from_wh = ? OR sf.to_wh = ?)");
      queryParams.push(warehouseFilter, warehouseFilter);
    }

    if (search) {
      whereConditions.push("(sf.description LIKE ? OR sf.from_loc LIKE ? OR sf.to_loc LIKE ?)");
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status) {
      whereConditions.push("sf.status = ?");
      queryParams.push(status);
    }

    if (transport) {
      whereConditions.push("sf.transport = ?");
      queryParams.push(transport);
    }

    if (from_wh) {
      whereConditions.push("sf.from_wh = ?");
      queryParams.push(from_wh);
    }

    if (to_wh) {
      whereConditions.push("sf.to_wh = ?");
      queryParams.push(to_wh);
    }

    const whereClause = whereConditions.length > 0 ? "WHERE " + whereConditions.join(" AND ") : "";

    const allowedSortFields = ["created_at", "status", "transport", "quantity", "id"];
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : "created_at";
    const validSortOrder = sortOrder.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const query = `
      SELECT 
        sf.*,
        w1.title as from_warehouse_name,
        w2.title as to_warehouse_name
      FROM stock_flow sf
      LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
      LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
      ${whereClause}
      ORDER BY sf.${validSortBy} ${validSortOrder}
      LIMIT ? OFFSET ?
    `;

    queryParams.push(limitNum, offset);

    const stockFlows = await do_ma_query(query, queryParams);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM stock_flow sf
      ${whereClause}
    `;

    const countResult = await do_ma_query(countQuery, queryParams.slice(0, -2));

    
    const stockFlowsWithActions = stockFlows.map(sf => ({
      ...sf,
      actions: {
        can_edit: sf.status === 'approved',
        can_delete: sf.status === 'approved',
        can_dispatch: sf.status === 'approved',
        can_receive: sf.status === 'in-transit',
      }
    }));

  
    res.status(200).json({
      success: true,
      data: stockFlowsWithActions,
      pagination: {
        total: countResult[0].total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(countResult[0].total / limitNum),
      },
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching stock flows:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stock flows",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};
// =====================================================
// GET SINGLE STOCK FLOW BY ID
// =====================================================

export const getStockFlowById = async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouseFilter } = req;

    const id_schema = Joi.object({
      id: Joi.number().integer().min(1).required().label("stock flow ID"),
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

    let query = `
      SELECT 
        sf.*,
        w1.title as from_warehouse_name,
        w2.title as to_warehouse_name
      FROM stock_flow sf
      LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
      LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
      WHERE sf.id = ?
    `;

    const queryParams = [id];

    if (warehouseFilter) {
      query += " AND (sf.from_wh = ? OR sf.to_wh = ?)";
      queryParams.push(warehouseFilter, warehouseFilter);
    }

    const stockFlows = await do_ma_query(query, queryParams);

    if (stockFlows.length === 0) {
      return res.status(404).json({
        success: false,
        message: warehouseFilter ? "Stock flow not found or access denied" : "Stock flow not found",
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

   
    const stockFlowWithActions = {
      ...stockFlows[0],
      actions: {
        can_edit: stockFlows[0].status === 'approved',
        can_delete: stockFlows[0].status === 'approved',
        can_dispatch: stockFlows[0].status === 'approved',
        can_receive: stockFlows[0].status === 'in-transit',
      }
    };

    res.status(200).json({
      success: true,
      data: stockFlowWithActions,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching stock flow:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching stock flow",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

// =====================================================
// CREATE STOCK FLOW WITH PRODUCTS - OPTIMIZED
// =====================================================

export const createStockFlowWithProducts = async (req, res) => {
  const connection = await pool.getConnection();

  const deleteFileSafe = async (filePath) => {
    if (!filePath) return;
    await unlinkAsync(filePath).catch(() => {});
  };

  try {
    await connection.beginTransaction();

    const billFilePath = req.file?.path || null;

   
const schema = Joi.object({
  from_wh: Joi.number().integer().min(1).allow(null),
  to_wh: Joi.number().integer().min(1).allow(null),
  from_loc: Joi.string().max(255).allow(null, ''),
  to_loc: Joi.string().max(255).allow(null, ''),
  transport: Joi.string().valid('bus','courier','employee','transport_co').required(),
  status: Joi.string().valid('approved','in-transit').default('approved'),
  description: Joi.string().max(500).allow(null, ''),
  products: Joi.string().required()
});


    const { error, value } = schema.validate(req.body);
    if (error) {
      await connection.rollback();
      await deleteFileSafe(billFilePath);
      return res.status(400).json({ 
        success: false, 
        message: error.details[0].message,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      });
    }


    if (!value.from_wh && !value.from_loc) {
      throw new Error('Either from_wh or from_loc is required');
    }

    if (!value.to_wh && !value.to_loc) {
      throw new Error('Either to_wh or to_loc is required');
    }

    if (value.from_wh && value.to_wh && value.from_wh === value.to_wh) {
      throw new Error('Source and destination warehouse cannot be same');
    }


    let productsArray;
    try {
      productsArray = JSON.parse(value.products);
    } catch {
      throw new Error('Invalid products JSON');
    }

    if (!Array.isArray(productsArray) || productsArray.length === 0) {
      throw new Error('At least one product required');
    }


    const quantityMap = {};
    for (const p of productsArray) {
      const id = parseInt(p.id);
      const qty = parseInt(p.quantity) || 1;

      if (!id || qty <= 0) {
        throw new Error('Invalid product id or quantity');
      }

      quantityMap[id] = (quantityMap[id] || 0) + qty;
    }

    const productIds = Object.keys(quantityMap).map(Number);

    if (productIds.length === 0) {
      throw new Error('No valid products found');
    }

   
    const placeholders = productIds.map(() => '?').join(',');

    const [productDetails] = await connection.query(
      `SELECT p.id, p.title, p.barcode, p.status, p.warehouse_id,
              ap.title AS article_profile_name,
              w.title AS warehouse_name
       FROM product p
       LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
       LEFT JOIN warehouse w ON w.id = p.warehouse_id
       WHERE p.id IN (${placeholders})
       FOR UPDATE`,
      productIds
    );

    if (productDetails.length !== productIds.length) {
      throw new Error('Some products not found');
    }

  
const ALLOWED_STATUSES = ['new', 'used', 'repaired'];
const invalidStatus = productDetails.find(p => !ALLOWED_STATUSES.includes(p.status));

if (invalidStatus) {
  throw new Error(
    `Product "${invalidStatus.title}" has status "${invalidStatus.status}". ` +
    `Only products with status: ${ALLOWED_STATUSES.join(', ')} can be transferred.`
  );
}

  
    const firstWh = productDetails[0].warehouse_id;
    const mixedWh = productDetails.find(p => p.warehouse_id !== firstWh);
    if (mixedWh) {
      throw new Error('All products must belong to same warehouse');
    }

    if (value.from_wh && firstWh !== value.from_wh) {
      throw new Error('Products do not belong to source warehouse');
    }

   
    const [sfRes] = await connection.query(
      `INSERT INTO stock_flow 
      (from_wh,to_wh,from_loc,to_loc,quantity,transport,status,description,bill_file_path,created_at)
      VALUES (?,?,?,?,?,?,?,?,?,NOW())`,
      [
        value.from_wh || null,
        value.to_wh || null,
        value.from_loc || null,
        value.to_loc || null,
        0,
        value.transport,
        value.status,
        value.description || null,
        billFilePath
      ]
    );

    const stockFlowId = sfRes.insertId;
    let totalQty = 0;

    const productInsertValues = [];
    const updateValues = [];

    for (const p of productDetails) {
      const qty = quantityMap[p.id];
      totalQty += qty;

      productInsertValues.push([
        stockFlowId,
        p.id,
        qty,
        p.title,
        p.barcode || 'N/A',
        p.article_profile_name || 'N/A',
        p.warehouse_name || 'N/A',
        p.status || 'new'
      ]);

      updateValues.push([value.to_wh || null, p.id]);
    }


    await connection.query(
      `INSERT INTO stock_flow_product
       (stock_flow_id, product_id, quantity, product_title, barcode, article_profile_name, warehouse_name, status)
       VALUES ?`,
      [productInsertValues]
    );

    // Batch update product warehouses
    // if (value.to_wh) {
    //   await connection.query(
    //     `UPDATE product SET warehouse_id = ? WHERE id IN (${placeholders})`,
    //     [value.to_wh, ...productIds]
    //   );
    // }


    await connection.query(
      `UPDATE stock_flow SET quantity=? WHERE id=?`,
      [totalQty, stockFlowId]
    );

    const [stockFlowData] = await connection.query(
      `SELECT sf.*, 
              wh_from.title AS from_warehouse_name,
              wh_to.title AS to_warehouse_name
       FROM stock_flow sf
       LEFT JOIN warehouse wh_from ON wh_from.id = sf.from_wh
       LEFT JOIN warehouse wh_to ON wh_to.id = sf.to_wh
       WHERE sf.id = ?`,
      [stockFlowId]
    );

    await connection.commit();



        await logProductMovements(
      stockFlowId,
      productsArray,
      value.from_wh,
      value.to_wh,
      value.from_loc,
      value.to_loc,
      req.user?.id || value.user_id
    );


    const [warehouse_from] = value.from_wh 
      ? await do_ma_query("SELECT title FROM warehouse WHERE id = ?", [value.from_wh])
      : [{ title: value.from_loc }];
    
    const [warehouse_to] = value.to_wh
      ? await do_ma_query("SELECT title FROM warehouse WHERE id = ?", [value.to_wh])
      : [{ title: value.to_loc }];

    await logActivity({
      activity_type: 'stock_flow',
      action: 'created',
      entity_id: stockFlowId,
      entity_name: `SF-${stockFlowId}`,
      description: `Stock flow created: ${totalQty} items from ${warehouse_from?.title || value.from_loc} to ${warehouse_to?.title || value.to_loc}`,
      user_id: req.user?.id || null,
      user_name: req.user?.name || 'System',
      warehouse_id: value.from_wh || null,
      warehouse_name: warehouse_from?.title || value.from_loc,
      metadata: {
        stock_flow_id: stockFlowId,
        from_location: warehouse_from?.title || value.from_loc,
        to_location: warehouse_to?.title || value.to_loc,
        total_quantity: totalQty,
        products_count: productIds.length,
        transport: value.transport,
        status: value.status
      }
    });


    sendStockFlowStatusEmail(stockFlowData[0], req.user?.email_1)
      .catch(err => console.error('Email error:', err));

    res.status(201).json({
      success: true,
      message: 'Stock flow created successfully',
      data: {
        id: stockFlowId,
        total_quantity: totalQty,
        products_count: productIds.length
      },
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });

    
  } catch (err) {
    await connection.rollback();
    await deleteFileSafe(req.file?.path);
    
    console.error('Error creating stock flow:', err);
    res.status(400).json({ 
      success: false, 
      message: err.message,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });
  } finally {
    connection.release();
  }
};

// =====================================================
// GET STOCK FLOW PRODUCTS
// =====================================================

export const getStockFlowProducts = async (req, res) => {
  try {
    const { id } = req.params;

    const id_schema = Joi.object({
      id: Joi.number().integer().min(1).required().label("stock flow ID"),
    });

    const { error } = id_schema.validate({ id }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        data: [],
        message: error.details[0].message,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    const stockFlowCheck = await do_ma_query(
      'SELECT id FROM stock_flow WHERE id = ?',
      [id]
    );

    if (stockFlowCheck.length === 0) {
      return res.status(404).json({
        success: false,
        data: [],
        message: 'Stock flow not found',
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      });
    }

    const products = await do_ma_query(
      `SELECT 
         sfp.id,
         sfp.stock_flow_id,
         sfp.product_id,
         sfp.quantity,
         sfp.product_title,
         sfp.barcode,
         sfp.article_profile_name,
         sfp.warehouse_name,
         sfp.status,
         sfp.created_at,
         p.title AS current_product_title,
         p.count AS current_product_count,
         p.status AS current_product_status
       FROM stock_flow_product sfp
       LEFT JOIN product p ON p.id = sfp.product_id
       WHERE sfp.stock_flow_id = ?
       ORDER BY sfp.id ASC`,
      [id]
    );

    res.status(200).json({
      success: true,
      data: products || [],
      count: products.length,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error fetching stock flow products:', error);
    res.status(500).json({
      success: false,
      data: [],
      message: error.message || 'Failed to fetch stock flow products',
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};


export const updateStockFlowById = async (req, res) => {
  try {
    const { id } = req.params;
    const { warehouseFilter, user } = req;


    const stockflow_schema = Joi.object({
      from_wh: Joi.number().integer().min(1).allow(null),
      to_wh: Joi.number().integer().min(1).allow(null),
      from_loc: Joi.string().max(255).allow("", null),
      to_loc: Joi.string().max(255).allow("", null),
      quantity: Joi.number().integer().min(1),
      transport: Joi.string().valid('bus', 'courier', 'employee', 'transport_co'),
      // status: Joi.string().valid('approved', 'delivered', 'in-transit'),
      description: Joi.string().max(255).allow("", null),
    }).min(1);

    const { error, value } = stockflow_schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

  
    let checkQuery = "SELECT * FROM stock_flow WHERE id = ?";
    const checkParams = [id];

    if (warehouseFilter) {
      checkQuery += " AND (from_wh = ? OR to_wh = ?)";
      checkParams.push(warehouseFilter, warehouseFilter);
    }

    const [currentStockFlow] = await do_ma_query(checkQuery, checkParams);

    if (!currentStockFlow) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: warehouseFilter
          ? "Stock flow not found or access denied"
          : "Stock flow not found",
      });
    }

    const previousStatus = currentStockFlow.status;


if (currentStockFlow.status !== 'approved') {
  const forbiddenFields = ['from_wh', 'to_wh', 'quantity', 'from_loc', 'to_loc'];
  const isTryingToEditStructure = forbiddenFields.some(f => f in value);

  if (isTryingToEditStructure) {
    return res.status(400).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Cannot modify route or quantity after stock flow is dispatched",
    });
  }
}

    let updateQuery = "";
let updateParams = [];

if (currentStockFlow.status === 'approved') {
 
  updateQuery = `
    UPDATE stock_flow SET
      from_wh = ?, 
      to_wh = ?, 
      from_loc = ?, 
      to_loc = ?,
      quantity = ?, 
      transport = ?, 
     
      description = ?
    WHERE id = ?
  `;

  updateParams = [
    value.from_wh ?? currentStockFlow.from_wh,
    value.to_wh ?? currentStockFlow.to_wh,
    value.from_loc ?? currentStockFlow.from_loc,
    value.to_loc ?? currentStockFlow.to_loc,
    value.quantity ?? currentStockFlow.quantity,
    value.transport ?? currentStockFlow.transport,
    // value.status ?? currentStockFlow.status,
    value.description ?? currentStockFlow.description,
    id,
  ];
} else {
  
  updateQuery = `
    UPDATE stock_flow SET
      transport = ?,
      description = ?
    WHERE id = ?
  `;

  updateParams = [
    value.transport ?? currentStockFlow.transport,
    value.description ?? currentStockFlow.description,
    id,
  ];
}

const updateRes = await do_ma_query(updateQuery, updateParams);


    if (updateRes.affectedRows !== 1) {
      return res.status(304).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "No changes made to stock flow",
      });
    }

    const [updatedStockFlow] = await do_ma_query(
      `SELECT sf.*,
        w1.title AS from_warehouse_name,
        w2.title AS to_warehouse_name
      FROM stock_flow sf
      LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
      LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
      WHERE sf.id = ?`,
      [id]
    );

  
    const changes = [];
    if (currentStockFlow.transport !== value.transport) {
      changes.push(`transport: ${currentStockFlow.transport} → ${value.transport}`);
    }
    if (currentStockFlow.description !== value.description) {
      changes.push('description updated');
    }
    if (currentStockFlow.quantity !== value.quantity) {
      changes.push(`quantity: ${currentStockFlow.quantity} → ${value.quantity}`);
    }


    if (changes.length > 0) {
      await logActivity({
        activity_type: 'stock_flow',
        action: 'updated',
        entity_id: id,
        entity_name: `SF-${id}`,
        description: `Stock flow updated: ${changes.join(', ')}`,
        user_id: user?.id || null,
        user_name: user?.name || 'System',
        warehouse_id: currentStockFlow.from_wh || null,
        warehouse_name: updatedStockFlow.from_warehouse_name || currentStockFlow.from_loc,
        metadata: {
          stock_flow_id: id,
          changes: changes,
          status: currentStockFlow.status
        }
      });
    }

    return res.status(200).json({
      success: true,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Stock flow updated successfully",
      data: updatedStockFlow,
    });


  } catch (err) {
    console.error("Error updating stock flow:", err);
    return res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
    });
  }
};

// =====================================================
// RECEIVE STOCK FLOW WITH DELIVERY PHOTO
// =====================================================


export const approveStockFlow = async (req, res) => {
  const { id } = req.params;

  await do_ma_query(
    `UPDATE stock_flow 
     SET status='approved', updated_at=NOW() 
     WHERE id=? AND status='pending'`,
    [id]
  );

  res.json({ message: 'Stock flow approved' });
};


// export const dispatchStockFlow = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { user, warehouseFilter } = req;


//     let checkQuery = "SELECT * FROM stock_flow WHERE id = ?";
//     const checkParams = [id];

//     if (warehouseFilter) {
//       checkQuery += " AND (from_wh = ? OR to_wh = ?)";
//       checkParams.push(warehouseFilter, warehouseFilter);
//     }

//     const [stockFlow] = await do_ma_query(checkQuery, checkParams);

//     if (!stockFlow) {
//       return res.status(404).json({
//         success: false,
//         message: warehouseFilter ? "Stock flow not found or access denied" : "Stock flow not found",
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//       });
//     }

    
//     if (stockFlow.status !== 'approved') {
//       return res.status(400).json({
//         success: false,
//         message: `Cannot dispatch. Current status is "${stockFlow.status}"`,
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//       });
//     }

    
//     await do_ma_query(
//       `UPDATE stock_flow 
//        SET status='in-transit', updated_at=NOW() 
//        WHERE id=?`,
//       [id]
//     );

   
//     const [updatedStockFlow] = await do_ma_query(
//       `SELECT sf.*, 
//         w1.title AS from_warehouse_name,
//         w2.title AS to_warehouse_name
//       FROM stock_flow sf
//       LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
//       LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
//       WHERE sf.id = ?`,
//       [id]
//     );

    
//     const stockFlowWithActions = {
//       ...updatedStockFlow,
//       actions: {
//         can_edit: false,
//         can_delete: false,
//         can_dispatch: false,
//         can_receive: true, 
//       }
//     };

 
//     await logActivity({
//       activity_type: 'stock_flow',
//       action: 'dispatched',
//       entity_id: id,
//       entity_name: `SF-${id}`,
//       description: `Stock flow dispatched: ${updatedStockFlow.quantity} items from ${updatedStockFlow.from_warehouse_name || updatedStockFlow.from_loc} to ${updatedStockFlow.to_warehouse_name || updatedStockFlow.to_loc}`,
//       user_id: user?.id || null,
//       user_name: user?.name || 'System',
//       warehouse_id: updatedStockFlow.from_wh || null,
//       warehouse_name: updatedStockFlow.from_warehouse_name || updatedStockFlow.from_loc,
//       metadata: {
//         stock_flow_id: id,
//         status: 'in-transit',
//         transport: updatedStockFlow.transport
//       }
//     });

    
//     sendStockFlowStatusEmail(updatedStockFlow, user?.email_1)
//       .catch(err => console.error('Email error:', err));

//     res.status(200).json({
//       success: true,
//       message: 'Stock flow dispatched successfully',
//       data: stockFlowWithActions, 
//       timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//     });

//   } catch (error) {
//     console.error('Error dispatching stock flow:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Failed to dispatch stock flow',
//       error: error.message,
//       timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//     });
//   }
// };



export const dispatchStockFlow = async (req, res) => {
  try {
    const { id } = req.params;
    const { user, warehouseFilter } = req;

    let checkQuery = "SELECT * FROM stock_flow WHERE id = ?";
    const checkParams = [id];

    if (warehouseFilter) {
      checkQuery += " AND (from_wh = ? OR to_wh = ?)";
      checkParams.push(warehouseFilter, warehouseFilter);
    }

    const [stockFlow] = await do_ma_query(checkQuery, checkParams);

    if (!stockFlow) {
      return res.status(404).json({
        success: false,
        message: warehouseFilter ? "Stock flow not found or access denied" : "Stock flow not found",
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      });
    }

    if (stockFlow.status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: `Cannot dispatch. Current status is "${stockFlow.status}"`,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      });
    }

    // Update status to in-transit
    await do_ma_query(
      `UPDATE stock_flow 
       SET status='in-transit', updated_at=NOW() 
       WHERE id=?`,
      [id]
    );

    // Fetch updated stock flow with warehouse names
    const [updatedStockFlow] = await do_ma_query(
      `SELECT sf.*, 
        w1.title AS from_warehouse_name,
        w2.title AS to_warehouse_name
      FROM stock_flow sf
      LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
      LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
      WHERE sf.id = ?`,
      [id]
    );

    const stockFlowWithActions = {
      ...updatedStockFlow,
      actions: {
        can_edit: false,
        can_delete: false,
        can_dispatch: false,
        can_receive: true,
      }
    };

    // ✅ ADD ACTIVITY LOG FOR DISPATCH
    await logActivity({
      activity_type: 'stock_flow',
      action: 'dispatched',
      entity_id: id,
      entity_name: `SF-${id}`,
      description: `Stock flow dispatched: ${updatedStockFlow.quantity} items from ${updatedStockFlow.from_warehouse_name || updatedStockFlow.from_loc} to ${updatedStockFlow.to_warehouse_name || updatedStockFlow.to_loc}`,
      user_id: user?.id || null,
      user_name: user?.name || 'System',
      warehouse_id: updatedStockFlow.from_wh || null,
      warehouse_name: updatedStockFlow.from_warehouse_name || updatedStockFlow.from_loc,
      metadata: {
        stock_flow_id: id,
        previous_status: 'approved',
        new_status: 'in-transit',
        transport: updatedStockFlow.transport,
        from_location: updatedStockFlow.from_warehouse_name || updatedStockFlow.from_loc,
        to_location: updatedStockFlow.to_warehouse_name || updatedStockFlow.to_loc
      }
    });

    // Send email notification
    sendStockFlowStatusEmail(updatedStockFlow, user?.email_1)
      .catch(err => console.error('Email error:', err));

    res.status(200).json({
      success: true,
      message: 'Stock flow dispatched successfully',
      data: stockFlowWithActions,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });

  } catch (error) {
    console.error('Error dispatching stock flow:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to dispatch stock flow',
      error: error.message,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });
  }
};

// export const receiveStockFlow = async (req, res) => {
//   const deleteFileSafe = async (filePath) => {
//     if (!filePath) return;
//     await unlinkAsync(filePath).catch(err =>
//       console.error('Error deleting file:', err)
//     );
//   };

//   let connection;

//   try {
//     const { id } = req.params;
//     const { warehouseFilter, user } = req;
//     const deliveryPhoto = req.file;

//     if (!deliveryPhoto) {
//       return res.status(400).json({
//         success: false,
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//         message: 'Delivery photo is required',
//       });
//     }

//     const receive_schema = Joi.object({
//       received_by: Joi.string().max(255).required().label('received by'),
//       received_quantity: Joi.number().integer().min(1).required().label('received quantity'),
//       receive_remarks: Joi.string().max(500).allow('', null).label('remarks'),
//     });

//     const { error, value } = receive_schema.validate(req.body, { abortEarly: false, stripUnknown: true  });

//     if (error) {
//       await deleteFileSafe(deliveryPhoto.path);
//       return res.status(400).json({
//         success: false,
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//         message: error.details[0].message,
//       });
//     }


//     let checkQuery = "SELECT * FROM stock_flow WHERE id = ?";
//     const checkParams = [id];

//     if (warehouseFilter) {
//       checkQuery += " AND (from_wh = ? OR to_wh = ?)";
//       checkParams.push(warehouseFilter, warehouseFilter);
//     }

//     const stockflow_check = await do_ma_query(checkQuery, checkParams);

//     if (stockflow_check.length === 0) {
//       await deleteFileSafe(deliveryPhoto.path);
//       return res.status(404).json({
//         success: false,
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//         message: warehouseFilter
//           ? "Stock flow not found or access denied"
//           : "Stock flow not found",
//       });
//     }

//     const stockFlow = stockflow_check[0];

//     if (stockFlow.status === 'delivered') {
//       await deleteFileSafe(deliveryPhoto.path);
//       return res.status(400).json({
//         success: false,
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//         message: 'Stock flow has already been delivered',
//       });
//     }

//     if (stockFlow.status !== 'in-transit') {
//       await deleteFileSafe(deliveryPhoto.path);
//       return res.status(400).json({
//         success: false,
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//         message: 'Stock flow is not in transit',
//       });
//     }

//     if (value.received_quantity > stockFlow.quantity) {
//       await deleteFileSafe(deliveryPhoto.path);
//       return res.status(400).json({
//         success: false,
//         timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//         message: 'Received quantity cannot exceed shipped quantity',
//       });
//     }

 
//     connection = await pool.getConnection();
//     await connection.beginTransaction();

 
//     const [update_res] = await connection.query(
//       `UPDATE stock_flow SET
//         status = 'delivered',
//         received_by = ?,
//         received_quantity = ?,
//         receive_remarks = ?,
//         delivery_photo_path = ?,
//         received_at = NOW()
      
//       WHERE id = ?`,
//       [
//         value.received_by,
//         value.received_quantity,
//         value.receive_remarks || null,
//         deliveryPhoto.path,
//         id,
//       ]
//     );

//     if (update_res.affectedRows !== 1) {
//       throw new Error('Failed to update stock flow');
//     }

  
//     await connection.query(
//       `UPDATE product p
//        JOIN stock_flow_product sfp ON p.id = sfp.product_id
//        JOIN stock_flow sf ON sf.id = sfp.stock_flow_id
//        SET p.warehouse_id = sf.to_wh
//        WHERE sfp.stock_flow_id = ?`,
//       [id]
//     );

//     await connection.commit();
//     connection.release();


//     const updatedStockFlow = await do_ma_query(
//       `SELECT sf.*, 
//         w1.title AS from_warehouse_name,
//         w2.title AS to_warehouse_name
//       FROM stock_flow sf
//       LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
//       LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
//       WHERE sf.id = ?`,
//       [id]
//     );


//    const stockFlowWithActions = {
//         ...updatedStockFlow,
//       actions: {
//         can_edit: false,       
//         can_delete: false,      
//         can_dispatch: false,  
//         can_receive: false,     
//       }
//     };


//   await logActivity({
//       activity_type: 'stock_flow',
//       action: 'delivered',
//       entity_id: id,
//       entity_name: `SF-${id}`,
//       description: `Stock flow delivered: ${value.received_quantity} of ${stockFlow.quantity} items received at ${updatedStockFlow[0].to_warehouse_name || stockFlow.to_loc}`,
//       user_id: user?.id || null,
//       user_name: user?.name || value.received_by,
//       warehouse_id: stockFlow.to_wh || null,
//       warehouse_name: updatedStockFlow[0].to_warehouse_name || stockFlow.to_loc,
//       metadata: {
//         stock_flow_id: id,
//         shipped_quantity: stockFlow.quantity,
//         received_quantity: value.received_quantity,
//         received_by: value.received_by,
//         from_location: updatedStockFlow[0].from_warehouse_name || stockFlow.from_loc,
//         to_location: updatedStockFlow[0].to_warehouse_name || stockFlow.to_loc,
//         transport: stockFlow.transport
//       }
//     });

   
//     sendStockFlowStatusEmail(updatedStockFlow[0], user?.email_1)
//       .catch(err => console.error('Email error:', err));

//        return res.status(200).json({
//       success: true,
//       timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//       message: 'Stock flow received and marked as delivered',
//       data: stockFlowWithActions,
//     });
//   } catch (err) {
//     console.error('Error receiving stock flow:', err);

//     if (connection) {
//       await connection.rollback();
//       connection.release();
//     }

//     if (req.file) {
//       await unlinkAsync(req.file.path).catch(() => {});
//     }

//     return res.status(500).json({
//       success: false,
//       timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
//       message: 'Internal server error',
//     });
//   }
// };


// =====================================================
// DELETE STOCK FLOW
// =====================================================



export const receiveStockFlow = async (req, res) => {
  const deleteFileSafe = async (filePath) => {
    if (!filePath) return;
    await unlinkAsync(filePath).catch(err =>
      console.error('Error deleting file:', err)
    );
  };

  let connection;

  try {
    const { id } = req.params;
    const { warehouseFilter, user } = req;
    const deliveryPhoto = req.file;

    if (!deliveryPhoto) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
        message: 'Delivery photo is required',
      });
    }

    const receive_schema = Joi.object({
      received_by: Joi.string().max(255).required().label('received by'),
      received_quantity: Joi.number().integer().min(1).required().label('received quantity'),
      receive_remarks: Joi.string().max(500).allow('', null).label('remarks'),
    });

    const { error, value } = receive_schema.validate(req.body, { abortEarly: false, stripUnknown: true  });

    if (error) {
      await deleteFileSafe(deliveryPhoto.path);
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
        message: error.details[0].message,
      });
    }

    let checkQuery = "SELECT * FROM stock_flow WHERE id = ?";
    const checkParams = [id];

    if (warehouseFilter) {
      checkQuery += " AND (from_wh = ? OR to_wh = ?)";
      checkParams.push(warehouseFilter, warehouseFilter);
    }

    const stockflow_check = await do_ma_query(checkQuery, checkParams);

    if (stockflow_check.length === 0) {
      await deleteFileSafe(deliveryPhoto.path);
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
        message: warehouseFilter
          ? "Stock flow not found or access denied"
          : "Stock flow not found",
      });
    }

    const stockFlow = stockflow_check[0];

    if (stockFlow.status === 'delivered') {
      await deleteFileSafe(deliveryPhoto.path);
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
        message: 'Stock flow has already been delivered',
      });
    }

    if (stockFlow.status !== 'in-transit') {
      await deleteFileSafe(deliveryPhoto.path);
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
        message: 'Stock flow is not in transit',
      });
    }

    if (value.received_quantity > stockFlow.quantity) {
      await deleteFileSafe(deliveryPhoto.path);
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
        message: 'Received quantity cannot exceed shipped quantity',
      });
    }

    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Update stock flow to delivered
    const [update_res] = await connection.query(
      `UPDATE stock_flow SET
        status = 'delivered',
        received_by = ?,
        received_quantity = ?,
        receive_remarks = ?,
        delivery_photo_path = ?,
        received_at = NOW()
      WHERE id = ?`,
      [
        value.received_by,
        value.received_quantity,
        value.receive_remarks || null,
        deliveryPhoto.path,
        id,
      ]
    );

    if (update_res.affectedRows !== 1) {
      throw new Error('Failed to update stock flow');
    }

    // Update product warehouse locations
    await connection.query(
      `UPDATE product p
       JOIN stock_flow_product sfp ON p.id = sfp.product_id
       JOIN stock_flow sf ON sf.id = sfp.stock_flow_id
       SET p.warehouse_id = sf.to_wh
       WHERE sfp.stock_flow_id = ?`,
      [id]
    );

    await connection.commit();
    connection.release();

    // Fetch updated stock flow
    const updatedStockFlow = await do_ma_query(
      `SELECT sf.*, 
        w1.title AS from_warehouse_name,
        w2.title AS to_warehouse_name
      FROM stock_flow sf
      LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
      LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
      WHERE sf.id = ?`,
      [id]
    );

    const stockFlowWithActions = {
      ...updatedStockFlow[0],
      actions: {
        can_edit: false,
        can_delete: false,
        can_dispatch: false,
        can_receive: false,
      }
    };

    // ✅ ADD ACTIVITY LOG FOR DELIVERY
    await logActivity({
      activity_type: 'stock_flow',
      action: 'delivered',
      entity_id: id,
      entity_name: `SF-${id}`,
      description: `Stock flow delivered: ${value.received_quantity} of ${stockFlow.quantity} items received at ${updatedStockFlow[0].to_warehouse_name || stockFlow.to_loc} by ${value.received_by}`,
      user_id: user?.id || null,
      user_name: user?.name || value.received_by,
      warehouse_id: stockFlow.to_wh || null,
      warehouse_name: updatedStockFlow[0].to_warehouse_name || stockFlow.to_loc,
      metadata: {
        stock_flow_id: id,
        previous_status: 'in-transit',
        new_status: 'delivered',
        shipped_quantity: stockFlow.quantity,
        received_quantity: value.received_quantity,
        received_by: value.received_by,
        received_at: new Date().toISOString(),
        from_location: updatedStockFlow[0].from_warehouse_name || stockFlow.from_loc,
        to_location: updatedStockFlow[0].to_warehouse_name || stockFlow.to_loc,
        transport: stockFlow.transport,
        delivery_photo: deliveryPhoto.path,
        remarks: value.receive_remarks || null
      }
    });

    // Send email notification
    sendStockFlowStatusEmail(updatedStockFlow[0], user?.email_1)
      .catch(err => console.error('Email error:', err));

    return res.status(200).json({
      success: true,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      message: 'Stock flow received and marked as delivered',
      data: stockFlowWithActions,
    });
  } catch (err) {
    console.error('Error receiving stock flow:', err);

    if (connection) {
      await connection.rollback();
      connection.release();
    }

    if (req.file) {
      await unlinkAsync(req.file.path).catch(() => {});
    }

    return res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
      message: 'Internal server error',
    });
  }
};


export const deleteStockFlow = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const { id } = req.params;
    const { warehouseFilter } = req;

    const id_schema = Joi.object({
      id: Joi.number().integer().min(1).required().label("stock flow ID"),
    });

    const { error } = id_schema.validate({ id }, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

    await connection.beginTransaction();

    let checkQuery = "SELECT * FROM stock_flow WHERE id = ?";
    const checkParams = [id];

    if (warehouseFilter) {
      checkQuery += " AND (from_wh = ? OR to_wh = ?)";
      checkParams.push(warehouseFilter, warehouseFilter);
    }

    const [stockflow_check] = await connection.query(checkQuery, checkParams);

    if (stockflow_check.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: warehouseFilter ? "Stock flow not found or access denied" : "Stock flow not found",
      });
    }

    const stockFlow = stockflow_check[0];

    
    await connection.query("DELETE FROM stock_flow_product WHERE stock_flow_id = ?", [id]);

  
    const [delete_result] = await connection.query("DELETE FROM stock_flow WHERE id = ?", [id]);

    
    if (stockFlow.bill_file_path) {
      unlinkAsync(stockFlow.bill_file_path).catch(err => 
        console.error('Error deleting bill file:', err)
      );
    }
    if (stockFlow.delivery_photo_path) {
      unlinkAsync(stockFlow.delivery_photo_path).catch(err => 
        console.error('Error deleting delivery photo:', err)
      );
    }

    await connection.commit();

    if (delete_result.affectedRows === 1) {
      res.status(200).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Stock flow and associated products deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Stock flow deletion failed",
      });
    }
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting stock flow:", err);
    res.status(500).json({
      success: false,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error",
    });
  } finally {
    connection.release();
  }
};

// =====================================================
// GET STOCK FLOW STATISTICS
// =====================================================

export const getStockFlowStats = async (req, res) => {
  try {
    const { warehouseFilter } = req;

    let whereClause = "";
    let queryParams = [];

    if (warehouseFilter) {
      whereClause = "WHERE (from_wh = ? OR to_wh = ?)";
      queryParams = [warehouseFilter, warehouseFilter];
    }

    const statsQuery = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'in-transit' THEN 1 ELSE 0 END) as in_transit,
        SUM(CASE WHEN status = 'delivered' THEN 1 ELSE 0 END) as delivered,
        SUM(quantity) as total_quantity
      FROM stock_flow
      ${whereClause}
    `;

    const stats = await do_ma_query(statsQuery, queryParams);

    res.status(200).json({
      success: true,
      data: stats[0],
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (error) {
    console.error("Error fetching stock flow stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching statistics",
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

// =====================================================
// CHART DATA ENDPOINTS - OPTIMIZED
// =====================================================

export const getStockFlowChartData = async (req, res) => {
  try {
    const { warehouseFilter } = req;
    const { period = 'daily', warehouse_id } = req.query;

    let dateGrouping, dateRange;
    
    switch(period) {
      case 'daily':
        dateGrouping = 'DATE(created_at)';
        dateRange = 'INTERVAL 7 DAY';
        break;
      case 'weekly':
        dateGrouping = 'YEARWEEK(created_at, 1)';
        dateRange = 'INTERVAL 8 WEEK';
        break;
      case 'monthly':
        dateGrouping = 'DATE_FORMAT(created_at, "%Y-%m")';
        dateRange = 'INTERVAL 6 MONTH';
        break;
      default:
        dateGrouping = 'DATE(created_at)';
        dateRange = 'INTERVAL 7 DAY';
    }

    let whereConditions = [`created_at >= DATE_SUB(NOW(), ${dateRange})`];
    let queryParams = [];

    if (warehouseFilter) {
      whereConditions.push('(from_wh = ? OR to_wh = ?)');
      queryParams.push(warehouseFilter, warehouseFilter);
    } else if (warehouse_id) {
      whereConditions.push('(from_wh = ? OR to_wh = ?)');
      queryParams.push(warehouse_id, warehouse_id);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
      SELECT 
        ${dateGrouping} as date_key,
        status,
        COUNT(*) as flow_count,
        SUM(quantity) as total_quantity,
        GROUP_CONCAT(DISTINCT 
          CONCAT(w1.title, ' → ', w2.title) 
          SEPARATOR '; '
        ) as flow_paths
      FROM stock_flow sf
      LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
      LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
      ${whereClause}
      GROUP BY ${dateGrouping}, status
      ORDER BY date_key ASC, status
    `;

    const rawData = await do_ma_query(query, queryParams);

   
    const chartData = {};
    
    rawData.forEach(row => {
      const dateLabel = formatDateLabel(row.date_key, period);
      
      if (!chartData[dateLabel]) {
        chartData[dateLabel] = {
          date: dateLabel,
          approved: 0,
          'in-transit': 0,
          delivered: 0,
          details: {}
        };
      }
      
      chartData[dateLabel][row.status] = row.total_quantity;
      chartData[dateLabel].details[row.status] = {
        count: row.flow_count,
        quantity: row.total_quantity,
        paths: row.flow_paths
      };
    });

    res.status(200).json({
      success: true,
      data: Object.values(chartData),
      period: period,
      dateRange: dateRange,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error fetching stock flow chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching chart data',
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

export const getLowStockChartData = async (req, res) => {
  try {
    const { warehouseFilter } = req;
    const { 
      period = 'daily', 
      warehouse_id,
      threshold = 10 
    } = req.query;

    let dateGrouping, dateRange;
    
    switch(period) {
      case 'daily':
        dateGrouping = 'DATE(p.updated_at)';
        dateRange = 'INTERVAL 7 DAY';
        break;
      case 'weekly':
        dateGrouping = 'YEARWEEK(p.updated_at, 1)';
        dateRange = 'INTERVAL 8 WEEK';
        break;
      case 'monthly':
        dateGrouping = 'DATE_FORMAT(p.updated_at, "%Y-%m")';
        dateRange = 'INTERVAL 6 MONTH';
        break;
      default:
        dateGrouping = 'DATE(p.updated_at)';
        dateRange = 'INTERVAL 7 DAY';
    }

    let whereConditions = [
      `p.updated_at >= DATE_SUB(NOW(), ${dateRange})`,
      'p.count > 0',
      'p.count <= ?'
    ];
    let queryParams = [threshold];

    if (warehouseFilter) {
      whereConditions.push('p.warehouse_id = ?');
      queryParams.push(warehouseFilter);
    } else if (warehouse_id) {
      whereConditions.push('p.warehouse_id = ?');
      queryParams.push(warehouse_id);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
      SELECT 
        ${dateGrouping} as date_key,
        w.id as warehouse_id,
        w.title as warehouse_name,
        COUNT(*) as product_count,
        SUM(p.count) as total_quantity,
        GROUP_CONCAT(
          CONCAT(p.title, ' (', p.count, ')')
          ORDER BY p.count ASC
          SEPARATOR '; '
        ) as low_stock_products
      FROM product p
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      ${whereClause}
      GROUP BY ${dateGrouping}, w.id, w.title
      ORDER BY date_key ASC, warehouse_name
    `;

    const rawData = await do_ma_query(query, queryParams);

    const chartData = {};
    const warehouses = new Set();

    rawData.forEach(row => {
      const dateLabel = formatDateLabel(row.date_key, period);
      warehouses.add(row.warehouse_name);
      
      if (!chartData[dateLabel]) {
        chartData[dateLabel] = {
          date: dateLabel,
          total: 0,
          warehouses: {}
        };
      }
      
      chartData[dateLabel].warehouses[row.warehouse_name] = {
        count: row.product_count,
        quantity: row.total_quantity,
        products: row.low_stock_products
      };
      chartData[dateLabel].total += row.product_count;
      chartData[dateLabel][row.warehouse_name] = row.product_count;
    });

 
    const summaryQuery = `
      SELECT 
        w.title as warehouse_name,
        COUNT(*) as low_stock_count,
        SUM(p.count) as total_quantity
      FROM product p
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      WHERE p.count > 0 AND p.count <= ?
      ${warehouseFilter ? 'AND p.warehouse_id = ?' : ''}
      GROUP BY w.id, w.title
      ORDER BY low_stock_count DESC
    `;

    const summaryParams = warehouseFilter 
      ? [threshold, warehouseFilter] 
      : [threshold];
    
    const summary = await do_ma_query(summaryQuery, summaryParams);

    res.status(200).json({
      success: true,
      data: {
        chartData: Object.values(chartData),
        warehouses: Array.from(warehouses),
        summary: summary,
        threshold: threshold
      },
      period: period,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error fetching low stock chart data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching low stock chart data',
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

export const getOutOfStockTrendData = async (req, res) => {
  try {
    const { warehouseFilter } = req;
    const { period = 'daily', warehouse_id } = req.query;

    let dateGrouping, dateRange;
    
    switch(period) {
      case 'daily':
        dateGrouping = 'DATE(p.updated_at)';
        dateRange = 'INTERVAL 7 DAY';
        break;
      case 'weekly':
        dateGrouping = 'YEARWEEK(p.updated_at, 1)';
        dateRange = 'INTERVAL 8 WEEK';
        break;
      case 'monthly':
        dateGrouping = 'DATE_FORMAT(p.updated_at, "%Y-%m")';
        dateRange = 'INTERVAL 6 MONTH';
        break;
      default:
        dateGrouping = 'DATE(p.updated_at)';
        dateRange = 'INTERVAL 7 DAY';
    }

    let whereConditions = [
      `p.updated_at >= DATE_SUB(NOW(), ${dateRange})`,
      'p.count = 0'
    ];
    let queryParams = [];

    if (warehouseFilter) {
      whereConditions.push('p.warehouse_id = ?');
      queryParams.push(warehouseFilter);
    } else if (warehouse_id) {
      whereConditions.push('p.warehouse_id = ?');
      queryParams.push(warehouse_id);
    }

    const whereClause = 'WHERE ' + whereConditions.join(' AND ');

    const query = `
      SELECT 
        ${dateGrouping} as date_key,
        w.title as warehouse_name,
        COUNT(*) as out_of_stock_count,
        GROUP_CONCAT(p.title SEPARATOR '; ') as products
      FROM product p
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      ${whereClause}
      GROUP BY ${dateGrouping}, w.title
      ORDER BY date_key ASC
    `;

    const rawData = await do_ma_query(query, queryParams);
    

    const chartData = {};
    rawData.forEach(row => {
      const dateLabel = formatDateLabel(row.date_key, period);
      
      if (!chartData[dateLabel]) {
        chartData[dateLabel] = {
          date: dateLabel,
          total: 0
        };
      }
      
      chartData[dateLabel][row.warehouse_name] = row.out_of_stock_count;
      chartData[dateLabel].total += row.out_of_stock_count;
    });

    res.status(200).json({
      success: true,
      data: Object.values(chartData),
      period: period,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error fetching out of stock trend:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trend data',
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

function formatDateLabel(dateKey, period) {
  if (!dateKey) return 'Unknown';

  if (period === 'daily') {
    return DateTime.fromJSDate(new Date(dateKey)).toFormat('yyyy-MM-dd');
  }

  if (period === 'monthly') {
    return dateKey;
  }

  if (period === 'weekly') {
    const year = dateKey.toString().substring(0, 4);
    const week = dateKey.toString().substring(4);
    return `Week ${week}, ${year}`;
  }

  return dateKey;
}

export const getStockStatusDistribution = async (req, res) => {
  try {
    const { warehouseFilter } = req;
    const { warehouse_id } = req.query;

    let whereConditions = [];
    let queryParams = [];

    if (warehouseFilter) {
      whereConditions.push('p.warehouse_id = ?');
      queryParams.push(warehouseFilter);
    } else if (warehouse_id) {
      whereConditions.push('p.warehouse_id = ?');
      queryParams.push(warehouse_id);
    }

    const whereClause = whereConditions.length > 0 
      ? 'WHERE ' + whereConditions.join(' AND ') 
      : '';

    const query = `
      SELECT 
        CASE 
          WHEN p.count = 0 THEN 'Out of Stock'
          WHEN p.count <= 10 THEN 'Low Stock'
          WHEN p.count <= 50 THEN 'Medium Stock'
          ELSE 'High Stock'
        END as stock_level,
        COUNT(*) as product_count,
        SUM(p.count) as total_quantity,
        GROUP_CONCAT(
          DISTINCT w.title
          SEPARATOR ', '
        ) as warehouses
      FROM product p
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      ${whereClause}
      GROUP BY stock_level
      ORDER BY 
        CASE stock_level
          WHEN 'Out of Stock' THEN 1
          WHEN 'Low Stock' THEN 2
          WHEN 'Medium Stock' THEN 3
          WHEN 'High Stock' THEN 4
        END
    `;

    const distribution = await do_ma_query(query, queryParams);

    res.status(200).json({
      success: true,
      data: distribution,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error fetching stock distribution:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching distribution data',
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};

export const getWarehouseComparison = async (req, res) => {
  try {
    const { warehouseFilter } = req;
    const { threshold = 10 } = req.query;

    let whereClause = warehouseFilter ? 'WHERE w.id = ?' : '';
    let queryParams = warehouseFilter ? [threshold, threshold, warehouseFilter] : [threshold, threshold];

    const query = `
      SELECT 
        w.id,
        w.title as warehouse_name,
        COUNT(p.id) as total_products,
        SUM(p.count) as total_stock,
        SUM(CASE WHEN p.count = 0 THEN 1 ELSE 0 END) as out_of_stock,
        SUM(CASE WHEN p.count > 0 AND p.count <= ? THEN 1 ELSE 0 END) as low_stock,
        SUM(CASE WHEN p.count > ? THEN 1 ELSE 0 END) as healthy_stock,
        AVG(p.count) as avg_stock_per_product
      FROM warehouse w
      LEFT JOIN product p ON p.warehouse_id = w.id
      ${whereClause}
      GROUP BY w.id, w.title
      ORDER BY total_products DESC
    `;

    const comparison = await do_ma_query(query, queryParams);

    res.status(200).json({
      success: true,
      data: comparison,
      threshold: threshold,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });

  } catch (error) {
    console.error('Error fetching warehouse comparison:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comparison data',
      error: error.message,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  }
};











