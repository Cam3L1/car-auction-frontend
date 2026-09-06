import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import api from "../api";

// The login page (/login) - public.
//
// Flow trace:
//   user types -> controlled state -> submit ->
//   inline validation -> POST /auth/login ->
//   success: onLogin(token, user) saves them in localStorage
//            (see App.jsx) and navigate("/") goes home
//   failure: the API's message shows in an alert
const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // lifecycle: this page mounts when its route is visited and
  // unmounts when the user navigates away (React Router)
  useEffect(() => {
    console.log("🟢 Login page mounted");
    return () => console.log("🔴 Login page unmounted");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // inline validation before calling the API
    if (!email || !password) {
      setError("Email and password are required.");
      return;
    }

    try {
      const res = await api.post("/auth/login", { email, password });
      // hand the token + user up to App: it saves them to localStorage
      // and updates the navbar
      onLogin(res.data.token, res.data.user);
      navigate("/");
    } catch (err) {
      // the backend's own message, e.g. "Invalid credentials"
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <Container style={{ maxWidth: 440 }} className="py-5">
      <div className="auth-card">
        <div className="mb-3">
          <h1 className="fw-bold mb-1">Welcome back</h1>
          <p className="text-secondary mb-0">Log in to bid on your next car.</p>
        </div>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Button type="submit" variant="primary" className="w-100 btn-gradient">
            Login
          </Button>
        </Form>
        <p className="text-center mt-3 mb-0">
          New to MazadJo? <Link to="/register">Create an account</Link>
        </p>
      </div>
    </Container>
  );
};

export default Login;
