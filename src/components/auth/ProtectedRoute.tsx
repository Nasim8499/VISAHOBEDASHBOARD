import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth, AppRole } from "@/context/AuthContext";

export function ProtectedRoute({
  children,
  allow,
}: {
  children: ReactNode;
  allow?: AppRole[];
}) {
  const { session, role, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center">
        <div className="size-10 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }
  if (!session) return <Navigate to="/auth" state={{ from: location }} replace />;
  if (allow && role && !allow.includes(role)) {
    // Clients always land on their portal
    if (role === "client") return <Navigate to="/portal" replace />;
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}
