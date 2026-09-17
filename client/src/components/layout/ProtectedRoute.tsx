import type { Role } from 'shared';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../auth/useAuth.js';
import { FullPageSpinner } from '../ui/Spinner.js';
import { AccessDenied } from '../ui/AccessDenied.js';

export function ProtectedRoute({ requiredRole }: { requiredRole?: Role }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <AccessDenied />;
  }

  return <Outlet />;
}
