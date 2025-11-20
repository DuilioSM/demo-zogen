export type Descuento = {
  id: string;
  productoId: string;
  aseguradoraId: string;
  porcentaje: number;
  descripcion?: string;
};

// Catálogo de descuentos
export const DESCUENTOS_CATALOG: Descuento[] = [
  {
    id: 'desc-1',
    productoId: 'foundation-one-liq',
    aseguradoraId: 'gnp',
    porcentaje: 10,
    descripcion: 'Descuento GNP para FoundationOneLiq',
  },
  {
    id: 'desc-2',
    productoId: 'brca',
    aseguradoraId: 'axa',
    porcentaje: 5,
    descripcion: 'Descuento AXA para BRCA',
  },
];
