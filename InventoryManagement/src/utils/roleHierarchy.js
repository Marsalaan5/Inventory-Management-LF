export const roleHierarchy = {
  "repair person":1,
  "viewer": 2,
  "user": 3,
  "warehouse admin": 4,
  "inventory controller":5,
  "super admin": 6,
  "main admin": 7,

};

export const getRoleLevel = (roleName) => {
  if (!roleName) return null;
  return roleHierarchy[roleName.toLowerCase()] || null;
};

export const canManageRole = (userRole, targetRole) => {
  const userLevel = getRoleLevel(userRole);
  const targetLevel = getRoleLevel(targetRole);
  
  if (!userLevel || !targetLevel) return false;
  return targetLevel < userLevel;
};

export const getFilteredRoles = (roles, currentUserRole) => {
  if (!currentUserRole || !roles || roles.length === 0) {
    return [];
  }

  const currentRoleLevel = getRoleLevel(currentUserRole);
  
  if (!currentRoleLevel) {
    console.warn('Current user role not found in hierarchy:', currentUserRole);
    return [];
  }

  return roles.filter(role => {
    const roleLevel = getRoleLevel(role.name);
    return roleLevel && roleLevel < currentRoleLevel;
  });
};
