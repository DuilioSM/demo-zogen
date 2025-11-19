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

  // Datos del servicio
  servicioId?: string;
  servicioNombre?: string;
  servicioPrecio?: number;
  servicioLaboratorio?: string;
  servicioCantidad?: number;
  metodoPago?: 'bolsillo' | 'aseguradora';
  aseguradoraId?: string;
  aseguradoraNombre?: string;
  aseguradoraRFC?: string;
  patientData?: {
    firstName: string;
    lastName: string;
    phone: string;
    gender: string;
    curp: string;
    birthDate: string;
    country: string;
    state: string;
    municipality: string;
    neighborhood: string;
    postalCode: string;
    address: string;
  };
};

export type SolicitudServiceData = {
  servicioId: string;
  servicioNombre: string;
  laboratorio?: string;
  precioUnitario?: number;
  tiempoEntrega?: string;
  cantidad: number;
  metodoPago: 'bolsillo' | 'aseguradora';
  aseguradoraId?: string;
  aseguradoraNombre?: string;
  aseguradoraRfc?: string;
  notas?: string;
};
