import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import {
  Edit,
  Package,
  Trash2,
  Plus,
  X,
  Clock,
  User,
  Calendar,
  FileText,
  AlertCircle,
  RefreshCw,
  MapPin,
  Home,
} from "feather-icons-react/build/IconComponents";
import AuthService from "../../services/authService";
import PropTypes from "prop-types";

const ProductActivity = ({ productUuid }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [allActivities, setAllActivities] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
  });

  
  const fetchActivities = async (limit = 5) => {
    try {
      setLoading(true);
      const response = await AuthService.getProductActivities(productUuid, limit);
      
      if (response.data.success) {
        setActivities(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      
    
    } finally {
      setLoading(false);
    }
  };

  // Fetch all activities for modal
  const fetchAllActivities = async (page = 1) => {
    try {
      const response = await AuthService.getAllProductActivities(productUuid, {
        page,
        limit: pagination.limit,
      });

      if (response.data.success) {
        setAllActivities(response.data.data || []);
        if (response.data.pagination) {
          setPagination(response.data.pagination);
        }
      }
    } catch (error) {
      console.error("Error fetching all activities:", error);
      
      
  }
}

  useEffect(() => {
    if (productUuid) {
      fetchActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productUuid]);

  const getActivityIcon = (action) => {
    const iconProps = { size: 18, className: "text-white" };

    switch (action) {
      case "created":
        return (
          <div className="activity-icon bg-linesuccess">
            <Plus {...iconProps} />
          </div>
        );
      case "updated":
        return (
          <div className="activity-icon bg-primary">
            <Edit {...iconProps} />
          </div>
        );
      case "status_changed":
        return (
          <div className="activity-icon bg-linewarning">
            <RefreshCw {...iconProps} />
          </div>
        );
      case "deleted":
        return (
          <div className="activity-icon bg-linedanger">
            <Trash2 {...iconProps} />
          </div>
        );
      case "warehouse_changed":
        return (
          <div className="activity-icon bg-lineinfo">
            <Home {...iconProps} />
          </div>
        );
      case "location_changed":
        return (
          <div className="activity-icon bg-secondary">
            <MapPin {...iconProps} />
          </div>
        );
      case "quantity_updated":
        return (
          <div className="activity-icon bg-purple">
            <Package {...iconProps} />
          </div>
        );
      default:
        return (
          <div className="activity-icon bg-secondary">
            <AlertCircle {...iconProps} />
          </div>
        );
    }
  };

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600)
      return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)} days ago`;

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewAll = () => {
    fetchAllActivities();
    setShowModal(true);
  };

  const ActivityItem = ({ activity, showDetails = false }) => (
    <div className="activity-item">
      <div className="activity-content">
        <div className="activity-icon-wrapper">{getActivityIcon(activity.action)}</div>
        <div className="activity-details">
          <div className="activity-header">
            <h6 className="activity-title">{activity.description}</h6>
            <span className="activity-time">
              <Clock size={14} className="me-1" />
              {formatDateTime(activity.performed_at)}
            </span>
          </div>
          <p className="activity-user">
            <User size={14} className="me-1" />
            {activity.performed_by}
          </p>
          {showDetails && activity.details && (
            <div className="activity-details-box">
              <strong>Details:</strong>
              <pre className="activity-json">
                {JSON.stringify(activity.details, null, 2)}
              </pre>
            </div>
          )}
          <small className="activity-date">
            <Calendar size={12} className="me-1" />
            {new Date(activity.performed_at).toLocaleString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </small>
        </div>
      </div>
    </div>
  );

  


  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="text-center p-4">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-2 text-muted">Loading activity log...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="card">
        <div className="card-body">
          <div className="activity-header-section ">
            <h5 className="activity-main-title">
              <FileText size={20} className="me-2 text-primary" />
              Recent Activity
            </h5>
            <span className="d-flex justify-content-end">

            <button
              className="btn btn-sm btn-outline-primary"
              onClick={handleViewAll}
              >
              View All Activity
            </button>
              </span>
          </div>



          {activities.length === 0 ? (
            <div className="activity-empty">
              <AlertCircle size={48} className="text-muted mb-3" />
              <p className="text-muted mb-0">No activity recorded yet</p>
            </div>
          ) : (
            <div className="activity-timeline">
              {activities.map((activity) => (
                <ActivityItem key={activity.id} activity={activity} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header>
          <Modal.Title>
            <FileText size={20} className="me-2" />
            All Activity Log
          </Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowModal(false)}
            aria-label="Close"
          >
            <X />
          </button>
        </Modal.Header>
        <Modal.Body className="activity-modal-body">
          {allActivities.length === 0 ? (
            <div className="activity-empty">
              <AlertCircle size={48} className="text-muted mb-3" />
              <p className="text-muted mb-0">No activity recorded</p>
            </div>
          ) : (
            <div className="activity-timeline-modal">
              {allActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  activity={activity}
                  showDetails={true}
                />
              ))}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-secondary"
            onClick={() => setShowModal(false)}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

ProductActivity.propTypes = {
  productUuid: PropTypes.string.isRequired,
};

  ProductActivity.propTypes = {
    activity: PropTypes.shape({
      id: PropTypes.number.isRequired,
      action: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      performed_by: PropTypes.string.isRequired,
      performed_at: PropTypes.string.isRequired,
      details: PropTypes.object,
    }).isRequired,
    showDetails: PropTypes.bool,
  };

export default ProductActivity;