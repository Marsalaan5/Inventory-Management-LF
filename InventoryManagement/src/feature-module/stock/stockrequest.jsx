

// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   PlusCircle, Eye, CheckCircle, Clock, AlertCircle,
//   Send, Inbox, Filter, Package, Truck,
//   Search as SearchIcon, ThumbsUp,
// } from "feather-icons-react/build/IconComponents";
// import { useDispatch, useSelector } from "react-redux";
// import Table from "../../core/pagination/datatable";
// import {
//   fetchStockRequestStats,
//   selectReqStats,
//   fetchSentRequests,
//   // fetchInboxRequests,
//   setReqFilters,
//   resetReqFilters,
//   selectReqFilters,
// } from "../../core/redux/slices/stockSlice";
// import AuthService from "../../services/authService";

// // ─────────────────────────────────────────────────────────────
// //  Constants
// // ─────────────────────────────────────────────────────────────

// const PRIORITY_CFG = {
//   urgent:   { color: "#dc3545", badge: "badge-linedanger",  label: "Urgent"   },
//   standard: { color: "#fd7e14", badge: "badge-linewarning", label: "Standard" },
//   low:      { color: "#198754", badge: "badge-linesuccess", label: "Low"      },
// };

// const STATUS_CFG = {
//   "Pending for Approval":           { badge: "badge-linewarning", icon: <Clock size={12} /> },
//   "Followed Up for Approval":       { badge: "badge-lineinfo",    icon: <Clock size={12} /> },
//   "Escalated Due to No Approval":   { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
//   "Awaiting Shipment":              { badge: "badge-lineinfo",    icon: <Truck size={12} /> },
//   "Scheduled":                      { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
//   "Shipping Deadline Approaching":  { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
//   "Delivered":                      { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
//   "Resolution required":            { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
// };

// const fmtDate = (dt) =>
//   dt
//     ? new Date(dt).toLocaleDateString(undefined, {
//         year: "numeric", month: "short", day: "numeric",
//         hour: "2-digit", minute: "2-digit",
//       })
//     : "—";

// const getPriorityCfg = (key) =>
//   PRIORITY_CFG[(key || "").toLowerCase()] ||
//   { color: "#6c757d", badge: "badge-secondary", label: key || "—" };

// // ─────────────────────────────────────────────────────────────
// //  Main page
// // ─────────────────────────────────────────────────────────────

// const StockRequest = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const reduxStats   = useSelector(selectReqStats);
//   const filters      = useSelector(selectReqFilters);
//   const sentBucket   = useSelector((s) => s.stock.req.sent);
//   // const inboxBucket  = useSelector((s) => s.stock.req.inbox);

//   const [view,           setView]           = useState("sent");
//   const [isFilterVisible, setIsFilterVisible] = useState(false);

//   const activeBucket = sentBucket;
//   const requests     = activeBucket.items      || [];
//   const loading      = activeBucket.loading;
//   const pagination   = activeBucket.pagination || { currentPage: 1, totalPages: 1, total: 0 };

//   // ── Fetch ──────────────────────────────────────────────────

//   const doFetch = useCallback(() => {
//     const params = {
//       page_no:   filters.page,
//       limit:     filters.limit,
//       priority:  filters.priority || undefined,
//       status:    filters.status   || undefined,
//       search:    filters.search   || undefined,
//     };
//     if (view === "sent") dispatch(fetchSentRequests(params));
//     // else                 dispatch(fetchInboxRequests(params));
//   }, [dispatch, view, filters]); // eslint-disable-line

//   // Re-fetch on filter/page/view changes
//   useEffect(() => {
//     doFetch();
//   }, [view, filters.page, filters.limit, filters.priority, filters.status]); // eslint-disable-line

//   // Debounced search
//   useEffect(() => {
//     const t = setTimeout(() => doFetch(), 500);
//     return () => clearTimeout(t);
//   }, [filters.search]); // eslint-disable-line

//   // Stats on mount
//   useEffect(() => {
//     dispatch(fetchStockRequestStats());
//   }, [dispatch]);

//   // ── Handlers ───────────────────────────────────────────────

//   const handlePaginationChange = ({ page, limit }) =>
//     dispatch(setReqFilters({ page, limit }));

//   const handleStarToggle = async (e, req) => {
//     e.stopPropagation();
//     const next = !req.is_starred;
//     try {
//       await AuthService.toggleStockRequestStar(req.req_id, next);
//       doFetch(); // re-fetch to reflect updated star
//     } catch (err) {
//       console.error("Star toggle failed:", err);
//     }
//   };

//   // ── Columns ────────────────────────────────────────────────

//   const columns = [
//     {
//       title: "",
//       render: (_, record) => (
//         <span style={{ cursor: "pointer" }} onClick={(e) => handleStarToggle(e, record)}>
//           <i className={`${record.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
//         </span>
//       ),
//     },
//     {
//       title: "",
//       render: (_, record) => {
//         const priCfg = getPriorityCfg(record.priority);
//         return (
//           <div style={{
//             width: 4, height: 38,
//             background: priCfg.color,
//             borderRadius: 2,
//             margin: "0 auto",
//           }} />
//         );
//       },
//     },
//     {
//       title: "Request ID",
//       dataIndex: "req_id",
//       render: (text, record) => (
//         <Link
//           to={`/stock-request-details/${record.req_id}`}
//           className="badge badge-primary text-decoration-none"
//           style={{ fontFamily: "monospace" }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {text}
//         </Link>
//       ),
//     },
//     {
//       title: "From (Recipient)",
//       dataIndex: "recipient_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center gap-1">
//           <Send size={14} className="text-danger flex-shrink-0" />
//           <div>
//             <div className="small fw-semibold">{text || record.requester_name || "—"}</div>
//             <div className="text-muted" style={{ fontSize: 11 }}>{record.destination || "—"}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "To (Supplier)",
//       dataIndex: "supplier_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center gap-1">
//           <Inbox size={14} className="text-success flex-shrink-0" />
//           <div>
//             <div className="small fw-semibold">{text || record.dispatcher_name || "—"}</div>
//             <div className="text-muted" style={{ fontSize: 11 }}>{record.source || "—"}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Articles",
//       render: (_, record) => (
//         <>
//           <div className="d-flex align-items-center gap-1">
//             <Package size={14} className="text-primary" />
//             <span className="badge badge-info">
//               {record.total_articles} item{record.total_articles !== 1 ? "s" : ""}
//             </span>
//           </div>
//           <div className="text-muted" style={{ fontSize: 11 }}>Qty: {record.total_quantity}</div>
//         </>
//       ),
//     },
//     {
//       title: "Priority",
//       dataIndex: "priority",
//       render: (val) => {
//         const cfg = getPriorityCfg(val);
//         return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
//       },
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       render: (val, record) => {
//         const cfg = STATUS_CFG[val] || { badge: "badge-secondary", icon: null };
//         return (
//           <>
//             <span className={`badge ${cfg.badge} d-inline-flex align-items-center gap-1`}>
//               {cfg.icon}{val || "Awaiting Shipment"}
//             </span>
//             {record.action && (
//               <div className="text-muted mt-1" style={{ fontSize: 11 }}>{record.action}</div>
//             )}
//           </>
//         );
//       },
//     },
//     {
//       title: "Created",
//       dataIndex: "created_at",
//       render: (text) => (
//         <span className="small text-muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(text)}</span>
//       ),
//     },
//     {
//       title: "Action",
//       render: (_, record) => (
//         <div className="d-flex" onClick={(e) => e.stopPropagation()}>
//           <div className="edit-delete-action">
//             <Link
//               className="me-2 p-2"
//               to={`/stock-request-details/${record.req_id}`}
//               title="View Details"
//             >
//               <Eye size={16} className="text-info" />
//             </Link>
//           </div>
//           <div className="edit-delete-action">
//             <Link
//               className="me-2 p-2"
//               to="/add-stock-flow"
//               title="Add Stock"
//             >
//               <PlusCircle size={16} className="text-success" />
//             </Link>
//           </div>
//         </div>
//       ),
//     },
//   ];

//   // ── Stat cards ─────────────────────────────────────────────

//   const statCards = [
//     { label: "Total Requests", value: reduxStats.total    || 0, cls: "das5", icon: <Package /> },
//     { label: "Pending",        value: reduxStats.pending  || 0, cls: "das6", icon: <Clock /> },
//     { label: "Approved",       value: reduxStats.approved || 0, cls: "das7", icon: <ThumbsUp /> },
//     { label: "Delivered",      value: reduxStats.received || 0, cls: "das8", icon: <CheckCircle /> },
//   ];

//   // ─────────────────────────────────────────────────────────────
//   //  Render
//   // ─────────────────────────────────────────────────────────────

//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* ── Page header ── */}
//         <div className="page-header mb-3">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Stock Requests</h4>
//               <h6>Manage stock requests between warehouses</h6>
//             </div>
//           </div>
//           <div className="page-btn">
//             <button
//               className="btn btn-added"
//               onClick={() => navigate("/add-new-stock-request")}
//             >
//               <PlusCircle size={16} className="me-2" />
//               New Stock Request
//             </button>
//           </div>
//         </div>

//         {/* ── Stat cards ── */}
//         <div className="row">
//           {statCards.map(({ label, value, cls, icon }) => (
//             <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
//               <div className={`dash-count ${cls} w-100`}>
//                 <div className="dash-counts">
//                   <h4>{value}</h4>
//                   <h5>{label}</h5>
//                 </div>
//                 <div className="dash-imgs">{icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ── Main card ── */}
//         <div className="card table-list-card">
//           <div className="card-body">

//             {/* ── Table top bar ── */}
//             <div className="table-top">
//               <div className="search-set">
//                 <div className="search-input">
//                   <input
//                     type="text"
//                     placeholder="Search requests…"
//                     className="form-control form-control-sm formsearch"
//                     value={filters.search}
//                     onChange={(e) =>
//                       dispatch(setReqFilters({ search: e.target.value, page: 1 }))
//                     }
//                   />
//                   <Link to="#" className="btn btn-searchset">
//                     <SearchIcon size={14} />
//                   </Link>
//                 </div>

//                 {/* View tabs */}
//                 <div className="d-flex gap-2 ms-3">
//                   {[
//                     { key: "sent",  icon: <Send size={13} />,        label: "My Requests" },
//                     // { key: "inbox", icon: <Inbox size={13} />,       label: "Inbox"       },
//                   ].map(({ key, icon, label }) => (
//                     <button
//                       key={key}
//                       className={`btn btn-sm ${view === key ? "btn-primary" : "btn-outline-secondary"}`}
//                       onClick={() => { setView(key); dispatch(setReqFilters({ page: 1 })); }}
//                     >
//                       {icon}
//                       <span className="ms-1">{label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               <div className="search-path">
//                 <button
//                   className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
//                   onClick={() => setIsFilterVisible((p) => !p)}
//                 >
//                   <Filter size={16} className="filter-icon" />
//                 </button>
//               </div>
//             </div>

//             {/* ── Filter panel ── */}
//             {isFilterVisible && (
//               <div className="card mb-0">
//                 <div className="card-body pb-0">
//                   <div className="row">
//                     <div className="col-lg-3 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>Priority</label>
//                         <select
//                           className="form-select form-select-sm"
//                           value={filters.priority}
//                           onChange={(e) =>
//                             dispatch(setReqFilters({ priority: e.target.value, page: 1 }))
//                           }
//                         >
//                           <option value="">All Priorities</option>
//                           {Object.entries(PRIORITY_CFG).map(([k, v]) => (
//                             <option key={k} value={k}>{v.label}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>

//                     <div className="col-lg-3 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>Status</label>
//                         <select
//                           className="form-select form-select-sm"
//                           value={filters.status}
//                           onChange={(e) =>
//                             dispatch(setReqFilters({ status: e.target.value, page: 1 }))
//                           }
//                         >
//                           <option value="">All Statuses</option>
//                           <option value="pending">Pending</option>
//                           <option value="approved">Approved</option>
//                           <option value="linked">Linked to StockFlow</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="col-lg-2 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>&nbsp;</label>
//                         <button
//                           className="btn btn-filters w-100"
//                           onClick={() => dispatch(resetReqFilters())}
//                         >
//                           Reset Filters
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ── Table ── */}
//             <div className="table-responsive">
//               {loading ? (
//                 <div className="text-center p-5">
//                   <div className="spinner-border text-primary" />
//                 </div>
//               ) : requests.length === 0 ? (
//                 <div className="text-center p-5">
//                   <Inbox size={32} className="text-muted mb-2 d-block mx-auto" />
//                   <p className="text-muted">No stock requests found</p>
//                 </div>
//               ) : (
//                 <Table
//                   key={`${view}-${filters.page}-${filters.limit}`}
//                   columns={columns}
//                   dataSource={requests}
//                   pagination={{
//                     total:      pagination.total,
//                     page:       pagination.currentPage,
//                     limit:      filters.limit,
//                     totalPages: pagination.totalPages,
//                   }}
//                   filters={filters}
//                   onPaginationChange={handlePaginationChange}
//                 />
//               )}
//             </div>

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default StockRequest;




// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   PlusCircle, Eye, CheckCircle, Clock, AlertCircle,
//   Send, Inbox, Filter, Package, Truck,
//   Search as SearchIcon, ThumbsUp,
// } from "feather-icons-react/build/IconComponents";
// import { useDispatch, useSelector } from "react-redux";
// import Table from "../../core/pagination/datatable";
// import {
//   fetchStockRequestStats,
//   selectReqStats,
//   fetchSentRequests,
//   setReqFilters,
//   resetReqFilters,
//   selectReqFilters,
//   setFlowSourceRequest,          // ← was missing
// } from "../../core/redux/slices/stockSlice";
// import AuthService from "../../services/authService";

// // ─────────────────────────────────────────────────────────────
// //  Constants
// // ─────────────────────────────────────────────────────────────

// const PRIORITY_CFG = {
//   urgent:   { color: "#dc3545", badge: "badge-linedanger",  label: "Urgent"   },
//   standard: { color: "#fd7e14", badge: "badge-linewarning", label: "Standard" },
//   low:      { color: "#198754", badge: "badge-linesuccess", label: "Low"      },
// };

// const STATUS_CFG = {
//   "Pending for Approval":           { badge: "badge-linewarning", icon: <Clock size={12} /> },
//   "Followed Up for Approval":       { badge: "badge-lineinfo",    icon: <Clock size={12} /> },
//   "Escalated Due to No Approval":   { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
//   "Awaiting Shipment":              { badge: "badge-lineinfo",    icon: <Truck size={12} /> },
//   "Scheduled":                      { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
//   "Shipping Deadline Approaching":  { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
//   "Delivered":                      { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
//   "Resolution required":            { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
// };

// const fmtDate = (dt) =>
//   dt
//     ? new Date(dt).toLocaleDateString(undefined, {
//         year: "numeric", month: "short", day: "numeric",
//         hour: "2-digit", minute: "2-digit",
//       })
//     : "—";

// const getPriorityCfg = (key) =>
//   PRIORITY_CFG[(key || "").toLowerCase()] ||
//   { color: "#6c757d", badge: "badge-secondary", label: key || "—" };

// // ─────────────────────────────────────────────────────────────
// //  Main page
// // ─────────────────────────────────────────────────────────────

// const StockRequest = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();

//   const reduxStats  = useSelector(selectReqStats);
//   const filters     = useSelector(selectReqFilters);
//   const sentBucket  = useSelector((s) => s.stock.req.sent);

//   const [view,            setView]            = useState("sent");
//   const [isFilterVisible, setIsFilterVisible] = useState(false);

//   const activeBucket = sentBucket;
//   const requests     = activeBucket.items      || [];
//   const loading      = activeBucket.loading;
//   const pagination   = activeBucket.pagination || { currentPage: 1, totalPages: 1, total: 0 };

//   // ── Fetch ──────────────────────────────────────────────────

//   const doFetch = useCallback(() => {
//     const params = {
//       page_no:  filters.page,
//       limit:    filters.limit,
//       priority: filters.priority || undefined,
//       status:   filters.status   || undefined,
//       search:   filters.search   || undefined,
//     };
//     if (view === "sent") dispatch(fetchSentRequests(params));
//   }, [dispatch, view, filters]); // eslint-disable-line

//   useEffect(() => {
//     doFetch();
//   }, [view, filters.page, filters.limit, filters.priority, filters.status]); // eslint-disable-line

//   useEffect(() => {
//     const t = setTimeout(() => doFetch(), 500);
//     return () => clearTimeout(t);
//   }, [filters.search]); // eslint-disable-line

//   useEffect(() => {
//     dispatch(fetchStockRequestStats());
//   }, [dispatch]);

//   // ── Navigate to AddStockFlow with pre-selected request ─────

//   const handleCreateFlowFromRequest = (record) => {
//     dispatch(setFlowSourceRequest({
//       value: record.req_id,
//       label: `#${record.req_id}${record.description ? " — " + record.description : ""}`,
//       raw:   record,
//     }));
//     navigate("/add-stock-flow");
//   };

//   // ── Handlers ───────────────────────────────────────────────

//   const handlePaginationChange = ({ page, limit }) =>
//     dispatch(setReqFilters({ page, limit }));

//   const handleStarToggle = async (e, req) => {
//     e.stopPropagation();
//     const next = !req.is_starred;
//     try {
//       await AuthService.toggleStockRequestStar(req.req_id, next);
//       doFetch();
//     } catch (err) {
//       console.error("Star toggle failed:", err);
//     }
//   };

//   // ── Columns ────────────────────────────────────────────────

//   const columns = [
//     {
//       title: "",
//       render: (_, record) => (
//         <span style={{ cursor: "pointer" }} onClick={(e) => handleStarToggle(e, record)}>
//           <i className={`${record.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
//         </span>
//       ),
//     },
//     {
//       title: "",
//       render: (_, record) => {
//         const priCfg = getPriorityCfg(record.priority);
//         return (
//           <div style={{
//             width: 4, height: 38,
//             background: priCfg.color,
//             borderRadius: 2,
//             margin: "0 auto",
//           }} />
//         );
//       },
//     },
//     {
//       title: "Request ID",
//       dataIndex: "req_id",
//       render: (text, record) => (
//         <Link
//           to={`/stock-request-details/${record.req_id}`}
//           className="badge badge-primary text-decoration-none"
//           style={{ fontFamily: "monospace" }}
//           onClick={(e) => e.stopPropagation()}
//         >
//           {text}
//         </Link>
//       ),
//     },
//     {
//       title: "From (Recipient)",
//       dataIndex: "recipient_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center gap-1">
//           <Send size={14} className="text-danger flex-shrink-0" />
//           <div>
//             <div className="small fw-semibold">{text || record.requester_name || "—"}</div>
//             <div className="text-muted" style={{ fontSize: 11 }}>{record.destination || "—"}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "To (Supplier)",
//       dataIndex: "supplier_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center gap-1">
//           <Inbox size={14} className="text-success flex-shrink-0" />
//           <div>
//             <div className="small fw-semibold">{text || record.dispatcher_name || "—"}</div>
//             <div className="text-muted" style={{ fontSize: 11 }}>{record.source || "—"}</div>
//           </div>
//         </div>
//       ),
//     },
//     {
//       title: "Articles",
//       render: (_, record) => (
//         <>
//           <div className="d-flex align-items-center gap-1">
//             <Package size={14} className="text-primary" />
//             <span className="badge badge-info">
//               {record.total_articles} item{record.total_articles !== 1 ? "s" : ""}
//             </span>
//           </div>
//           <div className="text-muted" style={{ fontSize: 11 }}>Qty: {record.total_quantity}</div>
//         </>
//       ),
//     },
//     {
//       title: "Priority",
//       dataIndex: "priority",
//       render: (val) => {
//         const cfg = getPriorityCfg(val);
//         return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
//       },
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       render: (val, record) => {
//         const cfg = STATUS_CFG[val] || { badge: "badge-secondary", icon: null };
//         return (
//           <>
//             <span className={`badge ${cfg.badge} d-inline-flex align-items-center gap-1`}>
//               {cfg.icon}{val || "Awaiting Shipment"}
//             </span>
//             {record.action && (
//               <div className="text-muted mt-1" style={{ fontSize: 11 }}>{record.action}</div>
//             )}
//           </>
//         );
//       },
//     },
//     {
//       title: "Created",
//       dataIndex: "created_at",
//       render: (text) => (
//         <span className="small text-muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(text)}</span>
//       ),
//     },
//     // {
//     //   title: "Action",
//     //   render: (_, record) => (
//     //     <div className="d-flex" onClick={(e) => e.stopPropagation()}>
//     //       <div className="edit-delete-action">
//     //         <Link
//     //           className="me-2 p-2"
//     //           to={`/stock-request-details/${record.req_id}`}
//     //           title="View Details"
//     //         >
//     //           <Eye size={16} className="text-info" />
//     //         </Link>
//     //       </div>
//     //       <div className="edit-delete-action">
//     //         {/* Navigate to AddStockFlow with this request pre-selected */}
//     //         <button
//     //           type="button"
//     //           className="btn btn-link p-2 me-1"
//     //           title="Create Stock Flow for this Request"
//     //           onClick={() => handleCreateFlowFromRequest(record)}
//     //         >
//     //           <PlusCircle size={16} className="text-success" />
//     //         </button>
//     //       </div>
//     //     </div>
//     //   ),
//     // },

//     {
//   title: "Action",
//   render: (_, record) => {
//     const isApproved = record.is_approved === true;
//     const isSupplier = record.is_supplier === true;

//     return (
//       <div className="d-flex" onClick={(e) => e.stopPropagation()}>

//         <div className="edit-delete-action">
//           <Link
//             className="me-2 p-2"
//             to={`/stock-request-details/${record.req_id}`}
//             title="View Details"
//           >
//             <Eye size={16} className="text-info" />
//           </Link>
//         </div>

      
//         {isApproved  && isSupplier && (
//           <div className="edit-delete-action">
//             <button
//               type="button"
//               className="btn btn-link p-2 me-1"
//               title="Add Stock"
//               onClick={() => handleCreateFlowFromRequest(record)}
//             >
//               <PlusCircle size={16} className="text-success" />
//             </button>
//           </div>
//         )}

//       </div>
//     );
//   },
// }

//   ];

//   // ── Stat cards ─────────────────────────────────────────────

//   const statCards = [
//     { label: "Total Requests", value: reduxStats.total    || 0, cls: "das5", icon: <Package /> },
//     { label: "Pending",        value: reduxStats.pending  || 0, cls: "das6", icon: <Clock /> },
//     { label: "Approved",       value: reduxStats.approved || 0, cls: "das7", icon: <ThumbsUp /> },
//     { label: "Delivered",      value: reduxStats.received || 0, cls: "das8", icon: <CheckCircle /> },
//   ];

//   // ─────────────────────────────────────────────────────────────
//   //  Render
//   // ─────────────────────────────────────────────────────────────

//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         <div className="page-header mb-3">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Stock Requests</h4>
//               <h6>Manage stock requests between warehouses</h6>
//             </div>
//           </div>
//           <div className="page-btn">
//             <button
//               className="btn btn-added"
//               onClick={() => navigate("/add-new-stock-request")}
//             >
//               <PlusCircle size={16} className="me-2" />
//               New Stock Request
//             </button>
//           </div>
//         </div>

//         <div className="row">
//           {statCards.map(({ label, value, cls, icon }) => (
//             <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
//               <div className={`dash-count ${cls} w-100`}>
//                 <div className="dash-counts">
//                   <h4>{value}</h4>
//                   <h5>{label}</h5>
//                 </div>
//                 <div className="dash-imgs">{icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         <div className="card table-list-card">
//           <div className="card-body">

//             <div className="table-top">
//               <div className="search-set">
//                 <div className="search-input">
//                   <input
//                     type="text"
//                     placeholder="Search requests…"
//                     className="form-control form-control-sm formsearch"
//                     value={filters.search}
//                     onChange={(e) =>
//                       dispatch(setReqFilters({ search: e.target.value, page: 1 }))
//                     }
//                   />
//                   <Link to="#" className="btn btn-searchset">
//                     <SearchIcon size={14} />
//                   </Link>
//                 </div>

//                 <div className="d-flex gap-2 ms-3">
//                   {[{ key: "sent", icon: <Send size={13} />, label: "My Requests" }].map(
//                     ({ key, icon, label }) => (
//                       <button
//                         key={key}
//                         className={`btn btn-sm ${view === key ? "btn-primary" : "btn-outline-secondary"}`}
//                         onClick={() => { setView(key); dispatch(setReqFilters({ page: 1 })); }}
//                       >
//                         {icon}
//                         <span className="ms-1">{label}</span>
//                       </button>
//                     )
//                   )}
//                 </div>
//               </div>

//               <div className="search-path">
//                 <button
//                   className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
//                   onClick={() => setIsFilterVisible((p) => !p)}
//                 >
//                   <Filter size={16} className="filter-icon" />
//                 </button>
//               </div>
//             </div>

//             {isFilterVisible && (
//               <div className="card mb-0">
//                 <div className="card-body pb-0">
//                   <div className="row">
//                     <div className="col-lg-3 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>Priority</label>
//                         <select
//                           className="form-select form-select-sm"
//                           value={filters.priority}
//                           onChange={(e) =>
//                             dispatch(setReqFilters({ priority: e.target.value, page: 1 }))
//                           }
//                         >
//                           <option value="">All Priorities</option>
//                           {Object.entries(PRIORITY_CFG).map(([k, v]) => (
//                             <option key={k} value={k}>{v.label}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>

//                     <div className="col-lg-3 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>Status</label>
//                         <select
//                           className="form-select form-select-sm"
//                           value={filters.status}
//                           onChange={(e) =>
//                             dispatch(setReqFilters({ status: e.target.value, page: 1 }))
//                           }
//                         >
//                           <option value="">All Statuses</option>
//                           <option value="pending">Pending</option>
//                           <option value="approved">Approved</option>
//                           <option value="linked">Linked to StockFlow</option>
//                         </select>
//                       </div>
//                     </div>

//                     <div className="col-lg-2 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>&nbsp;</label>
//                         <button
//                           className="btn btn-filters w-100"
//                           onClick={() => dispatch(resetReqFilters())}
//                         >
//                           Reset Filters
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="table-responsive">
//               {loading ? (
//                 <div className="text-center p-5">
//                   <div className="spinner-border text-primary" />
//                 </div>
//               ) : requests.length === 0 ? (
//                 <div className="text-center p-5">
//                   <Inbox size={32} className="text-muted mb-2 d-block mx-auto" />
//                   <p className="text-muted">No stock requests found</p>
//                 </div>
//               ) : (
//                 <Table
//                   key={`${view}-${filters.page}-${filters.limit}`}
//                   columns={columns}
//                   dataSource={requests}
//                   pagination={{
//                     total:      pagination.total,
//                     page:       pagination.currentPage,
//                     limit:      filters.limit,
//                     totalPages: pagination.totalPages,
//                   }}
//                   filters={filters}
//                   onPaginationChange={handlePaginationChange}
//                 />
//               )}
//             </div>

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default StockRequest;




/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusCircle, Eye, CheckCircle, Clock, 
  Send, Inbox, Filter, Package, Truck,
  Search as SearchIcon, ThumbsUp,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../core/pagination/datatable";
import {
  fetchStockRequestStats,
  selectReqStats,
  fetchSentRequests,
  setReqFilters,
  resetReqFilters,
  selectReqFilters,
  // setFlowSourceRequest,
} from "../../core/redux/slices/stockSlice";
import AuthService from "../../services/authService";

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────

const PRIORITY_CFG = {
  urgent:   { color: "#dc3545", badge: "badge-linedanger",  label: "Urgent"   },
  standard: { color: "#fd7e14", badge: "badge-linewarning", label: "Standard" },
  low:      { color: "#198754", badge: "badge-linesuccess", label: "Low"      },
};

// ─────────────────────────────────────────────────────────────
//  deriveStatus — list view
//
//  The list API returns boolean flags; there is no reliable `status`
//  string on every record. We compute status from flags in the same
//  priority order as the detail view's deriveStatus, using only the
//  fields available on list items.
//
//  List item fields available:
//    is_approved, is_stock_submitted, is_delivered, stock_id
// ─────────────────────────────────────────────────────────────
const deriveStatus = (record) => {
  if (record.is_delivered)
    return { label: "Delivered",             badge: "badge-linesuccess", icon: <CheckCircle size={12} /> };

  // stock_id + is_stock_submitted = stock has been submitted/dispatched → In Transit
  if (record.stock_id && record.is_stock_submitted)
    return { label: "In Transit",            badge: "badge-lineinfo",    icon: <Truck size={12} /> };

  if (record.is_approved)
    return { label: "Scheduled",             badge: "badge-linesuccess", icon: <CheckCircle size={12} /> };

  return   { label: "Pending for Approval",  badge: "badge-linewarning", icon: <Clock size={12} /> };
};



const fmtDate = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const getPriorityCfg = (key) =>
  PRIORITY_CFG[(key || "").toLowerCase()] ||
  { color: "#6c757d", badge: "badge-secondary", label: key || "—" };

// ─────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────

const StockRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxStats = useSelector(selectReqStats);
  const filters    = useSelector(selectReqFilters);
  const sentBucket = useSelector((s) => s.stock.req.sent);

  const [view,            setView]            = useState("sent");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const activeBucket = sentBucket;
  const requests     = activeBucket.items      || [];
  const loading      = activeBucket.loading;
  const pagination   = activeBucket.pagination || { currentPage: 1, totalPages: 1, total: 0 };

  // ── Fetch ──────────────────────────────────────────────────

  const doFetch = useCallback(() => {
    const params = {
      page_no:  filters.page,
      limit:    filters.limit,
      priority: filters.priority || undefined,
      status:   filters.status   || undefined,
      search:   filters.search   || undefined,
    };
    if (view === "sent") dispatch(fetchSentRequests(params));
  }, [dispatch, view, filters]); // eslint-disable-line

  useEffect(() => {
    doFetch();
  }, [view, filters.page, filters.limit, filters.priority, filters.status]); // eslint-disable-line

  useEffect(() => {
    const t = setTimeout(() => doFetch(), 500);
    return () => clearTimeout(t);
  }, [filters.search]); // eslint-disable-line

  useEffect(() => {
    dispatch(fetchStockRequestStats());
  }, [dispatch]);

 
  // const handleCreateFlowFromRequest = (record) => {
  //   dispatch(setFlowSourceRequest({
  //     value: record.req_id,
  //     label: `#${record.req_id}${record.description ? " — " + record.description : ""}`,
  //     raw:   record,
  //   }));
  //   navigate("/add-stock-flow");
  // };


  const handleCreateFlowFromRequest = (record) => {
  navigate("/add-stock-flow", {
    state: {
      fromStockRequest: true,
      request: {
        value: record.req_id,
        label: `#${record.req_id}${record.description ? " — " + record.description : ""}`,
      },
    },
  });
};


  const handlePaginationChange = ({ page, limit }) =>
    dispatch(setReqFilters({ page, limit }));

  const handleStarToggle = async (e, req) => {
    e.stopPropagation();
    const next = !req.is_starred;
    try {
      await AuthService.toggleStockRequestStar(req.req_id, next);
      doFetch();
    } catch (err) {
      console.error("Star toggle failed:", err);
    }
  };

  // ── Columns ────────────────────────────────────────────────

  const columns = [
    {
      title: "",
      render: (_, record) => (
        <span style={{ cursor: "pointer" }} onClick={(e) => handleStarToggle(e, record)}>
          <i className={`${record.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
        </span>
      ),
    },
    {
      title: "",
      render: (_, record) => {
        const priCfg = getPriorityCfg(record.priority);
        return (
          <div style={{
            width: 4, height: 38,
            background: priCfg.color,
            borderRadius: 2,
            margin: "0 auto",
          }} />
        );
      },
    },
    {
      title: "Request ID",
      dataIndex: "req_id",
      render: (text, record) => (
        <Link
          to={`/stock-request-details/${record.req_id}`}
          className="badge badge-primary text-decoration-none"
          style={{ fontFamily: "monospace" }}
          onClick={(e) => e.stopPropagation()}
        >
          {text}
        </Link>
      ),
    },
    {
      title: "From (Recipient)",
      dataIndex: "recipient_name",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-1">
          <Send size={14} className="text-danger flex-shrink-0" />
          <div>
            <div className="small fw-semibold">{text || record.requester_name || "—"}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{record.destination || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "To (Supplier)",
      dataIndex: "supplier_name",
      render: (text, record) => (
        <div className="d-flex align-items-center gap-1">
          <Inbox size={14} className="text-success flex-shrink-0" />
          <div>
            <div className="small fw-semibold">{text || record.dispatcher_name || "—"}</div>
            <div className="text-muted" style={{ fontSize: 11 }}>{record.source || "—"}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Articles",
      render: (_, record) => (
        <>
          <div className="d-flex align-items-center gap-1">
            <Package size={14} className="text-primary" />
            <span className="badge badge-info">
              {record.total_articles} item{record.total_articles !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="text-muted" style={{ fontSize: 11 }}>Qty: {record.total_quantity}</div>
        </>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (val) => {
        const cfg = getPriorityCfg(val);
        return <span className={`badge ${cfg.badge}`}>{cfg.label}</span>;
      },
    },
    {
      title: "Status",
      render: (_, record) => {
  
        const derived = deriveStatus(record);
        return (
          <span className={`badge ${derived.badge} d-inline-flex align-items-center gap-1`}>
            {derived.icon}{derived.label}
          </span>
        );
      },
    },
    {
      title: "Created",
      dataIndex: "created_at",
      render: (text) => (
        <span className="small text-muted" style={{ whiteSpace: "nowrap" }}>{fmtDate(text)}</span>
      ),
    },
    {
      title: "Action",
      render: (_, record) => {
        const isApproved = record.is_approved === true;
        const isSupplier = record.is_supplier === true;

        return (
          <div className="d-flex" onClick={(e) => e.stopPropagation()}>

            <div className="edit-delete-action">
              <Link
                className="me-2 p-2"
                to={`/stock-request-details/${record.req_id}`}
                title="View Details"
              >
                <Eye size={16} className="text-info" />
              </Link>
            </div>

         {/* approved + supplier and stock generated but not submitted */}
            {isApproved && isSupplier && !record.is_stock_submitted && (
              <div className="edit-delete-action">
                <button
                  type="button"
                  className="btn btn-link p-2 me-1"
                  title="Add Stock"
                  onClick={() => handleCreateFlowFromRequest(record)}
                >
                  <PlusCircle size={16} className="text-success" />
                </button>
              </div>
            )}

          </div>
        );
      },
    },
  ];

  // ── Stat cards ─────────────────────────────────────────────

  const statCards = [
    { label: "Total Requests", value: reduxStats.total    || 0, cls: "das5", icon: <Package /> },
    { label: "Pending",        value: reduxStats.pending  || 0, cls: "das6", icon: <Clock /> },
    { label: "Approved",       value: reduxStats.approved || 0, cls: "das7", icon: <ThumbsUp /> },
    { label: "Delivered",      value: reduxStats.received || 0, cls: "das8", icon: <CheckCircle /> },
  ];

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="page-wrapper">
      <div className="content">

        <div className="page-header mb-3">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Stock Requests</h4>
              <h6>Manage stock requests between warehouses</h6>
            </div>
          </div>
          <div className="page-btn">
            <button
              className="btn btn-added"
              onClick={() => navigate("/add-new-stock-request")}
            >
              <PlusCircle size={16} className="me-2" />
              New Stock Request
            </button>
          </div>
        </div>

        <div className="row">
          {statCards.map(({ label, value, cls, icon }) => (
            <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className={`dash-count ${cls} w-100`}>
                <div className="dash-counts">
                  <h4>{value}</h4>
                  <h5>{label}</h5>
                </div>
                <div className="dash-imgs">{icon}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="card table-list-card">
          <div className="card-body">

            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search requests…"
                    className="form-control form-control-sm formsearch"
                    value={filters.search}
                    onChange={(e) =>
                      dispatch(setReqFilters({ search: e.target.value, page: 1 }))
                    }
                  />
                  <Link to="#" className="btn btn-searchset">
                    <SearchIcon size={14} />
                  </Link>
                </div>

                <div className="d-flex gap-2 ms-3">
                  {[{ key: "sent", icon: <Send size={13} />, label: "My Requests" }].map(
                    ({ key, icon, label }) => (
                      <button
                        key={key}
                        className={`btn btn-sm ${view === key ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => { setView(key); dispatch(setReqFilters({ page: 1 })); }}
                      >
                        {icon}
                        <span className="ms-1">{label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="search-path">
                <button
                  className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                  onClick={() => setIsFilterVisible((p) => !p)}
                >
                  <Filter size={16} className="filter-icon" />
                </button>
              </div>
            </div>

            {isFilterVisible && (
              <div className="card mb-0">
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <label>Priority</label>
                        <select
                          className="form-select form-select-sm"
                          value={filters.priority}
                          onChange={(e) =>
                            dispatch(setReqFilters({ priority: e.target.value, page: 1 }))
                          }
                        >
                          <option value="">All Priorities</option>
                          {Object.entries(PRIORITY_CFG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <label>Status</label>
                        <select
                          className="form-select form-select-sm"
                          value={filters.status}
                          onChange={(e) =>
                            dispatch(setReqFilters({ status: e.target.value, page: 1 }))
                          }
                        >
                          <option value="">All Statuses</option>
                          <option value="pending">Pending</option>
                          <option value="approved">Approved</option>
                          <option value="linked">Linked to StockFlow</option>
                        </select>
                      </div>
                    </div>

                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="input-blocks">
                        <label>&nbsp;</label>
                        <button
                          className="btn btn-filters w-100"
                          onClick={() => dispatch(resetReqFilters())}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border text-primary" />
                </div>
              ) : requests.length === 0 ? (
                <div className="text-center p-5">
                  <Inbox size={32} className="text-muted mb-2 d-block mx-auto" />
                  <p className="text-muted">No stock requests found</p>
                </div>
              ) : (
                <Table
                  key={`${view}-${filters.page}-${filters.limit}`}
                  columns={columns}
                  dataSource={requests}
                  pagination={{
                    total:      pagination.total,
                    page:       pagination.currentPage,
                    limit:      filters.limit,
                    totalPages: pagination.totalPages,
                  }}
                  filters={filters}
                  onPaginationChange={handlePaginationChange}
                />
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default StockRequest;