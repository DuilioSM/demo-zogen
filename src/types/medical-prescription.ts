export type RawMedicalPrescription = {
  row_number?: number;
  telefono?: string | number;
  "Diagnostico / indicaciones"?: string;
  "fecha de emision"?: string;
  url_receta?: string;
  [key: string]: unknown;
};

export type MedicalPrescription = {
  id: string;
  phone: string;
  diagnosis: string;
  issuedAt: string;
  prescriptionUrl?: string;
};
