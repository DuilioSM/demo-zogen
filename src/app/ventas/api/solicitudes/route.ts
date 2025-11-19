import { NextResponse } from "next/server";
import type { RawSolicitud, Solicitud } from "@/types/solicitudes";

const SOLICITUDES_ENDPOINT = "https://n8n.guander.mx/webhook/solicitudes";

const textOrFallback = (value: unknown, fallback: string) => {
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (typeof value === "number") {
    return value.toString();
  }

  return fallback;
};

const normalizeSolicitud = (item: RawSolicitud, index: number): Solicitud => {
  return {
    id: String(item.row_number ?? index + 1),
    doctor: textOrFallback(item.doctor, "Sin médico"),
    patient: textOrFallback(item.paciente, "Sin paciente"),
    condition: textOrFallback(item.padecimiento, "Sin padecimiento"),
    testType: textOrFallback(item["tipo de prueba"], "Sin prueba"),
    contactPhone: textOrFallback(item.telefono, "Sin teléfono"),
    vendorPhone: textOrFallback(item.telefono_vendedor, "Sin vendedor"),
    createdAt: item["fecha de creación"] ?? null,
  };
};

export async function GET() {
  try {
    const response = await fetch(SOLICITUDES_ENDPOINT, {
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudieron obtener las solicitudes" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as RawSolicitud[];
    const solicitudes = data.map(normalizeSolicitud);

    return NextResponse.json({
      solicitudes,
      total: solicitudes.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error obteniendo solicitudes:", error);
    return NextResponse.json(
      { error: "Error interno obteniendo las solicitudes" },
      { status: 500 }
    );
  }
}
