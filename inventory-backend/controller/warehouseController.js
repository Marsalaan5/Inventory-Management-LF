import pool from '../db.js';
import Joi from "joi"
import  {DateTime} from "luxon";
import { do_ma_query } from '../db.js';
import { logActivity } from '../services/activityService.js';

// import { v4 as uuidv4 } from 'uuid';


// // UUID validation schema
// const uuidSchema = Joi.string().uuid({ version: 'uuidv4' });





function parseDateSafe(dateStr) {
	if (!dateStr) return null;
	const dt = DateTime.fromFormat(dateStr, "yyyy-MM-dd HH:mm:ss ZZ");
	return dt.isValid ? dt.toFormat("yyyy-MM-dd HH:mm:ss") : null;
}



// export const getDashboard = async (req, res) => {
//   try {
//     const { warehouseFilter, user } = req;

//     // FIXED: Get users count with warehouse filtering
//     let usersCount = { total: 0, active: 0, inactive: 0 };
//     let rolesCount = 0;

//     if (user.isSuperAdmin) {
//       // Super Admin sees ALL users
//       const users = await do_ma_query("SELECT status FROM users");
//       usersCount.total = users.length;
//       usersCount.active = users.filter(u => u.status === 'Active').length;
//       usersCount.inactive = users.filter(u => u.status === 'Inactive').length;

//       const roles = await do_ma_query("SELECT COUNT(*) as count FROM roles");
//       rolesCount = roles[0].count;
//     } else if (user.isAdmin && user.warehouse_id) {
//       // FIXED: Admin sees only THEIR WAREHOUSE users
//       const users = await do_ma_query(
//         "SELECT status FROM users WHERE warehouse_id = ?",
//         [user.warehouse_id]
//       );
//       usersCount.total = users.length;
//       usersCount.active = users.filter(u => u.status === 'Active').length;
//       usersCount.inactive = users.filter(u => u.status === 'Inactive').length;

//       // FIXED: Count roles that have users in this warehouse
//       const roleCountQuery = await do_ma_query(
//         `SELECT COUNT(DISTINCT role_id) as count 
//          FROM users 
//          WHERE warehouse_id = ? AND role_id IS NOT NULL`,
//         [user.warehouse_id]
//       );
//       rolesCount = roleCountQuery[0].count;
//     }

//     // Warehouse query (already filtered correctly)
//     let warehousesQuery = `
//       SELECT w.id, w.title as name, 
//              COALESCE(COUNT(DISTINCT p.id), 0) AS total_products,
//              COALESCE(SUM(p.count), 0) AS total_stock
//       FROM warehouse w
//       LEFT JOIN product p ON p.warehouse_id = w.id
//     `;
    
//     let warehouseParams = [];
//     if (warehouseFilter) {
//       warehousesQuery += " WHERE w.id = ?";
//       warehouseParams.push(warehouseFilter);
//     }
    
//     warehousesQuery += " GROUP BY w.id, w.title";
//     const warehouses = await do_ma_query(warehousesQuery, warehouseParams);

//     // Get products (filtered)
//     let productsQuery = "SELECT * FROM product";
//     let productParams = [];
    
//     if (warehouseFilter) {
//       productsQuery += " WHERE warehouse_id = ?";
//       productParams.push(warehouseFilter);
//     }
    
//     const products = await do_ma_query(productsQuery, productParams);

//     // Calculate stats
//     const totalStock = products.reduce((sum, p) => sum + (p.count || 0), 0);
//     const lowStockCount = products.filter(p => (p.count || 0) < 10).length;

//     const warehouseDetails = warehouses.map(wh => {
//       const whProducts = products.filter(p => p.warehouse_id === wh.id);
//       return {
//         id: wh.id,
//         name: wh.name,
//         products: whProducts.length,
//         stock: wh.total_stock || 0,
//         lowStock: whProducts.filter(p => (p.count || 0) < 10).length,
//       };
//     });

//     console.log(`📊 Dashboard stats - Users: ${usersCount.total}, Roles: ${rolesCount}, Warehouses: ${warehouses.length}`);

//     res.status(200).json({
//       success: true,
//       data: {
//         users: usersCount,
//         roles: rolesCount,
//         warehouses: {
//           total: warehouses.length,
//           details: warehouseDetails,
//         },
//         products: {
//           total: products.length,
//         },
//         stocks: {
//           total: totalStock,
//           low: lowStockCount,
//         },
//         isSuperAdmin: user.isSuperAdmin,
//         isAdmin: user.isAdmin,
//         userWarehouseId: user.warehouse_id,
//       },
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (err) {
//     console.error("Dashboard error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//     });
//   }
// };



// export const getDashboard = async (req, res) => {
//   try {
//     const { warehouseFilter, user } = req;
//     const lowStockThreshold = 10;

//     // ============================================
//     // 1. USER & ROLE COUNTS
//     // ============================================
//     let usersCount = { total: 0, active: 0, inactive: 0 };
//     let rolesCount = 0;

//     if (user.isSuperAdmin) {
//       const users = await do_ma_query("SELECT status FROM users");
//       usersCount.total = users.length;
//       usersCount.active = users.filter(u => u.status === 'Active').length;
//       usersCount.inactive = users.filter(u => u.status === 'Inactive').length;

//       const roles = await do_ma_query("SELECT COUNT(*) as count FROM roles");
//       rolesCount = roles[0].count;
//     } else if (user.isAdmin && user.warehouse_id) {
//       const users = await do_ma_query(
//         "SELECT status FROM users WHERE warehouse_id = ?",
//         [user.warehouse_id]
//       );
//       usersCount.total = users.length;
//       usersCount.active = users.filter(u => u.status === 'Active').length;
//       usersCount.inactive = users.filter(u => u.status === 'Inactive').length;

//       const roleCountQuery = await do_ma_query(
//         `SELECT COUNT(DISTINCT role_id) as count 
//          FROM users 
//          WHERE warehouse_id = ? AND role_id IS NOT NULL`,
//         [user.warehouse_id]
//       );
//       rolesCount = roleCountQuery[0].count;
//     }

//     // ============================================
//     // 2. WAREHOUSE DATA WITH LOW STOCK
//     // ============================================
//     let warehousesQuery = `
//       SELECT 
//         w.id, 
//         w.title as name, 
//         COALESCE(COUNT(DISTINCT p.id), 0) AS total_products,
//         COALESCE(SUM(p.count), 0) AS total_stock,
//         COALESCE(SUM(CASE WHEN p.count > 0 AND p.count <= ? THEN 1 ELSE 0 END), 0) AS low_stock_count,
//         COALESCE(SUM(CASE WHEN p.count = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock_count
//       FROM warehouse w
//       LEFT JOIN product p ON p.warehouse_id = w.id
//     `;
    
//     let warehouseParams = [lowStockThreshold];
    
//     if (warehouseFilter) {
//       warehousesQuery += " WHERE w.id = ?";
//       warehouseParams.push(warehouseFilter);
//     }
    
//     warehousesQuery += " GROUP BY w.id, w.title";
//     const warehouses = await do_ma_query(warehousesQuery, warehouseParams);

//     // ============================================
//     // 3. ALL PRODUCTS (FILTERED)
//     // ============================================
//     let productsQuery = "SELECT id, warehouse_id, count, status FROM product";
//     let productParams = [];
    
//     if (warehouseFilter) {
//       productsQuery += " WHERE warehouse_id = ?";
//       productParams.push(warehouseFilter);
//     }
    
//     const products = await do_ma_query(productsQuery, productParams);



//   const articlesResult = await do_ma_query(
//   "SELECT COUNT(DISTINCT art_prof_uuid) as count FROM article_profile"
//    );
//    const totalArticles = articlesResult[0].count;




//   // ============================================
//     // 4. CALCULATE OVERALL STATS
//     // ============================================
//     const totalStock = products.reduce((sum, p) => sum + (p.count || 0), 0);
//     const lowStockCount = products.filter(p => (p.count || 0) > 0 && (p.count || 0) <= lowStockThreshold).length;
//     const outOfStockCount = products.filter(p => (p.count || 0) === 0).length;

//     // ============================================
//     // 5. GET LOW STOCK PRODUCTS (TOP 10)
//     // ============================================
//     let lowStockQuery = `
//       SELECT 
//         p.id,
//         p.title,
//         p.barcode,
//         p.count,
//         p.status,
//         w.title as warehouse_name,
//         ap.title as article_profile_name
//       FROM product p
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
//       WHERE p.count > 0 AND p.count <= ?
//     `;
    
//     let lowStockParams = [lowStockThreshold];
    
//     if (warehouseFilter) {
//       lowStockQuery += " AND p.warehouse_id = ?";
//       lowStockParams.push(warehouseFilter);
//     }
    
//     lowStockQuery += " ORDER BY p.count ASC LIMIT 10";
    
//     const lowStockProducts = await do_ma_query(lowStockQuery, lowStockParams);

//     // ============================================
//     // 6. GET OUT OF STOCK PRODUCTS (TOP 10)
//     // ============================================
//     let outOfStockQuery = `
//       SELECT 
//         p.id,
//         p.title,
//         p.barcode,
//         p.count,
//         p.status,
//         p.updated_at,
//         w.title as warehouse_name,
//         ap.title as article_profile_name
//       FROM product p
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
//       WHERE p.count = 0
//     `;
    
//     let outOfStockParams = [];
    
//     if (warehouseFilter) {
//       outOfStockQuery += " AND p.warehouse_id = ?";
//       outOfStockParams.push(warehouseFilter);
//     }
    
//     outOfStockQuery += " ORDER BY p.updated_at DESC LIMIT 10";
    
//     const outOfStockProducts = await do_ma_query(outOfStockQuery, outOfStockParams);

//     // ============================================
//     // 7. WAREHOUSE DETAILS WITH STOCK INFO
//     // ============================================
//     const warehouseDetails = warehouses.map(wh => {
//       const whProducts = products.filter(p => p.warehouse_id === wh.id);
//       return {
//         id: wh.id,
//         name: wh.name,
//         products: whProducts.length,
//         stock: wh.total_stock || 0,
//         lowStock: wh.low_stock_count || 0,
//         outOfStock: wh.out_of_stock_count || 0,
//       };
//     });

//     // ============================================
//     // 8. STOCK STATUS BY CATEGORY
//     // ============================================
//     let stockStatusQuery = `
//       SELECT 
//         p.status,
//         COUNT(*) as count,
//         SUM(p.count) as total_quantity
//       FROM product p
//     `;
    
//     let stockStatusParams = [];
    
//     if (warehouseFilter) {
//       stockStatusQuery += " WHERE p.warehouse_id = ?";
//       stockStatusParams.push(warehouseFilter);
//     }
    
//     stockStatusQuery += " GROUP BY p.status";
    
//     const stockByStatus = await do_ma_query(stockStatusQuery, stockStatusParams);

    
//     // ============================================
//     // 9. ENHANCED LOW STOCK TREND (LAST 30 DAYS)
//     // FIXED: Handle Date objects correctly
//     // ============================================
//     let trendQuery = `
//       SELECT 
//         DATE(p.updated_at) as date,
//         w.id as warehouse_id,
//         w.title as warehouse_name,
//         COUNT(*) as count,
//         SUM(p.count) as quantity
//       FROM product p
//       LEFT JOIN warehouse w ON p.warehouse_id = w.id
//       WHERE p.count > 0 
//         AND p.count <= ?
//         AND p.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
//     `;
    
//     let trendParams = [lowStockThreshold];
    
//     if (warehouseFilter) {
//       trendQuery += " AND p.warehouse_id = ?";
//       trendParams.push(warehouseFilter);
//     }
    
//     trendQuery += " GROUP BY DATE(p.updated_at), w.id, w.title ORDER BY date DESC";
    
//     const lowStockTrendRaw = await do_ma_query(trendQuery, trendParams);

//     // Transform for chart - FIXED
//     const trendMap = {};
//     const warehouseNames = new Set();

//     lowStockTrendRaw.forEach(item => {
//       // FIXED: Handle Date object correctly
//       const dateStr = item.date instanceof Date 
//         ? item.date.toISOString().split('T')[0]
//         : item.date.toString().split('T')[0];
        
//       if (!trendMap[dateStr]) {
//         trendMap[dateStr] = { date: dateStr };
//       }
//       trendMap[dateStr][item.warehouse_name || 'Unknown'] = item.count;
//       warehouseNames.add(item.warehouse_name || 'Unknown');
//     });

//     const lowStockTrend = Object.values(trendMap).sort((a, b) => 
//       new Date(a.date) - new Date(b.date)
//     );

//     // ============================================
//     // 10. STOCK FLOW CHART DATA (LAST 30 DAYS)
//     // FIXED: Handle Date objects correctly
//     // ============================================
//     let stockFlowQuery = `
//       SELECT 
//         DATE(created_at) as date,
//         status,
//         COUNT(*) as flow_count,
//         SUM(quantity) as total_quantity
//       FROM stock_flow
//       WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
//     `;
    
//     let stockFlowParams = [];
    
//     if (warehouseFilter) {
//       stockFlowQuery += " AND (from_wh = ? OR to_wh = ?)";
//       stockFlowParams.push(warehouseFilter, warehouseFilter);
//     }
    
//     stockFlowQuery += " GROUP BY DATE(created_at), status ORDER BY date ASC";
    
//     const stockFlowRaw = await do_ma_query(stockFlowQuery, stockFlowParams);

//     // Transform stock flow data - FIXED
//     const flowMap = {};
//     stockFlowRaw.forEach(item => {
//       // FIXED: Handle Date object correctly
//       const dateStr = item.date instanceof Date 
//         ? item.date.toISOString().split('T')[0]
//         : item.date.toString().split('T')[0];
        
//       if (!flowMap[dateStr]) {
//         flowMap[dateStr] = { 
//           date: dateStr,
//           approved: 0,
//           'in-transit': 0,
//           delivered: 0
//         };
//       }
//       flowMap[dateStr][item.status] = item.total_quantity;
//     });

//     const stockFlowChartData = Object.values(flowMap).sort((a, b) => 
//       new Date(a.date) - new Date(b.date)
//     );

//     console.log(` Dashboard stats - Users: ${usersCount.total}, Roles: ${rolesCount}, Warehouses: ${warehouses.length}, Low Stock: ${lowStockCount}, Out of Stock: ${outOfStockCount}`);

//     // ============================================
//     // 11. SEND ENHANCED RESPONSE
//     // ============================================
//     res.status(200).json({
//       success: true,
//       data: {
//         users: usersCount,
//         roles: rolesCount,
//         warehouses: {
//           total: warehouses.length,
//           details: warehouseDetails,
//         },
//         articles: {
//         total: totalArticles,  
//         },
//         products: {
//           total: products.length,
//           totalQuantity: totalStock,
//         },
//         stocks: {
//           total: totalStock,
//           low: lowStockCount,
//           outOfStock: outOfStockCount,
//           threshold: lowStockThreshold,
//         },
        
//         // Enhanced chart data structure
        
//         charts: {
//           stockByStatus: stockByStatus,
//           lowStockTrend: lowStockTrend,
//           lowStockTrendWarehouses: Array.from(warehouseNames),
//           stockFlowMovement: stockFlowChartData,
//         },
        
//         // Individual product lists (for backward compatibility)
//         lowStockProducts: lowStockProducts,
//         outOfStockProducts: outOfStockProducts,
//         stockByStatus: stockByStatus,
//         lowStockTrend: lowStockTrend,
        
//         // User context
//         isSuperAdmin: user.isSuperAdmin,
//         isAdmin: user.isAdmin,
//         userWarehouseId: user.warehouse_id,
//       },
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//     });
//   } catch (err) {
//     console.error("Dashboard error:", err);
//     res.status(500).json({
//       success: false,
//       message: "Internal server error.",
//       error: err.message,
//     });
//   }
// };

//pagination is not working 
export const getDashboard = async (req, res) => {
  try {
    const { warehouseFilter, user } = req;
    const lowStockThreshold = 10;

    // ============================================
    // 1. USER & ROLE COUNTS
    // ============================================
    let usersCount = { total: 0, active: 0, inactive: 0 };
    let rolesCount = 0;
    

    if (user.isSuperAdmin) {
      const users = await do_ma_query("SELECT status FROM users");
      usersCount.total = users.length;
      usersCount.active = users.filter(u => u.status === 'Active').length;
      usersCount.inactive = users.filter(u => u.status === 'Inactive').length;

      const roles = await do_ma_query("SELECT COUNT(*) as count FROM roles");
      rolesCount = roles[0].count;
    } else if (user.isAdmin && user.warehouse_id) {
      const users = await do_ma_query(
        "SELECT status FROM users WHERE warehouse_id = ?",
        [user.warehouse_id]
      );
      usersCount.total = users.length;
      usersCount.active = users.filter(u => u.status === 'Active').length;
      usersCount.inactive = users.filter(u => u.status === 'Inactive').length;

      const roleCountQuery = await do_ma_query(
        `SELECT COUNT(DISTINCT role_id) as count 
         FROM users 
         WHERE warehouse_id = ? AND role_id IS NOT NULL`,
        [user.warehouse_id]
      );
      rolesCount = roleCountQuery[0].count;
    }

    // ============================================
    // 2. WAREHOUSE DATA WITH LOW STOCK
    // ============================================
    let warehousesQuery = `
      SELECT 
        w.id, 
        w.title as name, 
        COALESCE(COUNT(DISTINCT p.id), 0) AS total_products,
        COALESCE(SUM(p.count), 0) AS total_stock,
        COALESCE(SUM(CASE WHEN p.count > 0 AND p.count <= ? THEN 1 ELSE 0 END), 0) AS low_stock_count,
        COALESCE(SUM(CASE WHEN p.count = 0 THEN 1 ELSE 0 END), 0) AS out_of_stock_count
      FROM warehouse w
      LEFT JOIN product p ON p.warehouse_id = w.id
    `;
    
    let warehouseParams = [lowStockThreshold];
    
    if (warehouseFilter) {
      warehousesQuery += " WHERE w.id = ?";
      warehouseParams.push(warehouseFilter);
    }
    
    warehousesQuery += " GROUP BY w.id, w.title";
    const warehouses = await do_ma_query(warehousesQuery, warehouseParams);

    // ============================================
    // 3. ALL PRODUCTS (FILTERED) - UPDATED
    // ============================================
    let productsQuery = "SELECT id, warehouse_id, count, status, article_profile_id FROM product";
    let productParams = [];
    
    if (warehouseFilter) {
      productsQuery += " WHERE warehouse_id = ?";
      productParams.push(warehouseFilter);
    }
    
    const products = await do_ma_query(productsQuery, productParams);

    const articlesResult = await do_ma_query(
      "SELECT COUNT(DISTINCT art_prof_uuid) as count FROM article_profile"
    );
    const totalArticles = articlesResult[0].count;

    // ============================================
    // 4. CALCULATE OVERALL STATS
    // ============================================
    const totalStock = products.reduce((sum, p) => sum + (p.count || 0), 0);
    const lowStockCount = products.filter(p => (p.count || 0) > 0 && (p.count || 0) <= lowStockThreshold).length;
    const outOfStockCount = products.filter(p => (p.count || 0) === 0).length;

    // ============================================
    // 5. GET LOW STOCK PRODUCTS (TOP 10)
    // ============================================
    let lowStockQuery = `
      SELECT 
        p.id,
        p.title,
        p.barcode,
        p.count,
        p.status,
        w.title as warehouse_name,
        ap.title as article_profile_name
      FROM product p
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
      WHERE p.count > 0 AND p.count <= ?
    `;
    
    let lowStockParams = [lowStockThreshold];
    
    if (warehouseFilter) {
      lowStockQuery += " AND p.warehouse_id = ?";
      lowStockParams.push(warehouseFilter);
    }
    
    lowStockQuery += " ORDER BY p.count ASC LIMIT 10";
    
    const lowStockProducts = await do_ma_query(lowStockQuery, lowStockParams);

    // ============================================
    // 6. GET OUT OF STOCK PRODUCTS (TOP 10)
    // ============================================
    let outOfStockQuery = `
      SELECT 
        p.id,
        p.title,
        p.barcode,
        p.count,
        p.status,
        p.updated_at,
        w.title as warehouse_name,
        ap.title as article_profile_name
      FROM product p
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
      WHERE p.count = 0
    `;
    
    let outOfStockParams = [];
    
    if (warehouseFilter) {
      outOfStockQuery += " AND p.warehouse_id = ?";
      outOfStockParams.push(warehouseFilter);
    }
    
    outOfStockQuery += " ORDER BY p.updated_at DESC LIMIT 10";
    
    const outOfStockProducts = await do_ma_query(outOfStockQuery, outOfStockParams);

    // ============================================
    // 7. WAREHOUSE DETAILS WITH STOCK INFO - UPDATED
    // ============================================

    const warehouseDetails = warehouses.map(wh => {
      const whProducts = products.filter(p => p.warehouse_id === wh.id);
      
      const uniqueArticles = new Set(
        whProducts
          .map(p => p.article_profile_id)
          .filter(id => id != null)
      );
      
      return {
        id: wh.id,
        name: wh.name,
        articles: uniqueArticles.size,
        products: whProducts.length,
        stock: wh.total_stock || 0,
        lowStock: wh.low_stock_count || 0,
        outOfStock: wh.out_of_stock_count || 0,
      };
    });

    // ============================================
    // 8. STOCK STATUS BY CATEGORY
    // ============================================
    let stockStatusQuery = `
      SELECT 
        p.status,
        COUNT(*) as count,
        SUM(p.count) as total_quantity
      FROM product p
    `;
    
    let stockStatusParams = [];
    
    if (warehouseFilter) {
      stockStatusQuery += " WHERE p.warehouse_id = ?";
      stockStatusParams.push(warehouseFilter);
    }
    
    stockStatusQuery += " GROUP BY p.status";
    
    const stockByStatus = await do_ma_query(stockStatusQuery, stockStatusParams);

    // ============================================
    // 9. ENHANCED LOW STOCK TREND (LAST 30 DAYS)
    // ============================================
    let trendQuery = `
      SELECT 
        DATE(p.updated_at) as date,
        w.id as warehouse_id,
        w.title as warehouse_name,
        COUNT(*) as count,
        SUM(p.count) as quantity
      FROM product p
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      WHERE p.count > 0 
        AND p.count <= ?
        AND p.updated_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    let trendParams = [lowStockThreshold];
    
    if (warehouseFilter) {
      trendQuery += " AND p.warehouse_id = ?";
      trendParams.push(warehouseFilter);
    }
    
    trendQuery += " GROUP BY DATE(p.updated_at), w.id, w.title ORDER BY date DESC";
    
    const lowStockTrendRaw = await do_ma_query(trendQuery, trendParams);

    // Transform for chart
    const trendMap = {};
    const warehouseNames = new Set();

    lowStockTrendRaw.forEach(item => {
      const dateStr = item.date instanceof Date 
        ? item.date.toISOString().split('T')[0]
        : item.date.toString().split('T')[0];
        
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { date: dateStr };
      }
      trendMap[dateStr][item.warehouse_name || 'Unknown'] = item.count;
      warehouseNames.add(item.warehouse_name || 'Unknown');
    });

    const lowStockTrend = Object.values(trendMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // ============================================
    // 10. STOCK FLOW CHART DATA (LAST 30 DAYS)
    // ============================================
    let stockFlowQuery = `
      SELECT 
        DATE(created_at) as date,
        status,
        COUNT(*) as flow_count,
        SUM(quantity) as total_quantity
      FROM stock_flow
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    `;
    
    let stockFlowParams = [];
    
    if (warehouseFilter) {
      stockFlowQuery += " AND (from_wh = ? OR to_wh = ?)";
      stockFlowParams.push(warehouseFilter, warehouseFilter);
    }
    
    stockFlowQuery += " GROUP BY DATE(created_at), status ORDER BY date ASC";
    
    const stockFlowRaw = await do_ma_query(stockFlowQuery, stockFlowParams);

    // Transform stock flow data
    const flowMap = {};
    stockFlowRaw.forEach(item => {
      const dateStr = item.date instanceof Date 
        ? item.date.toISOString().split('T')[0]
        : item.date.toString().split('T')[0];
        
      if (!flowMap[dateStr]) {
        flowMap[dateStr] = { 
          date: dateStr,
          approved: 0,
          'in-transit': 0,
          delivered: 0
        };
      }
      flowMap[dateStr][item.status] = item.total_quantity;
    });

    const stockFlowChartData = Object.values(flowMap).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );

    // console.log(` Dashboard stats - Users: ${usersCount.total}, Roles: ${rolesCount}, Warehouses: ${warehouses.length}, Low Stock: ${lowStockCount}, Out of Stock: ${outOfStockCount}`);

    // ============================================
    // 11. SEND ENHANCED RESPONSE
    // ============================================
    res.status(200).json({
      success: true,
      data: {
        users: usersCount,
        roles: rolesCount,
        warehouses: {
          total: warehouses.length,
          details: warehouseDetails,
        },
        articles: {
          total: totalArticles,  
        },
        products: {
          total: products.length,
          totalQuantity: totalStock,
        },
        stocks: {
          total: totalStock,
          low: lowStockCount,
          outOfStock: outOfStockCount,
          threshold: lowStockThreshold,
        },
        
        // Enhanced chart data structure
        charts: {
          stockByStatus: stockByStatus,
          lowStockTrend: lowStockTrend,
          lowStockTrendWarehouses: Array.from(warehouseNames),
          stockFlowMovement: stockFlowChartData,
        },
        
        // Individual product lists (for backward compatibility)
        lowStockProducts: lowStockProducts,
        outOfStockProducts: outOfStockProducts,
        stockByStatus: stockByStatus,
        lowStockTrend: lowStockTrend,
        
        // User context
        isSuperAdmin: user.isSuperAdmin,
        isAdmin: user.isAdmin,
        userWarehouseId: user.warehouse_id,
      },
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
      error: err.message,
    });
  }
};

  
  export const getWhTitle = async (req, res) => {
	try {
		const wh_label = "warehouse title";

		const wh_title_schema = Joi.object({
			idx: Joi.string()
				.min(3)
				.max(127)
				.pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
				.required()
				.label(wh_label)
				.messages({
					"string.pattern.base": `${wh_label} can include letters (a-z), numbers (0-9), and these special characters (-_.). You cannot start or end a ${wh_label} with a special character or use multiple special characters in a row.`,
				}),
		});

		const { error, value } = wh_title_schema.validate(req.params, { abortEarly: false });

		if (error) {
			return res.status(400).json({
				success: false,
				available: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		let read_wh_title = await do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE title = ?;", [value.idx]);

		if (read_wh_title[0].count === 0) {
			return res.status(200).json({
				success: true,
				available: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource available.",
			});
		} else {
			return res.status(422).json({
				success: false,
				available: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource already taken.",
			});
		}
	} catch (err) {
		console.error(`Route: ${req.originalUrl}, Error:`, err);
		res.status(500).json({
			success: false,
			available: null,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error.",
		});
	}
};



  
  export const getWhPhone = async (req, res) => {
	try {
		const phone_no_label = "phone number";

		const phone_no_schema = Joi.object({
			idx: Joi.string()
				.pattern(new RegExp("^[0-9]{10}$"))
				.required()
				.label(phone_no_label)
				.messages({
					"string.pattern.base": `${phone_no_label} must have exactly 10 digits and contain only numbers.`,
				}),
		});

		const { error, value } = phone_no_schema.validate(req.params, { abortEarly: false });

		if (error) {
			return res.status(400).json({
				success: false,
				available: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		let read_wh_phone = await do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE phone_1 = ?;", [
			value.idx,
		]);

		if (read_wh_phone[0].count === 0) {
			return res.status(200).json({
				success: true,
				available: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource available.",
			});
		} else {
			return res.status(422).json({
				success: false,
				available: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource already taken.",
			});
		}
	} catch (err) {
		console.error(`Route: ${req.originalUrl}, Error:`, err);
		res.status(500).json({
			success: false,
			available: null,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error.",
		});
	}
};


  
  
  export const getWhEmail = async (req, res) => {
	try {
		const email_id_label = "email ID";

		const email_schema = Joi.object({
			idx: Joi.string().max(127).email().required().label(email_id_label),
		});

		const { error, value } = email_schema.validate(req.params, { abortEarly: false });

		if (error) {
			return res.status(400).json({
				success: false,
				available: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		let read_email = await do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE email_1 = ?;", [value.idx]);

		if (read_email[0].count === 0) {
			return res.status(200).json({
				success: true,
				available: true,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource available.",
			});
		} else {
			return res.status(422).json({
				success: false,
				available: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource already taken.",
			});
		}
	} catch (err) {
		console.error(`Route: ${req.originalUrl}, Error:`, err);
		res.status(500).json({
			success: false,
			available: null,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error.",
		});
	}
};



// Get all warehouses with filters
export const getAllWarehouses = async (req, res) => {
  // console.log("getAllWarehouses route hit");
  try {
    
const warehouseFilter = req.warehouseFilter;
// console.log("WAREHOUSE FILTER" , warehouseFilter)
const user = req.user;

  const { searchTerm, sortBy } = req.query;
	let query = `
  SELECT 
  w.id,
  w.title AS name,
  w.phone_1 AS phone,
  w.email_1 AS email,
  w.address,
  w.status,
  w.created_at,
  w.updated_at,
  u.name AS contact_person_name,
  COALESCE(COUNT(DISTINCT p.id), 0) AS total_products
  FROM warehouse w
  LEFT JOIN users u ON w.contact_person_id = u.id
  LEFT JOIN product p ON p.warehouse_id = w.id
  `;
  
  let whereConditions = [];
  let queryParams = [];
  
  if(warehouseFilter){
	whereConditions.push("w.id = ?");
	queryParams.push(warehouseFilter)
}






if (searchTerm) {
  whereConditions.push(
    `(w.title LIKE ? OR w.phone_1 LIKE ? OR w.email_1 LIKE ? OR w.address LIKE ?)`
  );
  const searchPattern = `%${searchTerm}%`;
  queryParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
}

if (whereConditions.length > 0) {
  query += ` WHERE ${whereConditions.join(" AND ")}`;
}


query += `
  GROUP BY 
    w.id,
    w.title,
    w.phone_1,
    w.email_1,
    w.address,
    w.status,
    w.created_at,
    w.updated_at,
    u.name
`;

if (sortBy === "date_asc") {
  query += ` ORDER BY w.created_at ASC`;
} else {
  query += ` ORDER BY w.created_at DESC`;
}




  const warehouses = await do_ma_query(query, queryParams);

    res.status(200).json({
      success: true,
      data: warehouses,
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Warehouses retrieved successfully.",
    });
  } catch (err) {
    console.error(`Route: ${req.originalUrl}, Error:`, err);
    res.status(500).json({
      success: false,
      data: [],
      timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
      message: "Internal server error.",
    });
  }
};




export const getAllWarehousesForDropdown = async (req, res) => {
  try {
    const warehouses = await do_ma_query(
      'SELECT id, title as name FROM warehouse ORDER BY title ASC'
    );

    res.status(200).json({
      success: true,
      data: warehouses,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });
  } catch (error) {
    console.error('Error fetching warehouses for dropdown:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching warehouses',
      error: error.message,
      timestamp: DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss'),
    });
  }
};



// Get warehouse by ID
export const getWarehouseById = async (req, res) => {
	try {
		const { id } = req.params;
		const {warehouseFilter,user} = req;

		if(warehouseFilter && parseInt(id) !==warehouseFilter ){
			return res.status(403).json({
				success:false,
				data:null,
				timestamp:DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message:"Access denied, You can only view your assigned warehouse"
			})
		}

		const id_schema = Joi.object({
			id: Joi.number().integer().min(1).required().label("warehouse ID"),
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
				w.id,
				w.title as wh_title,
				w.contact_person_id as user_id,
				REPLACE(w.phone_1, '+91', '') as phone_1,
				w.email_1,
				w.address,
				w.status,
				w.created_at,
				w.updated_at,
				u.name as contact_person_name
				
			FROM warehouse w
			LEFT JOIN users u ON w.contact_person_id = u.id
			WHERE w.id = ?
		`;

		const warehouse = await do_ma_query(query, [id]);

		if (warehouse.length === 0) {
			return res.status(404).json({
				success: false,
				data: null,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Warehouse not found.",
			});
		}

		res.status(200).json({	
			success: true,
			data: warehouse[0],
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Warehouse retrieved successfully.",
		});
	} catch (err) {
		console.error(`Route: ${req.originalUrl}, Error:`, err);
		res.status(500).json({
			success: false,
			data: null,
			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
			message: "Internal server error.",
		});
	}
};




  
 export const createWh = async (req, res) => {
	try {
		const wh_label = "warehouse title";
		const user_id_label = "user ID";
		const phone_no_label = "phone number";
		const email_id_label = "email ID";
		const address_label = "address";

		const wh_schema = Joi.object({
			wh_title: Joi.string()
				.min(3)
				.max(127)
				.pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
				.required()
				.label(wh_label)
				.messages({
					"string.pattern.base": `${wh_label} can include letters (a-z), numbers (0-9), and these special characters (-_.). You cannot start or end a ${wh_label} with a special character or use multiple special characters in a row.`,
				}),
			user_id: Joi.number().integer().min(1).required().label(user_id_label),
			phone_1: Joi.string()
				.pattern(new RegExp("^[0-9]{10}$"))
				.required()
				.label(phone_no_label)
				.messages({
					"string.pattern.base": `${phone_no_label} must have exactly 10 digits and contain only numbers.`,
				}),
			email_1: Joi.string().max(127).email().required().label(email_id_label),
			address: Joi.string().min(10).max(255).required().label(address_label),
		});

		const { error, value } = wh_schema.validate(req.body, { abortEarly: false });

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		let phone_no = "+91" + value.phone_1;

		let verify_unique = await do_ma_query(
			"SELECT COUNT(*) AS count FROM warehouse WHERE title = ? OR phone_1 = ? OR email_1 = ?;",
			[value.wh_title, phone_no, value.email_1]
		);

		if (verify_unique[0].count > 0) {
			return res.status(422).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Resource already taken.",
			});
		}

		// also verify user_id existence from the DB

		let wh_insert_res = await do_ma_query(
			`INSERT INTO warehouse SET title = ?, contact_person_id = ?, phone_1 = ?, email_1 = ?, address = ?, status = "active", created_at = NOW(), updated_at = NOW();`,
			[value.wh_title, value.user_id, phone_no, value.email_1, value.address]
		);

		if (wh_insert_res.affectedRows === 1) {
		 const [user] = await do_ma_query(
        "SELECT name FROM users WHERE id = ?",
        [value.user_id]
      );

      await logActivity({
        activity_type: 'warehouse',
        action: 'created',
        entity_id: wh_insert_res.insertId,
        entity_name: value.wh_title,
        description: `Warehouse "${value.wh_title}" created`,
        user_id: req.user?.id || value.user_id,
        user_name: req.user?.name || user[0]?.name || 'System',
        warehouse_id: wh_insert_res.insertId,
        warehouse_name: value.wh_title,
        metadata: {
          contact_person: user[0]?.name || 'Unknown',
          email: value.email_1,
          phone: phone_no,
          address: value.address
        }
      });

      res.status(201).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse created successfully.",
      });
    } else {
      res.status(304).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse creation failed.",
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



// export const updateWarehouse = async (req, res) => {
// 	try {
// 		const { id } = req.params;

// 		const wh_label = "warehouse title";
// 		const user_id_label = "user ID";
// 		const phone_no_label = "phone number";
// 		const email_id_label = "email ID";
// 		const address_label = "address";

// 		const wh_schema = Joi.object({
// 			wh_title: Joi.string()
// 				.min(3)
// 				.max(127)
// 				.pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
// 				.required()
// 				.label(wh_label)
// 				.messages({
// 					"string.pattern.base": `${wh_label} can include letters (a-z), numbers (0-9), and these special characters (-_.). You cannot start or end a ${wh_label} with a special character or use multiple special characters in a row.`,
// 				}),
// 			user_id: Joi.number().integer().min(1).required().label(user_id_label),
// 			phone_1: Joi.string()
// 				.pattern(new RegExp("^[0-9]{10}$"))
// 				.required()
// 				.label(phone_no_label)
// 				.messages({
// 					"string.pattern.base": `${phone_no_label} must have exactly 10 digits and contain only numbers.`,
// 				}),
// 			email_1: Joi.string().max(127).email().required().label(email_id_label),
// 			address: Joi.string().min(10).max(255).required().label(address_label),
// 		});

// 		const { error, value } = wh_schema.validate(req.body, { abortEarly: false });

// 		if (error) {
// 			return res.status(400).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: error.details[0].message,
// 			});
// 		}

// 		// Check if warehouse exists
// 		let wh_check = await do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE id = ?;", [id]);
		
// 		if (wh_check[0].count === 0) {
// 			return res.status(404).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: "Warehouse not found.",
// 			});
// 		}

// 		let phone_no = "+91" + value.phone_1;

// 		// Check for duplicates excluding current warehouse
// 		let verify_unique = await do_ma_query(
// 			"SELECT COUNT(*) AS count FROM warehouse WHERE (title = ? OR phone_1 = ? OR email_1 = ?) AND id != ?;",
// 			[value.wh_title, phone_no, value.email_1, id]
// 		);

// 		if (verify_unique[0].count > 0) {
// 			return res.status(422).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: "Warehouse with this title, phone, or email already exists.",
// 			});
// 		}

// 		// Verify user exists
// 		let user_check = await do_ma_query("SELECT COUNT(*) AS count FROM users WHERE id = ?;", [value.user_id]);
		
// 		if (user_check[0].count === 0) {
// 			return res.status(404).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: "Contact person not found.",
// 			});
// 		}

// 		  let [oldWarehouse] = await do_ma_query("SELECT * FROM warehouse WHERE id = ?", [id]);

// 		let wh_update_res = await do_ma_query(
// 			`UPDATE warehouse SET title = ?, contact_person_id = ?, phone_1 = ?, email_1 = ?, address = ?, updated_at = NOW() WHERE id = ?;`,
// 			[value.wh_title, value.user_id, phone_no, value.email_1, value.address, id]
// 		);

	


// 		if (wh_update_res.affectedRows === 1) {
// 			 const changes = [];
//       if (oldWarehouse[0].title !== value.wh_title) changes.push(`name: ${oldWarehouse[0].title} → ${value.wh_title}`);
//       if (oldWarehouse[0].email_1 !== value.email_1) changes.push('email changed');
//       if (oldWarehouse[0].address !== value.address) changes.push('address changed');

//       await logActivity({
//         activity_type: 'warehouse',
//         action: 'updated',
//         entity_id: id,
//         entity_name: value.wh_title,
//         description: `Warehouse "${value.wh_title}" updated${changes.length ? ': ' + changes.join(', ') : ''}`,
//         user_id: req.user?.id || value.user_id,
//         user_name: req.user?.name || 'System',
//         warehouse_id: id,
//         warehouse_name: value.wh_title,
//         metadata: {
//           changes: changes,
//           updated_by: req.user?.name || 'System'
//         }
//       });

//       res.status(200).json({
//         success: true,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "Warehouse updated successfully.",
//       });
//     } else {
//       res.status(304).json({
//         success: false,
//         timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//         message: "No changes made to warehouse.",
//       });
//     }
//   } catch (err) {
//     console.error(`Route: ${req.originalUrl}, Error:`, err);
//     res.status(500).json({
//       success: false,
//       timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
//       message: "Internal server error.",
//     });
//   }
// };

// Update warehouse



export const updateWarehouse = async (req, res) => {
  try {
    const { id } = req.params;

    const wh_label = "warehouse title";
    const user_id_label = "user ID";
    const phone_no_label = "phone number";
    const email_id_label = "email ID";
    const address_label = "address";

    const wh_schema = Joi.object({
      wh_title: Joi.string()
        .min(3)
        .max(127)
        .pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
        .required()
        .label(wh_label)
        .messages({
          "string.pattern.base": `${wh_label} can include letters (a-z), numbers (0-9), and these special characters (-_.). You cannot start or end a ${wh_label} with a special character or use multiple special characters in a row.`,
        }),
      user_id: Joi.number().integer().min(1).required().label(user_id_label),
      phone_1: Joi.string()
        .pattern(new RegExp("^[0-9]{10}$"))
        .required()
        .label(phone_no_label)
        .messages({
          "string.pattern.base": `${phone_no_label} must have exactly 10 digits and contain only numbers.`,
        }),
      email_1: Joi.string().max(127).email().required().label(email_id_label),
      address: Joi.string().min(10).max(255).required().label(address_label),
    });

    const { error, value } = wh_schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: error.details[0].message,
      });
    }

  
    let whRows = await do_ma_query("SELECT * FROM warehouse WHERE id = ?", [id]);
    if (whRows.length === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse not found.",
      });
    }

    let oldWarehouse = whRows[0];

    let phone_no = "+91" + value.phone_1;

    
    let verify_unique = await do_ma_query(
      "SELECT COUNT(*) AS count FROM warehouse WHERE (title = ? OR phone_1 = ? OR email_1 = ?) AND id != ?;",
      [value.wh_title, phone_no, value.email_1, id]
    );

    if (verify_unique[0].count > 0) {
      return res.status(422).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse with this title, phone, or email already exists.",
      });
    }

    
    let userRows = await do_ma_query("SELECT name FROM users WHERE id = ?", [value.user_id]);
    if (userRows.length === 0) {
      return res.status(404).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Contact person not found.",
      });
    }
    let contactPersonName = userRows[0].name;

    // Update warehouse
    let wh_update_res = await do_ma_query(
      `UPDATE warehouse 
       SET title = ?, contact_person_id = ?, phone_1 = ?, email_1 = ?, address = ?, updated_at = NOW() 
       WHERE id = ?;`,
      [value.wh_title, value.user_id, phone_no, value.email_1, value.address, id]
    );

    if (wh_update_res.affectedRows === 1) {
      
      const changes = [];
      if (oldWarehouse.title !== value.wh_title) changes.push(`title: ${oldWarehouse.title} → ${value.wh_title}`);
      if (oldWarehouse.email_1 !== value.email_1) changes.push(`email: ${oldWarehouse.email_1} → ${value.email_1}`);
      if (oldWarehouse.address !== value.address) changes.push(`address changed`);
      if (oldWarehouse.phone_1 !== phone_no) changes.push(`phone: ${oldWarehouse.phone_1} → ${phone_no}`);
      if (oldWarehouse.contact_person_id !== value.user_id) changes.push(`contact person: ${oldWarehouse.contact_person_id} → ${value.user_id}`);

    
      await logActivity({
        activity_type: 'warehouse',
        action: 'updated',
        entity_id: id,
        entity_name: value.wh_title,
        description: `Warehouse "${value.wh_title}" updated${changes.length ? ': ' + changes.join(', ') : ''}`,
        user_id: req.user?.id || value.user_id,
        user_name: req.user?.name || contactPersonName || 'System',
        warehouse_id: id,
        warehouse_name: value.wh_title,
        metadata: {
          changes: changes,
          updated_by: req.user?.name || contactPersonName || 'System'
        }
      });

      res.status(200).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse updated successfully.",
      });
    } else {
      res.status(304).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "No changes made to warehouse.",
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



// Delete
export const deleteWarehouse = async (req, res) => {
	try {
		const { id } = req.params;

		const id_schema = Joi.object({
			id: Joi.number().integer().min(1).required().label("warehouse ID"),
		});

		const { error } = id_schema.validate({ id }, { abortEarly: false });

		if (error) {
			return res.status(400).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: error.details[0].message,
			});
		}

		// Check if warehouse exists
		let wh_check = await do_ma_query("SELECT COUNT(*) AS count FROM warehouse WHERE id = ?;", [id]);
		
		if (wh_check[0].count === 0) {
			return res.status(404).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Warehouse not found.",
			});
		}

		

		// Check if warehouse has products
		let product_check = await do_ma_query("SELECT COUNT(*) AS count FROM product WHERE warehouse_id = ?;", [id]);
		
		if (product_check[0].count > 0) {
			return res.status(409).json({
				success: false,
				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
				message: "Cannot delete warehouse with existing products. Please remove products first.",
			});
		}

		

		let wh_delete_res = await do_ma_query("DELETE FROM warehouse WHERE id = ?;", [id]);

		if (wh_delete_res.affectedRows === 1) {
			 await logActivity({
        activity_type: 'warehouse',
        action: 'deleted',
        entity_id: id,
        entity_name: warehouse[0].title,
        description: `Warehouse "${warehouse[0].title}" deleted`,
        user_id: req.user?.id || null,
        user_name: req.user?.name || 'System',
        warehouse_id: id,
        warehouse_name: warehouse[0].title,
        metadata: {
          deleted_warehouse_email: warehouse[0].email_1,
          deleted_warehouse_phone: warehouse[0].phone_1,
          deleted_by: req.user?.name || 'System'
        }
      });

      res.status(200).json({
        success: true,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse deleted successfully.",
      });
    } else {
      res.status(304).json({
        success: false,
        timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
        message: "Warehouse deletion failed.",
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



// export const get = async (req, res) => {
//   try {
//     const { search, storeName, country, sortBy } = req.query;

//     let query = `
//       SELECT 
//         w.*,
//         u.name AS user_name,
//       FROM warehouses w
//       LEFT JOIN users u ON w.user_id = u.id
//       WHERE 1=1
//     `;
//     const params = [];

//     if (search) {
//       query += ` AND (w.title LIKE ? OR u.name LIKE ? OR w.phone_1 LIKE ?)`;
//       params.push(`%${search}%`, `%${search}%`, `%${search}%`);
//     }

//     if (storeName) {
//       query += ` AND w.title = ?`;
//       params.push(storeName);
//     }

//     if (country) {
//       query += ` AND w.country = ?`;
//       params.push(country);
//     }

//     if (sortBy === 'date_asc') query += ` ORDER BY w.created_at ASC`;
//     else if (sortBy === 'date_desc') query += ` ORDER BY w.created_at DESC`;
//     else query += ` ORDER BY w.id DESC`;

//     const [warehouses] = await pool.execute(query, params);

//     res.json({ success: true, data: warehouses });
//   } catch (error) {
//     console.error('Error fetching warehouses:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };



// export const getById = async (req, res) => {
//   try {
//     const [warehouses] = await pool.execute(
//       `SELECT 
//         w.*,
//         u.name AS user_name,
//       FROM warehouses w
//       LEFT JOIN users u ON w.user_id = u.id
//       WHERE w.id = ?`,
//       [req.params.id]
//     );

//     if (warehouses.length === 0)
//       return res.status(404).json({ success: false, message: 'Warehouse not found' });

//     res.json({ success: true, data: warehouses[0] });
//   } catch (error) {
//     console.error('Error fetching warehouse:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };



// export const post = async (req, res) => {
//   try {
//     const { title, user_id, phone_1, email_1, address, status } = req.body;

//     // Validation
//     if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
//     if (!user_id) return res.status(400).json({ success: false, message: 'User ID is required' });
//     if (!phone_1) return res.status(400).json({ success: false, message: 'Phone is required' });
//     if (!email_1) return res.status(400).json({ success: false, message: 'Email is required' });
//     if (!address) return res.status(400).json({ success: false, message: 'Address is required' });

//     const allowedStatus = ['active', 'inactive'];
//     const warehouseStatus = allowedStatus.includes(status) ? status : 'active';

//     const [result] = await pool.execute(
//       `INSERT INTO warehouses (title, user_id, phone_1, email_1, address, status)
//        VALUES (?, ?, ?, ?, ?, ?)`,
//       [title, user_id, phone_1, email_1, address, warehouseStatus]
//     );

//     res.status(201).json({
//       success: true,
//       message: 'Warehouse created successfully',
//       data: { id: result.insertId }
//     });
//   } catch (error) {
//     console.error('Error creating warehouse:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };



// export const put = async (req, res) => {
//   try {
//     const { title, user_id, phone_1, email_1, address, status } = req.body;

//     const allowedStatus = ['active', 'inactive'];
//     const warehouseStatus = allowedStatus.includes(status) ? status : 'active';

//     const [result] = await pool.execute(
//       `UPDATE warehouses SET
//         title = ?, user_id = ?, phone_1 = ?, email_1 = ?, address = ?, status = ?
//        WHERE id = ?`,
//       [title, user_id, phone_1, email_1, address, warehouseStatus, req.params.id]
//     );

//     if (result.affectedRows === 0)
//       return res.status(404).json({ success: false, message: 'Warehouse not found' });

//     res.json({ success: true, message: 'Warehouse updated successfully' });
//   } catch (error) {
//     console.error('Error updating warehouse:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };



// export const deleteById = async (req, res) => {
//   try {
//     const [result] = await pool.execute('DELETE FROM warehouses WHERE id = ?', [req.params.id]);

//     if (result.affectedRows === 0)
//       return res.status(404).json({ success: false, message: 'Warehouse not found' });

//     res.json({ success: true, message: 'Warehouse deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting warehouse:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// };






// // Get unique countries (for filter dropdown)
// router.get('/warehouses/filters/countries', authMiddleware, async (req, res) => {
//   try {
//     const [countries] = await db.query(
//       'SELECT DISTINCT country FROM warehouses WHERE country IS NOT NULL ORDER BY country'
//     );
    
//     res.json({
//       success: true,
//       data: countries.map(c => c.country)
//     });
//   } catch (error) {
//     console.error('Error fetching countries:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });

// // Get unique store names (for filter dropdown)
// router.get('/warehouses/filters/stores', authMiddleware, async (req, res) => {
//   try {
//     const [stores] = await db.query(
//       'SELECT DISTINCT name FROM warehouses ORDER BY name'
//     );
    
//     res.json({
//       success: true,
//       data: stores.map(s => s.name)
//     });
//   } catch (error) {
//     console.error('Error fetching stores:', error);
//     res.status(500).json({ success: false, message: 'Server error' });
//   }
// });








// // Create warehouse
// export const createWh = async (req, res) => {
// 	try {
// 		const wh_label = "warehouse title";
// 		const user_id_label = "user ID";
// 		const phone_no_label = "phone number";
// 		const email_id_label = "email ID";
// 		const address_label = "address";

// 		const wh_schema = Joi.object({
// 			wh_title: Joi.string()
// 				.min(3)
// 				.max(127)
// 				.pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
// 				.required()
// 				.label(wh_label)
// 				.messages({
// 					"string.pattern.base": `${wh_label} can include letters (a-z), numbers (0-9), and these special characters (-_.). You cannot start or end a ${wh_label} with a special character or use multiple special characters in a row.`,
// 				}),
// 			user_id: Joi.number().integer().min(1).required().label(user_id_label),
// 			phone_1: Joi.string()
// 				.pattern(new RegExp("^[0-9]{10}$"))
// 				.required()
// 				.label(phone_no_label)
// 				.messages({
// 					"string.pattern.base": `${phone_no_label} must have exactly 10 digits and contain only numbers.`,
// 				}),
// 			email_1: Joi.string().max(127).email().required().label(email_id_label),
// 			address: Joi.string().min(10).max(255).required().label(address_label),
// 		});

// 		const { error, value } = wh_schema.validate(req.body, { abortEarly: false });

// 		if (error) {
// 			return res.status(400).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: error.details[0].message,
// 			});
// 		}

// 		let phone_no = "+91" + value.phone_1;

// 		let verify_unique = await do_ma_query(
// 			"SELECT COUNT(*) AS count FROM warehouse WHERE title = ? OR phone_1 = ? OR email_1 = ?;",
// 			[value.wh_title, phone_no, value.email_1]
// 		);

// 		if (verify_unique[0].count > 0) {
// 			return res.status(422).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: "Warehouse with this title, phone, or email already exists.",
// 			});
// 		}

// 		// Verify user exists
// 		let user_check = await do_ma_query("SELECT COUNT(*) AS count FROM users WHERE id = ?;", [value.user_id]);
		
// 		if (user_check[0].count === 0) {
// 			return res.status(404).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: "Contact person not found.",
// 			});
// 		}

// 		let wh_insert_res = await do_ma_query(
// 			`INSERT INTO warehouse SET title = ?, contact_person_id = ?, phone_1 = ?, email_1 = ?, address = ?, status = "active", created_at = NOW(), updated_at = NOW();`,
// 			[value.wh_title, value.user_id, phone_no, value.email_1, value.address]
// 		);

// 		if (wh_insert_res.affectedRows === 1) {
// 			res.status(201).json({
// 				success: true,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: "Warehouse created successfully.",
// 			});
// 		} else {
// 			res.status(304).json({
// 				success: false,
// 				timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 				message: "Warehouse creation failed.",
// 			});
// 		}
// 	} catch (err) {
// 		console.error(`Route: ${req.originalUrl}, Error:`, err);
// 		res.status(500).json({
// 			success: false,
// 			timestamp: DateTime.local().toFormat("yyyy-MM-dd HH:mm:ss"),
// 			message: "Internal server error.",
// 		});
// 	}
// };





















