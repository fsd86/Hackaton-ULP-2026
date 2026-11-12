import { ContentProvider } from "./content/ContentContext";
import { loadContent } from "./content/load";
import { createT } from "./content/t";
import stringsRaw from "../config/strings.en.json";

// App mínima de S0: muestra "ok" o la lista de errores de contenido. El frontend la reemplaza.
export default function App() {
  const result = loadContent();
  // La pantalla de error usa el JSON de strings directo: funciona aunque el resto del contenido esté roto.
  const t = createT(stringsRaw as Record<string, string>, { strict: false });

  if (!result.ok) {
    return (
      <main className="p-6">
        <h1 className="text-xl font-bold">{t("content.error.title")}</h1>
        <p>{t("content.error.intro")}</p>
        <ul className="mt-4 space-y-2">
          {result.errors.map((e, i) => (
            <li key={i}>
              <strong>{t("content.error.file")}:</strong> {e.file} — <strong>{t("content.error.path")}:</strong>{" "}
              <code>{e.path}</code> — {e.message}
            </li>
          ))}
        </ul>
      </main>
    );
  }

  return (
    <ContentProvider content={result.content}>
      <main className="p-6">{t("content.loaded")}</main>
    </ContentProvider>
  );
}
