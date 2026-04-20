import React from 'react';
import { usePermissions } from '../hooks/usePermission';
import { Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';


export const RoleGuard = ({ 
  roles, 
  children, 
  fallback = null,
  showMessage = false 
}) => {
  const { hasRole, loading, userRole } = usePermissions();

  if (loading) {
    return fallback || <div>Loading...</div>;
  }

  if (!hasRole(roles)) {
    if (showMessage) {
      return (
        <Alert variant="warning">
          Access restricted. Required role: {Array.isArray(roles) ? roles.join(', ') : roles}
          <br />
          Your role: {userRole || 'None'}
        </Alert>
      );
    }
    return fallback;
  }

  return <>{children}</>;
};

RoleGuard.propTypes = {
  roles: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string)
  ]).isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
  showMessage: PropTypes.bool
};


