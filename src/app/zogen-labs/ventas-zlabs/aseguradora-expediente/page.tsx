'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { SolicitudEditor } from '@/components/SolicitudEditor';
import { InsuranceManagementSection } from '@/components/solicitudes/InsuranceManagementSection';
import { StepActions } from '@/components/solicitudes/StepActions';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { useServiceSnapshot } from '@/hooks/useServiceSnapshot';

export default function AseguradoraExpedientePage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';
  const { solicitudes, status: solicitudesStatus } = useSolicitudes();
  const solicitud = solicitudes.find((item) => item.id === solicitudId) || null;
  const serviceData = useServiceSnapshot(solicitud ?? undefined);
  const [isEditing, setIsEditing] = useState(false);

  if (!solicitud) {
    if (solicitudesStatus === 'loading') {
      return (
        <div className="flex min-h-[60vh] items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando solicitud...
        </div>
      );
    }

    return (
      <div className="flex min-h-[60vh] items-center justify-center text-gray-500">
        No encontramos la solicitud seleccionada.
      </div>
    );
  }

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="aseguradora">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">Enviar expediente a la aseguradora</h2>
            <p className="text-sm text-gray-600">
              Comprime tus archivos, envía el expediente y registra el estado de la aseguradora.
            </p>
          </div>
          <StepActions
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing((prev) => !prev)}
            onSave={() => setIsEditing(false)}
            saveDisabled={!isEditing}
            className="justify-end"
          />
        </div>
        <InsuranceManagementSection
          solicitudId={solicitudId}
          solicitud={solicitud}
          serviceData={serviceData}
          disabled={!isEditing}
        />
      </div>
    </SolicitudEditor>
  );
}
