
import PropTypes from "prop-types";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  ArrowLeft, Package, Truck, MapPin, Calendar,
  User, FileText, CheckCircle, Clock, AlertCircle,
  Send, ThumbsUp, ThumbsDown, Mail,
} from "feather-icons-react/build/IconComponents";
import AuthService from "../../services/authService";

const MySwal = withReactContent(Swal);


const PRIORITY_CFG = {
  urgent:   { color: "#dc3545", badge: "badge-linedanger",  label: "Urgent"   },
  standard: { color: "#fd7e14", badge: "badge-linewarning", label: "Standard" },
  low:      { color: "#198754", badge: "badge-linesuccess", label: "Low"      },
};



const STATUS_CFG = {
 
  "Pending for Approval":                { badge: "badge-linewarning", alertVariant: "warning", icon: "clock" },
  "Followed Up — Awaiting Approval":     { badge: "badge-lineinfo",    alertVariant: "info",    icon: "clock" },
  "Matter Escalated":                    { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert" },


  "Action Required":                     { badge: "badge-linewarning", alertVariant: "warning", icon: "alert" },
  "Awaiting Dispatch — Follow-Up Sent":  { badge: "badge-lineinfo",    alertVariant: "info",    icon: "clock" },
  "Dispatch Scheduled":                  { badge: "badge-linesuccess", alertVariant: "success", icon: "check" },
  "Dispatch Planned":                    { badge: "badge-lineinfo",    alertVariant: "info",    icon: "clock" },
  "Shipping Deadline Approaching":       { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert" },


  "Preparing Shipment":                  { badge: "badge-lineinfo",    alertVariant: "info",    icon: "truck" },
  "In-Transit":                          { badge: "badge-lineinfo",    alertVariant: "info",    icon: "truck" },


  "Delivered":                           { badge: "badge-linesuccess", alertVariant: "success", icon: "check" },
  "Request Closed":                      { badge: "badge-linesuccess", alertVariant: "success", icon: "check" },
  "Resolution required":                 { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert" },
  "Rejected":                            { badge: "badge-linedanger",  alertVariant: "danger",  icon: "alert" },
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


const StatusIcon = ({ icon, size = 16 }) => {
  if (icon === "truck") return <Truck size={size} />;
  if (icon === "check") return <CheckCircle size={size} />;
  if (icon === "alert") return <AlertCircle size={size} />;
  return <Clock size={size} />;
};
StatusIcon.propTypes = { icon: PropTypes.string, size: PropTypes.number };


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


  const handleApprove = async () => {
    const { isConfirmed } = await MySwal.fire({
      title: "Approve Stock Request",
      html: `
        <p class="text-muted small mb-3">
          Confirm approval of stock request <strong>${id}</strong>.
          The dispatcher will be notified to schedule the dispatch.
        </p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Approve",
      confirmButtonColor: "#198754",
      cancelButtonText: "Cancel",
    });

    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      await AuthService.reviewStockRequest(id, { decision: "approved" });
      MySwal.fire({
        icon: "success", title: "Approved!",
        text: "Stock request approved successfully.",
        timer: 2500, showConfirmButton: false,
      });
      fetchDetails();
    } catch (err) {
      console.error("reviewStockRequest approve:", err);
      MySwal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to approve request.",
      });
    } finally {
      setActionLoading(false);
    }
  };


  const handleReject = async () => {
    const { value: rejection_reason, isConfirmed } = await MySwal.fire({
      title: "Reject Stock Request",
      html: `
        <p class="text-muted small mb-3">
          Please provide a reason for rejecting stock request <strong>${id}</strong>.
          This reason will be sent to the requester via email.
        </p>
        <textarea
          id="swal-rejection-reason"
          class="swal2-textarea"
          placeholder="Enter rejection reason (required)…"
          rows="4"
          maxlength="255"
          style="resize: vertical; font-size: 14px;"
        ></textarea>
        <div class="text-muted small mt-1 text-end" id="char-counter">0 / 255</div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reject Request",
      confirmButtonColor: "#dc3545",
      cancelButtonText: "Cancel",
      didOpen: () => {
        const ta      = document.getElementById("swal-rejection-reason");
        const counter = document.getElementById("char-counter");
        if (ta && counter) {
          ta.addEventListener("input", () => {
            counter.textContent = `${ta.value.length} / 255`;
          });
        }
      },
      preConfirm: () => {
        const reason = document.getElementById("swal-rejection-reason")?.value?.trim();
        if (!reason) {
          Swal.showValidationMessage("Rejection reason is required.");
          return false;
        }
        if (reason.length > 255) {
          Swal.showValidationMessage("Reason must be 255 characters or fewer.");
          return false;
        }
        return reason;
      },
    });

    if (!isConfirmed) return;

    setActionLoading(true);
    try {
      await AuthService.reviewStockRequest(id, { decision: "rejected", rejection_reason });
      MySwal.fire({
        icon: "success", title: "Rejected",
        text: "Stock request rejected and the requester has been notified.",
        timer: 2500, showConfirmButton: false,
      });
      fetchDetails();
    } catch (err) {
      console.error("reviewStockRequest reject:", err);
      MySwal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to reject request.",
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
      await AuthService.markStockReceived(id);
      MySwal.fire({
        icon: "success", title: "Received!",
        text: "Stock delivery confirmed successfully.",
        timer: 2500, showConfirmButton: false,
      });
      fetchDetails();
    } catch (err) {
      console.error("markStockReceived:", err);
      MySwal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to confirm delivery.",
      });
    } finally {
      setActionLoading(false);
    }
  };


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


const computedStatus = request.status || "—";
const statusCfg      = getStatusCfg(computedStatus);
const priorityCfg    = getPriorityCfg(request.priority);

  // const canReview =
  //   request.can_review === true &&
  //   request.review_at  === null ;

  const canReview =
    request.can_review === true &&
    request.review_at  === null &&
    request.rejection_reason === null;


  const canReceive =
    request.is_recipient === true &&
    request.stock_id    != null &&
    request.submitted_at != null &&
    request.delivered_at == null &&
     request.grn_timestamp == null;

  const totalQty = articles.reduce((s, a) => s + (Number(a.quantity) || 0), 0);

  const ccEmails = Array.isArray(request.cc_recipients)
    ? request.cc_recipients
    : typeof request.cc_recipients === "string"
    ? (() => {
        try { return JSON.parse(request.cc_recipients); }
        catch { return request.cc_recipients.split(",").map((e) => e.trim()); }
      })()
    : [];


const isApproved = request.review_at !== null && request.rejection_reason === null;

  return (
    <div className="page-wrapper">
      <div className="content">

        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Stock Request Details</h4>
              <h6>Complete request information</h6>
            </div>
          </div>

          <div className="page-btn d-flex gap-2 flex-wrap">

      
            {canReview && (
              <button
                className="btn btn-success"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <span className="spinner-border spinner-border-sm me-2" />
                  : <ThumbsUp size={16} className="me-2" />}
                Approve
              </button>
            )}

        
            {canReview && (
              <button
                className="btn btn-danger"
                onClick={handleReject}
                disabled={actionLoading}
              >
                {actionLoading
                  ? <span className="spinner-border spinner-border-sm me-2" />
                  : <ThumbsDown size={16} className="me-2" />}
                Reject
              </button>
            )}

            {/* Confirm delivery  */}
            {canReceive && (
              <button
                className="btn btn-success"
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

        {/* ── Status alert ── */}
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

        {/* ── Role badge ── */}
        {(request.is_recipient || request.can_review) && (
          <div className="alert alert-light py-2 mb-3 d-flex align-items-center gap-2">
            <User size={15} />
            <span className="small">
              You are viewing this as{" "}
              <strong>
                {request.can_review
                  ? "Inventory Controller"
                  : request.is_recipient
                  ? "Recipient"
                  : "Supplier"}
              </strong>.
            </span>
          </div>
        )}

        {/* ── Rejection reason banner ── */}
        {(request.status || "").toLowerCase() === "rejected" && request.rejection_reason && (
          <div className="alert alert-danger d-flex align-items-start gap-2 mb-4">
            <AlertCircle size={18} className="flex-shrink-0 mt-1" />
            <div>
              <strong>Rejection Reason:</strong>
              <p className="mb-0 mt-1">{request.rejection_reason}</p>
              {request.reviewer_name && request.reviewer_name !== "No Decision Yet" && (
                <p className="mb-0 mt-1 small text-muted">
                  Rejected by <strong>{request.reviewer_name}</strong>
                  {request.review_at ? ` · ${fmtDate(request.review_at)}` : ""}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ── Route + Details cards ── */}
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

                {/* Follow-up & Escalation */}
                <div className="row mb-3">
                  {request.follow_up_enabled !== undefined && (
                    <div className="col-6">
                      <p className="text-muted small mb-1">Follow-up</p>
                      <span className={`badge ${request.follow_up_enabled ? "badge-linesuccess" : "badge-secondary"}`}>
                        {request.follow_up_enabled ? `${request.follow_up_days}d` : "Off"}
                      </span>
                      {request.is_follow_up_sent && (
                        <div className="text-muted" style={{ fontSize: 11 }}>Sent ✓</div>
                      )}
                    </div>
                  )}
                  {request.escalation_enabled !== undefined && (
                    <div className="col-6">
                      <p className="text-muted small mb-1">Escalation</p>
                      <span className={`badge ${request.escalation_enabled ? "badge-linewarning" : "badge-secondary"}`}>
                        {request.escalation_enabled ? `${request.escalation_days}d` : "Off"}
                      </span>
                      {request.is_escalation_sent && (
                        <div className="text-muted" style={{ fontSize: 11 }}>Sent ✓</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Resolution Required */}
                {request.resolution_required_enabled !== undefined && (
                  <div className="mb-3">
                    <p className="text-muted small mb-1">Resolution Required</p>
                    <span className={`badge ${request.resolution_required_enabled ? "badge-linedanger" : "badge-secondary"}`}>
                      {request.resolution_required_enabled ? `${request.resolution_required_days}d` : "Off"}
                    </span>
                    {request.is_resolution_required_sent && (
                      <div className="text-muted" style={{ fontSize: 11 }}>Sent ✓</div>
                    )}
                  </div>
                )}
  
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

        {/* ── Reviewer info ── */}
       

      {request.reviewer_name && request.reviewer_name !== "No Decision Yet" && (
  <div className="card mb-4">
    <div className="card-body">
      <h5 className="mb-4">
        {isApproved
          ? <><ThumbsUp size={18} className="me-2 text-success" />Approval Information</>
          : <><ThumbsDown size={18} className="me-2 text-danger" />Rejection Information</>}
      </h5>
      <div className="row">
        <div className="col-md-4 mb-3">
          <p className="text-muted small mb-1">Reviewed By</p>
          <p className="mb-0"><User size={14} className="me-1" />{request.reviewer_name}</p>
        </div>
        {request.review_at && (
          <div className="col-md-4 mb-3">
            <p className="text-muted small mb-1">
              {isApproved ? "Approved At" : "Rejected At"}
            </p>
            <p className="mb-0">
              <Calendar size={14} className="me-1" />{fmtDate(request.review_at)}
            </p>
          </div>
        )}
        {/* These only make sense for approved requests */}
        {isApproved && request.dispatch_given_at && (
          <div className="col-md-4 mb-3">
            <p className="text-muted small mb-1">Dispatch Given At</p>
            <p className="mb-0">
              <Calendar size={14} className="me-1" />{fmtDate(request.dispatch_given_at)}
            </p>
          </div>
        )}
        {isApproved && request.scheduled_dispatch && (
          <div className="col-md-4 mb-3">
            <p className="text-muted small mb-1">Scheduled Dispatch</p>
            <p className="mb-0">
              <Truck size={14} className="me-1" />{fmtDate(request.scheduled_dispatch)}
            </p>
          </div>
        )}
        {isApproved && request.stock_id && (
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
                  <p className="mb-0"><Calendar size={14} className="me-1" />{fmtDate(request.delivered_at)}</p>
                </div>
                {request.grn_timestamp && (
                  <div className="col-md-4 mb-3">
                    <p className="text-muted small mb-1">GRN Timestamp</p>
                    <p className="mb-0"><Calendar size={14} className="me-1" />{fmtDate(request.grn_timestamp)}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Articles table ─── */}
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

  {/* 1. Created — always first */}
  <div className="timeline-item d-flex align-items-start mb-3">
    <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-primary text-white flex-shrink-0"
      style={{ width: 32, height: 32 }}>
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

  {/* 2. Follow-up */}
  {request.is_follow_up_sent && (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-info text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
        <Mail size={14} />
      </div>
      <div>
        <h6 className="mb-1">Follow-up Sent</h6>
        <p className="text-muted mb-0 small">Automatic follow-up reminder sent</p>
      </div>
    </div>
  )}

  {/* 3. Escalation */}
  {request.is_escalation_sent && (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-danger text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
        <AlertCircle size={14} />
      </div>
      <div>
        <h6 className="mb-1">Escalated</h6>
        <p className="text-muted mb-0 small">Request escalated due to no response</p>
      </div>
    </div>
  )}

  {/* 4a. Rejected */}
  {request.review_at && !isApproved && (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-danger text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
        <ThumbsDown size={14} />
      </div>
      <div>
        <h6 className="mb-1">Rejected</h6>
        <p className="text-muted mb-0 small">
          {request.reviewer_name && request.reviewer_name !== "No Decision Yet"
            ? `Rejected by ${request.reviewer_name}`
            : "Request rejected"}
          {request.review_at ? ` · ${fmtDate(request.review_at)}` : ""}
        </p>
        {request.rejection_reason && (
          <p className="text-danger mb-0 small mt-1">
            Reason: {request.rejection_reason}
          </p>
        )}
      </div>
    </div>
  )}

  {/* 4b. Approved */}
  {isApproved && request.review_at && (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
        <ThumbsUp size={14} />
      </div>
      <div>
        <h6 className="mb-1">Approved</h6>
        <p className="text-muted mb-0 small">
          {request.reviewer_name && request.reviewer_name !== "No Decision Yet"
            ? `Approved by ${request.reviewer_name}`
            : ""}
          {request.review_at ? ` · ${fmtDate(request.review_at)}` : ""}
        </p>
      </div>
    </div>
  )}

  {/* 5. Dispatch date set */}
  {isApproved && request.dispatch_given_at && (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-secondary text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
        <Calendar size={14} />
      </div>
      <div>
        <h6 className="mb-1">Dispatch Date Set</h6>
        <p className="text-muted mb-0 small">
          Supplier set dispatch deadline · {fmtDate(request.dispatch_given_at)}
          {request.scheduled_dispatch
            ? ` · Expected by ${fmtDate(request.scheduled_dispatch)}`
            : ""}
        </p>
      </div>
    </div>
  )}

  {/* 6. Stock flow created (drafted, not yet submitted) */}
  {request.stock_id && !request.submitted_at && (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-warning text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
        <Package size={14} />
      </div>
      <div>
        <h6 className="mb-1">Stock Flow Created</h6>
        <p className="text-muted mb-0 small">
          Draft linked to{" "}
          <span className="badge badge-primary" style={{ fontFamily: "monospace" }}>
            {request.stock_id}
          </span>
        </p>
      </div>
    </div>
  )}

  {/* 7. In transit (submitted) */}
  {request.stock_id && request.submitted_at && (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-info text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
        <Truck size={14} />
      </div>
      <div>
        <h6 className="mb-1">In Transit</h6>
        <p className="text-muted mb-0 small">
          Stock dispatched under{" "}
          <span className="badge badge-primary" style={{ fontFamily: "monospace" }}>
            {request.stock_id}
          </span>
          {" · "}{fmtDate(request.submitted_at)}
        </p>
      </div>
    </div>
  )}

  {/* 8. Delivered or Awaiting */}
  {request.delivered_at ? (
    <div className="timeline-item d-flex align-items-start mb-3">
      <div className="timeline-icon me-3 d-flex align-items-center justify-content-center rounded-circle bg-success text-white flex-shrink-0"
        style={{ width: 32, height: 32 }}>
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
    !request.review_at || isApproved ? (
      // Only show "Awaiting" if not rejected
      computedStatus !== "Rejected" && (
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
      )
    ) : null
  )}

</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StockRequestDetails;