
import { useState, useEffect, useCallback } from 'react';
import AuthService from '../services/authService';


export const usePermissions = () => {
  const [permissions, setPermissions] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserPermissions = useCallback(async () => {
    try {
      setLoading(true);
      console.log('Starting permission fetch...');


      const userJson = sessionStorage.getItem('user') || localStorage.getItem('user');
      
      if (userJson) {
        try {
          const storedUser = JSON.parse(userJson);
          console.log('Found user in storage:', storedUser);
          
          if (storedUser.role && storedUser.permissions) {
            console.log(' Using cached user data');
            console.log(' Role:', storedUser.role);
            console.log(' Permissions:', Object.keys(storedUser.permissions).length, 'modules');
            
            setUserRole(storedUser.role);
            setPermissions(storedUser.permissions);
            setLoading(false);
            return; 
          }
        } catch (e) {
          console.error(' Error parsing stored user:', e);
        }
      }


      console.log(' Fetching fresh data from API...');

      let userId = sessionStorage.getItem('user_id') || localStorage.getItem('user_id');
      
      if (!userId && userJson) {
        try {
          const storedUser = JSON.parse(userJson);
          userId = storedUser.id;
          console.log(' Got user ID from user object:', userId);
        } catch (e) {
          console.error(' Error getting ID from user object:', e);
        }
      }

      if (!userId || userId === 'null' || userId === 'undefined') {
        console.error(' No user_id found - redirect to login');
        setPermissions({});
        setUserRole(null);
        setLoading(false);
        return;
      }

      userId = parseInt(userId);
      
      if (isNaN(userId) || userId <= 0) {
        console.error(' Invalid user_id:', userId);
        setPermissions({});
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log(' Fetching data for user ID:', userId);


      const userResponse = await AuthService.getCurrentUser();
      console.log(' User response:', userResponse);

      const users = userResponse.data?.users || [userResponse.data];
      const user = Array.isArray(users) 
        ? users.find(u => u.id === userId)
        : (users.id === userId ? users : null);

      if (!user) {
        console.error(' User not found');
        setPermissions({});
        setUserRole(null);
        setLoading(false);
        return;
      }

      console.log('User found:', user);

      
      const roleResponse = await AuthService.getRoleById(user.role_id);
      const role = roleResponse.data;

      let rolePermissions = role.permissions;
      if (typeof rolePermissions === 'string') {
        rolePermissions = JSON.parse(rolePermissions);
      }

      console.log('Role loaded:', role.name);
      console.log('Permissions loaded');

      setUserRole(role.name);
      setPermissions(rolePermissions || {});


      const updatedUser = {
        ...(userJson ? JSON.parse(userJson) : {}),
        role: role.name,
        permissions: rolePermissions
      };
      
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      sessionStorage.setItem('userRole', role.name);
      localStorage.setItem('userRole', role.name);
      sessionStorage.setItem('userPermissions', JSON.stringify(rolePermissions || {}));
      localStorage.setItem('userPermissions', JSON.stringify(rolePermissions || {}));

    } catch (error) {
      console.error('Error fetching permissions:', error);

    
      const cachedPerms = sessionStorage.getItem('userPermissions') || localStorage.getItem('userPermissions');
      const cachedRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');

      if (cachedPerms && cachedRole) {
        console.log('Using cached fallback data');
        try {
          setPermissions(JSON.parse(cachedPerms));
          setUserRole(cachedRole);
        } catch (e) {
          setPermissions({});
          setUserRole(null);
        }
      } else {
        setPermissions({});
        setUserRole(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUserPermissions();
  }, [fetchUserPermissions]);

    const hasRole = useCallback((roles) => {
    if (!userRole) return false;
    
    const roleArray = Array.isArray(roles) ? roles : [roles];
    const normalizedUserRole = userRole.toLowerCase().trim();
    
    return roleArray.some(role => {
      const normalizedRole = role.toLowerCase().trim();
      return normalizedRole === normalizedUserRole;
    });
  }, [userRole]);


  // const hasPermission = useCallback((module, action) => {
  //   if (!permissions) return false;
  //   if (!permissions[module]) return false;
    
  //   const permissionKey = `can_${action}`;
  //   return Boolean(permissions[module][permissionKey]);
  // }, [permissions]);

  const hasPermission = useCallback((module, action) => {

  if (hasRole(['Super Admin','super admin'])) {
    return true;
  }

  if (!permissions) return false;
  if (!permissions[module]) return false;

  const permissionKey = `can_${action}`;
  return Boolean(permissions[module][permissionKey]);
}, [permissions, hasRole]);



  const hasAnyPermission = useCallback((checks) => {
    return checks.some(check => 
      hasPermission(check.module, check.action)
    );
  }, [hasPermission]);

 
  const hasAllPermissions = useCallback((checks) => {
    return checks.every(check => 
      hasPermission(check.module, check.action)
    );
  }, [hasPermission]);




  const getModulePermissions = useCallback((module) => {
    if (!permissions || !permissions[module]) return null;
    return permissions[module];
  }, [permissions]);




  return {
    permissions,
    userRole,
    loading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    getModulePermissions,

    refetch: fetchUserPermissions
  };
};