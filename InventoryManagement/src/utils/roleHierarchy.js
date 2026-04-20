export const roleHierarchy = {
  "viewer": 1,
  "user": 2,
  "admin": 3,
  "super admin": 4,
  "main": 5,
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
