import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Content } from "./load";
import { createT, type TFunction } from "./t";

interface ContentValue {
  content: Content;
  t: TFunction;
}

const ContentCtx = createContext<ContentValue | null>(null);

export function ContentProvider({ content, children }: { content: Content; children: ReactNode }) {
  const value = useMemo<ContentValue>(
    () => ({ content, t: createT(content.strings, { strict: import.meta.env.DEV }) }),
    [content],
  );
  return <ContentCtx.Provider value={value}>{children}</ContentCtx.Provider>;
}

export function useContent(): ContentValue {
  const ctx = useContext(ContentCtx);
  if (!ctx) throw new Error("useContent must be used inside <ContentProvider>");
  return ctx;
}
