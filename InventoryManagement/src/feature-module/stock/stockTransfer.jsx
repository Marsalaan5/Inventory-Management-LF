// StockTransfer.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  // Edit,
  Filter,
  PlusCircle,
  Sliders,
  // Trash2,
  Search as SearchIcon,
  TrendingUp,
  TrendingDown,
  Package,
  // Download,
  Camera,
  Truck,
  CheckCircle,
  Eye,
  X,
} from "feather-icons-react/build/IconComponents";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import AuthService from "../../services/authService.js";
import Table from "../../core/pagination/datatable";
import TableHeaderActions from "../tableheader";

import {
  fetchStockFlows,
  // fetchStockFlowById,
  fetchStockFlowStats,
  fetchStockFlowOptions,
  updateStockFlow,
  // deleteStockFlow,
  // dispatchStockFlow,
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



const getTotalQty = (record) => {
  if (Array.isArray(record.product_arr) && record.product_arr.length > 0)
    return record.product_arr.reduce(
      (sum, p) => sum + (parseInt(p.count) || 0),
      0,
    );
  return record.total_items ?? "—";
};



const StockTransfer = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const headerData = useSelector((s) => s.toggle_header);

  const stockFlows    = useSelector(selectFlowList);
  const stats         = useSelector(selectFlowStats);
  const filters       = useSelector(selectFlowFilters);
  const pagination    = useSelector(selectFlowPagination);
  const options       = useSelector(selectFlowOptions);
  const loading       = useSelector(selectFlowListLoading);
  const mutating      = useSelector(selectFlowMutating);
  const optionsLoading = useSelector(selectFlowOptionsLoading);
  const error         = useSelector(selectFlowError);
  const currentFlow   = useSelector(selectFlowCurrent);
  const detailLoading = useSelector(selectFlowDetailLoading);

  const transportOptions = options.transport || [];
  const sortOptions      = options.sort      || [];


  const [showEditModal,    setShowEditModal]    = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [isFilterVisible,  setIsFilterVisible]  = useState(false);

//for warehouse dropdown
  const [warehouses,    setWarehouses]    = useState([]);
  const [allWarehouses, setAllWarehouses] = useState([]);
  const [fromIsWarehouse, setFromIsWarehouse] = useState(true);
  const [toIsWarehouse,   setToIsWarehouse]   = useState(true);

//for camera
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [cameraActive,  setCameraActive]  = useState(false);
  const [stream,        setStream]        = useState(null);
  const [receiveData,   setReceiveData]   = useState({
    receivedBy:       "",
    receivedQuantity: "",
    remarks:          "",
    deliveryPhoto:    null,
  });

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);

 //edit form
  const [formData, setFormData] = useState({
    from_wh:     null,
    to_wh:       null,
    from_loc:    "",
    to_loc:      "",
    quantity:    "",
    transport:   null,
    description: "",
  });

  const transportFilterOptions = [
    { value: "", label: "All Transport" },
    ...transportOptions,
  ];


  useEffect(() => {
    dispatch(fetchStockFlows(filters));
    dispatch(fetchStockFlowStats());
    dispatch(fetchStockFlowOptions());
    fetchWarehouses();
    fetchAllWarehouses();
    // eslint-disable-next-line
  }, []);


  useEffect(() => {
    if (error) {
      MySwal.fire({ icon: "error", title: "Error", text: error, timer: 3000 });
      dispatch(clearFlowError());
    }
  }, [error, dispatch]);


  useEffect(
    () => () => { stream?.getTracks().forEach((t) => t.stop()); },
    [stream],
  );

  
  useEffect(() => {
    const t = setTimeout(() => dispatch(fetchStockFlows(filters)), 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [filters.search]);


  useEffect(() => {
    dispatch(fetchStockFlows(filters));
    // eslint-disable-next-line
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.transport,
    filters.from_wh,
    filters.to_wh,
    filters.sortBy,
    filters.sortOrder,
  ]);

  
  useEffect(() => {
    if (!currentFlow || !showEditModal) return;

 
    setFromIsWarehouse(true);
    setToIsWarehouse(true);
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

 
  useEffect(() => {
    if (!currentFlow || !showReceiveModal) return;
    setReceiveData((p) => ({ ...p, receivedQuantity: getTotalQty(currentFlow) }));
  }, [currentFlow, showReceiveModal]);

 
  const fetchWarehouses = async () => {
    try {
      const res = await AuthService.getWarehouse();
      setWarehouses(
        (res.data.data || res.data || []).map((w) => ({
          value: w.wh_uuid,
          label: w.name || w.title,
        })),
      );
    } catch (e) { console.error(e); }
  };

  const fetchAllWarehouses = async () => {
    try {
      const res = await AuthService.getWarehouseDropdown();
      setAllWarehouses(
        (res.data.data || res.data || []).map((w) => ({
          value: w.wh_uuid,
          label: w.name || w.title,
        })),
      );
    } catch (e) { console.error(e); }
  };

  // ── Camera 
  const startCamera = async () => {
    try {
      const ms = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      if (videoRef.current) {
        videoRef.current.srcObject = ms;
        setStream(ms);
        setCameraActive(true);
      }
    } catch {
      MySwal.fire({ icon: "error", title: "Camera Error", text: "Unable to access camera.", timer: 3000 });
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current;
    const c = canvasRef.current;
    c.width  = v.videoWidth;
    c.height = v.videoHeight;
    c.getContext("2d").drawImage(v, 0, 0);
    c.toBlob(
      (blob) => {
        const file = new File([blob], `delivery-${Date.now()}.jpg`, { type: "image/jpeg" });
        setCapturedPhoto(URL.createObjectURL(blob));
        setReceiveData((p) => ({ ...p, deliveryPhoto: file }));
        stopCamera();
      },
      "image/jpeg",
      0.95,
    );
  };

  const stopCamera = useCallback(() => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  }, [stream]);

  
  const handlePaginationChange = ({ page, limit }) =>
    dispatch(setFlowFilters({ page, limit }));

  const handleSearch     = (e) => dispatch(setFlowFilters({ search: e.target.value }));
  const handleSortChange = (opt) => {
    const [sortBy, sortOrder] = opt.value.split(":");
    dispatch(setFlowFilters({ sortBy, sortOrder }));
  };


  const handleViewDetails = (stock_id) => navigate(`/stock-flow-details/${stock_id}`);

  // const handleEditClick = (stock_id) => {
  //   setShowEditModal(true);
  //   dispatch(fetchStockFlowById(stock_id));
  // };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    dispatch(clearFlowCurrent());
  };

  // const handleReceiveClick = (stock_id) => {
  //   setShowReceiveModal(true);
  //   setCapturedPhoto(null);
  //   setReceiveData({ receivedBy: "", receivedQuantity: "", remarks: "", deliveryPhoto: null });
  //   dispatch(fetchStockFlowById(stock_id));
  // };

  const handleCloseReceiveModal = () => {
    setShowReceiveModal(false);
    dispatch(clearFlowCurrent());
    setCapturedPhoto(null);
    stopCamera();
  };

  // const handleDispatch = (stock_id) => {
  //   MySwal.fire({
  //     title: "Dispatch Stock Flow?",
  //     text: "This will mark the stock as in-transit",
  //     icon: "question",
  //     showCancelButton: true,
  //     confirmButtonColor: "#3085d6",
  //     confirmButtonText: "Yes, Dispatch!",
  //     cancelButtonColor: "#d33",
  //   }).then(async ({ isConfirmed }) => {
  //     if (!isConfirmed) return;
  //     try {
  //       await dispatch(dispatchStockFlow(stock_id)).unwrap();
  //       MySwal.fire({ icon: "success", title: "Dispatched!", timer: 2000, showConfirmButton: false });
  //       dispatch(fetchStockFlows(filters));
  //       dispatch(fetchStockFlowStats());
  //     } catch (err) {
  //       MySwal.fire({ icon: "error", title: "Error", text: err || "Failed to dispatch", timer: 3000 });
  //     }
  //   });
  // };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await dispatch(
        updateStockFlow({
          id: currentFlow.stock_id, 
          data: {
            from_wh:     fromIsWarehouse ? formData.from_wh?.value || null : null,
            to_wh:       toIsWarehouse   ? formData.to_wh?.value   || null : null,
            from_loc:    !fromIsWarehouse ? formData.from_loc : null,
            to_loc:      !toIsWarehouse   ? formData.to_loc   : null,
            quantity:    parseInt(formData.quantity),
            transport:   formData.transport?.value,
            description: formData.description,
          },
        }),
      ).unwrap();
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
      await dispatch(receiveStockFlow({ id: currentFlow.stock_id, data: fd })).unwrap();
      MySwal.fire({ icon: "success", title: "Received!", timer: 2000, showConfirmButton: false });
      handleCloseReceiveModal();
      dispatch(fetchStockFlows(filters));
      dispatch(fetchStockFlowStats());
    } catch (err) {
      MySwal.fire({ icon: "error", title: "Error", text: err || "Failed to receive", timer: 3000 });
    }
  };

  // const handleDelete = (stock_id) => {
  //   MySwal.fire({
  //     title: "Are you sure?",
  //     text: "You won't be able to revert this!",
  //     icon: "warning",
  //     showCancelButton: true,
  //     confirmButtonColor: "#d33",
  //     confirmButtonText: "Yes, delete it!",
  //     cancelButtonColor: "#3085d6",
  //   }).then(async ({ isConfirmed }) => {
  //     if (!isConfirmed) return;
  //     try {
  //       await dispatch(deleteStockFlow(stock_id)).unwrap();
  //       MySwal.fire({ icon: "success", title: "Deleted!", timer: 2000, showConfirmButton: false });
  //       dispatch(fetchStockFlowStats());
  //     } catch (err) {
  //       MySwal.fire({ icon: "error", title: "Error", text: err || "Failed to delete", timer: 3000 });
  //     }
  //   });
  // };

  // const handleDownloadInvoice = async (stock_id) => {
  //   try {
  //     const res = await AuthService.downloadStockFlowInvoice(stock_id);
  //     const url  = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
  //     const link = Object.assign(document.createElement("a"), {
  //       href:     url,
  //       download: `stock-flow-invoice-${stock_id}.pdf`,
  //     });
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //     window.URL.revokeObjectURL(url);
  //   } catch {
  //     MySwal.fire({ icon: "error", title: "Error", text: "Failed to download invoice", timer: 2000 });
  //   }
  // };


  
  const columns = [
    {
      title: "Stock Transfer ID",
      dataIndex: "stock_id",
      render: (text, record) => (
        <Link
          to={`/stock-flow-details/${record.stock_id}`}
          className="badge badge-secondary text-decoration-none"
        >
          {text}
        </Link>
      ),
      sorter: (a, b) => a.stock_id.localeCompare(b.stock_id),
    },
     {
      title: "Stock Req ID",
      dataIndex: "stock_req_id",
      render: (text) =>
        text ? (
          <span className="badge badge-primary text-decoration-none">{text}</span>
        ) : (
          <span className="text-muted">—</span>
        ),
    },
      {
      title: "To",
      dataIndex: "dispatcher_wh", 
      render: (text, record) => (
        <div className="d-flex align-items-center">
          <TrendingDown size={16} className="text-success me-2" />
          <div>
            <div>{text || "N/A"}</div>
            {record.dispatcher_name && (
              <small className="text-muted">{record.dispatcher_name}</small>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "From",
      dataIndex: "requester_wh",  
      render: (text, record) => (
        <div className="d-flex align-items-center">
          <TrendingUp size={16} className="text-danger me-2" />
          <div>
            <div>{text || "N/A"}</div>
            {record.requester_name && (
              <small className="text-muted">{record.requester_name}</small>
            )}
          </div>
        </div>
      ),
    },

    //to be used for product count if required
    {/* {record.total_products > 0 && (
            <span className="badge badge-secondary">
              {record.total_products} Product{record.total_products !== 1 ? "s" : ""}
            </span>
          )} */},
    {
      title: "Articles",
      render: (_, record) => (
        <>
        <div className="d-flex align-items-center gap-2">
          <Package size={14} className="text-primary" />
           <span className="badge badge-info">
              {record.total_articles} item
              {record.total_articles !== 1 ? "s" : ""}
            </span>
            </div>
             <div className="text-muted" style={{ fontSize: 11 }}>
            Qty: {record.total_items}
          </div>
        </>
        
        
      ),
    },
    {
      title: "Transport",
      dataIndex: "transport",
      render: (text) => {
        const opt = transportOptions.find((t) => t.value === text);
        const cls = {
          bus:      "badge-secondary",
          courier:  "badge-info",
          employee: "badge-warning",
        }[text] || "badge-primary";
        return <span className={`badge ${cls}`}>{opt ? opt.label : text}</span>;
      },
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        const cls = {
          approved:    "badge-linesuccess",
          "in-transit": "badge-linewarning",
          delivered:   "badge-lineinfo",
        }[text] || "badge-secondary";
        return <span className={`badge ${cls}`}>{text}</span>;
      },
    },
   
    {
      title: "Created",
      dataIndex: "created_at",
      render: (text) => new Date(text).toLocaleDateString(),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: "Action",
      render: (_, record) => {
      
      
        return (
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => { e.preventDefault(); handleViewDetails(record.stock_id); }}
              title="View"
            >
              <Eye size={16} className="text-info" />
            </Link>

            {/* {actions.can_dispatch && (
              <Link
                className="me-2 p-2"
                to="#"
                onClick={(e) => { e.preventDefault(); handleDispatch(record.stock_id); }}
                title="Dispatch"
              >
                <Truck size={16} className="text-warning" />
              </Link>
            )}

            {actions.can_receive && (
              <Link
                className="me-2 p-2"
                to="#"
                onClick={(e) => { e.preventDefault(); handleReceiveClick(record.stock_id); }}
                title="Receive"
              >
                <CheckCircle size={16} className="text-success" />
              </Link>
            )}

            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => { e.preventDefault(); handleDownloadInvoice(record.stock_id); }}
              title="Download Invoice"
            >
              <Download size={16} className="text-primary" />
            </Link>

            {actions.can_edit && (
              <Link
                className="me-2 p-2"
                to="#"
                onClick={(e) => { e.preventDefault(); handleEditClick(record.stock_id); }}
                title="Edit"
              >
                <Edit size={16} />
              </Link>
            )}

            {actions.can_delete && (
              <Link
                className="p-2"
                to="#"
                onClick={(e) => { e.preventDefault(); handleDelete(record.stock_id); }}
                title="Delete"
              >
                <Trash2 size={16} />
              </Link>
            )} */}
          </div>
        );
      },
    },
  ];


  if (optionsLoading) {
    return (
      <div className="page-wrapper">
        <div className="content d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" />
            <p>Loading options…</p>
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="page-wrapper">
      <div className="content">
        {/* Header */}
        <div className="page-header mb-3">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Stock Flow Management</h4>
              <h6>Manage your stock transfers</h6>
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
              search:    filters.search,
              status:    filters.status,
              transport: filters.transport,
            }}
            entityName="stock flows"
            dispatch={dispatch}
            headerState={headerData}
            headerAction={setToogleHeader}
            showPrint
          />
          <div className="page-btn">
            <button onClick={() => navigate("/add-stock-flow")} className="btn btn-added">
              <PlusCircle size={16} className="me-2" />
              Add Stock Flow
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="row">
          {[
            { label: "Total Transfers", value: stats.total      || 0, cls: "das1", icon: <Package /> },
            { label: "Approved",        value: stats.approved   || 0, cls: "das2", icon: <CheckCircle /> },
            { label: "In Transit",      value: stats.in_transit || 0, cls: "das3", icon: <Truck /> },
            { label: "Delivered",       value: stats.delivered  || 0, cls: "",     icon: <Package /> },
          ].map(({ label, value, cls, icon }) => (
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

        {/* Table card */}
        <div className="card table-list-card">
          <div className="card-body">
            {/* Toolbar */}
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search by Stock ID"
                    className="form-control form-control-sm formsearch"
                    value={filters.search}
                    onChange={handleSearch}
                  />
                  <Link to="#" className="btn btn-searchset">
                    <SearchIcon size={14} />
                  </Link>
                </div>
              </div>
              <div className="search-path">
                <Link
                  className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}
                  onClick={() => setIsFilterVisible((p) => !p)}
                >
                  <Filter size={16} className="filter-icon" />
                  <span>
                    <ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" />
                  </span>
                </Link>
              </div>
              <div className="form-sort">
                <Sliders size={16} className="info-img" />
                <Select
                  className="select"
                  options={sortOptions}
                  placeholder="Sort By"
                  onChange={handleSortChange}
                  value={
                    sortOptions.find(
                      (o) => o.value === `${filters.sortBy}:${filters.sortOrder}`,
                    ) || null
                  }
                />
              </div>
            </div>

            
            <div
              className="card"
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
                        options={[{ value: "", label: "All Warehouses" }, ...warehouses]}
                        value={
                          warehouses.find((w) => w.value === filters.from_wh) ||
                          { value: "", label: "All Warehouses" }
                        }
                        onChange={(opt) =>
                          dispatch(setFlowFilters({ from_wh: opt?.value || "" }))
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
                        options={[{ value: "", label: "All Warehouses" }, ...allWarehouses]}
                        value={
                          allWarehouses.find((w) => w.value === filters.to_wh) ||
                          { value: "", label: "All Warehouses" }
                        }
                        onChange={(opt) =>
                          dispatch(setFlowFilters({ to_wh: opt?.value || "" }))
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
                        value={
                          transportFilterOptions.find((t) => t.value === filters.transport) ||
                          { value: "", label: "All Transport" }
                        }
                        onChange={(opt) =>
                          dispatch(setFlowFilters({ transport: opt?.value || "" }))
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
                        options={[
                          { value: "",           label: "All Statuses" },
                          { value: "approved",   label: "Approved" },
                          { value: "in-transit", label: "In Transit" },
                          { value: "delivered",  label: "Delivered" },
                        ]}
                        value={
                          filters.status
                            ? { value: filters.status, label: filters.status }
                            : { value: "", label: "All Statuses" }
                        }
                        onChange={(opt) =>
                          dispatch(setFlowFilters({ status: opt?.value || "" }))
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-2 col-sm-6 col-12">
                    <div className="input-blocks">
                      <button
                        className="btn btn-filters ms-auto w-100"
                        onClick={() => {
                          dispatch(resetFlowFilters());
                          dispatch(fetchStockFlows({}));
                        }}
                      >
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
                <div className="text-center p-5">
                  <div className="spinner-border" />
                </div>
              ) : stockFlows.length === 0 ? (
                <div className="text-center p-5">
                  <p>No stock flows found</p>
                </div>
              ) : (
                <Table
                  key={`${filters.page}-${filters.limit}`}
                  columns={columns}
                  dataSource={stockFlows}
                  rowKey="stock_id"        
                  pagination={pagination}
                  filters={filters}
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
          <button className="btn-close" onClick={handleCloseEditModal} disabled={mutating}>
            <X size={16} />
          </button>
        </Modal.Header>
        <Modal.Body>
          {detailLoading ? (
            <div className="text-center p-4">
              <div className="spinner-border text-primary" />
              <p className="mt-2 text-muted">Loading transfer details…</p>
            </div>
          ) : (
            <form onSubmit={handleEditSubmit}>
              {/* From */}
              <div className="row mb-3">
                <div className="col-12">
                  <h6>From Location</h6>
                  <div className="d-flex gap-3 mb-2">
                    {[true, false].map((isWh) => (
                      <div className="form-check" key={String(isWh)}>
                        <input
                          className="form-check-input"
                          type="radio"
                          checked={fromIsWarehouse === isWh}
                          onChange={() => {
                            setFromIsWarehouse(isWh);
                            setFormData((p) =>
                              isWh ? { ...p, from_loc: "" } : { ...p, from_wh: null },
                            );
                          }}
                        />
                        <label className="form-check-label">
                          {isWh ? "Warehouse" : "Other Location"}
                        </label>
                      </div>
                    ))}
                  </div>
                  {fromIsWarehouse ? (
                    <Select
                      options={warehouses}
                      value={formData.from_wh}
                      onChange={(o) => setFormData((p) => ({ ...p, from_wh: o }))}
                      isClearable
                    />
                  ) : (
                    <input
                      className="form-control"
                      value={formData.from_loc}
                      onChange={(e) => setFormData((p) => ({ ...p, from_loc: e.target.value }))}
                      placeholder="Location name"
                    />
                  )}
                </div>
              </div>

              {/* To */}
              <div className="row mb-3">
                <div className="col-12">
                  <h6>To Location</h6>
                  <div className="d-flex gap-3 mb-2">
                    {[true, false].map((isWh) => (
                      <div className="form-check" key={String(isWh)}>
                        <input
                          className="form-check-input"
                          type="radio"
                          checked={toIsWarehouse === isWh}
                          onChange={() => {
                            setToIsWarehouse(isWh);
                            setFormData((p) =>
                              isWh ? { ...p, to_loc: "" } : { ...p, to_wh: null },
                            );
                          }}
                        />
                        <label className="form-check-label">
                          {isWh ? "Warehouse" : "Other Location"}
                        </label>
                      </div>
                    ))}
                  </div>
                  {toIsWarehouse ? (
                    <Select
                      options={warehouses}
                      value={formData.to_wh}
                      onChange={(o) => setFormData((p) => ({ ...p, to_wh: o }))}
                      isClearable
                    />
                  ) : (
                    <input
                      className="form-control"
                      value={formData.to_loc}
                      onChange={(e) => setFormData((p) => ({ ...p, to_loc: e.target.value }))}
                      placeholder="Location name"
                    />
                  )}
                </div>
              </div>

              <div className="row">
                <div className="col-lg-4 mb-3">
                  <label className="form-label">
                    Quantity <span className="text-danger">*</span>
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.quantity}
                    min="1"
                    required
                    onChange={(e) => setFormData((p) => ({ ...p, quantity: e.target.value }))}
                  />
                </div>
                <div className="col-lg-4 mb-3">
                  <label className="form-label">
                    Transport <span className="text-danger">*</span>
                  </label>
                  <Select
                    options={transportOptions}
                    value={formData.transport}
                    onChange={(o) => setFormData((p) => ({ ...p, transport: o }))}
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-cancel me-2"
                  onClick={handleCloseEditModal}
                  disabled={mutating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-submit" disabled={mutating}>
                  {mutating ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          )}
        </Modal.Body>
      </Modal>

      {/* ── Receive Modal ── */}
      <Modal show={showReceiveModal} onHide={handleCloseReceiveModal} size="lg" centered>
        <Modal.Header>
          <Modal.Title>Confirm Delivery</Modal.Title>
          <button className="btn-close" onClick={handleCloseReceiveModal} disabled={mutating} />
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleReceiveSubmit}>
            {currentFlow && (
              <div className="alert alert-info mb-4">
                <h6 className="mb-2">Stock Flow Details</h6>
              
                <p className="mb-1">
                  <strong>From:</strong> {currentFlow.requester_wh || currentFlow.from_loc || "—"}
                </p>
                <p className="mb-1">
                  <strong>To:</strong> {currentFlow.dispatcher_wh || currentFlow.to_loc || "—"}
                </p>
                <p className="mb-1">
                  <strong>Expected Qty:</strong> {getTotalQty(currentFlow)}
                </p>
                <p className="mb-0">
                  <strong>Transfer ID:</strong> {currentFlow.stock_id}
                </p>
              </div>
            )}

            {/* Camera */}
            <div className="mb-4">
              <label className="form-label">
                <Camera size={16} className="me-2" />
                Delivery Photo <span className="text-danger">*</span>
              </label>
              {!capturedPhoto && !cameraActive && (
                <button type="button" className="btn btn-primary w-100" onClick={startCamera}>
                  <Camera size={16} className="me-2" />
                  Open Camera
                </button>
              )}
              {cameraActive && (
                <div>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    style={{ width: "100%", maxHeight: 400, borderRadius: 8, background: "#000" }}
                  />
                  <div className="mt-2 d-flex gap-2">
                    <button type="button" className="btn btn-success flex-grow-1" onClick={capturePhoto}>
                      <Camera size={16} className="me-2" /> Capture
                    </button>
                    <button type="button" className="btn btn-secondary" onClick={stopCamera}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              {capturedPhoto && (
                <div>
                  <img
                    src={capturedPhoto}
                    alt="Delivery proof"
                    style={{ width: "100%", maxHeight: 400, borderRadius: 8, objectFit: "contain" }}
                  />
                  <button
                    type="button"
                    className="btn btn-warning w-100 mt-2"
                    onClick={() => { setCapturedPhoto(null); startCamera(); }}
                  >
                    <Camera size={16} className="me-2" /> Retake
                  </button>
                </div>
              )}
              <canvas ref={canvasRef} style={{ display: "none" }} />
            </div>

            <div className="row">
              <div className="col-lg-6 mb-3">
                <label className="form-label">
                  Received By <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  required
                  value={receiveData.receivedBy}
                  onChange={(e) =>
                    setReceiveData((p) => ({ ...p, receivedBy: e.target.value }))
                  }
                />
              </div>
              <div className="col-lg-6 mb-3">
                <label className="form-label">
                  Received Quantity <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  min="1"
                  required
                  value={receiveData.receivedQuantity}
                  onChange={(e) =>
                    setReceiveData((p) => ({ ...p, receivedQuantity: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Remarks (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                value={receiveData.remarks}
                onChange={(e) => setReceiveData((p) => ({ ...p, remarks: e.target.value }))}
              />
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-cancel me-2"
                onClick={handleCloseReceiveModal}
                disabled={mutating}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-success"
                disabled={mutating || !capturedPhoto}
              >
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
