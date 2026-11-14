import { useEffect, useRef } from "react";
import { ContentProvider, useContent } from "./content/ContentContext";
import { loadContent } from "./content/load";
import { createT } from "./content/t";
import stringsRaw from "../config/strings.en.json";
import { EnvironmentProvider } from "./environment/EnvironmentProvider";
import { GuidedDemoProvider } from "./components/guided/GuidedDemo";
import { useHashRoute } from "./hooks/useHashRoute";
import { ContentErrorScreen } from "./components/ContentErrorScreen";
import { DemoBanner } from "./components/DemoBanner";
import { SpaceBackdrop } from "./components/SpaceBackdrop";
import { EmptyState } from "./components/EmptyState";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Footer } from "./components/Footer";
import { StorageNotice } from "./components/StorageNotice";
import { useStorageState } from "./hooks/useStorageState";
import { FeatureDisabled } from "./components/FeatureDisabled";
import { isRouteEnabled } from "./logic/features";
import { Header } from "./components/Header";
import { PrototypeNotice } from "./components/PrototypeNotice";
import { BaselineView } from "./views/BaselineView";
import { DailyCheck } from "./views/DailyCheck";
import { EmergencyView } from "./views/EmergencyView";
import { ReportView } from "./views/ReportView";
import { SourcesView } from "./views/SourcesView";
import { StatusBoard } from "./views/StatusBoard";

/** Aplica el tema de config/app.json como CSS variables en <html>. */
function useTheme(): void {
  const { content } = useContent();
  const { theme } = content.app;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = theme.mode;
    root.style.setProperty("--color-accent", theme.accent);
    if (theme.mode === "dark") {
      const s = theme.surfaces;
      root.style.setProperty("--color-ink", s.background);
      root.style.setProperty("--color-panel", s.panel);
      root.style.setProperty("--color-panel-2", s.panel_raised);
      root.style.setProperty("--glass-bg", s.glass);
      root.style.setProperty("--glass-border", s.glass_border);
      root.style.setProperty("--color-line", s.line);
      root.style.setProperty("--color-text", s.text);
      root.style.setProperty("--color-muted", s.muted);
    }
    root.style.setProperty("--color-emergency", theme.status_colors.critical);
    root.style.setProperty("--emergency-bg", theme.emergency_button.background);
    root.style.setProperty("--emergency-text", theme.emergency_button.text);
    root.style.setProperty("--color-warm", theme.warm.accent);
    root.style.setProperty("--color-hot", theme.warm.hot);
    root.style.setProperty("--warm-glow", theme.warm.glow);
    root.style.setProperty("--space-star", theme.space.stars);
    root.style.setProperty("--space-horizon", theme.space.horizon);
    root.style.setProperty("--space-rim", theme.space.horizon_rim);
    for (const [status, color] of Object.entries(theme.status_colors)) {
      root.style.setProperty(`--status-${status}`, color);
    }
  }, [theme]);
}

function Shell() {
  const { t, content } = useContent();
  const { route, param, navigate } = useHashRoute();
  const mainRef = useRef<HTMLElement>(null);
  // Ultima ruta enfocada: el foco solo se mueve al cambiar de vista (no en el primer render ni en el doble
  // efecto de StrictMode, que hacia saltar la pagina al cargar).
  const lastRoute = useRef(route);
  const { version } = useStorageState();
  const features = content.app.features;
  useTheme();

  // Al cambiar de vista: título del documento y foco al contenido (lectores de pantalla / teclado).
  useEffect(() => {
    document.title = `${t(route.navKey)} — ${content.app.app_name}`;
    if (lastRoute.current === route) return;
    lastRoute.current = route;
    mainRef.current?.focus();
  }, [route, t, content.app.app_name]);

  if (content.environments.length === 0) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <EmptyState title={t("environment.empty")} help={t("environment.empty.help")} />
      </main>
    );
  }

  return (
    <EnvironmentProvider>
      {/* La demo guiada agrega su overlay fijo como hermano del contenido (despues del footer). */}
      <GuidedDemoProvider>
      <SpaceBackdrop />
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-sm focus:bg-[var(--color-accent)] focus:px-4 focus:py-3 focus:font-bold focus:text-[#05080f]"
      >
        {t("nav.skip_to_content")}
      </a>
      <Header current={route.id} onEmergency={() => navigate("emergency")} emergencyActive={route.id === "emergency"} />
      <DemoBanner />
      <StorageNotice />
      {/* Aviso fijo en todas las vistas (va antes de <main> para que el lector de pantalla lo lea primero). */}
      <PrototypeNotice />
      <main
        id="main"
        ref={mainRef}
        tabIndex={-1}
        className={`mx-auto min-h-[50vh] px-4 pb-6 ${route.id === "home" ? "max-w-[1760px] pt-3" : "max-w-5xl pt-6"}`}
      >
        {/* La clave remonta la vista al cambiar de ruta o al borrar los datos guardados. */}
        <ErrorBoundary key={`${route.id}/${param ?? ""}/${version}`} t={t}>
          {route.id === "check" ? (
            <DailyCheck key={param ?? ""} param={param} />
          ) : route.id === "emergency" ? (
            isRouteEnabled("emergency", features) ? (
              <EmergencyView param={param} navigate={navigate} />
            ) : (
              <FeatureDisabled titleKey={route.navKey} />
            )
          ) : route.id === "report" ? (
            isRouteEnabled("report", features) ? <ReportView /> : <FeatureDisabled titleKey={route.navKey} />
          ) : route.id === "baseline" ? (
            isRouteEnabled("baseline", features) ? <BaselineView /> : <FeatureDisabled titleKey={route.navKey} />
          ) : route.id === "sources" ? (
            <SourcesView param={param} />
          ) : (
            <StatusBoard />
          )}
        </ErrorBoundary>
      </main>
      <Footer />
      </GuidedDemoProvider>
    </EnvironmentProvider>
  );
}

export default function App() {
  const result = loadContent();
  // Usa el JSON de strings directo: funciona aunque el resto del contenido esté roto.
  const rawT = createT(stringsRaw as Record<string, string>, { strict: false });

  if (!result.ok) {
    return <ContentErrorScreen errors={result.errors} t={rawT} />;
  }

  // Último recurso: si el propio shell explota, nunca queda la pantalla en blanco.
  return (
    <ErrorBoundary t={rawT} bodyKey="error.fatal.body">
      <ContentProvider content={result.content}>
        <Shell />
      </ContentProvider>
    </ErrorBoundary>
  );
}
