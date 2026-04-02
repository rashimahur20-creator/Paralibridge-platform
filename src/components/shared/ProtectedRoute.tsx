import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { isFirebaseConfigured } from '../../firebase/config';
import LoadingSpinner from './LoadingSpinner';

interface Props {
  children: React.ReactNode;
  role?: 'farmer' | 'buyer' | 'baler';
}

export default function ProtectedRoute({ children, role }: Props) {
  const { currentUser, userProfile, loading } = useAuth();

  if (loading) return <LoadingSpinner />;

  if (!currentUser) return <Navigate to={`/auth?role=${role}`} replace />;

  const cachedRole = localStorage.getItem('pb_role');

  // If Firebase not configured, allow access in demo mode
  if (!userProfile) {
    if (cachedRole && cachedRole !== role) {
      return <Navigate to={`/${cachedRole}`} replace />;
    }
    return <>{children}</>;
  }

  if (userProfile.role !== role) {
    return <Navigate to={`/${userProfile.role}`} replace />;
  }

  return <>{children}</>;
}
