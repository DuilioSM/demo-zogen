export type Nomina = {
  id: string;
  empleado: string;
  puesto: string;
  departamento: 'Administración' | 'Médico' | 'Laboratorio' | 'Ventas' | 'Operaciones' | 'Tecnología';
  salarioMensual: number;
  periodo: string; // Formato: "2025-01" para Enero 2025
  diasTrabajados: number;
  horasExtra?: number;
  bonos?: number;
  deducciones?: number;
  total: number;
  metodoPago: 'Transferencia' | 'Efectivo' | 'Cheque';
  fechaPago?: string;
  status: 'pendiente' | 'pagado';
  notas?: string;
  archivoReciboUrl?: string;
  archivoReciboNombre?: string;
  createdAt: string;
};
