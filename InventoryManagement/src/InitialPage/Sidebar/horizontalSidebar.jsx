
// src/InitialPage/Sidebar/HorizontalSidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import getIconComponent from "../../utils/iconMapper";

const HorizontalSidebar = () => {
  const location = useLocation();
  
  const { items: menuData, loading } = useSelector((state) => state.menu);

  const [openMenus, setOpenMenus] = useState({});

  const toggleMenu = (key) => {
    setOpenMenus(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTopLevelMenu = (key) => {
    const newOpenMenus = {};
    Object.keys(openMenus).forEach(menuKey => {
      if (menuKey.startsWith(key)) {
        newOpenMenus[menuKey] = openMenus[menuKey];
      }
    });
    newOpenMenus[key] = !openMenus[key];
    setOpenMenus(newOpenMenus);
  };

  // Render icon
  const renderIcon = (iconName) => {
    if (!iconName) return null;
    return getIconComponent(iconName);
  };

  // Recursive function to render menu items
  const renderMenuItems = (items, parentKey = '', level = 0) => {
    if (!items || items.length === 0) return null;

    return items.map((item, index) => {
      const menuKey = `${parentKey}-${item.id}-${index}`;
      const hasSubmenu = item.submenuItems && item.submenuItems.length > 0;
      const isActive = location.pathname === item.path;
      const isOpen = openMenus[menuKey];

      if (hasSubmenu) {
        return (
          <li 
            key={menuKey} 
            className={`submenu ${level > 0 ? 'submenu-two' : ''} ${level > 1 ? 'submenu-three' : ''}`}
          >
            <Link
              to="#"
              onClick={() => level === 0 ? toggleTopLevelMenu(menuKey) : toggleMenu(menuKey)}
              className={`${isOpen ? 'subdrop' : ''} ${item.icon ? 'has-icon' : ''}`}
            >
              {/*  Show icon at all levels */}
              {item.icon && renderIcon(item.icon)}
              <span>{item.label || item.title}</span>
              <span className={`menu-arrow ${level > 0 ? 'inside-submenu' : ''} ${level > 1 ? 'inside-submenu-two' : ''}`} />
            </Link>
            <ul style={{ display: isOpen ? 'block' : 'none' }}>
              {renderMenuItems(item.submenuItems, menuKey, level + 1)}
            </ul>
          </li>
        );
      }

      return (
        <li key={menuKey}>
          <Link 
            to={item.path || '#'}
            className={`${isActive ? 'active' : ''} ${item.icon ? 'has-icon' : ''}`}
          >
            {/*  Show icon at all levels */}
            {item.icon && renderIcon(item.icon)}
            <span>{item.label || item.title}</span>
          </Link>
        </li>
      );
    });
  };

  if (loading) {
    return null;
  }

  // Get top-level menu items (parent_id is null)
  const topLevelMenus = menuData.filter(item => item.parent_id === null || !item.path);

  return (
    <div className="sidebar horizontal-sidebar">
      <div id="sidebar-menu-3" className="sidebar-menu">
        <ul className="nav">
          {topLevelMenus.map((menu, index) => {
            const menuKey = `top-${menu.id}-${index}`;
            const hasSubmenu = menu.submenuItems && menu.submenuItems.length > 0;
            const isOpen = openMenus[menuKey];

            if (!hasSubmenu) {
              return (
                <li key={menuKey}>
                  <Link to={menu.path || '#'} className={menu.icon ? 'has-icon' : ''}>
                    {renderIcon(menu.icon)}
                    <span>{menu.label || menu.title}</span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={menuKey} className="submenu">
                <Link
                  to="#"
                  onClick={() => toggleTopLevelMenu(menuKey)}
                  className={`${isOpen ? 'subdrop' : ''} ${menu.icon ? 'has-icon' : ''}`}
                >
                  {renderIcon(menu.icon)}
                  <span>{menu.label || menu.title}</span>
                  <span className="menu-arrow" />
                </Link>
                <ul style={{ display: isOpen ? 'block' : 'none' }}>
                  {renderMenuItems(menu.submenuItems, menuKey, 1)}
                </ul>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default HorizontalSidebar;