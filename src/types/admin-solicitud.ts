export type StatusAprobacion = 'pendiente' | 'aprobado' | 'rechazado';
export type StatusCompra = 'pendiente' | 'ordenado' | 'recibido' | 'enviado-lab';
export type StatusLogistica = 'pendiente' | 'programado' | 'en-ruta' | 'recolectado' | 'entregado-lab';
export type StatusResultados = 'pendiente' | 'en-proceso' | 'completado';
export type StatusFacturacion = 'pendiente' | 'facturado' | 'timbrado';
export type StatusCobranza = 'pendiente' | 'pagado' | 'vencido';

export type PagoLaboratorio = {
  id: string;
  proveedor: string;
  factura: string;
  fecha: string;
  monto: number;
  moneda: string;
  status: 'pendiente' | 'pagado';
  notas?: string;
  archivoUrl?: string;
  archivoNombre?: string;
  validadoEn?: string;
};

export type AdminSolicitud = {
  id: string;
  solicitudId: string;
  paciente: string;
  servicio: string;
  servicioId?: string;
  servicioCantidad?: number;
  laboratorio: string;
  monto: number;
  aseguradora: string;
  aseguradoraId?: string;
  fechaSolicitud: string;
  metodoPago?: 'bolsillo' | 'aseguradora';
  pagosLaboratorio?: PagoLaboratorio[];

  // Aprobación
  statusAprobacion: StatusAprobacion;
  fechaAprobacion?: string;
  motivoRechazo?: string;

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

  // Resultados
  statusResultados: StatusResultados;
  fechaInicioResultados?: string;
  fechaFinResultados?: string;
  resultadosUrl?: string;

  // Facturación
  statusFacturacion: StatusFacturacion;
  rfcAseguradora?: string;
  regimenFiscal?: string;
  iva?: number;
  detallesFactura?: string;
  numeroFactura?: string;
  fechaFactura?: string;
  montoFactura?: number;
  uuidFactura?: string;
  pdfFacturaUrl?: string;

  // Cobranza
  statusCobranza: StatusCobranza;
  fechaPago?: string;
  referenciaPago?: string;

  // General
  notas?: string;
};
