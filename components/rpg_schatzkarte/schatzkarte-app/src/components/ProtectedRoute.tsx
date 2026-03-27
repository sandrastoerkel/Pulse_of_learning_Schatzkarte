// src/components/ProtectedRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import type { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Mindest-Rolle: 'student' = eingeloggt, 'coach' = Coach/Admin, 'admin' = nur Admin */
  requiredRole?: UserRole;
}

export function ProtectedRoute({
  children,
  requiredRole = 'student',
}: ProtectedRouteProps) {
  const { user, role, loading, initialized } = useAuth();
  const location = useLocation();

  // Noch am Laden — Spinner zeigen, nicht redirecten
  if (!initialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-amber-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Nicht eingeloggt → Login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Rolle nicht ausreichend → Karte (Startseite)
  const roleHierarchy: Record<UserRole, number> = {
    student: 0,
    coach: 1,
    admin: 2,
  };

  if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
    return <Navigate to="/karte" replace />;
  }

  return <>{children}</>;
}
