import { Outlet, Navigate } from 'react-router';
import { useAuth } from "@/provider/auth-context";
import React from 'react';



const AuthLayout = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>
  };

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />
  };

  
  return <Outlet />
}

export default AuthLayout;