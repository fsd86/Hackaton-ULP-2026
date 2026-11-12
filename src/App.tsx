import { useEffect, useRef } from "react";
import { ContentProvider, useContent } from "./content/ContentContext";
import { loadContent } from "./content/load";
import { createT } from "./content/t";
import stringsRaw from "../config/strings.en.json";
import { EnvironmentProvider } from "./environment/EnvironmentProvider";
import { useHashRoute } from "./hooks/useHashRoute";
import { ContentErrorScreen } from "./components/ContentErrorScreen";
import { DelayBanner } from "./components/DelayBanner";
import { EmptyState } from "./components/EmptyState";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { MainNav } from "./components/MainNav";
import { ViewPlaceholder } from "./components/ViewPlaceholder";
import { DailyCheck } from "./views/DailyCheck";
import { EmergencyView } from "./views/EmergencyView";
import { ReportView } from "./views/ReportView";
import { SourcesView } from "./views/SourcesView";

/** Aplica el tema de config/app.json como CSS variables en <html>. */
function useTheme(): void {
  const { content } = useContent();
  const { theme } = content.app;
  useEffect(() => {
    const root = document.documentElement;
    root.dataset.mode = theme.mode;
    root.style.setProperty("--color-accent", theme.accent);
    root.style.setProperty("--color-emergency", theme.status_colors.critical);
    for (const [status, color] of Object.entries(theme.status_colors)) {
      root.style.setProperty(`--status-${status}`, color);
    }
  }, [theme]);
}

function Shell() {
  const { t, content } = useContent();
  const { route, param, navigate } = useHashRoute();
  const mainRef = useRef<HTMLElement>(null);
  const first = useRef(true);
  useTheme();

  // Al cambiar de vista: título del documento y foco al contenido (lectores de pantalla / teclado).
  useEffect(() => {
    document.title = `${t(route.navKey)} — ${content.app.app_name}`;
    if (first.current) {
      first.current = false;
      return;
    }
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
      <a
        href="#main"
        onClick={(e) => {
          e.preventDefault();
          mainRef.current?.focus();
        }}
        className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded-md focus:bg-[var(--color-accent)] focus:px-4 focus:py-3 focus:font-bold focus:text-[#070b14]"
      >
        {t("nav.skip_to_content")}
      </a>
      <Header onEmergency={() => navigate("emergency")} emergencyActive={route.id === "emergency"} />
      <DelayBanner />
      <MainNav current={route.id} />
      <main id="main" ref={mainRef} tabIndex={-1} className="mx-auto min-h-[50vh] max-w-5xl px-4 py-6">
        {route.id === "check" ? (
          <DailyCheck />
        ) : route.id === "emergency" ? (
          <EmergencyView param={param} navigate={navigate} />
        ) : route.id === "report" ? (
          <ReportView />
        ) : route.id === "sources" ? (
          <SourcesView param={param} />
        ) : (
          <ViewPlaceholder titleKey={route.navKey} />
        )}
      </main>
      <Footer />
    </EnvironmentProvider>
  );
}

export default function App() {
  const result = loadContent();

  if (!result.ok) {
    // Usa el JSON de strings directo: funciona aunque el resto del contenido esté roto.
    const t = createT(stringsRaw as Record<string, string>, { strict: false });
    return <ContentErrorScreen errors={result.errors} t={t} />;
  }

  return (
    <ContentProvider content={result.content}>
      <Shell />
    </ContentProvider>
  );
}
