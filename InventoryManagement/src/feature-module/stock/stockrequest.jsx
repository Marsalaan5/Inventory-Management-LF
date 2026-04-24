// // components/StockRequest/StockRequest.jsx
// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback } from "react";
// import { Link } from "react-router-dom";
// import Select from "react-select";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
// import AuthService from "../../services/authService";


// // 
// // ─── Priority config ──────────────────────────────────────────────────────────
// const PRIORITY_CONFIG = {
//   urgent:   { label: "Urgent",   color: "#dc3545", bg: "#fff5f5", badge: "bg-danger"  },
//   standard: { label: "Standard", color: "#fd7e14", bg: "#fff8f0", badge: "bg-warning text-dark" },
//   low:      { label: "Low",      color: "#198754", bg: "#f0fff4", badge: "bg-success"  },
// };

// const TEMPLATE_COLORS = {
//   stock_request_created:  { badge: "bg-info",    icon: "fas fa-paper-plane", label: "Request Sent"   },
//   stock_request_approved: { badge: "bg-success", icon: "fas fa-check-circle", label: "Approved"      },
//   stock_request_rejected: { badge: "bg-danger",  icon: "fas fa-times-circle", label: "Rejected"      },
// };

// // ─── Helper ───────────────────────────────────────────────────────────────────
// const fmt = (dt) => dt ? new Date(dt).toLocaleString() : "—";
// const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString(undefined, { year:"numeric", month:"short", day:"numeric" }) : "—";

// // ─── COMPOSE FORM ─────────────────────────────────────────────────────────────
// const ComposeForm = ({ onClose, onSent, articleOptions }) => {
//   const [form, setForm] = useState({
//     dispatcher_email: "",
//     priority: "standard",
//     notes: "",
//     follow_up_enabled: true,
//     follow_up_days: 2,
//     escalation_enabled: false,
//     escalation_days: 3,
//     escalation_email: "",
//     items: [{ prod_uuid: "", partial_code: "", article_profile_name: "", quantity: 1 }],
//   });
//   const [sending, setSending] = useState(false);

//   const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

//   const addItem = () =>
//     set("items", [...form.items, { prod_uuid: "", partial_code: "", article_profile_name: "", quantity: 1 }]);

//   const removeItem = (i) =>
//     set("items", form.items.filter((_, idx) => idx !== i));

//   const updateItem = (i, field, val) => {
//     const items = [...form.items];
//     items[i] = { ...items[i], [field]: val };
//     set("items", items);
//   };

//   const handleArticleSelect = (i, option) => {
//     const items = [...form.items];
//     items[i] = {
//       ...items[i],
//       prod_uuid: option?.value || "",
//       partial_code: option?.partial_code || "",
//       article_profile_name: option?.label || "",
//     };
//     set("items", items);
//   };

//   const handleSubmit = async () => {
//     if (!form.dispatcher_email) return alert("Dispatcher email is required");
//     const validItems = form.items.filter((i) => i.article_profile_name && i.quantity > 0);
//     if (!validItems.length) return alert("Add at least one article");
//     setSending(true);
//     try {
//       await AuthService.createStockRequest({ ...form, items: validItems });
//       onSent();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to send stock request");
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="card bg-white">
//       <div className="card-body">
//         {/* Header */}
//         <div className="d-flex align-items-center justify-content-between mb-4">
//           <div>
//             <h4 className="mb-0">New Stock Request</h4>
//             <small className="text-muted">Request articles from a dispatcher</small>
//           </div>
//           <button className="btn-close" onClick={onClose} />
//         </div>

//         {/* Dispatcher */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">Dispatcher Email <span className="text-danger">*</span></label>
//           <input
//             type="email"
//             className="form-control"
//             value={form.dispatcher_email}
//             onChange={(e) => set("dispatcher_email", e.target.value)}
//             placeholder="dispatcher@warehouse.com"
//           />
//         </div>

//         {/* Priority */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">Priority</label>
//           <div className="d-flex gap-2">
//             {Object.entries(PRIORITY_CONFIG).map(([key, cfg]) => (
//               <button
//                 key={key}
//                 type="button"
//                 className={`btn btn-sm ${form.priority === key ? cfg.badge + " text-white" : "btn-outline-secondary"}`}
//                 style={form.priority === key ? { borderColor: cfg.color } : {}}
//                 onClick={() => set("priority", key)}
//               >
//                 {cfg.label}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Articles */}
//         <div className="mb-3">
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <label className="form-label fw-semibold mb-0">Articles <span className="text-danger">*</span></label>
//             <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
//               <i className="fas fa-plus me-1" /> Add Row
//             </button>
//           </div>

//           <div className="table-responsive">
//             <table className="table table-bordered table-sm align-middle mb-0">
           
//               <tbody>
//                 {form.items.map((item, i) => (
//                   <tr key={i}>
//                     <td>
//                       <Select
//                         options={articleOptions}
//                         value={articleOptions.find((o) => o.value === item.prod_uuid) || null}
//                         onChange={(opt) => handleArticleSelect(i, opt)}
//                         placeholder="Select article…"
//                         isClearable
//                         isSearchable
//                         menuPortalTarget={document.body}
//                         styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//                       />
//                     </td>
                
//                     <td>
//                       <input
//                         type="number"
//                         className="form-control form-control-sm"
//                         min="1"
//                         value={item.quantity}
//                         onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
//                       />
//                     </td>
//                     <td>
//                       {form.items.length > 1 && (
//                         <button
//                           type="button"
//                           className="btn btn-sm btn-outline-danger"
//                           onClick={() => removeItem(i)}
//                         >
//                           <i className="fas fa-times" />
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Notes */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">Notes <span className="text-muted fw-normal">(optional)</span></label>
//           <textarea
//             className="form-control"
//             rows="3"
//             value={form.notes}
//             onChange={(e) => set("notes", e.target.value)}
//             placeholder="Any additional instructions…"
//           />
//         </div>

//         {/* Automation */}
//         <div className="mb-4">
//           <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: "11px", letterSpacing: ".5px" }}>
//             Automation
//           </h6>
//           <div className="row g-3">
//             {/* Follow-up */}
//             <div className="col-md-6">
//               <div className="border rounded p-3">
//                 <div className="form-check mb-0">
//                   <input
//                     className="form-check-input"
//                     type="checkbox"
//                     id="followUp"
//                     checked={form.follow_up_enabled}
//                     onChange={(e) => set("follow_up_enabled", e.target.checked)}
//                   />
//                   <label className="form-check-label fw-semibold" htmlFor="followUp">
//                     Follow-up reminder
//                   </label>
//                 </div>
//                 {form.follow_up_enabled && (
//                   <div className="mt-2 d-flex align-items-center gap-2">
//                     <span className="text-muted small">After</span>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm"
//                       style={{ width: 70 }}
//                       min="1"
//                       max="30"
//                       value={form.follow_up_days}
//                       onChange={(e) => set("follow_up_days", parseInt(e.target.value) || 1)}
//                     />
//                     <span className="text-muted small">days</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Escalation */}
//             <div className="col-md-6">
//               <div className="border rounded p-3">
//                 <div className="form-check mb-0">
//                   <input
//                     className="form-check-input"
//                     type="checkbox"
//                     id="escalation"
//                     checked={form.escalation_enabled}
//                     onChange={(e) => set("escalation_enabled", e.target.checked)}
//                   />
//                   <label className="form-check-label fw-semibold" htmlFor="escalation">
//                     Auto-escalation
//                   </label>
//                 </div>
//                 {form.escalation_enabled && (
//                   <div className="mt-2">
//                     <input
//                       type="email"
//                       className="form-control form-control-sm mb-2"
//                       placeholder="Escalation email"
//                       value={form.escalation_email}
//                       onChange={(e) => set("escalation_email", e.target.value)}
//                     />
//                     <div className="d-flex align-items-center gap-2">
//                       <span className="text-muted small">After</span>
//                       <input
//                         type="number"
//                         className="form-control form-control-sm"
//                         style={{ width: 70 }}
//                         min="1"
//                         max="30"
//                         value={form.escalation_days}
//                         onChange={(e) => set("escalation_days", parseInt(e.target.value) || 1)}
//                       />
//                       <span className="text-muted small">days</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="d-flex gap-2">
//           <button className="btn btn-primary" onClick={handleSubmit} disabled={sending}>
//             {sending ? (
//               <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
//             ) : (
//               <><i className="fas fa-paper-plane me-2" />Send Request</>
//             )}
//           </button>
//           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── RESPOND MODAL ────────────────────────────────────────────────────────────
// const RespondModal = ({ request, onClose, onResponded }) => {
//   const [action, setAction] = useState("approve");
//   const [scheduledDispatch, setScheduledDispatch] = useState("");
//   const [notes, setNotes] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   // Min date = today
//   const today = new Date().toISOString().split("T")[0];

//   const handleSubmit = async () => {
//     if (action === "approve" && !scheduledDispatch) {
//       return alert("Please set a scheduled dispatch date");
//     }
//     setSubmitting(true);
//     try {
//       await AuthService.respondToStockRequest(request.stock_req_id, {
//         action,
//         scheduled_dispatch: action === "approve" ? scheduledDispatch : undefined,
//         notes,
//       });
//       onResponded();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to respond");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const items = typeof request.requested_articles === "string"
//     ? JSON.parse(request.requested_articles)
//     : request.requested_articles || [];

//   return (
//     <div
//       className="modal fade show"
//       style={{ display: "block", background: "rgba(0,0,0,.55)" }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-dialog modal-lg modal-dialog-scrollable"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="modal-content">
//           <div className="modal-header">
//             <div>
//               <h5 className="modal-title">Respond to Stock Request</h5>
//               <small className="text-muted">{request.stock_req_id}</small>
//             </div>
//             <button className="btn-close" onClick={onClose} />
//           </div>
//           <div className="modal-body">
//             {/* Summary */}
//             <div className="d-flex gap-3 mb-3">
//               <div className="flex-fill border rounded p-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Requester</p>
//                 <p className="mb-0 fw-semibold">{request.requester_email || request.sender_email}</p>
//               </div>
//               <div className="flex-fill border rounded p-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Priority</p>
//                 <span className={`badge ${PRIORITY_CONFIG[request.priority]?.badge}`}>
//                   {PRIORITY_CONFIG[request.priority]?.label || request.priority}
//                 </span>
//               </div>
//               <div className="flex-fill border rounded p-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Requested</p>
//                 <p className="mb-0">{fmt(request.created_at)}</p>
//               </div>
//             </div>

//             {/* Articles */}
//             <div className="mb-3">
//               <p className="fw-semibold mb-2">Requested Articles</p>
//               <table className="table table-sm table-bordered mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>Article</th>
//                     <th>Code</th>
//                     <th className="text-center">Qty</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item, i) => (
//                     <tr key={i}>
//                       <td>{item.article_profile_name || item.productName || "—"}</td>
//                       <td><code>{item.partial_code || "—"}</code></td>
//                       <td className="text-center">{item.quantity || item.count}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Action selector */}
//             <div className="mb-3">
//               <p className="fw-semibold mb-2">Your Response</p>
//               <div className="d-flex gap-2 mb-3">
//                 <button
//                   type="button"
//                   className={`btn ${action === "approve" ? "btn-success" : "btn-outline-secondary"}`}
//                   onClick={() => setAction("approve")}
//                 >
//                   <i className="fas fa-check me-2" />Approve
//                 </button>
//                 <button
//                   type="button"
//                   className={`btn ${action === "reject" ? "btn-danger" : "btn-outline-secondary"}`}
//                   onClick={() => setAction("reject")}
//                 >
//                   <i className="fas fa-times me-2" />Reject
//                 </button>
//               </div>

//               {action === "approve" && (
//                 <div className="mb-3">
//                   <label className="form-label">Scheduled Dispatch Date <span className="text-danger">*</span></label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     style={{ maxWidth: 220 }}
//                     min={today}
//                     value={scheduledDispatch}
//                     onChange={(e) => setScheduledDispatch(e.target.value)}
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="form-label">
//                   {action === "approve" ? "Approval Notes" : "Rejection Reason"}{" "}
//                   <span className="text-muted fw-normal">(optional)</span>
//                 </label>
//                 <textarea
//                   className="form-control"
//                   rows="3"
//                   value={notes}
//                   onChange={(e) => setNotes(e.target.value)}
//                   placeholder={action === "approve" ? "Any instructions for dispatch…" : "Reason for rejection…"}
//                 />
//               </div>
//             </div>
//           </div>
//           <div className="modal-footer">
//             <button
//               className={`btn ${action === "approve" ? "btn-success" : "btn-danger"}`}
//               onClick={handleSubmit}
//               disabled={submitting}
//             >
//               {submitting ? (
//                 <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//               ) : (
//                 action === "approve" ? "Confirm Approval" : "Confirm Rejection"
//               )}
//             </button>
//             <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
// const DetailModal = ({ request, isDispatcher, onClose, onRespond }) => {
//   const items = typeof request.requested_articles === "string"
//     ? JSON.parse(request.requested_articles)
//     : request.requested_articles || [];

//   const pCfg = PRIORITY_CONFIG[request.priority] || {};
//   const tCfg = TEMPLATE_COLORS[request.template_type] || {};
//   const isPending = !request.approved_at;

//   return (
//     <div
//       className="modal fade show"
//       style={{ display: "block", background: "rgba(0,0,0,.55)" }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-dialog modal-lg modal-dialog-scrollable"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="modal-content">
//           <div
//             className="modal-header"
//             style={{ borderLeft: `4px solid ${pCfg.color || "#6c757d"}` }}
//           >
//             <div>
//               <h5 className="modal-title mb-0">{request.stock_req_id}</h5>
//               <div className="d-flex gap-2 mt-1">
//                 <span className={`badge ${pCfg.badge}`}>{pCfg.label}</span>
//                 {tCfg.badge && (
//                   <span className={`badge ${tCfg.badge}`}>
//                     <i className={`${tCfg.icon} me-1`} />{tCfg.label}
//                   </span>
//                 )}
//                 {request.stock_id && (
//                   <span className="badge bg-primary">
//                     <i className="fas fa-link me-1" />{request.stock_id}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <button className="btn-close" onClick={onClose} />
//           </div>

//           <div className="modal-body">
//             {/* Meta */}
//             <div className="row g-2 mb-3">
//               <div className="col-6 col-md-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>From</p>
//                 <p className="mb-0 small fw-semibold">{request.sender_email}</p>
//               </div>
//               <div className="col-6 col-md-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>To</p>
//                 <p className="mb-0 small fw-semibold">{request.receiver_email}</p>
//               </div>
//               <div className="col-6 col-md-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Created</p>
//                 <p className="mb-0 small">{fmt(request.created_at)}</p>
//               </div>
//               <div className="col-6 col-md-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
//                   {request.approved_at ? "Approved" : "Status"}
//                 </p>
//                 <p className="mb-0 small">
//                   {request.approved_at ? fmtDate(request.approved_at) : (
//                     <span className="text-warning fw-semibold">Pending</span>
//                   )}
//                 </p>
//               </div>
//             </div>

//             {request.scheduled_dispatch && (
//               <div className="alert alert-success py-2">
//                 <i className="fas fa-truck me-2" />
//                 <strong>Scheduled Dispatch:</strong> {fmtDate(request.scheduled_dispatch)}
//               </div>
//             )}

//             {/* Articles table */}
//             <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: 11, letterSpacing: ".5px" }}>
//               Articles ({items.length})
//             </h6>
//             <table className="table table-sm table-bordered mb-3">
//               <thead className="table-light">
//                 <tr>
//                   <th>Article</th>
//                   <th>Code</th>
//                   <th className="text-center">Qty</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, i) => (
//                   <tr key={i}>
//                     <td>{item.article_profile_name || item.productName || "—"}</td>
//                     <td><code>{item.partial_code || "—"}</code></td>
//                     <td className="text-center">{item.quantity || item.count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Automation badges */}
//             {(request.follow_up_enabled || request.escalation_enabled) && (
//               <div className="d-flex gap-2 flex-wrap">
//                 {request.follow_up_enabled && (
//                   <span className="badge bg-light text-dark border">
//                     <i className="fas fa-clock me-1 text-warning" />
//                     Follow-up: {request.follow_up_days}d
//                   </span>
//                 )}
//                 {request.escalation_enabled && (
//                   <span className="badge bg-light text-dark border">
//                     <i className="fas fa-bell me-1 text-danger" />
//                     Escalation: {request.escalation_days}d
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="modal-footer">
//             {/* Dispatcher sees Approve/Reject when pending */}
//             {isDispatcher && isPending && (
//               <button className="btn btn-success" onClick={() => onRespond(request)}>
//                 <i className="fas fa-reply me-2" />Respond
//               </button>
//             )}
//             <button className="btn btn-secondary" onClick={onClose}>Close</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// const StockRequest = () => {
//   const dispatch = useDispatch();
//   const { article_list } = useSelector((state) => state.articles);

//   const [view, setView] = useState("sent");          // sent | inbox | starred
//   const [requests, setRequests] = useState([]);
//   const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
//   const [loading, setLoading] = useState(false);

//   const [showCompose, setShowCompose] = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);  // for detail modal
//   const [respondTarget, setRespondTarget]     = useState(null);  // for respond modal

//   const [filterPriority, setFilterPriority] = useState("");
//   const [filterStatus,   setFilterStatus]   = useState("");

//   const articleOptions = article_list.map((a) => ({
//     value: a.id || a.uuid,
//     label: a.title || a.article_profile_name,
//     partial_code: a.partial_code || a.code || "",
//   }));

//   const isDispatcher = view === "inbox";

//   // ── Fetch ──────────────────────────────────────────────────────────────────
//   const fetchRequests = useCallback(
//     async (page = 1) => {
//       setLoading(true);
//       try {
//         const params = {
//           page,
//           limit: 10,
//           role: isDispatcher ? "dispatcher" : "requester",
//           ...(filterPriority ? { priority: filterPriority } : {}),
//           ...(filterStatus   ? { status: filterStatus }     : {}),
//         };

//         let res;
//         if (isDispatcher) {
//           res = await AuthService.getStockRequestInbox(params);
//         } else {
//           res = await AuthService.getStockRequests(params);
//         }

//         setRequests(res.data.data || []);
//         const p = res.data.pagination;
//         setPagination({ currentPage: p.page, totalPages: p.totalPages, total: p.total });
//       } catch (err) {
//         console.error("Error fetching stock requests:", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [isDispatcher, filterPriority, filterStatus]
//   );

//   useEffect(() => {
//     fetchRequests();
//   }, [fetchRequests]);

//   // Open compose — also load articles
//   const handleCompose = () => {
//     dispatch(fetchUnfilteredArticles({}));
//     setShowCompose(true);
//   };

//   const handleRowClick = (req) => {
//     setSelectedRequest(req);
//     if (!req.is_read) {
//       AuthService.markStockRequestRead(req.stock_req_id).catch(() => {});
//       setRequests((prev) =>
//         prev.map((r) => r.stock_req_id === req.stock_req_id ? { ...r, is_read: true } : r)
//       );
//     }
//   };

//   const handleStar = (e, req) => {
//     e.stopPropagation();
//     const next = !req.is_starred;
//     AuthService.toggleStockRequestStar(req.stock_req_id, next).catch(() => {});
//     setRequests((prev) =>
//       prev.map((r) => r.stock_req_id === req.stock_req_id ? { ...r, is_starred: next } : r)
//     );
//   };

//   const unreadCount = requests.filter((r) => !r.is_read && isDispatcher).length;

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="row align-items-center">
//             <div className="col">
//               <h3 className="page-title mb-0">Stock Requests</h3>
//             </div>
//           </div>
//         </div>

//         <div className="row">
//           {/* ── Sidebar ── */}
//           <div className="col-lg-3 col-md-12">
//             <div className="mb-3">
//               <button
//                 className="btn btn-primary btn-block w-100 mb-2"
//                 onClick={handleCompose}
//               >
//                 <i className="fas fa-plus me-2" />New Stock Request
//               </button>
//             </div>

//             <ul className="inbox-menu">
//               <li className={view === "sent" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => { e.preventDefault(); setView("sent"); }}
//                 >
//                   <i className="far fa-paper-plane me-2" />My Requests
//                 </Link>
//               </li>
//               <li className={view === "inbox" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => { e.preventDefault(); setView("inbox"); }}
//                 >
//                   <i className="fas fa-inbox me-2" />
//                   Incoming
//                   {unreadCount > 0 && (
//                     <span className="mail-count ms-1">({unreadCount})</span>
//                   )}
//                 </Link>
//               </li>
//               <li className={view === "starred" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => { e.preventDefault(); setView("starred"); }}
//                 >
//                   <i className="far fa-star me-2" />Starred
//                 </Link>
//               </li>
//             </ul>

//             {/* Filters */}
//             <div className="mt-3">
//               <p className="text-muted mb-2" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Filter</p>
//               <select
//                 className="form-select form-select-sm mb-2"
//                 value={filterPriority}
//                 onChange={(e) => setFilterPriority(e.target.value)}
//               >
//                 <option value="">All Priorities</option>
//                 <option value="urgent">Urgent</option>
//                 <option value="standard">Standard</option>
//                 <option value="low">Low</option>
//               </select>
//               <select
//                 className="form-select form-select-sm"
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="">All Statuses</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="linked">Linked to StockFlow</option>
//               </select>
//             </div>
//           </div>

//           {/* ── Main ── */}
//           <div className="col-lg-9 col-md-12">
//             {showCompose ? (
//               <ComposeForm
//                 onClose={() => setShowCompose(false)}
//                 onSent={() => {
//                   setShowCompose(false);
//                   setView("sent");
//                   fetchRequests();
//                 }}
//                 articleOptions={articleOptions}
//               />
//             ) : (
//               <div className="card bg-white">
//                 <div className="card-body">
//                   {/* Toolbar */}
//                   <div className="d-flex justify-content-between align-items-center mb-3">
//                     <h5 className="mb-0">
//                       {view === "sent" ? "My Requests" : view === "inbox" ? "Incoming Requests" : "Starred"}
//                       <span className="badge bg-secondary ms-2" style={{ fontSize: 12 }}>
//                         {pagination.total}
//                       </span>
//                     </h5>
//                     <div className="d-flex gap-1">
//                       <button
//                         className="btn btn-sm btn-white"
//                         title="Refresh"
//                         onClick={() => fetchRequests(pagination.currentPage)}
//                       >
//                         <i className="fas fa-sync-alt" />
//                       </button>
//                       <button
//                         className="btn btn-sm btn-white"
//                         disabled={pagination.currentPage === 1}
//                         onClick={() => fetchRequests(pagination.currentPage - 1)}
//                       >
//                         <i className="fas fa-angle-left" />
//                       </button>
//                       <button
//                         className="btn btn-sm btn-white"
//                         disabled={pagination.currentPage >= pagination.totalPages}
//                         onClick={() => fetchRequests(pagination.currentPage + 1)}
//                       >
//                         <i className="fas fa-angle-right" />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Table */}
//                   {loading ? (
//                     <div className="text-center py-5">
//                       <div className="spinner-border text-primary" role="status">
//                         <span className="visually-hidden">Loading…</span>
//                       </div>
//                     </div>
//                   ) : requests.length === 0 ? (
//                     <div className="text-center py-5">
//                       <i className="fas fa-inbox fa-2x text-muted mb-3 d-block" />
//                       <p className="text-muted">No stock requests found</p>
//                     </div>
//                   ) : (
//                     <div className="table-responsive">
//                       <table className="table table-inbox table-hover align-middle">
//                         <tbody>
//                           {requests.map((req) => {
//                             const pCfg = PRIORITY_CONFIG[req.priority] || {};
//                             const tCfg = TEMPLATE_COLORS[req.template_type] || {};
//                             const isPending = !req.approved_at && !req.stock_id;

//                             return (
//                               <tr
//                                 key={req.stock_req_id}
//                                 className={`clickable-row ${!req.is_read && isDispatcher ? "unread" : ""}`}
//                                 onClick={() => handleRowClick(req)}
//                                 style={{ cursor: "pointer" }}
//                               >
//                                 {/* Star */}
//                                 <td
//                                   style={{ width: 36 }}
//                                   onClick={(e) => handleStar(e, req)}
//                                 >
//                                   <i
//                                     className={`${req.is_starred ? "fas text-warning" : "far text-muted"} fa-star`}
//                                   />
//                                 </td>

//                                 {/* Priority stripe */}
//                                 <td style={{ width: 6, padding: 0 }}>
//                                   <div
//                                     style={{
//                                       width: 4,
//                                       height: 38,
//                                       background: pCfg.color || "#dee2e6",
//                                       borderRadius: 2,
//                                       margin: "0 auto",
//                                     }}
//                                   />
//                                 </td>

//                                 {/* ID + badges */}
//                                 <td style={{ minWidth: 180 }}>
//                                   <div className="d-flex align-items-center gap-2 flex-wrap">
//                                     <code style={{ fontSize: 12 }}>{req.stock_req_id}</code>
//                                     <span className={`badge ${pCfg.badge}`} style={{ fontSize: 10 }}>
//                                       {pCfg.label}
//                                     </span>
//                                     {tCfg.badge && (
//                                       <span className={`badge ${tCfg.badge}`} style={{ fontSize: 10 }}>
//                                         <i className={`${tCfg.icon} me-1`} />
//                                         {tCfg.label}
//                                       </span>
//                                     )}
//                                     {req.stock_id && (
//                                       <span className="badge bg-primary" style={{ fontSize: 10 }}>
//                                         <i className="fas fa-link me-1" />Linked
//                                       </span>
//                                     )}
//                                     {isPending && (
//                                       <span className="badge bg-warning text-dark" style={{ fontSize: 10 }}>
//                                         Pending
//                                       </span>
//                                     )}
//                                   </div>
//                                 </td>

//                                 {/* From/To */}
//                                 <td className="name" style={{ minWidth: 160 }}>
//                                   {isDispatcher ? req.sender_email : req.receiver_email}
//                                 </td>

//                                 {/* Article count */}
//                                 <td style={{ minWidth: 100 }}>
//                                   <span className="text-muted small">
//                                     {(() => {
//                                       try {
//                                         const arr = typeof req.requested_articles === "string"
//                                           ? JSON.parse(req.requested_articles)
//                                           : req.requested_articles;
//                                         return `${arr?.length || 0} article${arr?.length !== 1 ? "s" : ""}`;
//                                       } catch { return "—"; }
//                                     })()}
//                                   </span>
//                                 </td>

//                                 {/* Scheduled */}
//                                 <td style={{ minWidth: 120 }}>
//                                   {req.scheduled_dispatch ? (
//                                     <span className="text-success small">
//                                       <i className="fas fa-truck me-1" />
//                                       {fmtDate(req.scheduled_dispatch)}
//                                     </span>
//                                   ) : null}
//                                 </td>

//                                 {/* Date */}
//                                 <td className="mail-date text-end">
//                                   {new Date(req.email_sent_at || req.created_at).toLocaleString()}
//                                 </td>
//                               </tr>
//                             );
//                           })}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Detail Modal */}
//       {selectedRequest && !respondTarget && (
//         <DetailModal
//           request={selectedRequest}
//           isDispatcher={isDispatcher}
//           onClose={() => setSelectedRequest(null)}
//           onRespond={(req) => {
//             setSelectedRequest(null);
//             setRespondTarget(req);
//           }}
//         />
//       )}

//       {/* Respond Modal */}
//       {respondTarget && (
//         <RespondModal
//           request={respondTarget}
//           onClose={() => setRespondTarget(null)}
//           onResponded={() => {
//             setRespondTarget(null);
//             fetchRequests(pagination.currentPage);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StockRequest;









// // // components/StockRequest/StockRequest.jsx
// // /* eslint-disable react/prop-types */
// // import React, { useState, useEffect, useCallback } from "react";
// // import { Link } from "react-router-dom";
// // import Select from "react-select";
// // import { useDispatch, useSelector } from "react-redux";
// // import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
// // import AuthService from "../../services/authService";

// // // ─── Priority config (fallback only – real data comes from DB) ────────────────
// // const PRIORITY_BADGE_MAP = {
// //   urgent:   { color: "#dc3545", badge: "bg-danger"  },
// //   standard: { color: "#fd7e14", badge: "bg-warning text-dark" },
// //   low:      { color: "#198754", badge: "bg-success"  },
// // };

// // const getPriorityCfg = (key = "") => {
// //   const k = key.toLowerCase();
// //   return PRIORITY_BADGE_MAP[k] || { color: "#6c757d", badge: "bg-secondary" };
// // };

// // const TEMPLATE_COLORS = {
// //   stock_request_created:  { badge: "bg-info",    icon: "fas fa-paper-plane", label: "Request Sent"   },
// //   stock_request_approved: { badge: "bg-success", icon: "fas fa-check-circle", label: "Approved"      },
// //   stock_request_rejected: { badge: "bg-danger",  icon: "fas fa-times-circle", label: "Rejected"      },
// // };

// // // ─── Helper ───────────────────────────────────────────────────────────────────
// // const fmt     = (dt) => dt ? new Date(dt).toLocaleString() : "—";
// // const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

// // // ─── COMPOSE FORM ─────────────────────────────────────────────────────────────
// // const ComposeForm = ({ onClose, onSent, articleOptions }) => {
// //   const [priorities, setPriorities] = useState([]);        // from DB
// //   const [users, setUsers]           = useState([]);        // for dispatcher & CC dropdowns
// //   const [loadingMeta, setLoadingMeta] = useState(true);

// //   const [form, setForm] = useState({
// //     dispatcher_email: "",
// //     cc_emails: [],                 // array of email strings
// //     priority: "",
// //     notes: "",
// //     follow_up_enabled: true,
// //     follow_up_days: 2,
// //     escalation_enabled: false,
// //     escalation_days: 3,
// //     escalation_email: "",
// //     items: [{ prod_uuid: "", partial_code: "", article_profile_name: "", quantity: 1 }],
// //   });
// //   const [sending, setSending] = useState(false);

// //   // ── Load priorities + users on mount ───────────────────────────────────────
// //   useEffect(() => {
// //     const load = async () => {
// //       setLoadingMeta(true);
// //       try {
// //         const [priorityRes, userRes] = await Promise.all([
// //           AuthService.getStockRequestPriorities(),   // GET /stock-requests/priorities
// //           AuthService.getUser(),                     // already used in Users.jsx
// //         ]);

// //         const pList = priorityRes.data?.priorities || priorityRes.data || [];
// //         setPriorities(pList);
// //         // Pre-select the first priority (usually "standard")
// //         if (pList.length > 0) {
// //           setForm((prev) => ({ ...prev, priority: pList[0].value || pList[0].key || pList[0].name }));
// //         }

// //         const uList = Array.isArray(userRes.data)
// //           ? userRes.data
// //           : userRes.data?.users || [];
// //         setUsers(uList);
// //       } catch (err) {
// //         console.error("Failed to load priorities / users:", err);
// //       } finally {
// //         setLoadingMeta(false);
// //       }
// //     };
// //     load();
// //   }, []);

// //   // ── Build user options for react-select ────────────────────────────────────
// //   const userOptions = users.map((u) => ({
// //     value: u.email,
// //     label: `${u.username || u.name || "—"} · ${u.email}`,
// //     email: u.email,
// //     username: u.username || u.name || "",
// //   }));

// //   const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

// //   const addItem = () =>
// //     set("items", [...form.items, { prod_uuid: "", partial_code: "", article_profile_name: "", quantity: 1 }]);

// //   const removeItem = (i) =>
// //     set("items", form.items.filter((_, idx) => idx !== i));

// //   const updateItem = (i, field, val) => {
// //     const items = [...form.items];
// //     items[i] = { ...items[i], [field]: val };
// //     set("items", items);
// //   };

// //   const handleArticleSelect = (i, option) => {
// //     const items = [...form.items];
// //     items[i] = {
// //       ...items[i],
// //       prod_uuid:            option?.value || "",
// //       partial_code:         option?.partial_code || "",
// //       article_profile_name: option?.label || "",
// //     };
// //     set("items", items);
// //   };

// //   const handleDispatcherSelect = (option) => {
// //     set("dispatcher_email", option?.email || "");
// //   };

// //   const handleCcSelect = (options) => {
// //     set("cc_emails", (options || []).map((o) => o.email));
// //   };

// //   const handleSubmit = async () => {
// //     if (!form.dispatcher_email) return alert("Dispatcher is required");
// //     const validItems = form.items.filter((i) => i.article_profile_name && i.quantity > 0);
// //     if (!validItems.length) return alert("Add at least one article");
// //     setSending(true);
// //     try {
// //       await AuthService.createStockRequest({ ...form, items: validItems });
// //       onSent();
// //     } catch (err) {
// //       alert(err.response?.data?.message || "Failed to send stock request");
// //     } finally {
// //       setSending(false);
// //     }
// //   };

// //   if (loadingMeta) {
// //     return (
// //       <div className="card bg-white">
// //         <div className="card-body text-center py-5">
// //           <div className="spinner-border text-primary" role="status" />
// //           <p className="mt-3 text-muted">Loading form data…</p>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="card bg-white">
// //       <div className="card-body">
// //         {/* Header */}
// //         <div className="d-flex align-items-center justify-content-between mb-4">
// //           <div>
// //             <h4 className="mb-0">New Stock Request</h4>
// //             <small className="text-muted">Request articles from a dispatcher</small>
// //           </div>
// //           <button className="btn-close" onClick={onClose} />
// //         </div>

// //         {/* ── Dispatcher (user dropdown) ─────────────────────────────────── */}
// //         <div className="mb-3">
// //           <label className="form-label fw-semibold">
// //             Dispatcher <span className="text-danger">*</span>
// //           </label>
// //           <Select
// //             options={userOptions}
// //             onChange={handleDispatcherSelect}
// //             placeholder="Search by name or email…"
// //             isClearable
// //             isSearchable
// //             menuPortalTarget={document.body}
// //             styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
// //             formatOptionLabel={(opt) => (
// //               <div className="d-flex align-items-center gap-2">
// //                 <div
// //                   className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center"
// //                   style={{ width: 28, height: 28, fontSize: 11, flexShrink: 0 }}
// //                 >
// //                   {(opt.username?.[0] || opt.email?.[0] || "?").toUpperCase()}
// //                 </div>
// //                 <div>
// //                   <div className="fw-semibold" style={{ fontSize: 13 }}>{opt.username}</div>
// //                   <div className="text-muted" style={{ fontSize: 11 }}>{opt.email}</div>
// //                 </div>
// //               </div>
// //             )}
// //           />
// //           {/* Fallback: manual email entry */}
// //           <div className="mt-2">
// //             <input
// //               type="email"
// //               className="form-control form-control-sm"
// //               placeholder="Or type dispatcher email manually…"
// //               value={form.dispatcher_email}
// //               onChange={(e) => set("dispatcher_email", e.target.value)}
// //             />
// //           </div>
// //         </div>

// //         {/* ── CC ────────────────────────────────────────────────────────── */}
// //         <div className="mb-3">
// //           <label className="form-label fw-semibold">
// //             CC{" "}
// //             <span className="text-muted fw-normal" style={{ fontSize: 12 }}>
// //               (optional · multiple)
// //             </span>
// //           </label>
// //           <Select
// //             options={userOptions.filter((o) => o.email !== form.dispatcher_email)}
// //             isMulti
// //             onChange={handleCcSelect}
// //             placeholder="Add users to CC…"
// //             isClearable
// //             isSearchable
// //             menuPortalTarget={document.body}
// //             styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
// //             formatOptionLabel={(opt) => (
// //               <div className="d-flex align-items-center gap-2">
// //                 <div
// //                   className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center"
// //                   style={{ width: 24, height: 24, fontSize: 10, flexShrink: 0 }}
// //                 >
// //                   {(opt.username?.[0] || opt.email?.[0] || "?").toUpperCase()}
// //                 </div>
// //                 <div>
// //                   <span className="fw-semibold" style={{ fontSize: 12 }}>{opt.username}</span>
// //                   <span className="text-muted ms-1" style={{ fontSize: 11 }}>{opt.email}</span>
// //                 </div>
// //               </div>
// //             )}
// //           />
// //         </div>

// //         {/* ── Priority (from DB) ────────────────────────────────────────── */}
// //         <div className="mb-3">
// //           <label className="form-label fw-semibold">Priority</label>
// //           <div className="d-flex gap-2 flex-wrap">
// //             {priorities.map((p) => {
// //               const key   = p.value || p.key || p.name;
// //               const label = p.label || p.name;
// //               const cfg   = getPriorityCfg(key);
// //               const active = form.priority === key;
// //               return (
// //                 <button
// //                   key={key}
// //                   type="button"
// //                   className={`btn btn-sm ${active ? cfg.badge + " text-white" : "btn-outline-secondary"}`}
// //                   style={active ? { borderColor: cfg.color } : {}}
// //                   onClick={() => set("priority", key)}
// //                 >
// //                   {label}
// //                 </button>
// //               );
// //             })}
// //           </div>
// //         </div>

// //         {/* ── Articles ──────────────────────────────────────────────────── */}
// //         <div className="mb-3">
// //           <div className="d-flex justify-content-between align-items-center mb-2">
// //             <label className="form-label fw-semibold mb-0">
// //               Articles <span className="text-danger">*</span>
// //             </label>
// //             <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
// //               <i className="fas fa-plus me-1" /> Add Row
// //             </button>
// //           </div>

// //           <div className="table-responsive">
// //             <table className="table table-bordered table-sm align-middle mb-0">
// //               <tbody>
// //                 {form.items.map((item, i) => (
// //                   <tr key={i}>
// //                     <td>
// //                       <Select
// //                         options={articleOptions}
// //                         value={articleOptions.find((o) => o.value === item.prod_uuid) || null}
// //                         onChange={(opt) => handleArticleSelect(i, opt)}
// //                         placeholder="Select article…"
// //                         isClearable
// //                         isSearchable
// //                         menuPortalTarget={document.body}
// //                         styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
// //                       />
// //                     </td>
// //                     <td>
// //                       <input
// //                         type="number"
// //                         className="form-control form-control-sm"
// //                         min="1"
// //                         value={item.quantity}
// //                         onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
// //                       />
// //                     </td>
// //                     <td>
// //                       {form.items.length > 1 && (
// //                         <button
// //                           type="button"
// //                           className="btn btn-sm btn-outline-danger"
// //                           onClick={() => removeItem(i)}
// //                         >
// //                           <i className="fas fa-times" />
// //                         </button>
// //                       )}
// //                     </td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>
// //           </div>
// //         </div>

// //         {/* ── Notes ─────────────────────────────────────────────────────── */}
// //         <div className="mb-3">
// //           <label className="form-label fw-semibold">
// //             Notes <span className="text-muted fw-normal">(optional)</span>
// //           </label>
// //           <textarea
// //             className="form-control"
// //             rows="3"
// //             value={form.notes}
// //             onChange={(e) => set("notes", e.target.value)}
// //             placeholder="Any additional instructions…"
// //           />
// //         </div>

// //         {/* ── Automation ────────────────────────────────────────────────── */}
// //         <div className="mb-4">
// //           <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: "11px", letterSpacing: ".5px" }}>
// //             Automation
// //           </h6>
// //           <div className="row g-3">
// //             {/* Follow-up */}
// //             <div className="col-md-6">
// //               <div className="border rounded p-3">
// //                 <div className="form-check mb-0">
// //                   <input
// //                     className="form-check-input"
// //                     type="checkbox"
// //                     id="followUp"
// //                     checked={form.follow_up_enabled}
// //                     onChange={(e) => set("follow_up_enabled", e.target.checked)}
// //                   />
// //                   <label className="form-check-label fw-semibold" htmlFor="followUp">
// //                     Follow-up reminder
// //                   </label>
// //                 </div>
// //                 {form.follow_up_enabled && (
// //                   <div className="mt-2 d-flex align-items-center gap-2">
// //                     <span className="text-muted small">After</span>
// //                     <input
// //                       type="number"
// //                       className="form-control form-control-sm"
// //                       style={{ width: 70 }}
// //                       min="1"
// //                       max="30"
// //                       value={form.follow_up_days}
// //                       onChange={(e) => set("follow_up_days", parseInt(e.target.value) || 1)}
// //                     />
// //                     <span className="text-muted small">days</span>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>

// //             {/* Escalation */}
// //             <div className="col-md-6">
// //               <div className="border rounded p-3">
// //                 <div className="form-check mb-0">
// //                   <input
// //                     className="form-check-input"
// //                     type="checkbox"
// //                     id="escalation"
// //                     checked={form.escalation_enabled}
// //                     onChange={(e) => set("escalation_enabled", e.target.checked)}
// //                   />
// //                   <label className="form-check-label fw-semibold" htmlFor="escalation">
// //                     Auto-escalation
// //                   </label>
// //                 </div>
// //                 {form.escalation_enabled && (
// //                   <div className="mt-2">
// //                     <input
// //                       type="email"
// //                       className="form-control form-control-sm mb-2"
// //                       placeholder="Escalation email"
// //                       value={form.escalation_email}
// //                       onChange={(e) => set("escalation_email", e.target.value)}
// //                     />
// //                     <div className="d-flex align-items-center gap-2">
// //                       <span className="text-muted small">After</span>
// //                       <input
// //                         type="number"
// //                         className="form-control form-control-sm"
// //                         style={{ width: 70 }}
// //                         min="1"
// //                         max="30"
// //                         value={form.escalation_days}
// //                         onChange={(e) => set("escalation_days", parseInt(e.target.value) || 1)}
// //                       />
// //                       <span className="text-muted small">days</span>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="d-flex gap-2">
// //           <button className="btn btn-primary" onClick={handleSubmit} disabled={sending}>
// //             {sending ? (
// //               <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
// //             ) : (
// //               <><i className="fas fa-paper-plane me-2" />Send Request</>
// //             )}
// //           </button>
// //           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ─── RESPOND MODAL ────────────────────────────────────────────────────────────
// // const RespondModal = ({ request, onClose, onResponded }) => {
// //   const [action, setAction] = useState("approve");
// //   const [scheduledDispatch, setScheduledDispatch] = useState("");
// //   const [notes, setNotes] = useState("");
// //   const [submitting, setSubmitting] = useState(false);

// //   const today = new Date().toISOString().split("T")[0];

// //   const handleSubmit = async () => {
// //     if (action === "approve" && !scheduledDispatch) {
// //       return alert("Please set a scheduled dispatch date");
// //     }
// //     setSubmitting(true);
// //     try {
// //       await AuthService.respondToStockRequest(request.stock_req_id, {
// //         action,
// //         scheduled_dispatch: action === "approve" ? scheduledDispatch : undefined,
// //         notes,
// //       });
// //       onResponded();
// //     } catch (err) {
// //       alert(err.response?.data?.message || "Failed to respond");
// //     } finally {
// //       setSubmitting(false);
// //     }
// //   };

// //   const items = typeof request.requested_articles === "string"
// //     ? JSON.parse(request.requested_articles)
// //     : request.requested_articles || [];

// //   return (
// //     <div
// //       className="modal fade show"
// //       style={{ display: "block", background: "rgba(0,0,0,.55)" }}
// //       onClick={onClose}
// //     >
// //       <div
// //         className="modal-dialog modal-lg modal-dialog-scrollable"
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <div className="modal-content">
// //           <div className="modal-header">
// //             <div>
// //               <h5 className="modal-title">Respond to Stock Request</h5>
// //               <small className="text-muted">{request.stock_req_id}</small>
// //             </div>
// //             <button className="btn-close" onClick={onClose} />
// //           </div>
// //           <div className="modal-body">
// //             {/* Summary */}
// //             <div className="d-flex gap-3 mb-3">
// //               <div className="flex-fill border rounded p-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Requester</p>
// //                 <p className="mb-0 fw-semibold">{request.requester_email || request.sender_email}</p>
// //               </div>
// //               <div className="flex-fill border rounded p-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Priority</p>
// //                 <span className={`badge ${getPriorityCfg(request.priority).badge}`}>
// //                   {request.priority_label || request.priority}
// //                 </span>
// //               </div>
// //               <div className="flex-fill border rounded p-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Requested</p>
// //                 <p className="mb-0">{fmt(request.created_at)}</p>
// //               </div>
// //             </div>

// //             {/* CC */}
// //             {request.cc_emails && request.cc_emails.length > 0 && (
// //               <div className="mb-3">
// //                 <p className="fw-semibold mb-1" style={{ fontSize: 13 }}>
// //                   <i className="fas fa-users me-1 text-muted" />CC
// //                 </p>
// //                 <div className="d-flex flex-wrap gap-1">
// //                   {(typeof request.cc_emails === "string"
// //                     ? JSON.parse(request.cc_emails)
// //                     : request.cc_emails
// //                   ).map((email) => (
// //                     <span key={email} className="badge bg-light text-dark border" style={{ fontSize: 11 }}>
// //                       {email}
// //                     </span>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {/* Articles */}
// //             <div className="mb-3">
// //               <p className="fw-semibold mb-2">Requested Articles</p>
// //               <table className="table table-sm table-bordered mb-0">
// //                 <thead className="table-light">
// //                   <tr>
// //                     <th>Article</th>
// //                     <th>Code</th>
// //                     <th className="text-center">Qty</th>
// //                   </tr>
// //                 </thead>
// //                 <tbody>
// //                   {items.map((item, i) => (
// //                     <tr key={i}>
// //                       <td>{item.article_profile_name || item.productName || "—"}</td>
// //                       <td><code>{item.partial_code || "—"}</code></td>
// //                       <td className="text-center">{item.quantity || item.count}</td>
// //                     </tr>
// //                   ))}
// //                 </tbody>
// //               </table>
// //             </div>

// //             {/* Action selector */}
// //             <div className="mb-3">
// //               <p className="fw-semibold mb-2">Your Response</p>
// //               <div className="d-flex gap-2 mb-3">
// //                 <button
// //                   type="button"
// //                   className={`btn ${action === "approve" ? "btn-success" : "btn-outline-secondary"}`}
// //                   onClick={() => setAction("approve")}
// //                 >
// //                   <i className="fas fa-check me-2" />Approve
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`btn ${action === "reject" ? "btn-danger" : "btn-outline-secondary"}`}
// //                   onClick={() => setAction("reject")}
// //                 >
// //                   <i className="fas fa-times me-2" />Reject
// //                 </button>
// //               </div>

// //               {action === "approve" && (
// //                 <div className="mb-3">
// //                   <label className="form-label">Scheduled Dispatch Date <span className="text-danger">*</span></label>
// //                   <input
// //                     type="date"
// //                     className="form-control"
// //                     style={{ maxWidth: 220 }}
// //                     min={today}
// //                     value={scheduledDispatch}
// //                     onChange={(e) => setScheduledDispatch(e.target.value)}
// //                   />
// //                 </div>
// //               )}

// //               <div>
// //                 <label className="form-label">
// //                   {action === "approve" ? "Approval Notes" : "Rejection Reason"}{" "}
// //                   <span className="text-muted fw-normal">(optional)</span>
// //                 </label>
// //                 <textarea
// //                   className="form-control"
// //                   rows="3"
// //                   value={notes}
// //                   onChange={(e) => setNotes(e.target.value)}
// //                   placeholder={action === "approve" ? "Any instructions for dispatch…" : "Reason for rejection…"}
// //                 />
// //               </div>
// //             </div>
// //           </div>
// //           <div className="modal-footer">
// //             <button
// //               className={`btn ${action === "approve" ? "btn-success" : "btn-danger"}`}
// //               onClick={handleSubmit}
// //               disabled={submitting}
// //             >
// //               {submitting ? (
// //                 <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
// //               ) : (
// //                 action === "approve" ? "Confirm Approval" : "Confirm Rejection"
// //               )}
// //             </button>
// //             <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ─── DETAIL MODAL ─────────────────────────────────────────────────────────────
// // const DetailModal = ({ request, isDispatcher, onClose, onRespond }) => {
// //   const items = typeof request.requested_articles === "string"
// //     ? JSON.parse(request.requested_articles)
// //     : request.requested_articles || [];

// //   const pCfg  = getPriorityCfg(request.priority);
// //   const tCfg  = TEMPLATE_COLORS[request.template_type] || {};
// //   const isPending = !request.approved_at;

// //   const ccList = request.cc_emails
// //     ? (typeof request.cc_emails === "string" ? JSON.parse(request.cc_emails) : request.cc_emails)
// //     : [];

// //   return (
// //     <div
// //       className="modal fade show"
// //       style={{ display: "block", background: "rgba(0,0,0,.55)" }}
// //       onClick={onClose}
// //     >
// //       <div
// //         className="modal-dialog modal-lg modal-dialog-scrollable"
// //         onClick={(e) => e.stopPropagation()}
// //       >
// //         <div className="modal-content">
// //           <div
// //             className="modal-header"
// //             style={{ borderLeft: `4px solid ${pCfg.color || "#6c757d"}` }}
// //           >
// //             <div>
// //               <h5 className="modal-title mb-0">{request.stock_req_id}</h5>
// //               <div className="d-flex gap-2 mt-1">
// //                 <span className={`badge ${pCfg.badge}`}>
// //                   {request.priority_label || request.priority}
// //                 </span>
// //                 {tCfg.badge && (
// //                   <span className={`badge ${tCfg.badge}`}>
// //                     <i className={`${tCfg.icon} me-1`} />{tCfg.label}
// //                   </span>
// //                 )}
// //                 {request.stock_id && (
// //                   <span className="badge bg-primary">
// //                     <i className="fas fa-link me-1" />{request.stock_id}
// //                   </span>
// //                 )}
// //               </div>
// //             </div>
// //             <button className="btn-close" onClick={onClose} />
// //           </div>

// //           <div className="modal-body">
// //             {/* Meta */}
// //             <div className="row g-2 mb-3">
// //               <div className="col-6 col-md-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>From</p>
// //                 <p className="mb-0 small fw-semibold">{request.sender_email}</p>
// //               </div>
// //               <div className="col-6 col-md-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>To</p>
// //                 <p className="mb-0 small fw-semibold">{request.receiver_email}</p>
// //               </div>
// //               <div className="col-6 col-md-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Created</p>
// //                 <p className="mb-0 small">{fmt(request.created_at)}</p>
// //               </div>
// //               <div className="col-6 col-md-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
// //                   {request.approved_at ? "Approved" : "Status"}
// //                 </p>
// //                 <p className="mb-0 small">
// //                   {request.approved_at ? fmtDate(request.approved_at) : (
// //                     <span className="text-warning fw-semibold">Pending</span>
// //                   )}
// //                 </p>
// //               </div>
// //             </div>

// //             {/* CC row */}
// //             {ccList.length > 0 && (
// //               <div className="mb-3">
// //                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
// //                   <i className="fas fa-users me-1" />CC
// //                 </p>
// //                 <div className="d-flex flex-wrap gap-1">
// //                   {ccList.map((email) => (
// //                     <span key={email} className="badge bg-light text-dark border" style={{ fontSize: 11 }}>
// //                       {email}
// //                     </span>
// //                   ))}
// //                 </div>
// //               </div>
// //             )}

// //             {request.scheduled_dispatch && (
// //               <div className="alert alert-success py-2">
// //                 <i className="fas fa-truck me-2" />
// //                 <strong>Scheduled Dispatch:</strong> {fmtDate(request.scheduled_dispatch)}
// //               </div>
// //             )}

// //             {/* Articles table */}
// //             <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: 11, letterSpacing: ".5px" }}>
// //               Articles ({items.length})
// //             </h6>
// //             <table className="table table-sm table-bordered mb-3">
// //               <thead className="table-light">
// //                 <tr>
// //                   <th>Article</th>
// //                   <th>Code</th>
// //                   <th className="text-center">Qty</th>
// //                 </tr>
// //               </thead>
// //               <tbody>
// //                 {items.map((item, i) => (
// //                   <tr key={i}>
// //                     <td>{item.article_profile_name || item.productName || "—"}</td>
// //                     <td><code>{item.partial_code || "—"}</code></td>
// //                     <td className="text-center">{item.quantity || item.count}</td>
// //                   </tr>
// //                 ))}
// //               </tbody>
// //             </table>

// //             {/* Automation badges */}
// //             {(request.follow_up_enabled || request.escalation_enabled) && (
// //               <div className="d-flex gap-2 flex-wrap">
// //                 {request.follow_up_enabled && (
// //                   <span className="badge bg-light text-dark border">
// //                     <i className="fas fa-clock me-1 text-warning" />
// //                     Follow-up: {request.follow_up_days}d
// //                   </span>
// //                 )}
// //                 {request.escalation_enabled && (
// //                   <span className="badge bg-light text-dark border">
// //                     <i className="fas fa-bell me-1 text-danger" />
// //                     Escalation: {request.escalation_days}d
// //                   </span>
// //                 )}
// //               </div>
// //             )}
// //           </div>

// //           <div className="modal-footer">
// //             {isDispatcher && isPending && (
// //               <button className="btn btn-success" onClick={() => onRespond(request)}>
// //                 <i className="fas fa-reply me-2" />Respond
// //               </button>
// //             )}
// //             <button className="btn btn-secondary" onClick={onClose}>Close</button>
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // };

// // // ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
// // const StockRequest = () => {
// //   const dispatch = useDispatch();
// //   const { article_list } = useSelector((state) => state.articles);

// //   const [view, setView]             = useState("sent");
// //   const [requests, setRequests]     = useState([]);
// //   const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
// //   const [loading, setLoading]       = useState(false);

// //   const [showCompose, setShowCompose]       = useState(false);
// //   const [selectedRequest, setSelectedRequest] = useState(null);
// //   const [respondTarget, setRespondTarget]     = useState(null);

// //   const [filterPriority, setFilterPriority] = useState("");
// //   const [filterStatus,   setFilterStatus]   = useState("");

// //   // Priority list for the filter sidebar (loaded from DB once)
// //   const [dbPriorities, setDbPriorities] = useState([]);



// //   const articleOptions = article_list.map((a) => ({
// //     value:        a.id || a.uuid,
// //     label:        a.title || a.article_profile_name,
// //     partial_code: a.partial_code || a.code || "",
// //   }));

// //   const isDispatcher = view === "inbox";

// //   // ── Fetch ──────────────────────────────────────────────────────────────────
// //   const fetchRequests = useCallback(
// //     async (page = 1) => {
// //       setLoading(true);
// //       try {
// //         const params = {
// //           page,
// //           limit: 10,
// //           role: isDispatcher ? "dispatcher" : "requester",
// //           ...(filterPriority ? { priority: filterPriority } : {}),
// //           ...(filterStatus   ? { status:   filterStatus   } : {}),
// //         };

// //         const res = isDispatcher
// //           ? await AuthService.getStockRequestInbox(params)
// //           : await AuthService.getStockRequests(params);

// //         setRequests(res.data.data || []);
// //         const p = res.data.pagination;
// //         setPagination({ currentPage: p.page, totalPages: p.totalPages, total: p.total });
// //       } catch (err) {
// //         console.error("Error fetching stock requests:", err);
// //       } finally {
// //         setLoading(false);
// //       }
// //     },
// //     [isDispatcher, filterPriority, filterStatus]
// //   );

// //   useEffect(() => { fetchRequests(); }, [fetchRequests]);

// //   const handleCompose = () => {
// //     dispatch(fetchUnfilteredArticles({}));
// //     setShowCompose(true);
// //   };

// //   const handleRowClick = (req) => {
// //     setSelectedRequest(req);
// //     if (!req.is_read) {
// //       AuthService.markStockRequestRead(req.stock_req_id).catch(() => {});
// //       setRequests((prev) =>
// //         prev.map((r) => r.stock_req_id === req.stock_req_id ? { ...r, is_read: true } : r)
// //       );
// //     }
// //   };

// //   const handleStar = (e, req) => {
// //     e.stopPropagation();
// //     const next = !req.is_starred;
// //     AuthService.toggleStockRequestStar(req.stock_req_id, next).catch(() => {});
// //     setRequests((prev) =>
// //       prev.map((r) => r.stock_req_id === req.stock_req_id ? { ...r, is_starred: next } : r)
// //     );
// //   };

// //   const unreadCount = requests.filter((r) => !r.is_read && isDispatcher).length;

// //   // ── Render ─────────────────────────────────────────────────────────────────
// //   return (
// //     <div className="page-wrapper">
// //       <div className="content">
// //         <div className="page-header">
// //           <div className="row align-items-center">
// //             <div className="col">
// //               <h3 className="page-title mb-0">Stock Requests</h3>
// //             </div>
// //           </div>
// //         </div>

// //         <div className="row">
// //           {/* ── Sidebar ── */}
// //           <div className="col-lg-3 col-md-12">
// //             <div className="mb-3">
// //               <button
// //                 className="btn btn-primary btn-block w-100 mb-2"
// //                 onClick={handleCompose}
// //               >
// //                 <i className="fas fa-plus me-2" />New Stock Request
// //               </button>
// //             </div>

// //             <ul className="inbox-menu">
// //               <li className={view === "sent" ? "active" : ""}>
// //                 <Link to="#" onClick={(e) => { e.preventDefault(); setView("sent"); }}>
// //                   <i className="far fa-paper-plane me-2" />My Requests
// //                 </Link>
// //               </li>
// //               <li className={view === "inbox" ? "active" : ""}>
// //                 <Link to="#" onClick={(e) => { e.preventDefault(); setView("inbox"); }}>
// //                   <i className="fas fa-inbox me-2" />
// //                   Incoming
// //                   {unreadCount > 0 && (
// //                     <span className="mail-count ms-1">({unreadCount})</span>
// //                   )}
// //                 </Link>
// //               </li>
// //               <li className={view === "starred" ? "active" : ""}>
// //                 <Link to="#" onClick={(e) => { e.preventDefault(); setView("starred"); }}>
// //                   <i className="far fa-star me-2" />Starred
// //                 </Link>
// //               </li>
// //             </ul>

// //             {/* Filters */}
// //             <div className="mt-3">
// //               <p className="text-muted mb-2" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
// //                 Filter
// //               </p>
// //               {/* Priority filter: options from DB */}
// //               <select
// //                 className="form-select form-select-sm mb-2"
// //                 value={filterPriority}
// //                 onChange={(e) => setFilterPriority(e.target.value)}
// //               >
// //                 <option value="">All Priorities</option>
// //                 {dbPriorities.map((p) => {
// //                   const key   = p.value || p.key || p.name;
// //                   const label = p.label || p.name;
// //                   return <option key={key} value={key}>{label}</option>;
// //                 })}
// //               </select>
// //               <select
// //                 className="form-select form-select-sm"
// //                 value={filterStatus}
// //                 onChange={(e) => setFilterStatus(e.target.value)}
// //               >
// //                 <option value="">All Statuses</option>
// //                 <option value="pending">Pending</option>
// //                 <option value="approved">Approved</option>
// //                 <option value="linked">Linked to StockFlow</option>
// //               </select>
// //             </div>
// //           </div>

// //           {/* ── Main ── */}
// //           <div className="col-lg-9 col-md-12">
// //             {showCompose ? (
// //               <ComposeForm
// //                 onClose={() => setShowCompose(false)}
// //                 onSent={() => {
// //                   setShowCompose(false);
// //                   setView("sent");
// //                   fetchRequests();
// //                 }}
// //                 articleOptions={articleOptions}
// //               />
// //             ) : (
// //               <div className="card bg-white">
// //                 <div className="card-body">
// //                   {/* Toolbar */}
// //                   <div className="d-flex justify-content-between align-items-center mb-3">
// //                     <h5 className="mb-0">
// //                       {view === "sent" ? "My Requests" : view === "inbox" ? "Incoming Requests" : "Starred"}
// //                       <span className="badge bg-secondary ms-2" style={{ fontSize: 12 }}>
// //                         {pagination.total}
// //                       </span>
// //                     </h5>
// //                     <div className="d-flex gap-1">
// //                       <button
// //                         className="btn btn-sm btn-white"
// //                         title="Refresh"
// //                         onClick={() => fetchRequests(pagination.currentPage)}
// //                       >
// //                         <i className="fas fa-sync-alt" />
// //                       </button>
// //                       <button
// //                         className="btn btn-sm btn-white"
// //                         disabled={pagination.currentPage === 1}
// //                         onClick={() => fetchRequests(pagination.currentPage - 1)}
// //                       >
// //                         <i className="fas fa-angle-left" />
// //                       </button>
// //                       <button
// //                         className="btn btn-sm btn-white"
// //                         disabled={pagination.currentPage >= pagination.totalPages}
// //                         onClick={() => fetchRequests(pagination.currentPage + 1)}
// //                       >
// //                         <i className="fas fa-angle-right" />
// //                       </button>
// //                     </div>
// //                   </div>

// //                   {/* Table */}
// //                   {loading ? (
// //                     <div className="text-center py-5">
// //                       <div className="spinner-border text-primary" role="status">
// //                         <span className="visually-hidden">Loading…</span>
// //                       </div>
// //                     </div>
// //                   ) : requests.length === 0 ? (
// //                     <div className="text-center py-5">
// //                       <i className="fas fa-inbox fa-2x text-muted mb-3 d-block" />
// //                       <p className="text-muted">No stock requests found</p>
// //                     </div>
// //                   ) : (
// //                     <div className="table-responsive">
// //                       <table className="table table-inbox table-hover align-middle">
// //                         <tbody>
// //                           {requests.map((req) => {
// //                             const pCfg     = getPriorityCfg(req.priority);
// //                             const tCfg     = TEMPLATE_COLORS[req.template_type] || {};
// //                             const isPending = !req.approved_at && !req.stock_id;

// //                             return (
// //                               <tr
// //                                 key={req.stock_req_id}
// //                                 className={`clickable-row ${!req.is_read && isDispatcher ? "unread" : ""}`}
// //                                 onClick={() => handleRowClick(req)}
// //                                 style={{ cursor: "pointer" }}
// //                               >
// //                                 {/* Star */}
// //                                 <td style={{ width: 36 }} onClick={(e) => handleStar(e, req)}>
// //                                   <i className={`${req.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
// //                                 </td>

// //                                 {/* Priority stripe */}
// //                                 <td style={{ width: 6, padding: 0 }}>
// //                                   <div
// //                                     style={{
// //                                       width: 4, height: 38,
// //                                       background: pCfg.color || "#dee2e6",
// //                                       borderRadius: 2, margin: "0 auto",
// //                                     }}
// //                                   />
// //                                 </td>

// //                                 {/* ID + badges */}
// //                                 <td style={{ minWidth: 180 }}>
// //                                   <div className="d-flex align-items-center gap-2 flex-wrap">
// //                                     <code style={{ fontSize: 12 }}>{req.stock_req_id}</code>
// //                                     <span className={`badge ${pCfg.badge}`} style={{ fontSize: 10 }}>
// //                                       {req.priority_label || req.priority}
// //                                     </span>
// //                                     {tCfg.badge && (
// //                                       <span className={`badge ${tCfg.badge}`} style={{ fontSize: 10 }}>
// //                                         <i className={`${tCfg.icon} me-1`} />{tCfg.label}
// //                                       </span>
// //                                     )}
// //                                     {req.stock_id && (
// //                                       <span className="badge bg-primary" style={{ fontSize: 10 }}>
// //                                         <i className="fas fa-link me-1" />Linked
// //                                       </span>
// //                                     )}
// //                                     {isPending && (
// //                                       <span className="badge bg-warning text-dark" style={{ fontSize: 10 }}>
// //                                         Pending
// //                                       </span>
// //                                     )}
// //                                   </div>
// //                                 </td>

// //                                 {/* From/To */}
// //                                 <td className="name" style={{ minWidth: 160 }}>
// //                                   {isDispatcher ? req.sender_email : req.receiver_email}
// //                                 </td>

// //                                 {/* CC count hint */}
// //                                 <td style={{ minWidth: 60 }}>
// //                                   {req.cc_emails && (() => {
// //                                     try {
// //                                       const cc = typeof req.cc_emails === "string"
// //                                         ? JSON.parse(req.cc_emails) : req.cc_emails;
// //                                       return cc?.length > 0
// //                                         ? <span className="text-muted small"><i className="fas fa-users me-1" />{cc.length} CC</span>
// //                                         : null;
// //                                     } catch { return null; }
// //                                   })()}
// //                                 </td>

// //                                 {/* Article count */}
// //                                 <td style={{ minWidth: 100 }}>
// //                                   <span className="text-muted small">
// //                                     {(() => {
// //                                       try {
// //                                         const arr = typeof req.requested_articles === "string"
// //                                           ? JSON.parse(req.requested_articles)
// //                                           : req.requested_articles;
// //                                         return `${arr?.length || 0} article${arr?.length !== 1 ? "s" : ""}`;
// //                                       } catch { return "—"; }
// //                                     })()}
// //                                   </span>
// //                                 </td>

// //                                 {/* Scheduled */}
// //                                 <td style={{ minWidth: 120 }}>
// //                                   {req.scheduled_dispatch ? (
// //                                     <span className="text-success small">
// //                                       <i className="fas fa-truck me-1" />
// //                                       {fmtDate(req.scheduled_dispatch)}
// //                                     </span>
// //                                   ) : null}
// //                                 </td>

// //                                 {/* Date */}
// //                                 <td className="mail-date text-end">
// //                                   {new Date(req.email_sent_at || req.created_at).toLocaleString()}
// //                                 </td>
// //                               </tr>
// //                             );
// //                           })}
// //                         </tbody>
// //                       </table>
// //                     </div>
// //                   )}
// //                 </div>
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>

// //       {/* Detail Modal */}
// //       {selectedRequest && !respondTarget && (
// //         <DetailModal
// //           request={selectedRequest}
// //           isDispatcher={isDispatcher}
// //           onClose={() => setSelectedRequest(null)}
// //           onRespond={(req) => {
// //             setSelectedRequest(null);
// //             setRespondTarget(req);
// //           }}
// //         />
// //       )}

// //       {/* Respond Modal */}
// //       {respondTarget && (
// //         <RespondModal
// //           request={respondTarget}
// //           onClose={() => setRespondTarget(null)}
// //           onResponded={() => {
// //             setRespondTarget(null);
// //             fetchRequests(pagination.currentPage);
// //           }}
// //         />
// //       )}
// //     </div>
// //   );
// // };

// // export default StockRequest;












// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { Link } from "react-router-dom";
// import Select from "react-select";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
// import AuthService from "../../services/authService";



// const PRIORITY_FALLBACK = {
//   urgent:   { color: "#dc3545", badge: "bg-danger",               label: "Urgent"   },
//   standard: { color: "#fd7e14", badge: "bg-warning text-dark",    label: "Standard" },
//   low:      { color: "#198754", badge: "bg-success",              label: "Low"      },
// };

// const TEMPLATE_COLORS = {
//   stock_request_created:  { badge: "bg-info",    icon: "fas fa-paper-plane",  label: "Request Sent" },
//   stock_request_approved: { badge: "bg-success", icon: "fas fa-check-circle", label: "Approved"     },
//   stock_request_rejected: { badge: "bg-danger",  icon: "fas fa-times-circle", label: "Rejected"     },
// };

// const fmt     = (dt) => dt ? new Date(dt).toLocaleString()   : "—";
// const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";


// const getPriorityCfg = (key, apiPriorities = []) => {
//   const fromApi = apiPriorities.find((p) => p.value === key || p.name === key);
//   if (fromApi) return fromApi;
//   return PRIORITY_FALLBACK[key] || { color: "#6c757d", badge: "bg-secondary", label: key || "—" };
// };


// const useUsers = () => {
//   const [users, setUsers]     = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchUsers = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res      = await AuthService.getAllUsers();
//       const raw      = Array.isArray(res.data.data) ? res.data : res.data.users || [];
//       console.log("RAWWWWWWWWWWWWWWWWWW",raw)
 

//       const processed = raw.data.map((u) => ({
//         ...u,
//         username: u.username || u.name || u.email,
//         label:    u.username || u.name || u.email,
//         value:    u.uuid     || u.id,
//         email:    u.email,
//       }));
//       setUsers(processed);
//     } catch (err) {
//       console.error("useUsers: failed to load users", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);
//   //

//   useEffect(() => { fetchUsers(); }, [fetchUsers]);

//   return { users, loading, refetch: fetchUsers };
// };


// const usePriorities = () => {
//   const [priorities, setPriorities] = useState([]);

//   useEffect(() => {
//     AuthService.getStockRequestPriorities?.()
//       .then((res) => {
//         const data = res?.data?.priorities || res?.data || [];
//         if (data.length) setPriorities(data);
//       })
//       .catch(() => {
//         // Gracefully fall back — the PRIORITY_FALLBACK map will be used
//         setPriorities([]);
//       });
//   }, []);

//   /** Always returns at least the three built-in values */
//   const asList = priorities.length
//     ? priorities
//     : Object.entries(PRIORITY_FALLBACK).map(([k, v]) => ({ value: k, label: v.label, ...v }));

//   return { priorities: asList };
// };


// const CCRecipientsInput = ({ value = [], onChange }) => {
//   const [inputVal, setInputVal] = useState("");
//   const inputRef = useRef(null);

//   const addEmail = (raw) => {
//     const email = raw.trim().toLowerCase();
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     if (!email || !emailRegex.test(email)) return;
//     if (value.includes(email)) return;
//     onChange([...value, email]);
//     setInputVal("");
//   };

//   const handleKeyDown = (e) => {
//     if (["Enter", ",", " ", "Tab"].includes(e.key)) {
//       e.preventDefault();
//       addEmail(inputVal);
//     } else if (e.key === "Backspace" && !inputVal && value.length) {
//       onChange(value.slice(0, -1));
//     }
//   };

//   const remove = (email) => onChange(value.filter((v) => v !== email));

//   return (
//     <div
//       className="form-control d-flex flex-wrap gap-1 align-items-center"
//       style={{ minHeight: 42, cursor: "text", height: "auto" }}
//       onClick={() => inputRef.current?.focus()}
//     >
//       {value.map((email) => (
//         <span
//           key={email}
//           className="badge bg-light text-dark border d-flex align-items-center gap-1"
//           style={{ fontSize: 12, fontWeight: 400 }}
//         >
//           {email}
//           <button
//             type="button"
//             className="btn-close btn-close-sm"
//             style={{ fontSize: 8 }}
//             onClick={(e) => { e.stopPropagation(); remove(email); }}
//           />
//         </span>
//       ))}
//       <input
//         ref={inputRef}
//         type="text"
//         value={inputVal}
//         onChange={(e) => setInputVal(e.target.value)}
//         onKeyDown={handleKeyDown}
//         onBlur={() => addEmail(inputVal)}
//         placeholder={value.length ? "" : "Add emails, press Enter or comma…"}
//         style={{
//           border: "none",
//           outline: "none",
//           background: "transparent",
//           flex: 1,
//           minWidth: 180,
//           fontSize: 14,
//         }}
//       />
//     </div>
//   );
// };



// const ComposeForm = ({ onClose, onSent, articleOptions, users, userLoading, priorities }) => {
//   const [form, setForm] = useState({
//     dispatcher_uuid:    "", 
//     cc_recipients:      [],  
//     priority:           "",  
//     description:        "",  
//     follow_up_enabled:  true,
//     follow_up_days:     2,
//     escalation_enabled: false,
//     escalation_days:    3,
//     escalation_email:  "test.water00@gmail.com",
//     items: [{ prod_uuid: "", partial_code: "", article_profile_name: "", quantity: 1 }],
//   });
//   const [sending, setSending] = useState(false);

 
//   useEffect(() => {
//     if (priorities.length && !form.priority) {
//       setForm((p) => ({ ...p, priority: priorities[0].value }));
//     }
//   }, [priorities]); // eslint-disable-line react-hooks/exhaustive-deps

//   const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

  
//   const addItem    = () => set("items", [...form.items, { prod_uuid: "", partial_code: "", article_profile_name: "", quantity: 1 }]);
//   const removeItem = (i) => set("items", form.items.filter((_, idx) => idx !== i));
//   const updateItem = (i, field, val) => {
//     const items = [...form.items];
//     items[i] = { ...items[i], [field]: val };
//     set("items", items);
//   };
//   const handleArticleSelect = (i, opt) => {
//     const items = [...form.items];
//     items[i] = {
//       ...items[i],
//       prod_uuid:            opt?.value || "",
//       partial_code:         opt?.partial_code || "",
//       article_profile_name: opt?.label || "",
//     };
//     set("items", items);
//   };


//   const handleSubmit = async () => {
//     if (!form.dispatcher_uuid) return alert("Please select a dispatcher");
//     const validItems = form.items.filter((i) => i.article_profile_name && i.quantity > 0);
//     if (!validItems.length) return alert("Add at least one article with a valid quantity");
//     if (!form.priority) return alert("Please select a priority");

//     setSending(true);
//     try {
//       await AuthService.createStockRequest({
//         dispatcher_uuid:    form.dispatcher_uuid,
//         cc_recipients:      form.cc_recipients,      
//         priority:           form.priority,
//         description:        form.description || null,
//         follow_up_enabled:  form.follow_up_enabled,
//         follow_up_days:     form.follow_up_enabled ? form.follow_up_days : null,
//         escalation_enabled: form.escalation_enabled,
//         escalation_days:    form.escalation_enabled ? form.escalation_days : null,
//         escalation_email:   form.escalation_enabled ? form.escalation_email : null,
//         items:              validItems,
//       });
//       onSent();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to send stock request");
//     } finally {
//       setSending(false);
//     }
//   };

//   const userOptions = users.map((u) => ({
//     value: u.value,
//     label: `${u.name} — ${u.email}`,
//     email: u.email,
//   }));

//   return (
//     <div className="card bg-white">
//       <div className="card-body">

//         {/* Header */}
//         <div className="d-flex align-items-center justify-content-between mb-4">
//           <div>
//             <h4 className="mb-0">New Stock Request</h4>
//             <small className="text-muted">Request articles from a dispatcher</small>
//           </div>
//           <button className="btn-close" onClick={onClose} />
//         </div>

//         {/* Dispatcher */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">
//             Dispatcher <span className="text-danger">*</span>
//           </label>
//           <Select
//             options={userOptions}
//             value={userOptions.find((o) => o.value === form.dispatcher_uuid) || null}
//             onChange={(opt) => set("dispatcher_uuid", opt?.value || "")}
//             placeholder={userLoading ? "Loading users…" : "Select dispatcher…"}
//             isLoading={userLoading}
//             isSearchable
//             isClearable
//             menuPortalTarget={document.body}
//             styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//           />
//           {form.dispatcher_uuid && (() => {
//             const u = userOptions.find((o) => o.value === form.dispatcher_uuid);
//             return u ? (
//               <small className="text-muted mt-1 d-block">
//                 <i className="fas fa-envelope me-1" />{u.email}
//               </small>
//             ) : null;
//           })()}
//         </div>

//         {/* CC Recipients */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">
//             CC  <span className="text-danger">*</span>
//           </label>
//           <CCRecipientsInput
//             value={form.cc_recipients}
//             onChange={(v) => set("cc_recipients", v)}
//           />
//           <small className="text-muted">Press Enter, comma, or Tab to add each email</small>
//         </div>

//         {/*  Priority  */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">
//             Priority <span className="text-danger">*</span>
//           </label>
//           {priorities.length === 0 ? (
//             <div className="spinner-border spinner-border-sm text-secondary" role="status" />
//           ) : (
//             <div className="d-flex gap-2 flex-wrap">
//               {priorities.map((p) => {
//                 const cfg = getPriorityCfg(p.value, priorities);
//                 const isActive = form.priority === p.value;
//                 return (
//                   <button
//                     key={p.value}
//                     type="button"
//                     className={`btn btn-sm ${isActive ? cfg.badge + " text-white" : "btn-outline-secondary"}`}
//                     style={isActive ? { borderColor: cfg.color } : {}}
//                     onClick={() => set("priority", p.value)}
//                   >
//                     {p.label}
//                   </button>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Articles */}
//         <div className="mb-3">
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <label className="form-label fw-semibold mb-0">
//               Articles <span className="text-danger">*</span>
//             </label>
//             <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
//               <i className="fas fa-plus me-1" /> Add Row
//             </button>
//           </div>

//           <div className="table-responsive">
//             <table className="table table-bordered table-sm align-middle mb-0">
             
//               <tbody>
//                 {form.items.map((item, i) => (
//                   <tr key={i}>
//                     <td>
//                       <Select
//                         options={articleOptions}
//                         value={articleOptions.find((o) => o.value === item.prod_uuid) || null}
//                         onChange={(opt) => handleArticleSelect(i, opt)}
//                         placeholder="Select article…"
//                         isClearable
//                         isSearchable
//                         menuPortalTarget={document.body}
//                         styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//                       />
//                     </td>
//                     <td>
//                       <input
//                         type="number"
//                         className="form-control form-control-sm"
//                         min="1"
//                         value={item.quantity}
//                         onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
//                       />
//                     </td>
//                     <td>
//                       {form.items.length > 1 && (
//                         <button
//                           type="button"
//                           className="btn btn-sm btn-outline-danger"
//                           onClick={() => removeItem(i)}
//                         >
//                           <i className="fas fa-times" />
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/*  Description */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">
//             Description <span className="text-muted fw-normal">(optional)</span>
//           </label>
//           <textarea
//             className="form-control"
//             rows="3"
//             maxLength={255}
//             value={form.description}
//             onChange={(e) => set("description", e.target.value)}
//             placeholder="Any additional instructions…"
//           />
//           <small className="text-muted">{form.description.length}/255</small>
//         </div>

//         {/*  Automation  */}
//         <div className="mb-4">
//           <h6
//             className="text-muted text-uppercase mb-3"
//             style={{ fontSize: 11, letterSpacing: ".5px" }}
//           >
//             Automation
//           </h6>
//           <div className="row g-3">
//             {/* Follow-up */}
//             <div className="col-md-6">
//               <div className="border rounded p-3">
//                 <div className="form-check mb-0">
//                   <input
//                     className="form-check-input"
//                     type="checkbox"
//                     id="followUp"
//                     checked={form.follow_up_enabled}
//                     onChange={(e) => set("follow_up_enabled", e.target.checked)}
//                   />
//                   <label className="form-check-label fw-semibold" htmlFor="followUp">
//                     Follow-up reminder
//                   </label>
//                 </div>
//                 {form.follow_up_enabled && (
//                   <div className="mt-2 d-flex align-items-center gap-2">
//                     <span className="text-muted small">After</span>
//                     <input
//                       type="number"
//                       className="form-control form-control-sm"
//                       style={{ width: 70 }}
//                       min="1"
//                       max="30"
//                       value={form.follow_up_days}
//                       onChange={(e) => set("follow_up_days", parseInt(e.target.value) || 1)}
//                     />
//                     <span className="text-muted small">days</span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Escalation */}
//             <div className="col-md-6">
//               <div className="border rounded p-3">
//                 <div className="form-check mb-0">
//                   <input
//                     className="form-check-input"
//                     type="checkbox"
//                     id="escalation"
//                     checked={form.escalation_enabled}
//                     onChange={(e) => set("escalation_enabled", e.target.checked)}
//                   />
//                   <label className="form-check-label fw-semibold" htmlFor="escalation">
//                     Auto-escalation
//                   </label>
//                 </div>
//                 {form.escalation_enabled && (
//                   <div className="mt-2">
//                     <input
//                       type="email"
//                       className="form-control form-control-sm mb-2"
//                       placeholder="Escalation email"
//                       value={form.escalation_email}
//                       onChange={(e) => set("escalation_email", e.target.value)}
//                     />
//                     <div className="d-flex align-items-center gap-2">
//                       <span className="text-muted small">After</span>
//                       <input
//                         type="number"
//                         className="form-control form-control-sm"
//                         style={{ width: 70 }}
//                         min="1"
//                         max="30"
//                         value={form.escalation_days}
//                         onChange={(e) => set("escalation_days", parseInt(e.target.value) || 1)}
//                       />
//                       <span className="text-muted small">days</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/*  Actions */}
//         <div className="d-flex gap-2">
//           <button className="btn btn-primary" onClick={handleSubmit} disabled={sending}>
//             {sending ? (
//               <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
//             ) : (
//               <><i className="fas fa-paper-plane me-2" />Send Request</>
//             )}
//           </button>
//           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// };



// // RESPOND 

// const RespondModal = ({ request, onClose, onResponded }) => {
//   const [action,            setAction]            = useState("approve");
//   const [scheduledDispatch, setScheduledDispatch] = useState("");
//   const [description,       setDescription]       = useState("");
//   const [submitting,        setSubmitting]         = useState(false);

//   const today = new Date().toISOString().split("T")[0];

//   const handleSubmit = async () => {
//     if (action === "approve" && !scheduledDispatch) {
//       return alert("Please set a scheduled dispatch date");
//     }
//     setSubmitting(true);
//     try {
//       await AuthService.respondToStockRequest(request.stock_req_id, {
//         action,
//         scheduled_dispatch: action === "approve" ? scheduledDispatch : undefined,
//         description:        description || undefined,
//       });
//       onResponded();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to respond");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const items =
//     typeof request.requested_articles === "string"
//       ? JSON.parse(request.requested_articles)
//       : request.requested_articles || [];

//   const ccList =
//     typeof request.cc_recipients === "string"
//       ? JSON.parse(request.cc_recipients)
//       : request.cc_recipients || [];

//   return (
//     <div
//       className="modal fade show"
//       style={{ display: "block", background: "rgba(0,0,0,.55)" }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-dialog modal-lg modal-dialog-scrollable"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="modal-content">
//           <div className="modal-header">
//             <div>
//               <h5 className="modal-title">Respond to Stock Request</h5>
//               <small className="text-muted">{request.stock_req_id}</small>
//             </div>
//             <button className="btn-close" onClick={onClose} />
//           </div>

//           <div className="modal-body">
//             {/* Summary cards */}
//             <div className="d-flex gap-3 mb-3 flex-wrap">
//               <div className="flex-fill border rounded p-3" style={{ minWidth: 140 }}>
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
//                   Requester
//                 </p>
//                 <p className="mb-0 fw-semibold small">{request.sender_email}</p>
//               </div>
//               <div className="flex-fill border rounded p-3" style={{ minWidth: 140 }}>
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
//                   Priority
//                 </p>
//                 <span className={`badge ${PRIORITY_FALLBACK[request.priority]?.badge || "bg-secondary"}`}>
//                   {PRIORITY_FALLBACK[request.priority]?.label || request.priority}
//                 </span>
//               </div>
//               <div className="flex-fill border rounded p-3" style={{ minWidth: 140 }}>
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
//                   Requested
//                 </p>
//                 <p className="mb-0 small">{fmt(request.created_at)}</p>
//               </div>
//             </div>

//             {/* CC */}
//             {ccList.length > 0 && (
//               <div className="mb-3">
//                 <p className="fw-semibold mb-1 small">CC Recipients</p>
//                 <div className="d-flex flex-wrap gap-1">
//                   {ccList.map((email) => (
//                     <span key={email} className="badge bg-light text-dark border" style={{ fontSize: 12 }}>
//                       {email}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Articles */}
//             <div className="mb-3">
//               <p className="fw-semibold mb-2">Requested Articles</p>
//               <table className="table table-sm table-bordered mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>Article</th>
//                     <th>Code</th>
//                     <th className="text-center">Qty</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {items.map((item, i) => (
//                     <tr key={i}>
//                       <td>{item.article_profile_name || item.productName || "—"}</td>
//                       <td><code>{item.partial_code || "—"}</code></td>
//                       <td className="text-center">{item.quantity || item.count}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             {/* Response section */}
//             <div className="mb-3">
//               <p className="fw-semibold mb-2">Your Response</p>
//               <div className="d-flex gap-2 mb-3">
//                 <button
//                   type="button"
//                   className={`btn ${action === "approve" ? "btn-success" : "btn-outline-secondary"}`}
//                   onClick={() => setAction("approve")}
//                 >
//                   <i className="fas fa-check me-2" />Approve
//                 </button>
//                 <button
//                   type="button"
//                   className={`btn ${action === "reject" ? "btn-danger" : "btn-outline-secondary"}`}
//                   onClick={() => setAction("reject")}
//                 >
//                   <i className="fas fa-times me-2" />Reject
//                 </button>
//               </div>

//               {action === "approve" && (
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Scheduled Dispatch Date <span className="text-danger">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     className="form-control"
//                     style={{ maxWidth: 220 }}
//                     min={today}
//                     value={scheduledDispatch}
//                     onChange={(e) => setScheduledDispatch(e.target.value)}
//                   />
//                 </div>
//               )}

//               <div>
//                 <label className="form-label">
//                   {action === "approve" ? "Approval Notes" : "Rejection Reason"}{" "}
//                   <span className="text-muted fw-normal">(optional, max 255 chars)</span>
//                 </label>
//                 <textarea
//                   className="form-control"
//                   rows="3"
//                   maxLength={255}
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder={
//                     action === "approve"
//                       ? "Any instructions for dispatch…"
//                       : "Reason for rejection…"
//                   }
//                 />
//               </div>
//             </div>
//           </div>

//           <div className="modal-footer">
//             <button
//               className={`btn ${action === "approve" ? "btn-success" : "btn-danger"}`}
//               onClick={handleSubmit}
//               disabled={submitting}
//             >
//               {submitting ? (
//                 <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//               ) : action === "approve" ? (
//                 "Confirm Approval"
//               ) : (
//                 "Confirm Rejection"
//               )}
//             </button>
//             <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// // DETAIL MODAL

// const DetailModal = ({ request, isDispatcher, onClose, onRespond, priorities }) => {
//   const items =
//     typeof request.requested_articles === "string"
//       ? JSON.parse(request.requested_articles)
//       : request.requested_articles || [];

//   const ccList =
//     typeof request.cc_recipients === "string"
//       ? JSON.parse(request.cc_recipients)
//       : request.cc_recipients || [];

//   const pCfg    = getPriorityCfg(request.priority, priorities);
//   const tCfg    = TEMPLATE_COLORS[request.template_type] || {};
//   const isPending = !request.approved_at;

//   return (
//     <div
//       className="modal fade show"
//       style={{ display: "block", background: "rgba(0,0,0,.55)" }}
//       onClick={onClose}
//     >
//       <div
//         className="modal-dialog modal-lg modal-dialog-scrollable"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="modal-content">
//           <div
//             className="modal-header"
//             style={{ borderLeft: `4px solid ${pCfg.color || "#6c757d"}` }}
//           >
//             <div>
//               <h5 className="modal-title mb-0">{request.stock_req_id}</h5>
//               <div className="d-flex gap-2 mt-1 flex-wrap">
//                 <span className={`badge ${pCfg.badge}`}>{pCfg.label}</span>
//                 {tCfg.badge && (
//                   <span className={`badge ${tCfg.badge}`}>
//                     <i className={`${tCfg.icon} me-1`} />{tCfg.label}
//                   </span>
//                 )}
//                 {request.stock_id && (
//                   <span className="badge bg-primary">
//                     <i className="fas fa-link me-1" />{request.stock_id}
//                   </span>
//                 )}
//               </div>
//             </div>
//             <button className="btn-close" onClick={onClose} />
//           </div>

//           <div className="modal-body">
//             {/* Meta row */}
//             <div className="row g-2 mb-3">
//               {[
//                 { label: "From",    val: request.sender_email   },
//                 { label: "To",      val: request.receiver_email },
//                 { label: "Created", val: fmt(request.created_at) },
//                 {
//                   label: request.approved_at ? "Approved" : "Status",
//                   val: request.approved_at
//                     ? fmtDate(request.approved_at)
//                     : <span className="text-warning fw-semibold">Pending</span>,
//                 },
//               ].map(({ label, val }) => (
//                 <div className="col-6 col-md-3" key={label}>
//                   <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>
//                     {label}
//                   </p>
//                   <p className="mb-0 small fw-semibold">{val}</p>
//                 </div>
//               ))}
//             </div>

//             {/* CC */}
//             {ccList.length > 0 && (
//               <div className="mb-3">
//                 <p
//                   className="text-muted mb-1"
//                   style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}
//                 >
//                   CC Recipients
//                 </p>
//                 <div className="d-flex flex-wrap gap-1">
//                   {ccList.map((email) => (
//                     <span key={email} className="badge bg-light text-dark border" style={{ fontSize: 12 }}>
//                       {email}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {/* Scheduled dispatch alert */}
//             {request.scheduled_dispatch && (
//               <div className="alert alert-success py-2">
//                 <i className="fas fa-truck me-2" />
//                 <strong>Scheduled Dispatch:</strong> {fmtDate(request.scheduled_dispatch)}
//               </div>
//             )}

//             {/* Description */}
//             {request.description && (
//               <div className="mb-3">
//                 <p
//                   className="text-muted mb-1"
//                   style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}
//                 >
//                   Description
//                 </p>
//                 <p className="mb-0 small">{request.description}</p>
//               </div>
//             )}

//             {/* Articles */}
//             <h6
//               className="text-muted text-uppercase mb-2"
//               style={{ fontSize: 11, letterSpacing: ".5px" }}
//             >
//               Articles ({items.length})
//             </h6>
//             <table className="table table-sm table-bordered mb-3">
//               <thead className="table-light">
//                 <tr>
//                   <th>Article</th>
//                   <th>Code</th>
//                   <th className="text-center">Qty</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {items.map((item, i) => (
//                   <tr key={i}>
//                     <td>{item.article_profile_name || item.productName || "—"}</td>
//                     <td><code>{item.partial_code || "—"}</code></td>
//                     <td className="text-center">{item.quantity || item.count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {/* Automation badges */}
//             {(request.follow_up_enabled || request.escalation_enabled) && (
//               <div className="d-flex gap-2 flex-wrap">
//                 {request.follow_up_enabled && (
//                   <span className="badge bg-light text-dark border">
//                     <i className="fas fa-clock me-1 text-warning" />
//                     Follow-up: {request.follow_up_days}d
//                   </span>
//                 )}
//                 {request.escalation_enabled && (
//                   <span className="badge bg-light text-dark border">
//                     <i className="fas fa-bell me-1 text-danger" />
//                     Escalation: {request.escalation_days}d
//                   </span>
//                 )}
//               </div>
//             )}
//           </div>

//           <div className="modal-footer">
//             {isDispatcher && isPending && (
//               <button className="btn btn-success" onClick={() => onRespond(request)}>
//                 <i className="fas fa-reply me-2" />Respond
//               </button>
//             )}
//             <button className="btn btn-secondary" onClick={onClose}>Close</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// // REQUEST ROW 

// const RequestRow = ({ req, isDispatcher, onRowClick, onStar, priorities }) => {
//   const pCfg    = getPriorityCfg(req.priority, priorities);
//   const tCfg    = TEMPLATE_COLORS[req.template_type] || {};
//   const isPending = !req.approved_at && !req.stock_id;

//   const articleCount = (() => {
//     try {
//       const arr =
//         typeof req.requested_articles === "string"
//           ? JSON.parse(req.requested_articles)
//           : req.requested_articles;
//       return arr?.length || 0;
//     } catch { return 0; }
//   })();

//   const ccList = (() => {
//     try {
//       return typeof req.cc_recipients === "string"
//         ? JSON.parse(req.cc_recipients)
//         : req.cc_recipients || [];
//     } catch { return []; }
//   })();

//   return (
//     <tr
//       className={`clickable-row ${!req.is_read && isDispatcher ? "unread" : ""}`}
//       onClick={() => onRowClick(req)}
//       style={{ cursor: "pointer" }}
//     >
//       {/* Star */}
//       <td style={{ width: 36 }} onClick={(e) => onStar(e, req)}>
//         <i className={`${req.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
//       </td>

//       {/* Priority stripe */}
//       <td style={{ width: 6, padding: 0 }}>
//         <div
//           style={{
//             width: 4,
//             height: 38,
//             background: pCfg.color || "#dee2e6",
//             borderRadius: 2,
//             margin: "0 auto",
//           }}
//         />
//       </td>

//       {/* ID + badges */}
//       <td style={{ minWidth: 180 }}>
//         <div className="d-flex align-items-center gap-2 flex-wrap">
//           <code style={{ fontSize: 12 }}>{req.stock_req_id}</code>
//           <span className={`badge ${pCfg.badge}`} style={{ fontSize: 10 }}>{pCfg.label}</span>
//           {tCfg.badge && (
//             <span className={`badge ${tCfg.badge}`} style={{ fontSize: 10 }}>
//               <i className={`${tCfg.icon} me-1`} />{tCfg.label}
//             </span>
//           )}
//           {req.stock_id && (
//             <span className="badge bg-primary" style={{ fontSize: 10 }}>
//               <i className="fas fa-link me-1" />Linked
//             </span>
//           )}
//           {isPending && (
//             <span className="badge bg-warning text-dark" style={{ fontSize: 10 }}>Pending</span>
//           )}
//         </div>
//       </td>

//       {/* From / To */}
//       <td className="name" style={{ minWidth: 160 }}>
//         <div>
//           <span className="small">{isDispatcher ? req.sender_email : req.receiver_email}</span>
//           {ccList.length > 0 && (
//             <div>
//               <span className="text-muted" style={{ fontSize: 11 }}>
//                 <i className="fas fa-users me-1" />CC: {ccList.length}
//               </span>
//             </div>
//           )}
//         </div>
//       </td>

//       {/* Article count */}
//       <td style={{ minWidth: 100 }}>
//         <span className="text-muted small">
//           {articleCount} article{articleCount !== 1 ? "s" : ""}
//         </span>
//       </td>

//       {/* Scheduled dispatch */}
//       <td style={{ minWidth: 120 }}>
//         {req.scheduled_dispatch && (
//           <span className="text-success small">
//             <i className="fas fa-truck me-1" />{fmtDate(req.scheduled_dispatch)}
//           </span>
//         )}
//       </td>

//       {/* Date */}
//       <td className="mail-date text-end">
//         {new Date(req.email_sent_at || req.created_at).toLocaleString()}
//       </td>
//     </tr>
//   );
// };

// //  MAIN COMPONENT

// const StockRequest = () => {
//   const dispatch = useDispatch();
//   const { article_list } = useSelector((state) => state.articles);

//   // View & list state
//   const [view, setView]             = useState("sent"); 
//   const [requests, setRequests]     = useState([]);
//   const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
//   const [loading, setLoading]       = useState(false);

//   // Modal state
//   const [showCompose,      setShowCompose]      = useState(false);
//   const [selectedRequest,  setSelectedRequest]  = useState(null);
//   const [respondTarget,    setRespondTarget]    = useState(null);

//   // Filters 
//   const [filterPriority, setFilterPriority] = useState("");
//   const [filterStatus,   setFilterStatus]   = useState("");


//   const { users, loading: userLoading } = useUsers();
//   const { priorities }                  = usePriorities();

//   const isDispatcher = view === "inbox";

//   // Article options
//   const articleOptions = article_list.map((a) => ({
//     value:        a.id || a.uuid,
//     label:        a.title || a.article_profile_name,
//     partial_code: a.partial_code || a.code || "",
//   }));


//   const fetchRequests = useCallback(
//     async (page = 1) => {
//       setLoading(true);
//       try {
//         const params = {
//           page,
//           limit: 10,
//           role: isDispatcher ? "dispatcher" : "requester",
//           ...(filterPriority ? { priority: filterPriority } : {}),
//           ...(filterStatus   ? { status:   filterStatus   } : {}),
//         };

//         const res = isDispatcher
//           ? await AuthService.getStockRequestInbox(params)
//           : await AuthService.getStockRequests(params);

//         setRequests(res.data.data || []);
//         const p = res.data.pagination;
//         setPagination({ currentPage: p.page, totalPages: p.totalPages, total: p.total });
//       } catch (err) {
//         console.error("StockRequest: fetchRequests failed", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [isDispatcher, filterPriority, filterStatus],
//   );

//   useEffect(() => { fetchRequests(); }, [fetchRequests]);


//   const handleCompose = () => {
//     dispatch(fetchUnfilteredArticles({}));
//     setShowCompose(true);
//   };


//   const handleRowClick = (req) => {
//     setSelectedRequest(req);
//     if (!req.is_read) {
//       AuthService.markStockRequestRead(req.stock_req_id).catch(() => {});
//       setRequests((prev) =>
//         prev.map((r) => (r.stock_req_id === req.stock_req_id ? { ...r, is_read: true } : r)),
//       );
//     }
//   };

//   const handleStar = (e, req) => {
//     e.stopPropagation();
//     const next = !req.is_starred;
//     AuthService.toggleStockRequestStar(req.stock_req_id, next).catch(() => {});
//     setRequests((prev) =>
//       prev.map((r) => (r.stock_req_id === req.stock_req_id ? { ...r, is_starred: next } : r)),
//     );
//   };

//   const unreadCount = requests.filter((r) => !r.is_read && isDispatcher).length;

 
//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="row align-items-center">
//             <div className="col">
//               <h3 className="page-title mb-0">Stock Requests</h3>
//             </div>
//           </div>
//         </div>

//         <div className="row">
   
//           <div className="col-lg-3 col-md-12">
//             <div className="mb-3">
//               <button
//                 className="btn btn-primary btn-block w-100 mb-2"
//                 onClick={handleCompose}
//               >
//                 <i className="fas fa-plus me-2" />New Stock Request
//               </button>
//             </div>

//             <ul className="inbox-menu">
//               {[
//                 { key: "sent",    icon: "far fa-paper-plane", label: "My Requests"       },
//                 { key: "inbox",   icon: "fas fa-inbox",       label: "Incoming"           },
//                 { key: "starred", icon: "far fa-star",        label: "Starred"            },
//               ].map(({ key, icon, label }) => (
//                 <li key={key} className={view === key ? "active" : ""}>
//                   <Link to="#" onClick={(e) => { e.preventDefault(); setView(key); }}>
//                     <i className={`${icon} me-2`} />
//                     {label}
//                     {key === "inbox" && unreadCount > 0 && (
//                       <span className="mail-count ms-1">({unreadCount})</span>
//                     )}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             {/* Filters */}
//             <div className="mt-3">
//               <p
//                 className="text-muted mb-2"
//                 style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}
//               >
//                 Filter
//               </p>

//               <select
//                 className="form-select form-select-sm mb-2"
//                 value={filterPriority}
//                 onChange={(e) => setFilterPriority(e.target.value)}
//               >
//                 <option value="">All Priorities</option>
//                 {priorities.map((p) => (
//                   <option key={p.value} value={p.value}>{p.label}</option>
//                 ))}
//               </select>

//               <select
//                 className="form-select form-select-sm"
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//               >
//                 <option value="">All Statuses</option>
//                 <option value="pending">Pending</option>
//                 <option value="approved">Approved</option>
//                 <option value="linked">Linked to StockFlow</option>
//               </select>
//             </div>
//           </div>


//           <div className="col-lg-9 col-md-12">
//             {showCompose ? (
//               <ComposeForm
//                 onClose={() => setShowCompose(false)}
//                 onSent={() => {
//                   setShowCompose(false);
//                   setView("sent");
//                   fetchRequests();
//                 }}
//                 articleOptions={articleOptions}
//                 users={users}
//                 userLoading={userLoading}
//                 priorities={priorities}
//               />
//             ) : (
//               <div className="card bg-white">
//                 <div className="card-body">
//                   {/* Toolbar */}
//                   <div className="d-flex justify-content-between align-items-center mb-3">
//                     <h5 className="mb-0">
//                       {view === "sent" ? "My Requests" : view === "inbox" ? "Incoming Requests" : "Starred"}
//                       <span className="badge bg-secondary ms-2" style={{ fontSize: 12 }}>
//                         {pagination.total}
//                       </span>
//                     </h5>
//                     <div className="d-flex gap-1">
//                       <button
//                         className="btn btn-sm btn-white"
//                         title="Refresh"
//                         onClick={() => fetchRequests(pagination.currentPage)}
//                       >
//                         <i className="fas fa-sync-alt" />
//                       </button>
//                       <button
//                         className="btn btn-sm btn-white"
//                         disabled={pagination.currentPage === 1}
//                         onClick={() => fetchRequests(pagination.currentPage - 1)}
//                       >
//                         <i className="fas fa-angle-left" />
//                       </button>
//                       <button
//                         className="btn btn-sm btn-white"
//                         disabled={pagination.currentPage >= pagination.totalPages}
//                         onClick={() => fetchRequests(pagination.currentPage + 1)}
//                       >
//                         <i className="fas fa-angle-right" />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Table */}
//                   {loading ? (
//                     <div className="text-center py-5">
//                       <div className="spinner-border text-primary" role="status">
//                         <span className="visually-hidden">Loading…</span>
//                       </div>
//                     </div>
//                   ) : requests.length === 0 ? (
//                     <div className="text-center py-5">
//                       <i className="fas fa-inbox fa-2x text-muted mb-3 d-block" />
//                       <p className="text-muted">No stock requests found</p>
//                     </div>
//                   ) : (
//                     <div className="table-responsive">
//                       <table className="table table-inbox table-hover align-middle">
//                         <tbody>
//                           {requests.map((req) => (
//                             <RequestRow
//                               key={req.stock_req_id}
//                               req={req}
//                               isDispatcher={isDispatcher}
//                               onRowClick={handleRowClick}
//                               onStar={handleStar}
//                               priorities={priorities}
//                             />
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>


//       {selectedRequest && !respondTarget && (
//         <DetailModal
//           request={selectedRequest}
//           isDispatcher={isDispatcher}
//           onClose={() => setSelectedRequest(null)}
//           onRespond={(req) => {
//             setSelectedRequest(null);
//             setRespondTarget(req);
//           }}
//           priorities={priorities}
//         />
//       )}

    
//       {respondTarget && (
//         <RespondModal
//           request={respondTarget}
//           onClose={() => setRespondTarget(null)}
//           onResponded={() => {
//             setRespondTarget(null);
//             fetchRequests(pagination.currentPage);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StockRequest;









// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { Link } from "react-router-dom";
// import Select from "react-select";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
// import AuthService from "../../services/authService";

// // ─────────────────────────────────────────────────────────────
// //  Constants
// // ─────────────────────────────────────────────────────────────

// const PRIORITY_FALLBACK = {
//   urgent:   { color: "#dc3545", badge: "bg-danger",            label: "Urgent"   },
//   standard: { color: "#fd7e14", badge: "bg-warning text-dark", label: "Standard" },
//   low:      { color: "#198754", badge: "bg-success",           label: "Low"      },
// };

// const TEMPLATE_COLORS = {
//   stock_request_created:  { badge: "bg-info",    icon: "fas fa-paper-plane",  label: "Request Sent" },
//   stock_request_approved: { badge: "bg-success", icon: "fas fa-check-circle", label: "Approved"     },
//   stock_request_rejected: { badge: "bg-danger",  icon: "fas fa-times-circle", label: "Rejected"     },
// };

// const fmt     = (dt) => dt ? new Date(dt).toLocaleString()   : "—";
// const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

// const getPriorityCfg = (key, apiPriorities = []) => {
//   const fromApi = apiPriorities.find((p) => p.value === key || p.name === key);
//   if (fromApi) return fromApi;
//   return PRIORITY_FALLBACK[key] || { color: "#6c757d", badge: "bg-secondary", label: key || "—" };
// };


// const useUsers = () => {
//   const [users, setUsers]     = useState([]);
//   const [loading, setLoading] = useState(false);

// const fetchUsers = useCallback(async () => {
//   setLoading(true);
//   try {
//     const res = await AuthService.getAllUsers();
//     const raw = res.data.data || [];

//     const processed = raw.map((u) => ({
//       ...u,
//       username: u.user_name || u.user_email,
//       label: u.user_name || u.user_email,
//       value: u.user_id,
//       email: u.user_email,
//       warehouse_id: u.warehouse_id,
//       warehouse_title: u.warehouse_title,
//     }));

//     setUsers(processed);
//   } catch (err) {
//     console.error("useUsers: failed to load users", err);
//   } finally {
//     setLoading(false);
//   }
// }, []);

//   useEffect(() => { fetchUsers(); }, [fetchUsers]);
//   return { users, loading, refetch: fetchUsers };
// };

// const usePriorities = () => {
//   const [priorities, setPriorities] = useState([]);

//   useEffect(() => {
//     AuthService.getStockRequestPriorities?.()
//       .then((res) => {
//         const data = res?.data?.priorities || res?.data || [];
//         if (data.length) setPriorities(data);
//       })
//       .catch(() => setPriorities([]));
//   }, []);

//   const asList = priorities.length
//     ? priorities
//     : Object.entries(PRIORITY_FALLBACK).map(([k, v]) => ({ value: k, label: v.label, ...v }));

//   return { priorities: asList };
// };



// const CCRecipientsInput = ({ value = [], onChange }) => {
//   const [inputVal, setInputVal] = useState("");
//   const inputRef = useRef(null);

//   const addEmail = (raw) => {
//     const email = raw.trim().toLowerCase();
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || value.includes(email)) return;
//     onChange([...value, email]);
//     setInputVal("");
//   };

//   const handleKeyDown = (e) => {
//     if (["Enter", ",", " ", "Tab"].includes(e.key)) {
//       e.preventDefault();
//       addEmail(inputVal);
//     } else if (e.key === "Backspace" && !inputVal && value.length) {
//       onChange(value.slice(0, -1));
//     }
//   };

//   const remove = (email) => onChange(value.filter((v) => v !== email));

//   return (
//     <div
//       className="form-control d-flex flex-wrap gap-1 align-items-center"
//       style={{ minHeight: 42, cursor: "text", height: "auto" }}
//       onClick={() => inputRef.current?.focus()}
//     >
//       {value.map((email) => (
//         <span key={email} className="badge bg-light text-dark border d-flex align-items-center gap-1" style={{ fontSize: 12, fontWeight: 400 }}>
//           {email}
//           <button type="button" className="btn-close btn-close-sm" style={{ fontSize: 8 }}
//             onClick={(e) => { e.stopPropagation(); remove(email); }} />
//         </span>
//       ))}
//       <input
//         ref={inputRef}
//         type="text"
//         value={inputVal}
//         onChange={(e) => setInputVal(e.target.value)}
//         onKeyDown={handleKeyDown}
//         onBlur={() => addEmail(inputVal)}
//         placeholder={value.length ? "" : "Add emails, press Enter or comma…"}
//         style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 180, fontSize: 14 }}
//       />
//     </div>
//   );
// };


// const ComposeForm = ({ onClose, onSent, articleOptions, users, userLoading, priorities }) => {
//   const [form, setForm] = useState({
//     selected_user:    "",
//     cc_recipients:      [],
//     priority:           "",
//     follow_up_selected:  true,
//     follow_up_days:     2,
//     escalation_selected: false,
//     escalation_days:    3,
//     req_articles: [{ article_profile_id: "", article_profile_name: "", quantity: 1, }],
//     description:        "",
//   });
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     if (priorities.length && !form.priority) {
//       setForm((p) => ({ ...p, priority: priorities[0].value }));
//     }
//   }, [priorities]); // eslint-disable-line

//   const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

//   const addItem    = () => set("req_articles", [...form.req_articles, { article_profile_id: "", article_profile_name: "", quantity: 1, }]);
//   const removeItem = (i) => set("req_articles", form.req_articles.filter((_, idx) => idx !== i));
//   const updateItem = (i, field, val) => {
//     const req_articles = [...form.req_articles];
//     req_articles[i] = { ...req_articles[i], [field]: val };
//     set("req_articles", req_articles);
//   };
//   // const handleArticleSelect = (i, opt) => {
//   //   const req_articles = [...form.req_articles];
//   //   req_articles[i] = { ...req_articles[i], prod_uuid: opt?.value || "", partial_code: opt?.partial_code || "", article_profile_name: opt?.label || "" };
//   //   set("req_articles", req_articles);
//   // };

//   const handleArticleSelect = (i, opt) => {
//   const req_articles = [...form.req_articles];
//   req_articles[i] = {
//     ...req_articles[i],
//     article_profile_id: opt?.value || "",  
//     article_profile_name: opt?.label || "",
//   };
//   set("req_articles", req_articles);
// };

//   const handleSubmit = async () => {
//     if (!form.selected_user) return alert("Please select a dispatcher");
    
//     const validItems = form.req_articles.filter(
//   (i) => i.article_profile_id && i.article_profile_name && i.quantity > 0
// );
//     if (!validItems.length) return alert("Add at least one article with a valid quantity");
//     if (!form.priority) return alert("Please select a priority");




//     setSending(true);
//     try {
//       await AuthService.createStockRequest({
//         selected_user:    form.selected_user,
//         cc_recipients:      form.cc_recipients,
//         priority:           form.priority,
//         description:        form.description || undefined,
//         follow_up_selected:  form.follow_up_selected,
//         follow_up_days:     form.follow_up_selected ? form.follow_up_days : null,
//         escalation_selected: form.escalation_selected,
//         escalation_days:    form.escalation_selected ? form.escalation_days : null,

//         req_articles:              validItems,
//       });
//       onSent();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to send stock request");
//     } finally {
//       setSending(false);
//     }
//   };

// const userOptions = users.map((u) => ({
//   value: u.value,
//   label: `${u.username} — ${u.email} | ${u.warehouse_title}`,
//   email: u.email,
//   warehouse_id: u.warehouse_id,
//   warehouse_name: u.warehouse_title
// }));
//   console.log("userOprtion", userOptions)

//   return (
//     <div className="card bg-white">
//       <div className="card-body">
//         <div className="d-flex align-items-center justify-content-between mb-4">
//           <div>
//             <h4 className="mb-0">New Stock Request</h4>
//             <small className="text-muted">Request articles from a dispatcher</small>
//           </div>
//           <button className="btn-close" onClick={onClose} />
//         </div>

//         {/* Dispatcher */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">Dispatcher <span className="text-danger">*</span></label>
//           <Select
//             options={userOptions}
//             value={userOptions.find((o) => o.value === form.selected_user) || null}
//             onChange={(opt) => set("selected_user", opt?.value || "")}
//             placeholder={userLoading ? "Loading users…" : "Select dispatcher…"}
//             isLoading={userLoading}
//             isSearchable isClearable
//             menuPortalTarget={document.body}
//             styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//           />
//           {form.selected_user && (() => {
//             const u = userOptions.find((o) => o.value === form.selected_user);
//             return u ? <small className="text-muted mt-1 d-block"><i className="fas fa-envelope me-1" />{u.email}</small> : null;
//           })()}
//         </div>

//         {/* CC */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">CC <span className="text-danger">*</span></label>
//           <CCRecipientsInput value={form.cc_recipients} onChange={(v) => set("cc_recipients", v)} />
//           <small className="text-muted">Press Enter, comma, or Tab to add each email</small>
//         </div>

//         {/* Priority */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">Priority <span className="text-danger">*</span></label>
//           {priorities.length === 0 ? (
//             <div className="spinner-border spinner-border-sm text-secondary" role="status" />
//           ) : (
//             <div className="d-flex gap-2 flex-wrap">
//               {priorities.map((p) => {
//                 const cfg = getPriorityCfg(p.value, priorities);
//                 const isActive = form.priority === p.value;
//                 return (
//                   <button key={p.value} type="button"
//                     className={`btn btn-sm ${isActive ? cfg.badge + " text-white" : "btn-outline-secondary"}`}
//                     style={isActive ? { borderColor: cfg.color } : {}}
//                     onClick={() => set("priority", p.value)}>
//                     {p.label}
//                   </button>
//                 );
//               })}
//             </div>
//           )}
//         </div>

//         {/* Articles */}
//         <div className="mb-3">
//           <div className="d-flex justify-content-between align-items-center mb-2">
//             <label className="form-label fw-semibold mb-0">Articles <span className="text-danger">*</span></label>
//             <button type="button" className="btn btn-sm btn-outline-primary" onClick={addItem}>
//               <i className="fas fa-plus me-1" /> Add Row
//             </button>
//           </div>
//           <div className="table-responsive">
//             <table className="table table-bordered table-sm align-middle mb-0">
//               <tbody>
//                 {form.req_articles.map((item, i) => (
//                   <tr key={i}>
//                     <td>
//                       <Select
//                         options={articleOptions}
//                         value={articleOptions.find((o) => o.value === item.article_profile_id) || null}
//                         onChange={(opt) => handleArticleSelect(i, opt)}
//                         placeholder="Select article…"
//                         isClearable isSearchable
//                         menuPortalTarget={document.body}
//                         styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
//                       />
//                     </td>
//                     <td>
//                       <input type="number" className="form-control form-control-sm" min="1"
//                         value={item.quantity}
//                         onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
//                     </td>
//                     <td>
//                       {form.req_articles.length > 1 && (
//                         <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)}>
//                           <i className="fas fa-times" />
//                         </button>
//                       )}
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Description */}
//         <div className="mb-3">
//           <label className="form-label fw-semibold">Description <span className="text-muted fw-normal">(optional)</span></label>
//           <textarea className="form-control" rows="3" maxLength={255}
//             value={form.description}
//             onChange={(e) => set("description", e.target.value)}
//             placeholder="Any additional instructions…" />
//           <small className="text-muted">{form.description.length}/255</small>
//         </div>

//         {/* Automation */}
//         <div className="mb-4">
//           <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: ".5px" }}>Automation</h6>
//           <div className="row g-3">
//             <div className="col-md-6">
//               <div className="border rounded p-3">
//                 <div className="form-check mb-0">
//                   <input className="form-check-input" type="checkbox" id="followUp"
//                     checked={form.follow_up_selected}
//                     onChange={(e) => set("follow_up_selected", e.target.checked)} />
//                   <label className="form-check-label fw-semibold" htmlFor="followUp">Follow-up reminder</label>
//                 </div>
//                 {form.follow_up_selected && (
//                   <div className="mt-2 d-flex align-items-center gap-2">
//                     <span className="text-muted small">After</span>
//                     <input type="number" className="form-control form-control-sm" style={{ width: 70 }}
//                       min="1" max="30" value={form.follow_up_days}
//                       onChange={(e) => set("follow_up_days", parseInt(e.target.value) || 1)} />
//                     <span className="text-muted small">days</span>
//                   </div>
//                 )}
//               </div>
//             </div>
//             <div className="col-md-6">
//               <div className="border rounded p-3">
//                 <div className="form-check mb-0">
//                   <input className="form-check-input" type="checkbox" id="escalation"
//                     checked={form.escalation_selected}
//                     onChange={(e) => set("escalation_selected", e.target.checked)} />
//                   <label className="form-check-label fw-semibold" htmlFor="escalation">Auto-escalation</label>
//                 </div>
//                 {form.escalation_selected && (
//                   <div className="mt-2">
//                     <div className="d-flex align-items-center gap-2">
//                       <span className="text-muted small">After</span>
//                       <input type="number" className="form-control form-control-sm" style={{ width: 70 }}
//                         min="1" max="30" value={form.escalation_days}
//                         onChange={(e) => set("escalation_days", parseInt(e.target.value) || 1)} />
//                       <span className="text-muted small">days</span>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="d-flex gap-2">
//           <button className="btn btn-primary" onClick={handleSubmit} disabled={sending}>
//             {sending ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</> : <><i className="fas fa-paper-plane me-2" />Send Request</>}
//           </button>
//           <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//         </div>
//       </div>
//     </div>
//   );
// };


// const RespondModal = ({ request, onClose, onResponded }) => {
//   const [action,            setAction]            = useState("approve");
//   const [scheduledDispatch, setScheduledDispatch] = useState("");
//   const [description,       setDescription]       = useState("");
//   const [submitting,        setSubmitting]         = useState(false);

//   const today = new Date().toISOString().split("T")[0];

//   const handleSubmit = async () => {
//     if (action === "approve" && !scheduledDispatch) return alert("Please set a scheduled dispatch date");
//     setSubmitting(true);
//     try {
//       await AuthService.respondToStockRequest(request.stock_req_id, {
//         action,
//         scheduled_dispatch: action === "approve" ? scheduledDispatch : undefined,
//         description:        description || undefined,
//       });
//       onResponded();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to respond");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const req_articles   = typeof request.requested_articles === "string" ? JSON.parse(request.requested_articles) : request.requested_articles || [];
//   const ccList  = typeof request.cc_recipients       === "string" ? JSON.parse(request.cc_recipients)       : request.cc_recipients       || [];

//   return (
//     <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.55)" }} onClick={onClose}>
//       <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-content">
//           <div className="modal-header">
//             <div>
//               <h5 className="modal-title">Respond to Stock Request</h5>
//               <small className="text-muted">{request.stock_req_id}</small>
//             </div>
//             <button className="btn-close" onClick={onClose} />
//           </div>

//           <div className="modal-body">
//             <div className="d-flex gap-3 mb-3 flex-wrap">
//               {[
//                 { label: "Requester", val: request.sender_email },
//                 { label: "Priority",  val: <span className={`badge ${PRIORITY_FALLBACK[request.priority]?.badge || "bg-secondary"}`}>{PRIORITY_FALLBACK[request.priority]?.label || request.priority}</span> },
//                 { label: "Requested", val: fmt(request.created_at) },
//               ].map(({ label, val }) => (
//                 <div key={label} className="flex-fill border rounded p-3" style={{ minWidth: 140 }}>
//                   <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
//                   <p className="mb-0 fw-semibold small">{val}</p>
//                 </div>
//               ))}
//             </div>

//             {ccList.length > 0 && (
//               <div className="mb-3">
//                 <p className="fw-semibold mb-1 small">CC Recipients</p>
//                 <div className="d-flex flex-wrap gap-1">
//                   {ccList.map((email) => (
//                     <span key={email} className="badge bg-light text-dark border" style={{ fontSize: 12 }}>{email}</span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="mb-3">
//               <p className="fw-semibold mb-2">Requested Articles</p>
//               <table className="table table-sm table-bordered mb-0">
//                 <thead className="table-light"><tr><th>Article</th><th className="text-center">Qty</th></tr></thead>
//                 <tbody>
//                   {req_articles.map((item, i) => (
//                     <tr key={i}>
//                       <td>{item.article_profile_name || item.productName || "—"}</td>
//                       <td className="text-center">{item.quantity || item.count}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>

//             <div className="mb-3">
//               <p className="fw-semibold mb-2">Your Response</p>
//               <div className="d-flex gap-2 mb-3">
//                 <button type="button" className={`btn ${action === "approve" ? "btn-success" : "btn-outline-secondary"}`} onClick={() => setAction("approve")}>
//                   <i className="fas fa-check me-2" />Approve
//                 </button>
//                 <button type="button" className={`btn ${action === "reject" ? "btn-danger" : "btn-outline-secondary"}`} onClick={() => setAction("reject")}>
//                   <i className="fas fa-times me-2" />Reject
//                 </button>
//               </div>

//               {action === "approve" && (
//                 <div className="mb-3">
//                   <label className="form-label">Scheduled Dispatch Date <span className="text-danger">*</span></label>
//                   <input type="date" className="form-control" style={{ maxWidth: 220 }} min={today}
//                     value={scheduledDispatch} onChange={(e) => setScheduledDispatch(e.target.value)} />
//                 </div>
//               )}

//               <div>
//                 <label className="form-label">
//                   {action === "approve" ? "Approval Notes" : "Rejection Reason"}{" "}
//                   <span className="text-muted fw-normal">(optional, max 255 chars)</span>
//                 </label>
//                 <textarea className="form-control" rows="3" maxLength={255}
//                   value={description}
//                   onChange={(e) => setDescription(e.target.value)}
//                   placeholder={action === "approve" ? "Any instructions for dispatch…" : "Reason for rejection…"} />
//               </div>
//             </div>
//           </div>

//           <div className="modal-footer">
//             <button className={`btn ${action === "approve" ? "btn-success" : "btn-danger"}`}
//               onClick={handleSubmit} disabled={submitting}>
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//                 : action === "approve" ? "Confirm Approval" : "Confirm Rejection"}
//             </button>
//             <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };



// const MarkReceivedModal = ({ request, onClose, onMarked }) => {
//   const [notes,      setNotes]      = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const req_articles = typeof request.requested_articles === "string"
//     ? JSON.parse(request.requested_articles)
//     : request.requested_articles || [];

//   const handleSubmit = async () => {
//     setSubmitting(true);
//     try {

//       await AuthService.markStockRequestReceived(request.stock_req_id, {
//         notes: notes || undefined,
//       });
//       onMarked();
//     } catch (err) {
//       alert(err.response?.data?.message || "Failed to mark as received");
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   return (
//     <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.55)" }} onClick={onClose}>
//       <div className="modal-dialog modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-content">
//           <div className="modal-header" style={{ borderLeft: "4px solid #20c997" }}>
//             <div>
//               <h5 className="modal-title">Confirm Stock Received</h5>
//               <small className="text-muted">{request.stock_req_id}</small>
//             </div>
//             <button className="btn-close" onClick={onClose} />
//           </div>

//           <div className="modal-body">
//             <div className="alert alert-success py-2 mb-3">
//               <i className="fas fa-truck me-2" />
//               <strong>Scheduled Dispatch:</strong> {fmtDate(request.scheduled_dispatch)}
//             </div>

//             <p className="text-muted small mb-3">
//               Confirming receipt will notify the dispatcher and close this request.
//             </p>

//             <table className="table table-sm table-bordered mb-3">
//               <thead className="table-light"><tr><th>Article</th><th className="text-center">Qty</th></tr></thead>
//               <tbody>
//                 {req_articles.map((item, i) => (
//                   <tr key={i}>
//                     <td>{item.article_profile_name || "—"}</td>
//                     <td className="text-center">{item.quantity || item.count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <div>
//               <label className="form-label fw-semibold">
//                 Receiver Notes <span className="text-muted fw-normal">(optional)</span>
//               </label>
//               <textarea className="form-control" rows="3" maxLength={255}
//                 value={notes} onChange={(e) => setNotes(e.target.value)}
//                 placeholder="Any discrepancies, notes about the delivery…" />
//             </div>
//           </div>

//           <div className="modal-footer">
//             <button className="btn btn-success" onClick={handleSubmit} disabled={submitting}>
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Marking…</>
//                 : <><i className="fas fa-box-open me-2" />Mark as Received</>}
//             </button>
//             <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// const DetailModal = ({ request, isDispatcher, onClose, onRespond, onMarkReceived, priorities }) => {
//   const req_articles  = typeof request.requested_articles === "string" ? JSON.parse(request.requested_articles) : request.requested_articles || [];
//   const ccList = typeof request.cc_recipients       === "string" ? JSON.parse(request.cc_recipients)       : request.cc_recipients       || [];

//   const pCfg      = getPriorityCfg(request.priority, priorities);
//   const tCfg      = TEMPLATE_COLORS[request.template_type] || {};
//   const isPending = !request.approved_at;
//   // Show "Mark as Received" if:  requester side + approved + not yet received
//   const canMarkReceived = !isDispatcher && request.approved_at && !request.received_at;

//   return (
//     <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,.55)" }} onClick={onClose}>
//       <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
//         <div className="modal-content">
//           <div className="modal-header" style={{ borderLeft: `4px solid ${pCfg.color || "#6c757d"}` }}>
//             <div>
//               <h5 className="modal-title mb-0">{request.stock_req_id}</h5>
//               <div className="d-flex gap-2 mt-1 flex-wrap">
//                 <span className={`badge ${pCfg.badge}`}>{pCfg.label}</span>
//                 {tCfg.badge && <span className={`badge ${tCfg.badge}`}><i className={`${tCfg.icon} me-1`} />{tCfg.label}</span>}
//                 {request.stock_id && <span className="badge bg-primary"><i className="fas fa-link me-1" />{request.stock_id}</span>}
//                 {/* NEW: received badge */}
//                 {request.received_at && <span className="badge bg-teal" style={{ background: "#20c997" }}><i className="fas fa-box-open me-1" />Received</span>}
//               </div>
//             </div>
//             <button className="btn-close" onClick={onClose} />
//           </div>

//           <div className="modal-body">
//             <div className="row g-2 mb-3">
//               {[
//                 { label: "From",    val: request.sender_email   },
//                 { label: "To",      val: request.receiver_email },
//                 { label: "Created", val: fmt(request.created_at) },
//                 {
//                   label: request.approved_at ? "Approved" : "Status",
//                   val: request.approved_at
//                     ? fmtDate(request.approved_at)
//                     : <span className="text-warning fw-semibold">Pending</span>,
//                 },
//               ].map(({ label, val }) => (
//                 <div className="col-6 col-md-3" key={label}>
//                   <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>{label}</p>
//                   <p className="mb-0 small fw-semibold">{val}</p>
//                 </div>
//               ))}
//             </div>
// {/*  */}
//             {/* NEW: Received confirmation row */}
//             {request.received_at && (
//               <div className="alert alert-success py-2 mb-3">
//                 <i className="fas fa-box-open me-2" />
//                 <strong>Stock Received:</strong> {fmt(request.received_at)}
//                 {request.receiver_notes && <span className="ms-2 text-muted small">— {request.receiver_notes}</span>}
//               </div>
//             )}

//             {ccList.length > 0 && (
//               <div className="mb-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>CC Recipients</p>
//                 <div className="d-flex flex-wrap gap-1">
//                   {ccList.map((email) => (
//                     <span key={email} className="badge bg-light text-dark border" style={{ fontSize: 12 }}>{email}</span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {request.scheduled_dispatch && (
//               <div className="alert alert-success py-2">
//                 <i className="fas fa-truck me-2" />
//                 <strong>Scheduled Dispatch:</strong> {fmtDate(request.scheduled_dispatch)}
//               </div>
//             )}

//             {request.description && (
//               <div className="mb-3">
//                 <p className="text-muted mb-1" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Description</p>
//                 <p className="mb-0 small">{request.description}</p>
//               </div>
//             )}

//             <h6 className="text-muted text-uppercase mb-2" style={{ fontSize: 11, letterSpacing: ".5px" }}>Articles ({req_articles.length})</h6>
//             <table className="table table-sm table-bordered mb-3">
//               <thead className="table-light"><tr><th>Article</th><th className="text-center">Qty</th></tr></thead>
//               <tbody>
//                 {req_articles.map((item, i) => (
//                   <tr key={i}>
//                     <td>{item.article_profile_name || item.productName || "—"}</td>
//                     <td className="text-center">{item.quantity || item.count}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             {(request.follow_up_selected || request.escalation_selected) && (
//               <div className="d-flex gap-2 flex-wrap">
//                 {request.follow_up_selected  && <span className="badge bg-light text-dark border"><i className="fas fa-clock me-1 text-warning" />Follow-up: {request.follow_up_days}d</span>}
//                 {request.escalation_selected && <span className="badge bg-light text-dark border"><i className="fas fa-bell me-1 text-danger" />Escalation: {request.escalation_days}d</span>}
//               </div>
//             )}
//           </div>

//           <div className="modal-footer">
//             {/* Dispatcher: respond button (pending only) */}
//             {isDispatcher && isPending && (
//               <button className="btn btn-success" onClick={() => onRespond(request)}>
//                 <i className="fas fa-reply me-2" />Respond
//               </button>
//             )}
//             {/* Requester: mark as received (approved, not yet received) */}
//             {canMarkReceived && (
//               <button className="btn btn-teal" style={{ background: "#20c997", color: "#fff" }} onClick={() => onMarkReceived(request)}>
//                 <i className="fas fa-box-open me-2" />Mark as Received
//               </button>
//             )}
//             <button className="btn btn-secondary" onClick={onClose}>Close</button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };


// const RequestRow = ({ req, isDispatcher, onRowClick, onStar, priorities }) => {
//   const pCfg      = getPriorityCfg(req.priority, priorities);
//   const tCfg      = TEMPLATE_COLORS[req.template_type] || {};
//   const isPending = !req.approved_at && !req.stock_id;

//   const articleCount = (() => {
//     try {
//       const arr = typeof req.requested_articles === "string" ? JSON.parse(req.requested_articles) : req.requested_articles;
//       return arr?.length || 0;
//     } catch { return 0; }
//   })();

//   const ccList = (() => {
//     try {
//       return typeof req.cc_recipients === "string" ? JSON.parse(req.cc_recipients) : req.cc_recipients || [];
//     } catch { return []; }
//   })();

//   return (
//     <tr className={`clickable-row ${!req.is_read && isDispatcher ? "unread" : ""}`}
//       onClick={() => onRowClick(req)} style={{ cursor: "pointer" }}>

//       {/* Star */}
//       <td style={{ width: 36 }} onClick={(e) => onStar(e, req)}>
//         <i className={`${req.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
//       </td>

//       {/* Priority stripe */}
//       <td style={{ width: 6, padding: 0 }}>
//         <div style={{ width: 4, height: 38, background: pCfg.color || "#dee2e6", borderRadius: 2, margin: "0 auto" }} />
//       </td>

//       {/* ID + badges */}
//       <td style={{ minWidth: 180 }}>
//         <div className="d-flex align-items-center gap-2 flex-wrap">
//           <code style={{ fontSize: 12 }}>{req.stock_req_id}</code>
//           <span className={`badge ${pCfg.badge}`} style={{ fontSize: 10 }}>{pCfg.label}</span>
//           {tCfg.badge && <span className={`badge ${tCfg.badge}`} style={{ fontSize: 10 }}><i className={`${tCfg.icon} me-1`} />{tCfg.label}</span>}
//           {req.stock_id && <span className="badge bg-primary" style={{ fontSize: 10 }}><i className="fas fa-link me-1" />Linked</span>}
//           {isPending && <span className="badge bg-warning text-dark" style={{ fontSize: 10 }}>Pending</span>}
//           {/* NEW badges */}
//           {req.approved_at && !req.received_at && !isPending && (
//             <span className="badge bg-success" style={{ fontSize: 10 }}>Approved</span>
//           )}
//           {req.received_at && (
//             <span className="badge" style={{ fontSize: 10, background: "#20c997", color: "#fff" }}>
//               <i className="fas fa-box-open me-1" />Received
//             </span>
//           )}
//         </div>
//       </td>

//       {/* From / To */}
//       <td className="name" style={{ minWidth: 160 }}>
//         <div>
//           <span className="small">{isDispatcher ? req.sender_email : req.receiver_email}</span>
//           {ccList.length > 0 && (
//             <div><span className="text-muted" style={{ fontSize: 11 }}><i className="fas fa-users me-1" />CC: {ccList.length}</span></div>
//           )}
//         </div>
//       </td>

//       {/* Article count */}
//       <td style={{ minWidth: 100 }}>
//         <span className="text-muted small">{articleCount} article{articleCount !== 1 ? "s" : ""}</span>
//       </td>

//       {/* Scheduled dispatch */}
//       <td style={{ minWidth: 120 }}>
//         {req.scheduled_dispatch && (
//           <span className="text-success small"><i className="fas fa-truck me-1" />{fmtDate(req.scheduled_dispatch)}</span>
//         )}
//       </td>

//       {/* Date */}
//       <td className="mail-date text-end">
//         {new Date(req.email_sent_at || req.created_at).toLocaleString()}
//       </td>
//     </tr>
//   );
// };



// const StockRequest = () => {
//   const dispatch = useDispatch();
//   const { article_list } = useSelector((state) => state.articles);

//   const [view, setView]             = useState("sent");
//   const [requests, setRequests]     = useState([]);
//   const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
//   const [loading, setLoading]       = useState(false);

//   const [showCompose,     setShowCompose]     = useState(false);
//   const [selectedRequest, setSelectedRequest] = useState(null);
//   const [respondTarget,   setRespondTarget]   = useState(null);
//   const [receiveTarget,   setReceiveTarget]   = useState(null); // NEW

//   const [filterPriority, setFilterPriority] = useState("");
//   const [filterStatus,   setFilterStatus]   = useState("");

//   const { users, loading: userLoading } = useUsers();
//   const { priorities }                  = usePriorities();

//   // "inbox" view means the current user is the dispatcher
//   const isDispatcher = view === "inbox";

//   const articleOptions = article_list.map((a) => ({
//     value:        a.uuid,
//     label:        a.title || a.article_profile_name,
//   }));

//   const fetchRequests = useCallback(async (page_no = 1) => {
//       setLoading(true);
//       try {
//         const params = {
//           page_no,
//           limit: 10,
        
//         };

//         // "approved" view reuses the requester endpoint but filters by status=approved
//         const effectiveParams =
//           view === "approved"
//             ? { ...params,  status: "approved" }
//             : params;

//         const res = isDispatcher
//           ? await AuthService.getStockRequestInbox(effectiveParams)
//           : await AuthService.getStockRequests(effectiveParams);

//         setRequests(res.data.data || []);
//         const p = res.data.pagination;
//         setPagination({ currentPage: p.page, totalPages: p.totalPages, total: p.total });
//       } catch (err) {
//         console.error("StockRequest: fetchRequests failed", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [isDispatcher, view],
//   );

//   useEffect(() => { fetchRequests(); }, [fetchRequests]);

//   const handleCompose = () => {
//     dispatch(fetchUnfilteredArticles({}));
//     setShowCompose(true);
//   };

//   const handleRowClick = (req) => {
//     setSelectedRequest(req);
//     if (!req.is_read) {
//       AuthService.markStockRequestRead(req.stock_req_id).catch(() => {});
//       setRequests((prev) =>
//         prev.map((r) => (r.stock_req_id === req.stock_req_id ? { ...r, is_read: true } : r)),
//       );
//     }
//   };

//   const handleStar = (e, req) => {
//     e.stopPropagation();
//     const next = !req.is_starred;
//     AuthService.toggleStockRequestStar(req.stock_req_id, next).catch(() => {});
//     setRequests((prev) =>
//       prev.map((r) => (r.stock_req_id === req.stock_req_id ? { ...r, is_starred: next } : r)),
//     );
//   };

//   const unreadCount    = requests.filter((r) => !r.is_read && isDispatcher).length;
//   // count approved-but-not-received requests (badge on the "Approved" nav item)
//   const approvedUnread = view !== "approved"
//     ? 0  // we'd need a separate count from the API; show 0 until that endpoint exists
//     : 0;

//   const viewLabel = {
//     sent:     "My Requests",
//     inbox:    "Incoming Requests",
//     starred:  "Starred",
//     approved: "Approved Requests",
//   }[view] || "";

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="row align-items-center">
//             <div className="col">
//               <h3 className="page-title mb-0">Stock Requests</h3>
//             </div>
//           </div>
//         </div>

//         <div className="row">
//           {/* ── Sidebar ── */}
//           <div className="col-lg-3 col-md-12">
//             <div className="mb-3">
//               <button className="btn btn-primary btn-block w-100 mb-2" onClick={handleCompose}>
//                 <i className="fas fa-plus me-2" />New Stock Request
//               </button>
//             </div>

//             <ul className="inbox-menu">
//               {[
//                 { key: "sent",     icon: "far fa-paper-plane", label: "My Requests"       },
//                 { key: "inbox",    icon: "fas fa-inbox",       label: "Incoming"           },
//                 // ↓ NEW view
//                 { key: "approved", icon: "fas fa-check-circle",label: "Approved"           },
//                 { key: "starred",  icon: "far fa-star",        label: "Starred"            },
//               ].map(({ key, icon, label }) => (
//                 <li key={key} className={view === key ? "active" : ""}>
//                   <Link to="#" onClick={(e) => { e.preventDefault(); setView(key); }}>
//                     <i className={`${icon} me-2`} />
//                     {label}
//                     {key === "inbox"    && unreadCount > 0    && <span className="mail-count ms-1">({unreadCount})</span>}
//                     {key === "approved" && approvedUnread > 0 && <span className="mail-count ms-1">({approvedUnread})</span>}
//                   </Link>
//                 </li>
//               ))}
//             </ul>

//             {/* Filters */}
//             <div className="mt-3">
//               <p className="text-muted mb-2" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".5px" }}>Filter</p>
//               <select className="form-select form-select-sm mb-2"
//                 value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
//                 <option value="">All Priorities</option>
//                 {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
//               </select>
//               {/* hide status filter on approved view — it's already implicitly filtered */}
//               {view !== "approved" && (
//                 <select className="form-select form-select-sm"
//                   value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//                   <option value="">All Statuses</option>
//                   <option value="pending">Pending</option>
//                   <option value="approved">Approved</option>
//                   <option value="linked">Linked to StockFlow</option>
//                 </select>
//               )}
//               {view === "approved" && (
//                 <select className="form-select form-select-sm"
//                   value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//                   <option value="approved">Approved – Awaiting Receipt</option>
//                   <option value="received">Received</option>
//                 </select>
//               )}
//             </div>
//           </div>

//           {/* ── Main panel ── */}
//           <div className="col-lg-9 col-md-12">
//             {showCompose ? (
//               <ComposeForm
//                 onClose={() => setShowCompose(false)}
//                 onSent={() => { setShowCompose(false); setView("sent"); fetchRequests(); }}
//                 articleOptions={articleOptions}
//                 users={users}
//                 userLoading={userLoading}
//                 priorities={priorities}
//               />
//             ) : (
//               <div className="card bg-white">
//                 <div className="card-body">
//                   {/* Toolbar */}
//                   <div className="d-flex justify-content-between align-items-center mb-3">
//                     <h5 className="mb-0">
//                       {viewLabel}
//                       <span className="badge bg-secondary ms-2" style={{ fontSize: 12 }}>{pagination.total}</span>
//                     </h5>
//                     <div className="d-flex gap-1">
//                       <button className="btn btn-sm btn-white" title="Refresh"
//                         onClick={() => fetchRequests(pagination.currentPage)}>
//                         <i className="fas fa-sync-alt" />
//                       </button>
//                       <button className="btn btn-sm btn-white"
//                         disabled={pagination.currentPage === 1}
//                         onClick={() => fetchRequests(pagination.currentPage - 1)}>
//                         <i className="fas fa-angle-left" />
//                       </button>
//                       <button className="btn btn-sm btn-white"
//                         disabled={pagination.currentPage >= pagination.totalPages}
//                         onClick={() => fetchRequests(pagination.currentPage + 1)}>
//                         <i className="fas fa-angle-right" />
//                       </button>
//                     </div>
//                   </div>

//                   {/* Approved view helper banner */}
//                   {view === "approved" && (
//                     <div className="alert alert-success py-2 mb-3 d-flex align-items-center gap-2">
//                       <i className="fas fa-info-circle" />
//                       <span className="small">
//                         These requests have been approved by the dispatcher. Once you receive the
//                         stock, open a request and click <strong>Mark as Received</strong>.
//                       </span>
//                     </div>
//                   )}

//                   {loading ? (
//                     <div className="text-center py-5">
//                       <div className="spinner-border text-primary" role="status">
//                         <span className="visually-hidden">Loading…</span>
//                       </div>
//                     </div>
//                   ) : requests.length === 0 ? (
//                     <div className="text-center py-5">
//                       <i className="fas fa-inbox fa-2x text-muted mb-3 d-block" />
//                       <p className="text-muted">No stock requests found</p>
//                     </div>
//                   ) : (
//                     <div className="table-responsive">
//                       <table className="table table-inbox table-hover align-middle">
//                         <tbody>
//                           {requests.map((req) => (
//                             <RequestRow
//                               key={req.stock_req_id}
//                               req={req}
//                               isDispatcher={isDispatcher}
//                               onRowClick={handleRowClick}
//                               onStar={handleStar}
//                               priorities={priorities}
//                             />
//                           ))}
//                         </tbody>
//                       </table>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Detail modal */}
//       {selectedRequest && !respondTarget && !receiveTarget && (
//         <DetailModal
//           request={selectedRequest}
//           isDispatcher={isDispatcher}
//           onClose={() => setSelectedRequest(null)}
//           onRespond={(req) => { setSelectedRequest(null); setRespondTarget(req); }}
//           onMarkReceived={(req) => { setSelectedRequest(null); setReceiveTarget(req); }}  // NEW
//           priorities={priorities}
//         />
//       )}

//       {/* Respond modal (dispatcher) */}
//       {respondTarget && (
//         <RespondModal
//           request={respondTarget}
//           onClose={() => setRespondTarget(null)}
//           onResponded={() => { setRespondTarget(null); fetchRequests(pagination.currentPage); }}
//         />
//       )}

//       {/* Mark as Received modal (requester) — NEW */}
//       {receiveTarget && (
//         <MarkReceivedModal
//           request={receiveTarget}
//           onClose={() => setReceiveTarget(null)}
//           onMarked={() => {
//             setReceiveTarget(null);
//             fetchRequests(pagination.currentPage);
//           }}
//         />
//       )}
//     </div>
//   );
// };

// export default StockRequest;




// // //stock request + add new stock request 

// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   PlusCircle, Eye, CheckCircle, Clock, AlertCircle,
//   Send, Inbox, Filter, RefreshCw,
//   ChevronLeft, ChevronRight, Package, Truck,Search as SearchIcon,
//   ThumbsUp
// } from "feather-icons-react/build/IconComponents";



// import { useDispatch, useSelector } from "react-redux";
// import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
// import AuthService from "../../services/authService";

// const MySwal = withReactContent(Swal);

// // ─────────────────────────────────────────────────────────────
// //  Constants
// // ─────────────────────────────────────────────────────────────

// const PRIORITY_CFG = {
//   urgent:   { color: "#dc3545", badge: "badge-linedanger",   label: "Urgent"   },
//   standard: { color: "#fd7e14", badge: "badge-linewarning",  label: "Standard" },
//   low:      { color: "#198754", badge: "badge-linesuccess",  label: "Low"      },
// };

// const STATUS_CFG = {
//   "Pending for Approval":         { badge: "badge-linewarning",  icon: <Clock size={12} /> },
//   "Followed Up for Approval":     { badge: "badge-lineinfo",     icon: <Clock size={12} /> },
//   "Escalated Due to No Approval": { badge: "badge-linedanger",   icon: <AlertCircle size={12} /> },
//   "Awaiting Shipment":            { badge: "badge-lineinfo",     icon: <Truck size={12} /> },
//   "Scheduled":                    { badge: "badge-linesuccess",  icon: <CheckCircle size={12} /> },
//   "Shipping Deadline Approaching":{ badge: "badge-linedanger",   icon: <AlertCircle size={12} /> },
//   "Delivered":                    { badge: "badge-linesuccess",  icon: <CheckCircle size={12} /> },
//   "Resolution required":          { badge: "badge-linedanger",   icon: <AlertCircle size={12} /> },
// };


// const fmtDate = (dt) => dt ? new Date(dt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) : "—";

// const getPriorityCfg = (key) =>
//   PRIORITY_CFG[key] || { color: "#6c757d", badge: "badge-secondary", label: key || "—" };

// // ─────────────────────────────────────────────────────────────
// //  Custom hooks
// // ─────────────────────────────────────────────────────────────
// // 
// const useUsers = () => {
//   const [users,   setUsers]   = useState([]);
//   const [loading, setLoading] = useState(false);

//   const fetchUsers = useCallback(async () => {
//     setLoading(true);
//     try {
//       const res = await AuthService.getAllUsers();
//       setUsers(
//         (res.data.data || []).map((u) => ({
//           ...u,
//           username:        u.user_name  || u.user_email,
//           label:           u.user_name  || u.user_email,
//           value:           u.user_id,
//           email:           u.user_email,
//           warehouse_id:    u.warehouse_id,
//           warehouse_title: u.warehouse_title,
//         }))
//       );
//     } catch (err) {
//       console.error("useUsers:", err);
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => { fetchUsers(); }, [fetchUsers]);
//   return { users, loading };
// };

// const usePriorities = () => {
//   const [priorities, setPriorities] = useState([]);

//   useEffect(() => {
//     AuthService.getStockRequestPriorities?.()
//       .then((res) => {
//         const data = res?.data?.priorities || res?.data || [];
//         if (data.length) setPriorities(data);
//       })
//       .catch(() => {});
//   }, []);

//   return priorities.length
//     ? priorities
//     : Object.entries(PRIORITY_CFG).map(([k, v]) => ({ value: k, label: v.label }));
// };

// // ─────────────────────────────────────────────────────────────
// //  CCRecipientsInput
// // ─────────────────────────────────────────────────────────────

// const CCRecipientsInput = ({ value = [], onChange }) => {
//   const [inputVal, setInputVal] = useState("");
//   const inputRef = useRef(null);

//   const addEmail = (raw) => {
//     const email = raw.trim().toLowerCase();
//     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || value.includes(email)) return;
//     onChange([...value, email]);
//     setInputVal("");
//   };

//   const handleKeyDown = (e) => {
//     if (["Enter", ",", " ", "Tab"].includes(e.key)) { e.preventDefault(); addEmail(inputVal); }
//     else if (e.key === "Backspace" && !inputVal && value.length) onChange(value.slice(0, -1));
//   };

//   return (
//     <div
//       className="form-control d-flex flex-wrap gap-1 align-items-center"
//       style={{ minHeight: 42, cursor: "text", height: "auto" }}
//       onClick={() => inputRef.current?.focus()}
//     >
//       {value.map((email) => (
//         <span key={email} className="badge bg-light text-dark border d-flex align-items-center gap-1" style={{ fontSize: 12, fontWeight: 400 }}>
//           {email}
//           <button type="button" className="btn-close" style={{ fontSize: 8 }}
//             onClick={(e) => { e.stopPropagation(); onChange(value.filter((v) => v !== email)); }} />
//         </span>
//       ))}
//       <input
//         ref={inputRef} type="text" value={inputVal}
//         onChange={(e) => setInputVal(e.target.value)}
//         onKeyDown={handleKeyDown}
//         onBlur={() => addEmail(inputVal)}
//         placeholder={value.length ? "" : "Add emails, press Enter or comma…"}
//         style={{ border: "none", outline: "none", background: "transparent", flex: 1, minWidth: 180, fontSize: 14 }}
//       />
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────
// //  ComposeForm  (slide-in panel — same pattern as AddStockFlow)
// // ─────────────────────────────────────────────────────────────

// const ComposeForm = ({ onClose, onSent, articleOptions, users, userLoading, priorities }) => {
//   const [form, setForm] = useState({
//     selected_user:       "",
//     cc_recipients:       [],
//     priority:            "",
//     follow_up_selected:  true,
//     follow_up_days:      2,
//     escalation_selected: false,
//     escalation_days:     3,
//     req_articles:        [{ article_profile_id: "", article_profile_name: "", quantity: 1 }],
//     description:         "",
//   });
//   const [sending, setSending] = useState(false);

//   useEffect(() => {
//     if (priorities.length && !form.priority)
//       setForm((p) => ({ ...p, priority: priorities[0].value }));
//   }, [priorities]); // eslint-disable-line

//   const set = (field, val) => setForm((p) => ({ ...p, [field]: val }));

//   const addItem    = () => set("req_articles", [...form.req_articles, { article_profile_id: "", article_profile_name: "", quantity: 1 }]);
//   const removeItem = (i) => set("req_articles", form.req_articles.filter((_, idx) => idx !== i));
//   const updateItem = (i, field, val) => {
//     const arr = [...form.req_articles];
//     arr[i] = { ...arr[i], [field]: val };
//     set("req_articles", arr);
//   };
//   const handleArticleSelect = (i, opt) => {
//     const arr = [...form.req_articles];
//     arr[i] = { ...arr[i], article_profile_id: opt?.value || "", article_profile_name: opt?.label || "" };
//     set("req_articles", arr);
//   };

//   const userOptions = users.map((u) => ({
//     value: u.value,
//     label: `${u.username} — ${u.email} | ${u.warehouse_title}`,
//     email: u.email,
//   }));

//   const handleSubmit = async () => {
//     if (!form.selected_user) return MySwal.fire({ icon: "warning", title: "Select a dispatcher", timer: 2000, showConfirmButton: false });
//     const validItems = form.req_articles.filter((i) => i.article_profile_id && i.quantity > 0);
//     if (!validItems.length) return MySwal.fire({ icon: "warning", title: "Add at least one article", timer: 2000, showConfirmButton: false });
//     if (!form.priority) return MySwal.fire({ icon: "warning", title: "Select a priority", timer: 2000, showConfirmButton: false });

//     setSending(true);
//     try {
//       await AuthService.createStockRequest({
//         selected_user:       form.selected_user,
//         cc_recipients:       form.cc_recipients,
//         priority:            form.priority,
//         description:         form.description || undefined,
//         follow_up_selected:  form.follow_up_selected,
//         follow_up_days:      form.follow_up_selected  ? form.follow_up_days  : null,
//         escalation_selected: form.escalation_selected,
//         escalation_days:     form.escalation_selected ? form.escalation_days : null,
//         req_articles:        validItems,
//       });
//       MySwal.fire({ icon: "success", title: "Request Sent!", timer: 2000, showConfirmButton: false });
//       onSent();
//     } catch (err) {
//       MySwal.fire({ icon: "error", title: "Failed", text: err.response?.data?.message || "Could not send request", timer: 3000 });
//     } finally {
//       setSending(false);
//     }
//   };

//   return (
//     <div className="card mb-3">
//       <div className="card-body">
//         {/* Header */}
//         <div className="d-flex align-items-center justify-content-between mb-4">
//           <div>
//             <h4 className="mb-0">New Stock Request</h4>
//             <small className="text-muted">Request articles from a dispatcher</small>
//           </div>
//           <button className="btn btn-cancel btn-sm" onClick={onClose}>Cancel</button>
//         </div>

//         <div className="row g-3">
//           {/* Dispatcher */}
//           <div className="mb-3">
//               <label className="form-label fw-semibold">Dispatcher <span className="text-danger">*</span></label>
//               <Select
//                 options={userOptions}
//                 value={userOptions.find((o) => o.value === form.selected_user) || null}
//                 onChange={(opt) => set("selected_user", opt?.value || "")}
//                 placeholder={userLoading ? "Loading…" : "Select dispatcher…"}
//                 isLoading={userLoading} isSearchable isClearable
//                 menuPortalTarget={document.body}
//                 styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
//               />
//               {form.selected_user && (() => {
//                 const u = userOptions.find((o) => o.value === form.selected_user);
//                 return u ? <small className="text-muted mt-1 d-block"><i className="fas fa-envelope me-1" />{u.email}</small> : null;
//               })()}
//             </div>
          

       

//           {/* CC */}
//         <div className="mb-3">
//               <label className="form-label fw-semibold">CC Recipients</label>
//               <CCRecipientsInput value={form.cc_recipients} onChange={(v) => set("cc_recipients", v)} />
//               <small className="text-muted">Press Enter, comma, or Tab to add each email</small>
//             </div>
          

//              {/* Priority */}
//                <div className="mb-3">
//               <label className="form-label">Priority <span className="text-danger">*</span></label>
//               <div className="d-flex gap-2 flex-wrap mt-1">
//                 {priorities.map((p) => {
//                   const cfg = getPriorityCfg(p.value);
//                   const isActive = form.priority === p.value;
//                   return (
//                     <button key={p.value} type="button"
//                       className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-secondary"}`}
//                       style={isActive ? { background: cfg.color, borderColor: cfg.color } : {}}
//                       onClick={() => set("priority", p.value)}>
//                       {p.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
        

//           {/* Articles */}
//                <div className="mb-3">
//               <div className="d-flex justify-content-between align-items-center mb-2">
//                 <label className="form-label mb-0">Articles <span className="text-danger">*</span></label>
//                 <button type="button" className="btn btn-sm btn-added" onClick={addItem}>
//                   <PlusCircle size={14} className="me-1" /> Add Row
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <table className="table table-bordered table-sm align-middle mb-0">
//                   <thead className="table-light">
//                     <tr>
//                       <th>Article</th>
//                       <th style={{ width: 120 }}>Quantity</th>
//                       <th style={{ width: 48 }} />
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {form.req_articles.map((item, i) => (
//                       <tr key={i}>
//                         <td>
//                           <Select
//                             options={articleOptions}
//                             value={articleOptions.find((o) => o.value === item.article_profile_id) || null}
//                             onChange={(opt) => handleArticleSelect(i, opt)}
//                             placeholder="Select article…" isClearable isSearchable
//                             menuPortalTarget={document.body}
//                             styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
//                           />
//                         </td>
//                         <td>
//                           <input type="number" className="form-control form-control-sm" min="1"
//                             value={item.quantity}
//                             onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)} />
//                         </td>
//                         <td>
//                           {form.req_articles.length > 1 && (
//                             <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItem(i)}>
//                               <i className="fas fa-times" />
//                             </button>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
            
//             </div>
//           </div>

//           {/* Description */}
//                <div className="mb-3">
//               <label className="form-label">Description <span className="text-muted fw-normal">(optional)</span></label>
//               <textarea className="form-control" rows="3" maxLength={255}
//                 value={form.description}
//                 onChange={(e) => set("description", e.target.value)}
//                 placeholder="Any additional instructions…" />
//               <small className="text-muted">{form.description.length}/255</small>
//             </div>
        

//           {/* Automation */}
//           <div className="col-12">
//             <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: ".5px" }}>Automation</h6>
//             <div className="row g-3">
//               <div className="col-md-6">
//                 <div className="border rounded p-3">
//                   <div className="form-check mb-0">
//                     <input className="form-check-input" type="checkbox" id="followUp"
//                       checked={form.follow_up_selected}
//                       onChange={(e) => set("follow_up_selected", e.target.checked)} />
//                     <label className="form-check-label fw-semibold" htmlFor="followUp">Follow-up reminder</label>
//                   </div>
//                   {form.follow_up_selected && (
//                     <div className="mt-2 d-flex align-items-center gap-2">
//                       <span className="text-muted small">After</span>
//                       <input type="number" className="form-control form-control-sm" style={{ width: 70 }}
//                         min="1" max="30" value={form.follow_up_days}
//                         onChange={(e) => set("follow_up_days", parseInt(e.target.value) || 1)} />
//                       <span className="text-muted small">days</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//               <div className="col-md-6">
//                 <div className="border rounded p-3">
//                   <div className="form-check mb-0">
//                     <input className="form-check-input" type="checkbox" id="escalation"
//                       checked={form.escalation_selected}
//                       onChange={(e) => set("escalation_selected", e.target.checked)} />
//                     <label className="form-check-label fw-semibold" htmlFor="escalation">Auto-escalation</label>
//                   </div>
//                   {form.escalation_selected && (
//                     <div className="mt-2 d-flex align-items-center gap-2">
//                       <span className="text-muted small">After</span>
//                       <input type="number" className="form-control form-control-sm" style={{ width: 70 }}
//                         min="1" max="30" value={form.escalation_days}
//                         onChange={(e) => set("escalation_days", parseInt(e.target.value) || 1)} />
//                       <span className="text-muted small">days</span>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Submit */}
//           <div className="col-12">
//             <div className="d-flex gap-2">
//               <button className="btn btn-submit" onClick={handleSubmit} disabled={sending}>
//                 {sending
//                   ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
//                   : <><Send size={14} className="me-2" />Send Request</>}
//               </button>
//               <button className="btn btn-cancel" onClick={onClose}>Cancel</button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────
// //  Main page
// // ─────────────────────────────────────────────────────────────

// const StockRequest = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const { article_list } = useSelector((state) => state.articles);

//   const [view,        setView]        = useState("sent");
//   const [requests,    setRequests]    = useState([]);
//   const [pagination,  setPagination]  = useState({ currentPage: 1, totalPages: 1, total: 0 });

//   const [searchQuery, setSearchQuery] = useState("");

//   const [loading,     setLoading]     = useState(false);
//   const [showCompose, setShowCompose] = useState(false);
//   const [isFilterVisible, setIsFilterVisible] = useState(false);

//   const [filterPriority, setFilterPriority] = useState("");
//   const [filterStatus,   setFilterStatus]   = useState("");

//   const { users, loading: userLoading } = useUsers();
//   const priorities = usePriorities();


//   const articleOptions = article_list.map((a) => ({
//     value: a.uuid,
//     label: a.title || a.article_profile_name,
//   }));

//   // ── Fetch ──
 

//   const fetchRequests = useCallback(async (page_no = 1) => {
//   setLoading(true);
//   try {
//     const params = { page_no, limit: 10 };
//     if (filterPriority) params.priority  = filterPriority;
//     if (filterStatus)   params.status    = filterStatus;
//     if (searchQuery)    params.search    = searchQuery;

//     const effectiveParams = view === "approved"
//       ? { ...params, status: "approved" }
//       : params;

//     const res = await AuthService.getStockRequests(effectiveParams);
//     setRequests(res.data.data || []);
//     setPagination({
//       currentPage: page_no,
//       totalPages:  Math.ceil((res.data.total_records || 0) / 10),
//       total:       res.data.total_records || 0,
//     });
//   } catch (err) {
//     console.error("fetchRequests:", err);
//   } finally {
//     setLoading(false);
//   }
// }, [view, filterPriority, filterStatus, searchQuery]);


//   useEffect(() => { fetchRequests(); }, [fetchRequests]);

//   const handleCompose = () => {
//     dispatch(fetchUnfilteredArticles({}));
//     setShowCompose(true);
//   };

//   const handleViewDetail = (reqId) => navigate(`/stock-request-details/${reqId}`);

//   const handleStarToggle = async (e, req) => {
//     e.stopPropagation();
//     const next = !req.is_starred;
//     AuthService.toggleStockRequestStar(req.req_id, next).catch(() => {});
//     setRequests((prev) =>
//       prev.map((r) => (r.req_id === req.req_id ? { ...r, is_starred: next } : r))
//     );
//   };

//   // ── Stat counts derived from list (or you can add a stats endpoint) ──
//   const stats = {
//     total:   pagination.total,
//     pending: requests.filter((r) => r.status?.includes("Pending")).length,
//     approved: requests.filter((r) => ["Scheduled","Awaiting Shipment"].includes(r.status)).length,
//     delivered: requests.filter((r) => r.status === "Delivered").length,
//   };

//   const VIEW_LABELS = {
//     sent:     "My Requests",
//     // inbox:    "Incoming Requests",
//     approved: "Approved Requests",
//     // starred:  "Starred",
//   };

//   // ─────────────────────────────────────────────────────────────
//   //  Table columns  (matching StockTransfer pattern)
//   // ─────────────────────────────────────────────────────────────



//   // ─────────────────────────────────────────────────────────────
//   //  Render
//   // ─────────────────────────────────────────────────────────────

//  return (
//   <div className="page-wrapper">
//     <div className="content">

//       {/* Page header — always visible */}
//       <div className="page-header mb-3">
//         <div className="add-item d-flex">
//           <div className="page-title">
//             <h4>Stock Requests</h4>
//             <h6>Manage stock requests between warehouses</h6>
//           </div>
//         </div>
//         <div className="page-btn">
//           {!showCompose && (
//             <button className="btn btn-added" onClick={handleCompose}>
//               <PlusCircle size={16} className="me-2" />New Stock Request
//             </button>
//           )}
//         </div>
//       </div>

//       {/* ── COMPOSE MODE: show only the form ── */}
//       {showCompose ? (
//         <ComposeForm
//           onClose={() => setShowCompose(false)}
//           onSent={() => { setShowCompose(false); setView("sent"); fetchRequests(); }}
//           articleOptions={articleOptions}
//           users={users}
//           userLoading={userLoading}
//           priorities={priorities}
//         />
//       ) : (
//         <>
//           {/* Stat cards */}
      



//         <div className="row">
//           {[
//             { label: "Total Requests", value: pagination.total,  cls: "das5", icon: <Package /> },
//             { label: "Pending",        value: stats.pending,   cls: "das6", icon: <Clock /> },
//             { label: "Approved",       value: stats.approved, cls: "das7", icon: <ThumbsUp/> },
//             {  label: "Delivered",      value: stats.delivered, cls: "das8",     icon: <CheckCircle /> },
//           ].map(({ label, value, cls, icon }) => (
//             <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
//               <div className={`dash-count ${cls} w-100`}>
//                 <div className="dash-counts"><h4>{value}</h4><h5>{label}</h5></div>
//                 <div className="dash-imgs">{icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//           {/* Main card */}
//           <div className="card table-list-card">
//             <div className="card-body">

       
//               {/* Table top bar */}
// <div className="table-top">
//   <div className="search-set">
//     <div className="search-input">
//       <input
//         type="text"
//         placeholder="Search requests…"
//         className="form-control form-control-sm formsearch"
//         value={searchQuery}
//         onChange={(e) => { setSearchQuery(e.target.value); }}
//         onKeyDown={(e) => { if (e.key === "Enter") fetchRequests(1); }}
//       />
//       <a href="#" className="btn btn-searchset" onClick={(e) => { e.preventDefault(); fetchRequests(1); }}>
//         <SearchIcon size={14} />
//       </a>
//     </div>
//     <div className="d-flex gap-2 ms-3">
//       {[
//         { key: "sent",     icon: <Send size={13} />,        label: "My Requests" },
//         { key: "approved", icon: <CheckCircle size={13} />, label: "Approved"    },
//       ].map(({ key, icon, label }) => (
//         <button key={key}
//           className={`btn btn-sm ${view === key ? "btn-primary" : "btn-outline-secondary"}`}
//           onClick={() => setView(key)}>
//           {icon}<span className="ms-1">{label}</span>
//         </button>
//       ))}
//     </div>
//   </div>
//   <div className="search-path">
//     <button
//       className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
//       onClick={() => setIsFilterVisible((p) => !p)}>
//       <Filter size={16} className="filter-icon" />
//     </button>
//   </div>
// </div>
//               {/* Filter panel */}
//               {isFilterVisible && (
//                 <div className="card mb-0">
//                   <div className="card-body pb-0">
//                     <div className="row">
//                       <div className="col-lg-3 col-sm-6 col-12">
//                         <div className="input-blocks">
//                           <label>Priority</label>
//                           <select className="form-select form-select-sm"
//                             value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)}>
//                             <option value="">All Priorities</option>
//                             {priorities.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
//                           </select>
//                         </div>
//                       </div>
//                       {view !== "approved" && (
//                         <div className="col-lg-3 col-sm-6 col-12">
//                           <div className="input-blocks">
//                             <label>Status</label>
//                             <select className="form-select form-select-sm"
//                               value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
//                               <option value="">All Statuses</option>
//                               <option value="pending">Pending</option>
//                               <option value="approved">Approved</option>
//                               <option value="linked">Linked to StockFlow</option>
//                             </select>
//                           </div>
//                         </div>
//                       )}
//                       <div className="col-lg-2 col-sm-6 col-12">
//                         <div className="input-blocks">
//                           <label>&nbsp;</label>
//                           <button className="btn btn-filters w-100"
//                             onClick={() => { setFilterPriority(""); setFilterStatus(""); fetchRequests(1); }}>
//                             Reset Filters
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               )}

//               {/* Approved view banner */}
//               {view === "approved" && (
//                 <div className="alert alert-success py-2 mb-3 d-flex align-items-center gap-2">
//                   <CheckCircle size={16} />
//                   <span className="small">
//                     These requests have been approved. Open a request and click
//                     <strong> Mark as Received</strong> once stock arrives.
//                   </span>
//                 </div>
//               )}

//               {/* Toolbar: title + pagination */}
//               <div className="d-flex justify-content-between align-items-center mb-3 p-3">
//                 <h5 className="mb-0">
//                   {VIEW_LABELS[view]}
//                   <span className="badge bg-secondary ms-2" style={{ fontSize: 12 }}>{pagination.total}</span>
//                 </h5>
//                 <div className="d-flex gap-1 align-items-center">
//                   <button className="btn btn-sm btn-white" title="Refresh"
//                     onClick={() => fetchRequests(pagination.currentPage)}>
//                     <RefreshCw size={14} />
//                   </button>
//                   <button className="btn btn-sm btn-white"
//                     disabled={pagination.currentPage <= 1}
//                     onClick={() => fetchRequests(pagination.currentPage - 1)}>
//                     <ChevronLeft size={14} />
//                   </button>
//                   <span className="small text-muted px-1">
//                     {pagination.currentPage} / {pagination.totalPages || 1}
//                   </span>
//                   <button className="btn btn-sm btn-white"
//                     disabled={pagination.currentPage >= pagination.totalPages}
//                     onClick={() => fetchRequests(pagination.currentPage + 1)}>
//                     <ChevronRight size={14} />
//                   </button>
//                 </div>
//               </div>

//               {/* Table */}
//               <div className="table-responsive">
//                 {loading ? (
//                   <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
//                 ) : requests.length === 0 ? (
//                   <div className="text-center p-5">
//                     <Inbox size={32} className="text-muted mb-2 d-block mx-auto" />
//                     <p className="text-muted">No stock requests found</p>
//                   </div>
//                 ) : (
//                   <table className="table table-hover align-middle">
//                     <thead className="table-light">
//                       <tr>
//                         <th style={{ width: 36 }} />
//                         <th style={{ width: 6, padding: 0 }} />
//                         <th>Request ID</th>
//                         <th>From</th>
//                         <th>To</th>
//                         <th>Articles</th>
//                         <th>Priority</th>
//                         <th>Status</th>
//                         <th className="text-end">Created</th>
//                         <th>Action</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {requests.map((req) => (
//                         <tr key={req.req_id} style={{ cursor: "pointer" }}
//                           onClick={() => handleViewDetail(req.req_id)}>
//                           <td onClick={(e) => handleStarToggle(e, req)}>
//                             <i className={`${req.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
//                           </td>
//                           <td style={{ padding: 0 }}>
//                             <div style={{
//                               width: 4, height: 38,
//                               background: getPriorityCfg(req.priority).color,
//                               borderRadius: 2, margin: "0 auto",
//                             }} />
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
//                                 <div className="small fw-semibold">{req.requester_name || "—"}</div>
//                                 <div className="text-muted" style={{ fontSize: 11 }}>{req.destination || "—"}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             <div className="d-flex align-items-center gap-1">
//                               <Inbox size={14} className="text-success flex-shrink-0" />
//                               <div>
//                                 <div className="small fw-semibold">{req.dispatcher_name || "—"}</div>
//                                 <div className="text-muted" style={{ fontSize: 11 }}>{req.source || "—"}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td>
//                             <div className="d-flex align-items-center gap-1">
//                               <Package size={14} className="text-primary" />
//                               <span className="badge badge-info">{req.total_articles} item{req.total_articles !== 1 ? "s" : ""}</span>
//                             </div>
//                             <div className="text-muted" style={{ fontSize: 11 }}>Qty: {req.total_quantity}</div>
//                           </td>
//                           <td>
//                             <span className={`badge ${getPriorityCfg(req.priority).badge}`}>
//                               {getPriorityCfg(req.priority).label}
//                             </span>
//                           </td>
//                           <td>
//                             {(() => {
//                               const scfg = STATUS_CFG[req.status] || { badge: "badge-secondary", icon: null };
//                               return (
//                                 <>
//                                   <span className={`badge ${scfg.badge} d-inline-flex align-items-center gap-1`}>
//                                     {scfg.icon}{req.status || "—"}
//                                   </span>
//                                   {req.action && (
//                                     <div className="text-muted mt-1" style={{ fontSize: 11 }}>{req.action}</div>
//                                   )}
//                                 </>
//                               );
//                             })()}
//                           </td>
//                           <td className="text-end">
//                             <span className="small text-muted" style={{ whiteSpace: "nowrap" }}>
//                               {fmtDate(req.created_at)}
//                             </span>
//                           </td>
//                           <td onClick={(e) => e.stopPropagation()}>
//                             <div className="edit-delete-action">
//                               <Link className="me-2 p-2" to={`/stock-request-details/${req.req_id}`} title="View Details">
//                                 <Eye size={16} className="text-info" />
//                               </Link>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 )}
//               </div>
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   </div>
// );
// };

// export default StockRequest;



/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  PlusCircle, Eye, CheckCircle, Clock, AlertCircle,
  Send, Inbox, Filter, RefreshCw,
  ChevronLeft, ChevronRight, Package, Truck,
  Search as SearchIcon, ThumbsUp,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import {

  fetchStockRequestStats,
  selectReqStats,
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
  "Pending for Approval":         { badge: "badge-linewarning", icon: <Clock size={12} /> },
  "Followed Up for Approval":     { badge: "badge-lineinfo",    icon: <Clock size={12} /> },
  "Escalated Due to No Approval": { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
  "Awaiting Shipment":            { badge: "badge-lineinfo",    icon: <Truck size={12} /> },
  "Scheduled":                    { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
  "Shipping Deadline Approaching":{ badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
  "Delivered":                    { badge: "badge-linesuccess", icon: <CheckCircle size={12} /> },
  "Resolution required":          { badge: "badge-linedanger",  icon: <AlertCircle size={12} /> },
};

const fmtDate = (dt) =>
  dt ? new Date(dt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric",hour: "2-digit",
    minute: "2-digit" }) : "—";

const getPriorityCfg = (key) =>
  PRIORITY_CFG[key] || { color: "#6c757d", badge: "badge-secondary", label: key || "—" };

// ─────────────────────────────────────────────────────────────
//  Main page
// ─────────────────────────────────────────────────────────────

const StockRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // ── Redux stats (fetched from dedicated endpoint) ──
  const reduxStats = useSelector(selectReqStats);

  const [view,           setView]           = useState("sent");
  const [requests,       setRequests]       = useState([]);
  const [pagination,     setPagination]     = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [loading,        setLoading]        = useState(false);
  const [isFilterVisible,setIsFilterVisible]= useState(false);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus,   setFilterStatus]   = useState("");

  // ── Fetch ──────────────────────────────────────────────────
  const fetchRequests = useCallback(async (page_no = 1) => {
    setLoading(true);
    try {
      const params = { page_no, limit: 10 };
      if (filterPriority) params.priority = filterPriority;
      if (filterStatus)   params.status   = filterStatus;
      if (searchQuery)    params.search   = searchQuery;

      const effectiveParams = view === "approved"
        ? { ...params, status: "approved" }
        : params;

      const res = await AuthService.getStockRequests(effectiveParams);
      setRequests(res.data.data || []);
      setPagination({
        currentPage: page_no,
        totalPages:  Math.ceil((res.data.total_records || 0) / 10),
        total:       res.data.total_records || 0,
      });
    } catch (err) {
      console.error("fetchRequests:", err);
    } finally {
      setLoading(false);
    }
  }, [view, filterPriority, filterStatus, searchQuery]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch stats from Redux on mount
  useEffect(() => {
    dispatch(fetchStockRequestStats());
  }, [dispatch]);

  // ── Handlers ───────────────────────────────────────────────
  const handleViewDetail = (reqId) => navigate(`/stock-request-details/${reqId}`);

  const handleStarToggle = async (e, req) => {
    e.stopPropagation();
    const next = !req.is_starred;
    AuthService.toggleStockRequestStar(req.req_id, next).catch(() => {});
    setRequests((prev) =>
      prev.map((r) => (r.req_id === req.req_id ? { ...r, is_starred: next } : r))
    );
  };

  const VIEW_LABELS = {
    sent:     "My Requests",
    approved: "Approved Requests",
  };

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
          {[
            {  label: "Total Requests", value: reduxStats.total    || pagination.total, cls: "das5", icon: <Package /> },
            {  label: "Pending",        value: reduxStats.pending  || 0,  cls: "das6", icon: <Clock /> },
            {  label: "Approved",       value: reduxStats.approved || 0, cls: "das7", icon: <ThumbsUp/> },
            {  label: "Delivered",      value: reduxStats.received || 0, cls: "das8",     icon: <CheckCircle /> },
          ].map(({ label, value, cls, icon }) => (
            <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className={`dash-count ${cls} w-100`}>
                <div className="dash-counts"><h4>{value}</h4><h5>{label}</h5></div>
                <div className="dash-imgs">{icon}</div>
              </div>
            </div>
          ))}
        </div>
      
      

        {/* ── Main card ── */}
        <div className="card mb-3">
          <div className="card-body">

            {/* ── Table top bar ── */}
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search requests…"
                    className="form-control form-control-sm formsearch"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") fetchRequests(1); }}
                  />
                  <a
                    href="#"
                    className="btn btn-searchset"
                    onClick={(e) => { e.preventDefault(); fetchRequests(1); }}
                  >
                    <SearchIcon size={14} />
                  </a>
                </div>
                {/* View tabs */}
                <div className="d-flex gap-2 ms-3">
                  {[
                    { key: "sent",     icon: <Send size={13} />,        label: "My Requests" },
                    { key: "approved", icon: <CheckCircle size={13} />, label: "Approved"    },
                  ].map(({ key, icon, label }) => (
                    <button
                      key={key}
                      className={`btn btn-sm ${view === key ? "btn-primary" : "btn-outline-secondary"}`}
                      onClick={() => setView(key)}
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
                          value={filterPriority}
                          onChange={(e) => setFilterPriority(e.target.value)}
                        >
                          <option value="">All Priorities</option>
                          {Object.entries(PRIORITY_CFG).map(([k, v]) => (
                            <option key={k} value={k}>{v.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {view !== "approved" && (
                      <div className="col-lg-3 col-sm-6 col-12">
                        <div className="input-blocks">
                          <label>Status</label>
                          <select
                            className="form-select form-select-sm"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                          >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="linked">Linked to StockFlow</option>
                          </select>
                        </div>
                      </div>
                    )}
                    <div className="col-lg-2 col-sm-6 col-12">
                      <div className="input-blocks">
                        <label>&nbsp;</label>
                        <button
                          className="btn btn-filters w-100"
                          onClick={() => {
                            setFilterPriority("");
                            setFilterStatus("");
                            setSearchQuery("");
                            fetchRequests(1);
                          }}
                        >
                          Reset Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Approved view banner ── */}
            {view === "approved" && (
              <div className="alert alert-success py-2 mb-3 mt-3 d-flex align-items-center gap-2">
                <CheckCircle size={16} />
                <span className="small">
                  These requests have been approved. Open a request and click
                  <strong> Mark as Received</strong> once stock arrives.
                </span>
              </div>
            )}

            {/* ── Title + pagination ── */}
            <div className="d-flex justify-content-between align-items-center mb-3 px-1 pt-3">
              <h5 className="mb-0">
                {VIEW_LABELS[view]}
                <span className="badge bg-secondary ms-2" style={{ fontSize: 12 }}>
                  {pagination.total}
                </span>
              </h5>
              <div className="d-flex gap-1 align-items-center">
                <button
                  className="btn btn-sm btn-white"
                  title="Refresh"
                  onClick={() => fetchRequests(pagination.currentPage)}
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  className="btn btn-sm btn-white"
                  disabled={pagination.currentPage <= 1}
                  onClick={() => fetchRequests(pagination.currentPage - 1)}
                >
                  <ChevronLeft size={14} />
                </button>
                <span className="small text-muted px-1">
                  {pagination.currentPage} / {pagination.totalPages || 1}
                </span>
                <button
                  className="btn btn-sm btn-white"
                  disabled={pagination.currentPage >= pagination.totalPages}
                  onClick={() => fetchRequests(pagination.currentPage + 1)}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

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
                <table className="table table-hover align-middle">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: 36 }} />
                      <th style={{ width: 6, padding: 0 }} />
                      <th>Request ID</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Articles</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th className="text-end">Created</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {/*   */}
                    {requests.map((req) => (
                      <tr
                        key={req.req_id}
                        style={{ cursor: "pointer" }}
                        onClick={() => handleViewDetail(req.req_id)}
                      >
                        {/* Star */}
                        <td onClick={(e) => handleStarToggle(e, req)}>
                          <i className={`${req.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
                        </td>

                        {/* Priority stripe */}
                        <td style={{ padding: 0 }}>
                          <div style={{
                            width: 4, height: 38,
                            background: getPriorityCfg(req.priority).color,
                            borderRadius: 2,
                            margin: "0 auto",
                          }} />
                        </td>

                        {/* Request ID */}
                        <td>
                          <Link
                            to={`/stock-request-details/${req.req_id}`}
                            className="badge badge-primary text-decoration-none"
                            style={{ fontFamily: "monospace" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {req.req_id}
                          </Link>
                        </td>

                        {/* From */}
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <Send size={14} className="text-danger flex-shrink-0" />
                            <div>
                              <div className="small fw-semibold">{req.requester_name || "—"}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>{req.destination || "—"}</div>
                            </div>
                          </div>
                        </td>

                        {/* To */}
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <Inbox size={14} className="text-success flex-shrink-0" />
                            <div>
                              <div className="small fw-semibold">{req.dispatcher_name || "—"}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>{req.source || "—"}</div>
                            </div>
                          </div>
                        </td>

                        {/* Articles */}
                        <td>
                          <div className="d-flex align-items-center gap-1">
                            <Package size={14} className="text-primary" />
                            <span className="badge badge-info">
                              {req.total_articles} item{req.total_articles !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="text-muted" style={{ fontSize: 11 }}>Qty: {req.total_quantity}</div>
                        </td>

                        {/* Priority badge */}
                        <td>
                          <span className={`badge ${getPriorityCfg(req.priority).badge}`}>
                            {getPriorityCfg(req.priority).label}
                          </span>
                        </td>

                        {/* Status */}
                        <td>
                          {(() => {
                            const scfg = STATUS_CFG[req.status] || { badge: "badge-secondary", icon: null };
                            return (
                              <>
                                <span className={`badge ${scfg.badge} d-inline-flex align-items-center gap-1`}>
                                  {scfg.icon}{req.status || "—"}
                                </span>
                                {req.action && (
                                  <div className="text-muted mt-1" style={{ fontSize: 11 }}>{req.action}</div>
                                )}
                              </>
                            );
                          })()}
                        </td>

                        {/* Created */}
                        <td className="text-end">
                          <span className="small text-muted" style={{ whiteSpace: "nowrap" }}>
                            {fmtDate(req.created_at)}
                          </span>
                        </td>

                        {/* Actions */}
                        <td onClick={(e) => e.stopPropagation()}>
                          <div className="edit-delete-action">
                            <Link
                              className="me-2 p-2"
                              to={`/stock-request-details/${req.req_id}`}
                              title="View Details"
                            >
                              <Eye size={16} className="text-info" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockRequest;