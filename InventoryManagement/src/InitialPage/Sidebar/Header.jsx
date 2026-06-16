
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import { Search, XCircle, Loader } from "react-feather";
import { all_routes } from "../../Router/all_routes";
import { loginSuccess, logout } from "../../core/redux/slices/authSlice"; 
import { useDispatch, useSelector } from 'react-redux';
import AuthService from "../../services/authService";
import { clearMenu } from "../../core/redux/slices/menuSlice";

const Header = () => {
  const route = all_routes;
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [toggle, SetToggle] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadEmailCount, setUnreadEmailCount] = useState(0);
  

  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState({
    users: [],
    products: [],
    warehouses: [],
    articles: [],
    roles: []
  });
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  
  const debounceTimerRef = useRef(null);
  const searchDropdownRef = useRef(null);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);


  


const performSearch = useCallback(async (query) => {
  // Start searching from 1 character (was 2 before)
  if (!query || query.trim().length < 1) {
    setSearchResults({ users: [], products: [], warehouses: [], articles: [], roles: [] });
    setShowSearchDropdown(false);
    setIsSearching(false);
    return;
  }

  setIsSearching(true);
  setShowSearchDropdown(true);

  try {
    const trimmedQuery = query.trim();

    const [usersRes, productsRes, warehousesRes, articlesRes, rolesRes] = await Promise.allSettled([
      AuthService.searchUsers(trimmedQuery, 5),
      AuthService.searchProducts(trimmedQuery, 5),
      AuthService.searchWarehouses(trimmedQuery, 5), 
      AuthService.searchArticles(trimmedQuery, 5),
      AuthService.searchRoles(trimmedQuery, 5)  
    ]);

    setSearchResults({
      users:      usersRes.status      === 'fulfilled' ? usersRes.value.data.users   || [] : [],
      products:   productsRes.status   === 'fulfilled' ? productsRes.value.data.data  || [] : [],
      warehouses: warehousesRes.status === 'fulfilled' ? warehousesRes.value.data.data || [] : [],
      articles:   articlesRes.status   === 'fulfilled' ? articlesRes.value.data.data  || [] : [],
      roles:      rolesRes.status      === 'fulfilled' ? rolesRes.value.data.roles    || [] : [],
    });

  } catch (error) {
    console.error('Search error:', error);
  } finally {
    setIsSearching(false);
  }
}, []);


const handleSearchChange = (e) => {
  const value = e.target.value;
  setSearchTerm(value);


  if (debounceTimerRef.current) {
    clearTimeout(debounceTimerRef.current);
  }


  if (!value.trim()) {
    setSearchResults({ users: [], products: [], warehouses: [], articles: [], roles: [] });
    setShowSearchDropdown(false);
    setIsSearching(false);
    return;
  }


  debounceTimerRef.current = setTimeout(() => {
    performSearch(value);
  }, 400);
};


 
  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults({
      users: [],
      products: [],
      warehouses: [],
      articles: [],
      roles: []
    });
    setShowSearchDropdown(false);
  };

  const handleResultClick = (type, id) => {
    setShowSearchDropdown(false);
    setSearchTerm('');
    
    const routes = {
      user: `/users-list`,
      product: `/product-list`,
      warehouse: `/warehouse`,
      article: `/product-list`,
      role: `/roles-permissions`
    };

    navigate(routes[type] || '/dashboard');
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const totalResults = Object.values(searchResults).reduce((sum, arr) => sum + arr.length, 0);


  
  const fetchNotifications = async () => {
    try {
      const response = await AuthService.getNotifications(20);
      const notifs = response.data.data || [];
      setNotifications(notifs);
      
      const unreadEmails = notifs.filter(n => 
        !n.is_read && (n.type === 'new_email' || n.type === 'stock_request' || n.type === 'stock_response')
      ).length;
      setUnreadEmailCount(unreadEmails);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await AuthService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
      const updatedNotifs = notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      );
      const unreadEmails = updatedNotifs.filter(n => 
        !n.is_read && (n.type === 'new_email' || n.type === 'stock_request' || n.type === 'stock_response')
      ).length;
      setUnreadEmailCount(unreadEmails);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await AuthService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadEmailCount(0);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [location.pathname,isAuthenticated,user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    dispatch(clearMenu());
    dispatch(logout());
    navigate('/signin');
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsRead(notif.id);
    }
  };

  const handleEmailIconClick = () => {
    const unreadEmailNotifs = notifications.filter(n => 
      !n.is_read && (n.type === 'new_email' || n.type === 'stock_request' || n.type === 'stock_response')
    );
    unreadEmailNotifs.forEach(n => markAsRead(n.id));
  };

  const slideDownSubmenu = () => {
    const subdropPlusUl = document.getElementsByClassName("subdrop");
    for (let i = 0; i < subdropPlusUl.length; i++) {
      const submenu = subdropPlusUl[i].nextElementSibling;
      if (submenu && submenu.tagName.toLowerCase() === "ul") {
        submenu.style.display = "block";
      }
    }
  };

  const slideUpSubmenu = () => {
    const subdropPlusUl = document.getElementsByClassName("subdrop");
    for (let i = 0; i < subdropPlusUl.length; i++) {
      const submenu = subdropPlusUl[i].nextElementSibling;
      if (submenu && submenu.tagName.toLowerCase() === "ul") {
        submenu.style.display = "none";
      }
    }
  };

  useEffect(() => {
    let expandTimeout = null;
    
    const handleMouseover = (e) => {
      const body = document.body;
      const toggleBtn = document.getElementById("toggle_btn");

      if (!body.classList.contains("mini-sidebar")) return;
      if (!toggleBtn) return;

      const toggleBtnStyle = window.getComputedStyle(toggleBtn);
      if (toggleBtnStyle.display === 'none' || toggleBtnStyle.visibility === 'hidden') return;

      const target = e.target.closest(".sidebar, .header-left, #sidebar, #collapsed-sidebar");

      if (expandTimeout) {
        clearTimeout(expandTimeout);
        expandTimeout = null;
      }

      if (target) {
        if (!body.classList.contains("expand-menu")) {
          body.classList.add("expand-menu");
          slideDownSubmenu();
        }
      } else {
        if (body.classList.contains("expand-menu")) {
          expandTimeout = setTimeout(() => {
            body.classList.remove("expand-menu");
            slideUpSubmenu();
          }, 100);
        }
      }
    };

    document.addEventListener("mouseover", handleMouseover);
    return () => {
      document.removeEventListener("mouseover", handleMouseover);
      if (expandTimeout) {
        clearTimeout(expandTimeout);
      }
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement ||
          document.mozFullScreenElement ||
          document.webkitFullscreenElement ||
          document.msFullscreenElement
      );
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("msfullscreenchange", handleFullscreenChange);
    };
  }, []);

  const handlesidebar = () => {
    const body = document.body;
    const isMiniSidebar = body.classList.contains("mini-sidebar");
    
    body.classList.toggle("mini-sidebar");
    SetToggle((current) => !current);
    
    if (isMiniSidebar) {
      body.classList.remove("expand-menu");
      slideUpSubmenu();
    }
  };

  const sidebarOverlay = () => {
    document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
    document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
    document?.querySelector("html")?.classList?.toggle("menu-opened");
  };

  const pathname = location.pathname;

  const exclusionArray = [
    "/reactjs/template/dream-pos/index-three",
    "/reactjs/template/dream-pos/index-one",
  ];
  if (exclusionArray.indexOf(window.location.pathname) >= 0) {
    return "";
  }

  const toggleFullscreen = (elem) => {
    elem = elem || document.documentElement;
    if (
      !document.fullscreenElement &&
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
    ) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    }
  };

  return (
    <>
      <div className="header">
        <div className={`header-left ${toggle ? "" : "active"}`}>
          <Link to="/dashboard" className="logo logo-normal">
            <ImageWithBasePath src="assets/img/logo.png" alt="img" />
          </Link>
          <Link to="/dashboard" className="logo logo-white">
            <ImageWithBasePath src="assets/img/logo-white.png" alt="img" />
          </Link>
          <Link to="/dashboard" className="logo-small">
            <ImageWithBasePath src="assets/img/logo-small.png" alt="img" />
          </Link>
          <Link
            id="toggle_btn"
            to="#"
            style={{
              display: pathname.includes("tasks")
                ? "none"
                : pathname.includes("compose")
                ? "none"
                : "",
            }}
            onClick={handlesidebar}
          >
            <FeatherIcon icon="chevrons-left" className="feather-16" />
          </Link>
        </div>

        <Link
          id="mobile_btn"
          className="mobile_btn"
          to="#"
          onClick={sidebarOverlay}
        >
          <span className="bar-icon">
            <span />
            <span />
            <span />
          </span>
        </Link>

        <ul className="nav user-menu">
     
          <li className="nav-item nav-searchinputs">
            <div className="top-nav-search" ref={searchDropdownRef}>
              <Link to="#" className="responsive-search">
                <Search />
              </Link>
              <form action="#" className="dropdown" onSubmit={(e) => e.preventDefault()}>
                <div className="searchinputs">
                  <input 
                    type="text" 
                    placeholder="Search users, products, warehouses..." 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => searchTerm.trim().length >= 1 && setShowSearchDropdown(true)}
                  />
                  <div className="search-addon">
                    <span>
                      {isSearching ? (
                        <Loader className="feather-14" style={{ animation: 'spin 1s linear infinite' }} />
                      ) : searchTerm ? (
                        <XCircle 
                          className="feather-14" 
                          onClick={handleClearSearch}
                          style={{ cursor: 'pointer' }}
                        />
                      ) : (
                        <Search className="feather-14" />
                      )}
                    </span>
                  </div>
                </div>

                {showSearchDropdown && (
                  <div className="dropdown-menu search-dropdown" style={{ display: 'block' }}>
                    {totalResults === 0 && !isSearching && searchTerm.length >= 1 && (
                      <div className="search-info">
                        <p className="text-center text-muted py-3">No results found</p>
                      </div>
                    )}

                    {/* Users */}
                    {searchResults.users.length > 0 && (
                      <div className="search-info">
                        <h6>
                          <span><FeatherIcon icon="users" className="feather-16" /></span>
                          Users ({searchResults.users.length})
                        </h6>
                        <ul className="search-results-list" style={{ listStyle: 'none', padding: 0 }}>
                          {searchResults.users.map((user) => (
                            <li 
                              key={user.id}
                              onClick={() => handleResultClick('user', user.id)}
                              style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer',
                                borderRadius: '4px',
                                marginBottom: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div className="d-flex align-items-center">
                                {/* <ImageWithBasePath
                                  src={user.avatar || "assets/img/profiles/avator1.jpg"}
                                  alt={user.name}
                                  style={{ width: '32px', height: '32px', borderRadius: '50%', marginRight: '10px' }}
                                /> */}
                                <div>
                                  <div style={{ fontWeight: '500' }}>{user.name}</div>
                                  <small className="text-muted">{user.email} • {user.role_name}</small>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Products */}
                    {searchResults.products.length > 0 && (
                      <div className="search-info">
                        <h6>
                          <span><FeatherIcon icon="package" className="feather-16" /></span>
                          Products ({searchResults.products.length})
                        </h6>
                        <ul className="search-results-list" style={{ listStyle: 'none', padding: 0 }}>
                          {searchResults.products.map((product) => (
                            <li 
                              key={product.id}
                              onClick={() => handleResultClick('product', product.id)}
                              style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer',
                                borderRadius: '4px',
                                marginBottom: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ fontWeight: '500' }}>{product.title}</div>
                              <small className="text-muted">
                                {product.barcode} • Stock: {product.count}
                                {product.warehouse_name && ` • ${product.warehouse_name}`}
                              </small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Warehouses */}
                    {searchResults.warehouses.length > 0 && (
                      <div className="search-info">
                        <h6>
                          <span><FeatherIcon icon="home" className="feather-16" /></span>
                          Warehouses ({searchResults.warehouses.length})
                        </h6>
                        <ul className="search-results-list" style={{ listStyle: 'none', padding: 0 }}>
                          {searchResults.warehouses.map((warehouse) => (
                            <li 
                              key={warehouse.id}
                              onClick={() => handleResultClick('warehouse', warehouse.id)}
                              style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer',
                                borderRadius: '4px',
                                marginBottom: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ fontWeight: '500' }}>{warehouse.name || warehouse.title}</div>
                              <small className="text-muted">{warehouse.address}</small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Articles */}
                    {searchResults.articles.length > 0 && (
                      <div className="search-info">
                        <h6>
                          <span><FeatherIcon icon="file-text" className="feather-16" /></span>
                          Articles ({searchResults.articles.length})
                        </h6>
                        <ul className="search-results-list" style={{ listStyle: 'none', padding: 0 }}>
                          {searchResults.articles.map((article) => (
                            <li 
                              key={article.uuid || article.art_prof_uuid}
                              onClick={() => handleResultClick('article', article.uuid)}
                              style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer',
                                borderRadius: '4px',
                                marginBottom: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ fontWeight: '500' }}>{article.title}</div>
                              <small className="text-muted">
                                {article.category} • {article.brand} • SKU: {article.sku}
                              </small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Roles */}
                    {searchResults.roles.length > 0 && (
                      <div className="search-info">
                        <h6>
                          <span><FeatherIcon icon="shield" className="feather-16" /></span>
                          Roles ({searchResults.roles.length})
                        </h6>
                        <ul className="search-results-list" style={{ listStyle: 'none', padding: 0 }}>
                          {searchResults.roles.map((role) => (
                            <li 
                              key={role.id}
                              onClick={() => handleResultClick('role', role.id)}
                              style={{ 
                                padding: '8px 12px', 
                                cursor: 'pointer',
                                borderRadius: '4px',
                                marginBottom: '4px'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ fontWeight: '500' }}>{role.name}</div>
                              <small className="text-muted">
                                {Object.keys(role.permissions || {}).length} permissions
                              </small>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {totalResults > 0 && (
                      <div className="topnav-dropdown-footer">
                        <small className="text-muted">
                          Showing {totalResults} result{totalResults !== 1 ? 's' : ''}
                        </small>
                      </div>
                    )}
                  </div>
                )}
              </form>
            </div>
          </li>

          <li className="nav-item nav-item-box">
            <Link
              to="#"
              id="btnFullscreen"
              onClick={() => toggleFullscreen()}
              className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
            >
              <FeatherIcon icon="maximize" />
            </Link>
          </li>

          <li className="nav-item nav-item-box">
            <Link to="/email" onClick={handleEmailIconClick}>
              <FeatherIcon icon="mail" />
              {unreadEmailCount > 0 && (
                <span className="badge rounded-pill">{unreadEmailCount}</span>
              )}
            </Link>
          </li>

          {/* Notifications */}
          <li className="nav-item dropdown nav-item-box">
            <Link
              to="#"
              className="dropdown-toggle nav-link"
              data-bs-toggle="dropdown"
            >
              <FeatherIcon icon="bell" />
              <span className="badge rounded-pill">
                {notifications.filter(n => !n.is_read).length}
              </span>
            </Link>
            <div className="dropdown-menu notifications">
              <div className="topnav-dropdown-header">
                <span className="notification-title">Notifications</span>
                <Link to="#" className="clear-noti" onClick={(e) => {
                  e.preventDefault();
                  markAllAsRead();
                }}>
                  Clear All
                </Link>
              </div>
              <div className="noti-content">
                <ul className="notification-list">
                  {notifications.slice(0, 5).map((notif) => (
                    <li 
                      key={notif.id} 
                      className={`notification-message ${!notif.is_read ? 'active' : ''}`}
                    >
                      <Link to="/email" onClick={() => handleNotificationClick(notif)}>
                        <div className="media d-flex">
                          <span className="avatar flex-shrink-0">
                            <i className={`fas ${
                              notif.type === 'stock_request' ? 'fa-box' :
                              notif.type === 'stock_response' ? 'fa-reply' :
                              'fa-envelope'
                            }`} style={{ fontSize: '24px', padding: '8px' }} />
                          </span>
                          <div className="media-body flex-grow-1">
                            <p className="noti-details">
                              <span className="noti-title">{notif.title}</span>
                              <br />
                              {notif.message}
                            </p>
                            <p className="noti-time">
                              <span className="notification-time">
                                {new Date(notif.created_at).toLocaleString()}
                              </span>
                            </p>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="notification-message">
                      <div className="text-center py-3">
                        <p className="text-muted">No notifications</p>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
              <div className="topnav-dropdown-footer">
                <Link to="/email">View all Notifications</Link>
              </div>
            </div>
          </li>

          <li className="nav-item dropdown has-arrow main-drop">
            {user ? (
              <>
                <Link
                  to="#"
                  className="dropdown-toggle nav-link userset"
                  data-bs-toggle="dropdown"
                >
                  <span className="user-info">
                    <span className="user-letter">
                      <ImageWithBasePath
                        src={user.avatar || "assets/img/profiles/avator1.jpg"}
                        alt="img"
                        className="img-fluid"
                      />
                    </span>
                    <span className="user-detail">
                      <span className="user-name">{user.name}</span>
                      <span className="user-role">{user.role}</span>
                    </span>
                  </span>
                </Link>
                <div className="dropdown-menu menu-drop-user">
                  <div className="profilename">
                    <div className="profileset">
                      <span className="user-img">
                        <ImageWithBasePath
                          src={user.avatar || "assets/img/profiles/avator1.jpg"}
                          alt="img"
                        />
                        <span className="status online" />
                      </span>
                      <div className="profilesets">
                        <h6>{user.name}</h6>
                        <h5>{user.role}</h5>
                      </div>
                    </div>
                    <hr className="m-0" />
                    <Link className="dropdown-item" to={route.profile}>
                      <i className="me-2" data-feather="user" /> My Profile
                    </Link>
                    <Link className="dropdown-item" to={route.generalsettings}>
                      <i className="me-2" data-feather="settings" />
                      Settings
                    </Link>
                    <hr className="m-0" />
                    <button
                      className="dropdown-item logout pb-0"
                      onClick={handleLogout}
                      style={{ border: "none", background: "none" }}
                    >
                      <ImageWithBasePath
                        src="assets/img/icons/log-out.svg"
                        alt="img"
                        className="me-2"
                      />
                      Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <Link to={route.signin} className="nav-link">
                <FeatherIcon icon="log-in" className="me-1" /> Sign In
              </Link>
            )}
          </li>
        </ul>

        <div className="dropdown mobile-user-menu">
          <Link
            to="#"
            className="nav-link dropdown-toggle"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <i className="fa fa-ellipsis-v" />
          </Link>
          <div className="dropdown-menu dropdown-menu-right">
            {user ? (
              <>
                <Link className="dropdown-item" to={route.profile}>
                  My Profile
                </Link>
                <Link className="dropdown-item" to={route.generalsettings}>
                  Settings
                </Link>
                <button
                  className="dropdown-item"
                  onClick={handleLogout}
                  style={{ border: "none", background: "none" }}
                >
                  Logout
                </button>
              </>
            ) : (
              <Link className="dropdown-item" to={route.signin}>
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Add inline style for spinning loader */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .search-results-list {
          max-height: 300px;
          overflow-y: auto;
        }
      `}</style>
    </>
  );
};

export default Header;



// //with Notifications ad read

// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import FeatherIcon from "feather-icons-react";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
// import { Search, XCircle } from "react-feather";
// import { all_routes } from "../../Router/all_routes";
// import { loginSuccess, logout } from "../../core/redux/slices/authSlice"; 
// import { useDispatch, useSelector } from 'react-redux';
// import AuthService from "../../services/authService";

// const Header = () => {
//   const route = all_routes;
//   const location = useLocation();
//   const [toggle, SetToggle] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const [notifications, setNotifications] = useState([]);
//   const [unreadEmailCount, setUnreadEmailCount] = useState(0);

//   const dispatch = useDispatch();  
//   const navigate = useNavigate();
  
//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     try {
//       const response = await AuthService.getNotifications(20);
//       const notifs = response.data.data || [];
//       setNotifications(notifs);
      
//       // Count unread email notifications
//       const unreadEmails = notifs.filter(n => 
//         !n.is_read && (n.type === 'new_email' || n.type === 'stock_request' || n.type === 'stock_response')
//       ).length;
//       setUnreadEmailCount(unreadEmails);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   // Mark notification as read
//   const markAsRead = async (notificationId) => {
//     try {
//       await AuthService.markNotificationAsRead(notificationId);
//       // Update local state immediately for better UX
//       setNotifications(prev => 
//         prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
//       );
//       // Recalculate unread count
//       const updatedNotifs = notifications.map(n => 
//         n.id === notificationId ? { ...n, is_read: true } : n
//       );
//       const unreadEmails = updatedNotifs.filter(n => 
//         !n.is_read && (n.type === 'new_email' || n.type === 'stock_request' || n.type === 'stock_response')
//       ).length;
//       setUnreadEmailCount(unreadEmails);
//     } catch (error) {
//       console.error("Error marking notification as read:", error);
//     }
//   };

//   // Mark all notifications as read
//   const markAllAsRead = async () => {
//     try {
//       await AuthService.markAllNotificationsAsRead();
//       setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
//       setUnreadEmailCount(0);
//     } catch (error) {
//       console.error("Error marking all notifications as read:", error);
//     }
//   };


//   useEffect(() => {
//     if (isAuthenticated && user) {
//       fetchNotifications();
      
  
//       const interval = setInterval(() => {
//         fetchNotifications();
//       }, 30000);

//       return () => clearInterval(interval);
//     }
//   }, [isAuthenticated, user]);


//   useEffect(() => {
//     if (isAuthenticated && user) {
//       fetchNotifications();
//     }
//   }, [location.pathname]);

//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('user');
//     sessionStorage.removeItem('token');
//     sessionStorage.removeItem('user');
//     dispatch(logout());
//     navigate('/signin');
//   };

//   const handleNotificationClick = (notif) => {
//     // Mark as read when clicked
//     if (!notif.is_read) {
//       markAsRead(notif.id);
//     }
//   };

//   const handleEmailIconClick = () => {
//     // Mark all email notifications as read when navigating to email
//     const unreadEmailNotifs = notifications.filter(n => 
//       !n.is_read && (n.type === 'new_email' || n.type === 'stock_request' || n.type === 'stock_response')
//     );
//     unreadEmailNotifs.forEach(n => markAsRead(n.id));
//   };

//   const isElementVisible = (element) => {
//     if (!element) return false;
//     return element.offsetWidth > 0 || element.offsetHeight > 0;
//   };

//   const slideDownSubmenu = () => {
//     const subdropPlusUl = document.getElementsByClassName("subdrop");
//     for (let i = 0; i < subdropPlusUl.length; i++) {
//       const submenu = subdropPlusUl[i].nextElementSibling;
//       if (submenu && submenu.tagName.toLowerCase() === "ul") {
//         submenu.style.display = "block";
//       }
//     }
//   };

//   const slideUpSubmenu = () => {
//     const subdropPlusUl = document.getElementsByClassName("subdrop");
//     for (let i = 0; i < subdropPlusUl.length; i++) {
//       const submenu = subdropPlusUl[i].nextElementSibling;
//       if (submenu && submenu.tagName.toLowerCase() === "ul") {
//         submenu.style.display = "none";
//       }
//     }
//   };

//   useEffect(() => {
//     let expandTimeout = null;
    
//     const handleMouseover = (e) => {
//       const body = document.body;
//       const toggleBtn = document.getElementById("toggle_btn");

//       if (!body.classList.contains("mini-sidebar")) {
//         return;
//       }

//       if (!toggleBtn) {
//         return;
//       }

//       const toggleBtnStyle = window.getComputedStyle(toggleBtn);
//       if (toggleBtnStyle.display === 'none' || toggleBtnStyle.visibility === 'hidden') {
//         return;
//       }

//       const target = e.target.closest(".sidebar, .header-left, #sidebar, #collapsed-sidebar");

//       if (expandTimeout) {
//         clearTimeout(expandTimeout);
//         expandTimeout = null;
//       }

//       if (target) {
//         if (!body.classList.contains("expand-menu")) {
//           body.classList.add("expand-menu");
//           slideDownSubmenu();
//         }
//       } else {
//         if (body.classList.contains("expand-menu")) {
//           expandTimeout = setTimeout(() => {
//             body.classList.remove("expand-menu");
//             slideUpSubmenu();
//           }, 100);
//         }
//       }
//     };

//     document.addEventListener("mouseover", handleMouseover);

//     return () => {
//       document.removeEventListener("mouseover", handleMouseover);
//       if (expandTimeout) {
//         clearTimeout(expandTimeout);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(
//         document.fullscreenElement ||
//           document.mozFullScreenElement ||
//           document.webkitFullscreenElement ||
//           document.msFullscreenElement
//       );
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("mozfullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//     document.addEventListener("msfullscreenchange", handleFullscreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("msfullscreenchange", handleFullscreenChange);
//     };
//   }, []);

//   const handlesidebar = () => {
//     const body = document.body;
//     const isMiniSidebar = body.classList.contains("mini-sidebar");
    
//     body.classList.toggle("mini-sidebar");
//     SetToggle((current) => !current);
    
//     if (isMiniSidebar) {
//       body.classList.remove("expand-menu");
//       slideUpSubmenu();
//     }
//   };
  
//   const expandMenu = () => {
//     if (document.body.classList.contains("mini-sidebar")) {
//       document.body.classList.remove("expand-menu");
//       slideUpSubmenu();
//     }
//   };
  
//   const expandMenuOpen = () => {
//     if (document.body.classList.contains("mini-sidebar")) {
//       document.body.classList.add("expand-menu");
//       slideDownSubmenu();
//     }
//   };

//   const sidebarOverlay = () => {
//     document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
//     document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
//     document?.querySelector("html")?.classList?.toggle("menu-opened");
//   };

//   const pathname = location.pathname;



//   const toggleFullscreen = (elem) => {
//     elem = elem || document.documentElement;
//     if (
//       !document.fullscreenElement &&
//       !document.mozFullScreenElement &&
//       !document.webkitFullscreenElement &&
//       !document.msFullscreenElement
//     ) {
//       if (elem.requestFullscreen) {
//         elem.requestFullscreen();
//       } else if (elem.msRequestFullscreen) {
//         elem.msRequestFullscreen();
//       } else if (elem.mozRequestFullScreen) {
//         elem.mozRequestFullScreen();
//       } else if (elem.webkitRequestFullscreen) {
//         elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       } else if (document.msExitFullscreen) {
//         document.msExitFullscreen();
//       } else if (document.mozCancelFullScreen) {
//         document.mozCancelFullScreen();
//       } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//       }
//     }
//   };

//   return (
//     <>
//       <div className="header">
//         <div className={`header-left ${toggle ? "" : "active"}`}>
//           <Link to="/dashboard" className="logo logo-normal">
//             <ImageWithBasePath src="assets/img/logo.png" alt="img" />
//           </Link>
//           <Link to="/dashboard" className="logo logo-white">
//             <ImageWithBasePath src="assets/img/logo-white.png" alt="img" />
//           </Link>
//           <Link to="/dashboard" className="logo-small">
//             <ImageWithBasePath src="assets/img/logo-small.png" alt="img" />
//           </Link>
//           <Link
//             id="toggle_btn"
//             to="#"
//             style={{
//               display: pathname.includes("tasks")
//                 ? "none"
//                 : pathname.includes("compose")
//                 ? "none"
//                 : "",
//             }}
//             onClick={handlesidebar}
//           >
//             <FeatherIcon icon="chevrons-left" className="feather-16" />
//           </Link>
//         </div>

//         <Link
//           id="mobile_btn"
//           className="mobile_btn"
//           to="#"
//           onClick={sidebarOverlay}
//         >
//           <span className="bar-icon">
//             <span />
//             <span />
//             <span />
//           </span>
//         </Link>

//         <ul className="nav user-menu">
//           <li className="nav-item nav-searchinputs">
//             <div className="top-nav-search">
//               <Link to="#" className="responsive-search">
//                 <Search />
//               </Link>
//               <form action="#" className="dropdown">
//                 <div
//                   className="searchinputs dropdown-toggle"
//                   id="dropdownMenuClickable"
//                   data-bs-toggle="dropdown"
//                   data-bs-auto-close="false"
//                 >
//                   <input type="text" placeholder="Search" />
//                   <div className="search-addon">
//                     <span>
//                       <XCircle className="feather-14" />
//                     </span>
//                   </div>
//                 </div>
//                 <div
//                   className="dropdown-menu search-dropdown"
//                   aria-labelledby="dropdownMenuClickable"
//                 >
//                   <div className="search-info">
//                     <h6>
//                       <span>
//                         <i data-feather="search" className="feather-16" />
//                       </span>
//                       Recent Searches
//                     </h6>
//                     <ul className="search-tags">
//                       <li><Link to="#">Products</Link></li>
//                       <li><Link to="#">Sales</Link></li>
//                       <li><Link to="#">Applications</Link></li>
//                     </ul>
//                   </div>
//                   <div className="search-info">
//                     <h6>
//                       <span>
//                         <i data-feather="help-circle" className="feather-16" />
//                       </span>
//                       Help
//                     </h6>
//                     <p>How to Change Product Volume from 0 to 200 on Inventory management</p>
//                     <p>Change Product Name</p>
//                   </div>
//                   <div className="search-info">
//                     <h6>
//                       <span>
//                         <i data-feather="user" className="feather-16" />
//                       </span>
//                       Customers
//                     </h6>
//                     <ul className="customers">
//                       <li>
//                         <Link to="#">
//                           Aron Varu
//                           <ImageWithBasePath
//                             src="assets/img/profiles/avator1.jpg"
//                             alt
//                             className="img-fluid"
//                           />
//                         </Link>
//                       </li>
//                       <li>
//                         <Link to="#">
//                           Jonita
//                           <ImageWithBasePath
//                             src="assets/img/profiles/avatar-01.jpg"
//                             alt
//                             className="img-fluid"
//                           />
//                         </Link>
//                       </li>
//                       <li>
//                         <Link to="#">
//                           Aaron
//                           <ImageWithBasePath
//                             src="assets/img/profiles/avatar-10.jpg"
//                             alt
//                             className="img-fluid"
//                           />
//                         </Link>
//                       </li>
//                     </ul>
//                   </div>
//                 </div>
//               </form>
//             </div>
//           </li>

//           <li className="nav-item nav-item-box">
//             <Link
//               to="#"
//               id="btnFullscreen"
//               onClick={() => toggleFullscreen()}
//               className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
//             >
//               <FeatherIcon icon="maximize" />
//             </Link>
//           </li>

          
//           <li className="nav-item nav-item-box">
//             <Link to="/email" onClick={handleEmailIconClick}>
//               <FeatherIcon icon="mail" />
//               {unreadEmailCount > 0 && (
//                 <span className="badge rounded-pill">{unreadEmailCount}</span>
//               )}
//             </Link>
//           </li>

//           {/* Notifications */}
//           <li className="nav-item dropdown nav-item-box">
//             <Link
//               to="#"
//               className="dropdown-toggle nav-link"
//               data-bs-toggle="dropdown"
//             >
//               <FeatherIcon icon="bell" />
//               <span className="badge rounded-pill">
//                 {notifications.filter(n => !n.is_read).length}
//               </span>
//             </Link>
//             <div className="dropdown-menu notifications">
//               <div className="topnav-dropdown-header">
//                 <span className="notification-title">Notifications</span>
//                 <Link to="#" className="clear-noti" onClick={(e) => {
//                   e.preventDefault();
//                   markAllAsRead();
//                 }}>
//                   Clear All
//                 </Link>
//               </div>
//               <div className="noti-content">
//                 <ul className="notification-list">
//                   {notifications.slice(0, 5).map((notif) => (
//                     <li 
//                       key={notif.id} 
//                       className={`notification-message ${!notif.is_read ? 'active' : ''}`}
//                     >
//                       <Link to="/email" onClick={() => handleNotificationClick(notif)}>
//                         <div className="media d-flex">
//                           <span className="avatar flex-shrink-0">
//                             <i className={`fas ${
//                               notif.type === 'stock_request' ? 'fa-box' :
//                               notif.type === 'stock_response' ? 'fa-reply' :
//                               'fa-envelope'
//                             }`} style={{ fontSize: '24px', padding: '8px' }} />
//                           </span>
//                           <div className="media-body flex-grow-1">
//                             <p className="noti-details">
//                               <span className="noti-title">{notif.title}</span>
//                               <br />
//                               {notif.message}
//                             </p>
//                             <p className="noti-time">
//                               <span className="notification-time">
//                                 {new Date(notif.created_at).toLocaleString()}
//                               </span>
//                             </p>
//                           </div>
//                         </div>
//                       </Link>
//                     </li>
//                   ))}
//                   {notifications.length === 0 && (
//                     <li className="notification-message">
//                       <div className="text-center py-3">
//                         <p className="text-muted">No notifications</p>
//                       </div>
//                     </li>
//                   )}
//                 </ul>
//               </div>
//               <div className="topnav-dropdown-footer">
//                 <Link to="/email">View all Notifications</Link>
//               </div>
//             </div>
//           </li>

//           {/* <li className="nav-item nav-item-box">
//             <Link to="/general-settings">
//               <FeatherIcon icon="settings" />
//             </Link>
//           </li> */}

//           <li className="nav-item dropdown has-arrow main-drop">
//             {user ? (
//               <>
//                 <Link
//                   to="#"
//                   className="dropdown-toggle nav-link userset"
//                   data-bs-toggle="dropdown"
//                 >
//                   <span className="user-info">
//                     <span className="user-letter">
//                       <ImageWithBasePath
//                         src={user.avatar || "assets/img/profiles/avator1.jpg"}
//                         alt="img"
//                         className="img-fluid"
//                       />
//                     </span>
//                     <span className="user-detail">
//                       <span className="user-name">{user.name}</span>
//                       <span className="user-role">{user.role}</span>
//                     </span>
//                   </span>
//                 </Link>
//                 <div className="dropdown-menu menu-drop-user">
//                   <div className="profilename">
//                     <div className="profileset">
//                       <span className="user-img">
//                         <ImageWithBasePath
//                           src={user.avatar || "assets/img/profiles/avator1.jpg"}
//                           alt="img"
//                         />
//                         <span className="status online" />
//                       </span>
//                       <div className="profilesets">
//                         <h6>{user.name}</h6>
//                         <h5>{user.role}</h5>
//                       </div>
//                     </div>
//                     <hr className="m-0" />
//                     <Link className="dropdown-item" to={route.profile}>
//                       <i className="me-2" data-feather="user" /> My Profile
//                     </Link>
//                     <Link className="dropdown-item" to={route.generalsettings}>
//                       <i className="me-2" data-feather="settings" />
//                       Settings
//                     </Link>
//                     <hr className="m-0" />
//                     <button
//                       className="dropdown-item logout pb-0"
//                       onClick={handleLogout}
//                       style={{ border: "none", background: "none" }}
//                     >
//                       <ImageWithBasePath
//                         src="assets/img/icons/log-out.svg"
//                         alt="img"
//                         className="me-2"
//                       />
//                       Logout
//                     </button>
//                   </div>
//                 </div>
//               </>
//             ) : (
//               <Link to={route.signin} className="nav-link">
//                 <FeatherIcon icon="log-in" className="me-1" /> Sign In
//               </Link>
//             )}
//           </li>
//         </ul>

//         <div className="dropdown mobile-user-menu">
//           <Link
//             to="#"
//             className="nav-link dropdown-toggle"
//             data-bs-toggle="dropdown"
//             aria-expanded="false"
//           >
//             <i className="fa fa-ellipsis-v" />
//           </Link>
//           <div className="dropdown-menu dropdown-menu-right">
//             {user ? (
//               <>
//                 <Link className="dropdown-item" to={route.profile}>
//                   My Profile
//                 </Link>
//                 <Link className="dropdown-item" to={route.generalsettings}>
//                   Settings
//                 </Link>
//                 <button
//                   className="dropdown-item"
//                   onClick={handleLogout}
//                   style={{ border: "none", background: "none" }}
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <Link className="dropdown-item" to={route.signin}>
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Header;


// /* eslint-disable no-unused-vars */
// import React, { useEffect, useState, useCallback, useRef } from "react";
// import { Link, useNavigate, useLocation } from "react-router-dom";
// import FeatherIcon from "feather-icons-react";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
// import { Search, XCircle } from "react-feather";
// import { all_routes } from "../../Router/all_routes";
// import { loginSuccess, logout } from "../../core/redux/slices/authSlice";
// import { useDispatch, useSelector } from "react-redux";
// import axios from "axios";

// // Import countries data
// const countries = [
//   { code: "en", name: "English", flag: "us.png" },
//   { code: "es", name: "Spanish", flag: "es.png" },
//   { code: "fr", name: "French", flag: "fr.png" },
//   { code: "de", name: "German", flag: "de.png" },
//   { code: "it", name: "Italian", flag: "it.png" },
//   { code: "pt", name: "Portuguese", flag: "pt.png" },
//   { code: "ru", name: "Russian", flag: "ru.png" },
//   { code: "zh", name: "Chinese", flag: "cn.png" },
//   { code: "ja", name: "Japanese", flag: "jp.png" },
//   { code: "ko", name: "Korean", flag: "kr.png" },
//   { code: "ar", name: "Arabic", flag: "sa.png" },
//   { code: "hi", name: "Hindi", flag: "in.png" },
// ];

// const Header = () => {
//   const route = all_routes;
//   const location = useLocation();
//   const [toggle, SetToggle] = useState(false);
//   const [isFullscreen, setIsFullscreen] = useState(false);
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { user, isAuthenticated } = useSelector((state) => state.auth);

//   // Warehouse state
//   const [warehouses, setWarehouses] = useState([]);
//   const [selectedWarehouse, setSelectedWarehouse] = useState(null);
//   const [loadingWarehouses, setLoadingWarehouses] = useState(false);

//   // Language state
//   const [selectedLanguage, setSelectedLanguage] = useState(
//     countries.find((c) => c.code === "en")
//   );

//   // Search state
//   const [searchQuery, setSearchQuery] = useState("");
//   const [searchResults, setSearchResults] = useState({
//     products: [],
//     customers: [],
//     recent: [],
//   });
//   const [isSearching, setIsSearching] = useState(false);
//   const [showSearchResults, setShowSearchResults] = useState(false);
//   const searchTimeoutRef = useRef(null);

//   // Fetch warehouses
//   const fetchWarehouses = useCallback(async () => {
//     setLoadingWarehouses(true);
//     try {
//       const token = localStorage.getItem("token") || sessionStorage.getItem("token");
//       const response = await axios.get("/api/warehouses", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       });

//       if (response.data.success) {
//         setWarehouses(response.data.data);
        
//         // Set first warehouse as default if none selected
//         if (!selectedWarehouse && response.data.data.length > 0) {
//           const defaultWarehouse = response.data.data[0];
//           setSelectedWarehouse(defaultWarehouse);
//           localStorage.setItem("selectedWarehouse", JSON.stringify(defaultWarehouse));
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching warehouses:", error);
//     } finally {
//       setLoadingWarehouses(false);
//     }
//   }, [selectedWarehouse]);

//   // Load saved warehouse from localStorage
//   useEffect(() => {
//     const savedWarehouse = localStorage.getItem("selectedWarehouse");
//     if (savedWarehouse) {
//       setSelectedWarehouse(JSON.parse(savedWarehouse));
//     }
//     fetchWarehouses();
//   }, []);

//   // Handle warehouse selection
//   const handleWarehouseChange = (warehouse) => {
//     setSelectedWarehouse(warehouse);
//     localStorage.setItem("selectedWarehouse", JSON.stringify(warehouse));
//     // You can dispatch this to Redux store if needed
//     // dispatch(setWarehouse(warehouse));
//   };

//   // Handle language selection
//   const handleLanguageChange = (language) => {
//     setSelectedLanguage(language);
//     localStorage.setItem("selectedLanguage", language.code);
//     // Implement i18n language change here
//     // i18n.changeLanguage(language.code);
//   };

//   // Load saved language
//   useEffect(() => {
//     const savedLanguage = localStorage.getItem("selectedLanguage");
//     if (savedLanguage) {
//       const lang = countries.find((c) => c.code === savedLanguage);
//       if (lang) setSelectedLanguage(lang);
//     }
//   }, []);

//   // Debounced search function
//   const performSearch = useCallback(async (query) => {
//     if (!query || query.trim().length < 2) {
//       setSearchResults({ products: [], customers: [], recent: [] });
//       setIsSearching(false);
//       return;
//     }

//     setIsSearching(true);
//     try {
//       const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      
//       // Search products, customers, etc.
//       const [productsRes, customersRes] = await Promise.all([
//         axios.get(`/api/products?searchTerm=${encodeURIComponent(query)}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }).catch(() => ({ data: { data: [] } })),
        
//         axios.get(`/api/customers?searchTerm=${encodeURIComponent(query)}`, {
//           headers: { Authorization: `Bearer ${token}` },
//         }).catch(() => ({ data: { data: [] } })),
//       ]);

//       setSearchResults({
//         products: productsRes.data.data || [],
//         customers: customersRes.data.data || [],
//         recent: [], // You can store recent searches in localStorage
//       });
//     } catch (error) {
//       console.error("Search error:", error);
//       setSearchResults({ products: [], customers: [], recent: [] });
//     } finally {
//       setIsSearching(false);
//     }
//   }, []);

//   // Handle search input with debounce
//   const handleSearchChange = (e) => {
//     const value = e.target.value;
//     setSearchQuery(value);
//     setShowSearchResults(true);

//     // Clear existing timeout
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }

//     // Set new timeout for debounced search
//     searchTimeoutRef.current = setTimeout(() => {
//       performSearch(value);
//     }, 500); // 500ms delay
//   };

//   // Clear search
//   const handleClearSearch = () => {
//     setSearchQuery("");
//     setSearchResults({ products: [], customers: [], recent: [] });
//     setShowSearchResults(false);
//     if (searchTimeoutRef.current) {
//       clearTimeout(searchTimeoutRef.current);
//     }
//   };

//   // Cleanup timeout on unmount
//   useEffect(() => {
//     return () => {
//       if (searchTimeoutRef.current) {
//         clearTimeout(searchTimeoutRef.current);
//       }
//     };
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     localStorage.removeItem("user");
//     sessionStorage.removeItem("token");
//     sessionStorage.removeItem("user");
//     dispatch(logout());
//     navigate("/signin");
//   };

//   const slideDownSubmenu = () => {
//     const subdropPlusUl = document.getElementsByClassName("subdrop");
//     for (let i = 0; i < subdropPlusUl.length; i++) {
//       const submenu = subdropPlusUl[i].nextElementSibling;
//       if (submenu && submenu.tagName.toLowerCase() === "ul") {
//         submenu.style.display = "block";
//       }
//     }
//   };

//   const slideUpSubmenu = () => {
//     const subdropPlusUl = document.getElementsByClassName("subdrop");
//     for (let i = 0; i < subdropPlusUl.length; i++) {
//       const submenu = subdropPlusUl[i].nextElementSibling;
//       if (submenu && submenu.tagName.toLowerCase() === "ul") {
//         submenu.style.display = "none";
//       }
//     }
//   };

//   useEffect(() => {
//     let expandTimeout = null;
//     const handleMouseover = (e) => {
//       const body = document.body;
//       const toggleBtn = document.getElementById("toggle_btn");

//       if (!body.classList.contains("mini-sidebar")) {
//         return;
//       }

//       if (!toggleBtn) {
//         return;
//       }

//       const toggleBtnStyle = window.getComputedStyle(toggleBtn);
//       if (
//         toggleBtnStyle.display === "none" ||
//         toggleBtnStyle.visibility === "hidden"
//       ) {
//         return;
//       }

//       const target = e.target.closest(
//         ".sidebar, .header-left, #sidebar, #collapsed-sidebar"
//       );

//       if (expandTimeout) {
//         clearTimeout(expandTimeout);
//         expandTimeout = null;
//       }

//       if (target) {
//         if (!body.classList.contains("expand-menu")) {
//           body.classList.add("expand-menu");
//           slideDownSubmenu();
//         }
//       } else {
//         if (body.classList.contains("expand-menu")) {
//           expandTimeout = setTimeout(() => {
//             body.classList.remove("expand-menu");
//             slideUpSubmenu();
//           }, 100);
//         }
//       }
//     };

//     document.addEventListener("mouseover", handleMouseover);
//     return () => {
//       document.removeEventListener("mouseover", handleMouseover);
//       if (expandTimeout) {
//         clearTimeout(expandTimeout);
//       }
//     };
//   }, []);

//   useEffect(() => {
//     const handleFullscreenChange = () => {
//       setIsFullscreen(
//         document.fullscreenElement ||
//           document.mozFullScreenElement ||
//           document.webkitFullscreenElement ||
//           document.msFullscreenElement
//       );
//     };

//     document.addEventListener("fullscreenchange", handleFullscreenChange);
//     document.addEventListener("mozfullscreenchange", handleFullscreenChange);
//     document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
//     document.addEventListener("msfullscreenchange", handleFullscreenChange);

//     return () => {
//       document.removeEventListener("fullscreenchange", handleFullscreenChange);
//       document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
//       document.removeEventListener("msfullscreenchange", handleFullscreenChange);
//     };
//   }, []);

//   const handlesidebar = () => {
//     const body = document.body;
//     const isMiniSidebar = body.classList.contains("mini-sidebar");
//     body.classList.toggle("mini-sidebar");
//     SetToggle((current) => !current);

//     if (isMiniSidebar) {
//       body.classList.remove("expand-menu");
//       slideUpSubmenu();
//     }
//   };

//   const sidebarOverlay = () => {
//     document?.querySelector(".main-wrapper")?.classList?.toggle("slide-nav");
//     document?.querySelector(".sidebar-overlay")?.classList?.toggle("opened");
//     document?.querySelector("html")?.classList?.toggle("menu-opened");
//   };

//   const pathname = location.pathname;
//   const exclusionArray = [
//     "/reactjs/template/dream-pos/index-three",
//     "/reactjs/template/dream-pos/index-one",
//   ];

//   if (exclusionArray.indexOf(window.location.pathname) >= 0) {
//     return "";
//   }

//   const toggleFullscreen = (elem) => {
//     elem = elem || document.documentElement;
//     if (
//       !document.fullscreenElement &&
//       !document.mozFullScreenElement &&
//       !document.webkitFullscreenElement &&
//       !document.msFullscreenElement
//     ) {
//       if (elem.requestFullscreen) {
//         elem.requestFullscreen();
//       } else if (elem.msRequestFullscreen) {
//         elem.msRequestFullscreen();
//       } else if (elem.mozRequestFullScreen) {
//         elem.mozRequestFullScreen();
//       } else if (elem.webkitRequestFullscreen) {
//         elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
//       }
//     } else {
//       if (document.exitFullscreen) {
//         document.exitFullscreen();
//       } else if (document.msExitFullscreen) {
//         document.msExitFullscreen();
//       } else if (document.mozCancelFullScreen) {
//         document.mozCancelFullScreen();
//       } else if (document.webkitExitFullscreen) {
//         document.webkitExitFullscreen();
//       }
//     }
//   };

//   return (
//     <>
//       <div className="header">
//         <div className="header-left active">
//           <Link to={route.dashboard} className="logo logo-normal">
//             <ImageWithBasePath src="assets/img/logo.png" alt="" />
//           </Link>
//           <Link to={route.dashboard} className="logo logo-white">
//             <ImageWithBasePath src="assets/img/logo-white.png" alt="" />
//           </Link>
//           <Link to={route.dashboard} className="logo-small">
//             <ImageWithBasePath src="assets/img/logo-small.png" alt="" />
//           </Link>
//           <Link
//             id="toggle_btn"
//             to="#"
//             style={{
//               display: pathname.includes("tasks")
//                 ? "none"
//                 : pathname.includes("compose")
//                 ? "none"
//                 : "",
//             }}
//             onClick={handlesidebar}
//           >
//             <FeatherIcon icon="chevrons-left" className="feather-16" />
//           </Link>
//         </div>

//         <Link
//           id="mobile_btn"
//           className="mobile_btn"
//           to="#sidebar"
//           onClick={sidebarOverlay}
//         >
//           <span className="bar-icon">
//             <span />
//             <span />
//             <span />
//           </span>
//         </Link>

//         <ul className="nav user-menu">
//           {/* Dynamic Search */}
//           <li className="nav-item nav-searchinputs">
//             <div className="top-nav-search">
//               <Link to="#" className="responsive-search">
//                 <Search />
//               </Link>
//               <form>
//                 <div className="searchinputs">
//                   <input
//                     type="text"
//                     placeholder="Search products, customers..."
//                     value={searchQuery}
//                     onChange={handleSearchChange}
//                     onFocus={() => setShowSearchResults(true)}
//                   />
//                   <div className="search-addon">
//                     {searchQuery && (
//                       <span onClick={handleClearSearch} style={{ cursor: "pointer" }}>
//                         <XCircle className="feather-14" />
//                       </span>
//                     )}
//                   </div>
//                 </div>
//                 <Link className="btn" id="searchdiv">
//                   <Search className="feather-16" />
//                 </Link>
//               </form>
              
//               {/* Search Results Dropdown */}
//               {showSearchResults && searchQuery && (
//                 <div 
//                   className="search-dropdown"
//                   style={{
//                     position: "absolute",
//                     top: "100%",
//                     left: 0,
//                     right: 0,
//                     backgroundColor: "white",
//                     border: "1px solid #ddd",
//                     borderRadius: "4px",
//                     maxHeight: "400px",
//                     overflowY: "auto",
//                     zIndex: 1000,
//                     marginTop: "5px",
//                     boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
//                   }}
//                 >
//                   {isSearching ? (
//                     <div style={{ padding: "20px", textAlign: "center" }}>
//                       <span>Searching...</span>
//                     </div>
//                   ) : (
//                     <>
//                       {searchResults.products.length > 0 && (
//                         <div style={{ padding: "10px" }}>
//                           <h6 style={{ marginBottom: "10px", fontWeight: "600" }}>Products</h6>
//                           {searchResults.products.slice(0, 5).map((product) => (
//                             <Link
//                               key={product.id}
//                               to={`/products/${product.id}`}
//                               style={{
//                                 display: "block",
//                                 padding: "8px",
//                                 borderBottom: "1px solid #f0f0f0",
//                                 color: "#333",
//                                 textDecoration: "none"
//                               }}
//                               onClick={() => setShowSearchResults(false)}
//                             >
//                               {product.name || product.title}
//                             </Link>
//                           ))}
//                         </div>
//                       )}

//                       {searchResults.customers.length > 0 && (
//                         <div style={{ padding: "10px" }}>
//                           <h6 style={{ marginBottom: "10px", fontWeight: "600" }}>Customers</h6>
//                           {searchResults.customers.slice(0, 5).map((customer) => (
//                             <Link
//                               key={customer.id}
//                               to={`/customers/${customer.id}`}
//                               style={{
//                                 display: "block",
//                                 padding: "8px",
//                                 borderBottom: "1px solid #f0f0f0",
//                                 color: "#333",
//                                 textDecoration: "none"
//                               }}
//                               onClick={() => setShowSearchResults(false)}
//                             >
//                               {customer.name}
//                             </Link>
//                           ))}
//                         </div>
//                       )}

//                       {searchResults.products.length === 0 && 
//                        searchResults.customers.length === 0 && (
//                         <div style={{ padding: "20px", textAlign: "center", color: "#999" }}>
//                           No results found for "{searchQuery}"
//                         </div>
//                       )}
//                     </>
//                   )}
//                 </div>
//               )}
//             </div>
//           </li>

//           {/* Dynamic Warehouse Select */}
//           <li className="nav-item dropdown has-arrow main-drop select-store-dropdown">
//             <Link
//               to="#"
//               className="dropdown-toggle nav-link select-store"
//               data-bs-toggle="dropdown"
//             >
//               <span className="user-info">
//                 <span className="user-letter">
//                   <ImageWithBasePath
//                     src="assets/img/store/store-01.png"
//                     alt="Store Logo"
//                     className="img-fluid"
//                   />
//                 </span>
//                 <span className="user-detail">
//                   <span className="user-name">
//                     {selectedWarehouse ? selectedWarehouse.name : "Select Warehouse"}
//                   </span>
//                 </span>
//               </span>
//             </Link>
//             <div className="dropdown-menu dropdown-menu-right">
//               {loadingWarehouses ? (
//                 <Link to="#" className="dropdown-item">
//                   Loading...
//                 </Link>
//               ) : warehouses.length > 0 ? (
//                 warehouses.map((warehouse) => (
//                   <Link
//                     key={warehouse.id}
//                     to="#"
//                     className="dropdown-item"
//                     onClick={() => handleWarehouseChange(warehouse)}
//                   >
//                     <ImageWithBasePath
//                       src="assets/img/store/store-01.png"
//                       alt=""
//                       className="img-fluid"
//                     />
//                     {warehouse.name}
//                   </Link>
//                 ))
//               ) : (
//                 <Link to="#" className="dropdown-item">
//                   No warehouses available
//                 </Link>
//               )}
//             </div>
//           </li>

//           {/* Dynamic Language/Country Select */}
//           <li className="nav-item dropdown has-arrow flag-nav nav-item-box">
//             <Link
//               className="nav-link dropdown-toggle"
//               data-bs-toggle="dropdown"
//               to="#"
//               role="button"
//             >
//               <ImageWithBasePath
//                 src={`assets/img/flags/${selectedLanguage.flag}`}
//                 alt="Language"
//                 height={16}
//               />
//             </Link>
//             <div className="dropdown-menu dropdown-menu-right">
//               {countries.map((country) => (
//                 <Link
//                   key={country.code}
//                   to="#"
//                   className="dropdown-item"
//                   onClick={() => handleLanguageChange(country)}
//                 >
//                   <ImageWithBasePath
//                     src={`assets/img/flags/${country.flag}`}
//                     alt={country.name}
//                     height={16}
//                   />
//                   {country.name}
//                 </Link>
//               ))}
//             </div>
//           </li>

//           {/* Fullscreen */}
//           <li className="nav-item nav-item-box">
//             <Link
//               to="#"
//               id="btnFullscreen"
//               onClick={() => toggleFullscreen()}
//               className={isFullscreen ? "Exit Fullscreen" : "Go Fullscreen"}
//             >
//               <FeatherIcon icon={isFullscreen ? "minimize" : "maximize"} />
//             </Link>
//           </li>

//           {/* Notifications */}
//           <li className="nav-item dropdown nav-item-box">
//             <Link
//               to="#"
//               className="dropdown-toggle nav-link"
//               data-bs-toggle="dropdown"
//             >
//               <FeatherIcon icon="bell" />
//               <span className="badge rounded-pill">2</span>
//             </Link>
//             <div className="dropdown-menu notifications">
//               <div className="topnav-dropdown-header">
//                 <span className="notification-title">Notifications</span>
//                 <Link to="#" className="clear-noti">
//                   Clear All
//                 </Link>
//               </div>
//               <div className="noti-content">
//                 <ul className="notification-list">
//                   <li className="notification-message">
//                     <Link to={route.activities}>
//                       <div className="media d-flex">
//                         <span className="avatar flex-shrink-0">
//                           <ImageWithBasePath
//                             alt=""
//                             src="assets/img/profiles/avatar-02.jpg"
//                           />
//                         </span>
//                         <div className="media-body flex-grow-1">
//                           <p className="noti-details">
//                             <span className="noti-title">John Doe</span> added
//                             new task
//                             <span className="noti-title">
//                               Patient appointment booking
//                             </span>
//                           </p>
//                           <p className="noti-time">
//                             <span className="notification-time">4 mins ago</span>
//                           </p>
//                         </div>
//                       </div>
//                     </Link>
//                   </li>
//                 </ul>
//               </div>
//               <div className="topnav-dropdown-footer">
//                 <Link to={route.activities}>View all Notifications</Link>
//               </div>
//             </div>
//           </li>

//           {/* User Profile */}
//           <li className="nav-item dropdown has-arrow main-drop">
//             <Link
//               to="#"
//               className="dropdown-toggle nav-link userset"
//               data-bs-toggle="dropdown"
//             >
//               <span className="user-info">
//                 <span className="user-letter">
//                   <ImageWithBasePath
//                     src="assets/img/profiles/avator1.jpg"
//                     alt=""
//                     className="img-fluid"
//                   />
//                 </span>
//                 <span className="user-detail">
//                   <span className="user-name">{user?.name || "Guest"}</span>
//                   <span className="user-role">{user?.role || "User"}</span>
//                 </span>
//               </span>
//             </Link>
//             <div className="dropdown-menu menu-drop-user">
//               <div className="profilename">
//                 <div className="profileset">
//                   <span className="user-img">
//                     <ImageWithBasePath
//                       src="assets/img/profiles/avator1.jpg"
//                       alt=""
//                     />
//                     <span className="status online" />
//                   </span>
//                   <div className="profilesets">
//                     <h6>{user?.name || "Guest"}</h6>
//                     <h5>{user?.role || "User"}</h5>
//                   </div>
//                 </div>
//                 <hr className="m-0" />
//                 <Link className="dropdown-item" to={route.profile}>
//                   <FeatherIcon icon="user" className="me-2" />
//                   My Profile
//                 </Link>
//                 <Link className="dropdown-item" to={route.generalsettings}>
//                   <FeatherIcon icon="settings" className="me-2" />
//                   Settings
//                 </Link>
//                 <hr className="m-0" />
//                 <Link
//                   className="dropdown-item logout pb-0"
//                   to="#"
//                   onClick={handleLogout}
//                 >
//                   <ImageWithBasePath
//                     src="assets/img/icons/log-out.svg"
//                     className="me-2"
//                     alt="img"
//                   />
//                   Logout
//                 </Link>
//               </div>
//             </div>
//           </li>
//         </ul>

//         {/* Mobile Menu */}
//         <div className="dropdown mobile-user-menu">
//           <Link
//             to="#"
//             className="nav-link dropdown-toggle"
//             data-bs-toggle="dropdown"
//             aria-expanded="false"
//           >
//             <i className="fa fa-ellipsis-v" />
//           </Link>
//           <div className="dropdown-menu dropdown-menu-right">
//             <Link className="dropdown-item" to={route.profile}>
//               My Profile
//             </Link>
//             <Link className="dropdown-item" to={route.generalsettings}>
//               Settings
//             </Link>
//             <Link className="dropdown-item" to="#" onClick={handleLogout}>
//               Logout
//             </Link>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Header;