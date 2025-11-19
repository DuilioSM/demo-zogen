import { useCallback, useEffect, useState } from "react";
import type { PaymentMethod } from "@/types/payment-method";
import { CRM_ZOGEN_API_BASE } from "@/lib/constants";

type Status = "idle" | "loading" | "ready" | "error";

export function usePaymentMethods(options: { autoFetch?: boolean } = {}) {
  const { autoFetch = true } = options;
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [status, setStatus] = useState<Status>(autoFetch ? "loading" : "idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchMethods = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch(`${CRM_ZOGEN_API_BASE}/payment-methods`);
      if (!response.ok) {
        throw new Error("No se pudo obtener la información de métodos de pago");
      }

      const data = await response.json();
      setMethods(data.methods ?? []);
      setStatus("ready");
    } catch (error) {
      console.error("Error cargando métodos de pago:", error);
      setStatus("error");
      setErrorMessage("No pudimos cargar los métodos de pago. Intenta nuevamente.");
    }
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchMethods();
    }
  }, [autoFetch, fetchMethods]);

  return {
    methods,
    status,
    errorMessage,
    fetchMethods,
  };
}
