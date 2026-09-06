import axios from "axios";

// ALL API calls in the app go through this ONE axios instance.
// It is pre-configured with the backend base URL, so components only
// write the path:
//
//   api.get("/cars")   ->  GET http://localhost:5001/api/cars
const API_URL = "http://localhost:5001/api";

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
