
// ============================================
// PermissionGuard Component
// components/PermissionGuard.jsx


import React from 'react';
import { usePermissions } from '../hooks/usePermission'; 
import { Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Component to conditionally render content based on permissions
 */
export const PermissionGuard = ({ 
  module, 
  action, 
  children, 
  fallback = null,
  showMessage = false 
}) => {
  const { hasPermission, loading } = usePermissions();

  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  if (!hasPermission(module, action)) {
    if (showMessage) {
      return (
        <Alert variant="warning">
          You don't have permission to {action} {module}
        </Alert>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

PermissionGuard.propTypes = {
  module: PropTypes.string.isRequired,
  action: PropTypes.string,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  showMessage: PropTypes.bool
};
