export interface ProductoMedDev {
  id: string;
  nombre: string;
  precio: number;
  descripcion?: string;
  tipo: 'reactivo' | 'equipo-medico';
  createdAt: string;
}

export interface Almacen {
  id: string;
  nombre: string;
  ubicacion: string;
  createdAt: string;
}

export interface ClienteMedDev {
  id: string;
  razonSocial: string;
  rfc: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  createdAt: string;
}

export interface CompraMedDev {
  id: string;
  fecha: string;
  proveedor: string;
  productos: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  almacenId: string;
  total: number;
  notas?: string;
  createdAt: string;
}

export interface VentaMedDev {
  id: string;
  folio: string;
  fecha: string;
  clienteId: string;
  categoria: 'equipo-medico' | 'reactivos';
  productos: {
    productoId: string;
    cantidad: number;
    precioUnitario: number;
  }[];
  subtotal: number;
  iva: number;
  total: number;
  estatus: 'vendido' | 'facturado' | 'cobrado';
  notas?: string;
  // Datos de factura
  facturaNumero?: string;
  facturaFecha?: string;
  // Datos de cobranza
  cobranzaFecha?: string;
  metodoPago?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventarioItem {
  id: string;
  productoId: string;
  almacenId: string;
  cantidad: number;
  ultimaActualizacion: string;
}
