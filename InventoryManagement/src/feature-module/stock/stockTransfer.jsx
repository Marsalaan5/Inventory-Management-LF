

// // StockTransfer - Min Production//
// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   Edit,
//   Filter,
//   PlusCircle,
//   Sliders,
//   Trash2,
//   Search as SearchIcon,
//   TrendingUp,
//   TrendingDown,
//   Package,
//   Download,
//   Camera,
//   Truck,
//   CheckCircle,
//   Eye,
//   X,
// } from "feather-icons-react/build/IconComponents";
// import { Modal } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
// import AuthService from "../../services/authService.js";
// import Table from "../../core/pagination/datatable";
// import TableHeaderActions from "../tableheader";
// import {
//   fetchStockFlowOptions,
//   fetchStockFlows,
//   fetchStockFlowStats,
//   setFilters,
//   resetFilters,
//   updateStockFlow,
//   deleteStockFlow as deleteStockFlowAction,
//   clearError,
//   fetchStockFlowById,
//   dispatchStockFlow,
//   receiveStockFlow,
// } from '../../core/redux/slices/stockSlice.js';

// const StockTransfer = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const MySwal = withReactContent(Swal);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

  
//   const {
//     stockFlows,
//     stats,
//     filters,
//     status: loadingStatus,
//     error,
//     options,
//     pagination,
//   } = useSelector((state) => state.stockFlow);

//   const transportOptions = options?.transport || [];
//   // const statusOptionsForForm = options?.status || [];
//   const sortOptions = options?.sort || [];
//   const optionsLoading = options?.loading || false;

//   const loading = loadingStatus === "loading";
//   const data = useSelector((state) => state.toggle_header);

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showReceiveModal, setShowReceiveModal] = useState(false);
//   const [editingStockFlow, setEditingStockFlow] = useState(null);
//   const [receivingStockFlow, setReceivingStockFlow] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [isFilterVisible, setIsFilterVisible] = useState(false);
//   const [warehouses, setWarehouses] = useState([]);
//   const [allWarehouses, setAllWarehouses] = useState([]);
//   const [fromIsWarehouse, setFromIsWarehouse] = useState(true);
//   const [toIsWarehouse, setToIsWarehouse] = useState(true);

//   // Photo capture state
//   const [cameraActive, setCameraActive] = useState(false);
//   const [capturedPhoto, setCapturedPhoto] = useState(null);
//   const [stream, setStream] = useState(null);

//   // Receive form state
//   const [receiveData, setReceiveData] = useState({
//     receivedBy: "",
//     receivedQuantity: "",
//     remarks: "",
//     deliveryPhoto: null,
//   });

//   // Form state for editing
//   const [formData, setFormData] = useState({
//     from_wh: null,
//     to_wh: null,
//     from_loc: "",
//     to_loc: "",
//     quantity: "",
//     transport: null,
//     // status: { value: "approved", label: "Approved" },
//     description: "",
//   });

//   const transportFilterOptions = [
//     { value: "", label: "All Transport" },
//     ...transportOptions,
//   ];

//   // const statusOptions = [
//   //   { value: "", label: "All Status" },
//   //   ...statusOptionsForForm,
//   // ];

//   useEffect(() => {
//     dispatch(fetchStockFlows(filters));
//     dispatch(fetchStockFlowStats());
//     dispatch(fetchStockFlowOptions());
//     fetchWarehouses();
//     fetchAllWarehousesForDropdown();
//     // eslint-disable-next-line
//   }, []);

//   // Show error notifications
//   useEffect(() => {
//     if (error) {
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error,
//         timer: 3000,
//       });
//       dispatch(clearError());
//     }
//   }, [error, dispatch, MySwal]);


//   useEffect(() => {
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [stream]);


//   const getTotalQty = (record) => {

//   if (Array.isArray(record.product_arr) && record.product_arr.length > 0) {
//     return record.product_arr.reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
//   }

//   return record.quantity ?? "—";
// };
 

//   // Pagination changes
//   const handlePaginationChange = (paginationConfig) => {
//     dispatch(
//       setFilters({
//         page: paginationConfig.page,
//         limit: paginationConfig.limit,
//       }),
//     );
//   };

//   // Fetch warehouses
//   const fetchWarehouses = async () => {
//     try {
//       const response = await AuthService.getWarehouse();
//       setWarehouses(
//         (response.data.data || response.data || []).map((item) => ({
//           value: item.wh_uuid,
//           label: item.name || item.title,
//         }))
//       );
//     } catch (error) {
//       console.error("Error fetching warehouses:", error);
//     }
//   };

   
//       const fetchAllWarehousesForDropdown = async () => {
//       try {
//         const response = await AuthService.getWarehouseDropdown();
//         const warehouseList = (response.data.data || response.data || []).map((item) => ({
//           value: item.wh_uuid,
//           label: item.name || item.title,
//         }));
//         setAllWarehouses(warehouseList);
//       } catch (error) {
//         console.error("Error fetching all warehouses:", error);
//         MySwal.fire({
//           icon: "error",
//           title: "Error",
//           text: "Failed to load warehouses",
//           timer: 2000,
//         });
//       }
//     };

//   // Handle filter changes
//   const handleFilterChange = (name, value) => {
//     dispatch(setFilters({ [name]: value }));
//   };

//   // Debounced search
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       dispatch(fetchStockFlows(filters));
//     }, 500);

//     return () => clearTimeout(delayDebounceFn);
//     // eslint-disable-next-line
//   }, [filters.search]);

//   // Fetch stock flows when other filters change
//   useEffect(() => {
//     dispatch(fetchStockFlows(filters));
//     // eslint-disable-next-line
//   }, [
//     filters.page,
//     filters.limit,
//     filters.status,
//     filters.transport,
//     filters.from_wh,
//     filters.to_wh,
//     filters.sortBy,
//     filters.sortOrder,
//   ]);

//   const handleSearch = (e) => {
//     const value = e.target.value;
//     dispatch(setFilters({ search: value }));
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       from_wh: null,
//       to_wh: null,
//       from_loc: "",
//       to_loc: "",
//       quantity: "",
//       transport: null,
//       // status: statusOptionsForForm[0] || { value: "approved", label: "Approved" },
//       description: "",
//     });
//     setFromIsWarehouse(true);
//     setToIsWarehouse(true);
//   };

//   // Camera functions
//   const startCamera = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//         audio: false,
//       });
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//         setStream(mediaStream);
//         setCameraActive(true);
//       }
//     } catch (err) {
//       console.error("Error accessing camera:", err);
//       MySwal.fire({
//         icon: "error",
//         title: "Camera Error",
//         text: "Unable to access camera. Please check permissions.",
//         timer: 3000,
//       });
//     }
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
      
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
      
//       const context = canvas.getContext('2d');
//       context.drawImage(video, 0, 0);
      
//       canvas.toBlob((blob) => {
//         const file = new File([blob], `delivery-${Date.now()}.jpg`, { type: 'image/jpeg' });
//         setCapturedPhoto(URL.createObjectURL(blob));
//         setReceiveData(prev => ({ ...prev, deliveryPhoto: file }));
//         stopCamera();
//       }, 'image/jpeg', 0.95);
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//       setCameraActive(false);
//     }
//   };

//   const retakePhoto = () => {
//     setCapturedPhoto(null);
//     setReceiveData(prev => ({ ...prev, deliveryPhoto: null }));
//     startCamera();
//   };

//   // Navigate to Add Stock Flow page
//   const handleAddClick = () => {
//     navigate("/add-stock-flow");
//   };


//   const handleViewDetails = (id) => {
//     navigate(`/stock-flow-details/${id}`);
//   };

//   const handleEditClick = async (id) => {
//     try {
//       const stockFlowData = await dispatch(fetchStockFlowById(id)).unwrap();

//       const selectedFromWh = warehouses.find(
//         (w) => w.value === stockFlowData.from_wh
//       );
//       const selectedToWh = warehouses.find((w) => w.value === stockFlowData.to_wh);
//       const selectedTransport = transportOptions.find(
//         (t) => t.value === stockFlowData.transport
//       );
//       // const selectedStatus = statusOptionsForForm.find(
//       //   (s) => s.value === stockFlowData.status
//       // );

//       setEditingStockFlow(stockFlowData);
      
//       setFromIsWarehouse(!!stockFlowData.from_wh);
//       setToIsWarehouse(!!stockFlowData.to_wh);

//       setFormData({
//         from_wh: selectedFromWh || null,
//         to_wh: selectedToWh || null,
//         from_loc: stockFlowData.from_loc || "",
//         to_loc: stockFlowData.to_loc || "",
//         quantity: stockFlowData.quantity || "",
//         transport: selectedTransport || null,
//         // status: selectedStatus || null,
//         description: stockFlowData.description || "",
//       });

//       setShowEditModal(true);
//     } catch (error) {
//       console.error("Error fetching stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to load stock flow details",
//         timer: 2000,
//       });
//     }
//   };

//   const handleCloseEditModal = () => {
//     setShowEditModal(false);
//     setEditingStockFlow(null);
//     resetForm();
//   };

//   // Handle Dispatch
//     const handleDispatch = async (id) => {
//       MySwal.fire({
//         title: "Dispatch Stock Flow?",
//         text: "This will mark the stock as in-transit",
//         icon: "question",
//         showCancelButton: true,
//         confirmButtonColor: "#3085d6",
//         confirmButtonText: "Yes, Dispatch!",
//         cancelButtonColor: "#d33",
//         cancelButtonText: "Cancel",
//       }).then(async (result) => {
//         if (result.isConfirmed) {
//           try {
//             console.log('Dispatching stock flow:', id);
//         const result = await dispatch(dispatchStockFlow(id)).unwrap();
//         console.log('Dispatch result:', result);

//             MySwal.fire({
//               icon: "success",
//               title: "Dispatched!",
//               text: "Stock flow has been dispatched",
//               timer: 2000,
//               showConfirmButton: false,
//             });

//             dispatch(fetchStockFlows(filters));
//             dispatch(fetchStockFlowStats());
//           } catch (error) {
//             console.error("Error dispatching:", error);
//             MySwal.fire({
//               icon: "error",
//               title: "Error",
//               text: error || "Failed to dispatch stock flow",
//               timer: 3000,
//             });
//           }
//         }
//       });
//     };

//   // Handle Receive - Open Modal
//   const handleReceiveClick = async (id) => {
//     try {
//       const stockFlowData = await dispatch(fetchStockFlowById(id)).unwrap();
//       setReceivingStockFlow(stockFlowData);
//       setReceiveData({
//         receivedBy: "",
//         receivedQuantity: getTotalQty(stockFlowData),
//         remarks: "",
//         deliveryPhoto: null,
//       });
//       setCapturedPhoto(null);
//       setShowReceiveModal(true);
//     } catch (error) {
//       console.error("Error fetching stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to load stock flow details",
//         timer: 2000,
//       });
//     }
//   };

//   // Close Receive Modal
//   const handleCloseReceiveModal = () => {
//     setShowReceiveModal(false);
//     setReceivingStockFlow(null);
//     setReceiveData({
//       receivedBy: "",
//       receivedQuantity: "",
//       remarks: "",
//       deliveryPhoto: null,
//     });
//     setCapturedPhoto(null);
//     stopCamera();
//   };

//   // Submit Receive Confirmation
//   const handleReceiveSubmit = async (e) => {
//     e.preventDefault();

//     if (!receiveData.receivedBy.trim()) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Validation Error",
//         text: "Receiver name is required",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!receiveData.deliveryPhoto) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Photo Required",
//         text: "Please capture a delivery photo",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!receiveData.receivedQuantity || receiveData.receivedQuantity < 1) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Validation Error",
//         text: "Received quantity must be at least 1",
//         timer: 2000,
//       });
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const formDataToSend = new FormData();
//       // formDataToSend.append('status', 'delivered');
//       formDataToSend.append('received_by', receiveData.receivedBy);
//       formDataToSend.append('received_quantity', receiveData.receivedQuantity);
//       formDataToSend.append('receive_remarks', receiveData.remarks);
//       formDataToSend.append('delivery_photo', receiveData.deliveryPhoto);

//       // await AuthService.receiveStockFlow(receivingStockFlow.id, formDataToSend);
// await dispatch(
//   receiveStockFlow({
//     id: receivingStockFlow.id,
//     data: formDataToSend,
//   })
// ).unwrap();

//       MySwal.fire({
//         icon: "success",
//         title: "Received!",
//         text: "Stock flow marked as delivered",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       handleCloseReceiveModal();
//       dispatch(fetchStockFlows(filters));
//       dispatch(fetchStockFlowStats());

//     } catch (error) {
//       console.error(" Error receiving stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Failed to receive stock flow",
//         timer: 3000,
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle Input Changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

  
//   const handleDownloadInvoice = async (id) => {
//     try {
//       const response = await AuthService.downloadStockFlowInvoice(id);
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `stock-flow-invoice-${id}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error downloading invoice:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to download invoice",
//         timer: 2000,
//       });
//     }
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setSubmitting(true);

//       const dataToSubmit = {
//         from_wh: fromIsWarehouse ? formData.from_wh?.value || null : null,
//         to_wh: toIsWarehouse ? formData.to_wh?.value || null : null,
//         from_loc: !fromIsWarehouse ? formData.from_loc : null,
//         to_loc: !toIsWarehouse ? formData.to_loc : null,
//         quantity: parseInt(formData.quantity),
//         transport: formData.transport.value,
//         // status: formData.status.value,
//         description: formData.description,
//       };

//       await dispatch(
//         updateStockFlow({ id: editingStockFlow.id, data: dataToSubmit })
//       ).unwrap();

//       MySwal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Stock flow updated successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       handleCloseEditModal();
//       dispatch(fetchStockFlows(filters));
//       dispatch(fetchStockFlowStats());
      
//     } catch (error) {
//       console.error(" Error updating stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error || "Failed to update stock flow",
//         timer: 3000,
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     MySwal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonColor: "#3085d6",
//       cancelButtonText: "Cancel",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await dispatch(deleteStockFlowAction(id)).unwrap();
//           MySwal.fire({
//             icon: "success",
//             title: "Deleted!",
//             text: "Stock flow has been deleted.",
//             timer: 2000,
//             showConfirmButton: false,
//           });
//           dispatch(fetchStockFlows(filters));
//           dispatch(fetchStockFlowStats());
//         } catch (error) {
//           console.error("Error deleting stock flow:", error);
//           MySwal.fire({
//             icon: "error",
//             title: "Error",
//             text: error || "Failed to delete stock flow",
//             timer: 3000,
//           });
//         }
//       }
//     });
//   };

//   const handleSortChange = (option) => {
//     const [sortBy, sortOrder] = option.value.split(":");
//     dispatch(setFilters({ sortBy, sortOrder }));
//   };

//   const toggleFilterVisibility = () => {
//     setIsFilterVisible((prev) => !prev);
//   };

//   const resetFiltersHandler = () => {
//     dispatch(resetFilters());
//     dispatch(fetchStockFlows(filters));
//   };


//   const columns = [
//     {
//       title: "ID",
//       dataIndex: "stock_id",
//       render: (text, record) => (
//         <Link 
//           to={`/stock-flow-details/${record.id}`}
//           className="badge badge-primary text-decoration-none"
//         >
//           #{text}
//         </Link>
//       ),
//       sorter: (a, b) => a.id - b.id,
//     },
//     {
//       title: "From",
//       dataIndex: "from_warehouse_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center">
//           <TrendingUp size={16} className="text-danger me-2" />
//           {text || record.from_loc || "N/A"}
//         </div>
//       ),
//       sorter: (a, b) =>
//         (a.from_warehouse_name || a.from_loc || "").localeCompare(
//           b.from_warehouse_name || b.from_loc || ""
//         ),
//     },
//     {
//       title: "To",
//       dataIndex: "to_warehouse_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center">
//           <TrendingDown size={16} className="text-success me-2" />
//           {text || record.to_loc || "N/A"}
//         </div>
//       ),
//       sorter: (a, b) =>
//         (a.to_warehouse_name || a.to_loc || "").localeCompare(
//           b.to_warehouse_name || b.to_loc || ""
//         ),
//     },
//     {
//       title: "Total Quantity",
//        render: (_, record) => {
//       const qty = getTotalQty(record);
//       return (
//         <div className="d-flex align-items-center">
//           <Package size={16} className="text-primary me-2" />
//           <span className="badge badge-info">{qty}</span>
//         </div>
//       );
      
//     }
//     },
//     {
//       title: "Transport",
//       dataIndex: "transport",
//       render: (text) => {
//         const transportOption = transportOptions.find(t => t.value === text);
//         return (
//           <span
//             className={`badge ${
//               text === "bus"
//                 ? "badge-secondary"
//                 : text === "courier"
//                 ? "badge-info"
//                 : text === "employee"
//                 ? "badge-warning"
//                 : "badge-primary"
//             }`}
//           >
//             {transportOption ? transportOption.label : text}
//           </span>
//         );
//       },
//       sorter: (a, b) => (a.transport || "").localeCompare(b.transport || ""),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       render: (text) => {
//         // const statusOption = statusOptionsForForm.find(s => s.value === text);
        
//         return (
//           <span
//             className={`badge ${
//               text === "approved"
//                 ? "badge-linesuccess"
//                 : text === "in-transit"
//                 ? "badge-linewarning"
//                 : text === "delivered"
//                 ? "badge-lineinfo"
//                 : "badge-secondary"
//             }`}
//           >
//             {/* {statusOption ? statusOption.label : text || "N/A"} */}
//             {text}
//           </span>
//         );
//       },
//       sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
//     },
//     {
//       title: "Created Date",
//       dataIndex: "created_at",
//       render: (text) => new Date(text).toLocaleDateString(),
//       sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
//     },
//     {
//       title: "Action",
//       dataIndex: "actions",
//       render: (_, record) => (
// <td className="action-table-data">
        

//           <div className="edit-delete-action">
//   {/* VIEW */}
//   <Link
//     className="me-2 p-2"
//     to="#"
//     onClick={(e) => {
//       e.preventDefault();
//       handleViewDetails(record.id);
//     }}
//     title="View Details"
//   >
//     <Eye className="feather-eye text-info" />
//   </Link>

//   {/* DISPATCH */}
//   {record.actions?.can_dispatch && (
//     <Link
//       className="me-2 p-2"
//       to="#"
//       onClick={(e) => {
//         e.preventDefault();
//         handleDispatch(record.id);
//       }}
//       title="Dispatch"
//     >
//       <Truck className="feather-truck text-warning" />
//     </Link>
//   )}

//   {/* RECEIVE */}
//   {record.actions?.can_receive && (
//     <Link
//       className="me-2 p-2"
//       to="#"
//       onClick={(e) => {
//         e.preventDefault();
//         handleReceiveClick(record.id);
//       }}
//       title="Receive & Confirm Delivery"
//     >
//       <CheckCircle className="feather-check-circle text-success" />
//     </Link>
//   )}

//   {/* DOWNLOAD */}
//   <Link
//     className="me-2 p-2"
//     to="#"
//     onClick={(e) => {
//       e.preventDefault();
//       handleDownloadInvoice(record.id);
//     }}
//     title="Download Invoice"
//   >
//     <Download className="feather-download text-primary" />
//   </Link>

//   {/* EDIT */}
//   {record.actions?.can_edit && (
//     <Link
//       className="me-2 p-2"
//       to="#"
//       onClick={(e) => {
//         e.preventDefault();
//         handleEditClick(record.id);
//       }}
//       title="Edit"
//     >
//       <Edit className="feather-edit" />
//     </Link>
//   )}

//   {/* DELETE */}
//   {record.actions?.can_delete && (
//     <Link
//       className="confirm-text p-2"
//       to="#"
//       onClick={(e) => {
//         e.preventDefault();
//         handleDelete(record.id);
//       }}
//       title="Delete"
//     >
//       <Trash2 className="feather-trash-2" />
//     </Link>
//   )}
// </div>

//         </td>
        
//       ),
//     },
//   ];

//   if (optionsLoading) {
//     return (
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
//             <div className="text-center">
//               <div className="spinner-border text-primary mb-3" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p>Loading options...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header mb-3">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Stock Flow Management</h4>
//               <h6>Manage your stock transfers</h6>
//             </div>
//           </div>

//           <TableHeaderActions
//             onRefresh={() => {
//               dispatch(fetchStockFlows(filters));
//               dispatch(fetchStockFlowStats());
//             }}
//             pdfEndpoint="/auth/export/stockflows/pdf"
//             excelEndpoint="/auth/export/stockflows/excel"
//             filters={{
//               search: filters.search,
//               status: filters.status,
//               transport: filters.transport,
//             }}
//             entityName="stock flows"
//             dispatch={dispatch}
//             headerState={data}
//             headerAction={setToogleHeader}
//             showPrint={true}
//           />

//           <div className="page-btn">
//             <button onClick={handleAddClick} className="btn btn-added">
//               <PlusCircle className="me-2 iconsize" />
//               Add Stock Flow
//             </button>
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das1 w-100">
//               <div className="dash-counts">
//                 <h4>{stats.total || 0}</h4>
//                 <h5>Total Transfers</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Package />
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das2">
//               <div className="dash-counts">
//                 <h4>{stats.approved || 0}</h4>
//                 <h5>Approved</h5>
//               </div>
//               <div className="dash-imgs">
//                 <i data-feather="check-circle" className="feather-check-circle" />
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das3 w-100">
//               <div className="dash-counts">
//                 <h4>{stats.in_transit || 0}</h4>
//                 <h5>In Transit</h5>
//               </div>
//               <div className="dash-imgs">
//                 <i data-feather="truck" className="feather-truck" />
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count">
//               <div className="dash-counts">
//                 <h4>{stats.delivered || 0}</h4>
//                 <h5>Delivered</h5>
//               </div>
//               <div className="dash-imgs">
//                 <i data-feather="check-square" className="feather-check-square" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="card table-list-card">
//           <div className="card-body">
//             <div className="table-top">
//               <div className="search-set">
//                 <div className="search-input">
//                   <input
//                     type="text"
//                     placeholder="Search by description or location"
//                     className="form-control form-control-sm formsearch"
//                     value={filters.search}
//                     onChange={handleSearch}
//                   />
//                   <Link to="#" className="btn btn-searchset">
//                     <SearchIcon className="feather-search" />
//                   </Link>
//                 </div>
//               </div>
//               <div className="search-path">
//                 <Link
//                   className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
//                 >
//                   <Filter
//                     className="filter-icon"
//                     onClick={toggleFilterVisibility}
//                   />
//                   <span onClick={toggleFilterVisibility}>
//                     <ImageWithBasePath
//                       src="assets/img/icons/closes.svg"
//                       alt="img"
//                     />
//                   </span>
//                 </Link>
//               </div>
//               <div className="form-sort">
//                 <Sliders className="info-img" />
//                 <Select
//                   className="select"
//                   options={sortOptions}
//                   placeholder="Sort By"
//                   onChange={handleSortChange}
//                   value={sortOptions.find(
//                     (opt) =>
//                       opt.value === `${filters.sortBy}:${filters.sortOrder}`
//                   )}
//                 />
//               </div>
//             </div>

//             {/* Filter Section */}
//             <div
//               className={`card${isFilterVisible ? " visible" : ""}`}
//               id="filter_inputs"
//               style={{ display: isFilterVisible ? "block" : "none" }}
//             >
//               <div className="card-body pb-0">
//                 <div className="row">
//                   <div className="col-lg-3 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>From Warehouse</label>
//                       <Select
//                         className="select"
//                         options={[
//                           { value: "", label: "All Warehouses" },
//                           ...warehouses,
//                         ]}
//                         placeholder="Choose Warehouse"
//                         onChange={(option) =>
//                           handleFilterChange("from_wh", option?.value || "")
//                         }
//                         value={
//                           warehouses.find((w) => w.value === filters.from_wh) || {
//                             value: "",
//                             label: "All Warehouses",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-3 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>To Warehouse</label>
//                       <Select
//                         className="select"
//                         options={[
//                           { value: "", label: "All Warehouses" },
//                           ...allWarehouses,
//                         ]}
//                         placeholder="Choose Warehouse"
//                         onChange={(option) =>
//                           handleFilterChange("to_wh", option?.value || "")
//                         }
//                         value={
//                           allWarehouses.find((w) => w.value === filters.to_wh) || {
//                             value: "",
//                             label: "All Warehouses",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-2 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>Transport</label>
//                       <Select
//                         className="select"
//                         options={transportFilterOptions}
//                         placeholder="Transport"
//                         onChange={(option) =>
//                           handleFilterChange("transport", option?.value || "")
//                         }
//                         value={
//                           transportFilterOptions.find(
//                             (t) => t.value === filters.transport
//                           ) || {
//                             value: "",
//                             label: "All Transport",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div>
//                   {/* <div className="col-lg-2 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>Status</label>
//                       <Select
//                         className="select"
//                         options={statusOptions}
//                         placeholder="Status"
//                         onChange={(option) =>
//                           handleFilterChange("status", option?.value || "")
//                         }
//                         value={
//                           statusOptions.find((s) => s.value === filters.status) || {
//                             value: "",
//                             label: "All Status",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div> */}
//                   <div className="col-lg-2 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <a
//                         className="btn btn-filters ms-auto w-100"
//                         onClick={resetFiltersHandler}
//                       >
//                         Reset Filters
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Stock Flows Table */}
//             <div className="table-responsive">
//               {loading ? (
//                 <div className="text-center p-5">
//                   <div className="spinner-border" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                 </div>
//               ) : stockFlows.length === 0 ? (
//                 <div className="text-center p-5">
//                   <p>No stock flows found</p>
//                 </div>
//               ) : (
//                 <Table 
//                   key={`${filters.page}-${filters.limit}`}
//                   columns={columns} 
//                   dataSource={stockFlows} 
//                   pagination={pagination}
//                   filters={filters}
//                   onPaginationChange={handlePaginationChange}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Modal */}
//       <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
//         <Modal.Header>
//           <Modal.Title>Edit Stock Flow</Modal.Title>
//           <button
//             type="button"
//             className="btn-close"
//             onClick={handleCloseEditModal}
//             disabled={submitting}
//           >
//             <X />
//           </button>
//         </Modal.Header>
//         <Modal.Body>
//           <form onSubmit={handleEditSubmit}>
//             {/* FROM Section */}
//             <div className="row mb-3">
//               <div className="col-12">
//                 <h6 className="mb-3">From Location</h6>
//                 <div className="d-flex gap-3 mb-3">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="fromTypeEdit"
//                       id="fromWarehouseEdit"
//                       checked={fromIsWarehouse}
//                       onChange={() => {
//                         setFromIsWarehouse(true);
//                         setFormData(prev => ({ ...prev, from_loc: "" }));
//                       }}
//                     />
//                     <label className="form-check-label" htmlFor="fromWarehouseEdit">
//                       Warehouse
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="fromTypeEdit"
//                       id="fromLocationEdit"
//                       checked={!fromIsWarehouse}
//                       onChange={() => {
//                         setFromIsWarehouse(false);
//                         setFormData(prev => ({ ...prev, from_wh: null }));
//                       }}
//                     />
//                     <label className="form-check-label" htmlFor="fromLocationEdit">
//                       Other Location
//                     </label>
//                   </div>
//                 </div>

//                 {fromIsWarehouse ? (
//                   <Select
//                     options={warehouses}
//                     value={formData.from_wh}
//                     onChange={(option) =>
//                       setFormData(prev => ({ ...prev, from_wh: option }))
//                     }
//                     placeholder="Select Warehouse"
//                     isClearable
//                   />
//                 ) : (
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={formData.from_loc}
//                     onChange={(e) => setFormData(prev => ({ ...prev, from_loc: e.target.value }))}
//                     placeholder="Enter location name"
//                   />
//                 )}
//               </div>
//             </div>

//             {/* TO Section */}
//             <div className="row mb-3">
//               <div className="col-12">
//                 <h6 className="mb-3">To Location</h6>
//                 <div className="d-flex gap-3 mb-3">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="toTypeEdit"
//                       id="toWarehouseEdit"
//                       checked={toIsWarehouse}
//                       onChange={() => {
//                         setToIsWarehouse(true);
//                         setFormData(prev => ({ ...prev, to_loc: "" }));
//                       }}
//                     />
//                     <label className="form-check-label" htmlFor="toWarehouseEdit">
//                       Warehouse
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="toTypeEdit"
//                       id="toLocationEdit"
//                       checked={!toIsWarehouse}
//                       onChange={() => {
//                         setToIsWarehouse(false);
//                         setFormData(prev => ({ ...prev, to_wh: null }));
//                       }}
//                     />
//                     <label className="form-check-label" htmlFor="toLocationEdit">
//                       Other Location
//                     </label>
//                   </div>
//                 </div>

//                 {toIsWarehouse ? (
//                   <Select
//                     options={warehouses}
//                     value={formData.to_wh}
//                     onChange={(option) =>
//                       setFormData(prev => ({ ...prev, to_wh: option }))
//                     }
//                     placeholder="Select Warehouse"
//                     isClearable
//                   />
//                 ) : (
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={formData.to_loc}
//                     onChange={(e) => setFormData(prev => ({ ...prev, to_loc: e.target.value }))}
//                     placeholder="Enter location name"
//                   />
//                 )}
//               </div>
//             </div>

//             {/* Other fields */}
//             <div className="row">
//               <div className="col-lg-4">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Quantity <span className="text-danger">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     name="quantity"
//                     value={formData.quantity}
//                     onChange={handleInputChange}
//                     placeholder="Enter quantity"
//                     min="1"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="col-lg-4">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Transport <span className="text-danger">*</span>
//                   </label>
//                   <Select
//                     options={transportOptions}
//                     value={formData.transport}
//                     onChange={(option) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         transport: option,
//                       }))
//                     }
//                     placeholder="Select Transport"
//                   />
//                 </div>
//               </div>
//               {/* <div className="col-lg-4">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Status <span className="text-danger">*</span>
//                   </label>
//                   <Select
//                     options={statusOptionsForForm}
//                     value={formData.status}
//                     onChange={(option) =>
//                       setFormData((prev) => ({
//                         ...prev,
//                         status: option,
//                       }))
//                     }
//                     placeholder="Select Status"
//                   />
//                 </div>
//               </div> */}
//             </div>

//             <div className="row">
//               <div className="col-12">
//                 <div className="mb-3">
//                   <label className="form-label">Description</label>
//                   <textarea
//                     className="form-control"
//                     name="description"
//                     value={formData.description}
//                     onChange={handleInputChange}
//                     rows="3"
//                     placeholder="Enter description"
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button
//                 type="button"
//                 className="btn btn-cancel me-2"
//                 onClick={handleCloseEditModal}
//                 disabled={submitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="btn btn-submit"
//                 disabled={submitting}
//               >
//                 {submitting ? "Saving..." : "Save Changes"}
//               </button>
//             </div>
//           </form>
//         </Modal.Body>
//       </Modal>

//       {/* Receive Modal */}
//       <Modal show={showReceiveModal} onHide={handleCloseReceiveModal} size="lg" centered>
//         <Modal.Header>
//           <Modal.Title>📦 Confirm Delivery</Modal.Title>
//           <button
//             type="button"
//             className="btn-close"
//             onClick={handleCloseReceiveModal}
//             disabled={submitting}
//           />
//         </Modal.Header>
//         <Modal.Body>
//           <form onSubmit={handleReceiveSubmit}>
//             {/* Stock Flow Details */}
//             {receivingStockFlow && (
//               <div className="alert alert-info mb-4">
//                 <h6 className="mb-2">Stock Flow Details</h6>
//                 <p className="mb-1">
//                   <strong>From:</strong> {receivingStockFlow.from_warehouse_name || receivingStockFlow.from_loc}
//                 </p>
//                 <p className="mb-1">
//                   <strong>To:</strong> {receivingStockFlow.to_warehouse_name || receivingStockFlow.to_loc}
//                 </p>
//                 <p className="mb-0">
//                   <strong>Expected Quantity:</strong> {getTotalQty(receivingStockFlow)}
//                 </p>
//               </div>
//             )}

//             {/* Photo Capture Section */}
//             <div className="row mb-4">
//               <div className="col-12">
//                 <label className="form-label">
//                   <Camera size={16} className="me-2" />
//                   Delivery Photo <span className="text-danger">*</span>
//                 </label>
                
//                 {!capturedPhoto && !cameraActive && (
//                   <button
//                     type="button"
//                     className="btn btn-primary w-100"
//                     onClick={startCamera}
//                   >
//                     <Camera size={18} className="me-2" />
//                     Open Camera
//                   </button>
//                 )}

//                 {cameraActive && (
//                   <div className="camera-container">
//                     <video
//                       ref={videoRef}
//                       autoPlay
//                       playsInline
//                       style={{
//                         width: '100%',
//                         maxHeight: '400px',
//                         borderRadius: '8px',
//                         backgroundColor: '#000'
//                       }}
//                     />
//                     <div className="mt-3 d-flex gap-2">
//                       <button
//                         type="button"
//                         className="btn btn-success flex-grow-1"
//                         onClick={capturePhoto}
//                       >
//                         <Camera size={18} className="me-2" />
//                         Capture Photo
//                       </button>
//                       <button
//                         type="button"
//                         className="btn btn-secondary"
//                         onClick={stopCamera}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {capturedPhoto && (
//                   <div className="captured-photo-container">
//                     <img
//                       src={capturedPhoto}
//                       alt="Delivery proof"
//                       style={{
//                         width: '100%',
//                         maxHeight: '400px',
//                         borderRadius: '8px',
//                         objectFit: 'contain'
//                       }}
//                     />
//                     <button
//                       type="button"
//                       className="btn btn-warning w-100 mt-3"
//                       onClick={retakePhoto}
//                     >
//                       <Camera size={18} className="me-2" />
//                       Retake Photo
//                     </button>
//                   </div>
//                 )}

//                 <canvas ref={canvasRef} style={{ display: 'none' }} />
//               </div>
//             </div>

//             {/* Receiver Details */}
//             <div className="row">
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Received By <span className="text-danger">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={receiveData.receivedBy}
//                     onChange={(e) => setReceiveData(prev => ({ ...prev, receivedBy: e.target.value }))}
//                     placeholder="Enter receiver name"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Received Quantity <span className="text-danger">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={receiveData.receivedQuantity}
//                     onChange={(e) => setReceiveData(prev => ({ ...prev, receivedQuantity: e.target.value }))}
//                     placeholder="Enter quantity"
//                     min="1"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-12">
//                 <div className="mb-3">
//                   <label className="form-label">Remarks (Optional)</label>
//                   <textarea
//                     className="form-control"
//                     value={receiveData.remarks}
//                     onChange={(e) => setReceiveData(prev => ({ ...prev, remarks: e.target.value }))}
//                     rows="3"
//                     placeholder="Any additional notes..."
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button
//                 type="button"
//                 className="btn btn-cancel me-2"
//                 onClick={handleCloseReceiveModal}
//                 disabled={submitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="btn btn-success"
//                 disabled={submitting || !capturedPhoto}
//               >
//                 {submitting ? "Processing..." : "✓ Confirm Delivery"}
//               </button>
//             </div>
//           </form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default StockTransfer;




// StockTransfer.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Edit, Filter, PlusCircle, Sliders, Trash2,
  Search as SearchIcon, TrendingUp, TrendingDown,
  Package, Download, Camera, Truck, CheckCircle, Eye, X,
} from "feather-icons-react/build/IconComponents";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import AuthService from "../../services/authService.js";
import Table from "../../core/pagination/datatable";
import TableHeaderActions from "../tableheader";

import {
  // thunks
  fetchStockFlows,
  fetchStockFlowById,
  fetchStockFlowStats,
  fetchStockFlowOptions,
  updateStockFlow,
  deleteStockFlow,
  dispatchStockFlow,
  receiveStockFlow,
  // actions
  setFlowFilters,
  resetFlowFilters,
  clearFlowError,
  clearFlowCurrent,
  // selectors
  selectFlowList,
  selectFlowCurrent,
  selectFlowStats,
  selectFlowFilters,
  selectFlowPagination,
  selectFlowOptions,
  selectFlowListLoading,
  selectFlowDetailLoading,
  selectFlowMutating,
  selectFlowOptionsLoading,
  selectFlowError,
} from "../../core/redux/slices/stockSlice.js";

const MySwal = withReactContent(Swal);

// ─────────────────────────────────────────────────────────────
//  Helpers
// ─────────────────────────────────────────────────────────────

const getTotalQty = (record) => {
  if (Array.isArray(record.product_arr) && record.product_arr.length > 0)
    return record.product_arr.reduce((sum, p) => sum + (parseInt(p.count) || 0), 0);
  return record.quantity ?? "—";
};

const StockTransfer = () => {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const headerData = useSelector((s) => s.toggle_header);

  // ── Redux state ──
  const stockFlows     = useSelector(selectFlowList);
  const stats          = useSelector(selectFlowStats);
  const filters        = useSelector(selectFlowFilters);
  const pagination     = useSelector(selectFlowPagination);
  const options        = useSelector(selectFlowOptions);
  const loading        = useSelector(selectFlowListLoading);
  const mutating       = useSelector(selectFlowMutating);
  const optionsLoading = useSelector(selectFlowOptionsLoading);
  const error          = useSelector(selectFlowError);
  const currentFlow    = useSelector(selectFlowCurrent);
  const detailLoading  = useSelector(selectFlowDetailLoading);

  const transportOptions = options.transport || [];
  const sortOptions      = options.sort      || [];

  // ── Local UI state (modal visibility + form) ──
  const [showEditModal,    setShowEditModal]    = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isFilterVisible,  setIsFilterVisible]  = useState(false);
  const [warehouses,       setWarehouses]       = useState([]);
  const [allWarehouses,    setAllWarehouses]    = useState([]);
  const [fromIsWarehouse,  setFromIsWarehouse]  = useState(true);
  const [toIsWarehouse,    setToIsWarehouse]    = useState(true);

  // Receive modal state
  const [capturedPhoto,   setCapturedPhoto]   = useState(null);
  const [cameraActive,    setCameraActive]    = useState(null);
  const [stream,          setStream]          = useState(null);
  const [receiveData,     setReceiveData]     = useState({ receivedBy: "", receivedQuantity: "", remarks: "", deliveryPhoto: null });
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

  // Edit form state (local — only lives during the modal open)
  const [formData, setFormData] = useState({
    from_wh: null, to_wh: null, from_loc: "", to_loc: "",
    quantity: "", transport: null, description: "",
  });
//  
  const transportFilterOptions = [{ value: "", label: "All Transport" }, ...transportOptions];

  // ── Init ──
  useEffect(() => {
    dispatch(fetchStockFlows(filters));
    dispatch(fetchStockFlowStats());
    dispatch(fetchStockFlowOptions());
    fetchWarehouses();
    fetchAllWarehouses();
    // eslint-disable-next-line
  }, []);

  // ── Error toast ──
  useEffect(() => {
    if (error) {
      MySwal.fire({ icon: "error", title: "Error", text: error, timer: 3000 });
      dispatch(clearFlowError());
    }
  }, [error, dispatch]);

  // ── Camera cleanup ──
  useEffect(() => () => { stream?.getTracks().forEach((t) => t.stop()); }, [stream]);

  // ── Filter-driven fetches (debounced search) ──
  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchStockFlows(filters)), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [filters.search]);

  useEffect(() => {
    dispatch(fetchStockFlows(filters));
    // eslint-disable-next-line
  }, [filters.page, filters.limit, filters.status, filters.transport,
      filters.from_wh, filters.to_wh, filters.sortBy, filters.sortOrder]);

  // ── Populate edit form when currentFlow loads ──
  useEffect(() => {
    if (!currentFlow || !showEditModal) return;
    setFromIsWarehouse(!!currentFlow.from_wh);
    setToIsWarehouse(!!currentFlow.to_wh);
    setFormData({
      from_wh:     warehouses.find((w) => w.value === currentFlow.from_wh) || null,
      to_wh:       warehouses.find((w) => w.value === currentFlow.to_wh)   || null,
      from_loc:    currentFlow.from_loc    || "",
      to_loc:      currentFlow.to_loc      || "",
      quantity:    currentFlow.quantity    || "",
      transport:   transportOptions.find((t) => t.value === currentFlow.transport) || null,
      description: currentFlow.description || "",
    });
  }, [currentFlow]); // eslint-disable-line

  // ── Populate receive form when currentFlow loads ──
  useEffect(() => {
    if (!currentFlow || !showReceiveModal) return;
    setReceiveData((p) => ({ ...p, receivedQuantity: getTotalQty(currentFlow) }));
  }, [currentFlow, showReceiveModal]);

  // ─────────────────────────────────────────────────────────────
  //  Data helpers
  // ─────────────────────────────────────────────────────────────

  const fetchWarehouses = async () => {
    try {
      const res = await AuthService.getWarehouse();
      setWarehouses((res.data.data || res.data || []).map((w) => ({ value: w.wh_uuid, label: w.name || w.title })));
    } catch (e) { console.error(e); }
  };

  const fetchAllWarehouses = async () => {
    try {
      const res = await AuthService.getWarehouseDropdown();
      setAllWarehouses((res.data.data || res.data || []).map((w) => ({ value: w.wh_uuid, label: w.name || w.title })));
    } catch (e) { console.error(e); }
  };

  // ─────────────────────────────────────────────────────────────
  //  Camera
  // ─────────────────────────────────────────────────────────────

  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      if (videoRef.current) { videoRef.current.srcObject = ms; setStream(ms); setCameraActive(true); }
    } catch {
      MySwal.fire({ icon: "error", title: "Camera Error", text: "Unable to access camera.", timer: 3000 });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current; const c = canvasRef.current;
    c.width = v.videoWidth; c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob((blob) => {
      const file = new File([blob], `delivery-${Date.now()}.jpg`, { type: "image/jpeg" });
      setCapturedPhoto(URL.createObjectURL(blob));
      setReceiveData((p) => ({ ...p, deliveryPhoto: file }));
      stopCamera();
    }, "image/jpeg", 0.95);
  };

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null); setCameraActive(false);
  }, [stream]);

  // ─────────────────────────────────────────────────────────────
  //  Handlers
  // ─────────────────────────────────────────────────────────────

  const handlePaginationChange = ({ page, limit }) => dispatch(setFlowFilters({ page, limit }));

  const handleSearch   = (e) => dispatch(setFlowFilters({ search: e.target.value }));
  const handleSortChange = (opt) => {
    const [sortBy, sortOrder] = opt.value.split(":");
    dispatch(setFlowFilters({ sortBy, sortOrder }));
  };

  const handleViewDetails = (id) => navigate(`/stock-flow-details/${id}`);

  const handleEditClick = (id) => {
    setShowEditModal(true);
    dispatch(fetchStockFlowById(id));
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    dispatch(clearFlowCurrent());
  };

  const handleReceiveClick = (id) => {
    setShowReceiveModal(true);
    setCapturedPhoto(null);
    setReceiveData({ receivedBy: "", receivedQuantity: "", remarks: "", deliveryPhoto: null });
    dispatch(fetchStockFlowById(id));
  };

  const handleCloseReceiveModal = () => {
    setShowReceiveModal(false);
    dispatch(clearFlowCurrent());
    setCapturedPhoto(null);
    stopCamera();
  };

  const handleDispatch = (id) => {
    MySwal.fire({
      title: "Dispatch Stock Flow?", text: "This will mark the stock as in-transit",
      icon: "question", showCancelButton: true,
      confirmButtonColor: "#3085d6", confirmButtonText: "Yes, Dispatch!",
      cancelButtonColor: "#d33",
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      try {
        await dispatch(dispatchStockFlow(id)).unwrap();
        MySwal.fire({ icon: "success", title: "Dispatched!", timer: 2000, showConfirmButton: false });
        dispatch(fetchStockFlows(filters));
        dispatch(fetchStockFlowStats());
      } catch (err) {
        MySwal.fire({ icon: "error", title: "Error", text: err || "Failed to dispatch", timer: 3000 });
      }
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(updateStockFlow({
        id:   currentFlow.id,
        data: {
          from_wh:     fromIsWarehouse ? formData.from_wh?.value || null : null,
          to_wh:       toIsWarehouse   ? formData.to_wh?.value   || null : null,
          from_loc:    !fromIsWarehouse ? formData.from_loc : null,
          to_loc:      !toIsWarehouse   ? formData.to_loc   : null,
          quantity:    parseInt(formData.quantity),
          transport:   formData.transport?.value,
          description: formData.description,
        },
      })).unwrap();
      MySwal.fire({ icon: "success", title: "Updated!", timer: 2000, showConfirmButton: false });
      handleCloseEditModal();
      dispatch(fetchStockFlowStats());
    } catch (err) {
      MySwal.fire({ icon: "error", title: "Error", text: err || "Failed to update", timer: 3000 });
    }
  };

  const handleReceiveSubmit = async (e) => {
    e.preventDefault();
    if (!receiveData.receivedBy.trim())
      return MySwal.fire({ icon: "warning", title: "Validation", text: "Receiver name is required", timer: 2000 });
    if (!receiveData.deliveryPhoto)
      return MySwal.fire({ icon: "warning", title: "Photo Required", text: "Please capture a delivery photo", timer: 2000 });
    if (!receiveData.receivedQuantity || receiveData.receivedQuantity < 1)
      return MySwal.fire({ icon: "warning", title: "Validation", text: "Received quantity must be at least 1", timer: 2000 });

    const fd = new FormData();
    fd.append("received_by",       receiveData.receivedBy);
    fd.append("received_quantity",  receiveData.receivedQuantity);
    fd.append("receive_remarks",    receiveData.remarks);
    fd.append("delivery_photo",     receiveData.deliveryPhoto);

    try {
      await dispatch(receiveStockFlow({ id: currentFlow.id, data: fd })).unwrap();
      MySwal.fire({ icon: "success", title: "Received!", timer: 2000, showConfirmButton: false });
      handleCloseReceiveModal();
      dispatch(fetchStockFlows(filters));
      dispatch(fetchStockFlowStats());
    } catch (err) {
      MySwal.fire({ icon: "error", title: "Error", text: err || "Failed to receive", timer: 3000 });
    }
  };

  const handleDelete = (id) => {
    MySwal.fire({
      title: "Are you sure?", text: "You won't be able to revert this!",
      icon: "warning", showCancelButton: true,
      confirmButtonColor: "#d33", confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#3085d6",
    }).then(async ({ isConfirmed }) => {
      if (!isConfirmed) return;
      try {
        await dispatch(deleteStockFlow(id)).unwrap();
        MySwal.fire({ icon: "success", title: "Deleted!", timer: 2000, showConfirmButton: false });
        dispatch(fetchStockFlowStats());
      } catch (err) {
        MySwal.fire({ icon: "error", title: "Error", text: err || "Failed to delete", timer: 3000 });
      }
    });
  };

  const handleDownloadInvoice = async (id) => {
    try {
      const res  = await AuthService.downloadStockFlowInvoice(id);
      const url  = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = Object.assign(document.createElement("a"), { href: url, download: `stock-flow-invoice-${id}.pdf` });
      document.body.appendChild(link); link.click();
      document.body.removeChild(link); window.URL.revokeObjectURL(url);
    } catch {
      MySwal.fire({ icon: "error", title: "Error", text: "Failed to download invoice", timer: 2000 });
    }
  };

  // ─────────────────────────────────────────────────────────────
  //  Table columns
  // ─────────────────────────────────────────────────────────────

  const columns = [
    {
      title: "ID", dataIndex: "stock_id",
      render: (text, record) => (
        <Link to={`/stock-flow-details/${record.id}`} className="badge badge-primary text-decoration-none">#{text}</Link>
      ),
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "From", dataIndex: "from_warehouse_name",
      render: (text, record) => (
        <div className="d-flex align-items-center">
          <TrendingUp size={16} className="text-danger me-2" />
          {text || record.from_loc || "N/A"}
        </div>
      ),
    },
    {
      title: "To", dataIndex: "to_warehouse_name",
      render: (text, record) => (
        <div className="d-flex align-items-center">
          <TrendingDown size={16} className="text-success me-2" />
          {text || record.to_loc || "N/A"}
        </div>
      ),
    },
    {
      title: "Total Qty",
      render: (_, record) => (
        <div className="d-flex align-items-center">
          <Package size={16} className="text-primary me-2" />
          <span className="badge badge-info">{getTotalQty(record)}</span>
        </div>
      ),
    },
    {
      title: "Transport", dataIndex: "transport",
      render: (text) => {
        const opt = transportOptions.find((t) => t.value === text);
        const cls = { bus: "badge-secondary", courier: "badge-info", employee: "badge-warning" }[text] || "badge-primary";
        return <span className={`badge ${cls}`}>{opt ? opt.label : text}</span>;
      },
    },
    {
      title: "Status", dataIndex: "status",
      render: (text) => {
        const cls = { approved: "badge-linesuccess", "in-transit": "badge-linewarning", delivered: "badge-lineinfo" }[text] || "badge-secondary";
        return <span className={`badge ${cls}`}>{text}</span>;
      },
    },
    {
      title: "Created", dataIndex: "created_at",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Action",
      render: (_, record) => (
        <div className="edit-delete-action">
          <Link className="me-2 p-2" to="#" onClick={(e) => { e.preventDefault(); handleViewDetails(record.id); }} title="View">
            <Eye size={16} className="text-info" />
          </Link>
          {record.actions?.can_dispatch && (
            <Link className="me-2 p-2" to="#" onClick={(e) => { e.preventDefault(); handleDispatch(record.id); }} title="Dispatch">
              <Truck size={16} className="text-warning" />
            </Link>
          )}
          {record.actions?.can_receive && (
            <Link className="me-2 p-2" to="#" onClick={(e) => { e.preventDefault(); handleReceiveClick(record.id); }} title="Receive">
              <CheckCircle size={16} className="text-success" />
            </Link>
          )}
          <Link className="me-2 p-2" to="#" onClick={(e) => { e.preventDefault(); handleDownloadInvoice(record.id); }} title="Download">
            <Download size={16} className="text-primary" />
          </Link>
          {record.actions?.can_edit && (
            <Link className="me-2 p-2" to="#" onClick={(e) => { e.preventDefault(); handleEditClick(record.id); }} title="Edit">
              <Edit size={16} />
            </Link>
          )}
          {record.actions?.can_delete && (
            <Link className="p-2" to="#" onClick={(e) => { e.preventDefault(); handleDelete(record.id); }} title="Delete">
              <Trash2 size={16} />
            </Link>
          )}
        </div>
      ),
    },
  ];

  // ─────────────────────────────────────────────────────────────
  //  Early return — options loading
  // ─────────────────────────────────────────────────────────────

  if (optionsLoading) {
    return (
      <div className="page-wrapper"><div className="content d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" /><p>Loading options…</p>
        </div>
      </div></div>
    );
  }

  // ─────────────────────────────────────────────────────────────
  //  Render
  // ─────────────────────────────────────────────────────────────

  return (
    <div className="page-wrapper">
      <div className="content">

        <div className="page-header mb-3">
          <div className="add-item d-flex">
            <div className="page-title"><h4>Stock Flow Management</h4><h6>Manage your stock transfers</h6></div>
          </div>
          <TableHeaderActions
            onRefresh={() => { dispatch(fetchStockFlows(filters)); dispatch(fetchStockFlowStats()); }}
            pdfEndpoint="/auth/export/stockflows/pdf" excelEndpoint="/auth/export/stockflows/excel"
            filters={{ search: filters.search, status: filters.status, transport: filters.transport }}
            entityName="stock flows" dispatch={dispatch} headerState={headerData}
            headerAction={setToogleHeader} showPrint
          />
          <div className="page-btn">
            <button onClick={() => navigate("/add-stock-flow")} className="btn btn-added">
              <PlusCircle size={16} className="me-2" />Add Stock Flow
            </button>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="row">
          {[
            { label: "Total Transfers", value: stats.total    || 0, cls: "das1", icon: <Package /> },
            { label: "Approved",        value: stats.approved  || 0, cls: "das2", icon: <CheckCircle /> },
            { label: "In Transit",      value: stats.in_transit|| 0, cls: "das3", icon: <Truck /> },
            { label: "Delivered",       value: stats.delivered || 0, cls: "",     icon: <Package /> },
          ].map(({ label, value, cls, icon }) => (
            <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
              <div className={`dash-count ${cls} w-100`}>
                <div className="dash-counts"><h4>{value}</h4><h5>{label}</h5></div>
                <div className="dash-imgs">{icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input type="text" placeholder="Search by description or location"
                    className="form-control form-control-sm formsearch"
                    value={filters.search} onChange={handleSearch} />
                  <Link to="#" className="btn btn-searchset"><SearchIcon size={14} /></Link>
                </div>
              </div>
              <div className="search-path">
                <Link className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                  onClick={() => setIsFilterVisible((p) => !p)}>
                  <Filter size={16} className="filter-icon" />
                  <span><ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" /></span>
                </Link>
              </div>
              <div className="form-sort">
                <Sliders size={16} className="info-img" />
                <Select className="select" options={sortOptions} placeholder="Sort By"
                  onChange={handleSortChange}
                  value={sortOptions.find((o) => o.value === `${filters.sortBy}:${filters.sortOrder}`) || null}
                />
              </div>
            </div>

            {/* Filter panel */}
            <div className="card" id="filter_inputs" style={{ display: isFilterVisible ? "block" : "none" }}>
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>From Warehouse</label>
                      <Select className="select"
                        options={[{ value: "", label: "All Warehouses" }, ...warehouses]}
                        value={warehouses.find((w) => w.value === filters.from_wh) || { value: "", label: "All Warehouses" }}
                        onChange={(opt) => dispatch(setFlowFilters({ from_wh: opt?.value || "" }))}
                        isClearable />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>To Warehouse</label>
                      <Select className="select"
                        options={[{ value: "", label: "All Warehouses" }, ...allWarehouses]}
                        value={allWarehouses.find((w) => w.value === filters.to_wh) || { value: "", label: "All Warehouses" }}
                        onChange={(opt) => dispatch(setFlowFilters({ to_wh: opt?.value || "" }))}
                        isClearable />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>Transport</label>
                      <Select className="select" options={transportFilterOptions}
                        value={transportFilterOptions.find((t) => t.value === filters.transport) || { value: "", label: "All Transport" }}
                        onChange={(opt) => dispatch(setFlowFilters({ transport: opt?.value || "" }))}
                        isClearable />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <button className="btn btn-filters ms-auto w-100"
                        onClick={() => { dispatch(resetFlowFilters()); dispatch(fetchStockFlows({})); }}>
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-5"><div className="spinner-border" /></div>
              ) : stockFlows.length === 0 ? (
                <div className="text-center p-5"><p>No stock flows found</p></div>
              ) : (
                <Table
                  key={`${filters.page}-${filters.limit}`}
                  columns={columns} dataSource={stockFlows}
                  pagination={pagination} filters={filters}
                  onPaginationChange={handlePaginationChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Edit Stock Flow</Modal.Title>
          <button className="btn-close" onClick={handleCloseEditModal} disabled={mutating}><X size={16} /></button>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center p-4"><div className="spinner-border text-primary" /></div>
          ) : (
            <form onSubmit={handleEditSubmit}>
              {/* From */}
              <div className="row mb-3">
                <div className="col-12">
                  <h6>From Location</h6>
                  <div className="d-flex gap-3 mb-2">
                    {[true, false].map((isWh) => (
                      <div className="form-check" key={String(isWh)}>
                        <input className="form-check-input" type="radio" checked={fromIsWarehouse === isWh}
                          onChange={() => { setFromIsWarehouse(isWh); setFormData((p) => isWh ? { ...p, from_loc: "" } : { ...p, from_wh: null }); }} />
                        <label className="form-check-label">{isWh ? "Warehouse" : "Other Location"}</label>
                      </div>
                    ))}
                  </div>
                  {fromIsWarehouse
                    ? <Select options={warehouses} value={formData.from_wh} onChange={(o) => setFormData((p) => ({ ...p, from_wh: o }))} isClearable />
                    : <input className="form-control" value={formData.from_loc} onChange={(e) => setFormData((p) => ({ ...p, from_loc: e.target.value }))} placeholder="Location name" />
                  }
                </div>
              </div>
              {/* To */}
              <div className="row mb-3">
                <div className="col-12">
                  <h6>To Location</h6>
                  <div className="d-flex gap-3 mb-2">
                    {[true, false].map((isWh) => (
                      <div className="form-check" key={String(isWh)}>
                        <input className="form-check-input" type="radio" checked={toIsWarehouse === isWh}
                          onChange={() => { setToIsWarehouse(isWh); setFormData((p) => isWh ? { ...p, to_loc: "" } : { ...p, to_wh: null }); }} />
                        <label className="form-check-label">{isWh ? "Warehouse" : "Other Location"}</label>
                      </div>
                    ))}
                  </div>
                  {toIsWarehouse
                    ? <Select options={warehouses} value={formData.to_wh} onChange={(o) => setFormData((p) => ({ ...p, to_wh: o }))} isClearable />
                    : <input className="form-control" value={formData.to_loc} onChange={(e) => setFormData((p) => ({ ...p, to_loc: e.target.value }))} placeholder="Location name" />
                  }
                </div>
              </div>
              <div className="row">
                <div className="col-lg-4 mb-3">
                  <label className="form-label">Quantity <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={formData.quantity} min="1" required
                    onChange={(e) => setFormData((p) => ({ ...p, quantity: e.target.value }))} />
                </div>
                <div className="col-lg-4 mb-3">
                  <label className="form-label">Transport <span className="text-danger">*</span></label>
                  <Select options={transportOptions} value={formData.transport}
                    onChange={(o) => setFormData((p) => ({ ...p, transport: o }))} />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-cancel me-2" onClick={handleCloseEditModal} disabled={mutating}>Cancel</button>
                <button type="submit" className="btn btn-submit" disabled={mutating}>{mutating ? "Saving…" : "Save Changes"}</button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      {/* ── Receive Modal ── */}
      <Modal show={showReceiveModal} onHide={handleCloseReceiveModal} size="lg" centered>
        <Modal.Header>
          <Modal.Title>📦 Confirm Delivery</Modal.Title>
          <button className="btn-close" onClick={handleCloseReceiveModal} disabled={mutating} />
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleReceiveSubmit}>
            {currentFlow && (
              <div className="alert alert-info mb-4">
                <h6 className="mb-2">Stock Flow Details</h6>
                <p className="mb-1"><strong>From:</strong> {currentFlow.from_warehouse_name || currentFlow.from_loc}</p>
                <p className="mb-1"><strong>To:</strong>   {currentFlow.to_warehouse_name   || currentFlow.to_loc}</p>
                <p className="mb-0"><strong>Expected Qty:</strong> {getTotalQty(currentFlow)}</p>
              </div>
            )}

            {/* Camera */}
            <div className="mb-4">
              <label className="form-label"><Camera size={16} className="me-2" />Delivery Photo <span className="text-danger">*</span></label>
              {!capturedPhoto && !cameraActive && (
                <button type="button" className="btn btn-primary w-100" onClick={startCamera}>
                  <Camera size={16} className="me-2" />Open Camera
                </button>
              )}
              {cameraActive && (
                <div>
                  <video ref={videoRef} autoPlay playsInline style={{ width: "100%", maxHeight: 400, borderRadius: 8, background: "#000" }} />
                  <div className="mt-2 d-flex gap-2">
                    <button type="button" className="btn btn-success flex-grow-1" onClick={capturePhoto}><Camera size={16} className="me-2" />Capture</button>
                    <button type="button" className="btn btn-secondary" onClick={stopCamera}>Cancel</button>
                  </div>
                </div>
              )}
              {capturedPhoto && (
                <div>
                  <img src={capturedPhoto} alt="Delivery proof" style={{ width: "100%", maxHeight: 400, borderRadius: 8, objectFit: "contain" }} />
                  <button type="button" className="btn btn-warning w-100 mt-2" onClick={() => { setCapturedPhoto(null); startCamera(); }}>
                    <Camera size={16} className="me-2" />Retake
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            <div className="row">
              <div className="col-lg-6 mb-3">
                <label className="form-label">Received By <span className="text-danger">*</span></label>
                <input type="text" className="form-control" required
                  value={receiveData.receivedBy}
                  onChange={(e) => setReceiveData((p) => ({ ...p, receivedBy: e.target.value }))} />
              </div>
              <div className="col-lg-6 mb-3">
                <label className="form-label">Received Quantity <span className="text-danger">*</span></label>
                <input type="number" className="form-control" min="1" required
                  value={receiveData.receivedQuantity}
                  onChange={(e) => setReceiveData((p) => ({ ...p, receivedQuantity: e.target.value }))} />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Remarks (Optional)</label>
              <textarea className="form-control" rows="3" value={receiveData.remarks}
                onChange={(e) => setReceiveData((p) => ({ ...p, remarks: e.target.value }))} />
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-cancel me-2" onClick={handleCloseReceiveModal} disabled={mutating}>Cancel</button>
              <button type="submit" className="btn btn-success" disabled={mutating || !capturedPhoto}>
                {mutating ? "Processing…" : "✓ Confirm Delivery"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StockTransfer;



// ///temorary file upload for delivery confirmation

// import React, { useState, useEffect, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   Edit,
//   Filter,
//   PlusCircle,
//   Sliders,
//   Trash2,
//   Search as SearchIcon,
//   TrendingUp,
//   TrendingDown,
//   Package,
//   Download,
//   Camera,
//   Truck,
//   CheckCircle,
//   Eye,
//   X,
//   Upload,
// } from "feather-icons-react/build/IconComponents";
// import { Modal } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
// import AuthService from "../../services/authService.js";
// import Table from "../../core/pagination/datatable";
// import TableHeaderActions from "../tableheader";
// import {
//   fetchStockFlowOptions,
//   fetchStockFlows,
//   fetchStockFlowStats,
//   setFilters,
//   resetFilters,
//   updateStockFlow,
//   deleteStockFlow as deleteStockFlowAction,
//   clearError,
//   fetchStockFlowById,
// } from '../../core/redux/slices/stockSlice.js';

// const StockTransfer = () => {
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const MySwal = withReactContent(Swal);
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);

  
//   const {
//     stockFlows,
//     stats,
//     filters,
//     status: loadingStatus,
//     error,
//     options,
//     pagination,
//   } = useSelector((state) => state.stockFlow);

//   const transportOptions = options?.transport || [];
//   const statusOptionsForForm = options?.status || [];
//   const sortOptions = options?.sort || [];
//   const optionsLoading = options?.loading || false;

//   const loading = loadingStatus === "loading";
//   const data = useSelector((state) => state.toggle_header);

//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showReceiveModal, setShowReceiveModal] = useState(false);
//   const [editingStockFlow, setEditingStockFlow] = useState(null);
//   const [receivingStockFlow, setReceivingStockFlow] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [isFilterVisible, setIsFilterVisible] = useState(false);
//   const [warehouses, setWarehouses] = useState([]);
//   const [allWarehouses, setAllWarehouses] = useState([]);
//   const [fromIsWarehouse, setFromIsWarehouse] = useState(true);
//   const [toIsWarehouse, setToIsWarehouse] = useState(true);

//   // Photo capture state
//   const [cameraActive, setCameraActive] = useState(false);
//   const [capturedPhoto, setCapturedPhoto] = useState(null);
//   const [stream, setStream] = useState(null);

//   // Receive form state
//   const [receiveData, setReceiveData] = useState({
//     receivedBy: "",
//     receivedQuantity: "",
//     remarks: "",
//     deliveryPhoto: null,
//   });

//   // Form state for editing
//   const [formData, setFormData] = useState({
//     from_wh: null,
//     to_wh: null,
//     from_loc: "",
//     to_loc: "",
//     quantity: "",
//     transport: null,
//     status: { value: "approved", label: "Approved" },
//     description: "",
//   });

//   const transportFilterOptions = [
//     { value: "", label: "All Transport" },
//     ...transportOptions,
//   ];

//   const statusOptions = [
//     { value: "", label: "All Status" },
//     ...statusOptionsForForm,
//   ];

//   useEffect(() => {
//     dispatch(fetchStockFlows(filters));
//     dispatch(fetchStockFlowStats());
//     dispatch(fetchStockFlowOptions());
//     fetchWarehouses();
//     fetchAllWarehousesForDropdown();
//     // eslint-disable-next-line
//   }, []);

//   // Show error notifications
//   useEffect(() => {
//     if (error) {
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error,
//         timer: 3000,
//       });
//       dispatch(clearError());
//     }
//   }, [error, dispatch, MySwal]);

//   // Cleanup camera stream on unmount
//   useEffect(() => {
//     return () => {
//       if (stream) {
//         stream.getTracks().forEach(track => track.stop());
//       }
//     };
//   }, [stream]);

//   // Pagination changes
//   const handlePaginationChange = (paginationConfig) => {
//     dispatch(
//       setFilters({
//         page: paginationConfig.page,
//         limit: paginationConfig.limit,
//       }),
//     );
//   };

//   // Fetch warehouses
//   const fetchWarehouses = async () => {
//     try {
//       const response = await AuthService.getWarehouse();
//       setWarehouses(
//         (response.data.data || response.data || []).map((item) => ({
//           value: item.id,
//           label: item.name || item.title,
//         }))
//       );
//     } catch (error) {
//       console.error("Error fetching warehouses:", error);
//     }
//   };

   
//   const fetchAllWarehousesForDropdown = async () => {
//     try {
//       const response = await AuthService.getWarehouseDropdown();
//       const warehouseList = (response.data.data || response.data || []).map((item) => ({
//         value: item.id,
//         label: item.name || item.title,
//       }));
//       setAllWarehouses(warehouseList);
//     } catch (error) {
//       console.error("Error fetching all warehouses:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to load warehouses",
//         timer: 2000,
//       });
//     }
//   };

//   // Handle filter changes
//   const handleFilterChange = (name, value) => {
//     dispatch(setFilters({ [name]: value }));
//   };

//   // Debounced search
//   useEffect(() => {
//     const delayDebounceFn = setTimeout(() => {
//       dispatch(fetchStockFlows(filters));
//     }, 500);

//     return () => clearTimeout(delayDebounceFn);
//     // eslint-disable-next-line
//   }, [filters.search]);

//   // Fetch stock flows when other filters change
//   useEffect(() => {
//     dispatch(fetchStockFlows(filters));
//     // eslint-disable-next-line
//   }, [
//     filters.page,
//     filters.limit,
//     filters.status,
//     filters.transport,
//     filters.from_wh,
//     filters.to_wh,
//     filters.sortBy,
//     filters.sortOrder,
//   ]);

//   const handleSearch = (e) => {
//     const value = e.target.value;
//     dispatch(setFilters({ search: value }));
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       from_wh: null,
//       to_wh: null,
//       from_loc: "",
//       to_loc: "",
//       quantity: "",
//       transport: null,
//       status: statusOptionsForForm[0] || { value: "approved", label: "Approved" },
//       description: "",
//     });
//     setFromIsWarehouse(true);
//     setToIsWarehouse(true);
//   };

//   // Camera functions
//   const startCamera = async () => {
//     try {
//       const mediaStream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: "environment" },
//         audio: false,
//       });
      
//       if (videoRef.current) {
//         videoRef.current.srcObject = mediaStream;
//         setStream(mediaStream);
//         setCameraActive(true);
//       }
//     } catch (err) {
//       console.error("Error accessing camera:", err);
//       MySwal.fire({
//         icon: "error",
//         title: "Camera Error",
//         text: "Unable to access camera. Please check permissions.",
//         timer: 3000,
//       });
//     }
//   };

//   const capturePhoto = () => {
//     if (videoRef.current && canvasRef.current) {
//       const video = videoRef.current;
//       const canvas = canvasRef.current;
      
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
      
//       const context = canvas.getContext('2d');
//       context.drawImage(video, 0, 0);
      
//       canvas.toBlob((blob) => {
//         const file = new File([blob], `delivery-${Date.now()}.jpg`, { type: 'image/jpeg' });
//         setCapturedPhoto(URL.createObjectURL(blob));
//         setReceiveData(prev => ({ ...prev, deliveryPhoto: file }));
//         stopCamera();
//       }, 'image/jpeg', 0.95);
//     }
//   };

//   const stopCamera = () => {
//     if (stream) {
//       stream.getTracks().forEach(track => track.stop());
//       setStream(null);
//       setCameraActive(false);
//     }
//   };

//   const retakePhoto = () => {
//     setCapturedPhoto(null);
//     setReceiveData(prev => ({ ...prev, deliveryPhoto: null }));
//     startCamera();
//   };

//   // NEW: Handle file upload
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
    
//     if (!file) return;

//     // Validate file type
//     const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
//     if (!allowedTypes.includes(file.type)) {
//       MySwal.fire({
//         icon: "error",
//         title: "Invalid File Type",
//         text: "Please upload a JPG or PNG image",
//         timer: 3000,
//       });
//       e.target.value = ''; // Reset input
//       return;
//     }

//     // Validate file size (5MB max)
//     const maxSize = 5 * 1024 * 1024; // 5MB in bytes
//     if (file.size > maxSize) {
//       MySwal.fire({
//         icon: "error",
//         title: "File Too Large",
//         text: "Image must be less than 5MB",
//         timer: 3000,
//       });
//       e.target.value = ''; // Reset input
//       return;
//     }

//     // Create preview and set file
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setCapturedPhoto(reader.result);
//       setReceiveData(prev => ({ ...prev, deliveryPhoto: file }));
//       stopCamera(); // Stop camera if it was active
//     };
//     reader.readAsDataURL(file);
    
//     // Reset input for future uploads
//     e.target.value = '';
//   };

//   // Navigate to Add Stock Flow page
//   const handleAddClick = () => {
//     navigate("/add-stock-flow");
//   };

//   const handleViewDetails = (id) => {
//     navigate(`/stock-flow-details/${id}`);
//   };

//   const handleEditClick = async (id) => {
//     try {
//       const stockFlowData = await dispatch(fetchStockFlowById(id)).unwrap();

//       const selectedFromWh = warehouses.find(
//         (w) => w.value === stockFlowData.from_wh
//       );
//       const selectedToWh = warehouses.find((w) => w.value === stockFlowData.to_wh);
//       const selectedTransport = transportOptions.find(
//         (t) => t.value === stockFlowData.transport
//       );
//       const selectedStatus = statusOptionsForForm.find(
//         (s) => s.value === stockFlowData.status
//       );

//       setEditingStockFlow(stockFlowData);
      
//       setFromIsWarehouse(!!stockFlowData.from_wh);
//       setToIsWarehouse(!!stockFlowData.to_wh);

//       setFormData({
//         from_wh: selectedFromWh || null,
//         to_wh: selectedToWh || null,
//         from_loc: stockFlowData.from_loc || "",
//         to_loc: stockFlowData.to_loc || "",
//         quantity: stockFlowData.quantity || "",
//         transport: selectedTransport || null,
//         status: selectedStatus || null,
//         description: stockFlowData.description || "",
//       });

//       setShowEditModal(true);
//     } catch (error) {
//       console.error("Error fetching stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to load stock flow details",
//         timer: 2000,
//       });
//     }
//   };

//   const handleCloseEditModal = () => {
//     setShowEditModal(false);
//     setEditingStockFlow(null);
//     resetForm();
//   };

//   // Handle Dispatch
//   const handleDispatch = async (id) => {
//     MySwal.fire({
//       title: "Dispatch Stock Flow?",
//       text: "This will mark the stock as in-transit",
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonColor: "#3085d6",
//       confirmButtonText: "Yes, Dispatch!",
//       cancelButtonColor: "#d33",
//       cancelButtonText: "Cancel",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await dispatch(
//             updateStockFlow({ 
//               id, 
//               data: { status: "in-transit" } 
//             })
//           ).unwrap();

//           MySwal.fire({
//             icon: "success",
//             title: "Dispatched!",
//             text: "Stock flow has been dispatched",
//             timer: 2000,
//             showConfirmButton: false,
//           });

//           dispatch(fetchStockFlows(filters));
//           dispatch(fetchStockFlowStats());
//         } catch (error) {
//           console.error("Error dispatching:", error);
//           MySwal.fire({
//             icon: "error",
//             title: "Error",
//             text: error || "Failed to dispatch stock flow",
//             timer: 3000,
//           });
//         }
//       }
//     });
//   };

//   // Handle Receive - Open Modal
//   const handleReceiveClick = async (id) => {
//     try {
//       const stockFlowData = await dispatch(fetchStockFlowById(id)).unwrap();
//       setReceivingStockFlow(stockFlowData);
//       setReceiveData({
//         receivedBy: "",
//         receivedQuantity: stockFlowData.quantity,
//         remarks: "",
//         deliveryPhoto: null,
//       });
//       setCapturedPhoto(null);
//       setShowReceiveModal(true);
//     } catch (error) {
//       console.error("Error fetching stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to load stock flow details",
//         timer: 2000,
//       });
//     }
//   };

//   // Close Receive Modal
//   const handleCloseReceiveModal = () => {
//     setShowReceiveModal(false);
//     setReceivingStockFlow(null);
//     setReceiveData({
//       receivedBy: "",
//       receivedQuantity: "",
//       remarks: "",
//       deliveryPhoto: null,
//     });
//     setCapturedPhoto(null);
//     stopCamera();
//   };

//   // Submit Receive Confirmation
//   const handleReceiveSubmit = async (e) => {
//     e.preventDefault();

//     if (!receiveData.receivedBy.trim()) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Validation Error",
//         text: "Receiver name is required",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!receiveData.deliveryPhoto) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Photo Required",
//         text: "Please capture or upload a delivery photo",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!receiveData.receivedQuantity || receiveData.receivedQuantity < 1) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Validation Error",
//         text: "Received quantity must be at least 1",
//         timer: 2000,
//       });
//       return;
//     }

//     try {
//       setSubmitting(true);

//       const formDataToSend = new FormData();
//       formDataToSend.append('status', 'delivered');
//       formDataToSend.append('received_by', receiveData.receivedBy);
//       formDataToSend.append('received_quantity', receiveData.receivedQuantity);
//       formDataToSend.append('receive_remarks', receiveData.remarks);
//       formDataToSend.append('delivery_photo', receiveData.deliveryPhoto);

//       await AuthService.receiveStockFlow(receivingStockFlow.id, formDataToSend);

//       MySwal.fire({
//         icon: "success",
//         title: "Received!",
//         text: "Stock flow marked as delivered",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       handleCloseReceiveModal();
//       dispatch(fetchStockFlows(filters));
//       dispatch(fetchStockFlowStats());

//     } catch (error) {
//       console.error("Error receiving stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Failed to receive stock flow",
//         timer: 3000,
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // Handle Input Changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

  
//   const handleDownloadInvoice = async (id) => {
//     try {
//       const response = await AuthService.downloadStockFlowInvoice(id);
//       const blob = new Blob([response.data], { type: 'application/pdf' });
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = `stock-flow-invoice-${id}.pdf`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error("Error downloading invoice:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: "Failed to download invoice",
//         timer: 2000,
//       });
//     }
//   };

//   const handleEditSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       setSubmitting(true);

//       const dataToSubmit = {
//         from_wh: fromIsWarehouse ? formData.from_wh?.value || null : null,
//         to_wh: toIsWarehouse ? formData.to_wh?.value || null : null,
//         from_loc: !fromIsWarehouse ? formData.from_loc : null,
//         to_loc: !toIsWarehouse ? formData.to_loc : null,
//         quantity: parseInt(formData.quantity),
//         transport: formData.transport.value,
//         status: formData.status.value,
//         description: formData.description,
//       };

//       await dispatch(
//         updateStockFlow({ id: editingStockFlow.id, data: dataToSubmit })
//       ).unwrap();

//       MySwal.fire({
//         icon: "success",
//         title: "Success!",
//         text: "Stock flow updated successfully",
//         timer: 2000,
//         showConfirmButton: false,
//       });

//       handleCloseEditModal();
//       dispatch(fetchStockFlows(filters));
//       dispatch(fetchStockFlowStats());
      
//     } catch (error) {
//       console.error("Error updating stock flow:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error || "Failed to update stock flow",
//         timer: 3000,
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleDelete = async (id) => {
//     MySwal.fire({
//       title: "Are you sure?",
//       text: "You won't be able to revert this!",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonColor: "#3085d6",
//       cancelButtonText: "Cancel",
//     }).then(async (result) => {
//       if (result.isConfirmed) {
//         try {
//           await dispatch(deleteStockFlowAction(id)).unwrap();
//           MySwal.fire({
//             icon: "success",
//             title: "Deleted!",
//             text: "Stock flow has been deleted.",
//             timer: 2000,
//             showConfirmButton: false,
//           });
//           dispatch(fetchStockFlows(filters));
//           dispatch(fetchStockFlowStats());
//         } catch (error) {
//           console.error("Error deleting stock flow:", error);
//           MySwal.fire({
//             icon: "error",
//             title: "Error",
//             text: error || "Failed to delete stock flow",
//             timer: 3000,
//           });
//         }
//       }
//     });
//   };

//   const handleSortChange = (option) => {
//     const [sortBy, sortOrder] = option.value.split(":");
//     dispatch(setFilters({ sortBy, sortOrder }));
//   };

//   const toggleFilterVisibility = () => {
//     setIsFilterVisible((prev) => !prev);
//   };

//   const resetFiltersHandler = () => {
//     dispatch(resetFilters());
//     dispatch(fetchStockFlows(filters));
//   };

//   const columns = [
//     {
//       title: "ID",
//       dataIndex: "id",
//       render: (text, record) => (
//         <Link 
//           to={`/stock-flow-details/${record.id}`}
//           className="badge badge-primary text-decoration-none"
//         >
//           #{text}
//         </Link>
//       ),
//       sorter: (a, b) => a.id - b.id,
//     },
//     {
//       title: "From",
//       dataIndex: "from_warehouse_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center">
//           <TrendingUp size={16} className="text-danger me-2" />
//           {text || record.from_loc || "N/A"}
//         </div>
//       ),
//       sorter: (a, b) =>
//         (a.from_warehouse_name || a.from_loc || "").localeCompare(
//           b.from_warehouse_name || b.from_loc || ""
//         ),
//     },
//     {
//       title: "To",
//       dataIndex: "to_warehouse_name",
//       render: (text, record) => (
//         <div className="d-flex align-items-center">
//           <TrendingDown size={16} className="text-success me-2" />
//           {text || record.to_loc || "N/A"}
//         </div>
//       ),
//       sorter: (a, b) =>
//         (a.to_warehouse_name || a.to_loc || "").localeCompare(
//           b.to_warehouse_name || b.to_loc || ""
//         ),
//     },
//     {
//       title: "Quantity",
//       dataIndex: "quantity",
//       render: (text) => (
//         <div className="d-flex align-items-center">
//           <Package size={16} className="text-primary me-2" />
//           <span className="badge badge-info">{text}</span>
//         </div>
//       ),
//       sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
//     },
//     {
//       title: "Transport",
//       dataIndex: "transport",
//       render: (text) => {
//         const transportOption = transportOptions.find(t => t.value === text);
//         return (
//           <span
//             className={`badge ${
//               text === "bus"
//                 ? "badge-secondary"
//                 : text === "courier"
//                 ? "badge-info"
//                 : text === "employee"
//                 ? "badge-warning"
//                 : "badge-primary"
//             }`}
//           >
//             {transportOption ? transportOption.label : text}
//           </span>
//         );
//       },
//       sorter: (a, b) => (a.transport || "").localeCompare(b.transport || ""),
//     },
//     {
//       title: "Status",
//       dataIndex: "status",
//       render: (text) => {
//         const statusOption = statusOptionsForForm.find(s => s.value === text);
        
//         return (
//           <span
//             className={`badge ${
//               text === "approved"
//                 ? "badge-linesuccess"
//                 : text === "in-transit"
//                 ? "badge-linewarning"
//                 : text === "delivered"
//                 ? "badge-lineinfo"
//                 : "badge-secondary"
//             }`}
//           >
//             {statusOption ? statusOption.label : text || "N/A"}
//           </span>
//         );
//       },
//       sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
//     },
//     {
//       title: "Created Date",
//       dataIndex: "created_at",
//       render: (text) => new Date(text).toLocaleDateString(),
//       sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
//     },
//     {
//       title: "Action",
//       dataIndex: "actions",
//       render: (_, record) => (
//         <td className="action-table-data">
//           <div className="edit-delete-action">
//             {/* VIEW Details */}
//             <Link
//               className="me-2 p-2"
//               to="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleViewDetails(record.id);
//               }}
//               title="View Details"
//             >
//               <Eye className="feather-eye text-info" />
//             </Link>

//             {/* DISPATCH button - only if approved */}
//             {record.status === "approved" && (
//               <Link
//                 className="me-2 p-2"
//                 to="#"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleDispatch(record.id);
//                 }}
//                 title="Dispatch"
//               >
//                 <Truck className="feather-truck text-warning" />
//               </Link>
//             )}

//             {/* RECEIVE button - only if in-transit */}
//             {record.status === "in-transit" && (
//               <Link
//                 className="me-2 p-2"
//                 to="#"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleReceiveClick(record.id);
//                 }}
//                 title="Receive & Confirm Delivery"
//               >
//                 <CheckCircle className="feather-check-circle text-success" />
//               </Link>
//             )}

//             {/* Download Invoice */}
//             <Link
//               className="me-2 p-2"
//               to="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleDownloadInvoice(record.id);
//               }}
//               title="Download Invoice"
//             >
//               <Download className="feather-download text-primary" />
//             </Link>

//             {/* Edit - disabled for delivered items */}
//             {record.status !== "delivered" && (
//               <Link
//                 className="me-2 p-2"
//                 to="#"
//                 onClick={(e) => {
//                   e.preventDefault();
//                   handleEditClick(record.id);
//                 }}
//                 title="Edit"
//               >
//                 <Edit className="feather-edit" />
//               </Link>
//             )}

//             {/* Delete */}
//             <Link
//               className="confirm-text p-2"
//               to="#"
//               onClick={(e) => {
//                 e.preventDefault();
//                 handleDelete(record.id);
//               }}
//               title="Delete"
//             >
//               <Trash2 className="feather-trash-2" />
//             </Link>
//           </div>
//         </td>
//       ),
//     },
//   ];

//   if (optionsLoading) {
//     return (
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
//             <div className="text-center">
//               <div className="spinner-border text-primary mb-3" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p>Loading options...</p>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header mb-3">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Stock Flow Management</h4>
//               <h6>Manage your stock transfers</h6>
//             </div>
//           </div>

//           <TableHeaderActions
//             onRefresh={() => {
//               dispatch(fetchStockFlows(filters));
//               dispatch(fetchStockFlowStats());
//             }}
//             pdfEndpoint="/auth/export/stockflows/pdf"
//             excelEndpoint="/auth/export/stockflows/excel"
//             filters={{
//               search: filters.search,
//               status: filters.status,
//               transport: filters.transport,
//             }}
//             entityName="stock flows"
//             dispatch={dispatch}
//             headerState={data}
//             headerAction={setToogleHeader}
//             showPrint={true}
//           />

//           <div className="page-btn">
//             <button onClick={handleAddClick} className="btn btn-added">
//               <PlusCircle className="me-2 iconsize" />
//               Add Stock Flow
//             </button>
//           </div>
//         </div>

//         <div className="row">
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das1 w-100">
//               <div className="dash-counts">
//                 <h4>{stats.total || 0}</h4>
//                 <h5>Total Transfers</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Package />
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das2">
//               <div className="dash-counts">
//                 <h4>{stats.approved || 0}</h4>
//                 <h5>Approved</h5>
//               </div>
//               <div className="dash-imgs">
//                 <i data-feather="check-circle" className="feather-check-circle" />
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das3 w-100">
//               <div className="dash-counts">
//                 <h4>{stats.in_transit || 0}</h4>
//                 <h5>In Transit</h5>
//               </div>
//               <div className="dash-imgs">
//                 <i data-feather="truck" className="feather-truck" />
//               </div>
//             </div>
//           </div>
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count">
//               <div className="dash-counts">
//                 <h4>{stats.delivered || 0}</h4>
//                 <h5>Delivered</h5>
//               </div>
//               <div className="dash-imgs">
//                 <i data-feather="check-square" className="feather-check-square" />
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="card table-list-card">
//           <div className="card-body">
//             <div className="table-top">
//               <div className="search-set">
//                 <div className="search-input">
//                   <input
//                     type="text"
//                     placeholder="Search by description or location"
//                     className="form-control form-control-sm formsearch"
//                     value={filters.search}
//                     onChange={handleSearch}
//                   />
//                   <Link to="#" className="btn btn-searchset">
//                     <SearchIcon className="feather-search" />
//                   </Link>
//                 </div>
//               </div>
//               <div className="search-path">
//                 <Link
//                   className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
//                 >
//                   <Filter
//                     className="filter-icon"
//                     onClick={toggleFilterVisibility}
//                   />
//                   <span onClick={toggleFilterVisibility}>
//                     <ImageWithBasePath
//                       src="assets/img/icons/closes.svg"
//                       alt="img"
//                     />
//                   </span>
//                 </Link>
//               </div>
//               <div className="form-sort">
//                 <Sliders className="info-img" />
//                 <Select
//                   className="select"
//                   options={sortOptions}
//                   placeholder="Sort By"
//                   onChange={handleSortChange}
//                   value={sortOptions.find(
//                     (opt) =>
//                       opt.value === `${filters.sortBy}:${filters.sortOrder}`
//                   )}
//                 />
//               </div>
//             </div>

//             {/* Filter Section */}
//             <div
//               className={`card${isFilterVisible ? " visible" : ""}`}
//               id="filter_inputs"
//               style={{ display: isFilterVisible ? "block" : "none" }}
//             >
//               <div className="card-body pb-0">
//                 <div className="row">
//                   <div className="col-lg-3 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>From Warehouse</label>
//                       <Select
//                         className="select"
//                         options={[
//                           { value: "", label: "All Warehouses" },
//                           ...warehouses,
//                         ]}
//                         placeholder="Choose Warehouse"
//                         onChange={(option) =>
//                           handleFilterChange("from_wh", option?.value || "")
//                         }
//                         value={
//                           warehouses.find((w) => w.value === filters.from_wh) || {
//                             value: "",
//                             label: "All Warehouses",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-3 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>To Warehouse</label>
//                       <Select
//                         className="select"
//                         options={[
//                           { value: "", label: "All Warehouses" },
//                           ...allWarehouses,
//                         ]}
//                         placeholder="Choose Warehouse"
//                         onChange={(option) =>
//                           handleFilterChange("to_wh", option?.value || "")
//                         }
//                         value={
//                           allWarehouses.find((w) => w.value === filters.to_wh) || {
//                             value: "",
//                             label: "All Warehouses",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-2 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>Transport</label>
//                       <Select
//                         className="select"
//                         options={transportFilterOptions}
//                         placeholder="Transport"
//                         onChange={(option) =>
//                           handleFilterChange("transport", option?.value || "")
//                         }
//                         value={
//                           transportFilterOptions.find(
//                             (t) => t.value === filters.transport
//                           ) || {
//                             value: "",
//                             label: "All Transport",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-2 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <label>Status</label>
//                       <Select
//                         className="select"
//                         options={statusOptions}
//                         placeholder="Status"
//                         onChange={(option) =>
//                           handleFilterChange("status", option?.value || "")
//                         }
//                         value={
//                           statusOptions.find((s) => s.value === filters.status) || {
//                             value: "",
//                             label: "All Status",
//                           }
//                         }
//                         isClearable
//                       />
//                     </div>
//                   </div>
//                   <div className="col-lg-2 col-sm-6 col-12">
//                     <div className="input-blocks">
//                       <a
//                         className="btn btn-filters ms-auto w-100"
//                         onClick={resetFiltersHandler}
//                       >
//                         Reset Filters
//                       </a>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Stock Flows Table */}
//             <div className="table-responsive">
//               {loading ? (
//                 <div className="text-center p-5">
//                   <div className="spinner-border" role="status">
//                     <span className="visually-hidden">Loading...</span>
//                   </div>
//                 </div>
//               ) : stockFlows.length === 0 ? (
//                 <div className="text-center p-5">
//                   <p>No stock flows found</p>
//                 </div>
//               ) : (
//                 <Table 
//                   key={`${filters.page}-${filters.limit}`}
//                   columns={columns} 
//                   dataSource={stockFlows} 
//                   pagination={pagination}
//                   filters={filters}
//                   onPaginationChange={handlePaginationChange}
//                 />
//               )}
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Edit Modal - keeping the same */}
//       <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
//         {/* ... Edit modal content remains the same ... */}
//       </Modal>

//       {/* Receive Modal - UPDATED WITH FILE UPLOAD */}
//       <Modal show={showReceiveModal} onHide={handleCloseReceiveModal} size="lg" centered>
//         <Modal.Header>
//           <Modal.Title>📦 Confirm Delivery</Modal.Title>
//           <button
//             type="button"
//             className="btn-close"
//             onClick={handleCloseReceiveModal}
//             disabled={submitting}
//           />
//         </Modal.Header>
//         <Modal.Body>
//           <form onSubmit={handleReceiveSubmit}>
//             {/* Stock Flow Details */}
//             {receivingStockFlow && (
//               <div className="alert alert-info mb-4">
//                 <h6 className="mb-2">Stock Flow Details</h6>
//                 <p className="mb-1">
//                   <strong>From:</strong> {receivingStockFlow.from_warehouse_name || receivingStockFlow.from_loc}
//                 </p>
//                 <p className="mb-1">
//                   <strong>To:</strong> {receivingStockFlow.to_warehouse_name || receivingStockFlow.to_loc}
//                 </p>
//                 <p className="mb-0">
//                   <strong>Expected Quantity:</strong> {receivingStockFlow.quantity}
//                 </p>
//               </div>
//             )}

//             {/* Photo Capture/Upload Section - UPDATED */}
//             <div className="row mb-4">
//               <div className="col-12">
//                 <label className="form-label">
//                   <Camera size={16} className="me-2" />
//                   Delivery Photo <span className="text-danger">*</span>
//                 </label>
                
//                 {!capturedPhoto && !cameraActive && (
//                   <div className="d-flex gap-2 mb-3">
//                     <button
//                       type="button"
//                       className="btn btn-primary flex-grow-1"
//                       onClick={startCamera}
//                     >
//                       <Camera size={18} className="me-2" />
//                       Open Camera
//                     </button>
//                     <label className="btn btn-outline-primary flex-grow-1 mb-0" style={{ cursor: 'pointer' }}>
//                       <Upload size={18} className="me-2" />
//                       Upload Photo
//                       <input
//                         type="file"
//                         accept="image/jpeg,image/jpg,image/png"
//                         onChange={handleFileUpload}
//                         style={{ display: 'none' }}
//                       />
//                     </label>
//                   </div>
//                 )}

//                 {cameraActive && (
//                   <div className="camera-container">
//                     <video
//                       ref={videoRef}
//                       autoPlay
//                       playsInline
//                       style={{
//                         width: '100%',
//                         maxHeight: '400px',
//                         borderRadius: '8px',
//                         backgroundColor: '#000'
//                       }}
//                     />
//                     <div className="mt-3 d-flex gap-2">
//                       <button
//                         type="button"
//                         className="btn btn-success flex-grow-1"
//                         onClick={capturePhoto}
//                       >
//                         <Camera size={18} className="me-2" />
//                         Capture Photo
//                       </button>
//                       <button
//                         type="button"
//                         className="btn btn-secondary"
//                         onClick={stopCamera}
//                       >
//                         Cancel
//                       </button>
//                     </div>
//                   </div>
//                 )}

//                 {capturedPhoto && (
//                   <div className="captured-photo-container">
//                     <img
//                       src={capturedPhoto}
//                       alt="Delivery proof"
//                       style={{
//                         width: '100%',
//                         maxHeight: '400px',
//                         borderRadius: '8px',
//                         objectFit: 'contain',
//                         border: '1px solid #ddd'
//                       }}
//                     />
//                     <div className="d-flex gap-2 mt-3">
//                       <button
//                         type="button"
//                         className="btn btn-warning flex-grow-1"
//                         onClick={retakePhoto}
//                       >
//                         <Camera size={18} className="me-2" />
//                         Retake Photo
//                       </button>
//                       <label className="btn btn-outline-primary flex-grow-1 mb-0" style={{ cursor: 'pointer' }}>
//                         <Upload size={18} className="me-2" />
//                         Upload Different
//                         <input
//                           type="file"
//                           accept="image/jpeg,image/jpg,image/png"
//                           onChange={handleFileUpload}
//                           style={{ display: 'none' }}
//                         />
//                       </label>
//                     </div>
//                   </div>
//                 )}

//                 <canvas ref={canvasRef} style={{ display: 'none' }} />
//                 <small className="text-muted d-block mt-2">
//                   📷 Capture with camera or 📁 upload from device • Supported formats: JPG, PNG (Max: 5MB)
//                 </small>
//               </div>
//             </div>

//             {/* Receiver Details */}
//             <div className="row">
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Received By <span className="text-danger">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     value={receiveData.receivedBy}
//                     onChange={(e) => setReceiveData(prev => ({ ...prev, receivedBy: e.target.value }))}
//                     placeholder="Enter receiver name"
//                     required
//                   />
//                 </div>
//               </div>
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Received Quantity <span className="text-danger">*</span>
//                   </label>
//                   <input
//                     type="number"
//                     className="form-control"
//                     value={receiveData.receivedQuantity}
//                     onChange={(e) => setReceiveData(prev => ({ ...prev, receivedQuantity: e.target.value }))}
//                     placeholder="Enter quantity"
//                     min="1"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-12">
//                 <div className="mb-3">
//                   <label className="form-label">Remarks (Optional)</label>
//                   <textarea
//                     className="form-control"
//                     value={receiveData.remarks}
//                     onChange={(e) => setReceiveData(prev => ({ ...prev, remarks: e.target.value }))}
//                     rows="3"
//                     placeholder="Any additional notes..."
//                   />
//                 </div>
//               </div>
//             </div>

//             <div className="modal-footer">
//               <button
//                 type="button"
//                 className="btn btn-cancel me-2"
//                 onClick={handleCloseReceiveModal}
//                 disabled={submitting}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="btn btn-success"
//                 disabled={submitting || !capturedPhoto}
//               >
//                 {submitting ? "Processing..." : "✓ Confirm Delivery"}
//               </button>
//             </div>
//           </form>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default StockTransfer;
