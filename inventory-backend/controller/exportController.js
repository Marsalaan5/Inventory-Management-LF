import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import { do_ma_query } from '../db.js';
import { DateTime } from 'luxon';

// ============================================
// EXPORT CONFIGURATIONS FOR ALL ENTITIES
// ============================================

const exportConfigs = {
  products: {
    filename: 'products',
    title: 'Products Report',
    pageSize: 'A4',
    layout: 'landscape',
    sheetName: 'Products',
    
    baseQuery: `
      SELECT 
        p.*,
        ap.title as article_profile_name,
        w.title as warehouse_name,
        creator.name as created_by_name
      FROM product p
      LEFT JOIN article_profile ap ON p.article_profile_id = ap.art_prof_uuid
      LEFT JOIN warehouse w ON p.warehouse_id = w.id
      LEFT JOIN users creator ON p.last_updated_by = creator.id
    `,
    
    buildQuery: (filters) => {
      let whereConditions = [];
      let queryParams = [];

      if (filters.search) {
        whereConditions.push("(p.title LIKE ? OR p.barcode LIKE ?)");
        queryParams.push(`%${filters.search}%`, `%${filters.search}%`);
      }
      if (filters.status) {
        whereConditions.push("p.status = ?");
        queryParams.push(filters.status);
      }
      if (filters.warehouse_id) {
        whereConditions.push("p.warehouse_id = ?");
        queryParams.push(filters.warehouse_id);
      }
      if (filters.article_profile_id) {
        whereConditions.push("p.article_profile_id = ?");
        queryParams.push(filters.article_profile_id);
      }

      const whereClause = whereConditions.length > 0 
        ? "WHERE " + whereConditions.join(" AND ") 
        : "";

      return { whereClause, queryParams };
    },

    orderBy: 'ORDER BY p.created_at DESC',

    // PDF Table Configuration
    pdfTable: {
      headers: ['Product', 'Barcode', 'Article Profile', 'Warehouse', 'Location', 'Qty', 'Status'],
      colWidths: [150, 100, 120, 80, 100, 60, 80],
      getRowData: (item) => [
        item.title || 'N/A',
        item.barcode || 'N/A',
        item.article_profile_name || 'N/A',
        item.warehouse_name || 'N/A',
        item.location || 'N/A',
        (item.count || 0).toString(),
        item.status || 'N/A'
      ]
    },

    // Excel Configuration
    excelColumns: [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Product Name', key: 'title', width: 30 },
      { header: 'Barcode', key: 'barcode', width: 20 },
      { header: 'Article Profile', key: 'article_profile_name', width: 25 },
      { header: 'Warehouse', key: 'warehouse_name', width: 25 },
      { header: 'Location', key: 'location', width: 20 },
      { header: 'Quantity', key: 'count', width: 12 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Description', key: 'description', width: 35 },
      { header: 'Created By', key: 'created_by_name', width: 20 },
      { header: 'Created At', key: 'created_at', width: 20 },
      { header: 'Updated At', key: 'updated_at', width: 20 },
    ],

    mapDataToRow: (item) => ({
      id: item.id,
      title: item.title,
      barcode: item.barcode,
      article_profile_name: item.article_profile_name || 'N/A',
      warehouse_name: item.warehouse_name || 'N/A',
      location: item.location || 'N/A',
      count: item.count || 0,
      status: item.status,
      description: item.description || '',
      created_by_name: item.created_by_name || 'N/A',
      created_at: item.created_at ? DateTime.fromJSDate(new Date(item.created_at)).toFormat('yyyy-MM-dd HH:mm:ss') : 'N/A',
      updated_at: item.updated_at ? DateTime.fromJSDate(new Date(item.updated_at)).toFormat('yyyy-MM-dd HH:mm:ss') : 'N/A',
    })
  },


  //warehouse export configuration
warehouses: {
  filename: 'warehouses',
  title: 'Warehouses Report',
  pageSize: 'A4',
  layout: 'landscape',
  sheetName: 'Warehouses',
  
 baseQuery: `
    SELECT 
      w.id,
      w.title,
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
  `,

    groupBy: `
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
  `,
  
  buildQuery: (filters) => {
    let whereConditions = [];
    let queryParams = [];
    
    if (filters.search) {
      whereConditions.push("(w.title LIKE ? OR w.email_1 LIKE ? OR w.phone_1 LIKE ? OR w.address LIKE ?)");
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    
    if (filters.status) {
      whereConditions.push("w.status = ?");
      queryParams.push(filters.status);
    }
    
    const whereClause = whereConditions.length > 0 
      ? "WHERE " + whereConditions.join(" AND ") 
      : "";
    
    return { whereClause, queryParams };
  },
  

  orderBy: 'ORDER BY w.created_at DESC',
  
   pdfTable: {
    headers: ['Warehouse', 'Contact Person', 'Phone', 'Email', 'Address', 'Products', 'Status'],
    colWidths: [120, 110, 90, 120, 180, 60, 70],
    getRowData: (item) => [
      item.title || 'N/A',
      item.contact_person_name || 'N/A',
      (item.phone || 'N/A').replace('+91', ''), 
      item.email || 'N/A',
      (item.address || 'N/A').substring(0, 50),
      (item.total_products || 0).toString(),
      item.status || 'N/A'
    ]
  },
  
  excelColumns: [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Warehouse Name', key: 'title', width: 30 },
    { header: 'Contact Person', key: 'contact_person', width: 30 },
    { header: 'Phone', key: 'phone', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Address', key: 'address', width: 40 },
    { header: 'Total Products', key: 'total_products', width: 15 },
    { header: 'Quantity', key: 'qty', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Created At', key: 'created_at', width: 20 },
    { header: 'Updated At', key: 'updated_at', width: 20 },
  ],
  
  mapDataToRow: (item) => ({
    id: item.id,
    title: item.title, // Now matches query
    contact_person_name: item.contact_person_name || 'N/A',
    phone: (item.phone || 'N/A').replace('+91', ''),
    email: item.email || 'N/A',
    address: item.address || 'N/A',
    total_products: item.total_products || 0,
    status: item.status,
    created_at: item.created_at ? DateTime.fromJSDate(new Date(item.created_at)).toFormat('yyyy-MM-dd HH:mm:ss') : 'N/A',
    updated_at: item.updated_at ? DateTime.fromJSDate(new Date(item.updated_at)).toFormat('yyyy-MM-dd HH:mm:ss') : 'N/A',
  })
},


  users: {
    filename: 'users',
    title: 'Users Report',
    pageSize: 'A4',
    layout: 'landscape',
    sheetName: 'Users',
    
 baseQuery: `
  SELECT 
    u.id,
    u.name,
    u.username,
    u.phone,
    u.email,
    u.status,
    u.created_at,
    r.name AS role_name
  FROM users u
  LEFT JOIN roles r ON r.id = u.role_id
`,


    
    buildQuery: (filters) => {
      let whereConditions = [];
      let queryParams = [];

      if (filters.search) {
  whereConditions.push(
    "(u.name LIKE ? OR u.username LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)"
  );
  queryParams.push(
    `%${filters.search}%`,
    `%${filters.search}%`,
    `%${filters.search}%`,
    `%${filters.search}%`
  );
}

      if (filters.role_id) {
        whereConditions.push("u.role_id = ?");
        queryParams.push(filters.role_id);
      }
      if (filters.status) {
        whereConditions.push("u.status = ?");
        queryParams.push(filters.status);
      }

      const whereClause = whereConditions.length > 0 
        ? "WHERE " + whereConditions.join(" AND ") 
        : "";

      return { whereClause, queryParams };
    },

    orderBy: 'ORDER BY u.created_at DESC',

   pdfTable: {
  headers: ['Name', 'Username', 'Phone', 'Email', 'Role', 'Status', 'Created On'],
  colWidths: [100, 120, 120, 140, 90, 80, 140],
  getRowData: (item) => [
    item.name || 'N/A',
    item.username || 'N/A',
    item.phone || 'N/A',
    item.email || 'N/A',
    item.role_name || 'N/A',
    item.status || 'N/A',
    item.created_at
      ? DateTime.fromJSDate(new Date(item.created_at)).toFormat('yyyy-MM-dd')
      : 'N/A'
  ]
},

excelColumns: [
  { header: 'ID', key: 'id', width: 10 },
  { header: 'Name', key: 'name', width: 25 },
  { header: 'Username', key: 'username', width: 25 },
  { header: 'Phone', key: 'phone', width: 20 },
  { header: 'Email', key: 'email', width: 30 },
  { header: 'Role', key: 'role_name', width: 20 },
  { header: 'Status', key: 'status', width: 15 },
  { header: 'Created On', key: 'created_at', width: 20 },
],


mapDataToRow: (item) => ({
  id: item.id,
  name: item.name,
  username: item.username,
  phone: item.phone,
  email: item.email,
  role_name: item.role_name || 'N/A',
  status: item.status,
  created_at: item.created_at ? DateTime.fromJSDate(new Date(item.created_at)).toFormat('yyyy-MM-dd HH:mm:ss') : 'N/A',

})
},


stockflows: {
  filename: 'stock-flows',
  title: 'Stock Flows Report',
  pageSize: 'A4',
  layout: 'landscape',
  sheetName: 'Stock Flows',
  
  baseQuery: `
    SELECT 
      sf.*,
      w1.title as from_warehouse_name,
      w2.title as to_warehouse_name,
      ap.title as article_profile_name,
      p.title as product_name,
      p.sku as product_sku
    FROM stock_flow sf
    LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
    LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
    LEFT JOIN article_profile ap ON sf.article_profile_id = ap.id
    LEFT JOIN product p ON sf.product_id = p.id
  `,
  
  buildQuery: (filters) => {
    let whereConditions = [];
    let queryParams = [];

    if (filters.search) {
      whereConditions.push("(sf.description LIKE ? OR sf.from_loc LIKE ? OR sf.to_loc LIKE ?)");
      queryParams.push(`%${filters.search}%`, `%${filters.search}%`, `%${filters.search}%`);
    }
    if (filters.status) {
      whereConditions.push("sf.status = ?");
      queryParams.push(filters.status);
    }
    if (filters.transport) {
      whereConditions.push("sf.transport = ?");
      queryParams.push(filters.transport);
    }
    if (filters.from_wh) {
      whereConditions.push("sf.from_wh = ?");
      queryParams.push(filters.from_wh);
    }
    if (filters.to_wh) {
      whereConditions.push("sf.to_wh = ?");
      queryParams.push(filters.to_wh);
    }

    const whereClause = whereConditions.length > 0 
      ? "WHERE " + whereConditions.join(" AND ") 
      : "";

    return { whereClause, queryParams };
  },

  orderBy: 'ORDER BY sf.created_at DESC',

  pdfTable: {
    headers: ['ID', 'From WH', 'To WH', 'Article', 'Product', 'Qty', 'Transport', 'Status'],
    colWidths: [40, 100, 100, 100, 100, 50, 80, 80],
    getRowData: (item) => [
      `#${item.id}`,
      item.from_warehouse_name || 'N/A',
      item.to_warehouse_name || 'N/A',
      item.article_profile_name || 'N/A',
      item.product_name || 'N/A',
      (item.quantity || 0).toString(),
      item.transport === 'transport_co' ? 'Transport Co.' : 
        item.transport.charAt(0).toUpperCase() + item.transport.slice(1),
      item.status === 'in-transit' ? 'In Transit' :
        item.status.charAt(0).toUpperCase() + item.status.slice(1)
    ]
  },

  excelColumns: [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'From Warehouse', key: 'from_warehouse_name', width: 25 },
    { header: 'To Warehouse', key: 'to_warehouse_name', width: 25 },
    { header: 'From Location', key: 'from_loc', width: 20 },
    { header: 'To Location', key: 'to_loc', width: 20 },
    { header: 'Article Profile', key: 'article_profile_name', width: 25 },
    { header: 'Product', key: 'product_name', width: 25 },
    { header: 'Product SKU', key: 'product_sku', width: 20 },
    { header: 'Quantity', key: 'quantity', width: 12 },
    { header: 'Transport', key: 'transport', width: 15 },
    { header: 'Status', key: 'status', width: 15 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Created At', key: 'created_at', width: 20 },
  ],

  mapDataToRow: (item) => ({
    id: item.id,
    from_warehouse_name: item.from_warehouse_name || 'N/A',
    to_warehouse_name: item.to_warehouse_name || 'N/A',
    from_loc: item.from_loc || 'N/A',
    to_loc: item.to_loc || 'N/A',
    article_profile_name: item.article_profile_name || 'N/A',
    product_name: item.product_name || 'N/A',
    product_sku: item.product_sku || 'N/A',
    quantity: item.quantity || 0,
    transport: item.transport === 'transport_co' ? 'Transport Company' :
      item.transport.charAt(0).toUpperCase() + item.transport.slice(1),
    status: item.status === 'in-transit' ? 'In Transit' :
      item.status.charAt(0).toUpperCase() + item.status.slice(1),
    description: item.description || '',
    created_at: item.created_at ? DateTime.fromJSDate(new Date(item.created_at)).toFormat('yyyy-MM-dd HH:mm:ss') : 'N/A',
  })
}

};

// ============================================
// GENERIC PDF EXPORT FUNCTION
// ============================================

export const exportToPDF = async (req, res) => {
  try {
    const { entity } = req.params; 
    const filters = req.query;

    // Get configuration for the entity
    const config = exportConfigs[entity];
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: `Export configuration not found for entity: ${entity}`,
      });
    }

    // Build query
    const { whereClause, queryParams } = config.buildQuery(filters);
    
    const query = `
      ${config.baseQuery}
      ${whereClause}
      ${config.groupBy || ''}  
      ${config.orderBy}
    `;

    const data = await do_ma_query(query, queryParams);

    // Create PDF
    const doc = new PDFDocument({ 
      margin: 30, 
      size: config.pageSize, 
      layout: config.layout 
    });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${config.filename}-${Date.now()}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(config.title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(
      `Generated: ${DateTime.local().toFormat('yyyy-MM-dd HH:mm:ss')}`, 
      { align: 'center' }
    );
    doc.moveDown();

    // Table Header
    const tableTop = 120;
    const { headers, colWidths } = config.pdfTable;
    
    doc.fontSize(9).font('Helvetica-Bold');
    let xPos = 30;
    headers.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: colWidths[i], align: 'left' });
      xPos += colWidths[i];
    });

    // Header underline
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    doc.moveTo(30, tableTop + 15).lineTo(30 + totalWidth, tableTop + 15).stroke();

    // Table Rows
    doc.font('Helvetica').fontSize(8);
    let yPos = tableTop + 25;
    
    data.forEach((item) => {
      if (yPos > doc.page.height - 100) {
        doc.addPage();
        yPos = 50;
      }

      xPos = 30;
      const rowData = config.pdfTable.getRowData(item);

      rowData.forEach((cellData, i) => {
        doc.text(cellData, xPos, yPos, { 
          width: colWidths[i], 
          align: 'left', 
          ellipsis: true 
        });
        xPos += colWidths[i];
      });

      yPos += 20;
    });

    // Footer
    doc.fontSize(8).text(`Total Records: ${data.length}`, 30, doc.page.height - 50);

    doc.end();
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting to PDF',
      error: error.message,
    });
  }
};


export const exportToExcel = async (req, res) => {
  try {
    const { entity } = req.params;
    const filters = req.query;

   
    const config = exportConfigs[entity];
    
    if (!config) {
      return res.status(400).json({
        success: false,
        message: `Export configuration not found for entity: ${entity}`,
      });
    }

    // Build query
    const { whereClause, queryParams } = config.buildQuery(filters);
    
    const query = `
      ${config.baseQuery}
      ${whereClause}
      ${config.groupBy || ''}  
      ${config.orderBy}
    `;

    const data = await do_ma_query(query, queryParams);

    
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(config.sheetName);

    // Define columns
    worksheet.columns = config.excelColumns;

    
    worksheet.getRow(1).font = { bold: true, size: 12 };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' }
    };
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };


    data.forEach((item) => {
      worksheet.addRow(config.mapDataToRow(item));
    });

 
    worksheet.eachRow((row) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    });

   
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${config.filename}-${Date.now()}.xlsx`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting to Excel',
      error: error.message,
    });
  }
};



