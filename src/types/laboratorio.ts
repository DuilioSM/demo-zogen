export type Laboratorio = {
  id: string;
  nombre: string;
  pais?: string;
  activa?: boolean;
};

// Catálogo de laboratorios extraído de los productos existentes
export const LABORATORIOS_CATALOG: Laboratorio[] = [
  { id: 'foundation-medicine', nombre: 'Foundation Medicine', pais: 'USA', activa: true },
  { id: 'genomica-nacional', nombre: 'Genómica Nacional', pais: 'México', activa: true },
  { id: 'scientific-genomics', nombre: 'Scientific Genomics', pais: 'USA', activa: true },
  { id: 'infusion-medical', nombre: 'Infusion Medical', pais: 'USA', activa: true },
  { id: 'empower-genomics', nombre: 'Empower Genomics', pais: 'USA', activa: true },
  { id: 'tempus-labs', nombre: 'Tempus Labs', pais: 'USA', activa: true },
];
