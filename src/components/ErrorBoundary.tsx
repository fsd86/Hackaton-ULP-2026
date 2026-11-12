import { Component, type ReactNode } from "react";
import type { TFunction } from "../content/t";
import { clearAll } from "../storage/local";
import { ConfirmDialog } from "./ConfirmDialog";

interface Props {
  t: TFunction;
  /** Mensaje del cuerpo (error.body para una vista; error.fatal.body para el último recurso). */
  bodyKey?: string;
  children: ReactNode;
}

interface State {
  error: Error | null;
  attempt: number; // remonta los hijos al reintentar
  confirmOpen: boolean;
}

/** Evita la pantalla en blanco: muestra el error, permite reintentar y borrar lo guardado (con confirmación). */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, attempt: 0, confirmOpen: false };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error): void {
    console.error("ErrorBoundary caught:", error);
  }

  private retry = (): void => {
    this.setState((s) => ({ error: null, attempt: s.attempt + 1, confirmOpen: false }));
  };

  private reset = (): void => {
    try {
      clearAll();
    } catch {
      /* ignorar */
    }
    this.retry();
  };

  render(): ReactNode {
    const { t, bodyKey = "error.body", children } = this.props;
    const { error, attempt, confirmOpen } = this.state;
    if (!error) return <div key={attempt} className="contents">{children}</div>;

    const btn =
      "inline-flex min-h-14 items-center justify-center rounded-md border-2 border-[var(--color-line)] bg-[var(--color-panel-2)] px-5 text-lg font-bold text-[var(--color-text)] hover:border-[var(--color-accent)]";
    return (
      <section
        role="alert"
        aria-labelledby="error-title"
        className="rounded-md border-2 border-l-8 border-[var(--status-critical)] bg-[var(--color-panel)] p-5"
      >
        <h1 id="error-title" className="text-2xl font-extrabold">
          <span aria-hidden="true">⚠ </span>
          {t("error.title")}
        </h1>
        <p className="mt-2 text-lg">{t(bodyKey)}</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={this.retry}
            className="inline-flex min-h-14 items-center justify-center rounded-md bg-[var(--color-accent)] px-5 text-lg font-bold text-[#070b14] hover:brightness-110"
          >
            {t("error.retry")}
          </button>
          <button type="button" onClick={() => this.setState({ confirmOpen: true })} className={btn}>
            {t("error.reset")}
          </button>
        </div>
        <ConfirmDialog
          open={confirmOpen}
          title={t("storage.clear.title")}
          body={t("storage.clear.body")}
          stayLabel={t("storage.clear.cancel")}
          leaveLabel={t("storage.clear.confirm")}
          onStay={() => this.setState({ confirmOpen: false })}
          onLeave={this.reset}
        />
      </section>
    );
  }
}
