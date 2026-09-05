import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";
import api from "../api";

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

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
      onLogin(res.data.token, res.data.user); // save JWT + user in localStorage
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.");
    }
  };

  return (
    <Container style={{ maxWidth: 420 }}>
      <Card className="shadow-sm">
        <Card.Body>
          <Card.Title className="mb-3">Login</Card.Title>
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
            <Button type="submit" variant="primary" className="w-100">
              Login
            </Button>
          </Form>
          <p className="text-center mt-3 mb-0">
            New to CarBid? <Link to="/register">Create an account</Link>
          </p>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Login;
