import { useId, type CSSProperties, type ReactNode } from "react";

/**
 * Panel de vidrio con titulo monoespaciado, borde de 1px y (opcional) esquinas con marco.
 * El titulo es el encabezado accesible de la seccion (h2 por defecto, h3 con headingLevel=3).
 */
export function FramePanel({
  title,
  corners = false,
  headingLevel = 2,
  aside,
  className = "",
  bodyClassName = "",
  delayMs = 0,
  children,
  ...rest
}: {
  title: string;
  corners?: boolean;
  headingLevel?: 2 | 3;
  /** Contenido a la derecha del titulo (p. ej. un control). */
  aside?: ReactNode;
  className?: string;
  bodyClassName?: string;
  /** Retraso de la aparicion suave (escalonado entre paneles). */
  delayMs?: number;
  children: ReactNode;
} & { "data-testid"?: string; id?: string }) {
  const id = useId();
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const style = { animationDelay: `${delayMs}ms` } as CSSProperties;
  return (
    <section aria-labelledby={id} style={style} className={`glass appear relative rounded-sm ${className}`} {...rest}>
      {corners && (
        <>
          <span aria-hidden="true" className="corner corner-tl" />
          <span aria-hidden="true" className="corner corner-tr" />
          <span aria-hidden="true" className="corner corner-bl" />
          <span aria-hidden="true" className="corner corner-br" />
        </>
      )}
      <div className="flex items-center justify-between gap-3 border-b border-[var(--glass-border)] px-4 py-2.5">
        <Heading id={id} className="eyebrow panel-title flex items-center gap-2">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 bg-[var(--color-accent)]" />
          {title}
        </Heading>
        {aside}
      </div>
      <div className={`p-4 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
