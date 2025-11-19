export type Servicio = {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  laboratorio: string;
  tiempoEntrega: string; // ej: "15-20 días"
  categoria: 'oncogenomico' | 'panel-cancer' | 'predisposicion' | 'otro';
};

// Catálogo de servicios que Zogen ofrece
export const SERVICIOS_CATALOG: Servicio[] = [
  {
    id: 'foundation-one-liq',
    nombre: 'FoundationOneLiq',
    descripcion: 'Análisis completo de genes relacionados con diferentes tipos de cáncer mediante biopsia líquida',
    precio: 67980.00,
    laboratorio: 'Foundation Medicine',
    tiempoEntrega: '15-20 días',
    categoria: 'oncogenomico',
  },
  {
    id: 'brca',
    nombre: 'BRCA',
    descripcion: 'Genes BRCA1, BRCA2 relacionados con cáncer de mama y ovario',
    precio: 22000.00,
    laboratorio: 'Genómica Nacional',
    tiempoEntrega: '12-15 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'signatures-sci-up',
    nombre: 'Signatures Sci Up',
    descripcion: 'Panel de firmas moleculares avanzadas',
    precio: 65200.00,
    laboratorio: 'Scientific Genomics',
    tiempoEntrega: '18-22 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'infusion-gro',
    nombre: 'Infusion Gro',
    descripcion: 'Panel especializado para medicina de precisión',
    precio: 79000.00,
    laboratorio: 'Infusion Medical',
    tiempoEntrega: '15-18 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'empower',
    nombre: 'EMPOWER',
    descripcion: 'Panel integral de análisis genómico',
    precio: 55520.00,
    laboratorio: 'Empower Genomics',
    tiempoEntrega: '20-25 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'tempus-xr',
    nombre: 'TEMPUS xR',
    descripcion: 'Panel de secuenciación de RNA y DNA',
    precio: 97000.00,
    laboratorio: 'Tempus Labs',
    tiempoEntrega: '15-20 días',
    categoria: 'oncogenomico',
  },
];

export function getServicioByName(nombre: string): Servicio | undefined {
  const normalizedName = nombre.toLowerCase();
  return SERVICIOS_CATALOG.find(
    s => s.nombre.toLowerCase().includes(normalizedName) ||
         normalizedName.includes(s.nombre.toLowerCase())
  );
}
