"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Loader2, Eye, Undo2, Upload, FileText, Download, FileCheck, FileArchive, DollarSign, Clock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSolicitudes } from "@/hooks/useSolicitudes";
import type { Solicitud } from "@/types/solicitudes";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/usePatients";
import type { Patient } from "@/types/patient";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import type { PaymentMethod } from "@/types/payment-method";
import { useMedicalPrescriptions } from "@/hooks/useMedicalPrescriptions";
import type { MedicalPrescription } from "@/types/medical-prescription";
import { getServicioByName, SERVICIOS_CATALOG } from "@/types/servicio";

const STEPS = [
  { id: "order", label: "Solicitud del pedido" },
  { id: "patient", label: "Datos del paciente" },
  { id: "files", label: "Carga de Archivos" },
  { id: "validation", label: "Validación de Archivos" },
  { id: "insurance", label: "Gestión de Aseguradora" },
  { id: "vt", label: "Solicitud VT" },
] as const;
type StepId = (typeof STEPS)[number]["id"];

const formatPhone = (value: string) => {
  if (!value || value === "Sin teléfono" || value === "Sin vendedor") {
    return value;
  }

  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};

const formatDate = (value: string | null) => {
  if (!value) return "Sin fecha";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const sanitizePhone = (value?: string) => (value ? value.replace(/[^\d]/g, "") : "");

export default function EditSolicitudPage() {
  const params = useParams();
  const telephoneParam = params.telephone as string;
  const normalizedParam = sanitizePhone(telephoneParam);
  const { solicitudes, status, errorMessage, fetchSolicitudes } = useSolicitudes();
  const {
    patients,
    status: patientsStatus,
    errorMessage: patientsError,
    fetchPatients,
  } = usePatients();
  const {
    methods,
    status: methodsStatus,
    errorMessage: methodsError,
    fetchMethods,
  } = usePaymentMethods();
  const {
    prescriptions,
    status: prescriptionsStatus,
    errorMessage: prescriptionsError,
    fetchPrescriptions,
  } = useMedicalPrescriptions();
  const [activeStep, setActiveStep] = useState<StepId>(STEPS[0].id);

  const solicitud = useMemo(() => {
    return solicitudes.find((item) => {
      const contact = sanitizePhone(item.contactPhone);
      return contact === normalizedParam;
    });
  }, [solicitudes, normalizedParam]);

  const patient = useMemo(() => {
    return patients.find((item) => sanitizePhone(item.phone) === normalizedParam);
  }, [patients, normalizedParam]);

  const paymentMethod = useMemo(() => {
    return methods.find((item) => sanitizePhone(item.phone) === normalizedParam);
  }, [methods, normalizedParam]);

  const prescription = useMemo(() => {
    return prescriptions.find((item) => sanitizePhone(item.phone) === normalizedParam);
  }, [prescriptions, normalizedParam]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F0E8] text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#7B5C45]" />
        <p className="mt-4 text-sm text-[#666]">Preparando formulario…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F5F0E8] text-center">
        <p className="text-lg font-medium text-red-600">{errorMessage}</p>
        <Button onClick={fetchSolicitudes} className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F5F0E8] text-center">
        <p className="text-lg font-semibold text-[#2C2C2C]">No encontramos esta solicitud.</p>
        <div className="flex gap-3">
          <Link href="/ventas/crm-zogen/solicitudes">
            <Button className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
              <Undo2 className="mr-2 h-4 w-4" /> Regresar
            </Button>
          </Link>
          <Link href={`/ventas/crm-zogen/solicitudes/${telephoneParam}`}>
            <Button variant="outline" className="border-[#7B5C45] text-[#7B5C45]">
              Ver detalle
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const viewHref = `/ventas/crm-zogen/solicitudes/${normalizedParam}`;

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2C2C2C]">
      <header className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-[#3C4858]">Actualizar prueba</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/ventas/crm-zogen/solicitudes">
                <Button className="bg-[#7B5C45] px-4 py-2 text-sm font-medium text-white hover:bg-[#6A4D38]">
                  Listar
                </Button>
              </Link>
              <Link href={viewHref}>
                <Button className="flex items-center gap-2 bg-[#7B5C45] px-4 py-2 text-sm font-medium text-white hover:bg-[#6A4D38]">
                  Ver
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-[#2C2C2C]">
            Envío de muestra a laboratorio / Servicio: Enviado a laboratorio
          </h2>
          <p className="mt-1 text-sm italic text-[#666]">
            Todos los campos marcados con un * son obligatorios.
          </p>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-[280px]">
            <nav className="rounded-lg bg-white p-4 shadow-sm">
              {STEPS.map((step) => (
                <StepIndicator
                  key={step.id}
                  label={step.label}
                  active={activeStep === step.id}
                  onClick={() => setActiveStep(step.id)}
                />
              ))}
            </nav>
          </aside>

          <section className="flex-1">
            {renderActiveStep({
              solicitud,
              activeStep,
              patient,
              patientStatus: patientsStatus,
              patientError: patientsError,
              retryPatient: fetchPatients,
              paymentMethod,
              paymentStatus: methodsStatus,
              paymentError: methodsError,
              retryPayment: fetchMethods,
              prescription,
              prescriptionStatus: prescriptionsStatus,
              prescriptionError: prescriptionsError,
              retryPrescription: fetchPrescriptions,
            })}
          </section>
        </div>
      </main>
    </div>
  );
}

type RenderStepProps = {
  solicitud: Solicitud;
  activeStep: StepId;
  patient?: Patient;
  patientStatus: string;
  patientError: string | null;
  retryPatient: () => void;
  paymentMethod?: PaymentMethod;
  paymentStatus: string;
  paymentError: string | null;
  retryPayment: () => void;
  prescription?: MedicalPrescription;
  prescriptionStatus: string;
  prescriptionError: string | null;
  retryPrescription: () => void;
};

function renderActiveStep({
  solicitud,
  activeStep,
  patient,
  patientStatus,
  patientError,
  retryPatient,
  paymentMethod,
  paymentStatus,
  paymentError,
  retryPayment,
  prescription,
  prescriptionStatus,
  prescriptionError,
  retryPrescription,
}: RenderStepProps) {
  switch (activeStep) {
    case "order":
      return (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Paciente">
              <div className="rounded-md border-l-4 border-l-[#C37C4D] bg-white px-4 py-3 text-sm font-semibold uppercase text-[#2C2C2C] shadow-sm">
                {solicitud.patient}
              </div>
            </Field>
            <Field label="Especialista médico *">
              <Select defaultValue={solicitud.doctor}>
                <SelectTrigger className="rounded-md border-l-4 border-l-[#C37C4D] bg-[#E8E3DB] shadow-sm">
                  <SelectValue placeholder="Selecciona" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={solicitud.doctor}>{solicitud.doctor}</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Tipo de prueba">
              <ReadOnlyField value={solicitud.testType} />
            </Field>
            <Field label="Padecimiento">
              <ReadOnlyField value={solicitud.condition} />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Teléfono de contacto">
              <ReadOnlyField value={formatPhone(solicitud.contactPhone)} />
            </Field>
            <Field label="Teléfono del vendedor">
              <ReadOnlyField value={formatPhone(solicitud.vendorPhone)} />
            </Field>
          </div>

          <Field label="Fecha de creación">
            <ReadOnlyField value={formatDate(solicitud.createdAt)} />
          </Field>

          <Field label="Laboratorio *">
            <div className="text-base text-[#5C6B9A]">Tempus Labs, Inc</div>
          </Field>

       

        
        </div>
      );
    case "patient":
      return (
        <PatientDataSection
          solicitudId={solicitud.id}
          patient={patient}
          patientStatus={patientStatus}
          patientError={patientError}
          retryPatient={retryPatient}
        />
      );
    case "insurance":
      return <InsuranceManagementSection solicitudId={solicitud.id} paymentMethod={paymentMethod} solicitud={solicitud} />;
    case "files":
      return <FilesUploadSection solicitudId={solicitud.id} patient={patient} paymentMethod={paymentMethod} prescription={prescription} />;
    case "validation":
      return <FilesValidationSection solicitudId={solicitud.id} />;
    case "vt":
      return <VTRequestSection solicitudId={solicitud.id} solicitud={solicitud} />;
    default:
      return null;
  }
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  const hasAsterisk = label.includes("*");
  const labelText = label.replace("*", "").trim();

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-[#2C2C2C]">
        {labelText}
        {hasAsterisk && <span className="ml-1 text-red-600">*</span>}
      </p>
      {children}
    </div>
  );
}

type ReadOnlyFieldProps = {
  value: string;
  multiLine?: boolean;
};

function ReadOnlyField({ value, multiLine = false }: ReadOnlyFieldProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[#E4D4C8] bg-white px-4 py-3 text-sm text-[#3A2D28]",
        multiLine && "min-h-[80px]"
      )}
    >
      {value || "-"}
    </div>
  );
}

type StepProps = {
  label: string;
  icon?: LucideIcon;
  active?: boolean;
  onClick?: () => void;
};

function StepIndicator({ label, icon: Icon = CheckCircle2, active = false, onClick }: StepProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between px-4 py-2.5 text-left transition",
        active ? "text-[#2C2C2C]" : "text-[#666]"
      )}
    >
      <span className={cn("text-sm", active ? "font-medium" : "font-normal")}>{label}</span>
      <Icon className={cn("h-5 w-5 fill-[#C9A049] text-[#C9A049]")} />
    </button>
  );
}

type PatientDataSectionProps = {
  solicitudId: string;
  patient?: Patient;
  patientStatus: string;
  patientError: string | null;
  retryPatient: () => void;
};

function PatientDataSection({ solicitudId, patient, patientStatus, patientError, retryPatient }: PatientDataSectionProps) {
  const [editMode, setEditMode] = useState(false);
  const [patientData, setPatientData] = useState({
    firstName: patient?.firstName || "",
    lastName: patient?.lastName || "",
    phone: patient?.phone || "",
    gender: patient?.gender || "",
    curp: patient?.curp || "",
    birthDate: patient?.birthDate || "",
    country: patient?.country || "",
    state: patient?.state || "",
    municipality: patient?.municipality || "",
    neighborhood: patient?.neighborhood || "",
    postalCode: patient?.postalCode || "",
    address: patient?.address || "",
    ineUrl: patient?.ineUrl || "",
  });

  // Cargar datos guardados localmente si existen
  useEffect(() => {
    const stored = localStorage.getItem(`patient-data-${solicitudId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPatientData(parsed);
      } catch (e) {
        console.error('Error loading patient data:', e);
      }
    } else if (patient) {
      // Si no hay datos guardados pero hay datos del API, usarlos
      setPatientData({
        firstName: patient.firstName || "",
        lastName: patient.lastName || "",
        phone: patient.phone || "",
        gender: patient.gender || "",
        curp: patient.curp || "",
        birthDate: patient.birthDate || "",
        country: patient.country || "",
        state: patient.state || "",
        municipality: patient.municipality || "",
        neighborhood: patient.neighborhood || "",
        postalCode: patient.postalCode || "",
        address: patient.address || "",
        ineUrl: patient.ineUrl || "",
      });
    }
  }, [solicitudId, patient]);

  const handleSavePatientData = () => {
    localStorage.setItem(`patient-data-${solicitudId}`, JSON.stringify(patientData));
    setEditMode(false);
    alert('Datos del paciente guardados correctamente');
  };

  const handleInputChange = (field: keyof typeof patientData, value: string) => {
    setPatientData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      {patientStatus === "loading" && (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#7B5C45]" />
          <p className="text-sm text-[#666]">Cargando paciente…</p>
        </div>
      )}

      {patientStatus === "error" && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <p className="text-sm font-medium text-red-600">{patientError}</p>
          <Button onClick={retryPatient} className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
            Reintentar
          </Button>
        </div>
      )}

      {patientStatus === "ready" && (
        <>
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              {!patient ? (
                <strong>No se encontraron datos automáticos. Puedes ingresar la información manualmente.</strong>
              ) : (
                <strong>Datos cargados desde Google Sheets. Puedes editarlos si es necesario.</strong>
              )}
            </p>
            <Button
              onClick={() => setEditMode(!editMode)}
              variant="outline"
              className="border-[#7B5C45] text-[#7B5C45]"
            >
              {editMode ? 'Cancelar' : 'Editar Datos'}
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Nombre(s) *">
              {editMode ? (
                <Input
                  value={patientData.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
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
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
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
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="border-[#D5D0C8]"
                />
              ) : (
                <ReadOnlyField value={formatPhone(patientData.phone)} />
              )}
            </Field>
            <Field label="Género biológico">
              {editMode ? (
                <Select value={patientData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
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
                  onChange={(e) => handleInputChange('curp', e.target.value)}
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
                  onChange={(e) => handleInputChange('birthDate', e.target.value)}
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
                  onChange={(e) => handleInputChange('country', e.target.value)}
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
                  onChange={(e) => handleInputChange('state', e.target.value)}
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
                  onChange={(e) => handleInputChange('municipality', e.target.value)}
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
                  onChange={(e) => handleInputChange('neighborhood', e.target.value)}
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
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
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
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Calle, número, colonia..."
                  className="border-[#D5D0C8] min-h-[80px]"
                />
              ) : (
                <ReadOnlyField value={patientData.address} multiLine />
              )}
            </Field>
          </div>

          {editMode && (
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                className="border-[#D5D0C8]"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePatientData}
                className="bg-[#7B5C45] hover:bg-[#6A4D38]"
              >
                Guardar Datos
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type FilesUploadSectionProps = {
  solicitudId: string;
  patient?: Patient;
  paymentMethod?: PaymentMethod;
  prescription?: MedicalPrescription;
};

function FilesUploadSection({ solicitudId, patient, paymentMethod, prescription }: FilesUploadSectionProps) {
  const [files, setFiles] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);

  // Cargar archivos guardados localmente al inicio
  useEffect(() => {
    const stored = localStorage.getItem(`files-${solicitudId}`);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setFiles(parsed);
      } catch (e) {
        console.error('Error loading files:', e);
      }
    }
  }, [solicitudId]);

  // Construir lista de archivos con los datos de Google Sheets
  const fileTypes = [
    {
      id: 'ine',
      label: 'INE (Identificación Oficial)',
      icon: FileText,
      url: patient?.ineUrl
    },
    {
      id: 'recetaMedica',
      label: 'Receta Médica',
      icon: FileText,
      url: prescription?.prescriptionUrl
    },
    {
      id: 'caratulaPoliza',
      label: 'Carátula de Póliza',
      icon: FileText,
      url: undefined
    },
    {
      id: 'informeAseguradora',
      label: 'Informe Aseguradora',
      icon: FileText,
      url: paymentMethod?.documentUrl
    },
    {
      id: 'consentimientoInformado',
      label: 'Consentimiento Informado',
      icon: FileText,
      url: undefined
    },
    {
      id: 'estudiosLaboratorio',
      label: 'Estudios de Laboratorio',
      icon: FileText,
      url: undefined
    },
    {
      id: 'otros',
      label: 'Otros Documentos',
      icon: FileText,
      url: undefined
    },
  ];

  const handleFileUpload = (fileId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño máximo (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Tamaño máximo: 10MB');
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo se aceptan: PDF, JPG, PNG');
      return;
    }

    setUploading(fileId);

    // Convertir archivo a base64 para guardar en localStorage
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;

      // Guardar archivo con metadata
      const fileData = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64String,
        uploadedAt: new Date().toISOString()
      };

      const newFiles = { ...files, [fileId]: JSON.stringify(fileData) };
      setFiles(newFiles);

      // Guardar en localStorage
      localStorage.setItem(`files-${solicitudId}`, JSON.stringify(newFiles));

      setUploading(null);
      alert(`Archivo "${file.name}" cargado correctamente`);
    };

    reader.onerror = () => {
      alert('Error al cargar el archivo');
      setUploading(null);
    };

    reader.readAsDataURL(file);
  };

  const handleDownloadFile = (fileId: string) => {
    const fileData = files[fileId];
    if (!fileData) return;

    try {
      const parsed = JSON.parse(fileData);
      const link = document.createElement('a');
      link.href = parsed.data;
      link.download = parsed.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error('Error downloading file:', e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          <strong>Instrucciones:</strong> Carga los documentos requeridos para continuar con el proceso.
          Los archivos aceptados son: PDF, JPG, PNG (máx. 10MB).
        </p>
      </div>

      <div className="grid gap-4">
        {fileTypes.map(({ id, label, icon: Icon, url }) => {
          const localFile = files[id];
          let fileInfo: { name: string; uploadedAt: string } | null = null;

          if (localFile) {
            try {
              const parsed = JSON.parse(localFile);
              fileInfo = {
                name: parsed.name,
                uploadedAt: new Date(parsed.uploadedAt).toLocaleString('es-MX')
              };
            } catch (e) {
              // Si no se puede parsear, es una URL antigua
            }
          }

          const hasLocalFile = !!localFile;
          const hasExternalUrl = !!url;
          const hasAnyFile = hasLocalFile || hasExternalUrl;

          return (
            <div key={id} className="border border-[#E4D4C8] rounded-xl p-4 bg-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Icon className="h-5 w-5 text-[#7B5C45]" />
                  <div className="flex-1">
                    <p className="font-medium text-[#2C2C2C]">{label}</p>
                    {hasLocalFile && fileInfo ? (
                      <div className="mt-1">
                        <p className="text-xs text-green-700 font-medium flex items-center gap-1">
                          <FileCheck className="h-3 w-3" />
                          {fileInfo.name}
                        </p>
                        <p className="text-xs text-[#666]">Subido: {fileInfo.uploadedAt}</p>
                      </div>
                    ) : hasExternalUrl ? (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#8A6BA7] hover:underline flex items-center gap-1 mt-1"
                      >
                        <Download className="h-3 w-3" />
                        Ver desde Google Sheets
                      </a>
                    ) : (
                      <p className="text-xs text-[#999] mt-1">No disponible</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {hasLocalFile && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownloadFile(id)}
                      className="border-[#8A6BA7] text-[#8A6BA7]"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <label htmlFor={`file-${id}`}>
                    <Button
                      size="sm"
                      disabled={uploading === id}
                      className="bg-[#7B5C45] hover:bg-[#6A4D38]"
                      asChild
                    >
                      <span>
                        {uploading === id ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Subiendo...
                          </>
                        ) : hasAnyFile ? (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Reemplazar
                          </>
                        ) : (
                          <>
                            <Upload className="h-4 w-4 mr-2" />
                            Cargar
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                  <input
                    id={`file-${id}`}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileUpload(id, e)}
                    className="hidden"
                    disabled={uploading === id}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function FilesValidationSection({ solicitudId }: { solicitudId: string }) {
  const [validationStatus, setValidationStatus] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente');
  const [comentarios, setComentarios] = useState('');

  const handleStatusChange = (newStatus: 'pendiente' | 'aprobado' | 'rechazado') => {
    setValidationStatus(newStatus);
    localStorage.setItem(`validation-${solicitudId}`, JSON.stringify({ status: newStatus, comentarios }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-sm text-amber-900">
          <strong>Validación de Archivos:</strong> Revisa y aprueba los documentos cargados antes de continuar.
        </p>
      </div>

      <Field label="Estado de Validación">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={validationStatus === 'pendiente' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('pendiente')}
            className={validationStatus === 'pendiente' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
          >
            <Clock className="h-4 w-4 mr-2" />
            Pendiente
          </Button>
          <Button
            variant={validationStatus === 'aprobado' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('aprobado')}
            className={validationStatus === 'aprobado' ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <FileCheck className="h-4 w-4 mr-2" />
            Aprobado
          </Button>
          <Button
            variant={validationStatus === 'rechazado' ? 'default' : 'outline'}
            onClick={() => handleStatusChange('rechazado')}
            className={validationStatus === 'rechazado' ? 'bg-red-600 hover:bg-red-700' : ''}
          >
            <Undo2 className="h-4 w-4 mr-2" />
            Rechazado
          </Button>
        </div>
      </Field>

      <Field label="Comentarios">
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Agrega comentarios sobre la validación..."
          className="w-full min-h-[100px] rounded-xl border border-[#E4D4C8] bg-white px-4 py-3 text-sm text-[#3A2D28]"
        />
      </Field>

      <div className={cn(
        "p-4 rounded-lg",
        validationStatus === 'aprobado' && "bg-green-50 border border-green-200",
        validationStatus === 'rechazado' && "bg-red-50 border border-red-200",
        validationStatus === 'pendiente' && "bg-yellow-50 border border-yellow-200"
      )}>
        <p className="text-sm font-medium">
          Estado actual: <span className="font-bold">{validationStatus.toUpperCase()}</span>
        </p>
      </div>
    </div>
  );
}

type InsuranceManagementSectionProps = {
  solicitudId: string;
  paymentMethod?: PaymentMethod;
  solicitud: Solicitud;
};

function InsuranceManagementSection({ solicitudId, paymentMethod, solicitud }: InsuranceManagementSectionProps) {
  const [cotizacionMonto, setCotizacionMonto] = useState('');
  const [cotizacionDescripcion, setCotizacionDescripcion] = useState('');
  const [generating, setGenerating] = useState(false);
  const [cotizacionGenerated, setCotizacionGenerated] = useState(false);
  const [insuranceStatus, setInsuranceStatus] = useState<'pendiente' | 'aprobado' | 'rechazado'>('pendiente');
  const [cartaPaseUrl, setCartaPaseUrl] = useState('');
  const [servicioSeleccionado, setServicioSeleccionado] = useState('');

  // Auto-rellenar cotización basado en el servicio
  useEffect(() => {
    if (solicitud.testType) {
      const servicio = getServicioByName(solicitud.testType);
      if (servicio) {
        setCotizacionMonto(servicio.precio.toString());
        setCotizacionDescripcion(servicio.descripcion);
        setServicioSeleccionado(servicio.id);
      }
    }
  }, [solicitud.testType]);

  const handleGenerateCotizacion = () => {
    setGenerating(true);
    setTimeout(() => {
      const mockPdfUrl = `https://storage.example.com/${solicitudId}/cotizacion.pdf`;
      const mockZipUrl = `https://storage.example.com/${solicitudId}/expediente.zip`;

      const servicio = SERVICIOS_CATALOG.find(s => s.id === servicioSeleccionado) ||
                         getServicioByName(solicitud.testType);

      localStorage.setItem(`cotizacion-${solicitudId}`, JSON.stringify({
        monto: cotizacionMonto,
        descripcion: cotizacionDescripcion,
        pdfUrl: mockPdfUrl,
        zipUrl: mockZipUrl,
        fecha: new Date().toISOString(),
        servicioId: servicio?.id,
        servicioNombre: servicio?.nombre,
        laboratorio: servicio?.laboratorio,
      }));

      setCotizacionGenerated(true);
      setGenerating(false);
      alert('Cotización y expediente generados correctamente');
    }, 2000);
  };

  const handleCompressFiles = () => {
    setGenerating(true);
    setTimeout(() => {
      const mockZipUrl = `https://storage.example.com/${solicitudId}/documentos.zip`;
      alert('Archivos comprimidos en ZIP correctamente');
      setGenerating(false);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
        <p className="text-sm text-indigo-900">
          <strong>Gestión de Aseguradora:</strong> Genera cotizaciones, comprime documentos y gestiona
          la respuesta de la aseguradora.
        </p>
      </div>

      {/* Información de aseguradora */}
      {paymentMethod && (
        <div className="bg-white border border-[#E4D4C8] rounded-xl p-4">
          <h3 className="font-semibold text-[#2C2C2C] mb-3">Información de la Aseguradora</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-[#666] mb-1">Aseguradora</p>
              <p className="text-sm font-medium text-[#2C2C2C]">{paymentMethod.insurerName}</p>
            </div>
            <div>
              <p className="text-xs text-[#666] mb-1">Método de pago</p>
              <p className="text-sm font-medium text-[#2C2C2C]">{paymentMethod.method}</p>
            </div>
          </div>
        </div>
      )}

      {/* Comprimir archivos */}
      <div className="bg-white border border-[#E4D4C8] rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileArchive className="h-5 w-5 text-[#7B5C45]" />
            <div>
              <p className="font-medium text-[#2C2C2C]">Comprimir Documentos</p>
              <p className="text-xs text-[#666]">Genera un archivo ZIP con todos los documentos cargados</p>
            </div>
          </div>
          <Button
            onClick={handleCompressFiles}
            disabled={generating}
            variant="outline"
            className="border-[#7B5C45] text-[#7B5C45]"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Comprimiendo...
              </>
            ) : (
              <>
                <FileArchive className="h-4 w-4 mr-2" />
                Comprimir
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Generación de cotización */}
      <div className="bg-white border border-[#E4D4C8] rounded-xl p-6">
        <h3 className="font-semibold text-[#2C2C2C] mb-4 flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Crear Cotización
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">
              Servicio / Estudio *
            </label>
            <Select
              value={servicioSeleccionado}
              onValueChange={(value) => {
                setServicioSeleccionado(value);
                const servicio = SERVICIOS_CATALOG.find(s => s.id === value);
                if (servicio) {
                  setCotizacionMonto(servicio.precio.toString());
                  setCotizacionDescripcion(servicio.descripcion);
                }
              }}
            >
              <SelectTrigger className="border-[#D5D0C8]">
                <SelectValue placeholder="Selecciona un servicio" />
              </SelectTrigger>
              <SelectContent>
                {SERVICIOS_CATALOG.map((servicio) => (
                  <SelectItem key={servicio.id} value={servicio.id}>
                    {servicio.nombre} - ${servicio.precio.toLocaleString('es-MX')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">
              Monto del Estudio *
            </label>
            <Input
              type="number"
              value={cotizacionMonto}
              onChange={(e) => setCotizacionMonto(e.target.value)}
              placeholder="$50,000"
              className="border-[#D5D0C8]"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">
              Descripción del Estudio *
            </label>
            <Textarea
              value={cotizacionDescripcion}
              onChange={(e) => setCotizacionDescripcion(e.target.value)}
              placeholder="Panel oncogenómico integral - Análisis completo..."
              className="border-[#D5D0C8] min-h-[100px]"
            />
          </div>

          <Button
            onClick={handleGenerateCotizacion}
            disabled={generating || !cotizacionMonto || !cotizacionDescripcion || cotizacionGenerated}
            className="w-full bg-[#7B5C45] hover:bg-[#6A4D38]"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generando cotización y expediente...
              </>
            ) : cotizacionGenerated ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Cotización Generada
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                Generar Cotización y Expediente
              </>
            )}
          </Button>

          {cotizacionGenerated && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
              <p className="text-sm font-medium text-green-900">Documentos generados:</p>
              <div className="space-y-1">
                <a href="#" className="block text-sm text-[#8A6BA7] hover:underline flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Cotización (PDF)
                </a>
                <a href="#" className="block text-sm text-[#8A6BA7] hover:underline flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Descargar Expediente Completo (ZIP)
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Respuesta de aseguradora */}
      <div className="bg-white border border-[#E4D4C8] rounded-xl p-6">
        <h3 className="font-semibold text-[#2C2C2C] mb-4">Respuesta de la Aseguradora</h3>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">
              Estado de la Solicitud
            </label>
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant={insuranceStatus === 'pendiente' ? 'default' : 'outline'}
                onClick={() => setInsuranceStatus('pendiente')}
                className={insuranceStatus === 'pendiente' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Pendiente
              </Button>
              <Button
                variant={insuranceStatus === 'aprobado' ? 'default' : 'outline'}
                onClick={() => setInsuranceStatus('aprobado')}
                className={insuranceStatus === 'aprobado' ? 'bg-green-600 hover:bg-green-700' : ''}
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aprobado
              </Button>
              <Button
                variant={insuranceStatus === 'rechazado' ? 'default' : 'outline'}
                onClick={() => setInsuranceStatus('rechazado')}
                className={insuranceStatus === 'rechazado' ? 'bg-red-600 hover:bg-red-700' : ''}
                size="sm"
              >
                <Undo2 className="h-4 w-4 mr-2" />
                Rechazado
              </Button>
            </div>
          </div>

          {insuranceStatus === 'aprobado' && (
            <div>
              <label className="text-sm font-medium text-[#2C2C2C] mb-2 block">
                Carta Pase (URL o Archivo)
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={cartaPaseUrl}
                  onChange={(e) => setCartaPaseUrl(e.target.value)}
                  placeholder="URL de la carta pase o subir archivo..."
                  className="border-[#D5D0C8] flex-1"
                />
                <Button variant="outline" size="sm" className="border-[#7B5C45]">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
              {cartaPaseUrl && (
                <a href={cartaPaseUrl} target="_blank" rel="noreferrer" className="text-xs text-[#8A6BA7] hover:underline flex items-center gap-1 mt-2">
                  <Download className="h-3 w-3" />
                  Ver carta pase
                </a>
              )}
            </div>
          )}

          <div className={cn(
            "p-4 rounded-lg",
            insuranceStatus === 'aprobado' && "bg-green-50 border border-green-200",
            insuranceStatus === 'rechazado' && "bg-red-50 border border-red-200",
            insuranceStatus === 'pendiente' && "bg-yellow-50 border border-yellow-200"
          )}>
            <p className="text-sm font-medium">
              Estado: <span className="font-bold">{insuranceStatus.toUpperCase()}</span>
            </p>
            {insuranceStatus === 'aprobado' && (
              <p className="text-xs text-green-700 mt-1">
                La aseguradora ha aprobado el estudio. Puedes continuar con la solicitud VT.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

type VTRequestSectionProps = {
  solicitudId: string;
  solicitud: Solicitud;
};

function VTRequestSection({ solicitudId, solicitud }: VTRequestSectionProps) {
  const [status, setStatus] = useState<'pendiente' | 'enviado' | 'aprobado'>('pendiente');
  const [comentarios, setComentarios] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(`vt-request-${solicitudId}`);
    if (stored) {
      const data = JSON.parse(stored);
      setStatus(data.status);
      setComentarios(data.comentarios || '');
    }
  }, [solicitudId]);

  const handleSendRequest = () => {
    setSending(true);
    setTimeout(() => {
      setStatus('enviado');
      setSending(false);

      // Obtener todos los datos necesarios del localStorage
      const patientDataStr = localStorage.getItem(`patient-data-${solicitudId}`);
      const cotizacionDataStr = localStorage.getItem(`cotizacion-${solicitudId}`);
      const filesDataStr = localStorage.getItem(`files-${solicitudId}`);

      const patientData = patientDataStr ? JSON.parse(patientDataStr) : {};
      const cotizacion = cotizacionDataStr ? JSON.parse(cotizacionDataStr) : {};
      const filesData = filesDataStr ? JSON.parse(filesDataStr) : {};

      // Construir nombre completo del paciente
      const nombreCompleto = patientData.firstName && patientData.lastName
        ? `${patientData.firstName} ${patientData.lastName}`
        : solicitud.patient;

      // Verificar si faltan datos críticos
      if (!cotizacion.monto || cotizacion.monto === '0' || cotizacion.monto === 0) {
        alert('⚠️ Advertencia: No se ha establecido un precio para el estudio. Por favor, completa la información en la sección "Gestión de Aseguradora".');
      }

      // Generar ID VT único (formato: VT-YYYYMMDD-HHMMSS-XXX)
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, ''); // HHMMSS
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const vtId = `VT-${dateStr}-${timeStr}-${randomSuffix}`;

      // Guardar solicitud VT
      localStorage.setItem(`vt-request-${solicitudId}`, JSON.stringify({
        status: 'enviado',
        comentarios,
        fecha: new Date().toISOString(),
        vtId,
      }));

      // Crear solicitud de administración con todos los datos
      const adminSolicitud = {
        id: vtId, // Usar el nuevo ID VT
        solicitudId: solicitudId, // Mantener referencia a la solicitud original
        solicitudOrigenId: solicitud.id, // ID de la solicitud de ventas
        paciente: nombreCompleto,
        servicio: cotizacion.servicioNombre || solicitud.testType,
        laboratorio: cotizacion.laboratorio || 'Tempus Labs, Inc',
        monto: Number(cotizacion.monto) || 0,
        aseguradora: patientData.aseguradora || 'N/A',
        fechaSolicitud: new Date().toISOString(),

        // Estados del workflow
        statusCompra: 'pendiente' as const,
        statusLogistica: 'pendiente' as const,
        statusEstudio: 'pendiente' as const,
        statusFacturacion: 'pendiente' as const,
        statusCobranza: 'pendiente' as const,

        // Información adicional
        servicioId: cotizacion.servicioId,

        // Datos del paciente completos
        pacienteData: {
          nombreCompleto,
          telefono: patientData.phone || solicitud.contactPhone,
          curp: patientData.curp,
          fechaNacimiento: patientData.birthDate,
          genero: patientData.gender,
          direccion: patientData.address,
          ciudad: patientData.municipality,
          estado: patientData.state,
          codigoPostal: patientData.postalCode,
          pais: patientData.country || 'México',
          colonia: patientData.neighborhood,
        },

        // Datos de la solicitud original
        solicitudOriginal: {
          doctor: solicitud.doctor,
          padecimiento: solicitud.condition,
          tipoEstudio: solicitud.testType,
          telefonoContacto: solicitud.contactPhone,
          telefonoVendedor: solicitud.vendorPhone,
          fechaCreacion: solicitud.createdAt,
        },

        // Archivos cargados (contar cuántos hay)
        archivosCount: Object.keys(filesData).length,

        // Notas
        notas: comentarios,
      };

      // Guardar con el nuevo ID VT
      localStorage.setItem(`admin-solicitud-${vtId}`, JSON.stringify(adminSolicitud));

      console.log('✅ Solicitud VT enviada a administración:', adminSolicitud);
      console.log('📋 ID VT generado:', vtId);
      console.log('🔗 Solicitud origen:', solicitudId);

      alert(`✅ Solicitud VT enviada a administración correctamente\n\n📋 ID VT: ${vtId}\n💰 Monto: $${Number(cotizacion.monto || 0).toLocaleString('es-MX')}\n👤 Paciente: ${nombreCompleto}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-900">
          <strong>Solicitud VT:</strong> Una vez que la aseguradora aprueba y se ha enviado la carta pase,
          puedes enviar la solicitud a administración para que continúe con el proceso.
        </p>
      </div>

      <Field label="Estado de la Solicitud VT">
        <div className={cn(
          "p-6 rounded-xl border-2",
          status === 'pendiente' && "bg-gray-50 border-gray-300",
          status === 'enviado' && "bg-blue-50 border-blue-300",
          status === 'aprobado' && "bg-green-50 border-green-300"
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg text-[#2C2C2C]">
                {status === 'pendiente' && 'Pendiente de Envío'}
                {status === 'enviado' && 'Enviado a Administración'}
                {status === 'aprobado' && 'Aprobado por Administración'}
              </p>
              <p className="text-sm text-[#666] mt-1">
                {status === 'pendiente' && 'La solicitud VT aún no ha sido enviada'}
                {status === 'enviado' && 'Esperando aprobación de administración'}
                {status === 'aprobado' && 'El proceso puede continuar'}
              </p>
            </div>
            {status === 'pendiente' && (
              <Button
                onClick={handleSendRequest}
                disabled={sending}
                className="bg-[#9B7CB8] hover:bg-[#8A6BA7]"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  'Enviar Solicitud VT'
                )}
              </Button>
            )}
          </div>
        </div>
      </Field>

      <Field label="Notas y Comentarios">
        <textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Agrega comentarios o notas sobre la solicitud VT..."
          className="w-full min-h-[120px] rounded-xl border border-[#E4D4C8] bg-white px-4 py-3 text-sm text-[#3A2D28]"
        />
      </Field>

      {status !== 'pendiente' && (
        <div className="bg-white border border-[#E4D4C8] rounded-xl p-4">
          <p className="text-sm font-medium text-[#2C2C2C] mb-2">Historial</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-[#666]">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Solicitud creada</span>
            </div>
            {status === 'enviado' && (
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                <span>Enviado a administración</span>
              </div>
            )}
            {status === 'aprobado' && (
              <div className="flex items-center gap-2 text-sm text-[#666]">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <span>Aprobado por administración</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
