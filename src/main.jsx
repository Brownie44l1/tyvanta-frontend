import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Ping the backend immediately on app load to wake Render from sleep
fetch("https://tyvanta-api.onrender.com/health").catch(() => {});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);