import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./index.css";
import App from "./App";
import { loadContent } from "./content/load";
import { getEnvironmentId, scanStorage, seedDemoOnFirstVisit } from "./storage/local";

// Limpia lo guardado corrupto antes del primer render y registra los descartes (aviso en el shell).
scanStorage();

// Primera visita (config features.demo_on_first_visit): siembra data/demo-readings.json una sola vez para que el
// tablero nunca arranque vacio. Siguen marcadas demo: true (cartel DEMO DATA + "Remove demo data").
const loaded = loadContent();
if (loaded.ok && loaded.content.app.features.demo_on_first_visit) {
  const { environments, app, demoReadings } = loaded.content;
  const saved = getEnvironmentId();
  const env = environments.find((e) => e.id === saved) ?? environments.find((e) => e.id === app.default_environment) ?? environments[0];
  if (env) {
    const at = Date.now();
    seedDemoOnFirstVisit(
      demoReadings.map((r) => ({ indicatorId: r.indicator_id, value: r.value, environmentId: env.id, timestamp: at - r.minutes_ago * 60_000 })),
    );
  }
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
