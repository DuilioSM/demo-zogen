'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';

export default function SolicitudVTPage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="solicitud-vt">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
            Solicitud de VT
          </h2>
          <p className="text-sm text-gray-600">
            Verificación de Trabajo
          </p>
        </div>
        <p className="text-gray-500">Contenido de solicitud de VT (por implementar)</p>
      </div>
    </SolicitudEditor>
  );
}
