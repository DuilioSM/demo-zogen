export type TipoComision = 'especialista' | 'cuenta';

export type Comision = {
  id: string;
  productoId: string;
  tipo: TipoComision;
  especialistaId?: string;
  cuentaId?: string;
  monto: number;
  porcentaje?: number;
  descripcion?: string;
};

// Catálogo de comisiones
export const COMISIONES_CATALOG: Comision[] = [
  {
    id: 'com-1',
    productoId: 'foundation-one-liq',
    tipo: 'especialista',
    especialistaId: 'strategic-sales-sr',
    monto: 5000,
    porcentaje: 7.5,
    descripcion: 'Comisión para especialista en FoundationOneLiq',
  },
  {
    id: 'com-2',
    productoId: 'brca',
    tipo: 'cuenta',
    cuentaId: 'dana-guzman',
    monto: 1000,
    porcentaje: 4.5,
    descripcion: 'Comisión para cuenta en BRCA',
  },
];
