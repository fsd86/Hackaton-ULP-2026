import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { scanStorage } from "./storage/local";

// Limpia lo guardado corrupto antes del primer render y registra los descartes (aviso en el shell).
scanStorage();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
