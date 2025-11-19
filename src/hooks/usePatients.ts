import { useCallback, useEffect, useState } from "react";
import type { Patient } from "@/types/patient";
import { CRM_ZOGEN_API_BASE } from "@/lib/constants";

type Status = "idle" | "loading" | "ready" | "error";

export function usePatients(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;
  const [patients, setPatients] = useState<Patient[]>([]);
  const [status, setStatus] = useState<Status>(autoFetch ? "loading" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPatients = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(`${CRM_ZOGEN_API_BASE}/patients`);
      if (!response.ok) {
        throw new Error("No se pudo obtener la información de pacientes");
      }

      const data = await response.json();
      setPatients(data.patients ?? []);
      setStatus("ready");
    } catch (error) {
      console.error("Error cargando pacientes:", error);
      setStatus("error");
      setErrorMessage("No pudimos cargar los pacientes. Intenta nuevamente.");
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPatients();
    }
  }, [autoFetch, fetchPatients]);

  return {
    patients,
    status,
    errorMessage,
    fetchPatients,
  };
}
