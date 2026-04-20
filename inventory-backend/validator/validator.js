import Joi from "joi";

export const signupSchema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    // password: Joi.string().min(6).required(),
    password: Joi.string().min(8).max(128)
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+")).required(),
    // mobile: Joi.string().pattern(/^\d{10}$/).optional(),

}).prefs({ convert: true });


export const signinSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
});


export const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required()
});

export const resetPasswordSchema = Joi.object({
    resetToken: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});




// // validator.js - Centralized Validation Schemas
// import Joi from "joi";

// /**
//  * Validate request data against a Joi schema
//  * @param {Joi.ObjectSchema} schema - Joi validation schema
//  * @param {Object} data - Data to validate
//  * @param {Response} res - Express response object
//  * @returns {Object|null} - Returns validation error or null
//  */
// export const validate = (schema, data, res) => {
//   const { error } = schema.validate(data, { abortEarly: false });
//   if (error) {
//     return res.status(400).json({ 
//       success: false,
//       message: error.details[0].message,
//       errors: error.details.map(d => d.message)
//     });
//   }
//   return null;
// };

// // ============================================
// // AUTHENTICATION SCHEMAS
// // ============================================

// export const signupSchema = Joi.object({
//   name: Joi.string().min(2).max(50).required().label("Name"),
//   email: Joi.string().email().required().label("Email"),
//   password: Joi.string()
//     .min(8)
//     .max(128)
//     .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+"))
//     .required()
//     .label("Password")
//     .messages({
//       "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
//     }),
// }).prefs({ convert: true });

// export const signinSchema = Joi.object({
//   email: Joi.string().email().required().label("Email"),
//   password: Joi.string().min(6).required().label("Password")
// });

// export const forgotPasswordSchema = Joi.object({
//   email: Joi.string().email().required().label("Email")
// });

// export const resetPasswordSchema = Joi.object({
//   resetToken: Joi.string().required().label("Reset Token"),
//   newPassword: Joi.string()
//     .min(8)
//     .max(128)
//     .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+"))
//     .required()
//     .label("New Password")
//     .messages({
//       "string.pattern.base": "Password must contain at least one uppercase letter, one lowercase letter, and one number"
//     })
// });

// // ============================================
// // USER SCHEMAS
// // ============================================

// export const createUserSchema = Joi.object({
//   name: Joi.string().min(2).max(100).required().label("Name"),
//   email: Joi.string().email().required().label("Email"),
//   password: Joi.string()
//     .min(8)
//     .max(128)
//     .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).+"))
//     .required()
//     .label("Password"),
//   phone: Joi.string()
//     .pattern(new RegExp("^[0-9]{10}$"))
//     .allow("", null)
//     .label("Phone")
//     .messages({
//       "string.pattern.base": "Phone must have exactly 10 digits"
//     }),
//   username: Joi.string().min(3).max(50).allow("", null).label("Username"),
//   role_id: Joi.number().integer().min(1).required().label("Role ID"),
//   warehouse_id: Joi.number().integer().min(1).required().label("Warehouse ID"),
//   status: Joi.string().valid("Active", "Inactive").default("Active").label("Status")
// });

// export const updateUserSchema = Joi.object({
//   name: Joi.string().min(2).max(100).label("Name"),
//   email: Joi.string().email().label("Email"),
//   phone: Joi.string()
//     .pattern(new RegExp("^[0-9]{10}$"))
//     .allow("", null)
//     .label("Phone"),
//   username: Joi.string().min(3).max(50).allow("", null).label("Username"),
//   role_id: Joi.number().integer().min(1).label("Role ID"),
//   warehouse_id: Joi.number().integer().min(1).label("Warehouse ID"),
//   status: Joi.string().valid("Active", "Inactive").label("Status")
// });

// export const userIdSchema = Joi.object({
//   id: Joi.number().integer().min(1).required().label("User ID")
// });

// // ============================================
// // WAREHOUSE SCHEMAS
// // ============================================

// export const warehouseTitleSchema = Joi.object({
//   idx: Joi.string()
//     .min(3)
//     .max(127)
//     .pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
//     .required()
//     .label("Warehouse title")
//     .messages({
//       "string.pattern.base": "Warehouse title can include letters (a-z), numbers (0-9), and these special characters (-_.). You cannot start or end with a special character or use multiple special characters in a row."
//     })
// });

// export const warehousePhoneSchema = Joi.object({
//   idx: Joi.string()
//     .pattern(new RegExp("^[0-9]{10}$"))
//     .required()
//     .label("Phone number")
//     .messages({
//       "string.pattern.base": "Phone number must have exactly 10 digits and contain only numbers."
//     })
// });

// export const warehouseEmailSchema = Joi.object({
//   idx: Joi.string().max(127).email().required().label("Email ID")
// });

// export const createWarehouseSchema = Joi.object({
//   wh_title: Joi.string()
//     .min(3)
//     .max(127)
//     .pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
//     .required()
//     .label("Warehouse title")
//     .messages({
//       "string.pattern.base": "Warehouse title can include letters (a-z), numbers (0-9), and these special characters (-_.). You cannot start or end with a special character or use multiple special characters in a row."
//     }),
//   user_id: Joi.number().integer().min(1).required().label("User ID"),
//   phone_1: Joi.string()
//     .pattern(new RegExp("^[0-9]{10}$"))
//     .required()
//     .label("Phone number")
//     .messages({
//       "string.pattern.base": "Phone number must have exactly 10 digits and contain only numbers."
//     }),
//   email_1: Joi.string().max(127).email().required().label("Email ID"),
//   address: Joi.string().min(10).max(255).required().label("Address")
// });

// export const updateWarehouseSchema = Joi.object({
//   wh_title: Joi.string()
//     .min(3)
//     .max(127)
//     .pattern(new RegExp("^(?![-_.])(?!.*[-_.]{2})[a-zA-Z0-9-_.]+(?<![-_.])$"))
//     .required()
//     .label("Warehouse title"),
//   user_id: Joi.number().integer().min(1).required().label("User ID"),
//   phone_1: Joi.string()
//     .pattern(new RegExp("^[0-9]{10}$"))
//     .required()
//     .label("Phone number"),
//   email_1: Joi.string().max(127).email().required().label("Email ID"),
//   address: Joi.string().min(10).max(255).required().label("Address")
// });

// export const warehouseIdSchema = Joi.object({
//   id: Joi.number().integer().min(1).required().label("Warehouse ID")
// });

// // ============================================
// // PRODUCT SCHEMAS
// // ============================================

// export const createProductSchema = Joi.object({
//   title: Joi.string().min(3).max(127).required().label("Product title"),
//   article_profile_id: Joi.number().integer().min(1).required().label("Article profile ID"),
//   warehouse_id: Joi.number().integer().min(1).required().label("Warehouse ID"),
//   location: Joi.string().max(255).allow("", null).label("Location"),
//   status: Joi.string()
//     .valid("new", "used", "repaired", "broken", "installed")
//     .default("new")
//     .label("Status"),
//   count: Joi.number().integer().min(0).required().label("Count"),
//   description: Joi.string().max(255).allow("", null).label("Description"),
//   last_updated_by: Joi.number().integer().min(1).required().label("User ID")
// });

// export const updateProductSchema = Joi.object({
//   title: Joi.string().min(3).max(127).required().label("Product title"),
//   article_profile_id: Joi.number().integer().min(1).required().label("Article profile ID"),
//   warehouse_id: Joi.number().integer().min(1).required().label("Warehouse ID"),
//   location: Joi.string().max(255).allow("", null).label("Location"),
//   status: Joi.string()
//     .valid("new", "used", "repaired", "broken", "installed")
//     .required()
//     .label("Status"),
//   count: Joi.number().integer().min(0).required().label("Count"),
//   description: Joi.string().max(255).allow("", null).label("Description"),
//   last_updated_by: Joi.number().integer().min(1).required().label("User ID")
// });

// export const productIdSchema = Joi.object({
//   id: Joi.number().integer().min(1).required().label("Product ID")
// });

// // ============================================
// // STOCK FLOW SCHEMAS
// // ============================================

// export const createStockFlowSchema = Joi.object({
//   from_wh: Joi.number().integer().min(1).allow(null).label("From warehouse"),
//   to_wh: Joi.number().integer().min(1).allow(null).label("To warehouse"),
//   from_loc: Joi.string().max(255).allow("", null).label("From location"),
//   to_loc: Joi.string().max(255).allow("", null).label("To location"),
//   quantity: Joi.number().integer().min(1).required().label("Quantity"),
//   transport: Joi.string()
//     .valid("bus", "courier", "employee", "transport_co")
//     .required()
//     .label("Transport"),
//   status: Joi.string()
//     .valid("approved", "delivered", "in-transit")
//     .default("approved")
//     .label("Status"),
//   description: Joi.string().max(255).allow("", null).label("Description")
// });

// export const updateStockFlowSchema = Joi.object({
//   from_wh: Joi.number().integer().min(1).allow(null).label("From warehouse"),
//   to_wh: Joi.number().integer().min(1).allow(null).label("To warehouse"),
//   from_loc: Joi.string().max(255).allow("", null).label("From location"),
//   to_loc: Joi.string().max(255).allow("", null).label("To location"),
//   quantity: Joi.number().integer().min(1).required().label("Quantity"),
//   transport: Joi.string()
//     .valid("bus", "courier", "employee", "transport_co")
//     .required()
//     .label("Transport"),
//   status: Joi.string()
//     .valid("approved", "delivered", "in-transit")
//     .required()
//     .label("Status"),
//   description: Joi.string().max(255).allow("", null).label("Description")
// });

// export const stockFlowIdSchema = Joi.object({
//   id: Joi.number().integer().min(1).required().label("Stock flow ID")
// });

// // ============================================
// // ROLE SCHEMAS
// // ============================================

// export const createRoleSchema = Joi.object({
//   name: Joi.string().min(2).max(50).required().label("Role name"),
//   permissions: Joi.object().default({}).label("Permissions")
// });

// export const updateRoleSchema = Joi.object({
//   name: Joi.string().min(2).max(50).label("Role name"),
//   permissions: Joi.object().label("Permissions")
// });

// export const roleIdSchema = Joi.object({
//   id: Joi.number().integer().min(1).required().label("Role ID")
// });

// export const updatePermissionsSchema = Joi.object({
//   roleId: Joi.number().integer().min(1).required().label("Role ID"),
//   permissions: Joi.array().items(
//     Joi.object({
//       module: Joi.string().required().label("Module"),
//       can_create: Joi.boolean().default(false),
//       can_edit: Joi.boolean().default(false),
//       can_delete: Joi.boolean().default(false),
//       can_view: Joi.boolean().default(false)
//     })
//   ).required().label("Permissions")
// });

// // ============================================
// // QUERY PARAMETER SCHEMAS
// // ============================================

// export const paginationSchema = Joi.object({
//   page: Joi.number().integer().min(1).default(1).label("Page"),
//   limit: Joi.number().integer().min(1).max(100).default(10).label("Limit")
// });

// export const searchSchema = Joi.object({
//   search: Joi.string().max(255).allow("").default("").label("Search term")
// });

// export const sortSchema = Joi.object({
//   sortBy: Joi.string().valid("created_at", "updated_at", "name", "title").default("created_at").label("Sort by"),
//   sortOrder: Joi.string().valid("ASC", "DESC").default("DESC").label("Sort order")
// });

// export const statusFilterSchema = Joi.object({
//   status: Joi.string().allow("").default("").label("Status")
// });

// // ============================================
// // COMBINED QUERY SCHEMAS
// // ============================================

// export const productQuerySchema = paginationSchema.concat(searchSchema).concat(sortSchema).keys({
//   status: Joi.string().allow("").default(""),
//   warehouse_id: Joi.number().integer().min(1).allow("").default(""),
//   article_profile_id: Joi.number().integer().min(1).allow("").default("")
// });

// export const userQuerySchema = paginationSchema.concat(searchSchema).concat(sortSchema).keys({
//   username: Joi.string().allow("").default(""),
//   status: Joi.string().allow("").default(""),
//   role: Joi.string().allow("").default("")
// });

// export const warehouseQuerySchema = searchSchema.concat(sortSchema).keys({
//   sortBy: Joi.string().valid("date_asc", "date_desc").default("date_desc")
// });

// export const stockFlowQuerySchema = paginationSchema.concat(searchSchema).concat(sortSchema).keys({
//   status: Joi.string().allow("").default(""),
//   transport: Joi.string().allow("").default(""),
//   from_wh: Joi.number().integer().min(1).allow("").default(""),
//   to_wh: Joi.number().integer().min(1).allow("").default("")
// });

// // ============================================
// // PROFILE SCHEMAS
// // ============================================

// export const updateProfileSchema = Joi.object({
//   name: Joi.string().min(2).max(100).label("Name"),
//   phone: Joi.string()
//     .pattern(new RegExp("^[0-9]{10}$"))
//     .allow("", null)
//     .label("Phone")
// });

// // ============================================
// // EXPORT ALL SCHEMAS AS DEFAULT
// // ============================================

// export default {
//   // Utility
//   validate,
  
//   // Authentication
//   signupSchema,
//   signinSchema,
//   forgotPasswordSchema,
//   resetPasswordSchema,
  
//   // Users
//   createUserSchema,
//   updateUserSchema,
//   userIdSchema,
//   userQuerySchema,
  
//   // Warehouses
//   warehouseTitleSchema,
//   warehousePhoneSchema,
//   warehouseEmailSchema,
//   createWarehouseSchema,
//   updateWarehouseSchema,
//   warehouseIdSchema,
//   warehouseQuerySchema,
  
//   // Products
//   createProductSchema,
//   updateProductSchema,
//   productIdSchema,
//   productQuerySchema,
  
//   // Stock Flow
//   createStockFlowSchema,
//   updateStockFlowSchema,
//   stockFlowIdSchema,
//   stockFlowQuerySchema,
  
//   // Roles
//   createRoleSchema,
//   updateRoleSchema,
//   roleIdSchema,
//   updatePermissionsSchema,
  
//   // Profile
//   updateProfileSchema,
  
//   // Query Schemas
//   paginationSchema,
//   searchSchema,
//   sortSchema,
//   statusFilterSchema,
// };