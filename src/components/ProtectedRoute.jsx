import { Navigate } from "react-router-dom";

// Guard for authenticated normal-user routes (/create-listing, /profile):
// redirects to the login page when there is no logged-in user.
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Guard for admin routes (/admin/dashboard):
// normal users are redirected back to the home page.
export const AdminRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
