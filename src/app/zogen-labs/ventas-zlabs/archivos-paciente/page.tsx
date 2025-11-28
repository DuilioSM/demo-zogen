'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { SolicitudEditor } from '@/components/SolicitudEditor';
import { FilesUploadSection } from '@/components/solicitudes/FilesUploadSection';
import { StepActions } from '@/components/solicitudes/StepActions';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { usePatients } from '@/hooks/usePatients';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { useMedicalPrescriptions } from '@/hooks/useMedicalPrescriptions';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const sanitizePhone = (value?: string) => (value ? value.replace(/\D/g, '') : '');

const CHECKLIST_ITEMS = [
  { id: 'ine', label: 'INE del paciente' },
  { id: 'recetaMedica', label: 'Receta médica' },
  { id: 'caratulaPoliza', label: 'Carátula de póliza' },
  { id: 'informeAseguradora', label: 'Informe de aseguradora' },
  { id: 'consentimientoInformado', label: 'Consentimiento informado' },
  { id: 'estudiosLaboratorio', label: 'Estudios de laboratorio' },
  { id: 'otros', label: 'Otros documentos necesarios' },
];

export default function ArchivosPage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';
  const { solicitudes, status: solicitudesStatus } = useSolicitudes();
  const { patients, status: patientsStatus, errorMessage: patientsError } = usePatients();
  const { methods, status: methodsStatus, errorMessage: methodsError } = usePaymentMethods();
  const { prescriptions, status: prescriptionsStatus, errorMessage: prescriptionsError } = useMedicalPrescriptions();

  const solicitud = solicitudes.find((item) => item.id === solicitudId);
  const normalizedPhone = solicitud ? sanitizePhone(solicitud.contactPhone) : '';

  const patient = useMemo(() => {
    if (!normalizedPhone) return undefined;
    return patients.find((item) => sanitizePhone(item.phone) === normalizedPhone);
  }, [patients, normalizedPhone]);

  const paymentMethod = useMemo(() => {
    if (!normalizedPhone) return undefined;
    return methods.find((item) => sanitizePhone(item.phone) === normalizedPhone);
  }, [methods, normalizedPhone]);

  const prescription = useMemo(() => {
    if (!normalizedPhone) return undefined;
    return prescriptions.find((item) => sanitizePhone(item.phone) === normalizedPhone);
  }, [prescriptions, normalizedPhone]);

  const autoDataLoading =
    patientsStatus === 'loading' || methodsStatus === 'loading' || prescriptionsStatus === 'loading';
  const autoDataErrors = [patientsError, methodsError, prescriptionsError].filter(Boolean) as string[];

  const checklistDefaults = useMemo(
    () => Object.fromEntries(CHECKLIST_ITEMS.map((item) => [item.id, false])),
    []
  ) as Record<string, boolean>;
  const [checklist, setChecklist] = useState<Record<string, boolean>>(checklistDefaults);
  const [validationStatus, setValidationStatus] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente');
  const [comentarios, setComentarios] = useState('');
  const [filesState, setFilesState] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!solicitudId) return;
    try {
      const stored = localStorage.getItem(`validation-${solicitudId}`);
      if (stored) {
        const parsed = JSON.parse(stored) as {
          status?: 'pendiente' | 'aprobado' | 'rechazado';
          comentarios?: string;
          checklist?: Record<string, boolean>;
        };
        if (parsed.status) {
          setValidationStatus(parsed.status);
        }
        if (parsed.comentarios) {
          setComentarios(parsed.comentarios);
        }
        if (parsed.checklist) {
          setChecklist({ ...checklistDefaults, ...parsed.checklist });
        }
      }
    } catch (error) {
      console.error('Error loading validation data', error);
    }
  }, [solicitudId, checklistDefaults]);

  useEffect(() => {
    if (!solicitudId) return;
    const payload = {
      status: validationStatus,
      comentarios,
      checklist,
    };
    localStorage.setItem(`validation-${solicitudId}`, JSON.stringify(payload));
  }, [solicitudId, validationStatus, comentarios, checklist]);

  const handleChecklistToggle = (itemId: string) => {
    if (!isEditing) return;
    setChecklist((prev) => {
      const updated = { ...prev, [itemId]: !prev[itemId] };
      setValidationStatus((prevStatus) => {
        const allCompleted = Object.values(updated).every(Boolean);
        if (allCompleted) {
          return 'aprobado';
        }
        if (prevStatus === 'aprobado') {
          return 'pendiente';
        }
        return prevStatus;
      });
      return updated;
    });
  };

  const totalItems = CHECKLIST_ITEMS.length;
  const completedItems = Object.values(checklist).filter(Boolean).length;
  const uploadedItems = CHECKLIST_ITEMS.filter((item) => Boolean(filesState[item.id])).length;
  const totalUploads = CHECKLIST_ITEMS.length;

  const statusCards = [
    {
      label: 'Subir archivos',
      value: `${uploadedItems}/${totalUploads}`,
      status:
        uploadedItems === 0 ? 'Pendiente' : uploadedItems === totalUploads ? 'Completo' : 'En progreso',
      description:
        uploadedItems === totalUploads
          ? 'Todos los documentos tienen respaldo.'
          : 'Carga los archivos faltantes para continuar.',
    },
    {
      label: 'Validar',
      value: `${completedItems}/${totalItems}`,
      status:
        validationStatus === 'aprobado'
          ? 'Completo'
          : validationStatus === 'rechazado'
            ? 'Observaciones'
            : 'Pendiente',
      description:
        validationStatus === 'aprobado'
          ? 'Checklist revisado.'
          : validationStatus === 'rechazado'
            ? 'Existen pendientes por corregir.'
            : 'Marca cada archivo después de validarlo.',
    },
  ];

  if (!solicitud) {
    if (solicitudesStatus === 'loading') {
      return (
        <div className="flex items-center justify-center min-h-[60vh] text-gray-500 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando solicitud...
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
        No encontramos la solicitud seleccionada.
      </div>
    );
  }

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="archivos">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">Carga de Archivos</h2>
            <p className="text-sm text-gray-600">Documentos necesarios para continuar con la solicitud</p>
          </div>
          <StepActions
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing((prev) => !prev)}
            onSave={() => setIsEditing(false)}
            saveDisabled={!isEditing}
            className="justify-end"
          />
        </div>

        {autoDataLoading && (
          <div className="flex items-center gap-3 rounded-xl border border-[#E4D4C8] bg-white p-4 text-sm text-[#3A2D28]">
            <Loader2 className="h-5 w-5 animate-spin text-[#7B5C45]" />
            Sincronizando documentos previos desde Google Sheets...
          </div>
        )}

        {autoDataErrors.length > 0 && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {autoDataErrors.map((message) => (
              <p key={message}>{message}</p>
            ))}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {statusCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-[#E4D4C8] bg-white p-4 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">{card.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold text-[#2C2C2C]">{card.value}</span>
                <span className="text-sm text-gray-500">{card.status}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">{card.description}</p>
            </div>
          ))}
        </div>

        <FilesUploadSection
          solicitudId={solicitudId}
          patient={patient}
          paymentMethod={paymentMethod}
          prescription={prescription}
          disabled={!isEditing}
          onFilesChange={setFilesState}
        />

        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-[#2C2C2C]">Checklist de validación</h3>
            <p className="text-sm text-gray-600">
              Marca cada documento cuando verifiques que cumple con los requisitos del expediente.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {CHECKLIST_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleChecklistToggle(item.id)}
                className={cn(
                  'flex items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                  checklist[item.id] ? 'border-green-200 bg-green-50' : 'border-[#E4D4C8] bg-white hover:border-[#D5D0C8]'
                )}
                disabled={!isEditing}
              >
                <div>
                  <p className="text-sm font-medium text-[#2C2C2C]">{item.label}</p>
                  <p className="text-xs text-gray-500">
                    {checklist[item.id] ? 'Validado' : 'Pendiente de revisión'}
                  </p>
                </div>
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold',
                    checklist[item.id]
                      ? 'border-green-500 bg-green-600 text-white'
                      : 'border-gray-300 text-gray-400'
                  )}
                >
                  {checklist[item.id] ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <span className="text-[10px] uppercase tracking-wide">Pend.</span>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-[#E4D4C8] bg-white p-4">
              <p className="text-sm font-semibold text-[#2C2C2C] mb-2">Estado del checklist</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-[#2C2C2C]">{completedItems}</span>
                <span className="text-sm text-gray-500">de {totalItems} documentos validados</span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {(['pendiente', 'aprobado', 'rechazado'] as const).map((status) => (
                  <Button
                    key={status}
                    type="button"
                    variant={validationStatus === status ? 'default' : 'outline'}
                    onClick={() => setValidationStatus(status)}
                    disabled={!isEditing}
                    className={cn(
                      'text-xs',
                      validationStatus === status
                        ? status === 'aprobado'
                          ? 'bg-green-600 hover:bg-green-700'
                          : status === 'rechazado'
                            ? 'bg-red-600 hover:bg-red-700'
                            : 'bg-yellow-500 hover:bg-yellow-600'
                        : 'text-gray-600'
                    )}
                  >
                    {status === 'pendiente' && 'Pendiente'}
                    {status === 'aprobado' && 'Aprobado'}
                    {status === 'rechazado' && 'Rechazado'}
                  </Button>
                ))}
              </div>
            </div>

            <div
              className={cn(
                'rounded-xl border p-4 text-sm',
                validationStatus === 'aprobado' && 'border-green-200 bg-green-50 text-green-900',
                validationStatus === 'rechazado' && 'border-red-200 bg-red-50 text-red-900',
                validationStatus === 'pendiente' && 'border-yellow-200 bg-yellow-50 text-yellow-900'
              )}
            >
              <p className="font-semibold">
                Estado actual: <span className="uppercase">{validationStatus}</span>
              </p>
              <p className="mt-1 text-xs">
                {validationStatus === 'pendiente' && 'Continúa validando los documentos para avanzar al siguiente paso.'}
                {validationStatus === 'aprobado' && 'Todos los documentos fueron revisados. Puedes continuar con la aseguradora.'}
                {validationStatus === 'rechazado' && 'El expediente requiere correcciones antes de continuar.'}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Observaciones</label>
            <Textarea
              value={comentarios}
              onChange={(event) => setComentarios(event.target.value)}
              placeholder="Registra hallazgos, pendientes o notas internas de la revisión."
              className="min-h-[120px] border-[#E4D4C8]"
              disabled={!isEditing}
            />
          </div>
        </div>
      </div>
    </SolicitudEditor>
  );
}
