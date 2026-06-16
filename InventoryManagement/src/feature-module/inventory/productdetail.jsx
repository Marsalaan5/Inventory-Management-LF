

// current working - start

// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft,
//   Edit,
//   Save,
//   X,
//   Printer,
//   Package,
//   MapPin,
//   Home,
//   Calendar,
//   FileText,
//   CheckCircle,
//   XCircle,
//   AlertCircle,
// } from "feather-icons-react/build/IconComponents";
// import { clearCurrentProduct } from "../../core/redux/slices/productSlice";
// import AuthService from "../../services/authService";
// import PropTypes from "prop-types";

// const BarcodeDisplay = ({ value }) => {
//   const canvasRef = useRef(null);

//   useEffect(() => {
//     if (canvasRef.current && value) {
//       const canvas = canvasRef.current;
//       const ctx = canvas.getContext("2d");

//       ctx.clearRect(0, 0, canvas.width, canvas.height);

//       const barWidth = 3;
//       const startX = 20;
//       const startY = 10;
//       const barHeight = 80;

//       const binaryPattern = value
//         .split("")
//         .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
//         .join("");

//       binaryPattern.split("").forEach((bit, index) => {
//         if (bit === "1") {
//           ctx.fillStyle = "#000";
//           ctx.fillRect(startX + index * barWidth, startY, barWidth, barHeight);
//         }
//       });

//       ctx.fillStyle = "#000";
//       ctx.font = "14px Arial";
//       ctx.textAlign = "center";
//       ctx.fillText(value, canvas.width / 2, startY + barHeight + 20);
//     }
//   }, [value]);

//   return (
//     <canvas
//       ref={canvasRef}
//       width="360"
//       height="120"
//       style={{ maxWidth: "100%" }}
//     />
//   );
// };

// BarcodeDisplay.propTypes = {
//   value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
// };

// const ProductDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const dispatch = useDispatch();
//   const MySwal = withReactContent(Swal);

//   const [currentProduct, setCurrentProduct] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [submitting, setSubmitting] = useState(false);
//   const [warehouses, setWarehouses] = useState([]);
//   const [articleProfiles, setArticleProfiles] = useState([]);
//   const [activeTab, setActiveTab] = useState("details");
//   const [copied, setCopied] = useState(false);

//   const [formData, setFormData] = useState({
//     title: "",
//     article_profile_id: null,
//     warehouse_id: null,
//     location: "",
//     in_wh_locn: "",
//     count: "",
//     status: null,
//     description: "",
//   });

//   const statusOptions = [
//     { value: "new", label: "New" },
//     { value: "used", label: "Used" },
//     { value: "repaired", label: "Repaired" },
//     { value: "broken", label: "Broken" },
//     { value: "installed", label: "Installed" },
//   ];

//   // const copyToClipboard = () => {
//   //   if (!currentProduct?.barcode) return;
//   //   navigator.clipboard.writeText(currentProduct.barcode)
//   //     .then(() => {
//   //       setCopied(true);
//   //       setTimeout(() => {
//   //         setCopied(false);
//   //       }, 2000);
//   //     })
//   //     .catch((err) => {
//   //       console.error("Failed to copy barcode: ", err);
//   //     });
//   // };

//   const copyToClipboard = () => {
//     if (!currentProduct?.barcode) return;

//     try {
//       if (navigator.clipboard && window.isSecureContext) {
//         navigator.clipboard.writeText(currentProduct.barcode).then(() => {
//           setCopied(true);
//           setTimeout(() => setCopied(false), 2000);
//         });
//       } else {
//         const textArea = document.createElement("textarea");
//         textArea.value = currentProduct.barcode;
//         textArea.style.position = "fixed";
//         textArea.style.left = "-9999px";
//         document.body.appendChild(textArea);
//         textArea.focus();
//         textArea.select();
//         document.execCommand("copy");
//         document.body.removeChild(textArea);

//         setCopied(true);
//         setTimeout(() => setCopied(false), 2000);
//       }
//     } catch (err) {
//       console.error("Failed to copy barcode:", err);
//     }
//   };

//   useEffect(() => {
//     return () => {
//       dispatch(clearCurrentProduct());
//     };
//   }, [dispatch]);

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!id) {
//         setError("No product ID provided");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);

//         const productResponse = await AuthService.getProductById(id);
//         const product = productResponse.data.data;

//         if (!product) {
//           throw new Error("Product data not found in response");
//         }

//         setCurrentProduct(product);
//         await fetchFilterOptions();
//         setLoading(false);
//       } catch (err) {
//         console.error("Error fetching product:", err);
//         const errorMessage =
//           err.response?.data?.message ||
//           err.message ||
//           "Failed to load product";
//         setError(errorMessage);
//         setLoading(false);

//         MySwal.fire({
//           icon: "error",
//           title: "Error",
//           text: "Failed to load product details. Please try again.",
//           confirmButtonText: "Go Back",
//         }).then(() => {
//           navigate(-1);
//         });
//       }
//     };

//     fetchData();
//   }, [id, navigate, dispatch]);

//   useEffect(() => {
//     if (currentProduct && warehouses.length > 0 && articleProfiles.length > 0) {
//       const selectedWarehouse = warehouses.find(
//         (w) => String(w.value) === String(currentProduct.warehouse_id),
//       );
//       const selectedArticleProfile = articleProfiles.find(
//         (a) => String(a.value) === String(currentProduct.article_profile_id),
//       );
//       const selectedStatus = statusOptions.find(
//         (s) => s.value === currentProduct.status,
//       );

//       setFormData({
//         title: currentProduct.title || "",
//         article_profile_id: selectedArticleProfile || null,
//         warehouse_id: selectedWarehouse || null,
//         // existing_barcode: currentProduct.existing_barcode || "",
//         location: currentProduct.location || "",
//         in_wh_locn: currentProduct.in_wh_locn || "",
//         count: currentProduct.count || "",
//         status: selectedStatus || null,
//         description: currentProduct.description || "",
//       });
//     }
//   }, [currentProduct, warehouses, articleProfiles]);

//   const fetchFilterOptions = async () => {
//     try {
//       const [warehousesRes, articleProfilesRes] = await Promise.all([
//         AuthService.getWarehouse(),
//         AuthService.getArticles(),
//       ]);

//       const warehouseOptions = (
//         warehousesRes.data.data ||
//         warehousesRes.data ||
//         []
//       ).map((item) => ({
//         value: item.wh_uuid,
//         label: item.name || item.title,
//       }));

//       const articleProfileOptions = (
//         articleProfilesRes.data.data ||
//         articleProfilesRes.data ||
//         []
//       ).map((item) => ({
//         value: item.uuid || item.art_prof_uuid,
//         label: item.title || item.name,
//       }));

//       setWarehouses(warehouseOptions);
//       setArticleProfiles(articleProfileOptions);
//     } catch (error) {
//       console.error("Error fetching filter options:", error);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleSelectChange = (name, option) => {
//     setFormData((prev) => ({
//       ...prev,
//       [name]: option,
//     }));
//   };

//   const handleEditToggle = () => {
//     if (isEditing) {
//       const selectedWarehouse = warehouses.find(
//         (w) => String(w.value) === String(currentProduct.warehouse_id),
//       );
//       const selectedArticleProfile = articleProfiles.find(
//         (a) => String(a.value) === String(currentProduct.article_profile_id),
//       );
//       const selectedStatus = statusOptions.find(
//         (s) => s.value === currentProduct.status,
//       );

//       setFormData({
//         title: currentProduct.title || "",
//         article_profile_id: selectedArticleProfile || null,
//         warehouse_id: selectedWarehouse || null,
//         // existing_barcode: currentProduct.existing_barcode || "",
//         location: currentProduct.location || "",
//         in_wh_locn: currentProduct.in_wh_locn || "",
//         count: currentProduct.count || "",
//         status: selectedStatus || null,
//         description: currentProduct.description || "",
//       });
//     }
//     setIsEditing(!isEditing);
//   };

//   const handleSaveChanges = async () => {
//     if (!formData.article_profile_id?.value) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Error",
//         text: "Article profile is required",
//         timer: 2000,
//       });
//       return;
//     }

//     if (
//       formData.status?.value !== "installed" &&
//       !formData.warehouse_id?.value
//     ) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Error",
//         text: "Warehouse is required",
//         timer: 2000,
//       });
//       return;
//     }

//     if (formData.status?.value === "installed" && !formData.location?.trim()) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Error",
//         text: 'Location is required when status is "Installed"',
//         timer: 2000,
//       });
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const dataToSubmit = {
//         title: formData.title || undefined,
//         article_profile_id: formData.article_profile_id.value,
//         warehouse_id:
//           formData.status?.value !== "installed"
//             ? formData.warehouse_id?.value
//             : undefined,
//         // existing_barcode: formData.existing_barcode || "",
//         location: formData.location || undefined,
//         in_wh_location: formData.in_wh_locn || undefined,
//         count: parseInt(formData.count) || 0,
//         status: formData.status?.value || "new",
//         description: formData.description || undefined,
//       };

//       await AuthService.updateProductById(
//         currentProduct.prod_uuid,
//         dataToSubmit,
//       );

//       MySwal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Product updated successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       setIsEditing(false);

//       const productResponse = await AuthService.getProductById(id);
//       const updatedProduct = productResponse.data.data;
//       setCurrentProduct(updatedProduct);
//     } catch (error) {
//       console.error("Error updating product:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text:
//           error.response?.data?.message ||
//           error.message ||
//           "Failed to update product",
//         timer: 3000,
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handlePrint = () => {
//     window.print();
//   };

//   if (error && !loading) {
//     return (
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="text-center p-5">
//             <div className="alert alert-danger">
//               <h4>Error Loading Product</h4>
//               <p>{error}</p>
//               <button
//                 className="btn btn-primary mt-3"
//                 onClick={() => navigate(-1)}
//               >
//                 Go Back
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (loading || !currentProduct) {
//     return (
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="text-center p-5">
//             <div
//               className="spinner-border text-primary"
//               role="status"
//               style={{ width: "3rem", height: "3rem" }}
//             >
//               <span className="visually-hidden">Loading...</span>
//             </div>
//             <p className="mt-3">Loading product details...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   const getStatusBadgeClass = (status) => {
//     const statusMap = {
//       new: "badge-linesuccess",
//       used: "badge-lineinfo",
//       repaired: "badge-linewarning",
//       broken: "badge-linedanger",
//       installed: "badge-secondary",
//     };
//     return statusMap[status] || "badge-secondary";
//   };

//   //   const getStatusIcon = (status) => {
//   //     const iconMap = {
//   //       new: <CheckCircle size={18} />,
//   //       used: <AlertCircle size={18} />,
//   //       repaired: <CheckCircle size={18} />,
//   //       broken: <XCircle size={18} />,
//   //       installed: <CheckCircle size={18} />,
//   //     };
//   //     return iconMap[status] || <AlertCircle size={18} />;
//   //   };

//   const getStatusIcon = (status, colorClass = "text-primary") => {
//     const iconMap = {
//       new: <CheckCircle size={18} className={colorClass} />,
//       used: <AlertCircle size={18} className={colorClass} />,
//       repaired: <CheckCircle size={18} className={colorClass} />,
//       broken: <XCircle size={18} className={colorClass} />,
//       installed: <CheckCircle size={18} className={colorClass} />,
//     };
//     return iconMap[status] || <AlertCircle size={18} className={colorClass} />;
//   };

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         {/* Breadcrumb Navigation */}
//         <div className="page-header border-0 mb-4">
//           <div className="page-title">
//             <button
//               onClick={() => navigate(-1)}
//               className="btn btn-link p-0 text-decoration-none"
//             >
//               <ArrowLeft size={18} className="me-2" />
//               <span>Back to Products</span>
//             </button>
//           </div>
//           <div className="page-btn d-flex gap-2">
//             {!isEditing ? (
//               <>
//                 <button
//                   onClick={handlePrint}
//                   className="btn btn-outline-secondary"
//                 >
//                   <Printer className="me-2" size={16} />
//                   Print Barcode
//                 </button>
//                 <button onClick={handleEditToggle} className="btn btn-added">
//                   <Edit className="me-2" size={16} />
//                   Edit Product
//                 </button>
//               </>
//             ) : (
//               <>
//                 <button
//                   onClick={handleEditToggle}
//                   className="btn btn-cancel"
//                   disabled={submitting}
//                 >
//                   <X className="me-2" size={16} />
//                   Cancel
//                 </button>
//                 <button
//                   onClick={handleSaveChanges}
//                   className="btn btn-submit"
//                   disabled={submitting}
//                 >
//                   {submitting ? (
//                     <>
//                       <span className="spinner-border spinner-border-sm me-2" />
//                       Saving...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="me-2" size={16} />
//                       Save Changes
//                     </>
//                   )}
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         <div className="row">
//           {/* Left Column - Barcode & Quick Stats */}
//           <div className="col-lg-4 col-md-5">
//             <div className="card product-detail-sticky">
//               <div className="card-body">
//                 {/* Barcode Display */}

//                 {/* <div className="barcode-section text-center mb-4 p-3 rounded">
//                   <BarcodeDisplay value={currentProduct.barcode} />
//                   <div className="barcode-number mt-2 d-flex justify-content-center align-items-center gap-2">
//                     <span className="badge badge-secondary fs-6">
//                       {currentProduct.barcode}
//                     </span>
//                     <button
//                       className="btn btn-sm btn-outline-primary"
//                       onClick={copyToClipboard}
//                     >
//                       {copied ? "Copied!" : "Copy"}
//                     </button>
//                   </div>
//                 </div> */}

//                 <div className="barcode-section text-center mb-4 p-3 mt-2 d-flex justify-content-center align-items-center gap-2 flex-wrap">
//                   <BarcodeDisplay value={currentProduct.barcode} />

//                   {currentProduct.existing_barcode === 1  && (
//                     <span className="badge badge-info fs-6">Existing</span>
//                   )}

//                   <span className="badge badge-secondary fs-6">
//                     {currentProduct.barcode}
//                   </span>

//                   <button
//                     className="btn btn-sm btn-outline-primary"
//                     onClick={copyToClipboard}
//                   >
//                     {copied ? "Copied!" : "Copy"}
//                   </button>
//                 </div>

//                 {/* Quick Stats */}
//                 <div className="quick-stats">
//                   <div className="stat-item d-flex align-items-center justify-content-between mb-3 p-3 rounded">
//                     <div className="d-flex align-items-center">
//                       <Package className="text-primary me-3" size={24} />
//                       <div>
//                         <small className="text-muted d-block">Quantity</small>
//                         <strong className="fs-5">
//                           {currentProduct.count || 0}
//                         </strong>
//                       </div>
//                     </div>
//                   </div>

//                   {/* <div className="quick-stats">
//                     <div className="stat-item d-flex align-items-center justify-content-between mb-3 p-3 rounded">
//                       <div className="d-flex align-items-center">
//                         <Package className="text-primary me-3" size={24} />
//                         <div>
//                           <small className="text-muted d-block">
//                             Existing Barcode
//                           </small>
//                           <strong className="fs-5">
//                             {currentProduct.existing_barcode || 0}
//                           </strong>
//                         </div>
//                       </div>
//                     </div>
//                   </div> */}

//                   {/* <div className="stat-item d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
//                     <div className="d-flex align-items-center">
//                       {getStatusIcon(currentProduct.status)}
//                       <div className="ms-3">
//                         <small className="text-muted d-block">Status</small>
//                         <span className={`badge ${getStatusBadgeClass(currentProduct.status,"text-primary")}`}>
//                           {currentProduct.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div> */}
//                   <div className="stat-item d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
//                     <div className="d-flex align-items-center">
//                       {getStatusIcon(currentProduct.status, "text-primary")}
//                       <div className="ms-3">
//                         <small className="text-muted d-block">Status</small>
//                         <span
//                           className={`badge ${getStatusBadgeClass(currentProduct.status, "text-primary")}`}
//                         >
//                           {currentProduct.status}
//                         </span>
//                       </div>
//                     </div>
//                   </div>

//                   {currentProduct.warehouse_name && (
//                     <div className="stat-item d-flex align-items-center mb-3 p-3 rounded">
//                       <Home className="text-primary me-3" size={24} />
//                       <div>
//                         <small className="text-muted d-block">Warehouse</small>
//                         <strong className="text-secondary">
//                           {currentProduct.warehouse_name}
//                         </strong>
//                       </div>
//                     </div>
//                   )}

//                   {currentProduct.location && (
//                     <div className="stat-item d-flex align-items-center mb-3 p-3 rounded">
//                       <MapPin className="text-primary me-3" size={24} />
//                       <div>
//                         <small className="text-muted d-block">Location</small>
//                         <strong className="text-secondary">
//                           {currentProduct.location}
//                         </strong>
//                       </div>
//                     </div>
//                   )}
//                 </div>

//                 {/* UUID Info */}
//                 <div className="mt-4 pt-3 border-top">
//                   <small className="text-muted d-block mb-2">Product ID</small>
//                   <code className="d-block p-2 rounded small text-break">
//                     {currentProduct.prod_uuid}
//                   </code>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Right Column - Product Details */}
//           <div className="col-lg-8 col-md-7">
//             <div className="card">
//               <div className="card-body">
//                 {/* Product Title */}
//                 <div className="product-header mb-4">
//                   {isEditing ? (
//                     <input
//                       type="text"
//                       className="form-control form-control-lg"
//                       name="title"
//                       value={formData.title}
//                       onChange={handleInputChange}
//                       placeholder="Enter product name (optional)"
//                     />
//                   ) : (
//                     <>
//                       <h2 className="product-title mb-2">
//                         {currentProduct.title || "Untitled Product"}
//                       </h2>
//                       <p className="text-muted mb-0">
//                         Article Profile:{" "}
//                         <strong>
//                           {currentProduct.article_profile_name || "N/A"}
//                         </strong>
//                       </p>
//                     </>
//                   )}
//                 </div>

//                 {/* Tabs */}
//                 <div className="product-detail-tabs">
//                   <ul className="nav nav-tabs mb-4" role="tablist">
//                     <li className="nav-item">
//                       <button
//                         className={`nav-link ${activeTab === "details" ? "active" : ""}`}
//                         onClick={() => setActiveTab("details")}
//                       >
//                         <FileText size={16} className="me-2" />
//                         Details
//                       </button>
//                     </li>
//                     <li className="nav-item">
//                       <button
//                         className={`nav-link ${activeTab === "specs" ? "active" : ""}`}
//                         onClick={() => setActiveTab("specs")}
//                       >
//                         <Package size={16} className="me-2" />
//                         Specifications
//                       </button>
//                     </li>
//                   </ul>
//                 </div>

//                 {/* Tab Content */}
//                 <div className="tab-content">
//                   {/* Details Tab */}
//                   {activeTab === "details" && (
//                     <div className="tab-pane active">
//                       <div className="row g-4">
//                         {/* Article Profile */}
//                         <div className="col-md-6">
//                           <div className="detail-group">
//                             <label className="detail-label">
//                               Article Profile{" "}
//                               <span className="text-danger">*</span>
//                             </label>
//                             {isEditing ? (
//                               <Select
//                                 options={articleProfiles}
//                                 value={formData.article_profile_id}
//                                 onChange={(option) =>
//                                   handleSelectChange(
//                                     "article_profile_id",
//                                     option,
//                                   )
//                                 }
//                                 placeholder="Select Article Profile"
//                                 className="select"
//                               />
//                             ) : (
//                               <div className="detail-value">
//                                 {currentProduct.article_profile_name || "N/A"}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Status */}
//                         <div className="col-md-6">
//                           <div className="detail-group">
//                             <label className="detail-label">Status</label>
//                             {isEditing ? (
//                               <Select
//                                 options={statusOptions}
//                                 value={formData.status}
//                                 onChange={(option) =>
//                                   handleSelectChange("status", option)
//                                 }
//                                 placeholder="Select Status"
//                                 className="select"
//                               />
//                             ) : (
//                               <div className="detail-value">
//                                 <span
//                                   className={`badge ${getStatusBadgeClass(currentProduct.status)}`}
//                                 >
//                                   {currentProduct.status}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Warehouse */}
//                         <div className="col-md-6">
//                           <div className="detail-group">
//                             <label className="detail-label">
//                               Warehouse
//                               {formData.status?.value !== "installed" &&
//                                 isEditing && (
//                                   <span className="text-danger">*</span>
//                                 )}
//                             </label>
//                             {isEditing ? (
//                               <>
//                                 <Select
//                                   options={warehouses}
//                                   value={formData.warehouse_id}
//                                   onChange={(option) =>
//                                     handleSelectChange("warehouse_id", option)
//                                   }
//                                   placeholder="Select Warehouse"
//                                   isDisabled={
//                                     formData.status?.value === "installed"
//                                   }
//                                   className="select"
//                                 />
//                                 {formData.status?.value === "installed" && (
//                                   <small className="text-muted">
//                                     Warehouse is not required for installed
//                                     items
//                                   </small>
//                                 )}
//                               </>
//                             ) : (
//                               <div className="detail-value">
//                                 {currentProduct.warehouse_name || "N/A"}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Location */}
//                         <div className="col-md-6">
//                           <div className="detail-group">
//                             <label className="detail-label">
//                               Location
//                               {formData.status?.value === "installed" &&
//                                 isEditing && (
//                                   <span className="text-danger">*</span>
//                                 )}
//                             </label>
//                             {isEditing ? (
//                               <>
//                                 <input
//                                   type="text"
//                                   className="form-control"
//                                   name="location"
//                                   value={formData.location}
//                                   onChange={handleInputChange}
//                                   placeholder="Enter location"
//                                   required={
//                                     formData.status?.value === "installed"
//                                   }
//                                 />
//                                 {formData.status?.value === "installed" && (
//                                   <small className="text-muted">
//                                     Location is required for installed items
//                                   </small>
//                                 )}
//                               </>
//                             ) : (
//                               <div className="detail-value">
//                                 {currentProduct.location || "N/A"}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* In WH Location */}
//                         <div className="col-md-6">
//                           <div className="detail-group">
//                             <label className="detail-label">
//                               In WH Location
//                             </label>
//                             {isEditing ? (
//                               <input
//                                 type="text"
//                                 className="form-control"
//                                 name="in_wh_locn"
//                                 value={formData.in_wh_locn}
//                                 onChange={handleInputChange}
//                                 placeholder="Enter warehouse location"
//                               />
//                             ) : (
//                               <div className="detail-value">
//                                 {currentProduct.in_wh_locn || "N/A"}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Quantity */}
//                         <div className="col-md-6">
//                           <div className="detail-group">
//                             <label className="detail-label">Quantity</label>
//                             {isEditing ? (
//                               <input
//                                 type="number"
//                                 className="form-control"
//                                 name="count"
//                                 value={formData.count}
//                                 onChange={handleInputChange}
//                                 min="0"
//                               />
//                             ) : (
//                               <div className="detail-value">
//                                 <span className="badge badge-primary fs-6">
//                                   {currentProduct.count || 0}
//                                 </span>
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         {/* Description */}
//                         <div className="col-12">
//                           <div className="detail-group">
//                             <label className="detail-label">Description</label>
//                             {isEditing ? (
//                               <>
//                                 <textarea
//                                   className="form-control"
//                                   name="description"
//                                   value={formData.description}
//                                   onChange={handleInputChange}
//                                   rows="4"
//                                   placeholder="Enter product description"
//                                   maxLength="500"
//                                 />
//                                 <small className="text-muted">
//                                   Maximum 500 characters
//                                 </small>
//                               </>
//                             ) : (
//                               <div className="detail-value">
//                                 {currentProduct.description ||
//                                   "No description available"}
//                               </div>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}

//                   {/* Specifications Tab */}
//                   {activeTab === "specs" && (
//                     <div className="tab-pane active">
//                       <div className="specifications-table">
//                         <table className="table table-borderless">
//                           <tbody>
//                             <tr>
//                               <td className="text-muted" width="40%">
//                                 <Calendar size={16} className="me-2" />
//                                 Created At
//                               </td>
//                               <td>
//                                 <strong>
//                                   {new Date(
//                                     currentProduct.created_at,
//                                   ).toLocaleString()}
//                                 </strong>
//                               </td>
//                             </tr>
//                             <tr>
//                               <td className="text-muted">
//                                 <Calendar size={16} className="me-2" />
//                                 Last Updated
//                               </td>
//                               <td>
//                                 <strong>
//                                   {new Date(
//                                     currentProduct.updated_at,
//                                   ).toLocaleString()}
//                                 </strong>
//                               </td>
//                             </tr>
//                             {currentProduct.article_profile_id && (
//                               <tr>
//                                 <td className="text-muted">
//                                   Article Profile ID
//                                 </td>
//                                 <td>
//                                   <code className="small">
//                                     {currentProduct.article_profile_id}
//                                   </code>
//                                 </td>
//                               </tr>
//                             )}
//                             {currentProduct.warehouse_id && (
//                               <tr>
//                                 <td className="text-muted">Warehouse ID</td>
//                                 <td>
//                                   <code className="small">
//                                     {currentProduct.warehouse_id}
//                                   </code>
//                                 </td>
//                               </tr>
//                             )}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ProductDetail;



//current working - END





//product detail with product activty - Start 
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Printer,
  Package,
  MapPin,
  Home,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "feather-icons-react/build/IconComponents";
import { clearCurrentProduct } from "../../core/redux/slices/productSlice";
import AuthService from "../../services/authService";
import PropTypes from "prop-types";
import ProductActivity from "./productactivity";

const BarcodeDisplay = ({ value }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && value) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = 3;
      const startX = 20;
      const startY = 10;
      const barHeight = 80;

      const binaryPattern = value
        .split("")
        .map((char) => char.charCodeAt(0).toString(2).padStart(8, "0"))
        .join("");

      binaryPattern.split("").forEach((bit, index) => {
        if (bit === "1") {
          ctx.fillStyle = "#000";
          ctx.fillRect(startX + index * barWidth, startY, barWidth, barHeight);
        }
      });

      ctx.fillStyle = "#000";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      ctx.fillText(value, canvas.width / 2, startY + barHeight + 20);
    }
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      width="360"
      height="120"
      style={{ maxWidth: "100%" }}
    />
  );
};

BarcodeDisplay.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const MySwal = withReactContent(Swal);

  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [articleProfiles, setArticleProfiles] = useState([]);
  const [activeTab, setActiveTab] = useState("details");
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    partial_code: "",
    article_profile_id: null,
    warehouse_id: null,
    location: "",
    in_wh_locn: "",
    count: "",
    status: null,
    description: "",
  });

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "repaired", label: "Repaired" },
    { value: "broken", label: "Broken" },
    { value: "installed", label: "Installed" },
  ];

  const copyToClipboard = () => {
    if (!currentProduct?.barcode) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(currentProduct.barcode).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = currentProduct.barcode;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy barcode:", err);
    }
  };

  useEffect(() => {
    return () => {
      dispatch(clearCurrentProduct());
    };
  }, [dispatch]);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("No product ID provided");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const productResponse = await AuthService.getProductById(id);
        const product = productResponse.data.data;

        if (!product) {
          throw new Error("Product data not found in response");
        }

        setCurrentProduct(product);
        await fetchFilterOptions();
        setLoading(false);
      } catch (err) {
        console.error("Error fetching product:", err);
        const errorMessage =
          err.response?.data?.message ||
          err.message ||
          "Failed to load product";
        setError(errorMessage);
        setLoading(false);

        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load product details. Please try again.",
          confirmButtonText: "Go Back",
        }).then(() => {
          navigate(-1);
        });
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, navigate, dispatch]);

  useEffect(() => {
    if (currentProduct && warehouses.length > 0 && articleProfiles.length > 0) {
      const selectedWarehouse = warehouses.find(
        (w) => String(w.value) === String(currentProduct.warehouse_id),
      );
      const selectedArticleProfile = articleProfiles.find(
        (a) => String(a.value) === String(currentProduct.article_profile_id),
      );
      const selectedStatus = statusOptions.find(
        (s) => s.value === currentProduct.status,
      );

      setFormData({
        title: currentProduct.partial_code || "",
        article_profile_id: selectedArticleProfile || null,
        warehouse_id: selectedWarehouse || null,
        location: currentProduct.location || "",
        in_wh_locn: currentProduct.in_wh_locn || "",
        count: currentProduct.count || "",
        status: selectedStatus || null,
        description: currentProduct.description || "",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProduct, warehouses, articleProfiles]);

  useEffect(() => {
    if (location.state?.openEditModal && location.state?.editProductId) {
  
      navigate(location.pathname, { replace: true, state: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const fetchFilterOptions = async () => {
    try {
      const [warehousesRes, articleProfilesRes] = await Promise.all([
        AuthService.getWarehouse(),
        AuthService.getArticles(),
      ]);

      const warehouseOptions = (
        warehousesRes.data.data ||
        warehousesRes.data ||
        []
      ).map((item) => ({
        value: item.wh_uuid,
        label: item.name || item.title,
      }));

      const articleProfileOptions = (
        articleProfilesRes.data.data ||
        articleProfilesRes.data ||
        []
      ).map((item) => ({
        value: item.uuid || item.art_prof_uuid,
        label: item.title || item.name,
      }));

      setWarehouses(warehouseOptions);
      setArticleProfiles(articleProfileOptions);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      [name]: option,
    }));
  };

  const handleEditToggle = () => {
    if (isEditing) {
      const selectedWarehouse = warehouses.find(
        (w) => String(w.value) === String(currentProduct.warehouse_id),
      );
      const selectedArticleProfile = articleProfiles.find(
        (a) => String(a.value) === String(currentProduct.article_profile_id),
      );
      const selectedStatus = statusOptions.find(
        (s) => s.value === currentProduct.status,
      );

      setFormData({
        title: currentProduct.partial_code || "",
        article_profile_id: selectedArticleProfile || null,
        warehouse_id: selectedWarehouse || null,
        location: currentProduct.location || "",
        in_wh_locn: currentProduct.in_wh_locn || "",
        count: currentProduct.count || "",
        status: selectedStatus || null,
        description: currentProduct.description || "",
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (!formData.article_profile_id?.value) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: "Article profile is required",
        timer: 2000,
      });
      return;
    }

    if (
      formData.status?.value !== "installed" &&
      !formData.warehouse_id?.value
    ) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: "Warehouse is required",
        timer: 2000,
      });
      return;
    }

    if (formData.status?.value === "installed" && !formData.location?.trim()) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: 'Location is required when status is "Installed"',
        timer: 2000,
      });
      return;
    }

    try {
      setSubmitting(true);

      const dataToSubmit = {
        title: formData.partial_code || undefined,
        article_profile_id: formData.article_profile_id.value,
        warehouse_id:
          formData.status?.value !== "installed"
            ? formData.warehouse_id?.value
            : undefined,
        location: formData.location || undefined,
        in_wh_location: formData.in_wh_locn || undefined,
        count: parseInt(formData.count) || 0,
        status: formData.status?.value || "new",
        description: formData.description || undefined,
      };

      await AuthService.updateProductById(
        currentProduct.prod_uuid,
        dataToSubmit,
      );

      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Product updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      setIsEditing(false);

      const productResponse = await AuthService.getProductById(id);
      const updatedProduct = productResponse.data.data;
      setCurrentProduct(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to update product",
        timer: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (error && !loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center p-5">
            <div className="alert alert-danger">
              <h4>Error Loading Product</h4>
              <p>{error}</p>
              <button
                className="btn btn-primary mt-3"
                onClick={() => navigate(-1)}
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading || !currentProduct) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center p-5">
            <div
              className="spinner-border text-primary"
              role="status"
              style={{ width: "3rem", height: "3rem" }}
            >
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  const getStatusBadgeClass = (status) => {
    const statusMap = {
      new: "badge-linesuccess",
      used: "badge-lineinfo",
      repaired: "badge-linewarning",
      broken: "badge-linedanger",
      installed: "badge-secondary",
    };
    return statusMap[status] || "badge-secondary";
  };

  const getStatusIcon = (status, colorClass = "text-primary") => {
    const iconMap = {
      new: <CheckCircle size={18} className={colorClass} />,
      used: <AlertCircle size={18} className={colorClass} />,
      repaired: <CheckCircle size={18} className={colorClass} />,
      broken: <XCircle size={18} className={colorClass} />,
      installed: <CheckCircle size={18} className={colorClass} />,
    };
    return iconMap[status] || <AlertCircle size={18} className={colorClass} />;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Breadcrumb Navigation */}
        <div className="page-header border-0 mb-4">
          <div className="page-title">
            <button
              onClick={() => navigate(-1)}
              className="btn btn-link p-0 text-decoration-none"
            >
              <ArrowLeft size={18} className="me-2" />
              <span>Back to Products</span>
            </button>
          </div>
          <div className="page-btn d-flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={handlePrint}
                  className="btn btn-outline-secondary"
                >
                  <Printer className="me-2" size={16} />
                  Print Barcode
                </button>
                <button onClick={handleEditToggle} className="btn btn-added">
                  <Edit className="me-2" size={16} />
                  Edit Product
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleEditToggle}
                  className="btn btn-cancel"
                  disabled={submitting}
                >
                  <X className="me-2" size={16} />
                  Cancel
                </button>
                <button
                  onClick={handleSaveChanges}
                  className="btn btn-submit"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="me-2" size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="row">
          {/* Left Column - Barcode & Quick Stats */}
          <div className="col-lg-4 col-md-5">
            <div className="card product-detail-sticky">
              <div className="card-body">
                {/* Barcode Display */}
                <div className="barcode-section text-center mb-4 p-3 mt-2 d-flex justify-content-center align-items-center gap-2 flex-wrap">
                  <BarcodeDisplay value={currentProduct.barcode} />

                  {currentProduct.existing_barcode === 1  && (
                    <span className="badge badge-info fs-6">Existing</span>
                  )}

                  <span className="badge badge-secondary fs-6">
                    {currentProduct.barcode}
                  </span>

                  <button
                    className="btn btn-sm btn-outline-primary"
                    onClick={copyToClipboard}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="quick-stats">
                  <div className="stat-item d-flex align-items-center justify-content-between mb-3 p-3 rounded">
                    <div className="d-flex align-items-center">
                      <Package className="text-primary me-3" size={24} />
                      <div>
                        <small className="text-muted d-block">Quantity</small>
                        <strong className="fs-5">
                          {currentProduct.count || 0}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div className="stat-item d-flex align-items-center justify-content-between mb-3 p-3 bg-light rounded">
                    <div className="d-flex align-items-center">
                      {getStatusIcon(currentProduct.status, "text-primary")}
                      <div className="ms-3">
                        <small className="text-muted d-block">Status</small>
                        <span
                          className={`badge ${getStatusBadgeClass(currentProduct.status)}`}
                        >
                          {currentProduct.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {currentProduct.warehouse_name && (
                    <div className="stat-item d-flex align-items-center mb-3 p-3 rounded">
                      <Home className="text-primary me-3" size={24} />
                      <div>
                        <small className="text-muted d-block">Warehouse</small>
                        <strong className="text-secondary">
                          {currentProduct.warehouse_name}
                        </strong>
                      </div>
                    </div>
                  )}

                  {currentProduct.location && (
                    <div className="stat-item d-flex align-items-center mb-3 p-3 rounded">
                      <MapPin className="text-primary me-3" size={24} />
                      <div>
                        <small className="text-muted d-block">Location</small>
                        <strong className="text-secondary">
                          {currentProduct.location}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>

                {/* UUID Info */}
                <div className="mt-4 pt-3 border-top">
                  <small className="text-muted d-block mb-2">Product ID</small>
                  <code className="d-block p-2 rounded small text-break">
                    {currentProduct.prod_uuid}
                  </code>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Product Details */}
          <div className="col-lg-8 col-md-7">
            <div className="card">
              <div className="card-body">
                {/* Product Title */}
                <div className="product-header mb-4">
                  {isEditing ? (
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      name="title"
                      value={formData.partial_code}
                      onChange={handleInputChange}
                      placeholder="Enter product name (optional)"
                    />
                  ) : (
                    <>
                      <h2 className="product-title mb-2">
                        {currentProduct.partial_code || "Untitled Product"}
                      </h2>
                      <p className="text-muted mb-0">
                        Article Profile:{" "}
                        <strong>
                          {currentProduct.article_profile_name || "N/A"}
                        </strong>
                      </p>
                    </>
                  )}
                </div>

                {/* Tabs */}
                <div className="product-detail-tabs">
                  <ul className="nav nav-tabs mb-4" role="tablist">
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "details" ? "active" : ""}`}
                        onClick={() => setActiveTab("details")}
                      >
                        <FileText size={16} className="me-2" />
                        Details
                      </button>
                    </li>
                    <li className="nav-item">
                      <button
                        className={`nav-link ${activeTab === "specs" ? "active" : ""}`}
                        onClick={() => setActiveTab("specs")}
                      >
                        <Package size={16} className="me-2" />
                        Specifications
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Tab Content */}
                <div className="tab-content">
                  {/* Details Tab */}
                  {activeTab === "details" && (
                    <div className="tab-pane active">
                      <div className="row g-4">
                        {/* Article Profile */}
                        <div className="col-md-6">
                          <div className="detail-group">
                            <label className="detail-label">
                              Article Profile{" "}
                              <span className="text-danger">*</span>
                            </label>
                            {isEditing ? (
                              <Select
                                options={articleProfiles}
                                value={formData.article_profile_id}
                                onChange={(option) =>
                                  handleSelectChange(
                                    "article_profile_id",
                                    option,
                                  )
                                }
                                placeholder="Select Article Profile"
                                className="select"
                              />
                            ) : (
                              <div className="detail-value">
                                {currentProduct.article_profile_name || "N/A"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Status */}
                        <div className="col-md-6">
                          <div className="detail-group">
                            <label className="detail-label">Status</label>
                            {isEditing ? (
                              <Select
                                options={statusOptions}
                                value={formData.status}
                                onChange={(option) =>
                                  handleSelectChange("status", option)
                                }
                                placeholder="Select Status"
                                className="select"
                              />
                            ) : (
                              <div className="detail-value">
                                <span
                                  className={`badge ${getStatusBadgeClass(currentProduct.status)}`}
                                >
                                  {currentProduct.status}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Warehouse */}
                        <div className="col-md-6">
                          <div className="detail-group">
                            <label className="detail-label">
                              Warehouse
                              {formData.status?.value !== "installed" &&
                                isEditing && (
                                  <span className="text-danger">*</span>
                                )}
                            </label>
                            {isEditing ? (
                              <>
                                <Select
                                  options={warehouses}
                                  value={formData.warehouse_id}
                                  onChange={(option) =>
                                    handleSelectChange("warehouse_id", option)
                                  }
                                  placeholder="Select Warehouse"
                                  isDisabled={
                                    formData.status?.value === "installed"
                                  }
                                  className="select"
                                />
                                {formData.status?.value === "installed" && (
                                  <small className="text-muted">
                                    Warehouse is not required for installed
                                    items
                                  </small>
                                )}
                              </>
                            ) : (
                              <div className="detail-value">
                                {currentProduct.warehouse_name || "N/A"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        {/* <div className="col-md-6">
                          <div className="detail-group">
                            <label className="detail-label">
                              Location
                              {formData.status?.value === "installed" &&
                                isEditing && (
                                  <span className="text-danger">*</span>
                                )}
                            </label>
                            {isEditing ? (
                              <>
                                <input
                                  type="text"
                                  className="form-control"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  placeholder="Enter location"
                                  required={
                                    formData.status?.value === "installed"
                                  }
                                />
                                {formData.status?.value === "installed" && (
                                  <small className="text-muted">
                                    Location is required for installed items
                                  </small>
                                )}
                              </>
                            ) : (
                              <div className="detail-value">
                                {currentProduct.location || "N/A"}
                              </div>
                            )}
                          </div>
                        </div> */}

                        {/* In WH Location */}
                        <div className="col-md-6">
                          <div className="detail-group">
                            <label className="detail-label">
                              In WH Location
                            </label>
                            {isEditing ? (
                              <input
                                type="text"
                                className="form-control"
                                name="in_wh_locn"
                                value={formData.in_wh_locn}
                                onChange={handleInputChange}
                                placeholder="Enter warehouse location"
                              />
                            ) : (
                              <div className="detail-value">
                                {currentProduct.in_wh_locn || "N/A"}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity */}
                        <div className="col-md-6">
                          <div className="detail-group">
                            <label className="detail-label">Quantity</label>
                            {isEditing ? (
                              <input
                                type="number"
                                className="form-control"
                                name="count"
                                value={formData.count}
                                onChange={handleInputChange}
                                min="0"
                              />
                            ) : (
                              <div className="detail-value">
                                <span className="badge badge-primary fs-6">
                                  {currentProduct.count || 0}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Description */}
                        <div className="col-12">
                          <div className="detail-group">
                            <label className="detail-label">Description</label>
                            {isEditing ? (
                              <>
                                <textarea
                                  className="form-control"
                                  name="description"
                                  value={formData.description}
                                  onChange={handleInputChange}
                                  rows="4"
                                  placeholder="Enter product description"
                                  maxLength="500"
                                />
                                <small className="text-muted">
                                  Maximum 500 characters
                                </small>
                              </>
                            ) : (
                              <div className="detail-value">
                                {currentProduct.description ||
                                  "No description available"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Specifications Tab */}
                  {activeTab === "specs" && (
                    <div className="tab-pane active">
                      <div className="specifications-table">
                        <table className="table table-borderless">
                          <tbody>
                            <tr>
                              <td className="text-muted" width="40%">
                                <Calendar size={16} className="me-2" />
                                Created At
                              </td>
                              <td>
                                <strong>
                                  {new Date(
                                    currentProduct.created_at,
                                  ).toLocaleString()}
                                </strong>
                              </td>
                            </tr>
                            <tr>
                              <td className="text-muted">
                                <Calendar size={16} className="me-2" />
                                Last Updated
                              </td>
                              <td>
                                <strong>
                                  {new Date(
                                    currentProduct.updated_at,
                                  ).toLocaleString()}
                                </strong>
                              </td>
                            </tr>
                            {currentProduct.article_profile_id && (
                              <tr>
                                <td className="text-muted">
                                  Article Profile ID
                                </td>
                                <td>
                                  <code className="small">
                                    {currentProduct.article_profile_id}
                                  </code>
                                </td>
                              </tr>
                            )}
                            {currentProduct.warehouse_id && (
                              <tr>
                                <td className="text-muted">Warehouse ID</td>
                                <td>
                                  <code className="small">
                                    {currentProduct.warehouse_id}
                                  </code>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Product Activity Section */}
          <div className="col-12 mt-4">
            <ProductActivity 
              productUuid={currentProduct.prod_uuid} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
//product detail with product activty - End
