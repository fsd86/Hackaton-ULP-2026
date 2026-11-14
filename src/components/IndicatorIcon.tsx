import type { ReactNode } from "react";
import type { IndicatorIconName } from "../content/schemas";

/** Iconos SVG propios (trazo, 24x24). El nombre sale de data/indicators.json → icon. Decorativos: el nombre va en texto. */
const ICONS: Record<IndicatorIconName, ReactNode> = {
  heart: <path d="M12 20.5s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 7.5 2.7C19.5 15.9 12 20.5 12 20.5Z" strokeLinejoin="round" />,
  pulse: <path d="M3 12h4l2-6 4 12 2-6h6" strokeLinecap="round" strokeLinejoin="round" />,
  gauge: (
    <>
      <path d="M4 16a8 8 0 1 1 16 0" strokeLinecap="round" />
      <path d="m12 16 4-5" strokeLinecap="round" />
      <path d="M12 16h.01" strokeLinecap="round" />
    </>
  ),
  drop: <path d="M12 3s6 6.2 6 10.5a6 6 0 0 1-12 0C6 9.2 12 3 12 3Z" strokeLinejoin="round" />,
  thermometer: (
    <>
      <path d="M10 14.5V5a2 2 0 0 1 4 0v9.5a4 4 0 1 1-4 0Z" strokeLinejoin="round" />
      <path d="M12 9v7" strokeLinecap="round" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" strokeLinejoin="round" />,
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.5 14a4 4 0 0 0 7 0M9 10h.01M15 10h.01" strokeLinecap="round" />
    </>
  ),
};

export function IndicatorIcon({ name, className = "h-6 w-6" }: { name?: IndicatorIconName | undefined; className?: string }) {
  return (
    <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" className={`${className} shrink-0 fill-none stroke-current stroke-[1.75]`}>
      {ICONS[name ?? "pulse"]}
    </svg>
  );
}
