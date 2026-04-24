// import axiosInstance from "./axiosInstance";

// const AuthService = {
//   register: (data) => axiosInstance.post("/auth/signup", data),

//   verifyEmail: (token) => axiosInstance.get(`/verify-email/${token}`),
//   resendVerification: (data) =>
//     axiosInstance.post("/resend-verification", data),

//   login: (data) => axiosInstance.post("/auth/signin", data),
//   forgotPassword: (data) => axiosInstance.post("/auth/forgot-password", data),
//   resetPassword: (data) => axiosInstance.post("/auth/reset-password", data),

//   createUser: (data) => axiosInstance.post("/auth/createUser", data),
//   getAllUsers: () => axiosInstance.get("/auth/getAllUsers"),
//   getUser: () => axiosInstance.get("/auth/getUser"),
//   getCurrentUser: () => axiosInstance.get("/auth/getCurrentUser"),

//   getUserById: (id) => axiosInstance.get(`/auth/getUserById/${id}`),
//   editUserById: (id, data) =>
//     axiosInstance.put(`/auth/editUserById/${id}`, data, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }),
//   deleteUserById: (id) => axiosInstance.delete(`/auth/deleteUserById/${id}`),

//   // Profile
//   getProfile: () => axiosInstance.get("/auth/getProfile"),
//   updateProfile: (data) =>
//     axiosInstance.put("/auth/editProfileById", data, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//       },
//     }),
//   getProfileById: (id) => axiosInstance.get(`/auth/getProfileById/${id}`),

//   // Roles - Fixed to match your backend routes
//   getRoles: () => axiosInstance.get("/auth/roles"),
//   getRoleById: (id) => axiosInstance.get(`/auth/roles/${id}`),
//   createRole: (data) => axiosInstance.post("/auth/roles", data),
//   updateRoleById: (id, data) => axiosInstance.put(`/auth/roles/${id}`, data),
//   deleteRoleById: (id) => axiosInstance.delete(`/auth/roles/${id}`),

//   // Permissions - Fixed routes to match backend
//   getAllPermissions: () => axiosInstance.get("/auth/permissions"),
//   getPermissionsByRole: (roleId) => {
//     console.log("Fetching permissions for role:", roleId);
//     return axiosInstance.get(`/auth/permissions/role/${roleId}`);
//   },
//   updatePermissions: (roleId, permissions) => {
//     console.log("Updating permissions:", { roleId, permissions });
//     return axiosInstance.post("/auth/permissions/update", {
//       roleId,
//       permissions,
//     });
//   },
//   getModules: () => axiosInstance.get("/auth/permissions/modules"),

//   // Menu Management
//   // getMenu: (showAll = false) =>
//   //   axiosInstance.get(`/auth/menu?showAll=${showAll}`),
//   // getAllMenuItems: () => axiosInstance.get("/auth/menu?showAll=true"),

//   getMenu:() => axiosInstance.get(`/auth/menu`),
//   getAllMenuItems:() => axiosInstance.get(`/auth/menu/All`),
//   createMenuItem: (data) => axiosInstance.post("/auth/menu", data),
//   updateMenuItem: (id, data) => axiosInstance.put(`/auth/menu/${id}`, data),
//   deleteMenuItem: (id) => axiosInstance.delete(`/auth/menu/${id}`),
//   updateMenuStatus: (id, status) =>
//     axiosInstance.patch(`/auth/menu/${id}/status`, { status }),
//   reorderMenu: (menuItems) =>
//     axiosInstance.post(`/auth/menu/reorder`, { menu: menuItems }),

//   getDashboard: () => axiosInstance.get(`/auth/getDashboard`),

//   getWarehouse: () => axiosInstance.get(`/auth/getWarehouse`),
//   getWarehouseById: (id) => axiosInstance.get(`/auth/getWarehouseById/${id}`),
//   getWarehouseEmail: (idx) =>
//     axiosInstance.get(`/auth/getWarehouseEmail/unique/email/${idx}`),
//   getWarehouseTitle: (idx) =>
//     axiosInstance.get(`/auth/getWarehouseTitle/unique/title/${idx}`),
//   getWarehousePhone: (idx) =>
//     axiosInstance.get(`/auth/getWarehousePhone/unique/phone/${idx}`),
//   createWarehouse: (data) =>
//     axiosInstance.post(`/auth/createWarehouse/create`, data),
//   updateWarehouseById: (id, data) =>
//     axiosInstance.put(`/auth/editWarehouseById/${id}`, data),
//   deleteWarehouse: (id) =>
//     axiosInstance.delete(`/auth/deleteWarehouseById/${id}`),



//   getGlossaries: (params) =>
//     axiosInstance.get(`/auth/getGlossaries`, { params }),
//   getGlossaryByID: (id) => axiosInstance.get(`/auth/getGlossaryById/${id}`),

  
//   getArticleCategories: () => axiosInstance.get('/auth/listArticleCategories'),



//   getArticles: (params) => axiosInstance.get(`/auth/getArticle`, { params }),
//   getArticleById: (id) => axiosInstance.get(`/auth/getArticle/${id}`),
//   // getArticleProfileById: (id) => axiosInstance.get(`/auth/getArticleProfile/${id}`),
//   createArticle: (data) => axiosInstance.post(`/auth/createArticle`, data),
//   // updateArticleById: (id, data) => axiosInstance.put(`/auth/articleProfile/${id}`, data),
//   // deleteArticle: (id) => axiosInstance.delete(`/auth/articleProfile/${id}`),

//   //Prodcut
//   // getProduct: () => axiosInstance.get(`/auth/getProduct`),
//   getProduct: (params) => axiosInstance.get('/auth/getProduct', { params }),
//   // getAllProduct: () => axiosInstance.get(`/auth/get-all-products`),
//   getProductById: (id) => axiosInstance.get(`/auth/getProductById/${id}`),
//   getProductByScan: (code) =>
//     axiosInstance.get(`/auth/getProductByScan/scan/${code}`),
//   createProduct: (data) => axiosInstance.post(`/auth/createProduct`, data),

//  bulkCreateProducts:(data) => 
//   axiosInstance.post(`/auth/products/bulk`, { products: data }),


//   updateProductById: (prod_id, data) =>
//     axiosInstance.put(`/auth/editProductById?prod-id=${prod_id}`, data),




//   // updateProductById: (id, data) =>
//   //   axiosInstance.put(`/auth/editProductById`, { product_id: id, ...data }),
//   // updateProductById: (productId, data) => {
//   //   const payload = {
//   //     prod_id: productId,
//   //     ...data
//   //   };
//   //   console.log('Payload:', JSON.stringify(payload, null, 2));
//   //   return axiosInstance.put(`/auth/editProductById`, payload);
//   // },
  
//   deleteProduct: (id) => axiosInstance.delete(`/auth/deleteProductById/${id}`),




  
//   // Stock Flow
//   getStockFlowOptions: () => axiosInstance.get(`/auth/getStockFlowOptions`),
//   getStockFlows: () => axiosInstance.get(`/auth/getStockFlows`),
//   getStockFlowById: (id) => axiosInstance.get(`/auth/getStockFlowByID/${id}`),

//   // createStockFlowWithBill: (formData) => 
//   //   axiosInstance.post(`/auth/createStockFlow`, formData),

//     createStockFlowWithBill: (formData) => 
//     axiosInstance.post(`/auth/createStockFlow`, formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     }),
//   // createStockFlow: (data) => axiosInstance.post(`/auth/createStockFlow`, data),

//   receiveStockFlow: (id, formData) =>
//     axiosInstance.post(`/auth/stock-flows/${id}/receive`, formData),

//   updateStockFlowById: (id, data) =>
//     axiosInstance.patch(`/auth/updateStockFLowByID/${id}`, data),
//   deleteStockFlow: (id) => axiosInstance.delete(`/auth/deleteStockFlow/${id}`),
//   getStockFlowStats: () => axiosInstance.get(`/auth/getStockFlowStats/stats`),

//   getStockFlowChartData: (params) =>
//     axiosInstance.get("/auth/getStockFlowChartData", { params }),
//   getLowStockChartData: (params) =>
//     axiosInstance.get("/auth/getLowStockChartData", { params }),
//   getOutOfStockTrendData: (params) =>
//     axiosInstance.get("/auth/getOutOfStockTrendData", { params }),
//   getStockStatusDistribution: (params) =>
//     axiosInstance.get("/auth/getStockStatusDistribution", { params }),
//   getWarehouseComparison: (params) =>
//     axiosInstance.get("/auth/getWarehouseComparison", { params }),



//   getActivities: (params) => axiosInstance.get("/auth/activities", { params }),
//   getActivityStats: () => axiosInstance.get("/auth/activities/stats"),

//   //Email Service
//   getEmails: (category = "inbox", page = 1, limit = 10, search = "") =>
//     axiosInstance.get(`/auth/getEmail/${category}`, {
//       params: { page, limit, search },
//     }),
//   getEmailById: (id) => axiosInstance.get(`/auth/getEmailById/${id}`),
//   sendEmails: (data) => axiosInstance.post(`/auth/createEmail`, data),
//   saveDraft: (draftData) => axiosInstance.post(`/auth/draftEmail`, draftData),
//   sendStockRequest: (stockRequestData) =>
//     axiosInstance.post(`/auth/stock-request`, stockRequestData),
//   respondToStockRequest: (emailId, action, deadlineDays, notes = "") =>
//     axiosInstance.post(`/auth/stock-request/${emailId}/respond`, {
//       action,
//       deadlineDays,
//       notes,
//     }),

//   // sendStockRequest: (stockRequestData) =>
//   //   axiosInstance.post(`/auth/stock-request`, {
//   //     to: stockRequestData.to,
//   //     productName: stockRequestData.productName,
//   //     quantity: stockRequestData.quantity,
//   //     urgency: stockRequestData.urgency,
//   //     notes: stockRequestData.notes,
//   //     enableFollowUp: stockRequestData.enableFollowUp,
//   //     followUpDays: stockRequestData.followUpDays,
//   //     enableEscalation: stockRequestData.enableEscalation,
//   //     escalationEmail: stockRequestData.escalationEmail,
//   //     escalationDays: stockRequestData.escalationDays
//   //   }),

//   // respondToStockRequest: (emailId, action, notes = "") =>
//   //   axiosInstance.post(
//   //     `/auth/stock-request/${emailId}/respond`,
//   //     { action, notes }
//   //   ),

//   markEmailAsRead: (id) => axiosInstance.put(`/auth/editEmailMark/${id}/read`),
//   toggleEmailStar: (id, starred) =>
//     axiosInstance.put(`/auth/editEmailTogglemail/${id}/star`, { starred }),
//   deleteEmail: (id) => axiosInstance.delete(`/auth/deleteEmail/${id}`),
//   bulkEmailAction: (action, emailIds) =>
//     axiosInstance.post(`/auth/bulkEmail/${action}`, { emailIds: emailIds }),
//   getTemplates: () => axiosInstance.get(`/auth/getTemplates/all`),

//   // Notifications
//   getNotifications: (limit = 20) =>
//     axiosInstance.get(`/auth/notification`, { params: { limit } }),
//   markNotificationAsRead: (id) =>
//     axiosInstance.put(`/auth/notification/${id}/read`),
//   markAllNotificationsAsRead: () =>
//     axiosInstance.put(`/auth/notification/mark-all-read`),

//   // markAllNotificationsAsRead: () =>

//   downloadStockFlowInvoice: (id) =>
//     axiosInstance.get(`/auth/stockflow/${id}/invoice`, {
//       responseType: "blob",
//     }),


//     searchUsers: (query, limit = 5) => {
//     return axiosInstance.get('/auth/getUser', {
//       params: {
//         search: query,
//         limit: limit,
//         page: 1
//       }
//     }).catch(error => {
//       console.error('Error searching users:', error);
//       return { data: { users: [] } };
//     });
//   },


//   searchProducts: (query, limit = 5) => {
//     return axiosInstance.get('/auth/getProduct', {
//       params: {
//         search: query,
//         limit: limit,
//         page: 1
//       }
//     }).catch(error => {
//       console.error('Error searching products:', error);
//       return { data: { data: [] } };
//     });
//   },


//   searchWarehouses: (query) => {
//     return axiosInstance.get('/auth/getWarehouse', {
//       params: {
//         searchTerm: query
//       }
//     }).catch(error => {
//       console.error('Error searching warehouses:', error);
//       return { data: { data: [] } };
//     });
//   },

//   // 4. Search Article Profiles - Uses /auth/getArticle endpoint
//   searchArticles: (query, limit = 5) => {
//     return axiosInstance.get('/auth/getArticle', {
//       params: {
//         search: query,
//         limit: limit,
//         page: 1
//       }
//     }).catch(error => {
//       console.error('Error searching articles:', error);
//       return { data: { data: [] } };
//     });
//   },

//   // 5. Search Roles - Uses /auth/roles endpoint
//   searchRoles: (query) => {
//     return axiosInstance.get('/auth/roles', {
//       params: {
//         search: query
//       }
//     }).catch(error => {
//       console.error('Error searching roles:', error);
//       return { data: { roles: [] } };
//     });
//   },


    
// };

// export const updateUser = (id, data) =>
//   axiosInstance.put(`/auth/editUserById/${id}`, data, {
//     headers: {
//       "Content-Type": "multipart/form-data",
//     },
//   });

// export default AuthService;



// authService.js - UPDATED with Stock Flow with Products methods



import axiosInstance from "./axiosInstance";

const AuthService = {

  register: (data) => axiosInstance.post("/auth/signup", data),
  verifyEmail: (token) => axiosInstance.get(`/verify-email/${token}`),
  resendVerification: (data) =>axiosInstance.post("/resend-verification", data),

  login: (data) => axiosInstance.post("/auth/signin", data),
  forgotPassword: (data) => axiosInstance.post("/auth/forgot-password", data),
  resetPassword: (data) => axiosInstance.post("/auth/reset-password", data),

  createUser: (data) => axiosInstance.post("/auth/createUser", data),
  getAllUsers: () => axiosInstance.get("/auth/getAllUsers"),
  getUser: () => axiosInstance.get("/auth/getUser"),
  getCurrentUser: () => axiosInstance.get("/auth/getCurrentUser"),

  getUserById: (id) => axiosInstance.get(`/auth/getUserById/${id}`),
  editUserById: (id, data) =>axiosInstance.put(`/auth/editUserById/${id}`, data, {
      headers: {
        "Content-Type": "multipart/form-data",},}),
  deleteUserById: (id) => axiosInstance.delete(`/auth/deleteUserById/${id}`),

// -------------------------------------------------------------------------------------

  // Profile
  getProfile: () => axiosInstance.get("/auth/getProfile"),
  updateProfile: (data) =>axiosInstance.put("/auth/editProfileById", data, {
      headers: {
        "Content-Type": "multipart/form-data",},}),
  getProfileById: (id) => axiosInstance.get(`/auth/getProfileById/${id}`),


// -------------------------------------------------------------------------------------------------

  // Roles
  getRoles: () => axiosInstance.get("/auth/roles"),
  getRoleById: (id) => axiosInstance.get(`/auth/roles/${id}`),
  createRole: (data) => axiosInstance.post("/auth/roles", data),
  updateRoleById: (id, data) => axiosInstance.put(`/auth/roles/${id}`, data),
  deleteRoleById: (id) => axiosInstance.delete(`/auth/roles/${id}`),

// -------------------------------------------------------------------------------------------------

  // Permissions
  getAllPermissions: () => axiosInstance.get("/auth/permissions"),
  getPermissionsByRole: (roleId) => {
    console.log("Fetching permissions for role:", roleId);
    return axiosInstance.get(`/auth/permissions/role/${roleId}`);
  },
  updatePermissions: (roleId, permissions) => {
    console.log("Updating permissions:", { roleId, permissions });
    return axiosInstance.post("/auth/permissions/update", {
      roleId,
      permissions,
    });
  },

// -------------------------------------------------------------------------------------------------

  getModules: () => axiosInstance.get("/auth/permissions/modules"),

  // Menu Management
  getMenu:() => axiosInstance.get(`/auth/menu`),
  getAllMenuItems:() => axiosInstance.get(`/auth/menu/All`),
  createMenuItem: (data) => axiosInstance.post("/auth/menu", data),
  updateMenuItem: (id, data) => axiosInstance.put(`/auth/menu/${id}`, data),
  deleteMenuItem: (id) => axiosInstance.delete(`/auth/menu/${id}`),
  updateMenuStatus: (id, status) =>axiosInstance.patch(`/auth/menu/${id}/status`, { status }),
  reorderMenu: (menuItems) =>axiosInstance.post(`/auth/menu/reorder`, { menu: menuItems }),

// --------------------------------------------------------------------------------------------------
  getDashboard: () => axiosInstance.get(`/auth/getDashboard`),


  getWarehouse: () => axiosInstance.get(`/auth/getWarehouse`),
  // getWarehouseDropdown: () => axiosInstance.get(`/auth/getWarehouseDropdown`),
  getWarehouseDropdown: () => axiosInstance.get(`/auth/getAllWarehouses`),
  getWarehouseById: (id) => axiosInstance.get(`/auth/getWarehouseById/${id}`),
  getWarehouseEmail: (idx) =>axiosInstance.get(`/auth/getWarehouseEmail/unique/email/${idx}`),
  getWarehouseTitle: (idx) =>axiosInstance.get(`/auth/getWarehouseTitle/unique/title/${idx}`),
  getWarehousePhone: (idx) =>axiosInstance.get(`/auth/getWarehousePhone/unique/phone/${idx}`),
  createWarehouse: (data) =>axiosInstance.post(`/auth/createWarehouse/create`, data),
  updateWarehouseById: (id, data) =>axiosInstance.put(`/auth/editWarehouseById/${id}`, data),
  deleteWarehouse: (id) =>axiosInstance.delete(`/auth/deleteWarehouseById/${id}`),
  
  // --------------------------------------------------------------------------------------------------
  
  getGlossaries: (params) => axiosInstance.get(`/auth/getGlossaries`, { params }),
  getGlossaryByID: (id) => axiosInstance.get(`/auth/getGlossaryById/${id}`),
  
  // --------------------------------------------------------------------------------------------------
  
  getArticleCategories: () => axiosInstance.get('/auth/listArticleCategories'),
  getArticles: (params) => axiosInstance.get(`/auth/getArticle`, { params }),
  getUnfilteredArticles: (params) => axiosInstance.get(`/auth/listUnfilteredArticles`, { params }),
  getArticleById: (id) => axiosInstance.get(`/auth/getArticle/${id}`),
  createArticle: (data) => axiosInstance.post(`/auth/createArticle`, data),
  
  // --------------------------------------------------------------------------------------------------
  
  // Product
  getProduct: (params) => axiosInstance.get('/auth/getProduct', { params }),
  getProductById: (id) => axiosInstance.get(`/auth/getProductById/${id}`),
  getProductByScan: (code) => axiosInstance.get(`/auth/getProductByScan/scan/${code}`),
  createProduct: (data) => axiosInstance.post(`/auth/createProduct`, data),
  // bulkCreateProducts:(data) => 
    //   axiosInstance.post(`/auth/products/bulk`, { products: data }),
  // bulkImportSubmit:(data) => 
    //   axiosInstance.post(`/auth/bulkImportSubmit`, { products: data }),
  
  bulkImportSubmit: (formData) => axiosInstance.post('/auth/bulkImportExcel', formData),
  updateProductById: (prod_id, data) => axiosInstance.put(`/auth/editProductById?prod-id=${prod_id}`, data),
  deleteProduct: (id) => axiosInstance.delete(`/auth/deleteProductById/${id}`),
  
  
  // --------------------------------------------------------------------------------------------------
  
  // Lot Management
  // saveLot: (data) => axiosInstance.post('/auth/lots', data),
  // getLots: (params) => axiosInstance.get('/auth/lots', { params }),
  // getLotById: (lotId) => axiosInstance.get(`/auth/lots/${lotId}`),
  // deleteLot: (lotId) => axiosInstance.delete(`/auth/lots/${lotId}`),
  // submitLot: (lotId) => axiosInstance.post(`/auth/lots/${lotId}/submit`),
  // bulkCreateProductsWithLot: (data) =>
    //   axiosInstance.post('/auth/bulkImportSync', data),
  
  // --------------------------------------------------------------------------------------------------
  
  
  // ============================================
  // PRODCUT ACTIVITY
  // ============================================
  
  getProductActivities:(productUuid) => axiosInstance.get(`/auth/products/${productUuid}/activities`),
  getAllProductActivities:(productUuid) => axiosInstance.get(`/auth/products/${productUuid}/activities/all`),
  createProductActivity: (productUuid, activityData) => axiosInstance.post(`/auth/products/${productUuid}/activities`,activityData),
  
  
  // --------------------------------------------------------------------------------------------------
  
  // ============================================
  // STOCK FLOW
  // ============================================
  
  // Get stock flow options (transport, status, sort)
  getStockFlowOptions: () => axiosInstance.get(`/auth/getStockFlowOptions`),
  getStockFlows: (params) => axiosInstance.get(`/auth/getStockFlows`, { params }),
  getStockFlowById: (id) => axiosInstance.get(`/auth/getStockFlowByID/${id}`),
  getStockFlowProducts: (id) => axiosInstance.get(`/auth/getStockFlowProducts/${id}`),
  getDestinations:() => axiosInstance.get(`/auth/listLocationNames`),
  
  // createStockFlowWithBill: (formData) => 
    //   axiosInstance.post(`/auth/createStockFlow`, formData, {
  //     headers: {
    //       'Content-Type': 'multipart/form-data',
    //     },
    //   }),
    
    
    get_existing_stock_flow:() => axiosInstance.get(`/auth/getExistingStock`),
    removeStockProduct: (partial_code) =>axiosInstance.put(`/auth/removeStockProduct/${partial_code}`),
    discardDraft: () => axiosInstance.delete('/auth/discardDraft'),
    stockFlowSync: (formData) => axiosInstance.post('/auth/stockFlowSync', formData),
    stockFlowSubmit:(formData)=>axiosInstance.post('/auth/stockFlowSubmit',formData),
    createStockFlow: (formData) => axiosInstance.post(`/auth/createStockFlow`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',},}),
        
        dispatchStockFlow: (id) => axiosInstance.post(`/auth/stockflow/${id}/dispatch`),
        receiveStockFlow: (id, formData) => axiosInstance.post(`/auth/stockflow/${id}/receive`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',},}),
            
            updateStockFlowById: (id, data) =>axiosInstance.patch(`/auth/updateStockFLowByID/${id}`, data),
            deleteStockFlow: (id) => axiosInstance.delete(`/auth/deleteStockFlow/${id}`),
            getStockFlowStats: () => axiosInstance.get(`/auth/getStockFlowStats/stats`),
            downloadStockFlowInvoice: (id) => axiosInstance.get(`/auth/stockflow/${id}/invoice`, {
              responseType: "blob",}),
              
              // Chart data endpoints
              getStockFlowChartData: (params) => axiosInstance.get("/auth/getStockFlowChartData", { params }),
              getLowStockChartData: (params) => axiosInstance.get("/auth/getLowStockChartData", { params }),
              getOutOfStockTrendData: (params) =>axiosInstance.get("/auth/getOutOfStockTrendData", { params }),
              getStockStatusDistribution: (params) => axiosInstance.get("/auth/getStockStatusDistribution", { params }),
              getWarehouseComparison: (params) => axiosInstance.get("/auth/getWarehouseComparison", { params }),
              
              
              getStockRequests: (params) => axiosInstance.get("/auth/getStockRequest",{ params }),
              createStockRequest: (data) => axiosInstance.post(`/auth/createStockRequest`, data),
              markStockRequestRead:(data) => axiosInstance.put("/auth/markStockRequestRead",data),
              // --------------------------------------------------------------------------------------------------
              
              // getLocation:() => axiosInstance.get("/auth/listLocationNames"),
              
              // Activities
              getActivities: (params) => axiosInstance.get("/auth/activities", { params }),
              getActivityStats: () => axiosInstance.get("/auth/activities/stats"),
              
              // --------------------------------------------------------------------------------------------------
              
              
              // Email Service
              getEmails: (category = "inbox", page = 1, limit = 10, search = "") => axiosInstance.get(`/auth/getEmail/${category}`, {
                params: { page, limit, search },}),
                getEmailById: (id) => axiosInstance.get(`/auth/getEmailById/${id}`),
                sendEmails: (data) => axiosInstance.post(`/auth/createEmail`, data),
                saveDraft: (draftData) => axiosInstance.post(`/auth/draftEmail`, draftData),
                sendStockRequest: (stockRequestData) => axiosInstance.post(`/auth/stock-request`, stockRequestData),
                respondToStockRequest: (emailId, action, deadlineDays, notes = "") => axiosInstance.post(`/auth/stock-request/${emailId}/respond`,   
                  { action,deadlineDays,notes,}),
                  markEmailAsRead: (id) => axiosInstance.put(`/auth/editEmailMark/${id}/read`),
                  toggleEmailStar: (id, starred) => axiosInstance.put(`/auth/editEmailTogglemail/${id}/star`, { starred }),
                  deleteEmail: (id) => axiosInstance.delete(`/auth/deleteEmail/${id}`),
                  bulkEmailAction: (action, emailIds) => axiosInstance.post(`/auth/bulkEmail/${action}`, { emailIds: emailIds }),
                  getTemplates: () => axiosInstance.get(`/auth/getTemplates/all`),
                  
                  
                  // --------------------------------------------------------------------------------------------------
                  
                  // Notifications
                  getNotifications: (limit = 20) => axiosInstance.get(`/auth/notification`, { params: { limit } }),
                  markNotificationAsRead: (id) => axiosInstance.put(`/auth/notification/${id}/read`),
                  markAllNotificationsAsRead: () => axiosInstance.put(`/auth/notification/mark-all-read`),


// --------------------------------------------------------------------------------------------------


  // Search methods
  searchUsers: (query, limit = 5) => {
    return axiosInstance.get('/auth/getUser', {
      params: {
        search: query,
        limit: limit,
        page: 1
      }
    }).catch(error => {
      console.error('Error searching users:', error);
      return { data: { users: [] } };
    });
  },

  searchProducts: (query, limit = 5) => {
    return axiosInstance.get('/auth/getProduct', {
      params: {
        search: query,
        limit: limit,
        page: 1
      }
    }).catch(error => {
      console.error('Error searching products:', error);
      return { data: { data: [] } };
    });
  },

  searchWarehouses: (query,limit) => {
    return axiosInstance.get('/auth/getWarehouse', {
        params: {
      search: query,  
      limit: limit,       
      page: 1
    }
    }).catch(error => {
      console.error('Error searching warehouses:', error);
      return { data: { data: [] } };
    });
  },

  searchArticles: (query, limit = 5) => {
    return axiosInstance.get('/auth/getArticle', {
      params: {
        search: query,
        limit: limit,
        page: 1
      }
    }).catch(error => {
      console.error('Error searching articles:', error);
      return { data: { data: [] } };
    });
  },

  searchRoles: (query,limit) => {
    return axiosInstance.get('/auth/roles', {
      params: {
      search: query,      
      limit: limit,  
      page: 1
    }
    }).catch(error => {
      console.error('Error searching roles:', error);
      return { data: { roles: [] } };
    });
  },
};


// --------------------------------------------------------------------------------------------------

export const updateUser = (id, data) =>
  axiosInstance.put(`/auth/editUserById/${id}`, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export default AuthService;