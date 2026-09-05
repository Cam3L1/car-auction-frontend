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

const App = () => {
  // the logged-in user is read from localStorage so the session
  // survives a page refresh, and passed down through props
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const handleLogin = (token, userData) => {
    localStorage.setItem("token", token); // JWT token management
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <>
      <NavBar user={user} onLogout={handleLogout} />
      <Routes>
        {/* public routes */}
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} />} />
        <Route path="/cars/:id" element={<CarDetail user={user} />} />

        {/* protected routes (normal user) */}
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

        {/* protected routes (admin only) */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute user={user}>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
};

export default App;
