'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';
import { useState, useEffect, useMemo } from 'react';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { usePatients } from '@/hooks/usePatients';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Solicitud } from '@/types/solicitudes';
import { StepActions } from '@/components/solicitudes/StepActions';

type PatientData = {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  curp: string;
  birthDate: string;
  country: string;
  state: string;
  municipality: string;
  neighborhood: string;
  postalCode: string;
  address: string;
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

function ReadOnlyField({ value, multiLine }: { value: string; multiLine?: boolean }) {
  return (
    <div className={`px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700 ${multiLine ? 'min-h-[80px] whitespace-pre-wrap' : ''}`}>
      {value || '-'}
    </div>
  );
}

export default function DatosPacientePage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';
  const { solicitudes, status: solicitudesStatus } = useSolicitudes();
  const { patients, status: patientsStatus } = usePatients();
  const [editMode, setEditMode] = useState(false);

  const solicitud = useMemo(() => {
    return solicitudes.find((s) => s.id === solicitudId);
  }, [solicitudes, solicitudId]);

  const patient = useMemo(() => {
    if (!solicitud) return undefined;
    const sanitizePhone = (value?: string) => (value ? value.replace(/\D/g, '') : '');
    const normalizedParam = sanitizePhone(solicitud.contactPhone);
    return patients.find((item) => sanitizePhone(item.phone) === normalizedParam);
  }, [patients, solicitud]);

  const [patientData, setPatientData] = useState<PatientData>({
    firstName: '',
    lastName: '',
    phone: '',
    gender: '',
    curp: '',
    birthDate: '',
    country: 'México',
    state: '',
    municipality: '',
    neighborhood: '',
    postalCode: '',
    address: '',
  });

  useEffect(() => {
    if (!solicitud) return;
    const stored = localStorage.getItem(`patient-data-${solicitudId}`);
    if (stored) {
      try {
        setPatientData(JSON.parse(stored));
      } catch (e) {
        console.error('Error loading patient data:', e);
      }
    } else if (patient) {
      setPatientData({
        firstName: patient.firstName || '',
        lastName: patient.lastName || '',
        phone: patient.phone || '',
        gender: patient.gender || '',
        curp: patient.curp || '',
        birthDate: patient.birthDate || '',
        country: patient.country || 'México',
        state: patient.state || '',
        municipality: patient.municipality || '',
        neighborhood: patient.neighborhood || '',
        postalCode: patient.postalCode || '',
        address: patient.address || '',
      });
    }
  }, [solicitudId, patient, solicitud]);

  const handleSave = () => {
    if (!solicitud) return;
    localStorage.setItem(`patient-data-${solicitudId}`, JSON.stringify(patientData));

    try {
      const storedSolicitudes = localStorage.getItem('zogen-solicitudes');
      if (storedSolicitudes) {
        const parsed = JSON.parse(storedSolicitudes);
        const updated = parsed.map((item: Solicitud) =>
          item.id === solicitudId ? { ...item, patientData: patientData } : item
        );
        localStorage.setItem('zogen-solicitudes', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error syncing patient data:', error);
    }

    setEditMode(false);
    alert('Datos del paciente guardados correctamente');
  };

  if (!solicitud) {
    if (solicitudesStatus === 'loading') {
      return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Cargando solicitud...</div>;
    }
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Solicitud no encontrada.</div>;
  }

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="datos-paciente">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
              Datos del Paciente
            </h2>
            <p className="text-sm text-gray-600">
              Información personal y de contacto del paciente
            </p>
          </div>
          <StepActions
            isEditing={editMode}
            onToggleEdit={() => setEditMode((prev) => !prev)}
            onSave={handleSave}
            saveDisabled={!editMode}
            className="justify-end"
          />
        </div>

        {patientsStatus === 'loading' && (
          <div className="flex flex-col items-center gap-3 py-10">
            <Loader2 className="h-8 w-8 animate-spin text-[#7B5C45]" />
            <p className="text-sm text-gray-600">Cargando datos del paciente...</p>
          </div>
        )}

        {patientsStatus === 'ready' && (
          <>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                {!patient ? (
                  <strong>No se encontraron datos automáticos. Puedes ingresar la información manualmente.</strong>
                ) : (
                  <strong>Datos cargados desde Google Sheets. Puedes editarlos si es necesario.</strong>
                )}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Field label="Nombre(s) *">
                {editMode ? (
                  <Input
                    value={patientData.firstName}
                    onChange={(e) => setPatientData({ ...patientData, firstName: e.target.value })}
                    placeholder="Nombre del paciente"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.firstName} />
                )}
              </Field>

              <Field label="Apellidos *">
                {editMode ? (
                  <Input
                    value={patientData.lastName}
                    onChange={(e) => setPatientData({ ...patientData, lastName: e.target.value })}
                    placeholder="Apellidos del paciente"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.lastName} />
                )}
              </Field>

              <Field label="Teléfono">
                {editMode ? (
                  <Input
                    value={patientData.phone}
                    onChange={(e) => setPatientData({ ...patientData, phone: e.target.value })}
                    placeholder="+52 55 1234 5678"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.phone} />
                )}
              </Field>

              <Field label="Género biológico">
                {editMode ? (
                  <Select value={patientData.gender} onValueChange={(value) => setPatientData({ ...patientData, gender: value })}>
                    <SelectTrigger className="border-[#D5D0C8]">
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Masculino">Masculino</SelectItem>
                      <SelectItem value="Femenino">Femenino</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <ReadOnlyField value={patientData.gender} />
                )}
              </Field>

              <Field label="CURP">
                {editMode ? (
                  <Input
                    value={patientData.curp}
                    onChange={(e) => setPatientData({ ...patientData, curp: e.target.value })}
                    placeholder="CURP del paciente"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.curp} />
                )}
              </Field>

              <Field label="Fecha de nacimiento">
                {editMode ? (
                  <Input
                    type="date"
                    value={patientData.birthDate}
                    onChange={(e) => setPatientData({ ...patientData, birthDate: e.target.value })}
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.birthDate} />
                )}
              </Field>

              <Field label="País">
                {editMode ? (
                  <Input
                    value={patientData.country}
                    onChange={(e) => setPatientData({ ...patientData, country: e.target.value })}
                    placeholder="México"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.country} />
                )}
              </Field>

              <Field label="Estado">
                {editMode ? (
                  <Input
                    value={patientData.state}
                    onChange={(e) => setPatientData({ ...patientData, state: e.target.value })}
                    placeholder="Ciudad de México"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.state} />
                )}
              </Field>

              <Field label="Municipio / Delegación">
                {editMode ? (
                  <Input
                    value={patientData.municipality}
                    onChange={(e) => setPatientData({ ...patientData, municipality: e.target.value })}
                    placeholder="Benito Juárez"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.municipality} />
                )}
              </Field>

              <Field label="Colonia">
                {editMode ? (
                  <Input
                    value={patientData.neighborhood}
                    onChange={(e) => setPatientData({ ...patientData, neighborhood: e.target.value })}
                    placeholder="Del Valle"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.neighborhood} />
                )}
              </Field>

              <Field label="Código postal">
                {editMode ? (
                  <Input
                    value={patientData.postalCode}
                    onChange={(e) => setPatientData({ ...patientData, postalCode: e.target.value })}
                    placeholder="03100"
                    className="border-[#D5D0C8]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.postalCode} />
                )}
              </Field>

              <Field label="Domicilio completo">
                {editMode ? (
                  <Textarea
                    value={patientData.address}
                    onChange={(e) => setPatientData({ ...patientData, address: e.target.value })}
                    placeholder="Calle, número, colonia..."
                    className="border-[#D5D0C8] min-h-[80px]"
                  />
                ) : (
                  <ReadOnlyField value={patientData.address} multiLine />
                )}
              </Field>
            </div>

          </>
        )}
      </div>
    </SolicitudEditor>
  );
}
