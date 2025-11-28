'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';

export default function DatosPacientePage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="datos-paciente">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
            Datos del Paciente
          </h2>
          <p className="text-sm text-gray-600">
            Información detallada del paciente
          </p>
        </div>
        <p className="text-gray-500">Contenido de datos del paciente (por implementar)</p>
      </div>
    </SolicitudEditor>
  );
}
