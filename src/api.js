import axios from "axios";

// Single axios instance pointing at the backend REST API.
const API_URL = "http://localhost:5001/api";

const api = axios.create({
  baseURL: API_URL,
});

// Build the Authorization headers from the JWT stored in localStorage
// so authenticated requests are automatically signed.
export function authHeaders() {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default api;
