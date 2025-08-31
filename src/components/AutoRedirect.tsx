import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAutoAuth } from '@/hooks/useAutoAuth';
import AuthLoading from './AuthLoading';

const AutoRedirect: React.FC = () => {
  const { user, loading } = useAutoAuth();

  if (loading) {
    return <AuthLoading />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/auth" replace />;
};

export default AutoRedirect;
