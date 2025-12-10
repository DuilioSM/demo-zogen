import { useCallback, useEffect, useState } from "react";
import type { Solicitud } from "@/types/solicitudes";
import { CRM_ZOGEN_API_BASE } from "@/lib/constants";

type Status = "idle" | "loading" | "ready" | "error";

let cachedSolicitudes: Solicitud[] | null = null;
let cachedStatus: Status = "idle";
let cachedError: string | null = null;
let cachedPromise: Promise<void> | null = null;

export function useSolicitudes(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;

  // Siempre inicializar con valores consistentes para evitar errores de hidratación
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [status, setStatus] = useState<Status>(autoFetch ? 'loading' : 'idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  const syncFromCache = useCallback(() => {
    setSolicitudes(cachedSolicitudes ?? []);
    setStatus(cachedStatus);
    setErrorMessage(cachedError);
  }, []);

  const fetchSolicitudes = useCallback(async () => {
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

  // Efecto para hidratar solo en el cliente después del montaje
  useEffect(() => {
    setIsHydrated(true);

    // Si ya hay datos en caché, sincronizarlos
    if (cachedSolicitudes && cachedSolicitudes.length > 0 && cachedStatus === 'ready') {
      syncFromCache();
      return;
    }

    // Si autoFetch está activo, hacer fetch
    if (autoFetch) {
      fetchSolicitudes();
    }
  }, [autoFetch, fetchSolicitudes, syncFromCache]);

  return {
    solicitudes,
    status,
    errorMessage,
    fetchSolicitudes,
    isHydrated,
  };
}
