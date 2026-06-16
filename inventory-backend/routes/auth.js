



// import express from "express";
// import {signup,signin,forgotPassword,resetPassword, verifyEmail, resendVerification,} from "../controller/authController.js";

// import {createUser,getUser,getCurrentUser,editUserById,deleteUserById,createRole,getRoles,getRoleById,updateRoleById,deleteRoleById,getProfile,getProfileById,editProfileById,getAllPermissions,getPermissionsByRole,updatePermissions,getModules,} from "../controller/userController.js";

// import { applyWarehouseFilter, authenticateToken, enforceWarehouseAccess } from "../middleware/authMiddleware.js";
// import {checkPermission} from "../middleware/checkPermission.js";
// import {deleteMenu,getAllMenuItems,getMenu,patchMenu,postMenu,postReorderMenu,putMenu,} from "../controller/menuController.js";
// import { getProduct,getProductById,createProduct,updateProductById,deleteProduct, getProductByScan, bulkCreateProducts } from "../controller/productController.js";
// import { createWh, getWhEmail, getWhPhone, getWhTitle,getAllWarehouses,getWarehouseById,deleteWarehouse,updateWarehouse, getDashboard } from "../controller/warehouseController.js";

// import { getEmails,getEmailById,markAsRead,toggleStar,deleteEmail,bulkAction,getTemplates, sendEmails, getNotifications, createNotification, createNotificationByEmail, deleteNotification, markAllNotificationsAsRead, markNotificationAsRead, getReceivedEmails, saveDraft, sendStockRequest, respondToStockRequest} from "../controller/emailController.js";
// import { exportToExcel, exportToPDF } from "../controller/exportController.js";
// import { createStockFlowWithBill, deleteStockFlow, getLowStockChartData, getOutOfStockTrendData, getStockFlowById, getStockFlowChartData, getStockFlowOptions, getStockFlows, getStockFlowStats, getStockStatusDistribution, getWarehouseComparison, receiveStockFlow, updateStockFlowById, uploadBill, uploadPhoto } from "../controller/stockController.js";
// import { generateStockFlowInvoice } from "../controller/invoiceController.js";
// import { getActivities, getActivitiesStats } from "../controller/activityController.js";
// import { createArticle, getArticle } from "../controller/articleController.js";
// import { createGLossary, editGlossary, getGlossaries, getGlossaryById } from "../controller/glossaryController.js";
// // import { exportToExcel, exportToPDF } from "../services/exportC.js";



// const router = express.Router();


// // =========================
// // User routes
// // =========================

// router.use("/users", authenticateToken);

// // Public auth routes
// router.post("/signup", signup);

// router.get('/verify-email/:token', verifyEmail);
// router.post('/resend-verification', resendVerification);

// router.post("/signin", signin);
// router.post("/forgot-password", forgotPassword);
// router.post("/reset-password", resetPassword);


// router.use(authenticateToken);

// router.get('/getDashboard',enforceWarehouseAccess,applyWarehouseFilter,getDashboard)
// // Users
// // router.get('/users/profile', getProfile);
// // router.get('/users/profile/:id', getProfileById);
// router.get("/getUser", applyWarehouseFilter ,checkPermission("User", "view"), getUser);
// // router.get("/getUserById/:id", checkPermission("User", "view"), getUserById);
// router.get("/getCurrentUser", checkPermission("User", "view"), getCurrentUser );
// router.post("/createUser", checkPermission("User", "create"), createUser);
// router.put("/editUserById/:id", checkPermission("User", "edit"), editUserById);
// router.delete("/deleteUserById/:id",checkPermission("User", "delete"),deleteUserById);

// router.get("/getProfile", authenticateToken, getProfile);
// router.get("/getProfileById/:id", authenticateToken, getProfileById);
// router.put("/editProfileById/:id", authenticateToken, editProfileById);

// // Roles
// router.get("/roles",authenticateToken,applyWarehouseFilter ,checkPermission("Role", "view"),getRoles);
// router.get("/roles/:id",authenticateToken,checkPermission("Role", "view"),getRoleById);
// router.post("/roles",authenticateToken,checkPermission("Role", "create"),createRole);
// router.put("/roles/:id",authenticateToken,checkPermission("Role", "edit"),updateRoleById);
// router.delete("/roles/:id", checkPermission("Role", "delete"), deleteRoleById);


// // Permissions
// router.get("/permissions/role/:roleId",authenticateToken,checkPermission("Permission", "view"),getPermissionsByRole);
// router.post("/permissions/update",authenticateToken,checkPermission("Permission", "edit"),updatePermissions);
// router.get("/permissions/modules",authenticateToken,checkPermission("Permission", "view"),getModules);

// // Menu
// router.get('/menu/all', authenticateToken,checkPermission("Menu Management", "view"), getAllMenuItems);
// router.get("/menu",authenticateToken,checkPermission("Menu Management", "view"),getMenu);
// router.post("/menu",authenticateToken,checkPermission("Menu Management", "create"),postMenu);
// router.put("/menu/:id",authenticateToken,checkPermission("Menu Management", "edit"),putMenu);
// router.patch("/menu/:id/status",authenticateToken,checkPermission("Menu Management", "edit"),patchMenu);
// router.delete("/menu/:id",authenticateToken,checkPermission("Menu Management", "delete"),deleteMenu);
// router.post("/menu/reorder",authenticateToken,checkPermission("Menu Management", "edit"),postReorderMenu)

// //warehouse

// router.get("/getWarehouse",authenticateToken,enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Warehouse", "view"),getAllWarehouses);
// router.get("/getWarehouseById/:id",authenticateToken, enforceWarehouseAccess,
//   applyWarehouseFilter,checkPermission("Warehouse", "view"),getWarehouseById);
// router.get("/getWarehouseEmail/unique/email/:idx",authenticateToken, enforceWarehouseAccess,
//   applyWarehouseFilter,checkPermission("Warehouse", "view"),getWhEmail);
// router.get("/getWarehouseTitle/unique/title/:idx",authenticateToken, enforceWarehouseAccess,
//   applyWarehouseFilter,checkPermission("Warehouse", "view"),getWhTitle);

// router.get("/getWarehousePhone/unique/phone/:idx",authenticateToken, enforceWarehouseAccess,
//   applyWarehouseFilter,checkPermission("Warehouse", "view"),getWhPhone);

// router.post("/createWarehouse/create",authenticateToken,checkPermission("Warehouse", "create"),createWh);

// router.route("/editWarehouseById/:id",authenticateToken,checkPermission("Warehouse", "edit"),updateWarehouse);
// // router.route("/editWarehouseById/:id").put(authenticateToken,checkPermission("Warehouse", "edit"),updateWarehouse).patch(authenticateToken,checkPermission("Warehouse", "edit"),updateWarehouse);
// router.delete("/deleteWarehouseById/:id",authenticateToken,checkPermission("Warehouse", "delete"),deleteWarehouse);


// //Glossaries
// router.get("/getGlossaries",authenticateToken,checkPermission("Glossary","view"),getGlossaries);
// router.get("/getGlossariesById",authenticateToken,checkPermission("Glossary","view"),getGlossaryById);
// router.post("/createGlossary",authenticateToken,createGLossary)
// router.put("/editGlossary",authenticateToken,editGlossary)


// //Articles Profile
// router.get("/getArticle",authenticateToken,checkPermission("ArticleProfile","view"),getArticle);
// // router.get("/getArticleById",authenticateToken,checkPermission("ArticleProfile","view"),getArt);
// router.post("/createArticle",authenticateToken,checkPermission("ArticleProfile","create"),createArticle);



// //Products
// router.get("/getProduct",authenticateToken, enforceWarehouseAccess,
//   applyWarehouseFilter,checkPermission("Product", "view"), getProduct)
// router.get("/getProductById/:id",authenticateToken, enforceWarehouseAccess,
//   applyWarehouseFilter,checkPermission("Product", "view"),getProductById);
// router.get('/getProductByScan/scan/:code',authenticateToken, enforceWarehouseAccess,
//   applyWarehouseFilter,checkPermission("Product","view"), getProductByScan);
// router.post("/createProduct",authenticateToken,checkPermission("Product", "create"), createProduct)

// router.post('/products/bulk', authenticateToken,checkPermission("Product", "create"),bulkCreateProducts);


// router.put("/editProductById/:id",authenticateToken,checkPermission("Product", "edit"),updateProductById);
// router.delete("/deleteProductById/:id",authenticateToken,checkPermission("Product", "delete"),deleteProduct);



// //StockFlow
// router.get('/getStockFlowOptions',authenticateToken,checkPermission('StockFlow', 'view'), getStockFlowOptions);
// router.get('/getStockFlows',authenticateToken,applyWarehouseFilter,checkPermission('StockFlow', 'view'),getStockFlows);
// router.get('/getStockFlowStats/stats',authenticateToken,applyWarehouseFilter,checkPermission('StockFlow', 'view'),getStockFlowStats);
// router.get('/getStockFlowByID/:id',authenticateToken,applyWarehouseFilter,checkPermission('StockFlow', 'view'),getStockFlowById);
// // router.post('/createStockFlow',authenticateToken,applyWarehouseFilter,checkPermission('StockFlow', 'create'),createStockFlow);
// router.patch('/updateStockFLowByID/:id',authenticateToken,applyWarehouseFilter,checkPermission('StockFlow', 'edit'),updateStockFlowById);
// router.delete('/deleteStockFlow/:id',authenticateToken,applyWarehouseFilter,
//   checkPermission('StockFlow', 'delete'),deleteStockFlow);

// router.post('/createStockFlow',authenticateToken,applyWarehouseFilter,checkPermission('StockFlow', 'create'),uploadBill.single('bill_file'),createStockFlowWithBill
// );

// router.post('/stock-flows/:id/receive',authenticateToken,applyWarehouseFilter,checkPermission('StockFlow', 'edit'),uploadPhoto.single('delivery_photo'),receiveStockFlow
// );



  

// router.get('/getStockFlowChartData', authenticateToken, applyWarehouseFilter,checkPermission("StockFlow", "view"), getStockFlowChartData);
// router.get('/getLowStockChartData', authenticateToken, enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"), getLowStockChartData);
// router.get('/getOutOfStockTrendData', authenticateToken, enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"), getOutOfStockTrendData);
// router.get('/getStockStatusDistribution', authenticateToken, enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"), getStockStatusDistribution);
// router.get('/getWarehouseComparison', authenticateToken, enforceWarehouseAccess,applyWarehouseFilter, checkPermission("Warehouse", "view"), getWarehouseComparison)





// // Activity routes
// router.get('/activities', authenticateToken,applyWarehouseFilter,checkPermission("Activity", "view"),getActivities);
// router.get('/activities/stats',authenticateToken,applyWarehouseFilter,checkPermission("Activity", "view"),getActivitiesStats);




// router.get("/notification", authenticateToken, checkPermission("Notification", "view"), getNotifications);
// router.post("/notification", authenticateToken, checkPermission("Notification", "create"), createNotification);
// router.post("/notification/email", authenticateToken, checkPermission("Notification", "create"), createNotificationByEmail);
// router.put("/notification/:id/read", authenticateToken, checkPermission("Notification", "edit"), markNotificationAsRead);
// router.put("/notification/mark-all-read", authenticateToken, checkPermission("Notification", "edit"), markAllNotificationsAsRead);
// router.delete("/notification/:id", authenticateToken, checkPermission("Notification", "delete"), deleteNotification);



// // router.get('/getEmail',authenticateToken,checkPermission("Email", "view") ,getEmails);
// router.get('/getEmail/:category',authenticateToken,checkPermission("Email", "view") ,getEmails);
// router.get('/getEmailById/:id',authenticateToken,checkPermission("Email", "view"), getEmailById);
// router.get('/receivedEmail', authenticateToken, checkPermission("Email","view"),getReceivedEmails);
// router.post('/draftEmail', authenticateToken,checkPermission("Email","create"),saveDraft);
// router.post('/createEmail', authenticateToken,checkPermission("Email","create"),sendEmails);
// router.post('/stock-request', authenticateToken,checkPermission("Email","create"), sendStockRequest);
// router.post('/stock-request/:id/respond', authenticateToken,checkPermission("Email","create"), respondToStockRequest);

// // router.post('/createBulkEmail/bulk/:action',authenticateToken,checkPermission("Email", "create"), bulkAction);

// router.post('/bulkEmail/:action',authenticateToken,checkPermission("Email", "edit"),bulkAction);

// router.put('/editEmailMark/:id/read',authenticateToken,checkPermission("Email", "edit"), markAsRead);
// router.put('/editEmailTogglemail/:id/star',authenticateToken,checkPermission("Email", "edit"), toggleStar);
// router.delete('/deleteEmail/:id',authenticateToken,checkPermission("Email", "delete"), deleteEmail);


// router.get('/getTemplates/all',authenticateToken,checkPermission("Templates", "view") ,getTemplates);

// router.get('/stockflow/:id/invoice',authenticateToken, generateStockFlowInvoice);


// router.get("/export/:entity/pdf",authenticateToken, exportToPDF);
// router.get("/export/:entity/excel",authenticateToken, exportToExcel);

// export default router;














// authRoutes.js - UPDATED with Stock Flow Products routes

import express from "express";
import {signup,signin,forgotPassword,resetPassword, verifyEmail, resendVerification,} from "../controller/authController.js";

import {createUser,getUser,getCurrentUser,editUserById,deleteUserById,createRole,getRoles,getRoleById,updateRoleById,deleteRoleById,getProfile,getProfileById,editProfileById,getAllPermissions,getPermissionsByRole,updatePermissions,getModules,} from "../controller/userController.js";

import { applyWarehouseFilter, authenticateToken, enforceWarehouseAccess } from "../middleware/authMiddleware.js";
import {checkPermission} from "../middleware/checkPermission.js";
import {deleteMenu,getAllMenuItems,getMenu,patchMenu,postMenu,postReorderMenu,putMenu,} from "../controller/menuController.js";
import { getProduct,getProductById,createProduct,updateProductById,deleteProduct, getProductByScan, saveLot, getLots, getLotById, deleteLot, submitLot, bulkCreateProductsWithLot, uploadInvoice } from "../controller/productController.js";
import { createWh, getWhEmail, getWhPhone, getWhTitle,getAllWarehouses,getWarehouseById,deleteWarehouse,updateWarehouse, getDashboard, getAllWarehousesForDropdown } from "../controller/warehouseController.js";

import { getEmails,getEmailById,markAsRead,toggleStar,deleteEmail,bulkAction,getTemplates, sendEmails, getNotifications, createNotification, createNotificationByEmail, deleteNotification, markAllNotificationsAsRead, markNotificationAsRead, getReceivedEmails, saveDraft, sendStockRequest, respondToStockRequest} from "../controller/emailController.js";
import { exportToExcel, exportToPDF } from "../controller/exportController.js";
// import { 
//   // createStockFlowWithBill, 
//   deleteStockFlow, getLowStockChartData, getOutOfStockTrendData, getStockFlowById, getStockFlowChartData, getStockFlowOptions, 
//   getStockFlows, getStockFlowStats, getStockStatusDistribution, getWarehouseComparison, receiveStockFlow, updateStockFlowById, 
//   uploadBill, uploadPhoto,createStockFlowWithProducts,getStockFlowProducts,
//   approveStockFlow,
//   dispatchStockFlow
// } from "../controller/stockController.js";
import { generateStockFlowInvoice } from "../controller/invoiceController.js";
import { getActivities, getActivitiesStats } from "../controller/activityController.js";
import { createArticle, getArticle } from "../controller/articleController.js";
import { createGLossary, editGlossary, getGlossaries, getGlossaryById } from "../controller/glossaryController.js";

// import { stock_transfer_submit,stock_transfer_sync } from "../controller/stockController.js";

const router = express.Router();

// =========================
// Public auth routes
// =========================
router.post("/signup", signup);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post("/signin", signin);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

// =========================
// Protected routes (require authentication)
// =========================
router.use(authenticateToken);


// Dashboard
router.get('/getDashboard',enforceWarehouseAccess,applyWarehouseFilter,getDashboard);

// =========================
// Users
// =========================
router.get("/getUser", applyWarehouseFilter ,checkPermission("User", "view"), getUser);
router.get("/getCurrentUser", checkPermission("User", "view"), getCurrentUser );
router.post("/createUser", checkPermission("User", "create"), createUser);
router.put("/editUserById/:id", checkPermission("User", "edit"), editUserById);
router.delete("/deleteUserById/:id",checkPermission("User", "delete"),deleteUserById);


// Profile
router.get("/getProfile", getProfile);
router.get("/getProfileById/:id", getProfileById);
router.put("/editProfileById/:id", editProfileById);


// =========================
// Roles
// =========================
router.get("/roles",applyWarehouseFilter ,checkPermission("Role", "view"),getRoles);
router.get("/roles/:id",checkPermission("Role", "view"),getRoleById);
router.post("/roles",checkPermission("Role", "create"),createRole);
router.put("/roles/:id",checkPermission("Role", "edit"),updateRoleById);
router.delete("/roles/:id", checkPermission("Role", "delete"), deleteRoleById);


// =========================
// Permissions
// =========================
router.get("/permissions/role/:roleId",checkPermission("Permission", "view"),getPermissionsByRole);
router.post("/permissions/update",checkPermission("Permission", "edit"),updatePermissions);
router.get("/permissions/modules",checkPermission("Permission", "view"),getModules);


// =========================
// Menu
// =========================
router.get('/menu/all', checkPermission("MenuManagement", "view"), getAllMenuItems);
router.get("/menu",checkPermission("MenuManagement", "view"),getMenu);
router.post("/menu",checkPermission("MenuManagement", "create"),postMenu);
router.put("/menu/:id",checkPermission("MenuManagement", "edit"),putMenu);
router.patch("/menu/:id/status",checkPermission("MenuManagement", "edit"),patchMenu);
router.delete("/menu/:id",checkPermission("MenuManagement", "delete"),deleteMenu);
router.post("/menu/reorder",checkPermission("MenuManagement", "edit"),postReorderMenu);


// =========================
// Warehouse
// =========================
router.get("/getWarehouse",enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Warehouse", "view"),getAllWarehouses);

router.get("/getWarehouseDropdown",checkPermission("Warehouse", "view"),getAllWarehousesForDropdown );

router.get("/getWarehouseById/:id",enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Warehouse", "view"),getWarehouseById);
router.get("/getWarehouseEmail/unique/email/:idx",enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Warehouse", "view"),getWhEmail);
router.get("/getWarehouseTitle/unique/title/:idx",enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Warehouse", "view"),getWhTitle);
router.get("/getWarehousePhone/unique/phone/:idx",enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Warehouse", "view"),getWhPhone);
router.post("/createWarehouse/create",checkPermission("Warehouse", "create"),createWh);
router.put("/editWarehouseById/:id",checkPermission("Warehouse", "edit"),updateWarehouse);
router.delete("/deleteWarehouseById/:id",checkPermission("Warehouse", "delete"),deleteWarehouse);


// =========================
// Glossaries
// =========================
router.get("/getGlossaries",checkPermission("Glossary","view"),getGlossaries);
router.get("/getGlossariesById",checkPermission("Glossary","view"),getGlossaryById);
router.post("/createGlossary",createGLossary);
router.put("/editGlossary",editGlossary);


// =========================
// Articles Profile
// =========================
router.get("/getArticle",checkPermission("ArticleProfile","view"),getArticle);
router.post("/createArticle",checkPermission("ArticleProfile","create"),createArticle);


// =========================
// Products
// =========================


router.get("/getProduct",enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"), getProduct);
router.get("/getProductById/:id",enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"),getProductById);
router.get('/getProductByScan/scan/:code',enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product","view"), getProductByScan);


router.post("/createProduct",checkPermission("Product", "create"), createProduct);

// router.post('/products/bulk', checkPermission("Product", "create"),bulkCreateProducts);
router.put("/editProductById/:id",checkPermission("Product", "edit"),updateProductById);
router.delete("/deleteProductById/:id",checkPermission("Product", "delete"),deleteProduct);


//==========================
// Lots upload 
//==========================

router.post('/lots', authenticateToken,uploadInvoice, saveLot);
router.get('/lots', authenticateToken, getLots);
router.get('/lots/:lot_id', authenticateToken, getLotById);
router.delete('/lots/:lot_id', authenticateToken, deleteLot);
router.post('/lots/:lot_id/submit', authenticateToken, submitLot);
router.post('/bulk-create-with-lot', authenticateToken, bulkCreateProductsWithLot);




// =========================
// Stock Flow - UPDATED WITH NEW ROUTES
// =========================

// Get options
// router.post('/stockFlowSync',authenticateToken,checkPermission('StockFlow', 'create'), stock_transfer_sync);
// router.post('/stockFlowSubmit',authenticateToken,checkPermission('StockFlow', 'create'), stock_transfer_submit);
// router.get('/getStockFlowOptions',authenticateToken,checkPermission('StockFlow', 'view'), getStockFlowOptions);
// router.get('/getStockFlows',authenticateToken,checkPermission('StockFlow', 'view'),getStockFlows);
// router.get('/getStockFlowStats/stats',applyWarehouseFilter,checkPermission('StockFlow', 'view'),getStockFlowStats);
// router.get('/getStockFlowByID/:id',applyWarehouseFilter,checkPermission('StockFlow', 'view'),getStockFlowById);


// router.get('/stockflows/:id/products',authenticateToken,checkPermission('StockFlow', 'view'),getStockFlowProducts);


// router.post('/createStockFlow',applyWarehouseFilter,checkPermission('StockFlow', 'create'),uploadBill.single('bill_file'),createStockFlowWithBill);

// Stock flow with multiple products
// router.post('/createStockFlowWithProducts',authenticateToken,checkPermission('StockFlow', 'create'),uploadBill.single('bill_file'),createStockFlowWithProducts);
// router.patch('/updateStockFLowByID/:id',authenticateToken,enforceWarehouseAccess,applyWarehouseFilter,checkPermission('StockFlow', 'edit'),updateStockFlowById);
// router.delete('/deleteStockFlow/:id',authenticateToken,enforceWarehouseAccess,applyWarehouseFilter,checkPermission('StockFlow', 'delete'),deleteStockFlow);




// router.post('/stockflow/:id/approve',  
//   authenticateToken,
//   enforceWarehouseAccess,
//   applyWarehouseFilter,
//   checkPermission('StockFlow', 'edit'),
//   approveStockFlow
// );

// router.post('/stockflow/:id/dispatch', 
//   authenticateToken,
//   enforceWarehouseAccess,
//   applyWarehouseFilter,
//   checkPermission('StockFlow', 'edit'),
//   dispatchStockFlow
// );

// router.post('/stockflow/:id/receive',  
//   authenticateToken,
//   enforceWarehouseAccess,
//   applyWarehouseFilter,
//   checkPermission('StockFlow', 'edit'),
//   uploadPhoto.single('delivery_photo'),
//   receiveStockFlow
// );

// Chart data endpoints
// router.get('/getStockFlowChartData', applyWarehouseFilter,checkPermission("StockFlow", "view"), getStockFlowChartData);
// router.get('/getLowStockChartData', enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"), getLowStockChartData);
// router.get('/getOutOfStockTrendData', enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"), getOutOfStockTrendData);
// router.get('/getStockStatusDistribution', enforceWarehouseAccess,applyWarehouseFilter,checkPermission("Product", "view"), getStockStatusDistribution);
// router.get('/getWarehouseComparison', enforceWarehouseAccess,applyWarehouseFilter, checkPermission("Warehouse", "view"), getWarehouseComparison);



// =========================
// Activity routes
// =========================
router.get('/activities', applyWarehouseFilter,checkPermission("Activity", "view"),getActivities);
router.get('/activities/stats',applyWarehouseFilter,checkPermission("Activity", "view"),getActivitiesStats);


// =========================
// Notifications
// =========================
router.get("/notification", checkPermission("Notification", "view"), getNotifications);
router.post("/notification", checkPermission("Notification", "create"), createNotification);
router.post("/notification/email", checkPermission("Notification", "create"), createNotificationByEmail);
router.put("/notification/:id/read", checkPermission("Notification", "edit"), markNotificationAsRead);
router.put("/notification/mark-all-read", checkPermission("Notification", "edit"), markAllNotificationsAsRead);
router.delete("/notification/:id", checkPermission("Notification", "delete"), deleteNotification);


// =========================
// Email
// =========================
router.get('/getEmail/:category',checkPermission("Email", "view") ,getEmails);
router.get('/getEmailById/:id',checkPermission("Email", "view"), getEmailById);
router.get('/receivedEmail', checkPermission("Email","view"),getReceivedEmails);
router.post('/draftEmail', checkPermission("Email","create"),saveDraft);
router.post('/createEmail', checkPermission("Email","create"),sendEmails);
router.post('/stock-request', checkPermission("Email","create"), sendStockRequest);
router.post('/stock-request/:id/respond', checkPermission("Email","create"), respondToStockRequest);
router.post('/bulkEmail/:action',checkPermission("Email", "edit"),bulkAction);
router.put('/editEmailMark/:id/read',checkPermission("Email", "edit"), markAsRead);
router.put('/editEmailTogglemail/:id/star',checkPermission("Email", "edit"), toggleStar);
router.delete('/deleteEmail/:id',checkPermission("Email", "delete"), deleteEmail);


// Templates
router.get('/getTemplates/all',checkPermission("Templates", "view") ,getTemplates);


// =========================
// Invoice & Export
// =========================
router.get('/stockflow/:id/invoice', generateStockFlowInvoice);
router.get("/export/:entity/pdf", exportToPDF);
router.get("/export/:entity/excel", exportToExcel);


export default router;