import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  ArrowLeft,
  Package,
  Truck,
  MapPin,
  Calendar,
  User,
  FileText,
  Download,
  CheckCircle,
  Clock,
  AlertCircle,
} from "feather-icons-react/build/IconComponents";
import AuthService from "../../services/authService";
import Table from "../../core/pagination/datatable";

const MySwal = withReactContent(Swal);

const STATUS_BADGE = {
  "in-transit": "badge-linewarning",
  delivered: "badge-lineinfo",
};

const STATUS_ALERT = {
  "in-transit": "warning",
  delivered: "success",
};

const StatusIcon = ({ status }) => {
  if (status === "in-transit")
    return <Truck size={16} className="text-warning" />;
  if (status === "delivered")
    return <Package size={16} className="text-info" />;
  return <AlertCircle size={16} className="text-secondary" />;
};

StatusIcon.propTypes = {
  status: PropTypes.string,
};

const StockFlowDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [stockFlow, setStockFlow] = useState(null);
  const [products, setProducts] = useState([]);
  const [totalQty, setTotalQty] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
    // eslint-disable-next-line
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);

      const sfRes = await AuthService.getStockFlowById(id);
      const sf = sfRes.data.data;
      setStockFlow(sf);

      const prodRes = await AuthService.getStockFlowProducts(id);

      const prods = prodRes.data.data || [];

      setProducts(prods);
      ``;
      setTotalQty(
        prodRes.data.total_qty ?? prods.reduce((s, p) => s + (p.count || 0), 0),
      );
    } catch (err) {
      console.error("fetchDetails error:", err);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load stock flow details",
        timer: 2000,
      }).then(() => navigate("/stock-transfer"));
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async () => {
    try {
      const res = await AuthService.downloadStockFlowInvoice(id);
      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stock-flow-${id}-invoice.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to download invoice",
        timer: 2000,
      });
    }
  };

  const statusBreakdown = products.reduce((acc, p) => {
    const s = p.status || "unknown";
    acc[s] = (acc[s] || 0) + (parseInt(p.count) || 0);
    return acc;
  }, {});

  const statusBadgeCls = (s) =>
    s === "new"
      ? "badge-success"
      : s === "used"
        ? "badge-warning"
        : s === "broken"
          ? "badge-danger"
          : "badge-secondary";

  const columns = [
    {
      title: "#",
      render: (_, __, i) => i + 1,
      width: "50px",
    },
    {
      title: "Unique Code",
      dataIndex: "partial_code",
      render: (text) => (
        <span className="badge badge-primary">{text || "—"}</span>
      ),
    },
    {
      title: "Article Profile",
      dataIndex: "article_profile_name",
      render: (text) => text || "—",
    },
    {
      title: "Warehouse",
      dataIndex: "warehouse_name",
      render: (text) => text || "—",
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span className={`badge ${statusBadgeCls(text)}`}>
          {text?.toUpperCase() || "—"}
        </span>
      ),
    },
    {
      title: "Transfer Qty",
      dataIndex: "count",
      render: (text) => (
        <span className="badge badge-info">
          <Package size={12} className="me-1" />
          {text ?? "—"}
        </span>
      ),
    },
    {
      title: "Current Stock",
      dataIndex: "current_stock",
      render: (text) =>
        text === null || text === undefined ? (
          <span className="text-muted small">—</span>
        ) : (
          <span
            className={`badge ${text <= 0 ? "badge-danger" : text <= 5 ? "badge-warning" : "badge-success"}`}
          >
            {text}
          </span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="page-wrapper">
        <div
          className="content d-flex justify-content-center align-items-center"
          style={{ minHeight: 400 }}
        >
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" />
            <p>Loading stock flow details…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stockFlow) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="alert alert-danger">Stock flow not found.</div>
        </div>
      </div>
    );
  }

  const displayId = stockFlow.stock_id || stockFlow.id;
  const alertVariant = STATUS_ALERT[stockFlow.status] || "secondary";
  const badgeCls = STATUS_BADGE[stockFlow.status] || "badge-secondary";

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Stock Flow Details</h4>
              <h6>Complete transfer information</h6>
            </div>
          </div>
          <div className="page-btn d-flex gap-2">
            <button onClick={handleDownloadInvoice} className="btn btn-primary">
              <Download size={16} className="me-2" />
              Download Invoice
            </button>
            <Link to="/stock-transfer" className="btn btn-secondary">
              <ArrowLeft size={16} className="me-2" />
              Back
            </Link>
          </div>
        </div>

        <div
          className={`alert alert-${alertVariant} d-flex align-items-center mb-4`}
        >
          <StatusIcon status={stockFlow.status} />
          <div className="ms-3">
            <h5 className="mb-1">
              {displayId}
              <span className={`badge ${badgeCls} ms-2`}>
                {stockFlow.status?.replace("-", " ").toUpperCase()}
              </span>
            </h5>
            <p className="mb-0 small text-muted">
              Created {new Date(stockFlow.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-6 col-md-12">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-4">
                  <MapPin size={18} className="me-2" />
                  Route
                </h5>
                <label className="form-label text-muted small">From</label>
                <div className="alert alert-light mb-3 py-2">
                  <strong>{stockFlow.from_warehouse_name || "—"}</strong>
                </div>
                <div className="text-center my-2">
                  <Truck size={22} className="text-primary" />
                </div>
                <label className="form-label text-muted small">To</label>
                <div className="alert alert-light mb-0 py-2">
                  <strong>{stockFlow.to_warehouse_name || "—"}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Flow Details */}
          <div className="col-lg-6 col-md-12">
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="mb-4">
                  <FileText size={18} className="me-2" />
                  Details
                </h5>

                <div className="row mb-3">
                  <div className="col-6">
                    <p className="text-muted small mb-1">Transport</p>
                    <span className="badge badge-info">
                      {stockFlow.transport || "—"}
                    </span>
                  </div>
                  <div className="col-6">
                    <p className="text-muted small mb-1">Status</p>
                    <span className={`badge ${badgeCls}`}>
                      {stockFlow.status?.replace("-", " ") || "—"}
                    </span>
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-6">
                    <p className="text-muted small mb-1">Products</p>
                    <strong>
                      {products.length} item{products.length !== 1 ? "s" : ""}
                    </strong>
                  </div>
                  <div className="col-6">
                    <p className="text-muted small mb-1">Total Transfer Qty</p>
                    <strong
                      className="text-primary"
                      style={{ fontSize: "1.1rem" }}
                    >
                      {totalQty}
                    </strong>
                  </div>
                </div>

                {Object.keys(statusBreakdown).length > 0 && (
                  <div className="mb-3">
                    <p className="text-muted small mb-1">
                      Qty by Product Status
                    </p>
                    <div className="d-flex gap-2 flex-wrap">
                      {Object.entries(statusBreakdown).map(([s, qty]) => (
                        <span key={s} className={`badge ${statusBadgeCls(s)}`}>
                          {s.charAt(0).toUpperCase() + s.slice(1)}: {qty}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {stockFlow.description && (
                  <div>
                    <p className="text-muted small mb-1">Description</p>
                    <p className="mb-0">{stockFlow.description}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Delivery Info */}
        {stockFlow.status === "delivered" && stockFlow.received_by && (
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="mb-4">
                <CheckCircle size={18} className="me-2 text-success" />
                Delivery Confirmation
              </h5>
              <div className="row">
                <div className="col-md-4 mb-3">
                  <p className="text-muted small mb-1">Received By</p>
                  <p className="mb-0">
                    <User size={14} className="me-1" />
                    <strong>{stockFlow.received_by}</strong>
                  </p>
                </div>
                <div className="col-md-4 mb-3">
                  <p className="text-muted small mb-1">Received Quantity</p>
                  <p className="mb-0">
                    <Package size={14} className="me-1" />
                    <strong>{stockFlow.received_quantity}</strong>
                  </p>
                </div>
                <div className="col-md-4 mb-3">
                  <p className="text-muted small mb-1">Received Date</p>
                  <p className="mb-0">
                    <Calendar size={14} className="me-1" />
                    {stockFlow.received_at
                      ? new Date(stockFlow.received_at).toLocaleString()
                      : new Date(stockFlow.updated_at).toLocaleString()}
                  </p>
                </div>
                {stockFlow.receive_remarks && (
                  <div className="col-12">
                    <p className="text-muted small mb-1">Remarks</p>
                    <p className="mb-0">{stockFlow.receive_remarks}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Products Table */}
        <div className="card mb-4">
          <div className="card-body">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <h5 className="mb-0">
                <Package size={18} className="me-2" />
                Products ({products.length})
                {totalQty > 0 && (
                  <span className="badge badge-primary ms-2">
                    Total Qty: {totalQty}
                  </span>
                )}
              </h5>
            </div>

            {products.length === 0 ? (
              <div className="alert alert-info d-flex align-items-center">
                <AlertCircle size={16} className="me-2" />
                No products found in this stock flow.
              </div>
            ) : (
              <div className="table-responsive">
                <Table columns={columns} dataSource={products} />
              </div>
            )}
          </div>
        </div>

        {/* Timeline */}
        <div className="card">
          <div className="card-body">
            <h5 className="mb-4">
              <Clock size={18} className="me-2" />
              Timeline
            </h5>

            <div className="timeline">
              <div className="timeline-item d-flex align-items-start mb-3">
                <div
                  className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-warning text-white flex-shrink-0"
                  style={{ width: 32, height: 32 }}
                >
                  <Truck size={14} />
                </div>
                <div>
                  <h6 className="mb-1">In Transit</h6>
                  <p className="text-muted mb-0 small">
                    Stock submitted and dispatched
                    {stockFlow.created_at
                      ? ` · ${new Date(stockFlow.created_at).toLocaleString()}`
                      : ""}
                  </p>
                </div>
              </div>

              {stockFlow.status === "delivered" && (
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
                      {stockFlow.received_by
                        ? `Received by ${stockFlow.received_by}`
                        : "Delivery confirmed"}
                      {stockFlow.received_at
                        ? ` · ${new Date(stockFlow.received_at).toLocaleString()}`
                        : stockFlow.updated_at
                          ? ` · ${new Date(stockFlow.updated_at).toLocaleString()}`
                          : ""}
                    </p>
                  </div>
                </div>
              )}

              {stockFlow.status === "in-transit" && (
                <div className="timeline-item d-flex align-items-start">
                  <div
                    className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle border flex-shrink-0"
                    style={{ width: 32, height: 32, borderStyle: "dashed" }}
                  >
                    <Package size={14} className="text-muted" />
                  </div>
                  <div>
                    <h6 className="mb-1 text-muted">Awaiting Delivery</h6>
                    <p className="text-muted mb-0 small">
                      Pending confirmation from receiver
                    </p>
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

export default StockFlowDetails;
