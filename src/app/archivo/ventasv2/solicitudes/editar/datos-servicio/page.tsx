'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';

export default function DatosServicioPage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="datos-servicio">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
            Datos del Servicio
          </h2>
          <p className="text-sm text-gray-600">
            Configuración del servicio solicitado
          </p>
        </div>
        <p className="text-gray-500">Contenido de datos del servicio (por implementar)</p>
      </div>
    </SolicitudEditor>
  );
}
