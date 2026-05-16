import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';

const WorkerProfileRedirect = () => {
  const { user } = useAuth();
  if (!user?.id) {
    return <Navigate to="/worker/dashboard" replace />;
  }
  return <Navigate to={`/worker/workers/${user.id}`} replace />;
};

export default WorkerProfileRedirect;
