import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole }: { 
  children: React.ReactNode;
  requiredRole?: 'trainer' | 'client';
}) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
