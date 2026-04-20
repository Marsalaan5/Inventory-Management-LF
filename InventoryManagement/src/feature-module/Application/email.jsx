// // 

// // components/Email.jsx
// import React, { useState, useEffect } from "react";
// import { Link } from "react-router-dom";
// import Select from "react-select";
// import { useDispatch, useSelector } from "react-redux";
// import { fetchUnfilteredArticles } from "../../core/redux/slices/articleSlice";
// import AuthService from "../../services/authService";

// const stripHtmlTags = (html) => {
//   const parser = new DOMParser();
//   const doc = parser.parseFromString(html, "text/html");
//   return doc.body.textContent || "";
// };

// const Email = () => {
//   const dispatch = useDispatch();
//   const { article_list } = useSelector((state) => state.articles);

//   const [emails, setEmails] = useState([]);
//   const [selectedEmails, setSelectedEmails] = useState([]);
//   const [currentView, setCurrentView] = useState("inbox");
//   const [showCompose, setShowCompose] = useState(false);
//   const [showStockRequest, setShowStockRequest] = useState(false);
//   const [selectedEmail, setSelectedEmail] = useState(null);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [notifications, setNotifications] = useState([]);
//   const [loading, setLoading] = useState(false);

//   const [composeData, setComposeData] = useState({
//     to: "",
//     subject: "",
//     body: "",
//     template: "none",
//     enableFollowUp: true,
//     followUpDays: 2,
//     enableEscalation: true,
//     escalationEmail: "",
//     escalationDays: 3,
//   });

//   const [stockRequestData, setStockRequestData] = useState({
//     to: "",
//     items: [{ articleId: "", productName: "", quantity: 1 }],
//     urgency: "medium",
//     notes: "",
//     enableFollowUp: true,
//     followUpDays: 2,
//     enableEscalation: false,
//     escalationEmail: "",
//     escalationDays: 3,
//   });

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalEmails: 0,
//   });

//   // Article options from Redux
//   const articleOptions = article_list.map((a) => ({
//     value: a.id || a.uuid,
//     label: a.title,
//   }));

//   // Fetch emails
//   const fetchEmails = async (view = currentView, page = 1) => {
//     setLoading(true);
//     try {
//       const response = await AuthService.getEmails(view, page, 10, searchQuery);
//       setEmails(response.data.data);
//       setPagination({
//         currentPage: response.data.pagination.page,
//         totalPages: response.data.pagination.totalPages,
//         totalEmails: response.data.pagination.total,
//       });
//     } catch (error) {
//       console.error("Error fetching emails:", error);
//       showNotification("Error loading emails");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch notifications
//   const fetchNotifications = async () => {
//     try {
//       const response = await AuthService.getNotifications(20);
//       setNotifications(response.data.data || []);
//     } catch (error) {
//       console.error("Error fetching notifications:", error);
//     }
//   };

//   useEffect(() => {
//     fetchEmails();
//     fetchNotifications();
//     const interval = setInterval(() => {
//       fetchEmails(currentView, pagination.currentPage);
//       fetchNotifications();
//     }, 30000);
//     return () => clearInterval(interval);
//     //eslint-disable-next-line
//   }, [currentView, searchQuery]);

//   // Open stock request form and fetch articles via Redux
//   const handleOpenStockRequest = () => {
//     dispatch(fetchUnfilteredArticles({}));
//     setShowStockRequest(true);
//     setShowCompose(false);
//   };

//   // Items helpers
//   const addStockItem = () => {
//     setStockRequestData((prev) => ({
//       ...prev,
//       items: [...prev.items, { articleId: "", productName: "", quantity: 1 }],
//     }));
//   };

//   const removeStockItem = (index) => {
//     setStockRequestData((prev) => ({
//       ...prev,
//       items: prev.items.filter((_, i) => i !== index),
//     }));
//   };

//   const updateStockItem = (index, field, value) => {
//     setStockRequestData((prev) => {
//       const updated = [...prev.items];
//       updated[index] = { ...updated[index], [field]: value };
//       return { ...prev, items: updated };
//     });
//   };

//   // Send email
//   const sendEmail = async () => {
//     if (!composeData.to || !composeData.subject) {
//       showNotification("Please fill in all required fields");
//       return;
//     }
//     try {
//       await AuthService.sendEmails(composeData);
//       showNotification("Email sent successfully!");
//       setShowCompose(false);
//       resetComposeForm();
//       fetchEmails("sent");
//     } catch (error) {
//       console.error("Error sending email:", error);
//       showNotification(error.response?.data?.message || "Error sending email");
//     }
//   };

//   // Send stock request
//   const sendStockRequest = async () => {
//     if (!stockRequestData.to) {
//       showNotification("Please enter recipient email");
//       return;
//     }
//     const validItems = stockRequestData.items.filter(
//       (i) => i.articleId && i.quantity > 0
//     );
//     if (validItems.length === 0) {
//       showNotification("Please select at least one article");
//       return;
//     }
//     try {
//       await AuthService.sendStockRequest({
//         ...stockRequestData,
//         items: validItems,
//       });
//       showNotification("Stock request sent successfully!");
//       setShowStockRequest(false);
//       resetStockRequestForm();
//       fetchEmails("sent");
//     } catch (error) {
//       console.error("Error sending stock request:", error);
//       showNotification(
//         error.response?.data?.message || "Error sending stock request"
//       );
//     }
//   };

//   // Respond to stock request
//   const respondToStockRequest = async (
//     emailId,
//     action,
//     deadlineDays = null,
//     notes = ""
//   ) => {
//     try {
//       await AuthService.respondToStockRequest(emailId, action, deadlineDays, notes);
//       showNotification(`Stock request ${action}d successfully!`);
//       setSelectedEmail(null);
//       fetchEmails();
//     } catch (error) {
//       console.error("Error responding to stock request:", error);
//       showNotification(
//         error.response?.data?.message || "Error responding to stock request"
//       );
//     }
//   };

//   // Mark as read
//   const markAsRead = async (emailId) => {
//     try {
//       await AuthService.markEmailAsRead(emailId);
//       setEmails((prev) =>
//         prev.map((e) => (e.id === emailId ? { ...e, is_read: true } : e))
//       );
//     } catch (error) {
//       console.error("Error marking email as read:", error);
//     }
//   };

//   // Toggle star
//   const toggleStar = async (emailId, currentStarred) => {
//     try {
//       await AuthService.toggleEmailStar(emailId, !currentStarred);
//       setEmails((prev) =>
//         prev.map((e) =>
//           e.id === emailId ? { ...e, is_starred: !currentStarred } : e
//         )
//       );
//     } catch (error) {
//       console.error("Error toggling star:", error);
//     }
//   };

//   // Delete email
//   const deleteEmail = async (emailId) => {
//     try {
//       await AuthService.deleteEmail(emailId);
//       showNotification("Email deleted");
//       fetchEmails();
//     } catch (error) {
//       console.error("Error deleting email:", error);
//       showNotification("Error deleting email");
//     }
//   };

//   // Bulk actions
//   const handleBulkAction = async (action) => {
//     if (selectedEmails.length === 0) {
//       showNotification("Please select emails first");
//       return;
//     }
//     try {
//       await AuthService.bulkEmailAction(action, selectedEmails);
//       showNotification(`Bulk ${action} completed successfully`);
//       setSelectedEmails([]);
//       fetchEmails();
//     } catch (error) {
//       console.error("Error performing bulk action:", error);
//       showNotification(
//         error.response?.data?.message || "Error performing bulk action"
//       );
//     }
//   };
// // 
//   const replyToEmail = (email) => {
//     const plainTextBody = stripHtmlTags(email.body);
//     setComposeData({
//       ...composeData,
//       to: email.sender_email,
//       subject: `Re: ${email.subject}`,
//       body: `\n\n--- Original Message ---\nFrom: ${email.sender_email}\nDate: ${new Date(
//         email.created_at
//       ).toLocaleString()}\n\n${plainTextBody}`,
//     });
//     setShowCompose(true);
//     setSelectedEmail(null);
//   };

//   const forwardEmail = (email) => {
//     const plainTextBody = stripHtmlTags(email.body);
//     setComposeData({
//       ...composeData,
//       to: "",
//       subject: `Fwd: ${email.subject}`,
//       body: `\n\n--- Forwarded Message ---\nFrom: ${email.sender_email}\nDate: ${new Date(
//         email.created_at
//       ).toLocaleString()}\nSubject: ${email.subject}\n\n${plainTextBody}`,
//     });
//     setShowCompose(true);
//     setSelectedEmail(null);
//   };

//   const showNotification = (message) => {
//     alert(message);
//   };

//   const resetComposeForm = () => {
//     setComposeData({
//       to: "",
//       subject: "",
//       body: "",
//       template: "none",
//       enableFollowUp: true,
//       followUpDays: 2,
//       enableEscalation: true,
//       escalationEmail: "",
//       escalationDays: 3,
//     });
//   };

//   const resetStockRequestForm = () => {
//     setStockRequestData({
//       to: "",
//       items: [{ articleId: "", productName: "", quantity: 1 }],
//       urgency: "medium",
//       notes: "",
//       enableFollowUp: true,
//       followUpDays: 2,
//       enableEscalation: false,
//       escalationEmail: "",
//       escalationDays: 3,
//     });
//   };

//   const toggleEmailSelection = (emailId) => {
//     setSelectedEmails((prev) =>
//       prev.includes(emailId)
//         ? prev.filter((id) => id !== emailId)
//         : [...prev, emailId]
//     );
//   };

//   const selectAllEmails = () => {
//     if (selectedEmails.length === emails.length) {
//       setSelectedEmails([]);
//     } else {
//       setSelectedEmails(emails.map((e) => e.id));
//     }
//   };

//   const unreadCount = emails.filter(
//     (e) => !e.is_read && currentView === "inbox"
//   ).length;
//   const draftCount = emails.filter((e) => e.status === "draft").length;
//   const unreadNotifications = notifications.filter((n) => !n.is_read).length;

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="row">
//             <div className="col">
//               <h3 className="page-title">Inbox</h3>
//             </div>
//             {unreadNotifications > 0 && (
//               <div className="col-auto">
//                 <span className="badge bg-danger">
//                   {unreadNotifications} new notifications
//                 </span>
//               </div>
//             )}
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-lg-3 col-md-12">
//             <div className="compose-btn mb-3">
//               <Link
//                 to="#"
//                 className="btn btn-primary btn-block w-100 mb-2"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   setShowCompose(true);
//                   setShowStockRequest(false);
//                 }}
//               >
//                 <i className="fas fa-plus me-2" />
//                 Compose Email
//               </Link>

//               <Link
//                 to="#"
//                 className="btn btn-success btn-block w-100"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleOpenStockRequest();
//                 }}
//               >
//                 <i className="fas fa-box me-2" />
//                 Stock Request
//               </Link>
//             </div>

//             <ul className="inbox-menu">
//               <li className={currentView === "inbox" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setCurrentView("inbox");
//                   }}
//                 >
//                   <i className="fas fa-download" /> Inbox{" "}
//                   {unreadCount > 0 && (
//                     <span className="mail-count">({unreadCount})</span>
//                   )}
//                 </Link>
//               </li>
//               <li className={currentView === "starred" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setCurrentView("starred");
//                   }}
//                 >
//                   <i className="far fa-star" /> Important
//                 </Link>
//               </li>
//               <li className={currentView === "sent" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setCurrentView("sent");
//                   }}
//                 >
//                   <i className="far fa-paper-plane" /> Sent Mail
//                 </Link>
//               </li>
//               <li className={currentView === "drafts" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setCurrentView("drafts");
//                   }}
//                 >
//                   <i className="far fa-file-alt" /> Drafts{" "}
//                   {draftCount > 0 && (
//                     <span className="mail-count">({draftCount})</span>
//                   )}
//                 </Link>
//               </li>
//               <li className={currentView === "trash" ? "active" : ""}>
//                 <Link
//                   to="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     setCurrentView("trash");
//                   }}
//                 >
//                   <i className="far fa-trash-alt" /> Trash
//                 </Link>
//               </li>
//             </ul>
//           </div>

//           <div className="col-lg-9 col-md-12">
//             {showCompose ? (
//               <div className="card bg-white">
//                 <div className="card-body">
//                   <h4 className="mb-4">Compose Email</h4>

//                   <div className="mb-3">
//                     <label className="form-label">To</label>
//                     <input
//                       type="email"
//                       className="form-control"
//                       value={composeData.to}
//                       onChange={(e) =>
//                         setComposeData({ ...composeData, to: e.target.value })
//                       }
//                       placeholder="recipient@example.com"
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Subject</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       value={composeData.subject}
//                       onChange={(e) =>
//                         setComposeData({ ...composeData, subject: e.target.value })
//                       }
//                       placeholder="Email subject"
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Message</label>
//                     <textarea
//                       className="form-control"
//                       rows="8"
//                       value={composeData.body}
//                       onChange={(e) =>
//                         setComposeData({ ...composeData, body: e.target.value })
//                       }
//                       placeholder="Your message..."
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <h5>Automation Settings</h5>
//                     <div className="form-check">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         checked={composeData.enableFollowUp}
//                         onChange={(e) =>
//                           setComposeData({ ...composeData, enableFollowUp: e.target.checked })
//                         }
//                       />
//                       <label className="form-check-label">
//                         Enable follow-up reminder
//                       </label>
//                     </div>
//                     {composeData.enableFollowUp && (
//                       <div className="mt-2">
//                         <label className="form-label">Follow-up after (days)</label>
//                         <input
//                           type="number"
//                           className="form-control"
//                           style={{ width: "100px" }}
//                           value={composeData.followUpDays}
//                           onChange={(e) =>
//                             setComposeData({ ...composeData, followUpDays: parseInt(e.target.value) })
//                           }
//                           min="1"
//                           max="30"
//                         />
//                       </div>
//                     )}

//                     <div className="form-check mt-3">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         checked={composeData.enableEscalation}
//                         onChange={(e) =>
//                           setComposeData({ ...composeData, enableEscalation: e.target.checked })
//                         }
//                       />
//                       <label className="form-check-label">
//                         Enable auto-escalation
//                       </label>
//                     </div>
//                     {composeData.enableEscalation && (
//                       <div className="mt-2">
//                         <div className="mb-2">
//                           <label className="form-label">Escalation email</label>
//                           <input
//                             type="email"
//                             className="form-control"
//                             value={composeData.escalationEmail}
//                             onChange={(e) =>
//                               setComposeData({ ...composeData, escalationEmail: e.target.value })
//                             }
//                             placeholder="any@gmail.com"
//                           />
//                         </div>
//                         <div>
//                           <label className="form-label">Escalate after (days)</label>
//                           <input
//                             type="number"
//                             className="form-control"
//                             style={{ width: "150px" }}
//                             value={composeData.escalationDays}
//                             onChange={(e) =>
//                               setComposeData({ ...composeData, escalationDays: parseInt(e.target.value) })
//                             }
//                             min="1"
//                             max="30"
//                           />
//                           <small className="text-muted">
//                             Escalation will occur if no response is received within this timeframe
//                           </small>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="d-flex gap-2">
//                     <button className="btn btn-primary" onClick={sendEmail}>
//                       <i className="fas fa-paper-plane me-2" />
//                       Send Email
//                     </button>
//                     <button
//                       className="btn btn-secondary"
//                       onClick={() => {
//                         setShowCompose(false);
//                         resetComposeForm();
//                       }}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : showStockRequest ? (
//               <div className="card bg-white">
//                 <div className="card-body">
//                   <h4 className="mb-4">Stock Request</h4>

//                   <div className="mb-3">
//                     <label className="form-label">Send To</label>
//                     <input
//                       type="email"
//                       className="form-control"
//                       value={stockRequestData.to}
//                       onChange={(e) =>
//                         setStockRequestData({ ...stockRequestData, to: e.target.value })
//                       }
//                       placeholder="warehouse@example.com"
//                     />
//                   </div>

//                   {/* Articles */}
//                   <div className="mb-3">
//                     <div className="d-flex justify-content-between align-items-center mb-2">
//                       <label className="form-label mb-0 fw-semibold">Articles</label>
//                       <button
//                         type="button"
//                         className="btn btn-sm btn-outline-primary"
//                         onClick={addStockItem}
//                       >
//                         <i className="fas fa-plus me-1" /> Add Item
//                       </button>
//                     </div>

//                     {stockRequestData.items.map((item, index) => (
//                       <div key={index} className="d-flex gap-2 mb-2 align-items-center">
//                         <div style={{ flex: 1 }}>
//                           <Select
//                             options={articleOptions}
//                             value={articleOptions.find((o) => o.value === item.articleId) || null}
//                             onChange={(option) => {
//                               const updated = [...stockRequestData.items];
//                               updated[index] = {
//                                 ...updated[index],
//                                 articleId: option?.value || "",
//                                 productName: option?.label || "",
//                               };
//                               setStockRequestData({ ...stockRequestData, items: updated });
//                             }}
//                             placeholder="Select article..."
//                             isClearable
//                             isSearchable
//                           />
//                         </div>
//                         <input
//                           type="number"
//                           className="form-control"
//                           style={{ width: "100px" }}
//                           placeholder="Qty"
//                           min="1"
//                           value={item.quantity}
//                           onChange={(e) =>
//                             updateStockItem(index, "quantity", parseInt(e.target.value) || 1)
//                           }
//                         />
//                         {stockRequestData.items.length > 1 && (
//                           <button
//                             type="button"
//                             className="btn btn-sm btn-outline-danger"
//                             onClick={() => removeStockItem(index)}
//                           >
//                             <i className="fas fa-times" />
//                           </button>
//                         )}
//                       </div>
//                     ))}
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Urgency</label>
//                     <select
//                       className="form-select"
//                       value={stockRequestData.urgency}
//                       onChange={(e) =>
//                         setStockRequestData({ ...stockRequestData, urgency: e.target.value })
//                       }
//                     >
//                       <option value="low">Low</option>
//                       <option value="medium">Medium</option>
//                       <option value="high">High</option>
//                     </select>
//                   </div>

//                   <div className="mb-3">
//                     <label className="form-label">Notes (Optional)</label>
//                     <textarea
//                       className="form-control"
//                       rows="4"
//                       value={stockRequestData.notes}
//                       onChange={(e) =>
//                         setStockRequestData({ ...stockRequestData, notes: e.target.value })
//                       }
//                       placeholder="Additional notes..."
//                     />
//                   </div>

//                   <div className="mb-3">
//                     <h5>Automation Settings</h5>

//                     <div className="form-check">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         checked={stockRequestData.enableFollowUp}
//                         onChange={(e) =>
//                           setStockRequestData({ ...stockRequestData, enableFollowUp: e.target.checked })
//                         }
//                       />
//                       <label className="form-check-label">
//                         Enable follow-up reminder
//                       </label>
//                     </div>
//                     {stockRequestData.enableFollowUp && (
//                       <div className="mt-2">
//                         <label className="form-label">Follow-up after (days)</label>
//                         <input
//                           type="number"
//                           className="form-control"
//                           style={{ width: "150px" }}
//                           value={stockRequestData.followUpDays}
//                           onChange={(e) =>
//                             setStockRequestData({ ...stockRequestData, followUpDays: parseInt(e.target.value) })
//                           }
//                           min="1"
//                           max="30"
//                         />
//                         <small className="text-muted">
//                           Reminder will be sent if no response received
//                         </small>
//                       </div>
//                     )}

//                     <div className="form-check mt-3">
//                       <input
//                         className="form-check-input"
//                         type="checkbox"
//                         checked={stockRequestData.enableEscalation}
//                         onChange={(e) =>
//                           setStockRequestData({ ...stockRequestData, enableEscalation: e.target.checked })
//                         }
//                       />
//                       <label className="form-check-label">
//                         Enable auto-escalation
//                       </label>
//                     </div>
//                     {stockRequestData.enableEscalation && (
//                       <div className="mt-2">
//                         <div className="mb-2">
//                           <label className="form-label">Escalation email</label>
//                           <input
//                             type="email"
//                             className="form-control"
//                             value={stockRequestData.escalationEmail}
//                             onChange={(e) =>
//                               setStockRequestData({ ...stockRequestData, escalationEmail: e.target.value })
//                             }
//                             placeholder="manager@example.com"
//                           />
//                         </div>
//                         <div>
//                           <label className="form-label">Escalate after (days)</label>
//                           <input
//                             type="number"
//                             className="form-control"
//                             style={{ width: "150px" }}
//                             value={stockRequestData.escalationDays}
//                             onChange={(e) =>
//                               setStockRequestData({ ...stockRequestData, escalationDays: parseInt(e.target.value) })
//                             }
//                             min="1"
//                             max="30"
//                           />
//                           <small className="text-muted">
//                             Escalation will occur if no response is received within this timeframe
//                           </small>
//                         </div>
//                       </div>
//                     )}
//                   </div>

//                   <div className="d-flex gap-2">
//                     <button className="btn btn-success" onClick={sendStockRequest}>
//                       <i className="fas fa-box me-2" />
//                       Send Stock Request
//                     </button>
//                     <button
//                       className="btn btn-secondary"
//                       onClick={() => {
//                         setShowStockRequest(false);
//                         resetStockRequestForm();
//                       }}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             ) : (
//               <div className="card bg-white">
//                 <div className="card-body">
//                   <div className="email-header">
//                     <div className="row">
//                       <div className="col-lg-9 top-action-left col-sm-12">
//                         <div className="float-left">
//                           <div className="btn-group dropdown-action me-1">
//                             <button
//                               type="button"
//                               className="btn btn-white dropdown-toggle"
//                               data-bs-toggle="dropdown"
//                             >
//                               Select <i className="fas fa-angle-down" />
//                             </button>
//                             <div className="dropdown-menu">
//                               <Link
//                                 className="dropdown-item"
//                                 to="#"
//                                 onClick={(e) => { e.preventDefault(); selectAllEmails(); }}
//                               >
//                                 All
//                               </Link>
//                               <Link
//                                 className="dropdown-item"
//                                 to="#"
//                                 onClick={(e) => { e.preventDefault(); setSelectedEmails([]); }}
//                               >
//                                 None
//                               </Link>
//                             </div>
//                           </div>
//                           <div className="btn-group dropdown-action me-1">
//                             <button
//                               type="button"
//                               className="btn btn-white dropdown-toggle"
//                               data-bs-toggle="dropdown"
//                             >
//                               Actions <i className="fas fa-angle-down" />
//                             </button>
//                             <div className="dropdown-menu">
//                               <Link
//                                 className="dropdown-item"
//                                 to="#"
//                                 onClick={(e) => { e.preventDefault(); handleBulkAction("read"); }}
//                               >
//                                 Mark As Read
//                               </Link>
//                               <Link
//                                 className="dropdown-item"
//                                 to="#"
//                                 onClick={(e) => { e.preventDefault(); handleBulkAction("unread"); }}
//                               >
//                                 Mark As Unread
//                               </Link>
//                               <div className="dropdown-divider" />
//                               <Link
//                                 className="dropdown-item"
//                                 to="#"
//                                 onClick={(e) => { e.preventDefault(); handleBulkAction("delete"); }}
//                               >
//                                 Delete
//                               </Link>
//                             </div>
//                           </div>
//                           <div className="btn-group dropdown-action mail-search">
//                             <input
//                               type="text"
//                               placeholder="Search Messages"
//                               className="form-control search-message"
//                               value={searchQuery}
//                               onChange={(e) => setSearchQuery(e.target.value)}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-lg-3 top-action-right col-sm-12">
//                         <div className="text-end">
//                           <button
//                             type="button"
//                             title="Refresh"
//                             className="btn btn-white d-none d-md-inline-block me-1"
//                             onClick={() => fetchEmails()}
//                           >
//                             <i className="fas fa-sync-alt" />
//                           </button>
//                           <div className="btn-group">
//                             <button
//                               className="btn btn-white"
//                               disabled={pagination.currentPage === 1}
//                               onClick={() => fetchEmails(currentView, pagination.currentPage - 1)}
//                             >
//                               <i className="fas fa-angle-left" />
//                             </button>
//                             <button
//                               className="btn btn-white"
//                               disabled={pagination.currentPage === pagination.totalPages}
//                               onClick={() => fetchEmails(currentView, pagination.currentPage + 1)}
//                             >
//                               <i className="fas fa-angle-right" />
//                             </button>
//                           </div>
//                         </div>
//                         <div className="text-end">
//                           <span className="text-muted d-none d-md-inline-block">
//                             Showing {emails.length} of {pagination.totalEmails}
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   </div>

//                   <div className="email-content">
//                     <div className="table-responsive">
//                       {loading ? (
//                         <div className="text-center py-5">
//                           <div className="spinner-border" role="status">
//                             <span className="visually-hidden">Loading...</span>
//                           </div>
//                         </div>
//                       ) : emails.length === 0 ? (
//                         <div className="text-center py-5">
//                           <p className="text-muted">No emails found</p>
//                         </div>
//                       ) : (
//                         <table className="table table-inbox table-hover">
//                           <thead>
//                             <tr>
//                               <th colSpan={6}>
//                                 <label className="checkboxs">
//                                   <input
//                                     type="checkbox"
//                                     checked={
//                                       selectedEmails.length === emails.length &&
//                                       emails.length > 0
//                                     }
//                                     onChange={selectAllEmails}
//                                   />
//                                   <span className="checkmarks" />
//                                 </label>
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {emails.map((email) => (
//                               <tr
//                                 key={email.id}
//                                 className={`${!email.is_read ? "unread" : ""} clickable-row`}
//                                 onClick={() => {
//                                   setSelectedEmail(email);
//                                   if (!email.is_read) markAsRead(email.id);
//                                 }}
//                               >
//                                 <td onClick={(e) => e.stopPropagation()}>
//                                   <label className="checkboxs">
//                                     <input
//                                       type="checkbox"
//                                       checked={selectedEmails.includes(email.id)}
//                                       onChange={() => toggleEmailSelection(email.id)}
//                                     />
//                                     <span className="checkmarks" />
//                                   </label>
//                                 </td>
//                                 <td onClick={(e) => e.stopPropagation()}>
//                                   <span
//                                     className="mail-important"
//                                     onClick={() => toggleStar(email.id, email.is_starred)}
//                                   >
//                                     <i
//                                       className={`${email.is_starred ? "fas" : "far"} fa-star ${
//                                         email.is_starred ? "starred" : ""
//                                       }`}
//                                     />
//                                   </span>
//                                 </td>
//                                 <td className="name">
//                                   {currentView === "sent"
//                                     ? email.recipient_email
//                                     : email.sender_email}
//                                 </td>
//                                 <td className="subject">
//                                   {email.subject}
//                                   {email.template_type === "stock_request" && (
//                                     <span className="badge bg-info ms-2">Stock Request</span>
//                                   )}
//                                   {email.template_type === "stock_flow_created" && (
//                                     <span className="badge bg-success ms-2">
//                                       <i className="fas fa-box me-1" />Stock Flow Created
//                                     </span>
//                                   )}
//                                   {email.template_type === "stock_flow_shipping" && (
//                                     <span className="badge bg-warning text-dark ms-2">
//                                       <i className="fas fa-shipping-fast me-1" />In Transit
//                                     </span>
//                                   )}
//                                   {email.template_type === "stock_flow_delivered" && (
//                                     <span className="badge bg-primary ms-2">
//                                       <i className="fas fa-check-circle me-1" />Delivered
//                                     </span>
//                                   )}
//                                   {email.follow_up_scheduled && (
//                                     <span className="badge bg-warning ms-2">Follow-up</span>
//                                   )}
//                                   {email.escalated && (
//                                     <span className="badge bg-danger ms-2">Escalated</span>
//                                   )}
//                                 </td>
//                                 <td>
//                                   {email.has_attachment && (
//                                     <i className="fas fa-paperclip" />
//                                   )}
//                                 </td>
//                                 <td className="mail-date">
//                                   {new Date(email.created_at).toLocaleString()}
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Email Detail Modal */}
//       {selectedEmail && (
//         <div
//           className="modal fade show"
//           style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
//           onClick={() => setSelectedEmail(null)}
//         >
//           <div
//             className="modal-dialog modal-lg"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="modal-content">
//               <div className="modal-header">
//                 <h5 className="modal-title">{selectedEmail.subject}</h5>
//                 <button
//                   type="button"
//                   className="btn-close"
//                   onClick={() => setSelectedEmail(null)}
//                 />
//               </div>
//               <div className="modal-body">
//                 <div className="mb-3">
//                   <strong>From:</strong> {selectedEmail.sender_email}
//                   <br />
//                   <strong>To:</strong> {selectedEmail.recipient_email}
//                   <br />
//                   <strong>Date:</strong>{" "}
//                   {new Date(selectedEmail.created_at).toLocaleString()}
//                   <br />
//                   {selectedEmail.template_type === "stock_request" && (
//                     <span className="badge bg-info mt-2">Stock Request</span>
//                   )}
//                 </div>
//                 <hr />
//                 <div dangerouslySetInnerHTML={{ __html: selectedEmail.body }} />
//               </div>
//               <div className="modal-footer">
//                 <button
//                   className="btn btn-primary"
//                   onClick={() => replyToEmail(selectedEmail)}
//                 >
//                   <i className="fas fa-reply me-2" />
//                   Reply
//                 </button>
//                 <button
//                   className="btn btn-secondary"
//                   onClick={() => forwardEmail(selectedEmail)}
//                 >
//                   <i className="fas fa-share me-2" />
//                   Forward
//                 </button>

//                 {selectedEmail.template_type === "stock_request" &&
//                   currentView === "inbox" && (
//                     <>
//                       <button
//                         className="btn btn-success"
//                         onClick={() => {
//                           const deadline = prompt(
//                             "Approve this request. Enter delivery deadline in days:"
//                           );
//                           if (deadline && !isNaN(deadline) && parseInt(deadline) > 0) {
//                             const notes = prompt("Add approval notes (optional):");
//                             respondToStockRequest(
//                               selectedEmail.id,
//                               "approve",
//                               parseInt(deadline),
//                               notes || ""
//                             );
//                           } else if (deadline !== null) {
//                             alert("Please enter a valid number of days");
//                           }
//                         }}
//                       >
//                         <i className="fas fa-check me-2" />
//                         Approve
//                       </button>
//                       <button
//                         className="btn btn-danger"
//                         onClick={() => {
//                           const notes = prompt(
//                             "Reject this request. Add reason (optional):"
//                           );
//                           if (notes !== null) {
//                             respondToStockRequest(
//                               selectedEmail.id,
//                               "reject",
//                               null,
//                               notes || ""
//                             );
//                           }
//                         }}
//                       >
//                         <i className="fas fa-times me-2" />
//                         Reject
//                       </button>
//                     </>
//                   )}

//                 <button
//                   className="btn btn-danger"
//                   onClick={() => {
//                     deleteEmail(selectedEmail.id);
//                     setSelectedEmail(null);
//                   }}
//                 >
//                   <i className="fas fa-trash me-2" />
//                   Delete
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Email;














// components/Email/Email.jsx
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import AuthService from "../../services/authService";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const stripHtml = (html) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent || "";
};

const VIEWS = [
  { key: "inbox",   label: "Inbox",     icon: "fas fa-inbox"         },
  { key: "starred", label: "Important", icon: "far fa-star"          },
  { key: "sent",    label: "Sent Mail", icon: "far fa-paper-plane"   },
  { key: "drafts",  label: "Drafts",    icon: "far fa-file-alt"      },
  { key: "trash",   label: "Trash",     icon: "far fa-trash-alt"     },
];

// ─── COMPOSE FORM ─────────────────────────────────────────────────────────────
const ComposeForm = ({ initialData = {}, onClose, onSent }) => {
  const [form, setForm] = useState({
    to:               initialData.to || "",
    subject:          initialData.subject || "",
    body:             initialData.body || "",
    template:         "none",
    enableFollowUp:   true,
    followUpDays:     2,
    enableEscalation: true,
    escalationEmail:  "",
    escalationDays:   3,
  });
  const [sending, setSending] = useState(false);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSend = async () => {
    if (!form.to || !form.subject) return alert("Please fill in To and Subject");
    setSending(true);
    try {
      await AuthService.sendEmails(form);
      onSent();
    } catch (err) {
      alert(err.response?.data?.message || "Error sending email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="card bg-white">
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between mb-4">
          <h4 className="mb-0">Compose Email</h4>
          <button className="btn-close" onClick={onClose} />
        </div>

        <div className="mb-3">
          <label className="form-label">To <span className="text-danger">*</span></label>
          <input
            type="email"
            className="form-control"
            value={form.to}
            onChange={(e) => set("to", e.target.value)}
            placeholder="recipient@example.com"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Subject <span className="text-danger">*</span></label>
          <input
            type="text"
            className="form-control"
            value={form.subject}
            onChange={(e) => set("subject", e.target.value)}
            placeholder="Email subject"
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Message</label>
          <textarea
            className="form-control"
            rows="8"
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            placeholder="Your message…"
          />
        </div>

        {/* Automation */}
        <div className="mb-4">
          <h6 className="text-muted text-uppercase mb-3" style={{ fontSize: 11, letterSpacing: ".5px" }}>
            Automation
          </h6>
          <div className="row g-3">
            <div className="col-md-6">
              <div className="border rounded p-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="followUp"
                    checked={form.enableFollowUp}
                    onChange={(e) => set("enableFollowUp", e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="followUp">
                    Follow-up reminder
                  </label>
                </div>
                {form.enableFollowUp && (
                  <div className="mt-2 d-flex align-items-center gap-2">
                    <span className="text-muted small">After</span>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      style={{ width: 70 }}
                      min="1" max="30"
                      value={form.followUpDays}
                      onChange={(e) => set("followUpDays", parseInt(e.target.value) || 1)}
                    />
                    <span className="text-muted small">days</span>
                  </div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="border rounded p-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="escalation"
                    checked={form.enableEscalation}
                    onChange={(e) => set("enableEscalation", e.target.checked)}
                  />
                  <label className="form-check-label fw-semibold" htmlFor="escalation">
                    Auto-escalation
                  </label>
                </div>
                {form.enableEscalation && (
                  <div className="mt-2">
                    <input
                      type="email"
                      className="form-control form-control-sm mb-2"
                      placeholder="any@gmail.com"
                      value={form.escalationEmail}
                      onChange={(e) => set("escalationEmail", e.target.value)}
                    />
                    <div className="d-flex align-items-center gap-2">
                      <span className="text-muted small">After</span>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: 70 }}
                        min="1" max="30"
                        value={form.escalationDays}
                        onChange={(e) => set("escalationDays", parseInt(e.target.value) || 1)}
                      />
                      <span className="text-muted small">days</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-primary" onClick={handleSend} disabled={sending}>
            {sending ? (
              <><span className="spinner-border spinner-border-sm me-2" />Sending…</>
            ) : (
              <><i className="fas fa-paper-plane me-2" />Send Email</>
            )}
          </button>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

// ─── EMAIL DETAIL MODAL ───────────────────────────────────────────────────────
const EmailDetailModal = ({ email, onClose, onReply, onForward, onDelete }) => (
  <div
    className="modal fade show"
    style={{ display: "block", background: "rgba(0,0,0,.55)" }}
    onClick={onClose}
  >
    <div className="modal-dialog modal-lg modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{email.subject}</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>
        <div className="modal-body">
          <div className="mb-3 small text-muted">
            <strong className="text-dark">From:</strong> {email.sender_email}
            <br />
            <strong className="text-dark">To:</strong> {email.recipient_email}
            <br />
            <strong className="text-dark">Date:</strong>{" "}
            {new Date(email.created_at).toLocaleString()}
          </div>
          <hr />
          <div dangerouslySetInnerHTML={{ __html: email.body }} />
        </div>
        <div className="modal-footer">
          <button className="btn btn-primary" onClick={() => onReply(email)}>
            <i className="fas fa-reply me-2" />Reply
          </button>
          <button className="btn btn-secondary" onClick={() => onForward(email)}>
            <i className="fas fa-share me-2" />Forward
          </button>
          <button
            className="btn btn-danger"
            onClick={() => { onDelete(email.id); onClose(); }}
          >
            <i className="fas fa-trash me-2" />Delete
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── MAIN EMAIL COMPONENT ─────────────────────────────────────────────────────
const Email = () => {
  const [emails,         setEmails]         = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [currentView,    setCurrentView]    = useState("inbox");
  const [showCompose,    setShowCompose]     = useState(false);
  const [composeInit,    setComposeInit]     = useState({});       // prefill for reply/forward
  const [selectedEmail,  setSelectedEmail]  = useState(null);
  const [searchQuery,    setSearchQuery]    = useState("");
  const [notifications,  setNotifications] = useState([]);
  const [loading,        setLoading]       = useState(false);
  const [pagination,     setPagination]    = useState({
    currentPage: 1, totalPages: 1, totalEmails: 0,
  });

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchEmails = useCallback(
    async (view = currentView, page = 1) => {
      setLoading(true);
      try {
        const res = await AuthService.getEmails(view, page, 10, searchQuery);
        setEmails(res.data.data || []);
        const p = res.data.pagination;
        setPagination({ currentPage: p.page, totalPages: p.totalPages, totalEmails: p.total });
      } catch (err) {
        console.error("Error fetching emails:", err);
        alert("Error loading emails");
      } finally {
        setLoading(false);
      }
    },
    [currentView, searchQuery]
  );

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await AuthService.getNotifications(20);
      setNotifications(res.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, []);

  useEffect(() => {
    fetchEmails();
    fetchNotifications();
    const interval = setInterval(() => {
      fetchEmails(currentView, pagination.currentPage);
      fetchNotifications();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [currentView, searchQuery]);

  // ── Email actions ─────────────────────────────────────────────────────────
  const markAsRead = async (emailId) => {
    try {
      await AuthService.markEmailAsRead(emailId);
      setEmails((prev) => prev.map((e) => e.id === emailId ? { ...e, is_read: true } : e));
    } catch (err) {
      console.error("markAsRead error:", err);
    }
  };

  const toggleStar = async (emailId, currentStarred) => {
    try {
      await AuthService.toggleEmailStar(emailId, !currentStarred);
      setEmails((prev) => prev.map((e) => e.id === emailId ? { ...e, is_starred: !currentStarred } : e));
    } catch (err) {
      console.error("toggleStar error:", err);
    }
  };

  const deleteEmail = async (emailId) => {
    try {
      await AuthService.deleteEmail(emailId);
      setEmails((prev) => prev.filter((e) => e.id !== emailId));
    } catch (err) {
      console.error("deleteEmail error:", err);
      alert("Error deleting email");
    }
  };

  const handleBulkAction = async (action) => {
    if (!selectedEmails.length) return alert("Please select emails first");
    try {
      await AuthService.bulkEmailAction(action, selectedEmails);
      setSelectedEmails([]);
      fetchEmails();
    } catch (err) {
      alert(err.response?.data?.message || "Error performing bulk action");
    }
  };

  // ── Reply / Forward ───────────────────────────────────────────────────────
  const openReply = (email) => {
    const plain = stripHtml(email.body);
    setComposeInit({
      to: email.sender_email,
      subject: `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.sender_email}\nDate: ${new Date(email.created_at).toLocaleString()}\n\n${plain}`,
    });
    setSelectedEmail(null);
    setShowCompose(true);
  };

  const openForward = (email) => {
    const plain = stripHtml(email.body);
    setComposeInit({
      to: "",
      subject: `Fwd: ${email.subject}`,
      body: `\n\n--- Forwarded Message ---\nFrom: ${email.sender_email}\nDate: ${new Date(email.created_at).toLocaleString()}\nSubject: ${email.subject}\n\n${plain}`,
    });
    setSelectedEmail(null);
    setShowCompose(true);
  };

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = (id) =>
    setSelectedEmails((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const selectAll = () =>
    setSelectedEmails(
      selectedEmails.length === emails.length ? [] : emails.map((e) => e.id)
    );

  // ── Counts ────────────────────────────────────────────────────────────────
  const unreadCount          = emails.filter((e) => !e.is_read && currentView === "inbox").length;
  const draftCount           = emails.filter((e) => e.status === "draft").length;
  const unreadNotifications  = notifications.filter((n) => !n.is_read).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="row align-items-center">
            <div className="col">
              <h3 className="page-title mb-0">Inbox</h3>
            </div>
            {unreadNotifications > 0 && (
              <div className="col-auto">
                <span className="badge bg-danger">
                  {unreadNotifications} new notification{unreadNotifications > 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="row">
          {/* ── Sidebar ── */}
          <div className="col-lg-3 col-md-12">
            <div className="compose-btn mb-3">
              <button
                className="btn btn-primary btn-block w-100"
                onClick={() => { setComposeInit({}); setShowCompose(true); }}
              >
                <i className="fas fa-plus me-2" />Compose Email
              </button>
            </div>

            <ul className="inbox-menu">
              {VIEWS.map(({ key, label, icon }) => (
                <li key={key} className={currentView === key ? "active" : ""}>
                  <Link
                    to="#"
                    onClick={(e) => { e.preventDefault(); setCurrentView(key); }}
                  >
                    <i className={`${icon} me-2`} />
                    {label}
                    {key === "inbox" && unreadCount > 0 && (
                      <span className="mail-count ms-1">({unreadCount})</span>
                    )}
                    {key === "drafts" && draftCount > 0 && (
                      <span className="mail-count ms-1">({draftCount})</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Main panel ── */}
          <div className="col-lg-9 col-md-12">
            {showCompose ? (
              <ComposeForm
                initialData={composeInit}
                onClose={() => { setShowCompose(false); setComposeInit({}); }}
                onSent={() => {
                  setShowCompose(false);
                  setComposeInit({});
                  fetchEmails("sent");
                }}
              />
            ) : (
              <div className="card bg-white">
                <div className="card-body">
                  {/* Toolbar */}
                  <div className="email-header">
                    <div className="row">
                      <div className="col-lg-9 top-action-left col-sm-12">
                        <div className="float-left">
                          {/* Select dropdown */}
                          <div className="btn-group dropdown-action me-1">
                            <button
                              type="button"
                              className="btn btn-white dropdown-toggle"
                              data-bs-toggle="dropdown"
                            >
                              Select <i className="fas fa-angle-down" />
                            </button>
                            <div className="dropdown-menu">
                              <Link className="dropdown-item" to="#" onClick={(e) => { e.preventDefault(); selectAll(); }}>All</Link>
                              <Link className="dropdown-item" to="#" onClick={(e) => { e.preventDefault(); setSelectedEmails([]); }}>None</Link>
                            </div>
                          </div>

                          {/* Actions dropdown */}
                          <div className="btn-group dropdown-action me-1">
                            <button
                              type="button"
                              className="btn btn-white dropdown-toggle"
                              data-bs-toggle="dropdown"
                            >
                              Actions <i className="fas fa-angle-down" />
                            </button>
                            <div className="dropdown-menu">
                              <Link className="dropdown-item" to="#" onClick={(e) => { e.preventDefault(); handleBulkAction("read"); }}>Mark As Read</Link>
                              <Link className="dropdown-item" to="#" onClick={(e) => { e.preventDefault(); handleBulkAction("unread"); }}>Mark As Unread</Link>
                              <div className="dropdown-divider" />
                              <Link className="dropdown-item text-danger" to="#" onClick={(e) => { e.preventDefault(); handleBulkAction("delete"); }}>Delete</Link>
                            </div>
                          </div>

                          {/* Search */}
                          <div className="btn-group dropdown-action mail-search">
                            <input
                              type="text"
                              placeholder="Search Messages"
                              className="form-control search-message"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Pagination */}
                      <div className="col-lg-3 top-action-right col-sm-12">
                        <div className="text-end">
                          <button
                            type="button"
                            title="Refresh"
                            className="btn btn-white d-none d-md-inline-block me-1"
                            onClick={() => fetchEmails()}
                          >
                            <i className="fas fa-sync-alt" />
                          </button>
                          <div className="btn-group">
                            <button
                              className="btn btn-white"
                              disabled={pagination.currentPage === 1}
                              onClick={() => fetchEmails(currentView, pagination.currentPage - 1)}
                            >
                              <i className="fas fa-angle-left" />
                            </button>
                            <button
                              className="btn btn-white"
                              disabled={pagination.currentPage >= pagination.totalPages}
                              onClick={() => fetchEmails(currentView, pagination.currentPage + 1)}
                            >
                              <i className="fas fa-angle-right" />
                            </button>
                          </div>
                        </div>
                        <div className="text-end">
                          <span className="text-muted d-none d-md-inline-block small">
                            {emails.length} of {pagination.totalEmails}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email list */}
                  <div className="email-content">
                    <div className="table-responsive">
                      {loading ? (
                        <div className="text-center py-5">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading…</span>
                          </div>
                        </div>
                      ) : emails.length === 0 ? (
                        <div className="text-center py-5">
                          <i className="fas fa-inbox fa-2x text-muted mb-3 d-block" />
                          <p className="text-muted">No emails found</p>
                        </div>
                      ) : (
                        <table className="table table-inbox table-hover">
                          <thead>
                            <tr>
                              <th colSpan={6}>
                                <label className="checkboxs">
                                  <input
                                    type="checkbox"
                                    checked={selectedEmails.length === emails.length && emails.length > 0}
                                    onChange={selectAll}
                                  />
                                  <span className="checkmarks" />
                                </label>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {emails.map((email) => (
                              <tr
                                key={email.id}
                                className={`${!email.is_read ? "unread" : ""} clickable-row`}
                                style={{ cursor: "pointer" }}
                                onClick={() => {
                                  setSelectedEmail(email);
                                  if (!email.is_read) markAsRead(email.id);
                                }}
                              >
                                <td onClick={(e) => e.stopPropagation()} style={{ width: 36 }}>
                                  <label className="checkboxs">
                                    <input
                                      type="checkbox"
                                      checked={selectedEmails.includes(email.id)}
                                      onChange={() => toggleSelect(email.id)}
                                    />
                                    <span className="checkmarks" />
                                  </label>
                                </td>
                                <td
                                  onClick={(e) => { e.stopPropagation(); toggleStar(email.id, email.is_starred); }}
                                  style={{ width: 36, cursor: "pointer" }}
                                >
                                  <i className={`${email.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
                                </td>
                                <td className="name">
                                  {currentView === "sent" ? email.recipient_email : email.sender_email}
                                </td>
                                <td className="subject">
                                  {email.subject}
                                  {email.follow_up_scheduled && (
                                    <span className="badge bg-warning ms-2">Follow-up</span>
                                  )}
                                  {email.escalated && (
                                    <span className="badge bg-danger ms-2">Escalated</span>
                                  )}
                                </td>
                                <td style={{ width: 30 }}>
                                  {email.has_attachment && <i className="fas fa-paperclip text-muted" />}
                                </td>
                                <td className="mail-date text-end">
                                  {new Date(email.created_at).toLocaleString()}
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
            )}
          </div>
        </div>
      </div>

      {/* Email detail modal */}
      {selectedEmail && (
        <EmailDetailModal
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onReply={openReply}
          onForward={openForward}
          onDelete={(id) => { deleteEmail(id); setSelectedEmail(null); }}
        />
      )}
    </div>
  );
};

export default Email;