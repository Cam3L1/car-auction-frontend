import { Navigate } from "react-router-dom";

// Guard component for authenticated NORMAL-user routes
// (/create-listing, /profile).
//
// How it works: it does not render the page itself - it renders
// EITHER its children (when a user is logged in) OR a <Navigate>
// that instantly redirects to /login. No state, no API call: the
// check is pure client-side against the user prop from App.
const ProtectedRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

// Guard for ADMIN routes (/admin/dashboard):
//   - not logged in        -> /login
//   - logged in, not admin -> / (home) - they cannot see the dashboard
export const AdminRoute = ({ user, children }) => {
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== "admin") return <Navigate to="/" replace />;
  return children;
};

export default ProtectedRoute;
