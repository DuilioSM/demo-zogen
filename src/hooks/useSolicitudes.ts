import { useCallback, useEffect, useState } from "react";
import type { Solicitud } from "@/types/solicitudes";
import { CRM_ZOGEN_API_BASE } from "@/lib/constants";

type Status = "idle" | "loading" | "ready" | "error";

let cachedSolicitudes: Solicitud[] | null = null;
let cachedStatus: Status = "idle";
let cachedError: string | null = null;
let cachedPromise: Promise<void> | null = null;
let localHydrated = false;

const hydrateFromLocalStorage = () => {
  if (localHydrated) return;
  if (typeof window === 'undefined') return;
  localHydrated = true;
  try {
    const stored = window.localStorage.getItem('zogen-solicitudes');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        cachedSolicitudes = parsed;
        cachedStatus = 'ready';
        cachedError = null;
      }
    }
  } catch (error) {
    console.error('Error hydrating solicitudes from localStorage:', error);
  }
};

export function useSolicitudes(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;
  hydrateFromLocalStorage();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>(cachedSolicitudes ?? []);
  const [status, setStatus] = useState<Status>(
    cachedSolicitudes ? cachedStatus : autoFetch ? 'loading' : 'idle'
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(cachedError);

  const syncFromCache = useCallback(() => {
    setSolicitudes(cachedSolicitudes ?? []);
    setStatus(cachedStatus);
    setErrorMessage(cachedError);
  }, []);

  const fetchSolicitudes = useCallback(async () => {
    hydrateFromLocalStorage();

    if (cachedPromise) {
      await cachedPromise;
      syncFromCache();
      return;
    }

    if (!cachedSolicitudes || cachedSolicitudes.length === 0) {
      setStatus('loading');
    }
    setErrorMessage(null);

    const request = (async () => {
      try {
        const response = await fetch(`${CRM_ZOGEN_API_BASE}/solicitudes`);
        if (!response.ok) {
          throw new Error('No se pudo obtener la información');
        }

        const data = await response.json();
        const apiSolicitudes = data.solicitudes ?? [];

        const validApiSolicitudes = apiSolicitudes.filter((s: Solicitud) => {
          return (
            s.doctor &&
            s.patient &&
            s.doctor.toLowerCase() !== 'sin medico' &&
            s.doctor.toLowerCase() !== 'sin médico' &&
            s.patient.toLowerCase() !== 'sin paciente'
          );
        });

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

        cachedSolicitudes = [...validApiSolicitudes, ...localSolicitudes];
        cachedStatus = 'ready';
        cachedError = null;
      } catch (error) {
        console.error('Error cargando solicitudes:', error);
        cachedStatus = 'error';
        cachedError = 'No pudimos cargar las solicitudes. Intenta nuevamente.';
      }
    })();

    cachedPromise = request;
    await request;
    cachedPromise = null;
    syncFromCache();
  }, [syncFromCache]);

  useEffect(() => {
    if (autoFetch) {
      if (cachedSolicitudes && cachedSolicitudes.length > 0 && cachedStatus === 'ready') {
        syncFromCache();
        return;
      }
      fetchSolicitudes();
    }
  }, [autoFetch, fetchSolicitudes, syncFromCache]);

  return {
    solicitudes,
    status,
    errorMessage,
    fetchSolicitudes,
  };
}
