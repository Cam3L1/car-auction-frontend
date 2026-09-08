import axios from "axios";

// ALL API calls in the app go through this ONE axios instance.
// It is pre-configured with the backend base URL, so components only
// write the path:
//
//   api.get("/cars")   ->  GET <API_URL>/cars
//
// In development the fallback points at the local backend.
// In production Vite injects VITE_API_URL at BUILD time (Railway env var).
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
});

// The backend rejects requests without a valid JWT (401). Protected
// calls attach the token like this:
//
//   api.get("/users/profile", { headers: authHeaders() })
//
// authHeaders() reads the token from localStorage (it was saved there
// by Login/Register right after a successful login) and returns it in
// the exact format the backend's auth middleware expects:
//
//   Authorization: Bearer <token>
export function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default api;
