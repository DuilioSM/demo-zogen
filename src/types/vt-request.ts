export type VTRequestStatus = 'pendiente' | 'enviado' | 'aprobado' | 'rechazado';

export type VTRequest = {
  id: string;
  solicitudId: string;
  solicitudTelefono: string;
  paciente: string;
  doctor: string;
  tipoEstudio: string;
  status: VTRequestStatus;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  comentarios?: string;
  aseguradora?: string;
  monto?: string;
};

export type AdminSolicitud = VTRequest & {
  statusCompra?: 'pendiente' | 'ordenado' | 'recibido';
  laboratorio?: string;
  fechaOrden?: string;
  fechaRecepcion?: string;
  numeroSeguimiento?: string;
};
