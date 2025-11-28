'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';

export default function ArchivosPage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="archivos">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
            Carga de Archivos
          </h2>
          <p className="text-sm text-gray-600">
            Documentos necesarios para la solicitud
          </p>
        </div>
        <p className="text-gray-500">Contenido de carga de archivos (por implementar)</p>
      </div>
    </SolicitudEditor>
  );
}
