
// // invoiceController
// import PDFDocument from 'pdfkit';
// import { do_ma_query } from '../db.js';
// import { DateTime } from 'luxon';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Get current directory in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /**
//  * Generate Stock Flow Invoice with Products
//  * GET /api/stock-flows/:id/invoice
//  */
// export const generateStockFlowInvoice = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch stock flow details
//     const stockFlowQuery = `
//       SELECT 
//         sf.*,
//         w1.title as from_warehouse_name,
//         w1.address as from_warehouse_address,
//         w1.phone_1 as from_warehouse_phone,
//         w1.email_1 as from_warehouse_email,
//         w2.title as to_warehouse_name,
//         w2.address as to_warehouse_address,
//         w2.phone_1 as to_warehouse_phone,
//         w2.email_1 as to_warehouse_email
//       FROM stock_flow sf
//       LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
//       LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
//       WHERE sf.id = ?
//     `;
//     const stockFlowResult = await do_ma_query(stockFlowQuery, [id]);
//     if (!stockFlowResult || stockFlowResult.length === 0) {
//       return res.status(404).json({ success: false, message: 'Stock flow not found' });
//     }
//     const stockFlow = stockFlowResult[0];

//     // Fetch products for this stock flow
//     const productsQuery = `
//       SELECT 
//         sfp.id,
//         sfp.product_id,
//         sfp.quantity,
//         sfp.product_title,
//         sfp.barcode,
//         sfp.article_profile_name,
//         sfp.warehouse_name,
//         sfp.status,
//         p.count as current_stock,
//         p.status as current_status
//       FROM stock_flow_product sfp
//       LEFT JOIN product p ON p.id = sfp.product_id
//       WHERE sfp.stock_flow_id = ?
//       ORDER BY sfp.id ASC
//     `;
//     const products = await do_ma_query(productsQuery, [id]);

//     // Create PDF document
//     const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=stock-flow-invoice-${id}-${Date.now()}.pdf`
//     );

//     doc.pipe(res);

//     // ========================================
//     // DESIGN TOKENS - REFINED
//     // ========================================
//     const colors = {
//       primary: '#32b6c3',
//       secondary: '#64748b',
//       success: '#10b981',
//       warning: '#f59e0b',
//       danger: '#FF9F43',
//       dark: '#1e293b',
//       light: '#f8fafc',
//       border: '#e2e8f0',
//       white: '#ffffff',
//       lightGray: '#f1f5f9'
//     };

//     const fonts = {
//       bold: 'Helvetica-Bold',
//       regular: 'Helvetica',
//       italic: 'Helvetica-Oblique'
//     };

//     const sectionSpacing = 18;
//     const rowSpacing = 2;

//     // ========================================
//     // HELPER FUNCTIONS
//     // ========================================
//     const drawBox = (x, y, width, height, fillColor, strokeColor = colors.border, strokeWidth = 0.5) => {
//       doc.save();
//       doc.rect(x, y, width, height);
//       if (fillColor) {
//         doc.fillAndStroke(fillColor, strokeColor);
//       } else {
//         doc.stroke(strokeColor);
//       }
//       doc.lineWidth(strokeWidth);
//       doc.restore();
//     };

//     const drawLine = (x1, y1, x2, y2, color = colors.border, width = 0.5) => {
//       doc.save();
//       doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(width).stroke();
//       doc.restore();
//     };

//     const formatStatus = (status) => {
//       const statusMap = { 
//         approved: 'Approved', 
//         'in-transit': 'In Transit', 
//         delivered: 'Delivered' 
//       };
//       return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
//     };

//     const getStatusColor = (status) => {
//       const colorMap = { 
//         approved: colors.success, 
//         'in-transit': colors.warning, 
//         delivered: colors.primary 
//       };
//       return colorMap[status] || colors.secondary;
//     };

//     const formatTransport = (transport) => {
//       const transportMap = { 
//         transport_co: 'Transport Company', 
//         bus: 'Bus', 
//         courier: 'Courier', 
//         employee: 'Employee' 
//       };
//       return transportMap[transport] || transport;
//     };

//     let y = 40;

//     // ========================================
//     // HEADER: COMPANY LOGO & TITLE
//     // ========================================
//     let logoSize = 60;
// let logoX = 40; // left margin
// let logoY = 40; // top margin

// let logoPath = null;

// // Check possible logo paths
// const possibleLogoPaths = [
//   path.join(__dirname, '..', 'public', 'assets', 'img', 'logo.png'),
//   'C:\\Users\\Horizon\\Desktop\\React\\InvReact\\InventoryManagement\\public\\assets\\img\\logo.png',
// ];

// for (const tryPath of possibleLogoPaths) {
//   if (fs.existsSync(tryPath)) {
//     logoPath = tryPath;
//     break;
//   }
// }

// if (logoPath) {
//   doc.image(logoPath, logoX, logoY, {
//     width: logoSize,
//     height: logoSize,
//     fit: [logoSize, logoSize]
//   });
// } else {
//   // Placeholder box if logo not found
//   drawBox(logoX, logoY, logoSize, logoSize, colors.primary, colors.primary, 1);
//   doc.fontSize(20).fillColor(colors.white).font(fonts.bold)
//     .text('SF', logoX, logoY + 18, { width: logoSize, align: 'center' });
// }


//     // Title section
//    const titleX = logoX + logoSize + 15; // some space to the right of logo
// const titleY = logoY + 10;

// doc.fontSize(18).fillColor(colors.primary).font(fonts.bold)
//   .text('STOCK TRANSFER', titleX, titleY);

// doc.fontSize(10).fillColor(colors.secondary).font(fonts.regular)
//   .text('Invoice & Product Manifest', titleX, titleY + 22);


//     // Invoice Info Box - Right aligned
// const infoBoxX = 390;
// const infoBoxWidth = 165;
// const infoBoxHeight = 60;

// // Draw info box
// drawBox(infoBoxX, y, infoBoxWidth, infoBoxHeight, colors.light, colors.border, 0.5);

// // Invoice Number
// doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
//   .text('INVOICE NUMBER', infoBoxX + 12, y + 8);
// doc.fontSize(10).fillColor(colors.dark).font(fonts.bold)
//   .text(`SF-${String(id).padStart(6, '0')}`, infoBoxX + 12, y + 20);

// // Date
// doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
//   .text('DATE', infoBoxX + 12, y + 38);
// doc.fontSize(8).fillColor(colors.dark).font(fonts.regular)
//   .text(DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy'), 
//         infoBoxX + 12, y + 48);

// // Status text centered in info box
// const statusText = formatStatus(stockFlow.status);
// const statusColor = getStatusColor(stockFlow.status);

// // Draw a colored box for status
// const statusHeight = 12;
// const statusWidth = doc.widthOfString(statusText) + 16; // padding
// const statusX = infoBoxX + (infoBoxWidth - statusWidth) / 2;
// const statusY = y + infoBoxHeight - statusHeight - 6;

// drawBox(statusX, statusY, statusWidth, statusHeight, statusColor, statusColor, 0.5);

// // Draw the status text inside the colored box
// doc.fontSize(8).fillColor(colors.white).font(fonts.bold)
//   .text(statusText, statusX, statusY + 4, { width: statusWidth, align: 'center' });

// y += infoBoxHeight + 10; // move y below info box
// drawLine(40, y, 555, y, colors.primary, 1.5);
// y += 18;



//     // ========================================
//     // HELPER: PAGE SPACE CHECK
//     // ========================================
//     const checkPageSpace = (neededHeight) => {
//       if (y + neededHeight > doc.page.height - 80) {
//         doc.addPage();
//         y = 40;
//       }
//     };

//     // ========================================
//     // FROM / TO SECTION
//     // ========================================
//     const boxHeight = 95;
//     const boxWidth = 247.5;

//     // FROM Box
//     drawBox(40, y, boxWidth, boxHeight, colors.white, colors.danger, 1.5);
//     doc.fontSize(9).fillColor(colors.danger).font(fonts.bold)
//       .text('FROM', 50, y + 10);
    
//     const fromName = stockFlow.from_wh 
//       ? (stockFlow.from_warehouse_name || 'N/A') 
//       : (stockFlow.from_loc || 'External Location');
    
//     doc.fontSize(11).fillColor(colors.dark).font(fonts.bold)
//       .text(fromName, 50, y + 24, { width: boxWidth - 20, lineGap: 2 });

//     if (stockFlow.from_wh) {
//       doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular);
//       let fromY = y + 42;
      
//       if (stockFlow.from_warehouse_address) {
//         doc.text(stockFlow.from_warehouse_address, 50, fromY, { 
//           width: boxWidth - 20, 
//           lineGap: 1 
//         });
//         fromY += doc.heightOfString(stockFlow.from_warehouse_address, { 
//           width: boxWidth - 20 
//         }) + 4;
//       }
      
//       if (stockFlow.from_warehouse_phone) {
//         doc.text(`Tel: ${stockFlow.from_warehouse_phone}`, 50, fromY);
//         fromY += 12;
//       }
      
//       if (stockFlow.from_warehouse_email) {
//         doc.text(`Email: ${stockFlow.from_warehouse_email}`, 50, fromY);
//       }
//     } else {
//       doc.fontSize(8).fillColor(colors.secondary).font(fonts.italic)
//         .text('External/Custom Location', 50, y + 42);
//     }

//     // TO Box
//     const toBoxX = 307.5;
//     drawBox(toBoxX, y, boxWidth, boxHeight, colors.white, colors.success, 1.5);
//     doc.fontSize(9).fillColor(colors.success).font(fonts.bold)
//       .text('TO', toBoxX + 10, y + 10);
    
//     const toName = stockFlow.to_wh 
//       ? (stockFlow.to_warehouse_name || 'N/A') 
//       : (stockFlow.to_loc || 'External Location');
    
//     doc.fontSize(11).fillColor(colors.dark).font(fonts.bold)
//       .text(toName, toBoxX + 10, y + 24, { width: boxWidth - 20, lineGap: 2 });

//     if (stockFlow.to_wh) {
//       doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular);
//       let toY = y + 42;
      
//       if (stockFlow.to_warehouse_address) {
//         doc.text(stockFlow.to_warehouse_address, toBoxX + 10, toY, { 
//           width: boxWidth - 20, 
//           lineGap: 1 
//         });
//         toY += doc.heightOfString(stockFlow.to_warehouse_address, { 
//           width: boxWidth - 20 
//         }) + 4;
//       }
      
//       if (stockFlow.to_warehouse_phone) {
//         doc.text(`Tel: ${stockFlow.to_warehouse_phone}`, toBoxX + 10, toY);
//         toY += 12;
//       }
      
//       if (stockFlow.to_warehouse_email) {
//         doc.text(`Email: ${stockFlow.to_warehouse_email}`, toBoxX + 10, toY);
//       }
//     } else {
//       doc.fontSize(8).fillColor(colors.secondary).font(fonts.italic)
//         .text('External/Custom Location', toBoxX + 10, y + 42);
//     }

//     y += boxHeight + sectionSpacing;

//     // ========================================
//     // TRANSFER DETAILS SECTION
//     // ========================================
//     doc.fontSize(11).fillColor(colors.primary).font(fonts.bold)
//       .text('TRANSFER DETAILS', 40, y);
//     y += 16;

//     const detailsData = [
//       { 
//         label: 'Transport Method', 
//         value: formatTransport(stockFlow.transport), 
//         icon: 'T' 
//       },
//       { 
//         label: 'Total Products', 
//         value: `${products.length} items`, 
//         icon: 'P' 
//       },
//       { 
//         label: 'Total Quantity', 
//         value: `${stockFlow.quantity} units`, 
//         icon: 'Q' 
//       },
//       { 
//         label: 'Created', 
//         value: DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy HH:mm'), 
//         icon: 'D' 
//       }
//     ];

//     const detailBoxWidth = (515 / 2) - 5;
//     let detailX = 40;
//     let detailY = y;

//     detailsData.forEach((detail, index) => {
//       if (index === 2) { 
//         detailX = 40; 
//         detailY += 38; 
//       }
      
//       const bgColor = index % 2 === 0 ? colors.lightGray : colors.white;
//       drawBox(detailX, detailY, detailBoxWidth, 35, bgColor, colors.border, 0.5);

//       // Icon circle
//       drawBox(detailX + 8, detailY + 7, 20, 20, colors.primary, colors.primary, 1);
//       doc.fontSize(10).fillColor(colors.white).font(fonts.bold)
//         .text(detail.icon, detailX + 8, detailY + 11, { width: 20, align: 'center' });

//       doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
//         .text(detail.label, detailX + 35, detailY + 7);
//       doc.fontSize(10).fillColor(colors.dark).font(fonts.bold)
//         .text(detail.value, detailX + 35, detailY + 19);

//       detailX += detailBoxWidth + 10;
//     });

//     y = detailY + 48;

//     // Notes / Description
//     if (stockFlow.description) {
//       checkPageSpace(60);
//       doc.fontSize(10).fillColor(colors.primary).font(fonts.bold)
//         .text('NOTES', 40, y);
//       y += 14;
      
//       const descHeight = Math.max(35, doc.heightOfString(stockFlow.description, { 
//         width: 495, 
//         lineGap: 2 
//       }) + 16);
      
//       drawBox(40, y, 515, descHeight, colors.lightGray, colors.border, 0.5);
//       doc.fontSize(9).fillColor(colors.dark).font(fonts.regular)
//         .text(stockFlow.description, 50, y + 8, { width: 495, lineGap: 2 });
//       y += descHeight + sectionSpacing;
//     }

//     // ========================================
//     // PRODUCTS TABLE
//     // ========================================
//     checkPageSpace(50);
//     doc.fontSize(11).fillColor(colors.primary).font(fonts.bold)
//       .text('PRODUCT MANIFEST', 40, y);
//     y += 16;

//     const tableHeaders = [
//       { label: '#', width: 28, x: 40 },
//       { label: 'Barcode', width: 80, x: 68 },
//       { label: 'Product Name', width: 190, x: 148 },
//       { label: 'Category', width: 95, x: 338 },
//       { label: 'Qty', width: 45, x: 433, align: 'right' },
//       { label: 'Status', width: 70, x: 478 }
//     ];

//     const drawTableHeader = () => {
//       drawBox(40, y, 515, 26, colors.primary, colors.primary, 1);
//       tableHeaders.forEach(header => {
//         doc.fontSize(9).fillColor(colors.white).font(fonts.bold)
//           .text(header.label, header.x + 4, y + 8, { 
//             width: header.width - 8, 
//             align: header.align || 'left' 
//           });
//       });
//       y += 26;
//     };
//     //
//     drawTableHeader();

//     if (products && products.length > 0) {
//       products.forEach((product, index) => {
//         const productNameHeight = doc.heightOfString(
//           product.product_title || 'Unknown Product', 
//           { width: 182, lineGap: 1 }
//         );
//         const rowHeight = Math.max(30, productNameHeight + 14);
//         checkPageSpace(rowHeight + rowSpacing);

//         const bgColor = index % 2 === 0 ? colors.white : colors.lightGray;
//         drawBox(40, y, 515, rowHeight, bgColor, colors.border, 0.3);

//         // Index
//         doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
//           .text(String(index + 1), 44, y + (rowHeight / 2) - 4, { 
//             width: 24, 
//             align: 'center' 
//           });
        
//         // Barcode
//         doc.fontSize(8).fillColor(colors.dark).font(fonts.regular)
//           .text(product.barcode || 'N/A', 72, y + (rowHeight / 2) - 4, { width: 76 });
        
//         // Product Name
//         doc.fontSize(9).fillColor(colors.dark).font(fonts.bold)
//           .text(product.product_title || 'Unknown Product', 152, y + 6, { 
//             width: 182, 
//             lineGap: 1 
//           });
        
//         // Category (if exists)
//         if (product.article_profile_name && product.article_profile_name !== 'N/A') {
//           const categoryY = y + 6 + doc.heightOfString(
//             product.product_title || 'Unknown Product', 
//             { width: 182 }
//           ) + 2;
//           doc.fontSize(7).fillColor(colors.secondary).font(fonts.italic)
//             .text(product.article_profile_name, 152, categoryY, { width: 182 });
//         }
        
//         // Warehouse
//         doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
//           .text(product.warehouse_name || 'N/A', 342, y + (rowHeight / 2) - 4, { 
//             width: 91 
//           });
        
//         // Quantity
//         doc.fontSize(10).fillColor(colors.dark).font(fonts.bold)
//           .text(String(product.quantity), 437, y + (rowHeight / 2) - 5, { 
//             width: 41, 
//             align: 'right' 
//           });

//         // Status badge
//         const statusBadgeColor = product.status === 'new' ? colors.success : colors.secondary;
//         const statusY = y + (rowHeight / 2) - 8;
//         drawBox(483, statusY, 62, 16, statusBadgeColor, statusBadgeColor, 0.5);
//         doc.fontSize(7).fillColor(colors.white).font(fonts.bold)
//           .text(product.status ? product.status.toUpperCase() : 'N/A', 
//                 483, statusY + 4, { width: 62, align: 'center' });

//         y += rowHeight + rowSpacing;
//       });
//     } else {
//       drawBox(40, y, 515, 50, colors.lightGray, colors.border, 0.5);
//       doc.fontSize(10).fillColor(colors.secondary).font(fonts.italic)
//         .text('No products found for this stock flow', 40, y + 18, { 
//           width: 515, 
//           align: 'center' 
//         });
//       y += 50 + rowSpacing;
//     }

//     // ========================================
//     // SUMMARY SECTION
//     // ========================================
//     checkPageSpace(100);
//     y += 10;
//     const summaryBoxX = 360;
//     const summaryBoxWidth = 195;
//     const summaryBoxHeight = 85;
    
//     drawBox(summaryBoxX, y, summaryBoxWidth, summaryBoxHeight, colors.primary, colors.primary, 1.5);

//     doc.fontSize(10).fillColor(colors.white).font(fonts.bold)
//       .text('SUMMARY', summaryBoxX + 15, y + 12);
    
//     drawLine(summaryBoxX + 15, y + 28, summaryBoxX + summaryBoxWidth - 15, y + 28, colors.white, 0.5);
    
//     doc.fontSize(8).fillColor(colors.white).font(fonts.regular)
//       .text('Total Product Types:', summaryBoxX + 15, y + 36);
//     doc.fontSize(14).fillColor(colors.white).font(fonts.bold)
//       .text(String(products.length), summaryBoxX + 15, y + 48);
    
//     doc.fontSize(8).fillColor(colors.white).font(fonts.regular)
//       .text('Total Units:', summaryBoxX + 110, y + 36);
//     doc.fontSize(14).fillColor(colors.white).font(fonts.bold)
//       .text(String(stockFlow.quantity), summaryBoxX + 110, y + 48);
    
//     y += summaryBoxHeight + sectionSpacing;

//     // ========================================
//     // DELIVERY INFO (if delivered)
//     // ========================================
//     if (stockFlow.status === 'delivered' && stockFlow.received_by) {
//       checkPageSpace(80);
//       drawBox(40, y, 515, 65, colors.light, colors.success, 1);
      
//       // Checkmark icon
//       drawBox(50, y + 10, 18, 18, colors.success, colors.success, 1);
//       doc.fontSize(12).fillColor(colors.white).font(fonts.bold)
//         .text('✓', 50, y + 12, { width: 18, align: 'center' });
      
//       doc.fontSize(10).fillColor(colors.success).font(fonts.bold)
//         .text('DELIVERY CONFIRMATION', 75, y + 13);
      
//       doc.fontSize(9).fillColor(colors.dark).font(fonts.regular)
//         .text(`Received By: ${stockFlow.received_by}`, 50, y + 35);
//       doc.text(`Received At: ${DateTime.fromJSDate(new Date(stockFlow.received_at)).toFormat('dd MMM yyyy HH:mm')}`, 
//                50, y + 50);
      
//       y += 75;
//     }

//     // ========================================
//     // FOOTER
//     // ========================================
//     const pageCount = doc.bufferedPageRange().count;
//     for (let i = 0; i < pageCount; i++) {
//       doc.switchToPage(i);
//       doc.fontSize(7).fillColor(colors.secondary).font(fonts.regular)
//         .text(
//           `Page ${i + 1} of ${pageCount} | Generated on ${DateTime.now().toFormat('dd MMM yyyy HH:mm')}`,
//           40,
//           doc.page.height - 50,
//           { width: 515, align: 'center' }
//         );
//     }

//     // ========================================
//     // FINALIZE PDF
//     // ========================================
//     doc.end();

//   } catch (err) {
//     console.error('Invoice generation error:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Internal server error', 
//       error: err.message 
//     });
//   }
// };



// // invoiceController
// import PDFDocument from 'pdfkit';
// import { do_ma_query } from '../db.js';
// import { DateTime } from 'luxon';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Get current directory in ES module
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// /**
//  * Generate Stock Flow Invoice with Products
//  * GET /api/stock-flows/:id/invoice
//  */
// export const generateStockFlowInvoice = async (req, res) => {
//   try {
//     const { id } = req.params;

//     // Fetch stock flow details
//     const stockFlowQuery = `
//       SELECT 
//         sf.*,
//         w1.title as from_warehouse_name,
//         w1.address as from_warehouse_address,
//         w1.phone_1 as from_warehouse_phone,
//         w1.email_1 as from_warehouse_email,
//         w2.title as to_warehouse_name,
//         w2.address as to_warehouse_address,
//         w2.phone_1 as to_warehouse_phone,
//         w2.email_1 as to_warehouse_email
//       FROM stock_flow sf
//       LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
//       LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
//       WHERE sf.id = ?
//     `;
//     const stockFlowResult = await do_ma_query(stockFlowQuery, [id]);
//     if (!stockFlowResult || stockFlowResult.length === 0) {
//       return res.status(404).json({ success: false, message: 'Stock flow not found' });
//     }
//     const stockFlow = stockFlowResult[0];

//     // Fetch products for this stock flow
//     const productsQuery = `
//       SELECT 
//         sfp.id,
//         sfp.product_id,
//         sfp.quantity,
//         sfp.product_title,
//         sfp.barcode,
//         sfp.article_profile_name,
//         sfp.warehouse_name,
//         sfp.status,
//         p.count as current_stock,
//         p.status as current_status
//       FROM stock_flow_product sfp
//       LEFT JOIN product p ON p.id = sfp.product_id
//       WHERE sfp.stock_flow_id = ?
//       ORDER BY sfp.id ASC
//     `;
//     const products = await do_ma_query(productsQuery, [id]);

//     // Calculate status-wise breakdown
//     const statusBreakdown = products.reduce((acc, product) => {
//       const status = product.status || 'unknown';
//       acc[status] = (acc[status] || 0) + product.quantity;
//       return acc;
//     }, {});

//     // Create PDF document
//     const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

//     res.setHeader('Content-Type', 'application/pdf');
//     res.setHeader(
//       'Content-Disposition',
//       `attachment; filename=stock-flow-invoice-${id}-${Date.now()}.pdf`
//     );

//     doc.pipe(res);

// //     // ========================================
// //     // DESIGN TOKENS - REFINED
// //     // ========================================
// //     const colors = {
// //       primary: '#32b6c3',
// //       secondary: '#64748b',
// //       success: '#10b981',
// //       warning: '#f59e0b',
// //       danger: '#FF9F43',
// //       dark: '#1e293b',
// //       light: '#f8fafc',
// //       border: '#e2e8f0',
// //       white: '#ffffff',
// //       lightGray: '#f1f5f9'
// //     };

// //     const fonts = {
// //       bold: 'Helvetica-Bold',
// //       regular: 'Helvetica',
// //       italic: 'Helvetica-Oblique'
// //     };

// //     const sectionSpacing = 18;
// //     const rowSpacing = 2;

// //     // ========================================
// //     // HELPER FUNCTIONS
// //     // ========================================
// //     const drawBox = (x, y, width, height, fillColor, strokeColor = colors.border, strokeWidth = 0.5) => {
// //       doc.save();
// //       doc.rect(x, y, width, height);
// //       if (fillColor) {
// //         doc.fillAndStroke(fillColor, strokeColor);
// //       } else {
// //         doc.stroke(strokeColor);
// //       }
// //       doc.lineWidth(strokeWidth);
// //       doc.restore();
// //     };

// //     const drawLine = (x1, y1, x2, y2, color = colors.border, width = 0.5) => {
// //       doc.save();
// //       doc.moveTo(x1, y1).lineTo(x2, y2).strokeColor(color).lineWidth(width).stroke();
// //       doc.restore();
// //     };

// //     const formatStatus = (status) => {
// //       const statusMap = { 
// //         approved: 'Approved', 
// //         'in-transit': 'In Transit', 
// //         delivered: 'Delivered' 
// //       };
// //       return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
// //     };

// //     const getStatusColor = (status) => {
// //       const colorMap = { 
// //         approved: colors.success, 
// //         'in-transit': colors.warning, 
// //         delivered: colors.primary 
// //       };
// //       return colorMap[status] || colors.secondary;
// //     };

// //     const formatTransport = (transport) => {
// //       const transportMap = { 
// //         transport_co: 'Transport Company', 
// //         bus: 'Bus', 
// //         courier: 'Courier', 
// //         employee: 'Employee' 
// //       };
// //       return transportMap[transport] || transport;
// //     };

// //     let y = 40;

// //     // ========================================
// //     // HEADER: COMPANY LOGO & TITLE
// //     // ========================================
// //     let logoSize = 60;
// // let logoX = 40; // left margin
// // let logoY = 40; // top margin




// // const logoPath = path.join(__dirname, '..', 'uploads', 'avatars', 'logo.png');

// // // Check if the logo file exists
// // if (fs.existsSync(logoPath)) {
// //   // If logo exists, add it to the PDF
// //   doc.image(logoPath, logoX, logoY, {
// //     width: logoSize,
// //     height: logoSize,
// //     fit: [logoSize, logoSize]
// //   });
// // } else {
// //   // If logo doesn't exist, fallback to placeholder
// //   drawBox(logoX, logoY, logoSize, logoSize, colors.primary, colors.primary, 1);
// //   doc.fontSize(20).fillColor(colors.white).font(fonts.bold)
// //     .text('SF', logoX, logoY + 18, { width: logoSize, align: 'center' });
// // }


// //     // Title section
// //    const titleX = logoX + logoSize + 15; // some space to the right of logo
// // const titleY = logoY + 10;

// // doc.fontSize(18).fillColor(colors.primary).font(fonts.bold)
// //   .text('STOCK TRANSFER', titleX, titleY);

// // doc.fontSize(10).fillColor(colors.secondary).font(fonts.regular)
// //   .text('Invoice & Product Manifest', titleX, titleY + 22);


// //     // Invoice Info Box - Right aligned
// // const infoBoxX = 390;
// // const infoBoxWidth = 165;
// // const infoBoxHeight = 60;

// // // Draw info box
// // drawBox(infoBoxX, y, infoBoxWidth, infoBoxHeight, colors.light, colors.border, 0.5);

// // // Invoice Number
// // doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
// //   .text('INVOICE NUMBER', infoBoxX + 12, y + 8);
// // doc.fontSize(10).fillColor(colors.dark).font(fonts.bold)
// //   .text(`SF-${String(id).padStart(6, '0')}`, infoBoxX + 12, y + 20);

// // // Date
// // doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
// //   .text('DATE', infoBoxX + 12, y + 38);
// // doc.fontSize(8).fillColor(colors.dark).font(fonts.regular)
// //   .text(DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy'), 
// //         infoBoxX + 12, y + 48);

// // // Status text centered in info box
// // const statusText = formatStatus(stockFlow.status);
// // const statusColor = getStatusColor(stockFlow.status);

// // // Draw a colored box for status
// // const statusHeight = 12;
// // const statusWidth = doc.widthOfString(statusText) + 16; // padding
// // const statusX = infoBoxX + (infoBoxWidth - statusWidth) / 2;
// // const statusY = y + infoBoxHeight - statusHeight - 6;

// // drawBox(statusX, statusY, statusWidth, statusHeight, statusColor, statusColor, 0.5);

// // // Draw the status text inside the colored box
// // doc.fontSize(8).fillColor(colors.white).font(fonts.bold)
// //   .text(statusText, statusX, statusY + 4, { width: statusWidth, align: 'center' });

// // y += infoBoxHeight + 10; // move y below info box
// // drawLine(40, y, 555, y, colors.primary, 1.5);
// // y += 18;



// //     // ========================================
// //     // HELPER: PAGE SPACE CHECK
// //     // ========================================
// //     const checkPageSpace = (neededHeight) => {
// //       if (y + neededHeight > doc.page.height - 80) {
// //         doc.addPage();
// //         y = 40;
// //       }
// //     };

// //     // ========================================
// //     // FROM / TO SECTION
// //     // ========================================
// //     const boxHeight = 95;
// //     const boxWidth = 247.5;

// //     // FROM Box
// //     drawBox(40, y, boxWidth, boxHeight, colors.white, colors.danger, 1.5);
// //     doc.fontSize(9).fillColor(colors.danger).font(fonts.bold)
// //       .text('FROM', 50, y + 10);
    
// //     const fromName = stockFlow.from_wh 
// //       ? (stockFlow.from_warehouse_name || 'N/A') 
// //       : (stockFlow.from_loc || 'External Location');
    
// //     doc.fontSize(11).fillColor(colors.dark).font(fonts.bold)
// //       .text(fromName, 50, y + 24, { width: boxWidth - 20, lineGap: 2 });

// //     if (stockFlow.from_wh) {
// //       doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular);
// //       let fromY = y + 42;
      
// //       if (stockFlow.from_warehouse_address) {
// //         doc.text(stockFlow.from_warehouse_address, 50, fromY, { 
// //           width: boxWidth - 20, 
// //           lineGap: 1 
// //         });
// //         fromY += doc.heightOfString(stockFlow.from_warehouse_address, { 
// //           width: boxWidth - 20 
// //         }) + 4;
// //       }
      
// //       if (stockFlow.from_warehouse_phone) {
// //         doc.text(`Tel: ${stockFlow.from_warehouse_phone}`, 50, fromY);
// //         fromY += 12;
// //       }
      
// //       if (stockFlow.from_warehouse_email) {
// //         doc.text(`Email: ${stockFlow.from_warehouse_email}`, 50, fromY);
// //       }
// //     } else {
// //       doc.fontSize(8).fillColor(colors.secondary).font(fonts.italic)
// //         .text('External/Custom Location', 50, y + 42);
// //     }

// //     // TO Box
// //     const toBoxX = 307.5;
// //     drawBox(toBoxX, y, boxWidth, boxHeight, colors.white, colors.success, 1.5);
// //     doc.fontSize(9).fillColor(colors.success).font(fonts.bold)
// //       .text('TO', toBoxX + 10, y + 10);
    
// //     const toName = stockFlow.to_wh 
// //       ? (stockFlow.to_warehouse_name || 'N/A') 
// //       : (stockFlow.to_loc || 'External Location');
    
// //     doc.fontSize(11).fillColor(colors.dark).font(fonts.bold)
// //       .text(toName, toBoxX + 10, y + 24, { width: boxWidth - 20, lineGap: 2 });

// //     if (stockFlow.to_wh) {
// //       doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular);
// //       let toY = y + 42;
      
// //       if (stockFlow.to_warehouse_address) {
// //         doc.text(stockFlow.to_warehouse_address, toBoxX + 10, toY, { 
// //           width: boxWidth - 20, 
// //           lineGap: 1 
// //         });
// //         toY += doc.heightOfString(stockFlow.to_warehouse_address, { 
// //           width: boxWidth - 20 
// //         }) + 4;
// //       }
      
// //       if (stockFlow.to_warehouse_phone) {
// //         doc.text(`Tel: ${stockFlow.to_warehouse_phone}`, toBoxX + 10, toY);
// //         toY += 12;
// //       }
      
// //       if (stockFlow.to_warehouse_email) {
// //         doc.text(`Email: ${stockFlow.to_warehouse_email}`, toBoxX + 10, toY);
// //       }
// //     } else {
// //       doc.fontSize(8).fillColor(colors.secondary).font(fonts.italic)
// //         .text('External/Custom Location', toBoxX + 10, y + 42);
// //     }

// //     y += boxHeight + sectionSpacing;

// //     // ========================================
// //     // TRANSFER DETAILS SECTION
// //     // ========================================
// //     doc.fontSize(11).fillColor(colors.primary).font(fonts.bold)
// //       .text('TRANSFER DETAILS', 40, y);
// //     y += 16;

// //     const detailsData = [
// //       { 
// //         label: 'Transport Method', 
// //         value: formatTransport(stockFlow.transport), 
// //         icon: 'T' 
// //       },
// //       { 
// //         label: 'Total Quantity', 
// //         value: `${stockFlow.quantity} units`, 
// //         icon: 'Q' 
// //       },
// //       { 
// //         label: 'Products Count', 
// //         value: `${products.length} items`, 
// //         icon: 'P' 
// //       },
// //       { 
// //         label: 'Created', 
// //         value: DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy HH:mm'), 
// //         icon: 'D' 
// //       }
// //     ];

// //     const detailBoxWidth = (515 / 2) - 5;
// //     let detailX = 40;
// //     let detailY = y;

// //     detailsData.forEach((detail, index) => {
// //       if (index === 2) { 
// //         detailX = 40; 
// //         detailY += 38; 
// //       }
      
// //       const bgColor = index % 2 === 0 ? colors.lightGray : colors.white;
// //       drawBox(detailX, detailY, detailBoxWidth, 35, bgColor, colors.border, 0.5);

// //       // Icon circle
// //       drawBox(detailX + 8, detailY + 7, 20, 20, colors.primary, colors.primary, 1);
// //       doc.fontSize(10).fillColor(colors.white).font(fonts.bold)
// //         .text(detail.icon, detailX + 8, detailY + 11, { width: 20, align: 'center' });

// //       doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
// //         .text(detail.label, detailX + 35, detailY + 7);
// //       doc.fontSize(10).fillColor(colors.dark).font(fonts.bold)
// //         .text(detail.value, detailX + 35, detailY + 19);

// //       detailX += detailBoxWidth + 10;
// //     });

// //     y = detailY + 48;

// //     // ========================================
// //     // STATUS BREAKDOWN SECTION
// //     // ========================================
// //     if (Object.keys(statusBreakdown).length > 0) {
// //       checkPageSpace(60);
// //       doc.fontSize(10).fillColor(colors.primary).font(fonts.bold)
// //         .text('STATUS BREAKDOWN', 40, y);
// //       y += 14;
      
// //       const statusBoxHeight = 45;
// //       drawBox(40, y, 515, statusBoxHeight, colors.lightGray, colors.border, 0.5);
      
// //       let statusX = 50;
// //       const statusY = y + 10;
      
// //       Object.entries(statusBreakdown).forEach(([status, quantity], index) => {
// //         const statusText = status.charAt(0).toUpperCase() + status.slice(1);
// //         const statusColorMap = {
// //           'new': colors.success,
// //           'broken': colors.danger,
// //           'unknown': colors.secondary
// //         };
// //         const badgeColor = statusColorMap[status.toLowerCase()] || colors.secondary;
        
// //         // Draw status badge
// //         const badgeWidth = doc.widthOfString(`${statusText}: ${quantity}`) + 20;
// //         drawBox(statusX, statusY, badgeWidth, 22, badgeColor, badgeColor, 0.5);
        
// //         doc.fontSize(9).fillColor(colors.white).font(fonts.bold)
// //           .text(`${statusText}:`, statusX + 8, statusY + 6);
// //         doc.fontSize(10).fillColor(colors.white).font(fonts.bold)
// //           .text(String(quantity), statusX + doc.widthOfString(`${statusText}: `) + 8, statusY + 6);
        
// //         statusX += badgeWidth + 10;
// //       });
      
// //       y += statusBoxHeight + sectionSpacing;
// //     }

// //     // Notes / Description
// //     if (stockFlow.description) {
// //       checkPageSpace(60);
// //       doc.fontSize(10).fillColor(colors.primary).font(fonts.bold)
// //         .text('NOTES', 40, y);
// //       y += 14;
      
// //       const descHeight = Math.max(35, doc.heightOfString(stockFlow.description, { 
// //         width: 495, 
// //         lineGap: 2 
// //       }) + 16);
      
// //       drawBox(40, y, 515, descHeight, colors.lightGray, colors.border, 0.5);
// //       doc.fontSize(9).fillColor(colors.dark).font(fonts.regular)
// //         .text(stockFlow.description, 50, y + 8, { width: 495, lineGap: 2 });
// //       y += descHeight + sectionSpacing;
// //     }

// //     // ========================================
// //     // PRODUCTS TABLE
// //     // ========================================
// //     checkPageSpace(50);
// //     doc.fontSize(11).fillColor(colors.primary).font(fonts.bold)
// //       .text('PRODUCT MANIFEST', 40, y);
// //     y += 16;

// //     const tableHeaders = [
// //       { label: '#', width: 28, x: 40 },
// //       { label: 'Barcode', width: 80, x: 68 },
// //       { label: 'Product Name', width: 190, x: 148 },
// //       { label: 'Category', width: 95, x: 338 },
// //       { label: 'Qty', width: 45, x: 433, align: 'right' },
// //       { label: 'Status', width: 70, x: 478 }
// //     ];

// //     const drawTableHeader = () => {
// //       drawBox(40, y, 515, 26, colors.primary, colors.primary, 1);
// //       tableHeaders.forEach(header => {
// //         doc.fontSize(9).fillColor(colors.white).font(fonts.bold)
// //           .text(header.label, header.x + 4, y + 8, { 
// //             width: header.width - 8, 
// //             align: header.align || 'left' 
// //           });
// //       });
// //       y += 26;
// //     };
    
// //     drawTableHeader();

// //     if (products && products.length > 0) {
// //       products.forEach((product, index) => {
// //         const productNameHeight = doc.heightOfString(
// //           product.product_title || 'Unknown Product', 
// //           { width: 182, lineGap: 1 }
// //         );
// //         const rowHeight = Math.max(30, productNameHeight + 14);
// //         checkPageSpace(rowHeight + rowSpacing);

// //         const bgColor = index % 2 === 0 ? colors.white : colors.lightGray;
// //         drawBox(40, y, 515, rowHeight, bgColor, colors.border, 0.3);

// //         // Index
// //         doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
// //           .text(String(index + 1), 44, y + (rowHeight / 2) - 4, { 
// //             width: 24, 
// //             align: 'center' 
// //           });
        
// //         // Barcode
// //         doc.fontSize(8).fillColor(colors.dark).font(fonts.regular)
// //           .text(product.barcode || 'N/A', 72, y + (rowHeight / 2) - 4, { width: 76 });
        
// //         // Product Name
// //         doc.fontSize(9).fillColor(colors.dark).font(fonts.bold)
// //           .text(product.product_title || 'Unknown Product', 152, y + 6, { 
// //             width: 182, 
// //             lineGap: 1 
// //           });
        
// //         // Category (if exists)
// //         if (product.article_profile_name && product.article_profile_name !== 'N/A') {
// //           const categoryY = y + 6 + doc.heightOfString(
// //             product.product_title || 'Unknown Product', 
// //             { width: 182 }
// //           ) + 2;
// //           doc.fontSize(7).fillColor(colors.secondary).font(fonts.italic)
// //             .text(product.article_profile_name, 152, categoryY, { width: 182 });
// //         }
        
// //         // Warehouse
// //         doc.fontSize(8).fillColor(colors.secondary).font(fonts.regular)
// //           .text(product.warehouse_name || 'N/A', 342, y + (rowHeight / 2) - 4, { 
// //             width: 91 
// //           });
        
// //         // Quantity
// //         doc.fontSize(10).fillColor(colors.dark).font(fonts.bold)
// //           .text(String(product.quantity), 437, y + (rowHeight / 2) - 5, { 
// //             width: 41, 
// //             align: 'right' 
// //           });

// //         // Status badge
// //         const statusBadgeColor = product.status === 'new' ? colors.success : colors.secondary;
// //         const statusY = y + (rowHeight / 2) - 8;
// //         drawBox(483, statusY, 62, 16, statusBadgeColor, statusBadgeColor, 0.5);
// //         doc.fontSize(7).fillColor(colors.white).font(fonts.bold)
// //           .text(product.status ? product.status.toUpperCase() : 'N/A', 
// //                 483, statusY + 4, { width: 62, align: 'center' });

// //         y += rowHeight + rowSpacing;
// //       });
// //     } else {
// //       drawBox(40, y, 515, 50, colors.lightGray, colors.border, 0.5);
// //       doc.fontSize(10).fillColor(colors.secondary).font(fonts.italic)
// //         .text('No products found for this stock flow', 40, y + 18, { 
// //           width: 515, 
// //           align: 'center' 
// //         });
// //       y += 50 + rowSpacing;
// //     }

// //     // ========================================
// //     // SUMMARY SECTION
// //     // ========================================
// //     checkPageSpace(100);
// //     y += 10;
// //     const summaryBoxX = 360;
// //     const summaryBoxWidth = 195;
// //     const summaryBoxHeight = 85;
    
// //     drawBox(summaryBoxX, y, summaryBoxWidth, summaryBoxHeight, colors.primary, colors.primary, 1.5);

// //     doc.fontSize(10).fillColor(colors.white).font(fonts.bold)
// //       .text('SUMMARY', summaryBoxX + 15, y + 12);
    
// //     drawLine(summaryBoxX + 15, y + 28, summaryBoxX + summaryBoxWidth - 15, y + 28, colors.white, 0.5);
    
// //     doc.fontSize(8).fillColor(colors.white).font(fonts.regular)
// //       .text('Total Product Types:', summaryBoxX + 15, y + 36);
// //     doc.fontSize(14).fillColor(colors.white).font(fonts.bold)
// //       .text(String(products.length), summaryBoxX + 15, y + 48);
    
// //     doc.fontSize(8).fillColor(colors.white).font(fonts.regular)
// //       .text('Total Units:', summaryBoxX + 110, y + 36);
// //     doc.fontSize(14).fillColor(colors.white).font(fonts.bold)
// //       .text(String(stockFlow.quantity), summaryBoxX + 110, y + 48);
    
// //     y += summaryBoxHeight + sectionSpacing;


// //     // ========================================
// //     // DELIVERY INFO (if delivered)
// //     // ========================================
// //     if (stockFlow.status === 'delivered' && stockFlow.received_by) {
// //       checkPageSpace(80);
// //       drawBox(40, y, 515, 65, colors.light, colors.success, 1);
      
// //       // Checkmark icon
// //       drawBox(50, y + 10, 18, 18, colors.success, colors.success, 1);
// //       doc.fontSize(12).fillColor(colors.white).font(fonts.bold)
// //         .text('✓', 50, y + 12, { width: 18, align: 'center' });
      
// //       doc.fontSize(10).fillColor(colors.success).font(fonts.bold)
// //         .text('DELIVERY CONFIRMATION', 75, y + 13);
      
// //       doc.fontSize(9).fillColor(colors.dark).font(fonts.regular)
// //         .text(`Received By: ${stockFlow.received_by}`, 50, y + 35);
      
// //       const receivedAtDate = stockFlow.received_at 
// //         ? DateTime.fromJSDate(new Date(stockFlow.received_at)).toFormat('dd MMM yyyy HH:mm')
// //         : DateTime.fromJSDate(new Date(stockFlow.updated_at)).toFormat('dd MMM yyyy HH:mm');
      
// //       doc.text(`Received At: ${receivedAtDate}`, 50, y + 50);
      
// //       y += 75;
// //     }

// //     // ========================================
// //     // FOOTER
// //     // ========================================
// //     const pageCount = doc.bufferedPageRange().count;
// //     for (let i = 0; i < pageCount; i++) {
// //       doc.switchToPage(i);
// //       doc.fontSize(7).fillColor(colors.secondary).font(fonts.regular)
// //         .text(
// //           `Page ${i + 1} of ${pageCount} | Generated on ${DateTime.now().toFormat('dd MMM yyyy HH:mm')}`,
// //           40,
// //           doc.page.height - 50,
// //           { width: 515, align: 'center' }
// //         );
// //     }

// //     // ========================================
// //     // FINALIZE PDF
// //     // ========================================
// //     doc.end();

// //   } catch (err) {
// //     console.error('Invoice generation error:', err);
// //     res.status(500).json({ 
// //       success: false, 
// //       message: 'Internal server error', 
// //       error: err.message 
// //     });
// //   }
// // };


// // ========================================
// // FORMAL INVOICE DESIGN (MINIMAL)
// // ========================================

// const colors = {
//   text: '#000000',
//   lightText: '#555555',
//   border: '#000000',
//   lightGray: '#f5f5f5',
//   white: '#ffffff'
// };

// const fonts = {
//   bold: 'Helvetica-Bold',
//   regular: 'Helvetica'
// };

// let y = 40;

// const drawLine = (x1, y1, x2, y2, width = 0.5) => {
//   doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(width).stroke();
// };

// const checkPageSpace = (h) => {
//   if (y + h > doc.page.height - 80) {
//     doc.addPage();
//     y = 40;
//   }
// };

// // ========================================
// // HEADER
// // ========================================

// doc.font(fonts.bold).fontSize(16).text('STOCK TRANSFER INVOICE', 40, y);
// y += 22;

// doc.font(fonts.regular).fontSize(9);
// doc.text(`Invoice No: SF-${String(id).padStart(6, '0')}`, 40, y);
// doc.text(`Date: ${DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy')}`, 350, y);
// y += 14;

// doc.text(`Status: ${stockFlow.status.toUpperCase()}`, 40, y);
// y += 20;

// drawLine(40, y, 555, y, 1);
// y += 18;

// // ========================================
// // FROM / TO
// // ========================================

// doc.font(fonts.bold).text('FROM:', 40, y);
// doc.font(fonts.bold).text('TO:', 300, y);
// y += 14;

// doc.font(fonts.regular).fontSize(9);

// const fromText = `
// ${stockFlow.from_warehouse_name || stockFlow.from_loc || 'N/A'}
// ${stockFlow.from_warehouse_address || ''}
// Tel: ${stockFlow.from_warehouse_phone || ''}
// Email: ${stockFlow.from_warehouse_email || ''}
// `;

// const toText = `
// ${stockFlow.to_warehouse_name || stockFlow.to_loc || 'N/A'}
// ${stockFlow.to_warehouse_address || ''}
// Tel: ${stockFlow.to_warehouse_phone || ''}
// Email: ${stockFlow.to_warehouse_email || ''}
// `;

// doc.text(fromText.trim(), 40, y, { width: 230 });
// doc.text(toText.trim(), 300, y, { width: 230 });

// y += 70;

// drawLine(40, y, 555, y);
// y += 18;

// // ========================================
// // TRANSFER DETAILS
// // ========================================

// doc.font(fonts.bold).text('TRANSFER DETAILS', 40, y);
// y += 14;

// doc.font(fonts.regular);

// const details = [
//   ['Transport Method', stockFlow.transport],
//   ['Total Quantity', `${stockFlow.quantity} units`],
//   ['Products Count', `${products.length}`],
//   ['Created At', DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy HH:mm')]
// ];

// details.forEach(([k, v]) => {
//   doc.text(`${k}:`, 40, y);
//   doc.text(v, 200, y);
//   y += 14;
// });

// y += 10;
// drawLine(40, y, 555, y);
// y += 18;

// // ========================================
// // PRODUCT TABLE HEADER
// // ========================================

// doc.font(fonts.bold).fontSize(9);

// doc.text('#', 40, y);
// doc.text('Barcode', 70, y);
// doc.text('Product Name', 150, y);
// doc.text('Category', 330, y);
// doc.text('From', 400, y);
// doc.text('Qty', 470, y, { width: 40, align: 'right' });
// doc.text('Status', 520, y);

// y += 12;
// drawLine(40, y, 555, y);
// y += 8;

// // ========================================
// // PRODUCT TABLE ROWS
// // ========================================

// doc.font(fonts.regular).fontSize(8);

// products.forEach((p, i) => {
//   const rowHeight = Math.max(
//     18,
//     doc.heightOfString(p.product_title, { width: 160 })
//   );

//   checkPageSpace(rowHeight + 6);

//   if (i % 2 === 0) {
//     doc.rect(40, y - 2, 515, rowHeight + 4).fill(colors.lightGray).fillColor(colors.text);
//   }

//   doc.text(String(i + 1), 40, y);
//   doc.text(p.barcode || 'N/A', 70, y);
//   doc.text(p.product_title || 'N/A', 150, y, { width: 160 });
//   doc.text(p.article_profile_name || '-', 330, y, { width: 60 });
//   doc.text(p.warehouse_name || '-', 400, y, { width: 60 });
//   doc.text(String(p.quantity), 470, y, { width: 40, align: 'right' });
//   doc.text((p.status || '').toUpperCase(), 520, y);

//   y += rowHeight + 6;
// });

// y += 20;
// drawLine(40, y, 555, y);
// y += 18;

// // ========================================
// // SUMMARY
// // ========================================

// doc.font(fonts.bold).fontSize(10).text('SUMMARY', 40, y);
// y += 14;

// doc.font(fonts.regular).fontSize(9);
// doc.text(`Total Product Types: ${products.length}`, 40, y);
// y += 14;
// doc.text(`Total Units: ${stockFlow.quantity}`, 40, y);

// y += 30;

// // ========================================
// // FOOTER (ALL PAGES)
// // ========================================

// const pageCount = doc.bufferedPageRange().count;

// for (let i = 0; i < pageCount; i++) {
//   doc.switchToPage(i);
//   doc.fontSize(7).fillColor(colors.lightText).font(fonts.regular)
//     .text(
//       `Page ${i + 1} of ${pageCount} | Generated on ${DateTime.now().toFormat('dd MMM yyyy HH:mm')}`,
//       40,
//       doc.page.height - 40,
//       { align: 'center', width: 515 }
//     );
// }
  
//     doc.end();

//   } catch (err) {
//     console.error('Invoice generation error:', err);
//     res.status(500).json({ 
//       success: false, 
//       message: 'Internal server error', 
//       error: err.message 
//     });
//   }
// };






// invoiceController
import PDFDocument from 'pdfkit';
import { do_ma_query } from '../db.js';
import { DateTime } from 'luxon';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Generate Stock Flow Invoice with Products
 * GET /api/stock-flows/:id/invoice
 */
export const generateStockFlowInvoice = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch stock flow details
    const stockFlowQuery = `
      SELECT 
        sf.*,
        w1.title as from_warehouse_name,
        w1.address as from_warehouse_address,
        w1.phone_1 as from_warehouse_phone,
        w1.email_1 as from_warehouse_email,
        w2.title as to_warehouse_name,
        w2.address as to_warehouse_address,
        w2.phone_1 as to_warehouse_phone,
        w2.email_1 as to_warehouse_email
      FROM stock_flow sf
      LEFT JOIN warehouse w1 ON sf.from_wh = w1.id
      LEFT JOIN warehouse w2 ON sf.to_wh = w2.id
      WHERE sf.id = ?
    `;
    const stockFlowResult = await do_ma_query(stockFlowQuery, [id]);
    if (!stockFlowResult || stockFlowResult.length === 0) {
      return res.status(404).json({ success: false, message: 'Stock flow not found' });
    }
    const stockFlow = stockFlowResult[0];

    // Fetch products for this stock flow
    const productsQuery = `
      SELECT 
        sfp.id,
        sfp.product_id,
        sfp.quantity,
        sfp.product_title,
        sfp.barcode,
        sfp.article_profile_name,
        sfp.warehouse_name,
        sfp.status,
        p.count as current_stock,
        p.status as current_status
      FROM stock_flow_product sfp
      LEFT JOIN product p ON p.id = sfp.product_id
      WHERE sfp.stock_flow_id = ?
      ORDER BY sfp.id ASC
    `;
    const products = await do_ma_query(productsQuery, [id]);

    // Calculate status-wise breakdown
    const statusBreakdown = products.reduce((acc, product) => {
      const status = product.status || 'unknown';
      acc[status] = (acc[status] || 0) + product.quantity;
      return acc;
    }, {});

    // Create PDF document
    const doc = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=stock-flow-invoice-${id}-${Date.now()}.pdf`
    );

    doc.pipe(res);



    // ========================================
    // HEADER: COMPANY LOGO & TITLE
    // ========================================
// ========================================
// HEADER: COMPANY LOGO & TITLE (RIGHT SIDE)
// ========================================

const logoSize = 60;
const logoY = 40;

// calculate right aligned X
const logoX = doc.page.width - 40 - logoSize;

const logoPath = path.join(__dirname, '..', 'uploads', 'avatars', 'logo.png');

if (fs.existsSync(logoPath)) {
  doc.image(logoPath, logoX, logoY, {
    width: logoSize,
    height: logoSize,
    fit: [logoSize, logoSize],
    align: 'right'
  });
}

//for center

// const logoSize = 70;
// const logoY = 30;

// const logoPath = path.join(__dirname, '..', 'uploads', 'avatars', 'logo.png');

// if (fs.existsSync(logoPath)) {
//   doc.image(logoPath, 0, logoY, {
//     width: logoSize,
//     align: 'center'
//   });
// }




// ========================================
// FORMAL INVOICE DESIGN (MINIMAL)
// ========================================

const colors = {
  text: '#000000',
  lightText: '#555555',
  border: '#000000',
  lightGray: '#f5f5f5',
  white: '#ffffff'
};

const fonts = {
  bold: 'Helvetica-Bold',
  regular: 'Helvetica'
};

let y = 40;

const drawLine = (x1, y1, x2, y2, width = 0.5) => {
  doc.moveTo(x1, y1).lineTo(x2, y2).lineWidth(width).stroke();
};

const checkPageSpace = (h) => {
  if (y + h > doc.page.height - 80) {
    doc.addPage();
    y = 40;
  }
};

// ========================================
// HEADER
// ========================================

// doc.font(fonts.bold).fontSize(16).text('STOCK TRANSFER INVOICE', 40, y);
doc.font(fonts.bold).fontSize(16).text(
  'STOCK TRANSFER INVOICE',
  40,
  y,
  { width: 400 } // leave space for logo
);

y += 22;

doc.font(fonts.regular).fontSize(9);
doc.text(`Invoice No: SF-${String(id).padStart(6, '0')}`, 40, y);
doc.text(`Date: ${DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy')}`, 350, y);
y += 14;

doc.text(`Status: ${stockFlow.status.toUpperCase()}`, 40, y);
y += 20;

drawLine(40, y, 555, y, 1);
y += 18;

// ========================================
// FROM / TO
// ========================================

doc.font(fonts.bold).text('FROM:', 40, y);
doc.font(fonts.bold).text('TO:', 300, y);
y += 14;

doc.font(fonts.regular).fontSize(9);

const fromText = `
${stockFlow.from_warehouse_name || stockFlow.from_loc || 'N/A'}
${stockFlow.from_warehouse_address || ''}
Tel: ${stockFlow.from_warehouse_phone || ''}
Email: ${stockFlow.from_warehouse_email || ''}
`;

const toText = `
${stockFlow.to_warehouse_name || stockFlow.to_loc || 'N/A'}
${stockFlow.to_warehouse_address || ''}
Tel: ${stockFlow.to_warehouse_phone || ''}
Email: ${stockFlow.to_warehouse_email || ''}
`;

doc.text(fromText.trim(), 40, y, { width: 230 });
doc.text(toText.trim(), 300, y, { width: 230 });

y += 70;

drawLine(40, y, 555, y);
y += 18;

// ========================================
// TRANSFER DETAILS
// ========================================

doc.font(fonts.bold).text('TRANSFER DETAILS', 40, y);
y += 14;

doc.font(fonts.regular);

const details = [
  ['Transport Method', stockFlow.transport],
  ['Total Quantity', `${stockFlow.quantity} units`],
  ['Products Count', `${products.length}`],
  ['Created At', DateTime.fromJSDate(new Date(stockFlow.created_at)).toFormat('dd MMM yyyy HH:mm')]
];

details.forEach(([k, v]) => {
  doc.text(`${k}:`, 40, y);
  doc.text(v, 200, y);
  y += 14;
});

y += 10;
drawLine(40, y, 555, y);
y += 18;

// ========================================
// PRODUCT TABLE HEADER
// ========================================

doc.font(fonts.bold).fontSize(9);

doc.text('#', 40, y);
doc.text('Barcode', 70, y);
doc.text('Product Name', 150, y);
doc.text('Article Profile', 250, y);
doc.text('From', 400, y);
doc.text('Qty', 470, y, { width: 40, align: 'right' });
doc.text('Status', 520, y);

y += 12;
drawLine(40, y, 555, y);
y += 8;

// ========================================
// PRODUCT TABLE ROWS
// ========================================

doc.font(fonts.regular).fontSize(8);

products.forEach((p, i) => {
  const rowHeight = Math.max(
    18,
    doc.heightOfString(p.product_title, { width: 160 })
  );

  checkPageSpace(rowHeight + 6);

  if (i % 2 === 0) {
    doc.rect(40, y - 2, 515, rowHeight + 4).fill(colors.lightGray).fillColor(colors.text);
  }

  doc.text(String(i + 1), 40, y);
  doc.text(p.barcode || 'N/A', 70, y);
  doc.text(p.product_title || 'N/A', 150, y);
  doc.text(p.article_profile_name || '-', 250, y, { width: 140 });
  doc.text(p.warehouse_name || '-', 400, y, { width: 60 });
  doc.text(String(p.quantity), 470, y, { width: 40, align: 'right' });
  doc.text((p.status || '').toUpperCase(), 520, y);

  y += rowHeight + 6;
});

y += 20;
drawLine(40, y, 555, y);
y += 18;

// ========================================
// SUMMARY
// ========================================

// ========================================
// SUMMARY
// ========================================

doc.font(fonts.bold).fontSize(10).text('SUMMARY', 40, y);
y += 16;

doc.font(fonts.regular).fontSize(9);

doc.text(`Total Product Types: ${products.length}`, 40, y);
y += 14;

doc.text(`Total Units: ${stockFlow.quantity}`, 40, y);
y += 18;

// ---------- STATUS BREAKDOWN ----------
doc.font(fonts.bold).text('Status Breakdown:', 40, y);
y += 16;

doc.font(fonts.regular);

Object.entries(statusBreakdown).forEach(([status, qty]) => {
  doc.text(
    `${status.toUpperCase()}: ${qty} units`,
    60,
    y
  );
  y += 14;
});

// ========================================
// FOOTER (ALL PAGES)
// ========================================

const pageCount = doc.bufferedPageRange().count;

for (let i = 0; i < pageCount; i++) {
  doc.switchToPage(i);
  doc.fontSize(7).fillColor(colors.lightText).font(fonts.regular)
    .text(
      `Page ${i + 1} of ${pageCount} | Generated on ${DateTime.now().toFormat('dd MMM yyyy HH:mm')}`,
      40,
      doc.page.height - 40,
      { align: 'center', width: 515 }
    );
}
  
    doc.end();

  } catch (err) {
    console.error('Invoice generation error:', err);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error', 
      error: err.message 
    });
  }
};