export type RawSolicitud = {
  row_number?: number;
  telefono_vendedor?: number | string;
  doctor?: string;
  paciente?: string;
  padecimiento?: string;
  "tipo de prueba"?: string;
  telefono?: string | number;
  "fecha de creación"?: string;
  [key: string]: unknown;
};

export type Solicitud = {
  id: string;
  doctor: string;
  patient: string;
  condition: string;
  testType: string;
  contactPhone: string;
  vendorPhone: string;
  createdAt: string | null;
};
