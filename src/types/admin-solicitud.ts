export type StatusCompra = 'pendiente' | 'ordenado' | 'recibido' | 'enviado-lab';
export type StatusLogistica = 'pendiente' | 'programado' | 'en-ruta' | 'recolectado' | 'entregado-lab';
export type StatusEstudio = 'pendiente' | 'en-proceso' | 'completado';
export type StatusFacturacion = 'pendiente' | 'facturado';
export type StatusCobranza = 'pendiente' | 'pagado' | 'vencido';

export type AdminSolicitud = {
  id: string;
  solicitudId: string;
  paciente: string;
  servicio: string;
  laboratorio: string;
  monto: number;
  aseguradora: string;
  fechaSolicitud: string;

  // Compras
  statusCompra: StatusCompra;
  fechaOrdenCompra?: string;
  numeroOrden?: string;
  costoCompra?: number;

  // Logística
  statusLogistica: StatusLogistica;
  fechaRecoleccion?: string;
  paqueteria?: string;
  numeroGuia?: string;

  // Estudio
  statusEstudio: StatusEstudio;
  fechaInicioEstudio?: string;
  fechaFinEstudio?: string;
  resultadosUrl?: string;

  // Facturación
  statusFacturacion: StatusFacturacion;
  numeroFactura?: string;
  fechaFactura?: string;
  montoFactura?: number;

  // Cobranza
  statusCobranza: StatusCobranza;
  fechaPago?: string;
  referenciaPago?: string;

  // General
  notas?: string;
};
