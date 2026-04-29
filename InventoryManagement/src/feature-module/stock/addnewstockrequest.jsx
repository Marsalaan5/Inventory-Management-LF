// /* eslint-disable react/prop-types */
// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, PlusCircle, Send, Trash2,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
// import {
//   createStockRequest,
//   fetchStockRequestPriorities,
//   selectReqPriorities,
//   selectReqCreateStatus,
//   selectReqError,
//   clearReqError,
// } from "../../core/redux/slices/stockSlice";
// import AuthService from "../../services/authService";

// const MySwal = withReactContent(Swal);

// // ─────────────────────────────────────────────────────────────
// //  Constants
// // ─────────────────────────────────────────────────────────────

// const PRIORITY_CFG = {
//   urgent:   { color: "#dc3545", label: "Urgent"   },
//   standard: { color: "#fd7e14", label: "Standard" },
//   low:      { color: "#198754", label: "Low"      },
// };

// const getPriorityCfg = (key) =>
//   PRIORITY_CFG[key] || { color: "#6c757d", label: key || "—" };

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
//     if (["Enter", ",", " ", "Tab"].includes(e.key)) {
//       e.preventDefault();
//       addEmail(inputVal);
//     } else if (e.key === "Backspace" && !inputVal && value.length) {
//       onChange(value.slice(0, -1));
//     }
//   };

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
//             className="btn-close"
//             style={{ fontSize: 8 }}
//             onClick={(e) => {
//               e.stopPropagation();
//               onChange(value.filter((v) => v !== email));
//             }}
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
//           border: "none", outline: "none", background: "transparent",
//           flex: 1, minWidth: 180, fontSize: 14,
//         }}
//       />
//     </div>
//   );
// };

// // ─────────────────────────────────────────────────────────────
// //  Custom hook — users
// // ─────────────────────────────────────────────────────────────

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

// // ─────────────────────────────────────────────────────────────
// //  AddNewStockRequest  (full page)
// // ─────────────────────────────────────────────────────────────

// const AddNewStockRequest = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);

//   // Redux
//   const reduxPriorities  = useSelector(selectReqPriorities);
//   const createStatus     = useSelector(selectReqCreateStatus);
//   const reduxError       = useSelector(selectReqError);
//   const { article_list } = useSelector((state) => state.articles);

//   const { users, loading: userLoading } = useUsers();

//   // ── Local form state ──
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

//   const sending = createStatus === "loading";

//   // ── Load priorities & articles on mount ──
//   useEffect(() => {
//     dispatch(fetchStockRequestPriorities());
//     dispatch(fetchUnfilteredArticles({}));
//   }, [dispatch]);

//   // Set default priority once loaded
//   useEffect(() => {
//     if (reduxPriorities.length && !form.priority) {
//       setForm((p) => ({ ...p, priority: reduxPriorities[0].value }));
//     }
//   }, [reduxPriorities]); // eslint-disable-line

//   // Show error toast from Redux
//   useEffect(() => {
//     if (reduxError) {
//       MySwal.fire({ icon: "error", title: "Error", text: reduxError, timer: 3000, showConfirmButton: false });
//       dispatch(clearReqError());
//     }
//   }, [reduxError, dispatch]);

//   // Fallback to PRIORITY_CFG keys if Redux priorities not yet loaded
//   const priorities = reduxPriorities.length
//     ? reduxPriorities
//     : Object.entries(PRIORITY_CFG).map(([k, v]) => ({ value: k, label: v.label }));

//   const articleOptions = article_list.map((a) => ({
//     value: a.uuid,
//     label: a.title || a.article_profile_name,
//   }));

//   const userOptions = users.map((u) => ({
//     value: u.value,
//     label: `${u.username} — ${u.email} | ${u.warehouse_title}`,
//     email: u.email,
//   }));

//   // ── Form helpers ──
//   const set      = (field, val) => setForm((p) => ({ ...p, [field]: val }));
//   const addItem  = ()           => set("req_articles", [...form.req_articles, { article_profile_id: "", article_profile_name: "", quantity: 1 }]);
//   const removeItem = (i)        => set("req_articles", form.req_articles.filter((_, idx) => idx !== i));

//   const updateItem = (i, field, val) => {
//     const arr = [...form.req_articles];
//     arr[i] = { ...arr[i], [field]: val };
//     set("req_articles", arr);
//   };

//   const handleArticleSelect = (i, opt) => {
//     const arr = [...form.req_articles];
//     arr[i] = {
//       ...arr[i],
//       article_profile_id:   opt?.value || "",
//       article_profile_name: opt?.label || "",
//     };
//     set("req_articles", arr);
//   };

//   // ── Submit ──
//   const handleSubmit = async () => {
//     if (!form.selected_user)
//       return MySwal.fire({ icon: "warning", title: "Select a dispatcher", timer: 2000, showConfirmButton: false });

//     const validItems = form.req_articles.filter((i) => i.article_profile_id && i.quantity > 0);
//     if (!validItems.length)
//       return MySwal.fire({ icon: "warning", title: "Add at least one article", timer: 2000, showConfirmButton: false });

//     if (!form.priority)
//       return MySwal.fire({ icon: "warning", title: "Select a priority", timer: 2000, showConfirmButton: false });

//     try {
//       await dispatch(createStockRequest({
//         selected_user:       form.selected_user,
//         cc_recipients:       form.cc_recipients,
//         priority:            form.priority,
//         description:         form.description || undefined,
//         follow_up_selected:  form.follow_up_selected,
//         follow_up_days:      form.follow_up_selected  ? form.follow_up_days  : null,
//         escalation_selected: form.escalation_selected,
//         escalation_days:     form.escalation_selected ? form.escalation_days : null,
//         req_articles:        validItems,
//       })).unwrap();

//       MySwal.fire({
//         icon: "success",
//         title: "Request Sent!",
//         text: "Your stock request has been submitted successfully.",
//         timer: 2500,
//         showConfirmButton: false,
//       }).then(() => navigate("/stock-request"));
//     } catch (err) {
//       // error handled via Redux effect above
//     }
//   };

//   // ─────────────────────────────────────────────────────────────
//   //  Render
//   // ─────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* ── Page Header ── */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>New Stock Request</h4>
//               <h6>Request articles from a dispatcher warehouse</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-request" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link
//                   id="collapse-header"
//                   className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}
//                 >
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* ── Dispatcher + Priority row ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Request Details</h5>
//             <div className="row mb-3">

//               {/* Dispatcher */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Dispatcher <span className="text-danger">*</span>
//                 </label>
//                 <Select
//                   options={userOptions}
//                   value={userOptions.find((o) => o.value === form.selected_user) || null}
//                   onChange={(opt) => set("selected_user", opt?.value || "")}
//                   placeholder={userLoading ? "Loading users…" : "Select dispatcher…"}
//                   isLoading={userLoading}
//                   isSearchable
//                   isClearable
//                   menuPortalTarget={document.body}
//                   styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
//                 />
//                 {form.selected_user && (() => {
//                   const u = userOptions.find((o) => o.value === form.selected_user);
//                   return u
//                     ? <small className="text-muted mt-1 d-block"><i className="fas fa-envelope me-1" />{u.email}</small>
//                     : null;
//                 })()}
//               </div>

//               {/* Priority */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Priority <span className="text-danger">*</span>
//                 </label>
//                 <div className="d-flex gap-2 flex-wrap mt-1">
//                   {priorities.map((p) => {
//                     const cfg      = getPriorityCfg(p.value);
//                     const isActive = form.priority === p.value;
//                     return (
//                       <button
//                         key={p.value}
//                         type="button"
//                         className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-secondary"}`}
//                         style={isActive ? { background: cfg.color, borderColor: cfg.color } : {}}
//                         onClick={() => set("priority", p.value)}
//                       >
//                         {p.label}
//                       </button>
//                     );
//                   })}
//                 </div>
//               </div>
//             </div>

//             {/* CC Recipients */}
//             <div className="row mb-3">
//               <div className="col-lg-12">
//                 <label className="form-label">CC Recipients</label>
//                 <CCRecipientsInput
//                   value={form.cc_recipients}
//                   onChange={(v) => set("cc_recipients", v)}
//                 />
//                 <small className="text-muted">Press Enter, comma, or Tab to add each email</small>
//               </div>
//             </div>

//             {/* Description */}
//             <div className="row">
//               <div className="col-lg-12">
//                 <label className="form-label">
//                   Description <span className="text-muted fw-normal">(optional)</span>
//                 </label>
//                 <textarea
//                   className="form-control"
//                   rows="3"
//                   maxLength={255}
//                   value={form.description}
//                   onChange={(e) => set("description", e.target.value)}
//                   placeholder="Any additional instructions or notes…"
//                 />
//                 <small className="text-muted">{form.description.length}/255</small>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Articles table ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex justify-content-between align-items-center mb-3">
//               <h5 className="mb-0">
//                 Articles <span className="text-danger">*</span>
//               </h5>
//               <button type="button" className="btn btn-sm btn-added" onClick={addItem}>
//                 <PlusCircle size={14} className="me-1" /> Add Row
//               </button>
//             </div>

//             <div className="table-responsive">
//               <table className="table table-bordered table-sm align-middle mb-0">
//                 <thead className="table-light">
//                   <tr>
//                     <th>#</th>
//                     <th>Article</th>
//                     <th style={{ width: 140 }}>Quantity</th>
//                     <th style={{ width: 56 }} />
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {form.req_articles.map((item, i) => (
//                     <tr key={i}>
//                       <td className="text-muted small" style={{ width: 40 }}>{i + 1}</td>
//                       <td>
//                         <Select
//                           options={articleOptions}
//                           value={articleOptions.find((o) => o.value === item.article_profile_id) || null}
//                           onChange={(opt) => handleArticleSelect(i, opt)}
//                           placeholder="Select article…"
//                           isClearable
//                           isSearchable
//                           menuPortalTarget={document.body}
//                           styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
//                         />
//                       </td>
//                       <td>
//                         <input
//                           type="number"
//                           className="form-control form-control-sm"
//                           min="1"
//                           value={item.quantity}
//                           onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
//                         />
//                       </td>
//                       <td>
//                         {form.req_articles.length > 1 && (
//                           <button
//                             type="button"
//                             className="btn btn-sm btn-outline-danger"
//                             onClick={() => removeItem(i)}
//                             title="Remove row"
//                           >
//                             <Trash2 size={14} />
//                           </button>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>

//         {/* ── Automation ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Automation</h5>
//             <div className="row g-3">

//               {/* Follow-up */}
//               <div className="col-md-6">
//                 <div className="border rounded p-3 h-100">
//                   <div className="form-check mb-0">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="followUp"
//                       checked={form.follow_up_selected}
//                       onChange={(e) => set("follow_up_selected", e.target.checked)}
//                     />
//                     <label className="form-check-label fw-semibold" htmlFor="followUp">
//                       Follow-up reminder
//                     </label>
//                   </div>
//                   <p className="text-muted small mt-1 mb-0">
//                     Automatically send a follow-up email if no response is received.
//                   </p>
//                   {form.follow_up_selected && (
//                     <div className="mt-3 d-flex align-items-center gap-2">
//                       <span className="text-muted small">Send after</span>
//                       <input
//                         type="number"
//                         className="form-control form-control-sm"
//                         style={{ width: 70 }}
//                         min="1"
//                         max="30"
//                         value={form.follow_up_days}
//                         onChange={(e) => set("follow_up_days", parseInt(e.target.value) || 1)}
//                       />
//                       <span className="text-muted small">days</span>
//                     </div>
//                   )}
//                 </div>
//               </div>

//               {/* Escalation */}
//               <div className="col-md-6">
//                 <div className="border rounded p-3 h-100">
//                   <div className="form-check mb-0">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="escalation"
//                       checked={form.escalation_selected}
//                       onChange={(e) => set("escalation_selected", e.target.checked)}
//                     />
//                     <label className="form-check-label fw-semibold" htmlFor="escalation">
//                       Auto-escalation
//                     </label>
//                   </div>
//                   <p className="text-muted small mt-1 mb-0">
//                     Escalate to a manager if the dispatcher has not responded.
//                   </p>
//                   {form.escalation_selected && (
//                     <div className="mt-3 d-flex align-items-center gap-2">
//                       <span className="text-muted small">Escalate after</span>
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
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Submit / Cancel ── */}
//         <div className="row mb-4">
//           <div className="col-12">
//             <div className="btn-addproduct">
//               <Link to="/stock-request" className="btn btn-cancel me-2">
//                 Cancel
//               </Link>
//               <button
//                 type="button"
//                 className="btn btn-submit"
//                 onClick={handleSubmit}
//                 disabled={sending}
//               >
//                 {sending
//                   ? <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
//                   : <><Send size={16} className="me-1" />Send Request</>
//                 }
//               </button>
//             </div>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AddNewStockRequest;





/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  ArrowLeft, ChevronUp, PlusCircle, Send, Trash2,
} from "feather-icons-react/build/IconComponents";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
import {
  createStockRequest,
  selectReqCreateStatus,
  selectReqError,
  clearReqError,
} from "../../core/redux/slices/stockSlice";
import AuthService from "../../services/authService";

const MySwal = withReactContent(Swal);

// ─────────────────────────────────────────────────────────────
//  Constants
// Priority values must match backend ENUM from stock_request table
// Backend derives these dynamically from DB: SHOW COLUMNS FROM stock_request LIKE 'priority'
// ─────────────────────────────────────────────────────────────

const PRIORITY_CFG = {
  urgent:   { color: "#dc3545", label: "Urgent"   },
  standard: { color: "#fd7e14", label: "Standard" },
  low:      { color: "#198754", label: "Low"      },
};

const getPriorityCfg = (key) =>
  PRIORITY_CFG[(key || "").toLowerCase()] ||
  { color: "#6c757d", label: key || "—" };

// Fallback priorities if DB enum can't be fetched
const FALLBACK_PRIORITIES = Object.entries(PRIORITY_CFG).map(([k, v]) => ({
  value: k,
  label: v.label,
}));

// ─────────────────────────────────────────────────────────────
//  CCRecipientsInput  — tag-style email input
// ─────────────────────────────────────────────────────────────


const CCRecipientsInput = ({ value = [], fixed =[] ,onChange }) => {
  const [inputVal, setInputVal] = useState("");
  const inputRef = useRef(null);

  const addEmail = (raw) => {
    const email = raw.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    // if (value.includes(email)) return;
    if (value.includes(email) || fixed.includes(email)) return;

    if (value.length + fixed.length >= 15) {
      MySwal.fire({ icon: "warning", title: "Max 15 CC recipients", timer: 1500, showConfirmButton: false });
      return;
    }
    onChange([...value, email]);
    setInputVal("");
  };

  const handleKeyDown = (e) => {
    if (["Enter", ",", " ", "Tab"].includes(e.key)) {
      e.preventDefault();
      addEmail(inputVal);
    } else if (e.key === "Backspace" && !inputVal && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <div
      className="form-control d-flex flex-wrap gap-1 align-items-center"
      style={{ minHeight: 42, cursor: "text", height: "auto" ,textTransform:"none"}}
      onClick={() => inputRef.current?.focus()}
    >
      {fixed.map((email) => (
  <span
    key={email}
    className="badge bg-secondary text-white d-flex align-items-center gap-1"
    style={{ fontSize: 12,textTransform:"none" }}
    title="From system (cannot remove)"
  >
    {email}
  </span>
))}

{value.map((email) => (
  <span
    key={email}
    className="badge bg-light text-dark border d-flex align-items-center gap-1"
    style={{ fontSize: 12,textTransform: "none" }}
  >
    {email}
    <button
      type="button"
      className="btn-close"
      style={{ fontSize: 8,textTransform: "none" }}
      onClick={(e) => {
        e.stopPropagation();
        onChange(value.filter((v) => v !== email));
      }}
    />
  </span>
))}

      <input
        ref={inputRef}
        type="text"
        value={inputVal}
        onChange={(e) => setInputVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputVal && addEmail(inputVal)}
        placeholder={value.length ? "" : "Add emails, press Enter or comma…"}
        style={{
          border: "none", outline: "none", background: "transparent",textTransform: "none",
          flex: 1, minWidth: 180, fontSize: 14,
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Custom hook — users
// Fetches all users for dispatcher selection
// AuthService.getAllUsers() → { data: { data: [{ usr_uuid, user_name, user_email, warehouse_id, warehouse_title }] } }
// ─────────────────────────────────────────────────────────────

const useUsers = () => {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AuthService.getAllUsers();
      // AuthService.getAllUsers uses GET /auth/getAllUsers
      const raw = res.data?.data || res.data || [];
      setUsers(
        raw.map((u) => ({
          user_id:         u.usr_uuid || u.user_id,
          username:        u.user_name  || u.user_email || "Unknown",
          email:           u.user_email || "",
          warehouse_id:    u.warehouse_id,
          warehouse_title: u.warehouse_title || "No Warehouse",
          // react-select shape
          value: u.usr_uuid || u.user_id,
          label: `${u.user_name || u.user_email} — ${u.user_email} | ${u.warehouse_title || "No Warehouse"}`,
        }))
      );
    } catch (err) {
      console.error("useUsers fetchUsers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  return { users, loading };
};

// ─────────────────────────────────────────────────────────────
//  AddNewStockRequest  (full page)
// ─────────────────────────────────────────────────────────────

const AddNewStockRequest = () => {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const headerToggle = useSelector((s) => s.toggle_header);

  // Redux
  const createStatus = useSelector(selectReqCreateStatus);
  const reduxError   = useSelector(selectReqError);

  // Articles from Redux (fetchUnfilteredArticles)
  const { article_list } = useSelector((state) => state.articles);

  const { users, loading: userLoading } = useUsers();

  // ── Local form state ──────────────────────────────────────
  const [form, setForm] = useState({
    selected_user:       "",
    cc_recipients:       [], 
    cc_fixed:            [],    
    priority:            "standard",
    follow_up_selected:  true,
    follow_up_days:      2,
    escalation_selected: true,
    escalation_days:     7,
    req_articles: [
      { article_profile_id: "", article_profile_name: "", quantity: 1 },
    ],
    description: "",
  });



  const sending = createStatus === "loading";


useEffect(() => {
  const fetchCC = async () => {
    try {
      const res = await AuthService.getDefaultCCEmails(); 
      
      const ccList = res.data?.data?.value || [];

      setForm((prev) => ({
        ...prev,
        cc_fixed: Array.isArray(ccList) ? ccList : [],
      }));
    } catch (err) {
      console.error("Failed to load CC emails:", err);
    }
  };

  fetchCC();
}, []);


  // ── Load articles on mount ────────────────────────────────
  useEffect(() => {
    dispatch(fetchUnfilteredArticles({}));
  }, [dispatch]);

  // ── Show error toast from Redux ───────────────────────────
  useEffect(() => {
    if (reduxError) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: reduxError,
        timer: 3000,
        showConfirmButton: false,
      });
      dispatch(clearReqError());
    }
  }, [reduxError, dispatch]);

  // ── Article options for react-select ─────────────────────
  // fetchUnfilteredArticles stores in article_list
  // Each article: { uuid, title, article_profile_name, ... }
  const articleOptions = (article_list || []).map((a) => ({
    value: a.uuid || a.art_prof_uuid,
    label: a.title || a.article_profile_name || "Unnamed Article",
  }));

  // ── Form helpers ──────────────────────────────────────────
  const set        = (field, val) => setForm((p) => ({ ...p, [field]: val }));
  const addItem    = ()           => set("req_articles", [
    ...form.req_articles,
    { article_profile_id: "", article_profile_name: "", quantity: 1 },
  ]);
  const removeItem = (i) => set(
    "req_articles",
    form.req_articles.filter((_, idx) => idx !== i)
  );

  const updateItem = (i, field, val) => {
    const arr = [...form.req_articles];
    arr[i] = { ...arr[i], [field]: val };
    set("req_articles", arr);
  };

  const handleArticleSelect = (i, opt) => {
    const arr = [...form.req_articles];
    arr[i] = {
      ...arr[i],
      article_profile_id:   opt?.value || "",
      article_profile_name: opt?.label || "",
    };
    set("req_articles", arr);
  };




  // ── Submit ────────────────────────────────────────────────
  // Backend payload (createStockRequest / create_stock_request):
  // {
  //   priority: string (enum from DB),
  //   dispatcher (renamed from selected_user via Joi rename): uuid,
  //   cc_recipients: string[] of emails (min 1, max 15),
  //   req_articles: [{ article_profile_id, article_profile_name, quantity }],
  //   follow_up_selected: boolean,
  //   follow_up_days?: number 1-7,
  //   escalation_selected: boolean,
  //   escalation_days?: number 1-7,
  //   description?: string max 255,
  // }
  const handleSubmit = async () => {
    if (!form.selected_user) {
      return MySwal.fire({
        icon: "warning",
        title: "Select a Dispatcher",
        text: "Please choose a dispatcher warehouse user.",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    const validItems = form.req_articles.filter(
      (i) => i.article_profile_id && i.quantity > 0
    );
    if (!validItems.length) {
      return MySwal.fire({
        icon: "warning",
        title: "Add Articles",
        text: "Please add at least one article with a valid quantity.",
        timer: 2000,
        showConfirmButton: false,
      });
    }

    if (!form.priority) {
      return MySwal.fire({
        icon: "warning",
        title: "Select Priority",
        timer: 2000,
        showConfirmButton: false,
      });
    }


    const totalCC = [...form.cc_fixed, ...form.cc_recipients];
    if (totalCC.length === 0) {
      const result = await MySwal.fire({
        icon: "warning",
        title: "No CC Recipients",
        text: "Requires at least 1 CC email. Add one to continue.",
        timer: 3000,
        showConfirmButton: true,
        confirmButtonText: "OK",
      });
      return result;
    }

  
    const follow_up_days_val  = Math.min(form.follow_up_days,  7);
    const escalation_days_val = Math.min(form.escalation_days, 7);

    try {
      await dispatch(createStockRequest({
        selected_user:       form.selected_user,      
        // cc_recipients:       form.cc_recipients,
        cc_recipients:       [...form.cc_fixed, ...form.cc_recipients],
        priority:            form.priority,
        description:         form.description || undefined,
        follow_up_selected:  form.follow_up_selected,
        follow_up_days:      form.follow_up_selected ? follow_up_days_val : null,
        escalation_selected: form.escalation_selected,
        escalation_days:     form.escalation_selected ? escalation_days_val : null,
        req_articles:        validItems,
      })).unwrap();

      MySwal.fire({
        icon: "success",
        title: "Request Sent!",
        text: "Your stock request has been submitted successfully.",
        timer: 2500,
        showConfirmButton: false,
      }).then(() => navigate("/stock-request"));
    } catch {
      // error handled via Redux effect above
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="page-wrapper">
      <div className="content">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>New Stock Request</h4>
              <h6>Request articles from a dispatcher warehouse</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <Link to="/stock-request" className="btn btn-secondary btn-sm">
                <ArrowLeft size={16} className="me-1" />Back
              </Link>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
                <Link
                  id="collapse-header"
                  className={headerToggle ? "active" : ""}
                  onClick={() => dispatch(setToogleHeader(!headerToggle))}
                >
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        {/* ── Request Details card ── */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-4">Request Details</h5>

            <div className="row mb-3">
              {/* Dispatcher selection */}
              <div className="col-lg-6">
                <label className="form-label">
                  Dispatcher <span className="text-danger">*</span>
                </label>
                <Select
                  options={users.map((u) => ({
                    value: u.value,
                    label: `${u.username} — ${u.email} | ${u.warehouse_title}`,
                    email: u.email,
                  }))}
                  value={
                    users
                      .map((u) => ({
                        value: u.value,
                        label: `${u.username} — ${u.email} | ${u.warehouse_title}`,
                        email: u.email,
                      }))
                      .find((o) => o.value === form.selected_user) || null
                  }
                  onChange={(opt) => set("selected_user", opt?.value || "")}
                  placeholder={userLoading ? "Loading users…" : "Select dispatcher…"}
                  isLoading={userLoading}
                  isSearchable
                  isClearable
                  menuPortalTarget={document.body}
                  styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                />
                {form.selected_user && (() => {
                  const u = users.find((o) => o.value === form.selected_user);
                  return u ? (
                    <small className="text-muted mt-1 d-block">
                      <i className="fas fa-envelope me-1" />{u.email}
                      <span className="ms-2 badge badge-secondary">{u.warehouse_title}</span>
                    </small>
                  ) : null;
                })()}
              </div>

              {/* Priority selector */}
              <div className="col-lg-6">
                <label className="form-label">
                  Priority <span className="text-danger">*</span>
                </label>
                <div className="d-flex gap-2 flex-wrap mt-1">
                  {FALLBACK_PRIORITIES.map((p) => {
                    const cfg      = getPriorityCfg(p.value);
                    const isActive = form.priority === p.value;
                    return (
                      <button
                        key={p.value}
                        type="button"
                        className={`btn btn-sm ${isActive ? "btn-primary" : "btn-outline-secondary"}`}
                        style={isActive ? { background: cfg.color, borderColor: cfg.color } : {}}
                        onClick={() => set("priority", p.value)}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* CC Recipients */}
            <div className="row mb-3">
              <div className="col-lg-12">
                <label className="form-label">
                  CC Recipients <span className="text-danger">*</span>{" "}
                  <span className="text-muted fw-normal small">(min 1, max 15)</span>
                </label>
                <CCRecipientsInput
                  value={form.cc_recipients}
                  fixed={form.cc_fixed}
                  onChange={(v) => set("cc_recipients", v)}
                />
                <small className="text-muted">
                  Press Enter, comma, or Tab to add each email.
                  {form.cc_recipients.length > 0 && (
                    <span className="ms-2 badge bg-secondary">{form.cc_recipients.length}/15</span>
                  )}
                </small>
              </div>
            </div>
{/*  */}
            {/* Description */}
            <div className="row">
              <div className="col-lg-12">
                <label className="form-label">
                  Description{" "}
                  <span className="text-muted fw-normal">(optional, max 255)</span>
                </label>
                <textarea
                  className="form-control"
                  rows="3"
                  maxLength={255}
                  value={form.description}
                  onChange={(e) => set("description", e.target.value)}
                  placeholder="Any additional instructions or notes…"
                />
                <small className="text-muted">{form.description.length}/255</small>
              </div>
            </div>
          </div>
        </div>

        {/* ── Articles table ── */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">
                Articles <span className="text-danger">*</span>
                <small className="text-muted fw-normal ms-2" style={{ fontSize: 13 }}>
                  ({form.req_articles.filter((i) => i.article_profile_id).length} selected)
                </small>
              </h5>
              <button type="button" className="btn btn-sm btn-added" onClick={addItem}>
                <PlusCircle size={14} className="me-1" />Add Row
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-bordered table-sm align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>Article <span className="text-danger">*</span></th>
                    <th style={{ width: 160 }}>
                      Quantity <span className="text-danger">*</span>{" "}
                      <small className="text-muted fw-normal">(1–10000)</small>
                    </th>
                    <th style={{ width: 56 }} />
                  </tr>
                </thead>
                <tbody>
                  {form.req_articles.map((item, i) => (
                    <tr key={i}>
                      <td className="text-muted small">{i + 1}</td>
                      <td>
                        <Select
                          options={articleOptions}
                          value={
                            articleOptions.find(
                              (o) => o.value === item.article_profile_id
                            ) || null
                          }
                          onChange={(opt) => handleArticleSelect(i, opt)}
                          placeholder="Select article…"
                          isClearable
                          isSearchable
                          menuPortalTarget={document.body}
                          styles={{ menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                          noOptionsMessage={() =>
                            articleOptions.length === 0
                              ? "Loading articles…"
                              : "No articles found"
                          }
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          min="1"
                          max="10000"
                          value={item.quantity}
                          onChange={(e) =>
                            updateItem(
                              i,
                              "quantity",
                              Math.min(10000, parseInt(e.target.value) || 1)
                            )
                          }
                        />
                      </td>
                      <td>
                        {form.req_articles.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => removeItem(i)}
                            title="Remove row"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

    
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-4">Automation</h5>
            <div className="row g-3">

              {/* Follow-up */}
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="followUp"
                      checked={form.follow_up_selected}
                      onChange={(e) => set("follow_up_selected", e.target.checked)}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="followUp">
                      Follow-up reminder
                    </label>
                  </div>
                  <p className="text-muted small mt-1 mb-0">
                    Automatically send a follow-up email if no response is received.
                  </p>
                  {form.follow_up_selected && (
                    <div className="mt-3 d-flex align-items-center gap-2">
                      <span className="text-muted small">Send after</span>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: 70 }}
                        min="1"
                        max="7"
                        value={form.follow_up_days}
                        onChange={(e) =>
                          set("follow_up_days", Math.min(7, parseInt(e.target.value) || 1))
                        }
                      />
                      <span className="text-muted small">days (max 7)</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Escalation */}
              <div className="col-md-6">
                <div className="border rounded p-3 h-100">
                  <div className="form-check mb-0">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="escalation"
                      checked={true}
                      // onChange={(e) => set("escalation_selected", e.target.checked)}
                      disabled
                    />
                    <label className="form-check-label fw-semibold" htmlFor="escalation">
                      Auto-escalation
                    </label>
                  </div>
                  <p className="text-muted small mt-1 mb-0">
                    Escalate to a manager if the Supplier has not responded.
                  </p>
                  {form.escalation_selected && (
                    <div className="mt-3 d-flex align-items-center gap-2">
                      <span className="text-muted small">Escalate after</span>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: 70 }}
                        min="1"
                        max="7"
                        value={form.escalation_days}
                        // onChange={(e) =>
                        //   set("escalation_days", Math.min(7, parseInt(e.target.value) || 1))
                        // }
                        disabled
                      />
                      {/* <span className="text-muted small">days (max 7)</span> */}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Submit / Cancel ── */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="btn-addproduct">
              <Link to="/stock-request" className="btn btn-cancel me-2">
                Cancel
              </Link>
              <button
                type="button"
                className="btn btn-submit"
                onClick={handleSubmit}
                disabled={sending}
              >
                {sending ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Sending…
                  </>
                ) : (
                  <>
                    <Send size={16} className="me-1" />
                    Send Request
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AddNewStockRequest;