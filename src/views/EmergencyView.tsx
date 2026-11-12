import { useEffect, useRef, useState } from "react";
import { useContent } from "../content/ContentContext";
import type { RouteId } from "../hooks/useHashRoute";
import {
  clearEmergencySession,
  getEmergencySession,
  startEmergencySession,
  type EmergencySession,
} from "../storage/local";
import { isSessionStale } from "../logic/emergency";
import { ProtocolList } from "./emergency/ProtocolList";
import { StaleSessionPrompt } from "./emergency/StaleSessionPrompt";
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
  const [initial] = useState<EmergencySession | null>(() => getEmergencySession()); // una sola lectura
  const [session, setSession] = useState<EmergencySession | null>(initial);
  const exiting = useRef(false); // evita recrear la sesión mientras el hash aún conserva el id
  const maxAgeHours = content.app.emergency_session_max_age_hours;
  // Sesión vieja (o con hora inválida/futura): no se reanuda sola, se pregunta. Se decide una vez al abrir la vista.
  const [stale, setStale] = useState<boolean>(
    () =>
      initial !== null &&
      (param === undefined || param === initial.protocolId) &&
      isSessionStale(initial.startedAt, Date.now(), maxAgeHours),
  );

  // Sin id en la ruta pero con sesión activa → retomar (urgencia: cero clics extra).
  const activeId = param ?? session?.protocolId;
  const protocol = protocols.find((p) => p.id === activeId);

  // Garantiza una sesión para el protocolo abierto (p. ej. llegando desde un enlace del chequeo diario).
  useEffect(() => {
    if (param === undefined && !stale) exiting.current = false;
    if (!exiting.current && protocol && session?.protocolId !== protocol.id) {
      setSession(startEmergencySession(protocol.id));
      setStale(false);
    }
  }, [protocol, session, param, stale]);

  if (stale && session && protocol && session.protocolId === protocol.id) {
    return (
      <StaleSessionPrompt
        session={session}
        protocolTitle={protocol.title}
        now={Date.now()}
        onContinue={() => setStale(false)}
        onStartOver={() => {
          setSession(startEmergencySession(protocol.id));
          setStale(false);
        }}
        onBack={() => {
          exiting.current = true;
          clearEmergencySession();
          setSession(null);
          setStale(false);
          navigate("emergency");
        }}
      />
    );
  }

  if (!protocol) {
    return (
      <ProtocolList
        protocols={protocols}
        invalidId={param !== undefined}
        onStart={(id) => {
          exiting.current = false;
          setStale(false);
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
