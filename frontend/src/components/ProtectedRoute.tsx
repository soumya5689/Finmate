import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Authentication has been removed.
 * This component now simply renders children.
 * Kept only to avoid breaking existing routing structure.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  return <>{children}</>;
};

export default ProtectedRoute;
