import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute: User:", user);
  console.log("ProtectedRoute: isAuthenticated:", isAuthenticated);
  console.log("ProtectedRoute: isLoading:", isLoading);

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    console.log("ProtectedRoute: Redirecting to login...");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}