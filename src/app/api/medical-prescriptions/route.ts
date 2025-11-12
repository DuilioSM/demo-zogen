import { NextResponse } from "next/server";
import type { MedicalPrescription, RawMedicalPrescription } from "@/types/medical-prescription";

const PRESCRIPTIONS_ENDPOINT = "https://n8n.guander.mx/webhook/medical-prescriptions";

const normalizeText = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return "";
};

const normalizePrescription = (
  item: RawMedicalPrescription,
  index: number
): MedicalPrescription => {
  return {
    id: String(item.row_number ?? index + 1),
    phone: normalizeText(item.telefono) || "Sin teléfono",
    diagnosis: normalizeText(item["Diagnostico / indicaciones"]) || "Sin indicaciones",
    issuedAt: normalizeText(item["fecha de emision"]) || "Sin fecha",
    prescriptionUrl: normalizeText(item.url_receta) || undefined,
  };
};

export async function GET() {
  try {
    const response = await fetch(PRESCRIPTIONS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudieron obtener las recetas médicas" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as RawMedicalPrescription[];
    const prescriptions = data.map(normalizePrescription);

    return NextResponse.json({
      prescriptions,
      total: prescriptions.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error obteniendo recetas médicas:", error);
    return NextResponse.json(
      { error: "Error interno obteniendo las recetas médicas" },
      { status: 500 }
    );
  }
}
