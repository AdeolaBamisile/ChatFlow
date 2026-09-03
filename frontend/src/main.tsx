import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import "./Styles/App.css";
import "./Styles/Discover&Requests.css";
import "./Styles/Chats.css";
import "./Styles/LoginForm.css";
import "./Styles/Settings.css";

import App from "./App";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Router>
      <App />
    </Router>
  </StrictMode>,
);
