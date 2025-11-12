import { NextResponse } from "next/server";
import type { PaymentMethod, RawPaymentMethod } from "@/types/payment-method";

const PAYMENT_ENDPOINT = "https://n8n.guander.mx/webhook/payments-methods";

const normalizeText = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return "";
};

const normalizePaymentMethod = (item: RawPaymentMethod, index: number): PaymentMethod => {
  return {
    id: String(item.row_number ?? index + 1),
    phone: normalizeText(item.telefono) || "Sin teléfono",
    method: normalizeText(item["metodo _de_pago"]) || "Sin dato",
    insurerName: normalizeText(item.nombre_de_la_aseguradora) || "Sin aseguradora",
    document: normalizeText(item.documento) || "Sin documento",
    documentUrl: normalizeText(item.url_forma_pago) || undefined,
  };
};

export async function GET() {
  try {
    const response = await fetch(PAYMENT_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudieron obtener los métodos de pago" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as RawPaymentMethod[];
    const methods = data.map(normalizePaymentMethod);

    return NextResponse.json({
      methods,
      total: methods.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error obteniendo métodos de pago:", error);
    return NextResponse.json(
      { error: "Error interno obteniendo los métodos de pago" },
      { status: 500 }
    );
  }
}
