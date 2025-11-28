export type Gasto = {
  id: string;
  concepto: string;
  categoria: 'Servicios' | 'Suministros' | 'Mantenimiento' | 'Marketing' | 'Tecnología' | 'Otros';
  proveedor: string;
  monto: number;
  fecha: string;
  metodoPago: 'Efectivo' | 'Transferencia' | 'Tarjeta' | 'Cheque';
  numeroFactura?: string;
  status: 'pendiente' | 'pagado';
  notas?: string;
  archivoUrl?: string;
  archivoNombre?: string;
  createdAt: string;
};
