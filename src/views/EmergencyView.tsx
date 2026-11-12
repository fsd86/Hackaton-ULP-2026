import { useEffect, useRef, useState } from "react";
import { useContent } from "../content/ContentContext";
import type { RouteId } from "../hooks/useHashRoute";
import {
  clearEmergencySession,
  getEmergencySession,
  startEmergencySession,
  type EmergencySession,
} from "../storage/local";
import { ProtocolList } from "./emergency/ProtocolList";
import { ProtocolRun } from "./emergency/ProtocolRun";

/**
 * Emergency mode. Ruta #/emergency[/<protocolId>].
 * Sesión: el protocolo en curso y su hora de inicio se guardan en storage (recargar retoma).
 * El log de acciones es histórico (no se borra al reiniciar); cada entrada lleva el sessionId
 * y la vista solo muestra las de la sesión actual. "Start over" abre una sesión nueva.
 */
export function EmergencyView({
  param,
  navigate,
}: {
  param: string | undefined;
  navigate: (id: RouteId, param?: string) => void;
}) {
  const { content } = useContent();
  const { protocols } = content;
  const [session, setSession] = useState<EmergencySession | null>(() => getEmergencySession());
  const exiting = useRef(false); // evita recrear la sesión mientras el hash aún conserva el id

  // Sin id en la ruta pero con sesión activa → retomar (urgencia: cero clics extra).
  const activeId = param ?? session?.protocolId;
  const protocol = protocols.find((p) => p.id === activeId);

  // Garantiza una sesión para el protocolo abierto (p. ej. llegando desde un enlace del chequeo diario).
  useEffect(() => {
    if (!exiting.current && protocol && session?.protocolId !== protocol.id) {
      setSession(startEmergencySession(protocol.id));
    }
  }, [protocol, session]);

  if (!protocol) {
    return (
      <ProtocolList
        protocols={protocols}
        invalidId={param !== undefined}
        onStart={(id) => {
          setSession(startEmergencySession(id));
          navigate("emergency", id);
        }}
      />
    );
  }

  if (!session || session.protocolId !== protocol.id) return null; // un tick hasta que el efecto crea la sesión

  return (
    <ProtocolRun
      key={session.sessionId}
      protocol={protocol}
      session={session}
      onRestart={() => setSession(startEmergencySession(protocol.id))}
      onExit={() => {
        exiting.current = true;
        clearEmergencySession();
        setSession(null);
        navigate("home");
      }}
    />
  );
}
