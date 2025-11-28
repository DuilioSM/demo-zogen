'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';

export default function ValidacionPage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="aseguradora">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
            Gestión de aseguradora
          </h2>
          <p className="text-sm text-gray-600">
            Envía el expediente y da seguimiento al estatus
          </p>
        </div>
        <p className="text-gray-500">Contenido de la aseguradora (por implementar)</p>
      </div>
    </SolicitudEditor>
  );
}
