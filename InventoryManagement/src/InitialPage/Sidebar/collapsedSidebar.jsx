
// src/InitialPage/Sidebar/CollapsedSidebar.jsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import getIconComponent from "../../utils/iconMapper";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";

const CollapsedSidebar = () => {
  const location = useLocation();
  
  const { items: menuData, loading } = useSelector((state) => state.menu);

  const [activeSubmenu, setActiveSubmenu] = useState({});
  const [activeTab, setActiveTab] = useState(0);

  const toggleSubmenu = (key) => {
    setActiveSubmenu(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  //only use Feather icons
  const renderIcon = (iconName) => {
    if (!iconName) return null;
    return getIconComponent(iconName);
  };

  // Group menu by parent (top-level items become tabs)
  const createTabs = () => {
    return menuData.filter(item => item.parent_id === null || !item.path);
  };

  const tabs = createTabs();

  // Recursive rendering with icons at all levels
  const renderSubmenuItems = (items, level = 0) => {
    if (!items || items.length === 0) return null;

    return items.map((item) => {
      const hasSubmenu = item.submenuItems && item.submenuItems.length > 0;
      const submenuKey = `${item.id}-${level}`;
      const isActive = location.pathname === item.path;

      if (hasSubmenu) {
        return (
          <li 
            key={item.id} 
            className={`submenu ${level > 0 ? 'submenu-two' : ''} ${level > 1 ? 'submenu-three' : ''}`}
          >
            <Link
              to="#"
              onClick={() => toggleSubmenu(submenuKey)}
              className={`${activeSubmenu[submenuKey] ? 'subdrop' : ''} ${item.icon ? 'has-icon' : ''}`}
            >
              {item.icon && renderIcon(item.icon)}
              <span>{item.label || item.title}</span>
              <span className={`menu-arrow ${level > 0 ? 'inside-submenu' : ''} ${level > 1 ? 'inside-submenu-two' : ''}`} />
            </Link>
            <ul style={{ display: activeSubmenu[submenuKey] ? 'block' : 'none' }}>
              {renderSubmenuItems(item.submenuItems, level + 1)}
            </ul>
          </li>
        );
      }

      return (
        <li key={item.id}>
          <Link 
            to={item.path || '#'}
            className={`${isActive ? 'active' : ''} ${item.icon ? 'has-icon' : ''}`}
          >
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

  return (
    <div className="sidebar collapsed-sidebar" id="collapsed-sidebar">
      <div className="sidebar-inner slimscroll">
        <div id="sidebar-menu-2" className="sidebar-menu sidebar-menu-three">
          <aside id="aside" className="ui-aside">
            <ul className="tab nav nav-tabs" id="myTab" role="tablist">
              {tabs.map((tab, index) => (
                <li className="nav-item" role="presentation" key={tab.id}>
                  <Link
                    className={`tablinks nav-link ${activeTab === index ? 'active' : ''}`}
                    to={`#tab-${tab.id}`}
                    onClick={() => setActiveTab(index)}
                    role="tab"
                  >
                    {renderIcon(tab.icon)}
                  </Link>
                </li>
              ))}
            </ul>
          </aside>

          <div className="tab-content tab-content-four pt-2">
            {tabs.map((tab, index) => (
              <ul
                key={tab.id}
                className={`tab-pane ${activeTab === index ? 'active' : ''}`}
                id={`tab-${tab.id}`}
                style={{ display: activeTab === index ? 'block' : 'none' }}
              >
                {tab.submenuItems && tab.submenuItems.length > 0 ? (
                  renderSubmenuItems(tab.submenuItems)
                ) : (
                  <li>
                    <span className="text-muted">No items</span>
                  </li>
                )}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollapsedSidebar;