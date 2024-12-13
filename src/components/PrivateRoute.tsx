import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../context/userContext';

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: ('admin' | 'employee')[];
}

export default function PrivateRoute({ children, roles }: PrivateRouteProps) {
  const user = useUser()

  if (!user) {
    return <Navigate to="/login" />;
  }

  // if (roles && !roles.includes(user.role)) {
  //   return <Navigate to="/dashboard" />;
  // }

  return <>{children}</>;
}