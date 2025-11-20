export type EstadoProspecto = 'nuevo' | 'contactado' | 'calificado' | 'convertido' | 'perdido';

export type Prospecto = {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  especialistaId: string;
  estado: EstadoProspecto;
  notas?: string;
  fechaCreacion: string;
  fechaUltimoContacto?: string;
};

// Catálogo inicial de prospectos
export const PROSPECTOS_CATALOG: Prospecto[] = [
  {
    id: 'pros-1',
    nombre: 'Dr. Roberto Martínez',
    email: 'roberto.martinez@hospital.com',
    telefono: '+52 55 1234 5678',
    especialistaId: 'sonia-cruz',
    estado: 'nuevo',
    notas: 'Interesado en pruebas oncológicas',
    fechaCreacion: '2025-11-15T10:00:00Z',
  },
  {
    id: 'pros-2',
    nombre: 'Dra. Patricia López',
    email: 'patricia.lopez@clinica.com',
    telefono: '+52 81 9876 5432',
    especialistaId: 'fernando-ruiz',
    estado: 'contactado',
    notas: 'Primer contacto realizado, espera cotización',
    fechaCreacion: '2025-11-10T14:30:00Z',
    fechaUltimoContacto: '2025-11-12T09:00:00Z',
  },
  {
    id: 'pros-3',
    nombre: 'Dr. Carlos Ramírez',
    email: 'carlos.ramirez@medica.com',
    telefono: '+52 33 5555 1234',
    especialistaId: 'sonia-cruz',
    estado: 'calificado',
    notas: 'Alto potencial, maneja 20+ pacientes oncológicos al mes',
    fechaCreacion: '2025-11-05T16:45:00Z',
    fechaUltimoContacto: '2025-11-18T11:30:00Z',
  },
];
