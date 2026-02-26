import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ me, children }) {
  if (!me) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
