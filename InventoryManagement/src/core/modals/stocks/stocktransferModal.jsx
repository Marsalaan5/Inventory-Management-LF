// import React from "react";
// import Select from "react-select";
// import ImageWithBasePath from "../../img/imagewithbasebath";
// import { Link } from "react-router-dom";

// const StockTransferModal = () => {
//   const optionsChoose = [
//     { value: "choose", label: "Choose" },
//     { value: "lobarHandy", label: "Lobar Handy" },
//     { value: "quaintWarehouse", label: "Quaint Warehouse" },
//   ];

//   const optionsSelosyLogerro = [
//     { value: "choose", label: "Choose" },
//     { value: "selosy", label: "Selosy" },
//     { value: "logerro", label: "Logerro" },
//   ];

//   const optionsStore1Store2 = [
//     { value: "choose", label: "Choose" },
//     { value: "store1", label: "Store 1" },
//     { value: "store2", label: "Store 2" },
//   ];

//   const optionsSentPending = [
//     { value: "choose", label: "Choose" },
//     { value: "sent", label: "Sent" },
//     { value: "pending", label: "Pending" },
//   ];
//   return (
//     <div>
//       {/* Add Stock */}
//       <div className="modal fade" id="add-units">
//         <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header border-0 custom-modal-header">
//                   <div className="page-title">
//                     <h4>Add Transfer</h4>
//                   </div>
//                   <button
//                     type="button"
//                     className="close"
//                     data-bs-dismiss="modal"
//                     aria-label="Close"
//                   >
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body custom-modal-body">
//                   <form>
//                     <div className="row">
//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>Warehouse From</label>
//                           <Select className="select" options={optionsChoose} />
//                         </div>
//                       </div>
//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>Warehouse To</label>
//                           <Select
//                             className="select"
//                             options={optionsSelosyLogerro}
//                           />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="input-blocks">
//                           <label>Responsible Person</label>
//                           <input type="text" className="form-control" />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="input-blocks search-form mb-3">
//                           <label>Product</label>
//                           <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Select Product"
//                           />
//                           <i
//                             data-feather="search"
//                             className="feather-search custom-search"
//                           />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="input-blocks search-form mb-0">
//                           <label>Notes</label>
//                           <textarea
//                             className="form-control"
//                             defaultValue={""}
//                           />
//                         </div>
//                       </div>
//                     </div>
//                     <div className="modal-footer-btn">
//                       <button
//                         type="button"
//                         className="btn btn-cancel me-2"
//                         data-bs-dismiss="modal"
//                       >
//                         Cancel
//                       </button>
//                       <button type="submit" className="btn btn-submit">
//                         Create
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Add Stock */}
//       {/* Edit Stock */}
//       <div className="modal fade" id="edit-units">
//         <div className="modal-dialog modal-dialog-centered stock-adjust-modal">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header border-0 custom-modal-header">
//                   <div className="page-title">
//                     <h4>Edit Transfer</h4>
//                   </div>
//                   <button
//                     type="button"
//                     className="close"
//                     data-bs-dismiss="modal"
//                     aria-label="Close"
//                   >
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body custom-modal-body">
//                   <form>
//                     <div className="input-blocks search-form">
//                       <label>Product</label>
//                       <input
//                         type="text"
//                         className="form-control"
//                         defaultValue="Nike Jordan"
//                       />
//                       <i
//                         data-feather="search"
//                         className="feather-search custom-search"
//                       />
//                     </div>
//                     <div className="row">
//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>Warehouse From</label>
//                           <Select className="select" options={optionsChoose} />
//                         </div>
//                       </div>
//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>Warehouse To</label>
//                           <Select
//                             className="select"
//                             options={optionsSelosyLogerro}
//                           />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="input-blocks">
//                           <label>Reference No</label>
//                           <input
//                             type="text"
//                             className="form-control"
//                             defaultValue={32434545}
//                           />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="input-blocks search-form mb-3">
//                           <label>Product</label>
//                           <input
//                             type="text"
//                             className="form-control"
//                             placeholder="Select Product"
//                             defaultValue="Nike Jordan"
//                           />
//                           <i
//                             data-feather="search"
//                             className="feather-search custom-search"
//                           />
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="modal-body-table">
//                           <div className="table-responsive">
//                             <table className="table  datanew">
//                               <thead>
//                                 <tr>
//                                   <th>Product</th>
//                                   <th>SKU</th>
//                                   <th>Category</th>
//                                   <th>Qty</th>
//                                   <th className="no-sort">Action</th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 <tr>
//                                   <td>
//                                     <div className="productimgname">
//                                       <Link
//                                         to="#"
//                                         className="product-img stock-img"
//                                       >
//                                         <ImageWithBasePath
//                                           src="assets/img/products/stock-img-02.png"
//                                           alt="product"
//                                         />
//                                       </Link>
//                                       <Link to="#">Nike Jordan</Link>
//                                     </div>
//                                   </td>
//                                   <td>PT002</td>
//                                   <td>Nike</td>
//                                   <td>
//                                     <div className="product-quantity">
//                                       <span className="quantity-btn">
//                                         <i
//                                           data-feather="minus-circle"
//                                           className="feather-search"
//                                         />
//                                       </span>
//                                       <input
//                                         type="text"
//                                         className="quntity-input"
//                                         defaultValue={2}
//                                       />
//                                       <span className="quantity-btn">
//                                         +
//                                         <i
//                                           data-feather="plus-circle"
//                                           className="plus-circle"
//                                         />
//                                       </span>
//                                     </div>
//                                   </td>
//                                   <td className="action-table-data">
//                                     <div className="edit-delete-action">
//                                       <Link
//                                         className="me-2 p-2"
//                                         to="#"
//                                         data-bs-toggle="modal"
//                                         data-bs-target="#edit-units"
//                                       >
//                                         <i
//                                           data-feather="edit"
//                                           className="feather-edit"
//                                         />
//                                       </Link>
//                                       <Link className="confirm-text p-2" to="#">
//                                         <i
//                                           data-feather="trash-2"
//                                           className="feather-trash-2"
//                                         />
//                                       </Link>
//                                     </div>
//                                   </td>
//                                 </tr>
//                               </tbody>
//                             </table>
//                           </div>
//                         </div>
//                       </div>
//                       <div className="col-lg-12">
//                         <div className="input-blocks search-form mb-0">
//                           <label>Notes</label>
//                           <textarea
//                             className="form-control"
//                             defaultValue={
//                               "The Jordan brand is owned by Nike (owned by the Knight family), as, at the time, the company was building its strategy to work with athletes to launch shows that could inspire consumers.Although Jordan preferred Converse and Adidas, they simply could not match the offer Nike made. "
//                             }
//                           />
//                         </div>
//                       </div>
//                     </div>
//                     <div className="modal-footer-btn">
//                       <button
//                         type="button"
//                         className="btn btn-cancel me-2"
//                         data-bs-dismiss="modal"
//                       >
//                         Cancel
//                       </button>
//                       <button type="submit" className="btn btn-submit">
//                         Save Changes
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Edit Stock */}
//       {/* Import Transfer */}
//       <div className="modal fade" id="view-notes">
//         <div className="modal-dialog modal-dialog-centered">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header border-0 custom-modal-header">
//                   <div className="page-title">
//                     <h4>Import Transfer</h4>
//                   </div>
//                   <button
//                     type="button"
//                     className="close"
//                     data-bs-dismiss="modal"
//                     aria-label="Close"
//                   >
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//               </div>
//               <div className="modal-body custom-modal-body">
//                 <form>
//                   <div className="row">
//                     <div className="col-lg-4 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>From</label>
//                         <Select
//                           className="select"
//                           options={optionsStore1Store2}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-lg-4 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>To</label>
//                         <Select
//                           className="select"
//                           options={optionsStore1Store2}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-lg-4 col-sm-6 col-12">
//                       <div className="input-blocks">
//                         <label>Satus</label>
//                         <Select
//                           className="select"
//                           options={optionsSentPending}
//                         />
//                       </div>
//                     </div>
//                     <div className="col-lg-12 col-sm-6 col-12">
//                       <div className="row">
//                         <div>
//                           <div className="modal-footer-btn download-file">
//                             <Link to="#" className="btn btn-submit">
//                               Download Sample File
//                             </Link>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="col-lg-12">
//                       <div className="input-blocks image-upload-down">
//                         <label> Upload CSV File</label>
//                         <div className="image-upload download">
//                           <input type="file" />
//                           <div className="image-uploads">
//                             <ImageWithBasePath
//                               src="assets/img/download-img.png"
//                               alt="img"
//                             />
//                             <h4>
//                               Drag and drop a <span>file to upload</span>
//                             </h4>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="col-lg-12 col-sm-6 col-12">
//                       <div className="mb-3">
//                         <label className="form-label">Shipping</label>
//                         <input type="text" className="form-control" />
//                       </div>
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="mb-3 summer-description-box transfer">
//                       <label className="form-label">Description</label>
//                       <div id="summernote3"></div>
//                       <p>Maximum 60 Characters</p>
//                     </div>
//                   </div>
//                   <div className="col-lg-12">
//                     <div className="modal-footer-btn">
//                       <button
//                         type="button"
//                         className="btn btn-cancel me-2"
//                         data-bs-dismiss="modal"
//                       >
//                         Cancel
//                       </button>
//                       <button type="submit" className="btn btn-submit">
//                         Submit
//                       </button>
//                     </div>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* /Import Transfer */}
//     </div>
//   );
// };

// export default StockTransferModal;


import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  Edit,
  Filter,
  PlusCircle,
  Sliders,
  Trash2,
  Search as SearchIcon,
  TrendingUp,
  TrendingDown,
  Package,
} from "feather-icons-react/build/IconComponents";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import AuthService from "../../services/authService";
import Table from "../../core/pagination/datatable";
import TableHeaderActions from "../tableheader";
import {
  fetchStockFlows,
  fetchStockFlowStats,
  setFilters,
  resetFilters,
  createStockFlow,
  updateStockFlow,
  deleteStockFlow as deleteStockFlowAction,
  clearError,
  fetchStockFlowById,
} from "../../core/redux/slices/stockFlowSlice";

const StockTransfer = () => {
  const dispatch = useDispatch();
  const MySwal = withReactContent(Swal);

  // Redux state
  const {
    stockFlows,
    stats,
    filters,
    status: loadingStatus,
    error,
  } = useSelector((state) => state.stockFlow);

  const loading = loadingStatus === "loading";
  const data = useSelector((state) => state.toggle_header);

  // Local state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingStockFlow, setEditingStockFlow] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [warehouses, setWarehouses] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    from_wh: null,
    to_wh: null,
    from_loc: "",
    to_loc: "",
    quantity: "",
    transport: null,
    status: null,
    description: "",
  });

  // Fetch initial data
  useEffect(() => {
    dispatch(fetchStockFlows(filters));
    dispatch(fetchStockFlowStats());
    fetchWarehouses();
    // eslint-disable-next-line
  }, []);

  // Show error notifications
  useEffect(() => {
    if (error) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error,
        timer: 3000,
      });
      dispatch(clearError());
    }
  }, [error, dispatch, MySwal]);

  // Fetch warehouses
  const fetchWarehouses = async () => {
    try {
      const response = await AuthService.getWarehouse();
      setWarehouses(
        (response.data.data || response.data || []).map((item) => ({
          value: item.id,
          label: item.name || item.title,
        }))
      );
    } catch (error) {
      console.error("Error fetching warehouses:", error);
    }
  };

  // Handle filter changes
  const handleFilterChange = (name, value) => {
    dispatch(setFilters({ [name]: value }));
  };

  // Debounced search
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchStockFlows(filters));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [filters.search]);

  // Fetch stock flows when other filters change
  useEffect(() => {
    dispatch(fetchStockFlows(filters));
    // eslint-disable-next-line
  }, [
    filters.status,
    filters.transport,
    filters.from_wh,
    filters.to_wh,
    filters.sortBy,
    filters.sortOrder,
  ]);

  const handleSearch = (e) => {
    const value = e.target.value;
    dispatch(setFilters({ search: value }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      from_wh: null,
      to_wh: null,
      from_loc: "",
      to_loc: "",
      quantity: "",
      transport: null,
      status: { value: "approved", label: "Approved" },
      description: "",
    });
  };

  // Open Add Modal
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Close Add Modal
  const handleCloseAddModal = () => {
    setShowAddModal(false);
    resetForm();
  };

  // Open Edit Modal
  const handleEditClick = async (id) => {
    try {
      const stockFlowData = await dispatch(fetchStockFlowById(id)).unwrap();

      const selectedFromWh = warehouses.find(
        (w) => w.value === stockFlowData.from_wh
      );
      const selectedToWh = warehouses.find((w) => w.value === stockFlowData.to_wh);
      const selectedTransport = transportOptions.find(
        (t) => t.value === stockFlowData.transport
      );
      const selectedStatus = statusOptionsForForm.find(
        (s) => s.value === stockFlowData.status
      );

      setEditingStockFlow(stockFlowData);
      setFormData({
        from_wh: selectedFromWh || null,
        to_wh: selectedToWh || null,
        from_loc: stockFlowData.from_loc || "",
        to_loc: stockFlowData.to_loc || "",
        quantity: stockFlowData.quantity || "",
        transport: selectedTransport || null,
        status: selectedStatus || null,
        description: stockFlowData.description || "",
      });

      setShowEditModal(true);
    } catch (error) {
      console.error("Error fetching stock flow:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load stock flow details",
        timer: 2000,
      });
    }
  };

  // Close Edit Modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingStockFlow(null);
    resetForm();
  };

  // Handle Input Changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle Add Submit
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.from_wh && !formData.to_wh) {
      MySwal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Either from warehouse or to warehouse must be selected",
        timer: 2000,
      });
      return;
    }

    if (!formData.quantity || formData.quantity < 1) {
      MySwal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Quantity must be at least 1",
        timer: 2000,
      });
      return;
    }

    if (!formData.transport) {
      MySwal.fire({
        icon: "warning",
        title: "Validation Error",
        text: "Transport method is required",
        timer: 2000,
      });
      return;
    }

    try {
      setSubmitting(true);

      const dataToSubmit = {
        from_wh: formData.from_wh?.value || null,
        to_wh: formData.to_wh?.value || null,
        from_loc: formData.from_loc,
        to_loc: formData.to_loc,
        quantity: parseInt(formData.quantity),
        transport: formData.transport.value,
        status: formData.status?.value || "approved",
        description: formData.description,
      };

      await dispatch(createStockFlow(dataToSubmit)).unwrap();

      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Stock flow created successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      handleCloseAddModal();
      dispatch(fetchStockFlows(filters));
      dispatch(fetchStockFlowStats());
    } catch (error) {
      console.error("Error creating stock flow:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to create stock flow",
        timer: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      const dataToSubmit = {
        from_wh: formData.from_wh?.value || null,
        to_wh: formData.to_wh?.value || null,
        from_loc: formData.from_loc,
        to_loc: formData.to_loc,
        quantity: parseInt(formData.quantity),
        transport: formData.transport.value,
        status: formData.status.value,
        description: formData.description,
      };

      await dispatch(
        updateStockFlow({ id: editingStockFlow.id, data: dataToSubmit })
      ).unwrap();

      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Stock flow updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      handleCloseEditModal();
      dispatch(fetchStockFlows(filters));
      dispatch(fetchStockFlowStats());
    } catch (error) {
      console.error("Error updating stock flow:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to update stock flow",
        timer: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#3085d6",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteStockFlowAction(id)).unwrap();
          MySwal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Stock flow has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
          dispatch(fetchStockFlows(filters));
          dispatch(fetchStockFlowStats());
        } catch (error) {
          console.error("Error deleting stock flow:", error);
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: error || "Failed to delete stock flow",
            timer: 3000,
          });
        }
      }
    });
  };

  const handleSortChange = (option) => {
    const [sortBy, sortOrder] = option.value.split(":");
    dispatch(setFilters({ sortBy, sortOrder }));
  };

  // Toggle filter visibility
  const toggleFilterVisibility = () => {
    setIsFilterVisible((prev) => !prev);
  };

  // Reset filters
  const resetFiltersHandler = () => {
    dispatch(resetFilters());
    dispatch(fetchStockFlows(filters));
  };

  const sortOptions = [
    { value: "created_at:DESC", label: "Newest First" },
    { value: "created_at:ASC", label: "Oldest First" },
    { value: "quantity:DESC", label: "Quantity High to Low" },
    { value: "quantity:ASC", label: "Quantity Low to High" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "approved", label: "Approved" },
    { value: "in-transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
  ];

  const statusOptionsForForm = [
    { value: "approved", label: "Approved" },
    { value: "in-transit", label: "In Transit" },
    { value: "delivered", label: "Delivered" },
  ];

  const transportOptions = [
    { value: "bus", label: "Bus" },
    { value: "courier", label: "Courier" },
    { value: "employee", label: "Employee" },
    { value: "transport_co", label: "Transport Company" },
  ];

  const transportFilterOptions = [
    { value: "", label: "All Transport" },
    ...transportOptions,
  ];

  // TABLE COLUMNS
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      render: (text) => <span className="badge badge-primary">#{text}</span>,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "From Warehouse",
      dataIndex: "from_warehouse_name",
      render: (text) => (
        <div className="d-flex align-items-center">
          <TrendingUp size={16} className="text-danger me-2" />
          {text || "N/A"}
        </div>
      ),
      sorter: (a, b) =>
        (a.from_warehouse_name || "").localeCompare(b.from_warehouse_name || ""),
    },
    {
      title: "To Warehouse",
      dataIndex: "to_warehouse_name",
      render: (text) => (
        <div className="d-flex align-items-center">
          <TrendingDown size={16} className="text-success me-2" />
          {text || "N/A"}
        </div>
      ),
      sorter: (a, b) =>
        (a.to_warehouse_name || "").localeCompare(b.to_warehouse_name || ""),
    },
    {
      title: "Quantity",
      dataIndex: "quantity",
      render: (text) => (
        <div className="d-flex align-items-center">
          <Package size={16} className="text-primary me-2" />
          <span className="badge badge-info">{text}</span>
        </div>
      ),
      sorter: (a, b) => (a.quantity || 0) - (b.quantity || 0),
    },
    {
      title: "Transport",
      dataIndex: "transport",
      render: (text) => (
        <span
          className={`badge ${
            text === "bus"
              ? "badge-secondary"
              : text === "courier"
              ? "badge-info"
              : text === "employee"
              ? "badge-warning"
              : "badge-primary"
          }`}
        >
          {text === "transport_co"
            ? "Transport Co."
            : text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
      sorter: (a, b) => (a.transport || "").localeCompare(b.transport || ""),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span
          className={`badge ${
            text === "approved"
              ? "badge-linesuccess"
              : text === "in-transit"
              ? "badge-linewarning"
              : "badge-lineinfo"
          }`}
        >
          {text === "in-transit"
            ? "In Transit"
            : text.charAt(0).toUpperCase() + text.slice(1)}
        </span>
      ),
      sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
    },
    {
      title: "Created Date",
      dataIndex: "created_at",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Action",
      dataIndex: "actions",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleEditClick(record.id);
              }}
              title="Edit"
            >
              <Edit className="feather-edit" />
            </Link>

            <Link
              className="confirm-text p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleDelete(record.id);
              }}
              title="Delete"
            >
              <Trash2 className="feather-trash-2" />
            </Link>
          </div>
        </td>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Stock Flow Management</h4>
              <h6>Manage your stock transfers</h6>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="row mb-4">
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="dash-count das1">
                <div className="dash-counts">
                  <h4>{stats.total || 0}</h4>
                  <h5>Total Transfers</h5>
                </div>
                <div className="dash-imgs">
                  <Package />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="dash-count das2">
                <div className="dash-counts">
                  <h4>{stats.approved || 0}</h4>
                  <h5>Approved</h5>
                </div>
                <div className="dash-imgs">
                  <i data-feather="check-circle" className="feather-check-circle" />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="dash-count das3">
                <div className="dash-counts">
                  <h4>{stats.in_transit || 0}</h4>
                  <h5>In Transit</h5>
                </div>
                <div className="dash-imgs">
                  <i data-feather="truck" className="feather-truck" />
                </div>
              </div>
            </div>
            <div className="col-lg-3 col-sm-6 col-12">
              <div className="dash-count">
                <div className="dash-counts">
                  <h4>{stats.delivered || 0}</h4>
                  <h5>Delivered</h5>
                </div>
                <div className="dash-imgs">
                  <i data-feather="check-square" className="feather-check-square" />
                </div>
              </div>
            </div>
          </div>

          <TableHeaderActions
            onRefresh={() => {
              dispatch(fetchStockFlows(filters));
              dispatch(fetchStockFlowStats());
            }}
            pdfEndpoint="/auth/export/stockflows/pdf"
            excelEndpoint="/auth/export/stockflows/excel"
            filters={{
              search: filters.search,
              status: filters.status,
              transport: filters.transport,
            }}
            entityName="stock flows"
            dispatch={dispatch}
            headerState={data}
            headerAction={setToogleHeader}
            showPrint={true}
          />

          <div className="page-btn">
            <button onClick={handleAddClick} className="btn btn-added">
              <PlusCircle className="me-2 iconsize" />
              Add Stock Flow
            </button>
          </div>
        </div>

        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search by description or location"
                    className="form-control form-control-sm formsearch"
                    value={filters.search}
                    onChange={handleSearch}
                  />
                  <Link to="#" className="btn btn-searchset">
                    <SearchIcon className="feather-search" />
                  </Link>
                </div>
              </div>
              <div className="search-path">
                <Link
                  className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                >
                  <Filter
                    className="filter-icon"
                    onClick={toggleFilterVisibility}
                  />
                  <span onClick={toggleFilterVisibility}>
                    <ImageWithBasePath
                      src="assets/img/icons/closes.svg"
                      alt="img"
                    />
                  </span>
                </Link>
              </div>
              <div className="form-sort">
                <Sliders className="info-img" />
                <Select
                  className="select"
                  options={sortOptions}
                  placeholder="Sort By"
                  onChange={handleSortChange}
                  value={sortOptions.find(
                    (opt) =>
                      opt.value === `${filters.sortBy}:${filters.sortOrder}`
                  )}
                />
              </div>
            </div>

            {/* Filter Section */}
            <div
              className={`card${isFilterVisible ? " visible" : ""}`}
              id="filter_inputs"
              style={{ display: isFilterVisible ? "block" : "none" }}
            >
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>From Warehouse</label>
                      <Select
                        className="select"
                        options={[
                          { value: "", label: "All Warehouses" },
                          ...warehouses,
                        ]}
                        placeholder="Choose Warehouse"
                        onChange={(option) =>
                          handleFilterChange("from_wh", option?.value || "")
                        }
                        value={
                          warehouses.find((w) => w.value === filters.from_wh) || {
                            value: "",
                            label: "All Warehouses",
                          }
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>To Warehouse</label>
                      <Select
                        className="select"
                        options={[
                          { value: "", label: "All Warehouses" },
                          ...warehouses,
                        ]}
                        placeholder="Choose Warehouse"
                        onChange={(option) =>
                          handleFilterChange("to_wh", option?.value || "")
                        }
                        value={
                          warehouses.find((w) => w.value === filters.to_wh) || {
                            value: "",
                            label: "All Warehouses",
                          }
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>Transport</label>
                      <Select
                        className="select"
                        options={transportFilterOptions}
                        placeholder="Transport"
                        onChange={(option) =>
                          handleFilterChange("transport", option?.value || "")
                        }
                        value={
                          transportFilterOptions.find(
                            (t) => t.value === filters.transport
                          ) || {
                            value: "",
                            label: "All Transport",
                          }
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>Status</label>
                      <Select
                        className="select"
                        options={statusOptions}
                        placeholder="Status"
                        onChange={(option) =>
                          handleFilterChange("status", option?.value || "")
                        }
                        value={
                          statusOptions.find((s) => s.value === filters.status) || {
                            value: "",
                            label: "All Status",
                          }
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <a
                        className="btn btn-filters ms-auto w-100"
                        onClick={resetFiltersHandler}
                      >
                        Reset Filters
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Flows Table */}
            <div className="table-responsive">
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : stockFlows.length === 0 ? (
                <div className="text-center p-5">
                  <p>No stock flows found</p>
                </div>
              ) : (
                <Table columns={columns} dataSource={stockFlows} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Add Stock Flow</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={handleCloseAddModal}
            disabled={submitting}
          />
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleAddSubmit}>
            <div className="row">
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">From Warehouse</label>
                  <Select
                    options={warehouses}
                    value={formData.from_wh}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        from_wh: option,
                      }))
                    }
                    placeholder="Select From Warehouse"
                    isClearable
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">To Warehouse</label>
                  <Select
                    options={warehouses}
                    value={formData.to_wh}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        to_wh: option,
                      }))
                    }
                    placeholder="Select To Warehouse"
                    isClearable
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">From Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="from_loc"
                    value={formData.from_loc}
                    onChange={handleInputChange}
                    placeholder="Enter from location"
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">To Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="to_loc"
                    value={formData.to_loc}
                    onChange={handleInputChange}
                    placeholder="Enter to location"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-4">
                <div className="mb-3">
                  <label className="form-label">
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mb-3">
                  <label className="form-label">
                    Transport <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={transportOptions}
                    value={formData.transport}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        transport: option,
                      }))
                    }
                    placeholder="Select Transport"
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mb-3">
                  <label className="form-label">Status</label>
                  <Select
                    options={statusOptionsForForm}
                    value={formData.status}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: option,
                      }))
                    }
                    placeholder="Select Status"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-cancel me-2"
                onClick={handleCloseAddModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-submit"
                disabled={submitting}
              >
                {submitting ? "Creating..." : "Create"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Edit Stock Flow</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={handleCloseEditModal}
            disabled={submitting}
          />
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditSubmit}>
            <div className="row">
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">From Warehouse</label>
                  <Select
                    options={warehouses}
                    value={formData.from_wh}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        from_wh: option,
                      }))
                    }
                    placeholder="Select From Warehouse"
                    isClearable
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">To Warehouse</label>
                  <Select
                    options={warehouses}
                    value={formData.to_wh}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        to_wh: option,
                      }))
                    }
                    placeholder="Select To Warehouse"
                    isClearable
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">From Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="from_loc"
                    value={formData.from_loc}
                    onChange={handleInputChange}
                    placeholder="Enter from location"
                  />
                </div>
              </div>
              <div className="col-lg-6">
                <div className="mb-3">
                  <label className="form-label">To Location</label>
                  <input
                    type="text"
                    className="form-control"
                    name="to_loc"
                    value={formData.to_loc}
                    onChange={handleInputChange}
                    placeholder="Enter to location"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-4">
                <div className="mb-3">
                  <label className="form-label">
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleInputChange}
                    placeholder="Enter quantity"
                    min="1"
                    required
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mb-3">
                  <label className="form-label">
                    Transport <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={transportOptions}
                    value={formData.transport}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        transport: option,
                      }))
                    }
                    placeholder="Select Transport"
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <div className="mb-3">
                  <label className="form-label">
                    Status <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={statusOptionsForForm}
                    value={formData.status}
                    onChange={(option) =>
                      setFormData((prev) => ({
                        ...prev,
                        status: option,
                      }))
                    }
                    placeholder="Select Status"
                  />
                </div>
              </div>
            </div>

            <div className="row">
              <div className="col-lg-12">
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Enter description"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-cancel me-2"
                onClick={handleCloseEditModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-submit"
                disabled={submitting}
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default StockTransfer