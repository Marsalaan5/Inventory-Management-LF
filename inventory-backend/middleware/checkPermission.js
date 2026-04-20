

/**
 * Enhanced permission middleware that checks module permissions
 * @param {string} moduleName - The module name (e.g., 'Product', 'Users')
 * @param {string} action - The action type ('create', 'edit', 'delete', 'view')
 */
export function checkPermission(moduleName, action = "view") {
  return (req, res, next) => {
    const user = req.user;
    
    
    if (!user) {
      return res.status(401).json({ 
        message: "Authentication required",
        error: "UNAUTHORIZED" 
      });
    }
    

    if (user.role === "Super Admin") {
      // console.log(`${user.role} bypassing permission check for ${moduleName}.${action}`);
      return next();
    }

    //  if (user.role === "Super Admin") {
    //   console.log(`Super Admin bypass: ${moduleName}.${action}`);
    //   return next();
    // }
    

    if (!user.permissions || Object.keys(user.permissions).length === 0) {
      return res.status(403).json({ 
        message: "No permissions assigned to your role",
        error: "NO_PERMISSIONS" 
      });
    }
    

    const modulePermissions = user.permissions[moduleName];
    if (!modulePermissions) {
      return res.status(403).json({ 
        message: `You don't have access to ${moduleName} module`,
        error: "NO_MODULE_ACCESS",
        module: moduleName
      });
    }
    
  
    const permissionKey = `can_${action}`;
    if (!modulePermissions[permissionKey]) {
      return res.status(403).json({ 
        message: `You don't have permission to ${action} in ${moduleName} module`,
        error: "PERMISSION_DENIED",
        module: moduleName,
        action: action,
        required: permissionKey
      });
    }
    
    // console.log(` Permission granted: ${user.role} can ${action} in ${moduleName}`);
    
    next();
  };
}







//same as above

// /**
//  * Enhanced permission middleware that checks module permissions
//  * @param {string} moduleName - The module name (e.g., 'Product', 'Users')
//  * @param {string} action - The action type ('create', 'edit', 'delete', 'view')
//  */
// export function checkPermission(moduleName, action = "view") {
//   return (req, res, next) => {
//     const user = req.user;
    
//     // Check if user exists
//     if (!user) {
//       return res.status(401).json({ 
//         message: "Authentication required",
//         error: "UNAUTHORIZED" 
//       });
//     }
    

//     if (user.isSuperAdmin || user.isAdmin) {
//       console.log(`${user.role} bypassing permission check for ${moduleName}.${action}`);
//       return next();
//     }
    

//     if (!user.permissions || Object.keys(user.permissions).length === 0) {
//       return res.status(403).json({ 
//         message: "No permissions assigned to your role",
//         error: "NO_PERMISSIONS" 
//       });
//     }
    

//     const modulePermissions = user.permissions[moduleName];
//     if (!modulePermissions) {
//       return res.status(403).json({ 
//         message: `You don't have access to ${moduleName} module`,
//         error: "NO_MODULE_ACCESS",
//         module: moduleName
//       });
//     }
    
  
//     const permissionKey = `can_${action}`;
//     if (!modulePermissions[permissionKey]) {
//       return res.status(403).json({ 
//         message: `You don't have permission to ${action} in ${moduleName} module`,
//         error: "PERMISSION_DENIED",
//         module: moduleName,
//         action: action,
//         required: permissionKey
//       });
//     }
    
//     console.log(` Permission granted: ${user.role} can ${action} in ${moduleName}`);
    
//     // Permission granted
//     next();
//   };
// }

// /**
//  * Check if user has ANY of the specified permissions
//  */
// export function checkAnyPermission(permissionChecks) {
//   return (req, res, next) => {
//     const user = req.user;
    
//     if (!user) {
//       return res.status(401).json({ 
//         message: "Authentication required",
//         error: "UNAUTHORIZED" 
//       });
//     }
    
//     // FIXED: Both Super Admin and Admin bypass
//     if (user.isSuperAdmin || user.isAdmin) {
//       console.log(`${user.role} bypassing any-permission check`);
//       return next();
//     }
    
//     if (!user.permissions || Object.keys(user.permissions).length === 0) {
//       return res.status(403).json({ 
//         message: "No permissions assigned",
//         error: "NO_PERMISSIONS" 
//       });
//     }
    
   
//     const hasAnyPermission = permissionChecks.some(check => {
//       const { module, action } = check;
//       const modulePerms = user.permissions[module];
//       return modulePerms && modulePerms[`can_${action}`];
//     });
    
//     if (!hasAnyPermission) {
//       return res.status(403).json({ 
//         message: "You don't have required permissions",
//         error: "INSUFFICIENT_PERMISSIONS",
//         required: permissionChecks
//       });
//     }
    
//     next();
//   };
// }

// /**
//  * Check if user has specific role(s)
//  */
// export function checkRole(allowedRoles) {
//   return (req, res, next) => {
//     const user = req.user;
    
//     if (!user) {
//       return res.status(401).json({ 
//         message: "Authentication required",
//         error: "UNAUTHORIZED" 
//       });
//     }
    
//     const userRole = user.role;
//     const rolesArray = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    
//     const hasRole = rolesArray.some(
//       role => role.toLowerCase() === userRole.toLowerCase()
//     );
    
//     if (!hasRole) {
//       return res.status(403).json({ 
//         message: "You don't have required role",
//         error: "ROLE_DENIED",
//         required: allowedRoles,
//         current: userRole
//       });
//     }
    
//     console.log(`Role check passed: ${userRole}`);
//     next();
//   };
// }

// /**
//  * Helper function to check if user is admin or above
//  */
// export function isAdminOrAbove(req, res, next) {
//   const user = req.user;
  
//   if (!user) {
//     return res.status(401).json({ 
//       message: "Authentication required",
//       error: "UNAUTHORIZED" 
//     });
//   }
  
//   if (!user.isAdminOrAbove) {
//     return res.status(403).json({ 
//       message: "Access denied. Admin privileges required.",
//       error: "ADMIN_REQUIRED",
//       userRole: user.role 
//     });
//   }
  
//   console.log(` Admin check passed: ${user.role}`);
//   next();
// }










