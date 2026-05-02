

// import PropTypes from "prop-types";
// import React, { useState, useEffect, useCallback } from "react";
// import { Link, useParams, useNavigate } from "react-router-dom";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, Package, Truck, MapPin, Calendar,
//   User, FileText, CheckCircle, Clock, AlertCircle,
//   Send, ThumbsUp, Mail,
// } from "feather-icons-react/build/IconComponents";
// import AuthService from "../../services/authService";

// const MySwal = withReactContent(Swal);

// // ─────────────────────────────────────────────────────────────
// //  Config helpers
// // ─────────────────────────────────────────────────────────────

// const PRIORITY_CFG = {
//   urgent:   { color: "#dc3545", badge: "badge-linedanger",  label: "Urgent"   },
//   standard: { color: "#fd7e14", badge: "badge-linewarning", label: "Standard" },
//   low:      { color: "#198754", badge: "badge-linesuccess", label: "Low"      },
// };

// // Exact status strings returned by get_stock_requests / get_stock_request_by_id backend
// const STATUS_CFG = {
//   "Pending for Approval":           { badge: "badge-linewarning", alertVariant: "warning", icon: "clock"  },
//   "Followed Up for Approval":       { badge: "badge-lineinfo",    alertVariant: "info",    icon: "clock"  },
//   "Escalated Due to No Approval":   { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert"  },
//   "Awaiting Shipment":              { badge: "badge-lineinfo",    alertVariant: "info",    icon: "truck"  },
//   "Scheduled":                      { badge: "badge-linesuccess", alertVariant: "success", icon: "check"  },
//   "Shipping Deadline Approaching":  { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert"  },
//   "Delivered":                      { badge: "badge-linesuccess", alertVariant: "success", icon: "check"  },
//   "Resolution required":            { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert"  },
// };

// const getPriorityCfg = (key) =>
//   PRIORITY_CFG[(key || "").toLowerCase()] ||
//   { color: "#6c757d", badge: "badge-secondary", label: key || "—" };

// const getStatusCfg = (key) =>
//   STATUS_CFG[key] ||
//   { badge: "badge-secondary", alertVariant: "secondary", icon: "clock" };

// const fmtDate = (dt) =>
//   dt
//     ? new Date(dt).toLocaleDateString(undefined, {
//         year: "numeric", month: "short", day: "numeric",
//         hour: "2-digit", minute: "2-digit",
//       })
//     : "—";

// // ─────────────────────────────────────────────────────────────
// //  Sub-components
// // ─────────────────────────────────────────────────────────────

// const StatusIcon = ({ icon, size = 16 }) => {
//   if (icon === "truck") return <Truck size={size} />;
//   if (icon === "check") return <CheckCircle size={size} />;
//   if (icon === "alert") return <AlertCircle size={size} />;
//   return <Clock size={size} />;
// };
// StatusIcon.propTypes = { icon: PropTypes.string, size: PropTypes.number };

// // ─────────────────────────────────────────────────────────────
// //  Main component
// // ─────────────────────────────────────────────────────────────

// const StockRequestDetails = () => {
//   const { id }   = useParams();
//   const navigate = useNavigate();

//   const [request,       setRequest]       = useState(null);
//   const [articles,      setArticles]      = useState([]);
//   const [loading,       setLoading]       = useState(true);
//   const [actionLoading, setActionLoading] = useState(false);


//   const fetchDetails = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await AuthService.getStockRequestById(id);
//       const data = res.data.data;

//       setRequest(data);


//       setArticles(Array.isArray(data.requested_articles) ? data.requested_articles : []);
//     } catch (err) {
//       console.error("fetchDetails:", err);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.response?.data?.message || "Failed to load stock request details",
//         timer: 2500,
//       }).then(() => navigate("/stock-request"));
//     } finally {
//       setLoading(false);
//     }
//   }, [id, navigate]);

//   useEffect(() => {
//     fetchDetails();
//   }, [fetchDetails]);


//   const deriveStatus = (req) => {
//     if (!req) return "—";
//     const isRecipient = req.is_recipient;

//     if (req.delivered_at !== null && req.grn_timestamp !== null) return "Delivered";
//     if (req.delivered_at !== null && req.grn_timestamp === null) return "Delivered";

//     if (req.resolution_required_at !== null) return "Resolution required";
//     if (req.approved_at !== null && req.stock_id === null && req.deadline_notice_at !== null)
//       return "Shipping Deadline Approaching";

//     if (req.approved_at !== null && req.stock_id === null)
//       return isRecipient ? "Awaiting Shipment" : "Scheduled";

//     if (req.approved_at !== null && req.stock_id !== null)
//       return isRecipient ? "Awaiting Shipment" : "Scheduled";

//     if (req.approved_at === null && req.escalation_enabled && req.escalated_at !== null)
//       return "Escalated Due to No Approval";

//     if (req.approved_at === null && req.follow_up_enabled && req.follow_up_sent_at !== null)
//       return "Followed Up for Approval";

//     return "Pending for Approval";
//   };


//   const handleApprove = async () => {
//     const { value: totalDays, isConfirmed } = await MySwal.fire({
//       title: "Approve Stock Request",
//       html: `
//         <p class="text-muted small mb-3">
//           Enter the number of days until scheduled dispatch.
//         </p>
//         <div class="d-flex align-items-center justify-content-center gap-2">
//           <label class="form-label mb-0 fw-semibold">Dispatch in</label>
//           <input
//             id="swal-days"
//             type="number"
//             class="swal2-input"
//             placeholder="e.g. 3"
//             min="1"
//             max="50"
//             value="3"
//             style="width: 100px; margin: 0;"
//           />
//           <span class="fw-semibold">days</span>
//         </div>
//       `,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Approve",
//       confirmButtonColor: "#198754",
//       cancelButtonText: "Cancel",
//       preConfirm: () => {
//         const val = parseInt(document.getElementById("swal-days")?.value);
//         if (!val || val < 1 || val > 50) {
//           Swal.showValidationMessage("Enter a number between 1 and 50");
//           return false;
//         }
//         return val;
//       },
//     });

//     if (!isConfirmed) return;
// // 
//     setActionLoading(true);
//     try {
//       await AuthService.approveStockRequest(id, { total_days: totalDays });
//       MySwal.fire({
//         icon: "success",
//         title: "Approved!",
//         text: `Request approved. Scheduled dispatch in ${totalDays} day(s).`,
//         timer: 2500,
//         showConfirmButton: false,
//       });
//       fetchDetails();
//     } catch (err) {
//       console.error("approveStockRequest:", err);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.response?.data?.message || "Failed to approve request.",
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   };


//   const handleMarkReceived = async () => {
//     const { isConfirmed } = await MySwal.fire({
//       title: "Confirm Stock Receipt",
//       html: `
//         <p class="text-muted small mb-2">
//           Confirm that the stock has been physically received at your warehouse.
//         </p>
//         <div class="alert alert-info py-2 small mb-0">
//           This action cannot be undone. Make sure all items have arrived before confirming.
//         </div>
//       `,
//       icon: "info",
//       showCancelButton: true,
//       confirmButtonText: "Confirm Receipt",
//       confirmButtonColor: "#0d6efd",
//       cancelButtonText: "Cancel",
//     });

//     if (!isConfirmed) return;

//     setActionLoading(true);
//     try {
//       await AuthService.markStockRequestReceived(id);
//       MySwal.fire({
//         icon: "success",
//         title: "Received!",
//         text: "Stock delivery confirmed successfully.",
//         timer: 2500,
//         showConfirmButton: false,
//       });
//       fetchDetails();
//     } catch (err) {
//       console.error("markStockRequestReceived:", err);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: err.response?.data?.message || "Failed to confirm delivery.",
//       });
//     } finally {
//       setActionLoading(false);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────
//   //  Loading / not found guards
//   // ─────────────────────────────────────────────────────────────

//   if (loading) {
//     return (
//       <div className="page-wrapper">
//         <div
//           className="content d-flex justify-content-center align-items-center"
//           style={{ minHeight: 400 }}
//         >
//           <div className="text-center">
//             <div className="spinner-border text-primary mb-3" />
//             <p>Loading stock request details…</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (!request) {
//     return (
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="alert alert-danger">Stock request not found.</div>
//           <Link to="/stock-request" className="btn btn-secondary">
//             <ArrowLeft size={16} className="me-2" />Back
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   // ─────────────────────────────────────────────────────────────
//   //  Derived state
//   // ─────────────────────────────────────────────────────────────

//   const computedStatus = deriveStatus(request);
//   const statusCfg      = getStatusCfg(computedStatus);
//   const priorityCfg    = getPriorityCfg(request.priority);


//   const isSupplier  = request.is_supplier;
//   const isRecipient = request.is_recipient;


//   const canApprove =
//     isSupplier &&
//     ["Pending for Approval", "Followed Up for Approval", "Escalated Due to No Approval"].includes(
//       computedStatus
//     );

 
//   const canReceive =
//     isRecipient &&
//     request.stock_id !== null && 
//     request.delivered_at === null;

//   const totalQty = articles.reduce((s, a) => s + (Number(a.quantity) || 0), 0);


//   const ccEmails = Array.isArray(request.cc_recipients)
//     ? request.cc_recipients
//     : typeof request.cc_recipients === "string"
//     ? (() => {
//         try { return JSON.parse(request.cc_recipients); }
//         catch { return request.cc_recipients.split(",").map((e) => e.trim()); }
//       })()
//     : [];

//   // ─────────────────────────────────────────────────────────────
//   //  Render
//   // ─────────────────────────────────────────────────────────────

//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* ── Page header ── */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Stock Request Details</h4>
//               <h6>Complete request information</h6>
//             </div>
//           </div>
//           <div className="page-btn d-flex gap-2 flex-wrap">

//             {/* Supplier (Dispatcher): Approve button */}
//             {canApprove && (
//               <button
//                 className="btn btn-success"
//                 onClick={handleApprove}
//                 disabled={actionLoading}
//               >
//                 {actionLoading ? (
//                   <span className="spinner-border spinner-border-sm me-2" />
//                 ) : (
//                   <ThumbsUp size={16} className="me-2" />
//                 )}
//                 Approve Request
//               </button>
//             )}

//             {/* Recipient (Requester): Confirm Delivery button */}
//             {canReceive && (
//               <button
//                 className="btn btn-primary"
//                 onClick={handleMarkReceived}
//                 disabled={actionLoading}
//               >
//                 {actionLoading ? (
//                   <span className="spinner-border spinner-border-sm me-2" />
//                 ) : (
//                   <CheckCircle size={16} className="me-2" />
//                 )}
//                 Confirm Delivery
//               </button>
//             )}

//             <Link to="/stock-request" className="btn btn-secondary">
//               <ArrowLeft size={16} className="me-2" />Back
//             </Link>
//           </div>
//         </div>

//         {/* ── Status banner ── */}
//         <div className={`alert alert-${statusCfg.alertVariant} d-flex align-items-center mb-4`}>
//           <StatusIcon icon={statusCfg.icon} size={20} />
//           <div className="ms-3">
//             <h5 className="mb-1">
//               <span style={{ fontFamily: "monospace" }}>{request.req_id}</span>
//               <span className={`badge ${statusCfg.badge} ms-2`}>{computedStatus}</span>
//               <span className={`badge ${priorityCfg.badge} ms-2`} style={{ fontSize: 11 }}>
//                 {priorityCfg.label} Priority
//               </span>
//               {request.stock_id && (
//                 <span className="badge badge-primary ms-2" style={{ fontSize: 11 }}>
//                   Stock: {request.stock_id}
//                 </span>
//               )}
//             </h5>
//             <p className="mb-0 small text-muted">Created {fmtDate(request.created_at)}</p>
//           </div>
//         </div>

//         {/* ── Role indicator ── */}
//         {(isRecipient || isSupplier) && (
//           <div className="alert alert-light py-2 mb-3 d-flex align-items-center gap-2">
//             <User size={15} />
//             <span className="small">
//               You are the{" "}
//               <strong>{isRecipient ? "Recipient" : "Supplier"}</strong>
//               {" "}on this request.
//             </span>
//           </div>
//         )}

//         {/* ── Info row ── */}
//         <div className="row">

//           {/* Route card */}
//           <div className="col-lg-6 col-md-12">
//             <div className="card mb-4">
//               <div className="card-body">
//                 <h5 className="mb-4">
//                   <MapPin size={18} className="me-2" />Route
//                 </h5>

//                 <label className="form-label text-muted small">Requested By (Recipient)</label>
//                 <div className="alert alert-light mb-3 py-2 d-flex align-items-center gap-2">
//                   <User size={16} className="text-danger flex-shrink-0" />
//                   <div>
//                     {/* Backend fields: recipient_name, destination */}
//                     <strong>{request.recipient_name || "—"}</strong>
//                     <div className="text-muted small">{request.destination || "—"}</div>
//                   </div>
//                 </div>

//                 <div className="text-center my-2">
//                   <Send size={20} className="text-primary" />
//                 </div>

//                 <label className="form-label text-muted small">Dispatched By (Supplier)</label>
//                 <div className="alert alert-light mb-0 py-2 d-flex align-items-center gap-2">
//                   <Truck size={16} className="text-success flex-shrink-0" />
//                   <div>
//                     {/* Backend fields: supplier_name, source */}
//                     <strong>{request.supplier_name || "—"}</strong>
//                     <div className="text-muted small">{request.source || "—"}</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Details card */}
//           <div className="col-lg-6 col-md-12">
//             <div className="card mb-4">
//               <div className="card-body">
//                 <h5 className="mb-4">
//                   <FileText size={18} className="me-2" />Details
//                 </h5>

//                 <div className="row mb-3">
//                   <div className="col-6">
//                     <p className="text-muted small mb-1">Priority</p>
//                     <span className={`badge ${priorityCfg.badge}`}>{priorityCfg.label}</span>
//                   </div>
//                   <div className="col-6">
//                     <p className="text-muted small mb-1">Status</p>
//                     <span className={`badge ${statusCfg.badge}`}>{computedStatus}</span>
//                   </div>
//                 </div>

//                 <div className="row mb-3">
//                   <div className="col-6">
//                     <p className="text-muted small mb-1">Articles</p>
//                     <strong>{articles.length} item{articles.length !== 1 ? "s" : ""}</strong>
//                   </div>
//                   <div className="col-6">
//                     <p className="text-muted small mb-1">Total Quantity</p>
//                     <strong className="text-primary" style={{ fontSize: "1.1rem" }}>{totalQty}</strong>
//                   </div>
//                 </div>

//                 {/* Scheduled dispatch */}
//                 {request.scheduled_dispatch && (
//                   <div className="mb-3">
//                     <p className="text-muted small mb-1">
//                       <Calendar size={13} className="me-1" />Scheduled Dispatch
//                     </p>
//                     <strong>{fmtDate(request.scheduled_dispatch)}</strong>
//                   </div>
//                 )}

//                 {/* Automation flags */}
//                 <div className="row mb-3">
//                   {request.follow_up_enabled !== undefined && (
//                     <div className="col-6">
//                       <p className="text-muted small mb-1">Follow-up</p>
//                       <span className={`badge ${request.follow_up_enabled ? "badge-linesuccess" : "badge-secondary"}`}>
//                         {request.follow_up_enabled ? `${request.follow_up_days}d` : "Off"}
//                       </span>
//                       {request.follow_up_sent_at && (
//                         <div className="text-muted" style={{ fontSize: 11 }}>
//                           Sent {fmtDate(request.follow_up_sent_at)}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                   {request.escalation_enabled !== undefined && (
//                     <div className="col-6">
//                       <p className="text-muted small mb-1">Escalation</p>
//                       <span className={`badge ${request.escalation_enabled ? "badge-linewarning" : "badge-secondary"}`}>
//                         {request.escalation_enabled ? `${request.escalation_days}d` : "Off"}
//                       </span>
//                       {request.escalated_at && (
//                         <div className="text-muted" style={{ fontSize: 11 }}>
//                           Escalated {fmtDate(request.escalated_at)}
//                         </div>
//                       )}
//                     </div>
//                   )}
//                 </div>

//                 {/* CC emails */}
//                 {ccEmails.length > 0 && (
//                   <div className="mb-3">
//                     <p className="text-muted small mb-1">
//                       <Mail size={13} className="me-1" />CC Recipients
//                     </p>
//                     <div className="d-flex gap-1 flex-wrap">
//                       {ccEmails.map((email) => (
//                         <span key={email} className="badge badge-lineinfo" style={{textTransform:"none" , fontSize: 11 }}>
//                           {email}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {request.description && (
//                   <div>
//                     <p className="text-muted small mb-1">Description / Notes</p>
//                     <p className="mb-0">{request.description}</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Approval info ── */}
//         {request.approved_at && (
//           <div className="card mb-4">
//             <div className="card-body">
//               <h5 className="mb-4">
//                 <ThumbsUp size={18} className="me-2 text-success" />
//                 Approval Information
//               </h5>
//               <div className="row">
//                 <div className="col-md-4 mb-3">
//                   <p className="text-muted small mb-1">Approved At</p>
//                   <p className="mb-0">
//                     <Calendar size={14} className="me-1" />
//                     {fmtDate(request.approved_at)}
//                   </p>
//                 </div>
//                 {request.scheduled_dispatch && (
//                   <div className="col-md-4 mb-3">
//                     <p className="text-muted small mb-1">Scheduled Dispatch</p>
//                     <p className="mb-0">
//                       <Truck size={14} className="me-1" />
//                       {fmtDate(request.scheduled_dispatch)}
//                     </p>
//                   </div>
//                 )}
//                 {request.stock_id && (
//                   <div className="col-md-4 mb-3">
//                     <p className="text-muted small mb-1">Linked Stock Flow</p>
//                     <span className="badge badge-primary" style={{ fontFamily: "monospace" }}>
//                       {request.stock_id}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Delivery confirmation ── */}
//         {request.delivered_at && (
//           <div className="card mb-4">
//             <div className="card-body">
//               <h5 className="mb-4">
//                 <CheckCircle size={18} className="me-2 text-success" />
//                 Delivery Confirmation
//               </h5>
//               <div className="row">
//                 <div className="col-md-4 mb-3">
//                   <p className="text-muted small mb-1">Delivered At</p>
//                   <p className="mb-0">
//                     <Calendar size={14} className="me-1" />
//                     {fmtDate(request.delivered_at)}
//                   </p>
//                 </div>
//                 {request.grn_timestamp && (
//                   <div className="col-md-4 mb-3">
//                     <p className="text-muted small mb-1">GRN Timestamp</p>
//                     <p className="mb-0">
//                       <Calendar size={14} className="me-1" />
//                       {fmtDate(request.grn_timestamp)}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Articles table ── */}
//         {/* requested_articles: [{ article_profile_id, article_profile_name, quantity }] */}
//         <div className="card mb-4">
//           <div className="card-body">
//             <div className="d-flex align-items-center justify-content-between mb-3">
//               <h5 className="mb-0">
//                 <Package size={18} className="me-2" />
//                 Requested Articles ({articles.length})
//                 {totalQty > 0 && (
//                   <span className="badge badge-primary ms-2">Total Qty: {totalQty}</span>
//                 )}
//               </h5>
//             </div>

//             {articles.length === 0 ? (
//               <div className="alert alert-info d-flex align-items-center">
//                 <AlertCircle size={16} className="me-2" />
//                 No articles found in this request.
//               </div>
//             ) : (
//               <div className="table-responsive">
//                 <table className="table table-hover align-middle">
//                   <thead className="table-light">
//                     <tr>
//                       <th style={{ width: 40 }}>#</th>
//                       <th>Article</th>
//                       {/* <th>Article ID</th> */}
//                       <th>Quantity Requested</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {articles.map((art, i) => (
//                       <tr key={art.article_profile_id || i}>
//                         <td className="text-muted small">{i + 1}</td>
//                         <td>
//                           <div className="fw-semibold">
//                             {art.article_profile_name || art.article_name || art.name || "—"}
//                           </div>
//                         </td>
//                         {/* <td>
//                           {art.article_profile_id ? (
//                             <span
//                               className="badge badge-primary"
//                               style={{ fontFamily: "monospace", fontSize: 10 }}
//                             >
//                               {art.article_profile_id.slice(0, 8)}…
//                             </span>
//                           ) : "—"}
//                         </td> */}
//                         <td>
//                           <span className="badge badge-info">
//                             <Package size={12} className="me-1" />
//                             {art.quantity ?? "—"}
//                           </span>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Timeline ── */}
//         <div className="card">
//           <div className="card-body">
//             <h5 className="mb-4">
//               <Clock size={18} className="me-2" />Timeline
//             </h5>

//             <div className="timeline">

//               {/* Created */}
//               <div className="timeline-item d-flex align-items-start mb-3">
//                 <div
//                   className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
//                   style={{ width: 32, height: 32 }}
//                 >
//                   <Send size={14} />
//                 </div>
//                 <div>
//                   <h6 className="mb-1">Request Created</h6>
//                   <p className="text-muted mb-0 small">
//                     Submitted by {request.recipient_name || "requester"}
//                     {request.created_at ? ` · ${fmtDate(request.created_at)}` : ""}
//                   </p>
//                 </div>
//               </div>

//               {/* Follow-up sent */}
//               {request.follow_up_sent_at && (
//                 <div className="timeline-item d-flex align-items-start mb-3">
//                   <div
//                     className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-info text-white flex-shrink-0"
//                     style={{ width: 32, height: 32 }}
//                   >
//                     <Mail size={14} />
//                   </div>
//                   <div>
//                     <h6 className="mb-1">Follow-up Sent</h6>
//                     <p className="text-muted mb-0 small">
//                       Automatic follow-up reminder sent · {fmtDate(request.follow_up_sent_at)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Escalated */}
//               {request.escalated_at && (
//                 <div className="timeline-item d-flex align-items-start mb-3">
//                   <div
//                     className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-danger text-white flex-shrink-0"
//                     style={{ width: 32, height: 32 }}
//                   >
//                     <AlertCircle size={14} />
//                   </div>
//                   <div>
//                     <h6 className="mb-1">Escalated</h6>
//                     <p className="text-muted mb-0 small">
//                       Request escalated due to no response · {fmtDate(request.escalated_at)}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Approved */}
//               {request.approved_at && (
//                 <div className="timeline-item d-flex align-items-start mb-3">
//                   <div
//                     className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
//                     style={{ width: 32, height: 32 }}
//                   >
//                     <ThumbsUp size={14} />
//                   </div>
//                   <div>
//                     <h6 className="mb-1">Approved</h6>
//                     <p className="text-muted mb-0 small">
//                       Approved by {request.supplier_name || "supplier"}
//                       {" · "}{fmtDate(request.approved_at)}
//                       {request.scheduled_dispatch
//                         ? ` · Dispatch by ${fmtDate(request.scheduled_dispatch)}`
//                         : ""}
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Linked to StockFlow */}
//               {request.stock_id && (
//                 <div className="timeline-item d-flex align-items-start mb-3">
//                   <div
//                     className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-warning text-white flex-shrink-0"
//                     style={{ width: 32, height: 32 }}
//                   >
//                     <Truck size={14} />
//                   </div>
//                   <div>
//                     <h6 className="mb-1">Stock Flow Created</h6>
//                     <p className="text-muted mb-0 small">
//                       Linked to stock flow{" "}
//                       <span className="badge badge-primary" style={{ fontFamily: "monospace" }}>
//                         {request.stock_id}
//                       </span>
//                     </p>
//                   </div>
//                 </div>
//               )}

//               {/* Delivered */}
//               {request.delivered_at ? (
//                 <div className="timeline-item d-flex align-items-start mb-3">
//                   <div
//                     className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
//                     style={{ width: 32, height: 32 }}
//                   >
//                     <CheckCircle size={14} />
//                   </div>
//                   <div>
//                     <h6 className="mb-1">Delivered</h6>
//                     <p className="text-muted mb-0 small">
//                       Delivery confirmed by {request.recipient_name || "recipients"}
//                       {" · "}{fmtDate(request.delivered_at)}
//                     </p>
//                   </div>
//                 </div>
//               ) : (
//                 <div className="timeline-item d-flex align-items-start">
//                   <div
//                     className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle border flex-shrink-0"
//                     style={{ width: 32, height: 32, borderStyle: "dashed" }}
//                   >
//                     <Package size={14} className="text-muted" />
//                   </div>
//                   <div>
//                     <h6 className="mb-1 text-muted">Awaiting Delivery</h6>
//                     <p className="text-muted mb-0 small">
//                       Pending confirmation from recipients
//                     </p>
//                   </div>
//                 </div>
//               )}
//             </div>

//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default StockRequestDetails;




import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  ArrowLeft, Package, Truck, MapPin, Calendar,
  User, FileText, CheckCircle, Clock, AlertCircle,
  Send, ThumbsUp, Mail,
} from "feather-icons-react/build/IconComponents";
import AuthService from "../../services/authService";

const MySwal = withReactContent(Swal);

// ─────────────────────────────────────────────────────────────
//  Config helpers
// ─────────────────────────────────────────────────────────────

const PRIORITY_CFG = {
  urgent:   { color: "#dc3545", badge: "badge-linedanger",  label: "Urgent"   },
  standard: { color: "#fd7e14", badge: "badge-linewarning", label: "Standard" },
  low:      { color: "#198754", badge: "badge-linesuccess", label: "Low"      },
};

const STATUS_CFG = {
  "Pending for Approval":           { badge: "badge-linewarning", alertVariant: "warning", icon: "clock"  },
  "Followed Up for Approval":       { badge: "badge-lineinfo",    alertVariant: "info",    icon: "clock"  },
  "Escalated Due to No Approval":   { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert"  },
  "Scheduled":                      { badge: "badge-linesuccess", alertVariant: "success", icon: "check"  },
  "Shipping Deadline Approaching":  { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert"  },
  "In Transit":                     { badge: "badge-lineinfo",    alertVariant: "info",    icon: "truck"  },
  "Delivered":                      { badge: "badge-linesuccess", alertVariant: "success", icon: "check"  },
  "Resolution required":            { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert"  },
};

const getPriorityCfg = (key) =>
  PRIORITY_CFG[(key || "").toLowerCase()] ||
  { color: "#6c757d", badge: "badge-secondary", label: key || "—" };

const getStatusCfg = (key) =>
  STATUS_CFG[key] ||
  { badge: "badge-secondary", alertVariant: "secondary", icon: "clock" };

const fmtDate = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

// ─────────────────────────────────────────────────────────────
//  Sub-components
// ─────────────────────────────────────────────────────────────

const StatusIcon = ({ icon, size = 16 }) => {
  if (icon === "truck") return <Truck size={size} />;
  if (icon === "check") return <CheckCircle size={size} />;
  if (icon === "alert") return <AlertCircle size={size} />;
  return <Clock size={size} />;
};
StatusIcon.propTypes = { icon: PropTypes.string, size: PropTypes.number };

// ─────────────────────────────────────────────────────────────
//  Main component
// ─────────────────────────────────────────────────────────────

const StockRequestDetails = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [request,       setRequest]       = useState(null);
  const [articles,      setArticles]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = useCallback(async () => {
    try {
      setLoading(true);
      const res  = await AuthService.getStockRequestById(id);
      const data = res.data.data;
      setRequest(data);
      setArticles(Array.isArray(data.requested_articles) ? data.requested_articles : []);
    } catch (err) {
      console.error("fetchDetails:", err);
      MySwal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to load stock request details",
        timer: 2500,
      }).then(() => navigate("/stock-request"));
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  // ─────────────────────────────────────────────────────────────
  //  deriveStatus — driven entirely by timestamp/boolean fields
  //  from getStockRequestById response.
  //
  //  Priority (highest → lowest):
  //   1. delivered_at set                          → "Delivered"
  //   2. resolution_required_at set                → "Resolution required"
  //   3. stock_id + submitted_at both set          → "In Transit"
  //      (stock has been created & submitted)
  //   4. approved_at set + deadline_notice_at set  → "Shipping Deadline Approaching"
  //   5. approved_at set (no stock yet)            → "Scheduled"
  //   6. escalated_at set (no approval)            → "Escalated Due to No Approval"
  //   7. follow_up_sent_at set (no approval)       → "Followed Up for Approval"
  //   8. default                                   → "Pending for Approval"
  // ─────────────────────────────────────────────────────────────
  const deriveStatus = (req) => {
    if (!req) return "—";

    if (req.delivered_at !== null && req.delivered_at !== undefined)
      return "Delivered";

    if (req.resolution_required_at !== null && req.resolution_required_at !== undefined)
      return "Resolution required";

 
    if (req.stock_id !== null && req.stock_id !== undefined &&
        req.submitted_at !== null && req.submitted_at !== undefined)
      return "In Transit";

    if (req.approved_at !== null && req.approved_at !== undefined) {
      if (req.deadline_notice_at !== null && req.deadline_notice_at !== undefined)
        return "Shipping Deadline Approaching";
      // approved but stock not yet submitted → scheduled for dispatch
      return "Scheduled";
    }

    if (req.escalation_enabled &&
        req.escalated_at !== null && req.escalated_at !== undefined)
      return "Escalated Due to No Approval";

    if (req.follow_up_enabled &&
        req.follow_up_sent_at !== null && req.follow_up_sent_at !== undefined)
      return "Followed Up for Approval";

    return "Pending for Approval";
  };

  // ─────────────────────────────────────────────────────────────
  //  Action handlers
  // ─────────────────────────────────────────────────────────────

  const handleApprove = async () => {
    const { value: totalDays, isConfirmed } = await MySwal.fire({
      title: "Approve Stock Request",
      html: `
        <p class="text-muted small mb-3">
          Enter the number of days until scheduled dispatch.
        </p>
        <div class="d-flex align-items-center justify-content-center gap-2">
          <label class="form-label mb-0 fw-semibold">Dispatch in</label>
          <input
            id="swal-days"
            type="number"
            class="swal2-input"
            placeholder="e.g. 3"
            min="1"
            max="50"
            value="3"
            style="width: 100px; margin: 0;"
          />
          <span class="fw-semibold">days</span>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#198754",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const val = parseInt(document.getElementById("swal-days")?.value);
        if (!val || val < 1 || val > 50) {
          Swal.showValidationMessage("Enter a number between 1 and 50");
          return false;
        }
        return val;
      },
    });

    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      await AuthService.approveStockRequest(id, { total_days: totalDays });
      MySwal.fire({
        icon: "success", title: "Approved!",
        text: `Request approved. Scheduled dispatch in ${totalDays} day(s).`,
        timer: 2500, showConfirmButton: false,
      });
      fetchDetails();
    } catch (err) {
      console.error("approveStockRequest:", err);
      MySwal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to approve request.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkReceived = async () => {
    const { isConfirmed } = await MySwal.fire({
      title: "Confirm Stock Receipt",
      html: `
        <p class="text-muted small mb-2">
          Confirm that the stock has been physically received at your warehouse.
        </p>
        <div class="alert alert-info py-2 small mb-0">
          This action cannot be undone. Make sure all items have arrived before confirming.
        </div>
      `,
      icon: "info",
      showCancelButton: true,
      confirmButtonText: "Confirm Receipt",
      confirmButtonColor: "#0d6efd",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      await AuthService.markStockRequestReceived(id);
      MySwal.fire({
        icon: "success", title: "Received!",
        text: "Stock delivery confirmed successfully.",
        timer: 2500, showConfirmButton: false,
      });
      fetchDetails();
    } catch (err) {
      console.error("markStockRequestReceived:", err);
      MySwal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to confirm delivery.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Loading / not-found guards
  // ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" />
            <p>Loading stock request details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">Stock request not found.</div>
          <Link to="/stock-request" className="btn btn-secondary">
            <ArrowLeft size={16} className="me-2" />Back
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  Derived state
  // ─────────────────────────────────────────────────────────────

  const computedStatus = deriveStatus(request);
  const statusCfg      = getStatusCfg(computedStatus);
  const priorityCfg    = getPriorityCfg(request.priority);

  const isSupplier  = request.is_supplier  === true;
  const isRecipient = request.is_recipient === true;

  // Supplier can approve while request is still awaiting approval
  const canApprove =
    isSupplier &&
    ["Pending for Approval", "Followed Up for Approval", "Escalated Due to No Approval"].includes(
      computedStatus
    );

  // Recipient can confirm delivery only when:
  //   • stock has been created AND submitted (both stock_id + submitted_at are set)
  //   • delivery not yet confirmed (delivered_at is null)
  const canReceive =
    isRecipient &&
    request.stock_id    !== null && request.stock_id    !== undefined &&
    request.submitted_at !== null && request.submitted_at !== undefined &&
    (request.delivered_at === null || request.delivered_at === undefined);

  const totalQty = articles.reduce((s, a) => s + (Number(a.quantity) || 0), 0);

  const ccEmails = Array.isArray(request.cc_recipients)
    ? request.cc_recipients
    : typeof request.cc_recipients === "string"
    ? (() => {
        try { return JSON.parse(request.cc_recipients); }
        catch { return request.cc_recipients.split(",").map((e) => e.trim()); }
      })()
    : [];

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="page-wrapper">
      <div className="content">

        {/* ── Page header ── */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Stock Request Details</h4>
              <h6>Complete request information</h6>
            </div>
          </div>
          <div className="page-btn d-flex gap-2 flex-wrap">

            {canApprove && (
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <span className="spinner-border spinner-border-sm me-2" />
                  : <ThumbsUp size={16} className="me-2" />}
                Approve Request
              </button>
            )}

            {/* Confirm Delivery — only when stock_id + submitted_at are both present */}
            {canReceive && (
              <button
                className="btn btn-primary"
                onClick={handleMarkReceived}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <span className="spinner-border spinner-border-sm me-2" />
                  : <CheckCircle size={16} className="me-2" />}
                Confirm Delivery
              </button>
            )}

            <Link to="/stock-request" className="btn btn-secondary">
              <ArrowLeft size={16} className="me-2" />Back
            </Link>
          </div>
        </div>

        {/* ── Status banner ── */}
        <div className={`alert alert-${statusCfg.alertVariant} d-flex align-items-center mb-4`}>
          <StatusIcon icon={statusCfg.icon} size={20} />
          <div className="ms-3">
            <h5 className="mb-1">
              <span style={{ fontFamily: "monospace" }}>{request.req_id}</span>
              <span className={`badge ${statusCfg.badge} ms-2`}>{computedStatus}</span>
              <span className={`badge ${priorityCfg.badge} ms-2`} style={{ fontSize: 11 }}>
                {priorityCfg.label} Priority
              </span>
              {request.stock_id && (
                <span className="badge badge-primary ms-2" style={{ fontSize: 11 }}>
                  Stock: {request.stock_id}
                </span>
              )}
            </h5>
            <p className="mb-0 small text-muted">Created {fmtDate(request.created_at)}</p>
          </div>
        </div>

        {/* ── Role indicator ── */}
        {(isRecipient || isSupplier) && (
          <div className="alert alert-light py-2 mb-3 d-flex align-items-center gap-2">
            <User size={15} />
            <span className="small">
              You are the{" "}
              <strong>{isRecipient ? "Recipient" : "Supplier"}</strong>
              {" "}on this request.
            </span>
          </div>
        )}

        {/* ── Info row ── */}
        <div className="row">

          {/* Route card */}
          <div className="col-lg-6 col-md-12">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-4">
                  <MapPin size={18} className="me-2" />Route
                </h5>

                <label className="form-label text-muted small">Requested By (Recipient)</label>
                <div className="alert alert-light mb-3 py-2 d-flex align-items-center gap-2">
                  <User size={16} className="text-danger flex-shrink-0" />
                  <div>
                    <strong>{request.recipient_name || "—"}</strong>
                    <div className="text-muted small">{request.destination || "—"}</div>
                  </div>
                </div>

                <div className="text-center my-2">
                  <Send size={20} className="text-primary" />
                </div>

                <label className="form-label text-muted small">Dispatched By (Supplier)</label>
                <div className="alert alert-light mb-0 py-2 d-flex align-items-center gap-2">
                  <Truck size={16} className="text-success flex-shrink-0" />
                  <div>
                    <strong>{request.supplier_name || "—"}</strong>
                    <div className="text-muted small">{request.source || "—"}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Details card */}
          <div className="col-lg-6 col-md-12">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-4">
                  <FileText size={18} className="me-2" />Details
                </h5>

                <div className="row mb-3">
                  <div className="col-6">
                    <p className="text-muted small mb-1">Priority</p>
                    <span className={`badge ${priorityCfg.badge}`}>{priorityCfg.label}</span>
                  </div>
                  <div className="col-6">
                    <p className="text-muted small mb-1">Status</p>
                    <span className={`badge ${statusCfg.badge}`}>{computedStatus}</span>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <p className="text-muted small mb-1">Articles</p>
                    <strong>{articles.length} item{articles.length !== 1 ? "s" : ""}</strong>
                  </div>
                  <div className="col-6">
                    <p className="text-muted small mb-1">Total Quantity</p>
                    <strong className="text-primary" style={{ fontSize: "1.1rem" }}>{totalQty}</strong>
                  </div>
                </div>

                {request.scheduled_dispatch && (
                  <div className="mb-3">
                    <p className="text-muted small mb-1">
                      <Calendar size={13} className="me-1" />Scheduled Dispatch
                    </p>
                    <strong>{fmtDate(request.scheduled_dispatch)}</strong>
                  </div>
                )}

                <div className="row mb-3">
                  {request.follow_up_enabled !== undefined && (
                    <div className="col-6">
                      <p className="text-muted small mb-1">Follow-up</p>
                      <span className={`badge ${request.follow_up_enabled ? "badge-linesuccess" : "badge-secondary"}`}>
                        {request.follow_up_enabled ? `${request.follow_up_days}d` : "Off"}
                      </span>
                      {request.follow_up_sent_at && (
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          Sent {fmtDate(request.follow_up_sent_at)}
                        </div>
                      )}
                    </div>
                  )}
                  {request.escalation_enabled !== undefined && (
                    <div className="col-6">
                      <p className="text-muted small mb-1">Escalation</p>
                      <span className={`badge ${request.escalation_enabled ? "badge-linewarning" : "badge-secondary"}`}>
                        {request.escalation_enabled ? `${request.escalation_days}d` : "Off"}
                      </span>
                      {request.escalated_at && (
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          Escalated {fmtDate(request.escalated_at)}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {ccEmails.length > 0 && (
                  <div className="mb-3">
                    <p className="text-muted small mb-1">
                      <Mail size={13} className="me-1" />CC Recipients
                    </p>
                    <div className="d-flex gap-1 flex-wrap">
                      {ccEmails.map((email) => (
                        <span key={email} className="badge badge-lineinfo" style={{ textTransform: "none", fontSize: 11 }}>
                          {email}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {request.description && (
                  <div>
                    <p className="text-muted small mb-1">Description / Notes</p>
                    <p className="mb-0">{request.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Approval info ── */}
        {request.approved_at && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-4">
                <ThumbsUp size={18} className="me-2 text-success" />
                Approval Information
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <p className="text-muted small mb-1">Approved At</p>
                  <p className="mb-0">
                    <Calendar size={14} className="me-1" />
                    {fmtDate(request.approved_at)}
                  </p>
                </div>
                {request.scheduled_dispatch && (
                  <div className="col-md-4 mb-3">
                    <p className="text-muted small mb-1">Scheduled Dispatch</p>
                    <p className="mb-0">
                      <Truck size={14} className="me-1" />
                      {fmtDate(request.scheduled_dispatch)}
                    </p>
                  </div>
                )}
                {request.stock_id && (
                  <div className="col-md-4 mb-3">
                    <p className="text-muted small mb-1">Linked Stock Flow</p>
                    <span className="badge badge-primary" style={{ fontFamily: "monospace" }}>
                      {request.stock_id}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Delivery confirmation ── */}
        {request.delivered_at && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-4">
                <CheckCircle size={18} className="me-2 text-success" />
                Delivery Confirmation
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <p className="text-muted small mb-1">Delivered At</p>
                  <p className="mb-0">
                    <Calendar size={14} className="me-1" />
                    {fmtDate(request.delivered_at)}
                  </p>
                </div>
                {request.grn_timestamp && (
                  <div className="col-md-4 mb-3">
                    <p className="text-muted small mb-1">GRN Timestamp</p>
                    <p className="mb-0">
                      <Calendar size={14} className="me-1" />
                      {fmtDate(request.grn_timestamp)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Articles table ── */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">
                <Package size={18} className="me-2" />
                Requested Articles ({articles.length})
                {totalQty > 0 && (
                  <span className="badge badge-primary ms-2">Total Qty: {totalQty}</span>
                )}
              </h5>
            </div>

            {articles.length === 0 ? (
              <div className="alert alert-info d-flex align-items-center">
                <AlertCircle size={16} className="me-2" />
                No articles found in this request.
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 40 }}>#</th>
                      <th>Article</th>
                      <th>Quantity Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((art, i) => (
                      <tr key={art.article_profile_id || i}>
                        <td className="text-muted small">{i + 1}</td>
                        <td>
                          <div className="fw-semibold">
                            {art.article_profile_name || art.article_name || art.name || "—"}
                          </div>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            <Package size={12} className="me-1" />
                            {art.quantity ?? "—"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* ── Timeline ── */}
        <div className="card">
          <div className="card-body">
            <h5 className="mb-4">
              <Clock size={18} className="me-2" />Timeline
            </h5>

            <div className="timeline">

              <div className="timeline-item d-flex align-items-start mb-3">
                <div
                  className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
                  style={{ width: 32, height: 32 }}
                >
                  <Send size={14} />
                </div>
                <div>
                  <h6 className="mb-1">Request Created</h6>
                  <p className="text-muted mb-0 small">
                    Submitted by {request.recipient_name || "requester"}
                    {request.created_at ? ` · ${fmtDate(request.created_at)}` : ""}
                  </p>
                </div>
              </div>

              {request.follow_up_sent_at && (
                <div className="timeline-item d-flex align-items-start mb-3">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-info text-white flex-shrink-0"
                    style={{ width: 32, height: 32 }}
                  >
                    <Mail size={14} />
                  </div>
                  <div>
                    <h6 className="mb-1">Follow-up Sent</h6>
                    <p className="text-muted mb-0 small">
                      Automatic follow-up reminder sent · {fmtDate(request.follow_up_sent_at)}
                    </p>
                  </div>
                </div>
              )}

              {request.escalated_at && (
                <div className="timeline-item d-flex align-items-start mb-3">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-danger text-white flex-shrink-0"
                    style={{ width: 32, height: 32 }}
                  >
                    <AlertCircle size={14} />
                  </div>
                  <div>
                    <h6 className="mb-1">Escalated</h6>
                    <p className="text-muted mb-0 small">
                      Request escalated due to no response · {fmtDate(request.escalated_at)}
                    </p>
                  </div>
                </div>
              )}

              {request.approved_at && (
                <div className="timeline-item d-flex align-items-start mb-3">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
                    style={{ width: 32, height: 32 }}
                  >
                    <ThumbsUp size={14} />
                  </div>
                  <div>
                    <h6 className="mb-1">Approved</h6>
                    <p className="text-muted mb-0 small">
                      Approved by {request.supplier_name || "supplier"}
                      {" · "}{fmtDate(request.approved_at)}
                      {request.scheduled_dispatch
                        ? ` · Dispatch by ${fmtDate(request.scheduled_dispatch)}`
                        : ""}
                    </p>
                  </div>
                </div>
              )}

              {/* Stock flow linked — appears once stock_id is set */}
              {request.stock_id && (
                <div className="timeline-item d-flex align-items-start mb-3">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-warning text-white flex-shrink-0"
                    style={{ width: 32, height: 32 }}
                  >
                    <Package size={14} />
                  </div>
                  <div>
                    <h6 className="mb-1">Stock Flow Created</h6>
                    <p className="text-muted mb-0 small">
                      Linked to stock flow{" "}
                      <span className="badge badge-primary" style={{ fontFamily: "monospace" }}>
                        {request.stock_id}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* In Transit — appears once submitted_at is also set */}
              {request.stock_id && request.submitted_at && (
                <div className="timeline-item d-flex align-items-start mb-3">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-info text-white flex-shrink-0"
                    style={{ width: 32, height: 32 }}
                  >
                    <Truck size={14} />
                  </div>
                  <div>
                    <h6 className="mb-1">In Transit</h6>
                    <p className="text-muted mb-0 small">
                      Stock dispatched · {fmtDate(request.submitted_at)}
                    </p>
                  </div>
                </div>
              )}

              {request.delivered_at ? (
                <div className="timeline-item d-flex align-items-start mb-3">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
                    style={{ width: 32, height: 32 }}
                  >
                    <CheckCircle size={14} />
                  </div>
                  <div>
                    <h6 className="mb-1">Delivered</h6>
                    <p className="text-muted mb-0 small">
                      Delivery confirmed by {request.recipient_name || "recipient"}
                      {" · "}{fmtDate(request.delivered_at)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="timeline-item d-flex align-items-start">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle border flex-shrink-0"
                    style={{ width: 32, height: 32, borderStyle: "dashed" }}
                  >
                    <Package size={14} className="text-muted" />
                  </div>
                  <div>
                    <h6 className="mb-1 text-muted">Awaiting Delivery</h6>
                    <p className="text-muted mb-0 small">Pending confirmation from recipient</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockRequestDetails;