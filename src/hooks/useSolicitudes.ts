import { useCallback, useEffect, useState } from "react";
import type { Solicitud } from "@/types/solicitudes";
import { CRM_ZOGEN_API_BASE } from "@/lib/constants";

type Status = "idle" | "loading" | "ready" | "error";

export function useSolicitudes(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [status, setStatus] = useState<Status>(autoFetch ? "loading" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchSolicitudes = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(`${CRM_ZOGEN_API_BASE}/solicitudes`);
      if (!response.ok) {
        throw new Error("No se pudo obtener la información");
      }

      const data = await response.json();
      const apiSolicitudes = data.solicitudes ?? [];

      // Obtener solicitudes locales
      const localSolicitudes: Solicitud[] = [];
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('zogen-solicitudes');
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            localSolicitudes.push(...parsed);
          } catch (e) {
            console.error('Error parsing local solicitudes:', e);
          }
        }
      }

      // Combinar ambas fuentes
      setSolicitudes([...localSolicitudes, ...apiSolicitudes]);
      setStatus("ready");
    } catch (error) {
      console.error("Error cargando solicitudes:", error);
      setStatus("error");
      setErrorMessage("No pudimos cargar las solicitudes. Intenta nuevamente.");
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchSolicitudes();
    }
  }, [autoFetch, fetchSolicitudes]);

  return {
    solicitudes,
    status,
    errorMessage,
    fetchSolicitudes,
  };
}
