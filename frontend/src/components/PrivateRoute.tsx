import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, CircularProgress } from '@mui/material';

/**
 * Props for the PrivateRoute component
 */
interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Optional roles for role-based access control
}

/**
 * PrivateRoute Component
 * 
 * This component is used to protect routes that require authentication.
 * It also supports role-based access control by checking if the user has the required roles.
 * If the user is not authenticated, they are redirected to the login page.
 * If the user doesn't have the required roles, they are redirected to the dashboard.
 * 
 * @param children - The components to render if the user is authenticated and has the required roles
 * @param roles - Optional array of roles that are allowed to access the route
 */
export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}; 