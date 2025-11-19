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
    id: 'onco-integral',
    nombre: 'Panel Oncogenómico Integral',
    descripcion: 'Análisis completo de genes relacionados con diferentes tipos de cáncer',
    precio: 68500,
    laboratorio: 'Tempus Labs',
    tiempoEntrega: '15-20 días',
    categoria: 'oncogenomico',
  },
  {
    id: 'panel-mama',
    nombre: 'Panel Cáncer de Mama',
    descripcion: 'Genes BRCA1, BRCA2 y otros relacionados con cáncer de mama y ovario',
    precio: 42000,
    laboratorio: 'Tempus Labs',
    tiempoEntrega: '12-15 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'panel-colon',
    nombre: 'Cáncer Gastrointestinal',
    descripcion: 'Panel de genes para cáncer colorrectal y gastrointestinal',
    precio: 55200,
    laboratorio: 'Foundation Medicine',
    tiempoEntrega: '18-22 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'panel-gineco',
    nombre: 'Panel Ginecológico',
    descripcion: 'Análisis de predisposición a cánceres ginecológicos',
    precio: 47800,
    laboratorio: 'Tempus Labs',
    tiempoEntrega: '15-18 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'panel-pediatrico',
    nombre: 'Panel Pediátrico',
    descripcion: 'Panel especializado para cáncer en pacientes pediátricos',
    precio: 52300,
    laboratorio: 'Foundation Medicine',
    tiempoEntrega: '20-25 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'panel-pulmon',
    nombre: 'Cáncer de Pulmón',
    descripcion: 'Panel de biomarcadores para cáncer de pulmón',
    precio: 48900,
    laboratorio: 'Tempus Labs',
    tiempoEntrega: '15-20 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'panel-prostata',
    nombre: 'Panel Próstata',
    descripcion: 'Análisis genético para cáncer de próstata',
    precio: 39600,
    laboratorio: 'Foundation Medicine',
    tiempoEntrega: '12-16 días',
    categoria: 'panel-cancer',
  },
  {
    id: 'predisposicion-general',
    nombre: 'Panel de Predisposición Hereditaria',
    descripcion: 'Análisis amplio de predisposición hereditaria al cáncer',
    precio: 33400,
    laboratorio: 'Tempus Labs',
    tiempoEntrega: '10-14 días',
    categoria: 'predisposicion',
  },
];

export function getServicioByName(nombre: string): Servicio | undefined {
  const normalizedName = nombre.toLowerCase();
  return SERVICIOS_CATALOG.find(
    s => s.nombre.toLowerCase().includes(normalizedName) ||
         normalizedName.includes(s.nombre.toLowerCase())
  );
}
