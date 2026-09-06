import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import NavBar from "./components/NavBar";
import ProtectedRoute, { AdminRoute } from "./components/ProtectedRoute";
import Home from "./components/Home";
import Login from "./components/Login";
import Register from "./components/Register";
import CarDetail from "./components/CarDetail";
import CreateListing from "./components/CreateListing";
import Profile from "./components/Profile";
import AdminDashboard from "./components/AdminDashboard";

// App is the ROOT component: it owns the auth state and the route table.
// Every page component below is mounted/unmounted by React Router when
// the URL changes (watch the console logs while navigating).
const App = () => {
  // ---- auth state ----
  // user is null when logged out. It is initialised from localStorage
  // so a page refresh does NOT log the user out.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // called by Login/Register after a successful API response:
  // saves the JWT + user in localStorage (token management), then
  // updates state -> React re-renders the navbar and routes
  const handleLogin = (token, userData) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  // clears the session and drops the user back to the public pages
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      {/* navbar receives the user and the logout handler via props */}
      <NavBar user={user} onLogout={handleLogout} />

      <Routes>
        {/* public routes - no login needed */}
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/cars/:id" element={<CarDetail user={user} />} />

        {/* protected routes (normal user) - the guard components
            redirect to /login when no user is logged in */}
        <Route
          path="/create-listing"
          element={
            <ProtectedRoute user={user}>
              <CreateListing user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute user={user}>
              <Profile user={user} />
            </ProtectedRoute>
          }
        />

        {/* protected routes (admin only) - AdminRoute redirects normal
            users back to the home page */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute user={user}>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* fallback: any unknown URL goes back home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
