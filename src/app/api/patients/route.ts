import { NextResponse } from "next/server";
import type { Patient, RawPatient } from "@/types/patient";

const PATIENTS_ENDPOINT = "https://n8n.guander.mx/webhook/patients";

const textValue = (value: unknown) => {
  if (typeof value === "string") {
    return value.trim();
  }
  if (typeof value === "number") {
    return value.toString();
  }
  return "";
};

const normalizePatient = (item: RawPatient, index: number): Patient => {
  const firstName = textValue(item["nombre(s)"]) || "Sin nombre";
  const lastName = textValue(item.apellidos) || "";
  const phone = textValue(item.telefono) || "Sin teléfono";
  return {
    id: String(item.row_number ?? index + 1),
    firstName,
    lastName,
    fullName: [firstName, lastName].filter(Boolean).join(" ").trim(),
    phone,
    gender: textValue(item["genero biologico"]) || "Sin dato",
    curp: textValue(item.curp) || "-",
    birthDate: textValue(item["fecha de nacimiento"]) || "-",
    address: textValue(item.domicilio) || "-",
    country: textValue(item.pais) || "-",
    state: textValue(item.estado) || "-",
    neighborhood: textValue(item.colonia) || "-",
    municipality: textValue(item["delegación / municipio / otro"]) || "-",
    postalCode: textValue(item["código postal"]) || "-",
    ineUrl: textValue(item.ine_url) || undefined,
  };
};

export async function GET() {
  try {
    const response = await fetch(PATIENTS_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json(
        { error: "No se pudieron obtener los pacientes" },
        { status: response.status }
      );
    }

    const data = (await response.json()) as RawPatient[];
    const patients = data.map(normalizePatient);

    return NextResponse.json({
      patients,
      total: patients.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error obteniendo pacientes:", error);
    return NextResponse.json(
      { error: "Error interno obteniendo los pacientes" },
      { status: 500 }
    );
  }
}
