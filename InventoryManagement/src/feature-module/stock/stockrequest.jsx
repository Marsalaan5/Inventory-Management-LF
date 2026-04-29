
// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import {
//   PlusCircle, Eye, CheckCircle, Clock, AlertCircle,
//   Send, Inbox, Filter, RefreshCw,
//   ChevronLeft, ChevronRight, Package, Truck,
//   Search as SearchIcon, ThumbsUp,
// } from "feather-icons-react/build/IconComponents";
// import {  useDispatch,useSelector } from "react-redux";
// import {
//   fetchStockRequestStats,
//   selectReqStats,
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

// // API returns these exact status strings from backend logic
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

//   // ── Redux stats ────────────────────────────────────────────
//   const reduxStats = useSelector(selectReqStats);

//   const [view,            setView]            = useState("sent");
//   const [requests,        setRequests]        = useState([]);
//   const [pagination,      setPagination]      = useState({ currentPage: 1, totalPages: 1, total: 0 });
//   const [loading,         setLoading]         = useState(false);
//   const [isFilterVisible, setIsFilterVisible] = useState(false);
//   const [searchQuery,     setSearchQuery]     = useState("");
//   const [filterPriority,  setFilterPriority]  = useState("");
//   const [filterStatus,    setFilterStatus]    = useState("");

//   // ── Fetch ──────────────────────────────────────────────────
//   const fetchRequests = useCallback(async (page_no = 1) => {
//     setLoading(true);
//     try {
//       const params = { page_no, limit: 10 };
//       if (filterPriority) params.priority = filterPriority;
//       if (filterStatus)   params.status   = filterStatus;
//       if (searchQuery)    params.search   = searchQuery;

//       // For "approved" view, add status filter
//       const effectiveParams =
//         view === "approved" ? { ...params, status: "approved" } : params;

//       const res = await AuthService.getStockRequests(effectiveParams);
//       const data = res.data;

//       // API returns: { success, data: [...], total_records, message }
//       setRequests(data.data || []);
//       const total = data.total_records || 0;
//       setPagination({
//         currentPage: page_no,
//         totalPages:  Math.ceil(total / 10) || 1,
//         total,
//       });
//     } catch (err) {
//       console.error("fetchRequests:", err);
//       setRequests([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [view, filterPriority, filterStatus, searchQuery]);

//   useEffect(() => {
//     fetchRequests(1);
//   }, [fetchRequests]);

//   // Fetch stats from Redux on mount
//   useEffect(() => {
//     dispatch(fetchStockRequestStats());
//   }, [dispatch]);

//   // ── Handlers ───────────────────────────────────────────────
//   const handleViewDetail = (reqId) => navigate(`/stock-request-details/${reqId}`);

//   const handleStarToggle = async (e, req) => {
//     e.stopPropagation();
//     const next = !req.is_starred;
//     // Optimistic update
//     setRequests((prev) =>
//       prev.map((r) => (r.req_id === req.req_id ? { ...r, is_starred: next } : r))
//     );
//     try {
//       await AuthService.toggleStockRequestStar(req.req_id, next);
//     } catch {
//       // Revert on failure
//       setRequests((prev) =>
//         prev.map((r) => (r.req_id === req.req_id ? { ...r, is_starred: !next } : r))
//       );
//     }
//   };

//   const VIEW_LABELS = {
//     sent:     "My Requests",
//     approved: "Approved Requests",
//   };

//   // ── Stat card values ────────────────────────────────────────

//   const statCards = [
//     { label: "Total Requests", value: reduxStats.total    || 0 ,                    cls: "das5", icon: <Package /> },
//     { label: "Pending",        value: reduxStats.pending  || 0,                     cls: "das6", icon: <Clock /> },
//     { label: "Approved",       value: reduxStats.approved || 0,                     cls: "das7", icon: <ThumbsUp /> },
//     { label: "Delivered",      value: reduxStats.received || 0,                     cls: "das8", icon: <CheckCircle /> },
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
//         <div className="card mb-3">
//           <div className="card-body">

//             {/* ── Table top bar ── */}
//             <div className="table-top">
//               <div className="search-set">
//                 <div className="search-input">
//                   <input
//                     type="text"
//                     placeholder="Search requests…"
//                     className="form-control form-control-sm formsearch"
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     onKeyDown={(e) => { if (e.key === "Enter") fetchRequests(1); }}
//                   />
//                   <a
//                     href="#"
//                     className="btn btn-searchset"
//                     onClick={(e) => { e.preventDefault(); fetchRequests(1); }}
//                   >
//                     <SearchIcon size={14} />
//                   </a>
//                 </div>

//                 {/* View tabs */}
//                 <div className="d-flex gap-2 ms-3">
//                   {[
//                     { key: "sent",     icon: <Send size={13} />,        label: "My Requests" },
//                     { key: "approved", icon: <CheckCircle size={13} />, label: "Approved"    },
//                   ].map(({ key, icon, label }) => (
//                     <button
//                       key={key}
//                       className={`btn btn-sm ${view === key ? "btn-primary" : "btn-outline-secondary"}`}
//                       onClick={() => setView(key)}
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
//                           value={filterPriority}
//                           onChange={(e) => setFilterPriority(e.target.value)}
//                         >
//                           <option value="">All Priorities</option>
//                           {Object.entries(PRIORITY_CFG).map(([k, v]) => (
//                             <option key={k} value={k}>{v.label}</option>
//                           ))}
//                         </select>
//                       </div>
//                     </div>

//                     {view !== "approved" && (
//                       <div className="col-lg-3 col-sm-6 col-12">
//                         <div className="input-blocks">
//                           <label>Status</label>
//                           <select
//                             className="form-select form-select-sm"
//                             value={filterStatus}
//                             onChange={(e) => setFilterStatus(e.target.value)}
//                           >
//                             <option value="">All Statuses</option>
//                             <option value="pending">Pending</option>
//                             <option value="approved">Approved</option>
//                             <option value="linked">Linked to StockFlow</option>
//                           </select>
//                         </div>
//                       </div>
//                     )}

//                     <div className="col-lg-2 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>&nbsp;</label>
//                         <button
//                           className="btn btn-filters w-100"
//                           onClick={() => {
//                             setFilterPriority("");
//                             setFilterStatus("");
//                             setSearchQuery("");
//                             fetchRequests(1);
//                           }}
//                         >
//                           Reset Filters
//                         </button>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* ── Approved view banner ── */}
//             {view === "approved" && (
//               <div className="alert alert-success py-2 mb-3 mt-3 d-flex align-items-center gap-2">
//                 <CheckCircle size={16} />
//                 <span className="small">
//                   These requests have been approved. Open a request and click
//                   <strong> Mark as Received</strong> once stock arrives.
//                 </span>
//               </div>
//             )}

//             {/* ── Title + pagination ── */}
//             <div className="d-flex justify-content-between align-items-center mb-3 px-1 pt-3">
//               <h5 className="mb-0">
//                 {VIEW_LABELS[view]}
//                 <span className="badge bg-secondary ms-2" style={{ fontSize: 12 }}>
//                   {pagination.total}
//                 </span>
//               </h5>
//               <div className="d-flex gap-1 align-items-center">
//                 <button
//                   className="btn btn-sm btn-white"
//                   title="Refresh"
//                   onClick={() => fetchRequests(pagination.currentPage)}
//                 >
//                   <RefreshCw size={14} />
//                 </button>
//                 <button
//                   className="btn btn-sm btn-white"
//                   disabled={pagination.currentPage <= 1}
//                   onClick={() => fetchRequests(pagination.currentPage - 1)}
//                 >
//                   <ChevronLeft size={14} />
//                 </button>
//                 <span className="small text-muted px-1">
//                   {pagination.currentPage} / {pagination.totalPages || 1}
//                 </span>
//                 <button
//                   className="btn btn-sm btn-white"
//                   disabled={pagination.currentPage >= pagination.totalPages}
//                   onClick={() => fetchRequests(pagination.currentPage + 1)}
//                 >
//                   <ChevronRight size={14} />
//                 </button>
//               </div>
//             </div>

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
//                 <table className="table table-hover align-middle">
//                   <thead className="table-light">
//                     <tr>
//                       <th style={{ width: 36 }} />
//                       <th style={{ width: 6, padding: 0 }} />
//                       <th>Request ID</th>
//                       <th>From (Recipient)</th>
//                       <th>To (Supplier)</th>
//                       <th>Articles</th>
//                       <th>Priority</th>
//                       <th>Status</th>
//                       <th className="text-end">Created</th>
//                       <th>Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {requests.map((req) => {
//                       const priCfg = getPriorityCfg(req.priority);
//                       const stsCfg = STATUS_CFG[req.status] || { badge: "badge-secondary", icon: null };

//                       return (
//                         <tr
//                           key={req.req_id}
//                           style={{ cursor: "pointer" }}
//                           onClick={() => handleViewDetail(req.req_id)}
//                         >
                       
//                           <td
//                             onClick={(e) => handleStarToggle(e, req)}
//                             title={req.is_starred ? "Unstar" : "Star"}
//                           >
//                             <i
//                               className={`${req.is_starred ? "fas text-warning" : "far text-muted"} fa-star`}
//                             />
//                           </td>

                      
//                           <td style={{ padding: 0 }}>
//                             <div
//                               style={{
//                                 width: 4, height: 38,
//                                 background: priCfg.color,
//                                 borderRadius: 2,
//                                 margin: "0 auto",
//                               }}
//                             />
//                           </td>

                         
                         
//                           <td>
//                             <Link
//                               to={`/stock-request-details/${req.req_id}`}
//                               className="badge badge-primary text-decoration-none"
//                               style={{ fontFamily: "monospace" }}
//                               onClick={(e) => e.stopPropagation()}
//                             >
//                               {req.req_id}
//                             </Link>
//                           </td>

                   
//                           <td>
//                             <div className="d-flex align-items-center gap-1">
//                               <Send size={14} className="text-danger flex-shrink-0" />
//                               <div>
//                                 <div className="small fw-semibold">
//                                   {req.recipient_name || req.requester_name || "—"}
//                                 </div>
//                                 <div className="text-muted" style={{ fontSize: 11 }}>
//                                   {req.destination || "—"}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>

                       
//                           <td>
//                             <div className="d-flex align-items-center gap-1">
//                               <Inbox size={14} className="text-success flex-shrink-0" />
//                               <div>
//                                 <div className="small fw-semibold">
//                                   {req.supplier_name || req.dispatcher_name || "—"}
//                                 </div>
//                                 <div className="text-muted" style={{ fontSize: 11 }}>
//                                   {req.source || "—"}
//                                 </div>
//                               </div>
//                             </div>
//                           </td>

//                           {/* Articles */}
//                           <td>
//                             <div className="d-flex align-items-center gap-1">
//                               <Package size={14} className="text-primary" />
//                               <span className="badge badge-info">
//                                 {req.total_articles} item{req.total_articles !== 1 ? "s" : ""}
//                               </span>
//                             </div>
//                             <div className="text-muted" style={{ fontSize: 11 }}>
//                               Qty: {req.total_quantity}
//                             </div>
//                           </td>

//                           {/* Priority badge */}
//                           <td>
//                             <span className={`badge ${priCfg.badge}`}>
//                               {priCfg.label}
//                             </span>
//                           </td>

//                           {/* Status */}
//                           <td>
//                             <span
//                               className={`badge ${stsCfg.badge} d-inline-flex align-items-center gap-1`}
//                             >
//                               {stsCfg.icon}
//                               {req.status || "Awaiting Shipment"}
//                             </span>
//                             {req.action && (
//                               <div className="text-muted mt-1" style={{ fontSize: 11 }}>
//                                 {req.action}
//                               </div>
//                             )}
//                           </td>

//                           {/* Created */}
//                           <td className="text-end">
//                             <span className="small text-muted" style={{ whiteSpace: "nowrap" }}>
//                               {fmtDate(req.created_at)}
//                             </span>
//                           </td>

//                           {/* Actions */}
//                           <td className="d-flex" onClick={(e) => e.stopPropagation()}>
//                             <div className="edit-delete-action">
//                               <Link
//                                 className="me-2 p-2"
//                                 to={`/stock-request-details/${req.req_id}`}
//                                 title="View Details"
//                               >
//                                 <Eye size={16} className="text-info" />
//                               </Link>
//                             </div>
//                             <div className="edit-delete-action">
//                               <Link
//                                 className="me-2 p-2"
//                                 to={`/add-stock-flow`}
//                                 title="Add Stock"
//                               >
//                                 <PlusCircle size={16} className="text-success" />
//                               </Link>
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>
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
  PlusCircle, Eye, CheckCircle, Clock, AlertCircle,
  Send, Inbox, Filter, Package, Truck,
  Search as SearchIcon, ThumbsUp,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import Table from "../../core/pagination/datatable";
import {
  fetchStockRequestStats,
  selectReqStats,
  fetchSentRequests,
  // fetchInboxRequests,
  setReqFilters,
  resetReqFilters,
  selectReqFilters,
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

const STATUS_CFG = {
  "Pending for Approval":           { badge: "badge-linewarning", icon: <Clock size={12} /> },
  "Followed Up for Approval":       { badge: "badge-lineinfo",    icon: <Clock size={12} /> },
  "Escalated Due to No Approval":   { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
  "Awaiting Shipment":              { badge: "badge-lineinfo",    icon: <Truck size={12} /> },
  "Scheduled":                      { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
  "Shipping Deadline Approaching":  { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
  "Delivered":                      { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
  "Resolution required":            { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
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

  const reduxStats   = useSelector(selectReqStats);
  const filters      = useSelector(selectReqFilters);
  const sentBucket   = useSelector((s) => s.stock.req.sent);
  // const inboxBucket  = useSelector((s) => s.stock.req.inbox);

  const [view,           setView]           = useState("sent");
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const activeBucket = sentBucket;
  const requests     = activeBucket.items      || [];
  const loading      = activeBucket.loading;
  const pagination   = activeBucket.pagination || { currentPage: 1, totalPages: 1, total: 0 };

  // ── Fetch ──────────────────────────────────────────────────

  const doFetch = useCallback(() => {
    const params = {
      page_no:   filters.page,
      limit:     filters.limit,
      priority:  filters.priority || undefined,
      status:    filters.status   || undefined,
      search:    filters.search   || undefined,
    };
    if (view === "sent") dispatch(fetchSentRequests(params));
    // else                 dispatch(fetchInboxRequests(params));
  }, [dispatch, view, filters]); // eslint-disable-line

  // Re-fetch on filter/page/view changes
  useEffect(() => {
    doFetch();
  }, [view, filters.page, filters.limit, filters.priority, filters.status]); // eslint-disable-line

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => doFetch(), 500);
    return () => clearTimeout(t);
  }, [filters.search]); // eslint-disable-line

  // Stats on mount
  useEffect(() => {
    dispatch(fetchStockRequestStats());
  }, [dispatch]);

  // ── Handlers ───────────────────────────────────────────────

  const handlePaginationChange = ({ page, limit }) =>
    dispatch(setReqFilters({ page, limit }));

  const handleStarToggle = async (e, req) => {
    e.stopPropagation();
    const next = !req.is_starred;
    try {
      await AuthService.toggleStockRequestStar(req.req_id, next);
      doFetch(); // re-fetch to reflect updated star
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
      dataIndex: "status",
      render: (val, record) => {
        const cfg = STATUS_CFG[val] || { badge: "badge-secondary", icon: null };
        return (
          <>
            <span className={`badge ${cfg.badge} d-inline-flex align-items-center gap-1`}>
              {cfg.icon}{val || "Awaiting Shipment"}
            </span>
            {record.action && (
              <div className="text-muted mt-1" style={{ fontSize: 11 }}>{record.action}</div>
            )}
          </>
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
      render: (_, record) => (
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
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="/add-stock-flow"
              title="Add Stock"
            >
              <PlusCircle size={16} className="text-success" />
            </Link>
          </div>
        </div>
      ),
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

        {/* ── Page header ── */}
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

        {/* ── Stat cards ── */}
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

        {/* ── Main card ── */}
        <div className="card table-list-card">
          <div className="card-body">

            {/* ── Table top bar ── */}
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

                {/* View tabs */}
                <div className="d-flex gap-2 ms-3">
                  {[
                    { key: "sent",  icon: <Send size={13} />,        label: "My Requests" },
                    // { key: "inbox", icon: <Inbox size={13} />,       label: "Inbox"       },
                  ].map(({ key, icon, label }) => (
                    <button
                      key={key}
                      className={`btn btn-sm ${view === key ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => { setView(key); dispatch(setReqFilters({ page: 1 })); }}
                    >
                      {icon}
                      <span className="ms-1">{label}</span>
                    </button>
                  ))}
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

            {/* ── Filter panel ── */}
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

            {/* ── Table ── */}
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