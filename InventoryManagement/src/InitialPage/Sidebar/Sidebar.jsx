
// src/InitialPage/Sidebar/Sidebar.jsx
import React, { useState } from "react";
import Scrollbars from "react-custom-scrollbars-2";
import { useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import getIconComponent from "../../utils/iconMapper"; 
import HorizontalSidebar from "./horizontalSidebar";
import CollapsedSidebar from "./collapsedSidebar";
import { usePermissions } from "../../hooks/usePermission";



const Sidebar = () => {
  const location = useLocation();
  const {hasPermission} = usePermissions()
  //  const {hasPermission, permissions, loading: permLoading} = usePermissions()
  
  
  const { items: sidebarData, loading } = useSelector((state) => state.menu);
  const user = useSelector((state) => state.auth.user);
  const userRole = user?.role; 


  
  console.log(userRole)

  const [subOpen, setSubopen] = useState("");
  const [subsidebar, setSubsidebar] = useState("");

  const toggleSidebar = (title) => {
    setSubopen(subOpen === title ? "" : title);
  };

  const toggleSubsidebar = (subitem) => {
    setSubsidebar(subsidebar === subitem ? "" : subitem);
  };

  const renderIcon = (iconName) => {
    if (!iconName) return null;
    return getIconComponent(iconName);
  };

  // Check if current path matches menu item
  const isActive = (item) => {
    if (item.path === location.pathname) return true;
    if (item.submenuItems) { 
      return item.submenuItems.some(sub => isActive(sub));
    }
    return false;
  };




const filterMenuByPermission = (menuItems) => {
  return menuItems.map((item) => {
    const clonedItem = { ...item };

    if (clonedItem.submenuItems) {
      clonedItem.submenuItems = filterMenuByPermission(clonedItem.submenuItems);
    }

    // If module defined, check permission
    if (item.module) {
      if (!hasPermission(item.module, "view")) {
        return null;
      }
    }

    return clonedItem;
  }).filter(Boolean);
};

  const filteredSidebarData = filterMenuByPermission(sidebarData);

  if (loading) {
    return <div className="sidebar">Loading menu...</div>;
  }

  return (
    <div>
      <div className="sidebar" id="sidebar">
        <Scrollbars>
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu">
              <ul>
                {filteredSidebarData?.map((mainLabel, index) => (
                  <li className="submenu-open" key={index}>
                
                    {mainLabel.submenu_hdr && (
                      <h6 className="submenu-hdr">{mainLabel.submenu_hdr}</h6>
                    )}

                    <ul>
                      {mainLabel?.submenuItems?.map((title, i) => (
                        <li className="submenu" key={i}>
                          <Link
                            to={title?.path || "#"}
                            onClick={() => title.submenuItems && toggleSidebar(title?.title)}
                            className={`${subOpen === title?.title ? "subdrop" : ""} ${
                              isActive(title) ? "active" : ""
                            }`}
                          >
                            {renderIcon(title?.icon)}
                            <span>{title?.label || title?.title}</span>
                            {title?.submenuItems && title.submenuItems.length > 0 && (
                              <span className="menu-arrow" />
                            )}
                          </Link>

                   
                          {title?.submenuItems && title.submenuItems.length > 0 && (
                            <ul
                              style={{
                                display: subOpen === title?.title ? "block" : "none",
                              }}
                            >
                              {title.submenuItems.map((item, titleIndex) => (
                                <li
                                  className="submenu submenu-two"
                                  key={titleIndex}
                                >
                                  <Link
                                    to={item?.path || "#"}
                                    className={`${
                                      item?.path === location.pathname ? "active" : ""
                                    } ${item?.icon ? "has-icon" : ""}`}
                                    onClick={() => {
                                      if (item.submenuItems && item.submenuItems.length > 0) {
                                        toggleSubsidebar(item?.title);
                                      }
                                    }}
                                  >
                                    {renderIcon(item?.icon)}
                                    <span>{item?.label || item?.title}</span>
                                    {item?.submenuItems && item.submenuItems.length > 0 && (
                                      <span className="menu-arrow" />
                                    )}
                                  </Link>

                                
                                  {item?.submenuItems && item.submenuItems.length > 0 && (
                                    <ul
                                      style={{
                                        display:
                                          subsidebar === item?.title ? "block" : "none",
                                      }}
                                    >
                                      {item.submenuItems.map((subItem, subIndex) => (
                                        <li key={subIndex}>
                                          <Link
                                            to={subItem?.path || "#"}
                                            className={`${
                                              subItem?.path === location.pathname
                                                ? "active"
                                                : ""
                                            } ${subItem?.icon ? "has-icon" : ""}`}
                                          >
                                            {renderIcon(subItem?.icon)}
                                            <span>{subItem?.label || subItem?.title}</span>
                                          </Link>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </li>
                              ))}
                            </ul>
                          )}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Scrollbars>
      </div>
      <HorizontalSidebar />
      <CollapsedSidebar />
    </div>
  );
};

export default Sidebar;


