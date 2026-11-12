import type { ReactNode } from "react";

/** Íconos SVG propios, indexados por el nombre que viene de config.theme.status_icons. */
const PATHS: Record<string, ReactNode> = {
  "check-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 3 3 5-6" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "alert-triangle": (
    <>
      <path d="M12 3 2 21h20L12 3Z" strokeLinejoin="round" />
      <path d="M12 10v5M12 18h.01" strokeLinecap="round" />
    </>
  ),
  "alert-octagon": (
    <>
      <path d="M8 3h8l5 5v8l-5 5H8l-5-5V8l5-5Z" strokeLinejoin="round" />
      <path d="M12 8v5M12 16h.01" strokeLinecap="round" />
    </>
  ),
  "help-circle": (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01" strokeLinecap="round" />
    </>
  ),
};

export function StatusIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      className={`${className} shrink-0 fill-none stroke-current stroke-2`}
    >
      {PATHS[name] ?? PATHS["help-circle"]}
    </svg>
  );
}
