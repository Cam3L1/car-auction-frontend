import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";
import api from "../api";

const Register = ({ onLogin }) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  // lifecycle: this page mounts when its route is visited and
  // unmounts when the user navigates away (React Router)
  useEffect(() => {
    console.log("🟢 Register page mounted");
    return () => console.log("🔴 Register page unmounted");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // inline validation before calling the API
    if (!username || !email || !password) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await api.post("/auth/register", { username, email, password });
      onLogin(res.data.token, res.data.user); // auto-login after registering
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    }
  };

  return (
    <Container style={{ maxWidth: 440 }} className="py-5">
      <div className="auth-card">
        <div className="mb-3">
          <h1 className="fw-bold mb-1">Join CarBid</h1>
          <p className="text-secondary mb-0">Create an account to bid and sell.</p>
        </div>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                placeholder="e.g. jordan_driver"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>
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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Repeat your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </Form.Group>
            <Button type="submit" variant="primary" className="w-100 btn-gradient">
              Register
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
    </Container>
  );
};

export default Register;
