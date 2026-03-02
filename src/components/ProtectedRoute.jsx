import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to user's own dashboard if they try to access a forbidden role
    const dashboardPath =
      user?.role === "teacher"
        ? "/teacher"
        : user?.role === "parent"
        ? "/parent"
        : "/student";
    return <Navigate to={dashboardPath} replace />;
  }

  return children;
}
