import { useCallback, useEffect, useState } from "react";
import type { Solicitud } from "@/types/solicitudes";

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
      const response = await fetch("/api/solicitudes");
      if (!response.ok) {
        throw new Error("No se pudo obtener la información");
      }

      const data = await response.json();
      setSolicitudes(data.solicitudes ?? []);
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
