export type WorkflowStatus =
  | 'datos-paciente'
  | 'carga-archivos'
  | 'validacion-archivos'
  | 'cotizacion'
  | 'respuesta-aseguradora'
  | 'solicitud-vt'
  | 'completado';

export type PatientData = {
  solicitudId: string;
  nombreCompleto: string;
  fechaNacimiento: string;
  curp: string;
  telefono: string;
  correo: string;
  domicilio: string;
  formaPago: 'aseguradora' | 'bolsillo';
  aseguradoraNombre?: string;
};

export type FileUpload = {
  solicitudId: string;
  ine?: File | string;
  recetaMedica?: File | string;
  caratulaPoliza?: File | string;
  informeAseguradora?: File | string;
  otrosDocumentos?: (File | string)[];
};

export type FileValidation = {
  solicitudId: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  comentarios?: string;
};

export type Cotizacion = {
  solicitudId: string;
  monto: number;
  descripcion: string;
  expedienteZipUrl?: string;
  cotizacionPdfUrl?: string;
};

export type RespuestaAseguradora = {
  solicitudId: string;
  status: 'pendiente' | 'aprobado' | 'rechazado';
  cartaPaseUrl?: string;
  comentarios?: string;
};

export type SolicitudVT = {
  solicitudId: string;
  fechaSolicitud: string;
  status: 'pendiente' | 'enviado' | 'aprobado';
  comentarios?: string;
};
