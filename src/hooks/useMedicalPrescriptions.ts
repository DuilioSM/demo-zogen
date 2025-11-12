import { useCallback, useEffect, useState } from "react";
import type { MedicalPrescription } from "@/types/medical-prescription";

type Status = "idle" | "loading" | "ready" | "error";

export function useMedicalPrescriptions(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;
  const [prescriptions, setPrescriptions] = useState<MedicalPrescription[]>([]);
  const [status, setStatus] = useState<Status>(autoFetch ? "loading" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchPrescriptions = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/medical-prescriptions");
      if (!response.ok) {
        throw new Error("No se pudo obtener la información de recetas médicas");
      }

      const data = await response.json();
      setPrescriptions(data.prescriptions ?? []);
      setStatus("ready");
    } catch (error) {
      console.error("Error cargando recetas médicas:", error);
      setStatus("error");
      setErrorMessage("No pudimos cargar las recetas médicas. Intenta nuevamente.");
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchPrescriptions();
    }
  }, [autoFetch, fetchPrescriptions]);

  return {
    prescriptions,
    status,
    errorMessage,
    fetchPrescriptions,
  };
}
