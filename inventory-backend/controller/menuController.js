// // controllers/menuController.js
// import pool from '../db.js';

// // Helper function to convert icon string to React component format
// const formatIconForFrontend = (iconName) => iconName || null;

// // Helper function to organize flat menu into nested structure
// // const organizeMenu = (items) => {
// //   const menuMap = new Map();
// //   const result = [];

// //   items.forEach((item) => {
// //     menuMap.set(item.id, {
// //       ...item,
// //       icon: formatIconForFrontend(item.icon),
// //       submenu: Boolean(item.submenu),
// //       showSubRoute: Boolean(item.show_sub_route),
// //       submenuOpen: Boolean(item.submenu_open),
// //       submenuHdr: item.submenu_hdr,
// //       submenuItems: [],
// //       roles: item.roles ? item.roles.split(',') : [],
// //     });
// //   });

// //   items.forEach((item) => {
// //     if (item.parent_id === null) {
// //       result.push(menuMap.get(item.id));
// //     } else {
// //       const parent = menuMap.get(item.parent_id);
// //       if (parent) {
// //         parent.submenuItems.push(menuMap.get(item.id));
// //         parent.submenu = true;
// //       }
// //     }
// //   });

// //   return result;
// // };

// const organizeMenu = (items) => {
//   const menuMap = new Map();
//   const result = [];

//   items.forEach((item) => {
//     menuMap.set(item.id, {
//       ...item,
//       icon: formatIconForFrontend(item.icon),
//       submenu: Boolean(item.submenu),
//       showSubRoute: Boolean(item.show_sub_route),
//       submenuOpen: Boolean(item.submenu_open),
//       submenuHdr: item.submenu_hdr,
//       submenuItems: [],
//       roles: item.roles ? item.roles.split(',') : [],
//     });
//   });

//   items.forEach((item) => {
//     if (item.parent_id === null) {
//       result.push(menuMap.get(item.id));
//     } else {
//       const parent = menuMap.get(item.parent_id);
//       if (parent) {
//         parent.submenuItems.push(menuMap.get(item.id));
//         parent.submenu = true;
//       }
//     }
//   });

//   return result;
// };

// // FIXED: GET all menus for authenticated user based on their role
// export const getMenu = async (req, res) => {
//   try {
//     console.log(' Fetching menu for user:', req.user?.email);
//     console.log(' User role:', req.user?.role);
//     console.log(' User role_id:', req.user?.role_id);

//     // Get user's role from authenticated request
//     const userRole = req.user?.role || 'user';
//     const userRoleId = req.user?.role_id;

//     // Check if Super Admin or Admin
//     const isSuperAdmin = userRole.toLowerCase() === 'super admin' ||
//                         userRole.toLowerCase() === 'admin';

//     let query = '';
//     let params = [];

//     if (isSuperAdmin) {
//       //  Super Admin: Get ALL menu items (active and inactive)
//       console.log(' Super Admin detected - fetching all menus');
//       query = `
//         SELECT m.*, GROUP_CONCAT(DISTINCT r.name) AS roles
//         FROM menu_items m
//         LEFT JOIN menu_item_roles mir ON m.id = mir.menu_item_id
//         LEFT JOIN roles r ON mir.role_id = r.id
//         GROUP BY m.id
//         ORDER BY m.order_by ASC
//       `;

//       query = `
//   SELECT m.*, GROUP_CONCAT(DISTINCT r.name) AS roles
//   FROM menu_items m
//   LEFT JOIN menu_item_roles mir ON m.id = mir.menu_item_id
//   LEFT JOIN roles r ON mir.role_id = r.id
//   WHERE m.status = 'active'
//   GROUP BY m.id
//   ORDER BY m.order_by ASC
// `;

//     } else {
//       // Regular User: Get only menus assigned to their role
//       console.log(' Regular user detected - filtering by role_id:', userRoleId);
//       query = `
//         SELECT DISTINCT m.*, GROUP_CONCAT(DISTINCT r.name) AS roles
//         FROM menu_items m
//         INNER JOIN menu_item_roles mir ON m.id = mir.menu_item_id
//         INNER JOIN roles r ON mir.role_id = r.id
//         WHERE mir.role_id = ?
//         AND m.status = 'active'
//         GROUP BY m.id
//         ORDER BY m.order_by ASC
//       `;
//       params = [userRoleId];
//     }

//     const [results] = await pool.execute(query, params);

//     console.log(` Found ${results.length} menu items for ${userRole}`);

//     const organizedMenu = organizeMenu(results);

//     console.log(` Organized into ${organizedMenu.length} top-level menus`);

//     res.json(organizedMenu);
//   } catch (err) {
//     console.error(' Error fetching menu items:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // GET single menu item
// export const getMenuItem = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const [menuRows] = await pool.execute(
//       `SELECT m.*, GROUP_CONCAT(r.name) AS roles
//        FROM menu_items m
//        LEFT JOIN menu_item_roles mir ON m.id = mir.menu_item_id
//        LEFT JOIN roles r ON mir.role_id = r.id
//        WHERE m.id = ?
//        GROUP BY m.id`,
//       [id]
//     );

//     if (menuRows.length === 0) {
//       return res.status(404).json({ error: 'Menu item not found' });
//     }

//     const menuItem = menuRows[0];
//     menuItem.roles = menuItem.roles ? menuItem.roles.split(',') : [];

//     res.status(200).json(menuItem);
//   } catch (err) {
//     console.error('Error fetching menu item:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // POST - create menu
// export const postMenu = async (req, res) => {
//   const connection = await pool.getConnection();
//   try {
//     const {
//       title,
//       label,
//       path,
//       icon,
//       roles, // Array of role names
//       parent_id,
//       status,
//       order_by,
//       submenu,
//       submenu_hdr,
//     } = req.body;

//     if (!title || !label) {
//       return res.status(400).json({ error: 'Title and label are required' });
//     }

//     await connection.beginTransaction();

//     // Insert the menu item into the menu_items table
//     const [menuResult] = await connection.execute(
//       `INSERT INTO menu_items
//        (title, label, path, icon, parent_id, status, order_by, submenu, submenu_hdr, show_sub_route, submenu_open, time)
//        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE, NOW())`,
//       [title, label, path || null, icon || null, parent_id || null, status || 'active', order_by || 0, submenu || false, submenu_hdr || null]
//     );

//     const menuId = menuResult.insertId;

//     //  Insert the roles into the menu_item_roles table
//     if (roles && roles.length > 0) {
//       const [roleRows] = await connection.query(
//         `SELECT id, name FROM roles WHERE name IN (${roles.map(() => '?').join(',')})`,
//         roles
//       );

//       for (const role of roleRows) {
//         await connection.execute(
//           `INSERT INTO menu_item_roles (menu_item_id, role_id) VALUES (?, ?)`,
//           [menuId, role.id]
//         );
//       }
//     }

//     await connection.commit();

//     console.log(` Created menu item: ${label} (ID: ${menuId})`);
//     console.log(` Assigned to roles: ${roles?.join(', ') || 'none'}`);

//     res.status(201).json({
//       message: 'Menu item created successfully',
//       id: menuId
//     });
//   } catch (err) {
//     await connection.rollback();
//     console.error('Error adding menu item:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   } finally {
//     connection.release();
//   }
// };

// // PUT - update menu
// export const putMenu = async (req, res) => {
//   const connection = await pool.getConnection();
//   try {
//     const { id } = req.params;
//     const {
//       title,
//       label,
//       path,
//       icon,
//       roles,
//       parent_id,
//       status,
//       order_by,
//       submenu,
//       submenu_hdr,
//     } = req.body;

//     await connection.beginTransaction();

//     // Update the menu item
//     const [result] = await connection.execute(
//       `UPDATE menu_items
//        SET title=?, label=?, path=?, icon=?, parent_id=?, status=?, order_by=?, submenu=?, submenu_hdr=?
//        WHERE id=?`,
//       [title, label, path || null, icon || null, parent_id || null, status, order_by || 0, submenu || false, submenu_hdr || null, id]
//     );

//     if (result.affectedRows === 0) {
//       await connection.rollback();
//       return res.status(404).json({ error: 'Menu item not found' });
//     }

//     // Update roles for the menu item
//     await connection.execute(`DELETE FROM menu_item_roles WHERE menu_item_id = ?`, [id]);

//     if (roles && roles.length > 0) {
//       const [roleRows] = await connection.query(
//         `SELECT id, name FROM roles WHERE name IN (${roles.map(() => '?').join(',')})`,
//         roles
//       );
//       for (const role of roleRows) {
//         await connection.execute(`INSERT INTO menu_item_roles (menu_item_id, role_id) VALUES (?, ?)`, [id, role.id]);
//       }
//     }

//     await connection.commit();

//     console.log(` Updated menu item: ${label} (ID: ${id})`);
//     console.log(` New roles: ${roles?.join(', ') || 'none'}`);

//     res.status(200).json({ message: 'Menu item updated successfully' });
//   } catch (err) {
//     await connection.rollback();
//     console.error('Error updating menu item:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   } finally {
//     connection.release();
//   }
// };

// // DELETE - Delete a menu item
// export const deleteMenu = async (req, res) => {
//   const { id } = req.params;
//   const connection = await pool.getConnection();

//   try {
//     await connection.beginTransaction();

//     // First, delete any related entries in the menu_item_roles table
//     await connection.execute(`DELETE FROM menu_item_roles WHERE menu_item_id = ?`, [id]);

//     // Now delete the menu item from the menu_items table
//     const [result] = await connection.execute(`DELETE FROM menu_items WHERE id = ?`, [id]);

//     if (result.affectedRows === 0) {
//       await connection.rollback();
//       return res.status(404).json({ error: 'Menu item not found' });
//     }

//     await connection.commit();

//     console.log(` Deleted menu item ID: ${id}`);

//     res.status(200).json({ message: 'Menu item deleted successfully' });
//   } catch (err) {
//     await connection.rollback();
//     console.error('Error deleting menu item:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   } finally {
//     connection.release();
//   }
// };

// // PATCH - Update menu item status
// export const patchMenu = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;

//     // Validate the status
//     if (!['active', 'inactive'].includes(status)) {
//       return res.status(400).json({ error: 'Invalid status value' });
//     }

//     // Update the menu item's status
//     const [result] = await pool.execute(
//       `UPDATE menu_items SET status = ? WHERE id = ?`,
//       [status, id]
//     );

//     if (result.affectedRows === 0) {
//       return res.status(404).json({ error: 'Menu item not found' });
//     }

//     console.log(` Updated menu item ${id} status to: ${status}`);

//     res.status(200).json({ message: `Menu item status updated to ${status}` });
//   } catch (err) {
//     console.error('Error updating menu item status:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // POST - Reorder menu items
// export const postReorderMenu = async (req, res) => {
//   try {
//     const { menu } = req.body;

//     if (!Array.isArray(menu)) {
//       return res.status(400).json({ error: 'Invalid menu format' });
//     }

//     const connection = await pool.getConnection();
//     try {
//       await connection.beginTransaction();

//       // Iterate over the menu array and update the order_by field
//       for (let index = 0; index < menu.length; index++) {
//         const itemId = menu[index].id || menu[index];
//         const newOrder = index;

//         await connection.execute(
//           `UPDATE menu_items SET order_by = ? WHERE id = ?`,
//           [newOrder, itemId]
//         );
//       }

//       await connection.commit();

//       console.log(` Reordered ${menu.length} menu items`);

//       res.status(200).json({ message: 'Menu order updated successfully' });
//     } catch (err) {
//       await connection.rollback();
//       console.error('Error reordering menu:', err);
//       res.status(500).json({ error: 'Internal server error' });
//     } finally {
//       connection.release();
//     }
//   } catch (err) {
//     console.error('Error reordering menu:', err);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// };

// // //  NEW: Auto-assign menu items to role based on permissions
// // export const autoAssignMenuToRole = async (roleId, permissions) => {
// //   try {
// //     console.log(` Auto-assigning menus for role ${roleId}`);

// //     // Get all active menu items
// //     const [allMenus] = await pool.execute(
// //       `SELECT id, label, title, path FROM menu_items WHERE status = 'active'`
// //     );

// //     const menuAssignments = new Set();

// //     // For each permission module that has can_view = true
// //     for (const [module, perms] of Object.entries(permissions)) {
// //       if (perms.can_view) {
// //         // Find matching menus by label or title
// //         const matchingMenus = allMenus.filter(menu => {
// //           const menuText = ((menu.label || '') + ' ' + (menu.title || '')).toLowerCase();
// //           const moduleLower = module.toLowerCase();

// //           // Check if menu text contains module name or vice versa
// //           return (
// //             menuText.includes(moduleLower) ||
// //             moduleLower.includes(menuText.replace(/\s+/g, ''))
// //           );
// //         });

// //         matchingMenus.forEach(menu => {
// //           menuAssignments.add(menu.id);
// //         });
// //       }
// //     }

// //     // Insert into menu_item_roles
// //     if (menuAssignments.size > 0) {
// //       const values = Array.from(menuAssignments).map(menuId => [menuId, roleId]);

// //       await pool.query(
// //         `INSERT IGNORE INTO menu_item_roles (menu_item_id, role_id) VALUES ?`,
// //         [values]
// //       );

// //       console.log(` Assigned ${menuAssignments.size} menus to role ${roleId}`);
// //       return { success: true, count: menuAssignments.size };
// //     }

// //     return { success: true, count: 0 };
// //   } catch (error) {
// //     console.error(' Error auto-assigning menus:', error);
// //     return { success: false, error: error.message };
// //   }
// // };

// export default {
//   getMenu,
//   getMenuItem,
//   postMenu,
//   putMenu,
//   deleteMenu,
//   patchMenu,
//   postReorderMenu,
//   // autoAssignMenuToRole
// };

import pool from "../db.js";

const formatIconForFrontend = (iconName) => iconName || null;

const organizeMenu = (items) => {
  const menuMap = new Map();
  const result = [];

  items.forEach((item) => {
    menuMap.set(item.id, {
      ...item,
      icon: formatIconForFrontend(item.icon),
      submenu: Boolean(item.submenu),
      showSubRoute: Boolean(item.show_sub_route),
      submenuOpen: Boolean(item.submenu_open),
      submenuHdr: item.submenu_hdr,
      submenuItems: [],
      roles: item.roles ? item.roles.split(",") : [],
    });
  });

  items.forEach((item) => {
    if (item.parent_id === null) {
      result.push(menuMap.get(item.id));
    } else {
      const parent = menuMap.get(item.parent_id);
      if (parent) {
        parent.submenuItems.push(menuMap.get(item.id));
        parent.submenu = true;
      }
    }
  });

  return result;
};

// Route: GET /menu/all
export const getAllMenuItems = async (req, res) => {
  try {
    console.log(" [getAllMenuItems] Fetching ALL menu items for management");

    // Get ALL menu items regardless of status (for admin management)
    const query = `
      SELECT m.*, GROUP_CONCAT(DISTINCT r.name) AS roles
      FROM menu_items m
      LEFT JOIN menu_item_roles mir ON m.id = mir.menu_item_id
      LEFT JOIN roles r ON mir.role_id = r.id
      GROUP BY m.id
      ORDER BY m.order_by ASC
    `;

    const [results] = await pool.execute(query);
    // console.log(` [getAllMenuItems] Found ${results.length} total menu items (active + inactive)`);

    // Return flat array with normalized roles
    const flatItems = results.map((item) => ({
      ...item,
      roles: item.roles ? item.roles.split(",") : [],
    }));

    // console.log(` [getAllMenuItems] Returning ${flatItems.length} items`);
    res.json(flatItems);
  } catch (err) {
    console.error(" [getAllMenuItems] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Route: GET /menu
export const getMenu = async (req, res) => {
  try {
    // console.log(' [getMenu] Fetching menu for user:', req.user?.email);
    // console.log(' [getMenu] User role:', req.user?.role);
    // console.log(' [getMenu] User role_id:', req.user?.role_id);

    const userRole = req.user?.role || "user";
    const userRoleId = req.user?.role_id;

        console.log("=== getMenu DEBUG ===");
    console.log("userRole:", userRole);
    console.log("userRoleId:", userRoleId);
    console.log("isSuperAdmin:", userRole.toLowerCase() === "super admin");


    console.log("=== getMenu CALLED ===");
console.log("Full req.user:", req.user);
console.log("role_id type:", typeof req.user?.role_id);
console.log("role_id value:", req.user?.role_id);


    const isSuperAdmin =
      userRole.toLowerCase() === "super admin"
      // userRole.toLowerCase() === "admin";

    let query = "";
    let params = [];

    if (isSuperAdmin) {
      // Super Admin: Get all ACTIVE menus for sidebar
      // console.log(' [getMenu] Super Admin - fetching active menus');
   query = `
  SELECT m.*, GROUP_CONCAT(DISTINCT r.name) AS roles
  FROM menu_items m
  LEFT JOIN menu_item_roles mir ON m.id = mir.menu_item_id
  LEFT JOIN roles r ON mir.role_id = r.id
  WHERE m.status = 'active'
  AND m.show_in_sidebar = TRUE
  GROUP BY m.id
  ORDER BY m.order_by ASC
`;
    } else {
      // Regular User: Get only active menus assigned to their role
      // console.log(' [getMenu] Regular user - filtering by role_id:', userRoleId);
  query = `
  SELECT DISTINCT m.*, GROUP_CONCAT(DISTINCT r.name) AS roles
  FROM menu_items m
  INNER JOIN menu_item_roles mir ON m.id = mir.menu_item_id
  INNER JOIN roles r ON mir.role_id = r.id
  WHERE mir.role_id = ?
  AND m.status = 'active'
  AND m.show_in_sidebar = TRUE
  GROUP BY m.id
  ORDER BY m.order_by ASC
`;

      params = [userRoleId];
    }

    const [results] = await pool.execute(query, params);
    // console.log(` [getMenu] Found ${results.length} active menu items`);

    const organizedMenu = organizeMenu(results);
    // console.log(`[getMenu] Organized into ${organizedMenu.length} top-level menus`);


    console.log("Query params:", params);
    console.log("Results count:", results.length);
    console.log("First 3 results:", results.slice(0, 3).map(r => ({id: r.id, label: r.label})));
    console.log("=== END getMenu DEBUG ===");


    res.json(organizedMenu);
  } catch (err) {
    console.error(" [getMenu] Error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


export const getMenuItem = async (req, res) => {
  const { id } = req.params;
  try {
    const [menuRows] = await pool.execute(
      `SELECT m.*, GROUP_CONCAT(r.name) AS roles
       FROM menu_items m
       LEFT JOIN menu_item_roles mir ON m.id = mir.menu_item_id
       LEFT JOIN roles r ON mir.role_id = r.id
       WHERE m.id = ?
       GROUP BY m.id`,
      [id]
    );

    if (menuRows.length === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    const menuItem = menuRows[0];
    menuItem.roles = menuItem.roles ? menuItem.roles.split(",") : [];

    res.status(200).json(menuItem);
  } catch (err) {
    console.error("Error fetching menu item:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const postMenu = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const {
      title,
      label,
      path,
      icon,
      roles,
      parent_id,
      status,
      order_by,
      submenu,
      submenu_hdr,
    } = req.body;

    if (!title || !label) {
      return res.status(400).json({ error: "Title and label are required" });
    }

    await connection.beginTransaction();

    const [menuResult] = await connection.execute(
      `INSERT INTO menu_items 
       (title, label, path, icon, parent_id, status, order_by, submenu, submenu_hdr, show_sub_route, submenu_open, time)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, FALSE, TRUE, NOW())`,
      [
        title,
        label,
        path || null,
        icon || null,
        parent_id || null,
        status || "active",
        order_by || 0,
        submenu || false,
        submenu_hdr || null,
      ]
    );

    const menuId = menuResult.insertId;

    if (roles && roles.length > 0) {
      const [roleRows] = await connection.query(
        `SELECT id, name FROM roles WHERE name IN (${roles
          .map(() => "?")
          .join(",")})`,
        roles
      );

      for (const role of roleRows) {
        await connection.execute(
          `INSERT INTO menu_item_roles (menu_item_id, role_id) VALUES (?, ?)`,
          [menuId, role.id]
        );
      }
    }

    await connection.commit();
    // console.log(` Created menu item: ${label} (ID: ${menuId})`);

    res.status(201).json({
      message: "Menu item created successfully",
      id: menuId,
    });
  } catch (err) {
    await connection.rollback();
    console.error("Error adding menu item:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

export const putMenu = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const {
      title,
      label,
      path,
      icon,
      roles,
      parent_id,
      status,
      order_by,
      submenu,
      submenu_hdr,
    } = req.body;

    await connection.beginTransaction();

    const [result] = await connection.execute(
      `UPDATE menu_items
       SET title=?, label=?, path=?, icon=?, parent_id=?, status=?, order_by=?, submenu=?, submenu_hdr=?
       WHERE id=?`,
      [
        title,
        label,
        path || null,
        icon || null,
        parent_id || null,
        status,
        order_by || 0,
        submenu || false,
        submenu_hdr || null,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Menu item not found" });
    }

    await connection.execute(
      `DELETE FROM menu_item_roles WHERE menu_item_id = ?`,
      [id]
    );

    if (roles && roles.length > 0) {
      const [roleRows] = await connection.query(
        `SELECT id, name FROM roles WHERE name IN (${roles
          .map(() => "?")
          .join(",")})`,
        roles
      );
      for (const role of roleRows) {
        await connection.execute(
          `INSERT INTO menu_item_roles (menu_item_id, role_id) VALUES (?, ?)`,
          [id, role.id]
        );
      }
    }

    await connection.commit();
    // console.log(`Updated menu item: ${label} (ID: ${id})`);

    res.status(200).json({ message: "Menu item updated successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error updating menu item:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

export const deleteMenu = async (req, res) => {
  const { id } = req.params;
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.execute(
      `DELETE FROM menu_item_roles WHERE menu_item_id = ?`,
      [id]
    );
    const [result] = await connection.execute(
      `DELETE FROM menu_items WHERE id = ?`,
      [id]
    );

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ error: "Menu item not found" });
    }

    await connection.commit();
    // console.log(`Deleted menu item ID: ${id}`);

    res.status(200).json({ message: "Menu item deleted successfully" });
  } catch (err) {
    await connection.rollback();
    console.error("Error deleting menu item:", err);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    connection.release();
  }
};

export const patchMenu = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid status value" });
    }

    const [result] = await pool.execute(
      `UPDATE menu_items SET status = ? WHERE id = ?`,
      [status, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    // console.log(` Updated menu item ${id} status to: ${status}`);
    res.status(200).json({ message: `Menu item status updated to ${status}` });
  } catch (err) {
    console.error("Error updating menu item status:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const postReorderMenu = async (req, res) => {
  try {
    const { menu } = req.body;

    if (!Array.isArray(menu)) {
      return res.status(400).json({ error: "Invalid menu format" });
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (let index = 0; index < menu.length; index++) {
        const itemId = menu[index].id || menu[index];
        const newOrder = index;

        await connection.execute(
          `UPDATE menu_items SET order_by = ? WHERE id = ?`,
          [newOrder, itemId]
        );
      }
//menu management
      await connection.commit();
      // console.log(` Reordered ${menu.length} menu items`);

      res.status(200).json({ message: "Menu order updated successfully" });
    } catch (err) {
      await connection.rollback();
      console.error("Error reordering menu:", err);
      res.status(500).json({ error: "Internal server error" });
    } finally {
      connection.release();
    }
  } catch (err) {
    console.error("Error reordering menu:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export default {
  getMenu,
  getAllMenuItems,
  getMenuItem,
  postMenu,
  putMenu,
  deleteMenu,
  patchMenu,
  postReorderMenu,
};
