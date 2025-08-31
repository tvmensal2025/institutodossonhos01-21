import React, { ReactNode } from 'react';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import AuthLoading from './AuthLoading';
import { Navigate } from 'react-router-dom';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children, requireAuth = true }) => {
  const { user, loading } = useAutoAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

export default AuthGuard;
