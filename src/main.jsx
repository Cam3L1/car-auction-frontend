import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";

// Entry point of the whole app:
//   1. BrowserRouter wraps everything so React Router can control the
//      URL and decide which page component to mount
//   2. Bootstrap CSS is imported here (once, globally)
//   3. index.css (our dark blue design system) comes AFTER Bootstrap
//      so our variables override the defaults
//   4. App is rendered into the <div id="root"> from index.html
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);
