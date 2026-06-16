
/* eslint-disable react/prop-types */
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Eye,
  CheckCircle,
  Clock,
  Send,
  Inbox,
  Filter,
  Package,
  // Truck,
  Search as SearchIcon,
  ThumbsUp,
  Calendar,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import Table from "../../core/pagination/datatable";
import {
  fetchStockRequestStats,
  selectReqStats,
  fetchSentRequests,
  setReqFilters,
  resetReqFilters,
  selectReqFilters,
} from "../../core/redux/slices/stockSlice";

import TableHeaderActions from "../tableheader";
// import { setToogleHeader } from "../../core/redux/action";
import AuthService from "../../services/authService";



const MySwal = withReactContent(Swal);


const PRIORITY_CFG = {
  urgent:   { color: "#dc3545", badge: "badge-linedanger",  label: "Urgent"   },
  standard: { color: "#fd7e14", badge: "badge-linewarning", label: "Standard" },
  low:      { color: "#198754", badge: "badge-linesuccess", label: "Low"      },
};



const fmtDate = (dt) =>
  dt
    ? new Date(dt).toLocaleDateString(undefined, {
        year: "numeric", month: "short", day: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "—";

const getPriorityCfg = (key) =>
  PRIORITY_CFG[(key || "").toLowerCase()] || {
    color: "#6c757d", badge: "badge-secondary", label: key || "—",
  };


const showSetDispatchModal = async (record) => {
  const { value: total_days, isConfirmed } = await MySwal.fire({
    title: "Set Dispatch Deadline",
    html: `
      <p class="text-muted small mb-3">
        Set the number of days from today within which the stock for request
        <strong>${record.req_id}</strong> will be dispatched.
      </p>
      <div class="mb-3">
        <label class="form-label small fw-semibold">Days to Dispatch</label>
        <input
          id="swal-dispatch-days"
          type="number"
          min="1"
          max="50"
          value="7"
          class="swal2-input"
          style="max-width: 160px;"
          placeholder="e.g. 7"
        />
        <div class="text-muted small mt-1">Between 1 and 50 days</div>
      </div>
    `,
    icon: "info",
    showCancelButton: true,
     ButtonText: "Save Deadline",
    confirmButtonColor: "#0d6efd",
    cancelButtonText: "Cancel",
    preConfirm: () => {
      const val = parseInt(document.getElementById("swal-dispatch-days")?.value, 10);
      if (!val || val < 1 || val > 50) {
        Swal.showValidationMessage("Please enter a value between 1 and 50.");
        return false;
      }
      return val;
    },
  });

  return { total_days, isConfirmed };
};

const StockRequest = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const reduxStats  = useSelector(selectReqStats);
  const filters     = useSelector(selectReqFilters);
  const sentBucket  = useSelector((s) => s.stock.req.sent);

  const [view,             setView]             = useState("sent");
  const [isFilterVisible,  setIsFilterVisible]  = useState(false);
  const [dispatchLoading,  setDispatchLoading]  = useState(null); // stores req_id being saved

  const activeBucket = sentBucket;
  const requests     = activeBucket.items || [];
  const loading      = activeBucket.loading;
  const pagination   = activeBucket.pagination || { currentPage: 1, totalPages: 1, total: 0 };

  // const headerState = useSelector((state) => state.toggle_header);

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


  const handleSetDispatch = async (e, record) => {
    e.stopPropagation();

    const { total_days, isConfirmed } = await showSetDispatchModal(record);
    if (!isConfirmed) return;

    setDispatchLoading(record.req_id);
    try {
      await AuthService.setStockTransferDeadline(record.req_id, { total_days });
      MySwal.fire({
        icon: "success", title: "Deadline Saved",
        text: `Dispatch deadline set to ${total_days} day${total_days !== 1 ? "s" : ""} from today.`,
        timer: 2500, showConfirmButton: false,
      });
      doFetch();
    } catch (err) {
      console.error("setStockTransferDeadline:", err);
      MySwal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to save dispatch deadline.",
      });
    } finally {
      setDispatchLoading(null);
    }
  };

 
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

  const handlePaginationChange = ({ page, limit }) =>
    dispatch(setReqFilters({ page, limit }));


  const columns = [
    {
      title: "",
      render: (_, record) => (
        <span
          style={{ cursor: "pointer" }}
          onClick={(e) => handleStarToggle(e, record)}
        >
          <i className={`${record.is_starred ? "fas text-warning" : "far text-muted"} fa-star`} />
        </span>
      ),
    },
    {
      title: "",
      render: (_, record) => {
        const priCfg = getPriorityCfg(record.priority);
        return (
          <div
            style={{
              width: 4, height: 38,
              background: priCfg.color,
              borderRadius: 2, margin: "0 auto",
            }}
          />
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
  render: (val) => {
    if (!val) return <span className="text-muted small">—</span>;



    const STATUS_CFG = {
  
  "Pending for Approval":                "badge-linewarning",
  "Followed Up — Awaiting Approval":     "badge-lineinfo",
  "Matter Escalated":                    "badge-linedanger",

 
  "Action Required":                     "badge-linewarning",
  "Awaiting Dispatch — Follow-Up Sent":  "badge-lineinfo",
  "Dispatch Scheduled":                  "badge-linesuccess",
  "Dispatch Planned":                    "badge-lineinfo",
  "Shipping Deadline Approaching":       "badge-linedanger",

  
  "Preparing Shipment":                  "badge-lineinfo",
  "In-Transit":                          "badge-lineinfo",

  // Terminal states
  "Delivered":                           "badge-linesuccess",
  "Request Closed":                      "badge-linesuccess",
  "Resolution required":                 "badge-linedanger",
  "Rejected":                            "badge-linedanger",
};

    const badgeClass = STATUS_CFG[val] || "badge-secondary";
    return <span className={`badge ${badgeClass}`}>{val}</span>;
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

const isApproved       = record.is_approved === true;
const isSupplier       = record.is_supplier === true;
const hasStock         = record.stock_id != null;
const isStockSubmitted = record.is_stock_submitted === true;
const isScheduled      = record.is_scheduled === true;

console.log(record.req_id, { isApproved, isSupplier, isStockSubmitted, isScheduled });

const canSetDispatch = isApproved && isSupplier && !isScheduled && !isStockSubmitted;

const canAddStock    = isSupplier && isScheduled && !isStockSubmitted;


        const isSavingDispatch = dispatchLoading === record.req_id;

        return (
          <div className="d-flex align-items-center" onClick={(e) => e.stopPropagation()}>
            {/* View Details */}
            <div className="edit-delete-action">
              <Link
                className="me-2 p-2"
                to={`/stock-request-details/${record.req_id}`}
                title="View Details"
              >
                <Eye size={16} className="text-info" />
              </Link>
            </div>


            {canSetDispatch && (
              <div className="edit-delete-action">
                <button
                  type="button"
                  className="btn btn-link p-2 me-1"
                  title="Set Dispatch Deadline"
                  disabled={isSavingDispatch}
                  onClick={(e) => handleSetDispatch(e, record)}
                >
                  {isSavingDispatch
                    ? <span className="spinner-border spinner-border-sm text-warning" style={{ width: 14, height: 14 }} />
                    : <Calendar size={16} className="text-warning" />}
                </button>
              </div>
            )}

           
            {canAddStock && (
              <div className="edit-delete-action">
                <button
                  type="button"
                  className="btn btn-link p-2 me-1"
                  title={hasStock ? "Continue Stock Flow" : "Create Stock Flow"}
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

// 
  const statCards = [
    { label: "Total Requests", value: reduxStats.total    || 0, cls: "das5", icon: <Package /> },
    { label: "Pending",        value: reduxStats.pending  || 0, cls: "das6", icon: <Clock />   },
    { label: "Approved",       value: reduxStats.approved || 0, cls: "das7", icon: <ThumbsUp /> },
    { label: "Delivered",      value: reduxStats.received || 0, cls: "das8", icon: <CheckCircle /> },
  ];


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


        <TableHeaderActions
  onRefresh={() => dispatch(fetchSentRequests(filters))}
  pdfEndpoint="/auth/export/stockrequests/pdf"
  excelEndpoint="/auth/export/stockrequests/excel"
  filters={{
    search: filters.search,
    priority: filters.priority,
    status: filters.status,
  }}
  entityName="stockrequests"
/>

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

        {/* Stat cards */}
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

            {/* Table top bar */}
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
                    ),
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

            {/* Filter panel */}
            {isFilterVisible && (
              <div className="card mb-0" id="filter_inputs"
              style={{ display: isFilterVisible ? "block" : "none" }}>
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

            {/* Table */}
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

        {/* Action legend */}
        <div className="d-flex gap-3 flex-wrap mb-3" style={{ fontSize: 12 }}>
          <span className="d-flex align-items-center gap-1 text-muted">
            <Eye size={13} className="text-info" /> View Details
          </span>
          <span className="d-flex align-items-center gap-1 text-muted">
            <Calendar size={13} className="text-warning" /> Set Dispatch Deadline (supplier, after approval)
          </span>
          <span className="d-flex align-items-center gap-1 text-muted">
            <PlusCircle size={13} className="text-success" /> Create / Continue Stock Flow (supplier, after approval)
          </span>
        </div>

      </div>
    </div>
  );
};

export default StockRequest;


















