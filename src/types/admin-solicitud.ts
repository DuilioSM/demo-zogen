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
  status: 'pendiente' | 'factura-recibida' | 'pagado';
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
  especialista?: string;
  padecimiento?: string;

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
  resultadosNombre?: string;
  comentariosResultados?: string;

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
  rfcCliente?: string;
  razonSocial?: string;
  codigoPostal?: string;
  tipoFactura?: 'PPD' | 'PUE';
  formaPago?: string;
  codigoProducto?: string;
  conceptoFactura?: string;
  ivaDesglosado?: number;
  saldoPendiente?: number;
  cfdiPagoTipo?: string;
  complementoPagoRegimen?: string;
  complementoPagoRazonSocial?: string;
  complementoPagoFolio?: string;
  montoPago?: number;
  saldoPosterior?: number;

  // Cobranza
  statusCobranza: StatusCobranza;
  fechaPago?: string;
  referenciaPago?: string;

  // Pagos a proveedores
  statusPagoProveedor?: 'pendiente' | 'factura-recibida' | 'pagado';
  montoPagoProveedor?: number;
  fechaPagoProveedor?: string;
  facturaProveedorArchivo?: string;
  facturaProveedorNombre?: string;
  comprobantePagoProveedorArchivo?: string;
  comprobantePagoProveedorNombre?: string;
  notasPagoProveedor?: string;

  // General
  notas?: string;
};
