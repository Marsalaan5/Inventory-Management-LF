// CASE-INSENSITIVE ROLE HIERARCHY
// All keys should be lowercase for consistent comparison
// export const roleHierarchy = {
//   "viewer": 1,
//   "user": 2,
//   "admin": 3,
//   "super admin": 4,
// };

// Helper function to safely get role level (case-insensitive)
// export const getRoleLevel = (roleName) => {
//   if (!roleName) return 0;
//   const normalized = roleName.trim().toLowerCase();
//   return roleHierarchy[normalized] || 0;
// };





// /**
//  * STRICT Role hierarchy levels (higher number = more privileges)
//  * Rules:
//  * - Users can ONLY manage roles STRICTLY BELOW their level (not equal)
//  * - Super Admin (level 4) can manage Admin, User, Viewer (levels 1-3)
//  * - Super Admin CANNOT create another Super Admin
//  * - Admin (level 3) can manage User, Viewer (levels 1-2)
//  * - Admin CANNOT create another Admin or Super Admin
//  */
// export const roleHierarchy = {
//   "Viewer": 1,
//   "User": 2,
//   "Admin": 3,
//   "Super Admin": 4,
// };

// /**
//  * Get numeric level for a role name
//  * @param {string} roleName - The role name to look up
//  * @returns {number} - The role level (0 if not found)
//  */
// export const getRoleLevel = (roleName) => {
//   if (!roleName) return 0;
//   return roleHierarchy[roleName] || 0;
// };

// /**
//  * Check if current user can manage (edit/delete) a target user
//  * STRICT RULE: Can only manage roles STRICTLY BELOW (not equal)
//  * 
//  * @param {string} currentUserRoleName - Current user's role name
//  * @param {string} targetRoleName - Target role to manage
//  * @returns {boolean} - True if user can manage the role
//  */
// export const canManageRole = (currentUserRoleName, targetRoleName) => {
//   const currentLevel = getRoleLevel(currentUserRoleName);
//   const targetLevel = getRoleLevel(targetRoleName);
  
//   // STRICT: Can only manage roles BELOW (not equal)
//   // Super Admin (4) can manage Admin (3), User (2), Viewer (1)
//   // Super Admin (4) CANNOT manage another Super Admin (4)
//   return currentLevel > targetLevel;
// };

// /**
//  * Check if current user can assign a specific role to someone
//  * STRICT RULE: Can only assign roles STRICTLY BELOW (not equal)
//  * 
//  * @param {string} currentUserRoleName - Current user's role name
//  * @param {string} roleToAssignName - Role to assign
//  * @returns {boolean} - True if user can assign the role
//  */
// export const canAssignRole = (currentUserRoleName, roleToAssignName) => {
//   const currentLevel = getRoleLevel(currentUserRoleName);
//   const roleToAssignLevel = getRoleLevel(roleToAssignName);
  
//   // STRICT: Can only assign roles BELOW (not equal)
//   // Super Admin (4) can assign Admin (3), User (2), Viewer (1)
//   // Super Admin (4) CANNOT assign another Super Admin (4)
//   return currentLevel > roleToAssignLevel;
// };

// /**
//  * Get list of roles that current user can manage
//  * @param {string} currentUserRoleName - Current user's role name
//  * @param {Array} allRoles - Array of all role objects {id, name}
//  * @returns {Array} - Filtered array of manageable roles
//  */
// export const getManageableRoles = (currentUserRoleName, allRoles) => {
//   const currentLevel = getRoleLevel(currentUserRoleName);
  
//   return allRoles.filter(role => {
//     const roleLevel = getRoleLevel(role.name);
//     // Only roles STRICTLY below current level
//     return roleLevel < currentLevel;
//   });
// };

// /**
//  * Get list of roles that current user can assign to others
//  * @param {string} currentUserRoleName - Current user's role name
//  * @param {Array} allRoles - Array of all role objects {id, name}
//  * @returns {Array} - Filtered array of assignable roles (STRICTLY below)
//  */
// export const getAssignableRoles = (currentUserRoleName, allRoles) => {
//   const currentLevel = getRoleLevel(currentUserRoleName);
  
//   return allRoles.filter(role => {
//     const roleLevel = getRoleLevel(role.name);
//     // STRICT: Only roles BELOW current level (not equal)
//     return roleLevel < currentLevel;
//   });
// };

// /**
//  * Check if a user has sufficient permissions for an action
//  * @param {string} currentUserRoleName - Current user's role name
//  * @param {string} requiredRoleName - Minimum required role
//  * @returns {boolean} - True if user meets requirement
//  */
// export const hasMinimumRole = (currentUserRoleName, requiredRoleName) => {
//   const currentLevel = getRoleLevel(currentUserRoleName);
//   const requiredLevel = getRoleLevel(requiredRoleName);
  
//   return currentLevel >= requiredLevel;
// };




// utils/roleHierarchy.js
// Centralized role hierarchy management

export const roleHierarchy = {
  "viewer": 1,
  "user": 2,
  "admin": 3,
  "super admin": 4,
  "main": 5,
};

/**
 * Get role level from role name
 * @param {string} roleName - Name of the role
 * @returns {number|null} - Role level or null if not found
 */
export const getRoleLevel = (roleName) => {
  if (!roleName) return null;
  return roleHierarchy[roleName.toLowerCase()] || null;
};

/**
 * Check if user can manage target role
 * @param {string} userRole - Current user's role name
 * @param {string} targetRole - Target role name to manage
 * @returns {boolean} - True if user can manage target role
 */
export const canManageRole = (userRole, targetRole) => {
  const userLevel = getRoleLevel(userRole);
  const targetLevel = getRoleLevel(targetRole);
  
  if (!userLevel || !targetLevel) return false;
  
  // User can only manage roles with lower level
  return targetLevel < userLevel;
};

/**
 * Check if user has minimum required role level
 * @param {string} userRole - Current user's role name
 * @param {string} requiredRole - Required minimum role name
 * @returns {boolean} - True if user meets minimum requirement
 */
export const hasMinimumRole = (userRole, requiredRole) => {
  const userLevel = getRoleLevel(userRole);
  const requiredLevel = getRoleLevel(requiredRole);
  
  if (!userLevel || !requiredLevel) return false;
  
  return userLevel >= requiredLevel;
};

/**
 * Get all roles lower than the given role
 * @param {string} roleName - Role name
 * @returns {string[]} - Array of role names lower than given role
 */
export const getLowerRoles = (roleName) => {
  const roleLevel = getRoleLevel(roleName);
  if (!roleLevel) return [];
  
  return Object.keys(roleHierarchy).filter(
    role => roleHierarchy[role] < roleLevel
  );
};

/**
 * Compare two roles
 * @param {string} role1 - First role name
 * @param {string} role2 - Second role name
 * @returns {number} - -1 if role1 < role2, 0 if equal, 1 if role1 > role2
 */
export const compareRoles = (role1, role2) => {
  const level1 = getRoleLevel(role1);
  const level2 = getRoleLevel(role2);
  
  if (level1 === level2) return 0;
  return level1 > level2 ? 1 : -1;
};

export default {
  roleHierarchy,
  getRoleLevel,
  canManageRole,
  hasMinimumRole,
  getLowerRoles,
  compareRoles
};