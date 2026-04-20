import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);


  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }


  return element;
};

ProtectedRoute.propTypes = {
  element: PropTypes.element.isRequired,
};

export default ProtectedRoute;