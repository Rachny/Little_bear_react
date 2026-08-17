import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/useAuth";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter basename="/Little_bear_react/">
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);