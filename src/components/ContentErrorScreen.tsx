import type { ContentError } from "../content/load";
import type { TFunction } from "../content/t";

/** Pantalla de error de contenido. Solo recibe t() y los errores: no depende de ningún otro contenido cargado. */
export function ContentErrorScreen({ errors, t }: { errors: ContentError[]; t: TFunction }) {
  return (
    <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
      <div role="alert" className="rounded-md border-2 border-[#d64545] bg-[#0e1626] p-5">
        <h1 className="text-3xl font-extrabold">{t("content.error.title")}</h1>
        <p className="mt-2 text-lg">{t("content.error.intro")}</p>
        <p className="mt-1 text-[#a9b6d1]">{t("content.error.hint")}</p>
      </div>
      <div className="mt-6 overflow-x-auto rounded-md border border-[#2a3a5c]">
        <table className="w-full min-w-[32rem] border-collapse text-left text-base">
          <thead className="bg-[#16213a]">
            <tr>
              <th scope="col" className="p-3 font-bold">
                {t("content.error.file")}
              </th>
              <th scope="col" className="p-3 font-bold">
                {t("content.error.path")}
              </th>
              <th scope="col" className="p-3 font-bold">
                {t("content.error.message")}
              </th>
            </tr>
          </thead>
          <tbody>
            {errors.map((e, i) => (
              <tr key={`${e.file}-${e.path}-${i}`} className="border-t border-[#2a3a5c] align-top">
                <td className="p-3 font-mono text-sm break-all">{e.file}</td>
                <td className="p-3 font-mono text-sm break-all">{e.path}</td>
                <td className="p-3">{e.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
