import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Los headers de seguridad están en dos lugares: vercel.json (también lo usa `vite preview`) y
// public/_headers (Netlify; Vite lo copia a dist/). Este test evita que diverjan.
type VercelJson = { headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }> };

function vercelHeaders(): Record<string, string> {
  const v = JSON.parse(readFileSync(resolve("vercel.json"), "utf8")) as VercelJson;
  const all = (v.headers ?? []).find((h) => h.source === "/(.*)");
  return Object.fromEntries((all?.headers ?? []).map((h) => [h.key, h.value]));
}

function netlifyHeaders(): Record<string, string> {
  const lines = readFileSync(resolve("public/_headers"), "utf8").split(/\r?\n/);
  const out: Record<string, string> = {};
  let inAll = false;
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith("#")) continue;
    if (!/^\s/.test(line)) {
      inAll = line.trim() === "/*";
      continue;
    }
    if (!inAll) continue;
    const i = line.indexOf(":");
    out[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return out;
}

describe("security headers", () => {
  it("public/_headers (Netlify) matches vercel.json", () => {
    const v = vercelHeaders();
    expect(Object.keys(v).length).toBeGreaterThan(0);
    expect(netlifyHeaders()).toEqual(v);
  });
});
