import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

// createRoot attaches React to the <div id="root"> in index.html.
// Everything React renders lives inside this root.
createRoot(document.getElementById("root")).render(
  // StrictMode is development-only: it double-invokes component bodies and
  // runs effects mount → unmount → mount to surface impure code and missing cleanups.
  <StrictMode>
    <App />
  </StrictMode>,
);
