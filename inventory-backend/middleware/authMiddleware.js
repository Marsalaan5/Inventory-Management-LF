
import pool from '../db.js';
import jwt from 'jsonwebtoken';

/**
 * Middleware to authenticate JWT token and attach user info
 */
export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ message: "Token missing" });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const [userRows] = await pool.execute(
      `SELECT u.id, u.email, u.username, u.role_id, u.warehouse_id, w.title as warehouse_name 
      FROM users u
      LEFT JOIN warehouse w ON u.warehouse_id = w.id 
      WHERE u.id = ?`,
      [decoded.id]
    );
    
    if (userRows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }
    
    const user = userRows[0];
    
    // Get role information
    const [roleRows] = await pool.execute(
      "SELECT name, permissions FROM roles WHERE id = ?",
      [user.role_id]
    );
    
    let roleName = "User"; 
    let permissions = {};
    
    if (roleRows.length > 0) {
      roleName = roleRows[0].name;
      try {
        permissions = JSON.parse(roleRows[0].permissions || "{}");
      } catch (parseError) {
        console.error("Error parsing permissions:", parseError);
        permissions = {};
      }
    }
    
const isSuperAdmin = roleName === "Super Admin";
const isAdmin = roleName === "Admin";
// const isAdminOrAbove = isSuperAdmin || isAdmin;
    
    // Attach complete user info to request
    req.user = {
      id: user.id,
      name: user.username,
      email: user.email,
      username: user.username,
      role: roleName,   
      role_id: user.role_id,
      role_name: roleName, 
      warehouse_id: user.warehouse_id,
      warehouse_name: user.warehouse_name,
      permissions,
      isSuperAdmin: isSuperAdmin,
      isAdmin: isAdmin,        
      // isAdminOrAbove: isSuperAdmin || isAdmin
    };

    // console.log('Authenticated user:', {
    //   id: req.user.id,
    //   role: req.user.role,
    //   warehouse_id: req.user.warehouse_id,
    //   // isSuperAdmin: req.user.isSuperAdmin,
    //   // isAdmin: req.user.isAdmin
    // });
    
    next();
  } catch (err) {
    console.error("Token authentication error:", err);
    
    if (err.name === 'JsonWebTokenError') {
      return res.status(403).json({ message: "Invalid token" });
    } else if (err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: "Token expired" });
    }
    
    res.status(403).json({ message: "Authentication failed" });
  }
};


export const enforceWarehouseAccess = (req, res, next) => {
  const user = req.user;

  // Only Super Admin can bypass warehouse check
  if (user.isSuperAdmin) {
    // console.log(' Super Admin - bypassing warehouse check');
    return next();
  }

  // Everyone else (including Admin) needs a warehouse
  if (!user.warehouse_id) {
    return res.status(403).json({
      message: "You are not assigned to any warehouse. Please contact Super Admin",
      error: "NO_WAREHOUSE_ASSIGNED"
    });
  }
  
  // console.log(' Warehouse access enforced for warehouse:', user.warehouse_id);
  next();
};


export const applyWarehouseFilter = (req, res, next) => {
  const user = req.user;

  // Only Super Admin sees all warehouses
  if (user.isSuperAdmin) {
    req.warehouseFilter = null;
    // console.log('Super Admin - no warehouse filter (sees all)');
  } 
  // Admin and below see only their warehouse
  else {
    req.warehouseFilter = user.warehouse_id;
    // console.log(`${user.role} - filtered to warehouse: ${user.warehouse_id}`);
  }
  
  next();
};



/**
 * Middleware to check minimum role requirement
 */
export const requireRole = (requiredRole) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    
    if (!userRole) {
      return res.status(401).json({ message: "User not authenticated" });
    }
    
    const userLevel = getRoleLevel(userRole);
    const requiredLevel = getRoleLevel(requiredRole);
    
    if (userLevel < requiredLevel) {
      return res.status(403).json({ 
        message: `Access denied. Minimum role required: ${requiredRole}`,
        currentRole: userRole
      });
    }
    
    next();
  };
};
