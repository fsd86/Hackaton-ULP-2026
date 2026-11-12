// Utilidades de exportación del informe: nombre de archivo (puro) y descarga (DOM).

export function slugify(text: string): string {
  const slug = text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "report";
}

const pad = (n: number): string => String(n).padStart(2, "0");

/** "<slug>-report-YYYYMMDD-HHMM.<ext>" en hora local. */
export function reportFilename(appName: string, now: Date, ext: "txt" | "json"): string {
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${slugify(appName)}-report-${date}-${time}.${ext}`;
}

export function downloadFile(filename: string, mime: string, content: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
