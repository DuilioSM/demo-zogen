"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { CheckCircle2, Loader2, Eye, Undo2, Upload, Download, FileCheck, FileArchive, Clock, ArrowLeft } from "lucide-react";
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
import { getServicioByName, SERVICIOS_CATALOG, type Servicio } from "@/types/servicio";
import { ASEGURADORAS_CATALOG } from "@/types/aseguradora";
import type { SolicitudServiceData } from "@/types/solicitudes";
import { CUENTAS_CATALOG } from "@/types/cuenta";
import { ESPECIALISTAS_CATALOG } from "@/types/especialista";
import { LABORATORIOS_CATALOG } from "@/types/laboratorio";
import type { Prospecto } from "@/types/prospecto";
import { PROSPECTOS_CATALOG } from "@/types/prospecto";
import { PADECIMIENTOS_CATALOG } from "@/types/padecimiento";
import { FilesUploadSection } from "@/components/solicitudes/FilesUploadSection";

const STEPS = [
  { id: "order", label: "Solicitud del pedido" },
  { id: "patient", label: "Datos del paciente" },
  { id: "service", label: "Datos del Servicio" },
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
const PROSPECTOS_STORAGE_KEY = "zogen-prospectos";

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
  const [serviceData, setServiceData] = useState<SolicitudServiceData | null>(null);
  const [orderData, setOrderData] = useState({
    patient: "",
    doctor: "",
    testType: "",
    condition: "",
    contactPhone: "",
  });
  const [changeLog, setChangeLog] = useState<Array<{
    id: string;
    timestamp: string;
    step: string;
    action: string;
    user: string;
  }>>([]);

  const solicitud = useMemo(() => {
    return solicitudes.find((item) => {
      if (item.id === telephoneParam) return true;
      const contact = sanitizePhone(item.contactPhone);
      return contact === normalizedParam;
    });
  }, [solicitudes, telephoneParam, normalizedParam]);

  const patient = useMemo(() => {
    return patients.find((item) => sanitizePhone(item.phone) === normalizedParam);
  }, [patients, normalizedParam]);

  const paymentMethod = useMemo(() => {
    return methods.find((item) => sanitizePhone(item.phone) === normalizedParam);
  }, [methods, normalizedParam]);

  const prescription = useMemo(() => {
    return prescriptions.find((item) => sanitizePhone(item.phone) === normalizedParam);
  }, [prescriptions, normalizedParam]);

  useEffect(() => {
    if (!solicitud) {
      setServiceData(null);
      return;
    }

    if (typeof window === "undefined") return;

    const storageKey = `service-data-${solicitud.id}`;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setServiceData(JSON.parse(stored));
        return;
      }
    } catch (error) {
      console.error("Error loading service data", error);
    }

    const matchedById = solicitud.servicioId
      ? SERVICIOS_CATALOG.find((item) => item.id === solicitud.servicioId)
      : null;
    const matchedByName = !matchedById ? getServicioByName(solicitud.servicioNombre || solicitud.testType) : null;
    const servicio = matchedById || matchedByName || SERVICIOS_CATALOG[0];
    const aseguradoraFromSolicitud = solicitud.aseguradoraId
      ? ASEGURADORAS_CATALOG.find((item) => item.id === solicitud.aseguradoraId)
      : null;

    const initial: SolicitudServiceData = {
      servicioId: servicio?.id || "",
      servicioNombre: servicio?.nombre || solicitud.testType,
      laboratorio: servicio?.laboratorio,
      precioUnitario: servicio?.precio,
      tiempoEntrega: servicio?.tiempoEntrega,
      cantidad: solicitud.servicioCantidad ?? 1,
      metodoPago: solicitud.metodoPago ?? (aseguradoraFromSolicitud ? "aseguradora" : "bolsillo"),
      aseguradoraId: solicitud.aseguradoraId ?? aseguradoraFromSolicitud?.id,
      aseguradoraNombre: solicitud.aseguradoraNombre ?? aseguradoraFromSolicitud?.nombre,
      aseguradoraRfc: solicitud.aseguradoraRFC ?? aseguradoraFromSolicitud?.rfc,
      notas: "",
    };

    setServiceData(initial);
  }, [solicitud]);

  useEffect(() => {
    if (!solicitud || !serviceData || typeof window === "undefined") return;
    window.localStorage.setItem(`service-data-${solicitud.id}`, JSON.stringify(serviceData));
  }, [serviceData, solicitud]);

  useEffect(() => {
    if (!solicitud) return;
    const stored = localStorage.getItem(`order-data-${solicitud.id}`);
    if (stored) {
      try {
        setOrderData(JSON.parse(stored));
      } catch (error) {
        console.error("Error loading order data:", error);
        setOrderData({
          patient: solicitud.patient,
          doctor: solicitud.doctor,
          testType: solicitud.testType,
          condition: solicitud.condition,
          contactPhone: solicitud.contactPhone,
        });
      }
    } else {
      setOrderData({
        patient: solicitud.patient,
        doctor: solicitud.doctor,
        testType: solicitud.testType,
        condition: solicitud.condition,
        contactPhone: solicitud.contactPhone,
      });
    }

    // Cargar log de cambios dummy
    const dummyLog = [
      {
        id: "1",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        step: "Solicitud del pedido",
        action: "Datos de solicitud guardados",
        user: "Juan Pérez",
      },
      {
        id: "2",
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        step: "Datos del paciente",
        action: "Información del paciente actualizada",
        user: "María García",
      },
      {
        id: "3",
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        step: "Datos del Servicio",
        action: "Servicio seleccionado: xT/xR + xF",
        user: "Juan Pérez",
      },
    ];
    setChangeLog(dummyLog);
  }, [solicitud]);

  const addChangeLogEntry = (step: string, action: string) => {
    const newEntry = {
      id: `change-${Date.now()}`,
      timestamp: new Date().toISOString(),
      step,
      action,
      user: "Usuario Actual",
    };
    setChangeLog((prev) => [newEntry, ...prev]);
  };

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
          <Link href="/ventas/solicitudes">
            <Button className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
              <Undo2 className="mr-2 h-4 w-4" /> Regresar
            </Button>
          </Link>
          <Link href={`/ventas/solicitudes/${telephoneParam}`}>
            <Button variant="outline" className="border-[#7B5C45] text-[#7B5C45]">
              Ver detalle
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const detailSlug = solicitud?.id || normalizedParam;
  const viewHref = `/ventas/solicitudes/${detailSlug}`;

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2C2C2C]">
      <header className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-[#3C4858]">Actualizar prueba</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/ventas/solicitudes">
                <Button className="flex items-center gap-2 bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700">
                  <ArrowLeft className="h-4 w-4" />
                  Volver a Solicitudes
                </Button>
              </Link>
              <Link href={viewHref}>
                <Button className="flex items-center gap-2 bg-[#7B5C45] px-4 py-2 text-sm font-medium text-white hover:bg-[#6A4D38]">
                  <Eye className="h-4 w-4" />
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
              serviceData,
              onServiceChange: (data) => setServiceData(data),
              orderData,
              onOrderChange: (data) => setOrderData(data),
              addChangeLogEntry,
            })}
          </section>

          <aside className="w-full lg:w-[280px]">
            <div className="rounded-lg bg-white p-3 shadow-sm">
              <h3 className="text-sm font-semibold text-[#2C2C2C] mb-2 flex items-center gap-2">
                <span className="h-2 w-2 bg-[#7B5C45] rounded-full"></span>
                Cambios
              </h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {changeLog.length === 0 ? (
                  <p className="text-xs text-gray-500 italic py-2">
                    Sin cambios
                  </p>
                ) : (
                  changeLog.map((log) => (
                    <div
                      key={log.id}
                      className="border-l-2 border-[#7B5C45] bg-[#F5F0E8] p-2 rounded-r"
                    >
                      <div className="flex items-start justify-between mb-0.5">
                        <span className="text-[10px] font-semibold text-[#7B5C45] uppercase">
                          {log.step}
                        </span>
                        <span className="text-[10px] text-gray-500">
                          {new Date(log.timestamp).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                          })}
                        </span>
                      </div>
                      <p className="text-xs text-[#2C2C2C] leading-tight">
                        {log.action}
                      </p>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {log.user}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

type InsuranceStatus = 'pendiente' | 'enviado' | 'aprobado' | 'rechazado';

type OrderData = {
  patient: string;
  doctor: string;
  testType: string;
  condition: string;
  contactPhone: string;
};

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
  serviceData: SolicitudServiceData | null;
  onServiceChange: (data: SolicitudServiceData) => void;
  orderData: OrderData;
  onOrderChange: (data: OrderData) => void;
  addChangeLogEntry: (step: string, action: string) => void;
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
  serviceData,
  onServiceChange,
  orderData,
  onOrderChange,
  addChangeLogEntry,
}: RenderStepProps) {
  const getEspecialista = () => {
    // Buscar por teléfono en el catálogo de especialistas
    const especialista = ESPECIALISTAS_CATALOG.find(e => e.telefono === solicitud.vendorPhone);
    return especialista?.nombreCompleto || 'No asignado';
  };

  const handleSaveOrderData = () => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`order-data-${solicitud.id}`, JSON.stringify(orderData));

    // También actualizar en el catálogo de solicitudes
    try {
      const storedSolicitudes = localStorage.getItem('zogen-solicitudes');
      if (storedSolicitudes) {
        const parsed = JSON.parse(storedSolicitudes);
        const updated = parsed.map((item: Solicitud) =>
          item.id === solicitud.id ? { ...item, ...orderData } : item
        );
        localStorage.setItem('zogen-solicitudes', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error syncing order data into solicitudes store:', error);
    }

    addChangeLogEntry("Solicitud del pedido", "Datos de solicitud actualizados");
    alert('Datos de la solicitud guardados correctamente');
  };

  const handleOrderInputChange = (field: keyof OrderData, value: string) => {
    onOrderChange({ ...orderData, [field]: value });
  };

  switch (activeStep) {
    case "order":
      return (
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Editar datos de la solicitud:</strong> Puedes modificar los campos de la solicitud de pedido.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Nombre del paciente *">
              <Input
                value={orderData.patient}
                onChange={(e) => handleOrderInputChange('patient', e.target.value)}
                placeholder="Nombre completo del paciente"
                className="border-[#D5D0C8]"
              />
            </Field>
            <Field label="Teléfono de contacto *">
              <Input
                value={orderData.contactPhone}
                onChange={(e) => handleOrderInputChange('contactPhone', e.target.value)}
                placeholder="+52 55 1234 5678"
                className="border-[#D5D0C8]"
              />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Médico Solicitante">
              <Input
                value={orderData.doctor}
                onChange={(e) => handleOrderInputChange('doctor', e.target.value)}
                placeholder="Nombre del médico"
                className="border-[#D5D0C8]"
              />
            </Field>
            <Field label="Especialista">
              <ReadOnlyField value={getEspecialista()} />
            </Field>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Field label="Tipo de prueba">
              <Input
                value={orderData.testType}
                onChange={(e) => handleOrderInputChange('testType', e.target.value)}
                placeholder="Tipo de estudio"
                className="border-[#D5D0C8]"
              />
            </Field>
            <Field label="Padecimiento *">
              <Select
                value={orderData.condition}
                onValueChange={(value) => handleOrderInputChange('condition', value)}
              >
                <SelectTrigger className="border-[#D5D0C8]">
                  <SelectValue placeholder="Selecciona un padecimiento" />
                </SelectTrigger>
                <SelectContent>
                  {PADECIMIENTOS_CATALOG.filter(p => p.activo).map((padecimiento) => (
                    <SelectItem key={padecimiento.id} value={padecimiento.nombre}>
                      {padecimiento.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field label="Fecha de creación">
            <ReadOnlyField value={formatDate(solicitud.createdAt)} />
          </Field>

          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              onClick={handleSaveOrderData}
              className="bg-[#7B5C45] hover:bg-[#6A4D38] px-6 py-2"
            >
              Guardar Cambios
            </Button>
          </div>
        </div>
      );
    case "patient":
      return (
        <PatientDataSection
          solicitudId={solicitud.id}
          solicitud={solicitud}
          patient={patient}
          patientStatus={patientStatus}
          patientError={patientError}
          retryPatient={retryPatient}
        />
      );
    case "service":
      return (
        <ServiceDataSection
          solicitudId={solicitud.id}
          serviceData={serviceData}
          onServiceChange={onServiceChange}
        />
      );
    case "insurance":
      return (
        <InsuranceManagementSection
          solicitudId={solicitud.id}
          solicitud={solicitud}
          serviceData={serviceData}
        />
      );
    case "files":
      return <FilesUploadSection solicitudId={solicitud.id} patient={patient} paymentMethod={paymentMethod} prescription={prescription} />;
    case "validation":
      return <FilesValidationSection solicitudId={solicitud.id} />;
    case "vt":
      return <VTRequestSection solicitudId={solicitud.id} solicitud={solicitud} serviceData={serviceData} />;
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
  solicitud: Solicitud;
  patient?: Patient;
  patientStatus: string;
  patientError: string | null;
  retryPatient: () => void;
};

function PatientDataSection({ solicitudId, solicitud, patient, patientStatus, patientError, retryPatient }: PatientDataSectionProps) {
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

  const storedPatientSnapshot = solicitud.patientData ? JSON.stringify(solicitud.patientData) : null;

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
    } else if (solicitud.patientData) {
      const patientDataWithIne = solicitud.patientData as typeof solicitud.patientData & { ineUrl?: string };
      setPatientData({
        ...solicitud.patientData,
        ineUrl: patientDataWithIne.ineUrl || ''
      });
    } else if (patient) {
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
  }, [solicitudId, patient, storedPatientSnapshot]);

  const upsertProspectFromPatient = () => {
    const fullName = `${patientData.firstName} ${patientData.lastName}`.trim() || solicitud.patient;
    const telefono = patientData.phone || solicitud.contactPhone || 'Sin teléfono';
    const especialista = ESPECIALISTAS_CATALOG.find((e) => e.telefono === solicitud.vendorPhone);
    const stored = localStorage.getItem(PROSPECTOS_STORAGE_KEY);
    let prospectList: Prospecto[] = stored ? (() => {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Error parsing stored prospects', error);
        return [...PROSPECTOS_CATALOG];
      }
    })() : [...PROSPECTOS_CATALOG];

    const newProspect: Prospecto = {
      id: `pac-${solicitudId}`,
      nombre: fullName,
      email: 'sin-correo@zogen.mx',
      telefono,
      especialistaId: especialista?.id || 'sin-asignar',
      estado: 'nuevo',
      fechaCreacion: new Date().toISOString(),
    };

    const existingIndex = prospectList.findIndex(
      (prospect) => prospect.id === newProspect.id || prospect.telefono === newProspect.telefono
    );

    if (existingIndex >= 0) {
      prospectList[existingIndex] = {
        ...prospectList[existingIndex],
        nombre: newProspect.nombre,
        telefono: newProspect.telefono,
        fechaUltimoContacto: new Date().toISOString(),
      };
    } else {
      prospectList = [...prospectList, newProspect];
    }

    localStorage.setItem(PROSPECTOS_STORAGE_KEY, JSON.stringify(prospectList));
  };

  const handleSavePatientData = () => {
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
      console.error('Error syncing patient data into solicitudes store:', error);
    }
    upsertProspectFromPatient();
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
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => setEditMode(false)}
                className="border-[#D5D0C8] px-6 py-2"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSavePatientData}
                className="bg-[#7B5C45] hover:bg-[#6A4D38] px-6 py-2"
              >
                Guardar Cambios
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

type ServiceDataSectionProps = {
  solicitudId: string;
  serviceData: SolicitudServiceData | null;
  onServiceChange: (data: SolicitudServiceData) => void;
};

function ServiceDataSection({ solicitudId, serviceData, onServiceChange }: ServiceDataSectionProps) {
  const [savingService, setSavingService] = useState(false);
  if (!serviceData) {
    return (
      <div className="flex flex-col items-center gap-3 py-10 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#7B5C45]" />
        <p className="text-sm text-[#666]">Preparando datos del servicio…</p>
      </div>
    );
  }
  const updateData = (updates: Partial<SolicitudServiceData>) => {
    onServiceChange({ ...serviceData, ...updates });
  };

  const handleServicioChange = (value: string) => {
    const info = SERVICIOS_CATALOG.find((item) => item.id === value);
    updateData({
      servicioId: value,
      servicioNombre: info?.nombre || serviceData.servicioNombre,
      laboratorio: info?.laboratorio,
      precioUnitario: info?.precio,
      tiempoEntrega: info?.tiempoEntrega,
    });
  };

  const handleMetodoPagoChange = (value: string) => {
    const metodo = value === "aseguradora" ? "aseguradora" : "bolsillo";
    updateData({
      metodoPago: metodo,
      ...(metodo === "bolsillo"
        ? { aseguradoraId: undefined, aseguradoraNombre: undefined, aseguradoraRfc: undefined }
        : {}),
    });
  };

  const handleAseguradoraChange = (value: string) => {
    const info = ASEGURADORAS_CATALOG.find((item) => item.id === value);
    updateData({
      aseguradoraId: value,
      aseguradoraNombre: info?.nombre,
      aseguradoraRfc: info?.rfc,
    });
  };

  const handleSaveServiceData = () => {
    if (typeof window === 'undefined') return;
    setSavingService(true);
    window.localStorage.setItem(`service-data-${solicitudId}`, JSON.stringify(serviceData));
    setTimeout(() => {
      setSavingService(false);
      alert('Datos del servicio guardados');
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Servicio a realizar *">
          <Select value={serviceData.servicioId} onValueChange={handleServicioChange}>
            <SelectTrigger className="border-[#D5D0C8]">
              <SelectValue placeholder="Selecciona un servicio" />
            </SelectTrigger>
            <SelectContent>
              {SERVICIOS_CATALOG.map((servicio) => (
                <SelectItem key={servicio.id} value={servicio.id}>
                  {servicio.nombre} · {servicio.laboratorio}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Laboratorio asignado *">
          <Select
            value={serviceData.laboratorio ?? undefined}
            onValueChange={(value) => updateData({ laboratorio: value })}
          >
            <SelectTrigger className="border-[#D5D0C8]">
              <SelectValue placeholder="Selecciona laboratorio" />
            </SelectTrigger>
            <SelectContent>
              {LABORATORIOS_CATALOG.map((lab) => (
                <SelectItem key={lab.id} value={lab.nombre}>
                  {lab.nombre}
                </SelectItem>
              ))}
              {serviceData.laboratorio && !LABORATORIOS_CATALOG.some((lab) => lab.nombre === serviceData.laboratorio) && (
                <SelectItem value={serviceData.laboratorio}>{serviceData.laboratorio}</SelectItem>
              )}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Field label="Método de pago *">
          <Select value={serviceData.metodoPago} onValueChange={handleMetodoPagoChange}>
            <SelectTrigger className="border-[#D5D0C8]">
              <SelectValue placeholder="Selecciona un método" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="bolsillo">Pago directo (Bolsillo)</SelectItem>
              <SelectItem value="aseguradora">Cobro a Aseguradora</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field label="Aseguradora">
          <Select
            value={serviceData.aseguradoraId ?? undefined}
            onValueChange={handleAseguradoraChange}
            disabled={serviceData.metodoPago !== "aseguradora"}
          >
            <SelectTrigger className="border-[#D5D0C8]">
              <SelectValue placeholder="Selecciona aseguradora" />
            </SelectTrigger>
            <SelectContent>
              {ASEGURADORAS_CATALOG.map((aseguradora) => (
                <SelectItem key={aseguradora.id} value={aseguradora.id}>
                  {aseguradora.nombre}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {serviceData.metodoPago === "aseguradora" && !serviceData.aseguradoraId && (
            <p className="mt-1 text-xs text-red-600">Selecciona una aseguradora para continuar.</p>
          )}
        </Field>
      </div>

      <Field label="Notas adicionales">
        <Textarea
          value={serviceData.notas || ""}
          onChange={(event) => updateData({ notas: event.target.value })}
          placeholder="Ej. Agregar interpretación clínica urgente, confirmar cobertura antes de facturar…"
          className="min-h-[140px] border-[#D5D0C8]"
        />
      </Field>

      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button onClick={handleSaveServiceData} disabled={savingService} className="bg-[#7B5C45] hover:bg-[#6A4D38] px-6 py-2">
          {savingService ? 'Guardando…' : 'Guardar Cambios'}
        </Button>
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
  solicitud: Solicitud;
  serviceData?: SolicitudServiceData | null;
};

type StoredInsuranceData = {
  status: InsuranceStatus;
  cartaPaseUrl?: string;
  lastSentAt?: string | null;
};

function InsuranceManagementSection({
  solicitudId,
  solicitud,
  serviceData,
}: InsuranceManagementSectionProps) {
  const [generating, setGenerating] = useState(false);
  const [insuranceStatus, setInsuranceStatus] = useState<InsuranceStatus>('pendiente');
  const [cartaPaseUrl, setCartaPaseUrl] = useState('');
  const [lastSubmission, setLastSubmission] = useState<string | null>(null);
  const insuranceStorageKey = `insurance-data-${solicitudId}`;
  const filesStorageKey = `files-${solicitudId}`;
  const [cartaPaseFile, setCartaPaseFile] = useState<{ name: string; uploadedAt?: string; data?: string } | null>(null);

  const servicioNombre = serviceData?.servicioNombre || solicitud.testType;
  const laboratorio = serviceData?.laboratorio || solicitud.servicioLaboratorio || 'Laboratorio por definir';
  const montoCalculado = (serviceData?.precioUnitario ?? 0) * (serviceData?.cantidad ?? 1);

  useEffect(() => {
    const stored = localStorage.getItem(insuranceStorageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredInsuranceData;
        setInsuranceStatus(parsed.status ?? 'pendiente');
        setCartaPaseUrl(parsed.cartaPaseUrl ?? '');
        setLastSubmission(parsed.lastSentAt ?? null);
      } catch (error) {
        console.error('Error reading insurance data', error);
      }
    }
  }, [insuranceStorageKey]);

  useEffect(() => {
    const loadCartaPaseFromStorage = () => {
      const filesData = localStorage.getItem(filesStorageKey);
      if (!filesData) {
        setCartaPaseFile(null);
        return;
      }
      try {
        const parsedFiles = JSON.parse(filesData);
        const cartaEntry = parsedFiles.cartaPase;
        if (!cartaEntry) {
          setCartaPaseFile(null);
          return;
        }
        let payload = cartaEntry;
        if (typeof cartaEntry === 'string') {
          try {
            payload = JSON.parse(cartaEntry);
          } catch (error) {
            payload = { data: cartaEntry };
          }
        }
        setCartaPaseFile({
          name: payload.name || 'Carta Pase',
          uploadedAt: payload.uploadedAt,
          data: payload.data || cartaEntry,
        });
      } catch (error) {
        console.error('Error reading carta pase file', error);
        setCartaPaseFile(null);
      }
    };

    loadCartaPaseFromStorage();
  }, [filesStorageKey]);

  const persistInsuranceData = (updates: Partial<StoredInsuranceData>) => {
    const payload: StoredInsuranceData = {
      status: updates.status ?? insuranceStatus,
      cartaPaseUrl: updates.cartaPaseUrl ?? cartaPaseUrl,
      lastSentAt: updates.lastSentAt ?? lastSubmission,
    };
    localStorage.setItem(insuranceStorageKey, JSON.stringify(payload));
    setInsuranceStatus(payload.status);
    setCartaPaseUrl(payload.cartaPaseUrl ?? '');
    setLastSubmission(payload.lastSentAt ?? null);
  };

  const syncCotizacionSnapshot = () => {
    if (!serviceData) return;
    const descripcion = serviceData.notas?.trim() || `Gestión de ${servicioNombre}`;
    const payload = {
      monto: montoCalculado,
      descripcion,
      fecha: new Date().toISOString(),
      servicioId: serviceData.servicioId,
      servicioNombre,
      laboratorio,
      cantidad: serviceData.cantidad,
      metodoPago: serviceData.metodoPago,
      aseguradoraId: serviceData.aseguradoraId,
      aseguradoraNombre: serviceData.aseguradoraNombre,
      aseguradoraRfc: serviceData.aseguradoraRfc,
    };
    localStorage.setItem(`cotizacion-${solicitudId}`, JSON.stringify(payload));
  };

  const handleCompressFiles = () => {
    setGenerating(true);
    setTimeout(() => {
      alert('Archivos comprimidos en ZIP correctamente');
      setGenerating(false);
    }, 1500);
  };

  const handleSendToInsurance = () => {
    if (!serviceData) {
      alert('Completa los Datos del Servicio antes de enviar a la aseguradora.');
      return;
    }

    if (serviceData.metodoPago === 'aseguradora' && !serviceData.aseguradoraId) {
      alert('Selecciona una aseguradora en la sección "Datos del Servicio".');
      return;
    }

    syncCotizacionSnapshot();
    const timestamp = new Date().toISOString();
    persistInsuranceData({ status: 'enviado', lastSentAt: timestamp });
    alert('Expediente enviado a la aseguradora. Actualiza el estado cuando recibas una respuesta.');
  };

  const handleStatusChange = (value: InsuranceStatus) => {
    persistInsuranceData({ status: value });
  };

  const handleCartaChange = (value: string) => {
    persistInsuranceData({ cartaPaseUrl: value });
  };

  const handleCartaPaseUpload = (file?: File | null) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const payload = {
        name: file.name,
        type: file.type,
        size: file.size,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };
      let filesData: Record<string, unknown> = {};
      const storedFiles = localStorage.getItem(filesStorageKey);
      if (storedFiles) {
        try {
          filesData = JSON.parse(storedFiles);
        } catch (error) {
          console.error('Error leyendo archivos almacenados', error);
        }
      }
      filesData.cartaPase = JSON.stringify(payload);
      localStorage.setItem(filesStorageKey, JSON.stringify(filesData));
      setCartaPaseFile({ name: payload.name, uploadedAt: payload.uploadedAt, data: payload.data });
      alert(`Carta pase "${file.name}" cargada correctamente`);
    };
    reader.onerror = () => {
      alert('No fue posible cargar la carta pase.');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCartaPase = () => {
    if (cartaPaseFile?.data) {
      const link = document.createElement('a');
      link.href = cartaPaseFile.data;
      link.download = cartaPaseFile.name || 'carta-pase';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }
    if (cartaPaseUrl) {
      window.open(cartaPaseUrl, '_blank');
    }
  };

  const statusMessage: Record<InsuranceStatus, string> = {
    pendiente: 'La solicitud está lista, pero aún no se ha enviado a la aseguradora.',
    enviado: 'Estamos esperando respuesta de la aseguradora.',
    aprobado: 'La aseguradora aprobó el servicio. Puedes continuar con VT.',
    rechazado: 'La aseguradora rechazó la solicitud. Revisa observaciones.',
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E4D4C8] rounded-xl p-4 space-y-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#2C2C2C]">Estatus con la aseguradora</p>
            <p className="text-xs text-[#666]">Actualiza el estado conforme recibas novedades.</p>
            {lastSubmission && (
              <p className="text-xs text-[#999] mt-1">Último envío: {new Date(lastSubmission).toLocaleString('es-MX')}</p>
            )}
          </div>
          <div className="w-full max-w-[220px]">
            <Select value={insuranceStatus} onValueChange={(value) => handleStatusChange(value as InsuranceStatus)}>
              <SelectTrigger className="border-[#D5D0C8]">
                <SelectValue placeholder="Selecciona el estatus" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="enviado">Enviado</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        {insuranceStatus === 'aprobado' && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-[#2C2C2C]">Carta Pase (URL o archivo)</label>
            <Input
              type="text"
              value={cartaPaseUrl}
              onChange={(e) => handleCartaChange(e.target.value)}
              placeholder="Pega la URL de la carta pase"
              className="border-[#D5D0C8]"
            />
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="border-[#D5D0C8]"
                onChange={(event) => handleCartaPaseUpload(event.target.files?.[0])}
              />
              {(cartaPaseFile || cartaPaseUrl) && (
                <Button variant="outline" size="sm" className="border-[#7B5C45]" onClick={handleDownloadCartaPase}>
                  <Download className="h-4 w-4 mr-2" />
                  Ver carta pase
                </Button>
              )}
            </div>
            {cartaPaseFile?.uploadedAt && (
              <p className="text-xs text-[#666]">
                Archivo cargado el {new Date(cartaPaseFile.uploadedAt).toLocaleString('es-MX')} ({cartaPaseFile.name})
              </p>
            )}
          </div>
        )}
        <div
          className={cn(
            'p-4 rounded-lg border text-sm',
            insuranceStatus === 'aprobado' && 'bg-green-50 border-green-200',
            insuranceStatus === 'rechazado' && 'bg-red-50 border-red-200',
            insuranceStatus === 'enviado' && 'bg-blue-50 border-blue-200',
            insuranceStatus === 'pendiente' && 'bg-yellow-50 border-yellow-200'
          )}
        >
          <p>
            Estado actual: <span className="font-bold uppercase">{insuranceStatus}</span>
          </p>
          <p className="text-xs mt-1 text-[#555]">{statusMessage[insuranceStatus]}</p>
        </div>
      </div>

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

      <div className="bg-white border border-[#E4D4C8] rounded-xl p-4">
        <p className="text-sm text-[#2C2C2C] mb-2">Enviar expediente a la aseguradora</p>
        <p className="text-xs text-[#666]">Asegúrate de tener el expediente completo antes de enviarlo. Guardamos un snapshot interno con los datos del servicio.</p>
        <div className="mt-3 flex justify-end">
          <Button onClick={handleSendToInsurance} disabled={!serviceData} className="bg-[#7B5C45] hover:bg-[#5E4331]">
            Enviar a la aseguradora
          </Button>
        </div>
      </div>
    </div>
  );
}

type VTRequestSectionProps = {
  solicitudId: string;
  solicitud: Solicitud;
  serviceData: SolicitudServiceData | null;
};

function VTRequestSection({ solicitudId, solicitud, serviceData }: VTRequestSectionProps) {
  const [status, setStatus] = useState<'pendiente' | 'enviado' | 'aprobado'>('pendiente');
  const [comentarios, setComentarios] = useState('');
  const [sending, setSending] = useState(false);
  const [insuranceProgress, setInsuranceProgress] = useState<StoredInsuranceData | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(`vt-request-${solicitudId}`);
    if (stored) {
      const data = JSON.parse(stored);
      setStatus(data.status);
      setComentarios(data.comentarios || '');
    }
  }, [solicitudId]);

  useEffect(() => {
    const stored = localStorage.getItem(`insurance-data-${solicitudId}`);
    if (stored) {
      try {
        setInsuranceProgress(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading insurance status', error);
      }
    }
  }, [solicitudId]);

  const readyForVT = !insuranceProgress || insuranceProgress.status === 'aprobado';

  const handleSendRequest = () => {
    setSending(true);
    setTimeout(() => {
      setStatus('enviado');
      setSending(false);

      // Obtener todos los datos necesarios del localStorage
      const patientDataStr = localStorage.getItem(`patient-data-${solicitudId}`);
      const cotizacionDataStr = localStorage.getItem(`cotizacion-${solicitudId}`);
      const filesDataStr = localStorage.getItem(`files-${solicitudId}`);
      const serviceDataStr = localStorage.getItem(`service-data-${solicitudId}`);

      const patientData = patientDataStr ? JSON.parse(patientDataStr) : {};
      const cotizacion = cotizacionDataStr ? JSON.parse(cotizacionDataStr) : {};
      const filesData = filesDataStr ? JSON.parse(filesDataStr) : {};
      const serviceSnapshot: SolicitudServiceData | null = serviceData ?? (serviceDataStr ? JSON.parse(serviceDataStr) : null);

      // Construir nombre completo del paciente
      const nombreCompleto = patientData.firstName && patientData.lastName
        ? `${patientData.firstName} ${patientData.lastName}`
        : solicitud.patient;

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
      const metodoPago = serviceSnapshot?.metodoPago ?? cotizacion.metodoPago ?? 'aseguradora';
      const aseguradoraNombre = metodoPago === 'aseguradora'
        ? serviceSnapshot?.aseguradoraNombre || cotizacion.aseguradoraNombre || 'Aseguradora por definir'
        : 'Pago directo (Bolsillo)';
      const fallbackMonto = (serviceSnapshot?.precioUnitario ?? 0) * (serviceSnapshot?.cantidad ?? 1);
      const cotizacionMonto = Number(cotizacion.monto ?? 0);
      const montoFinal = cotizacionMonto > 0 ? cotizacionMonto : fallbackMonto;
      if (montoFinal <= 0) {
        alert('⚠️ Advertencia: No se ha establecido un precio para el estudio. Por favor, completa la información en la sección "Gestión de Aseguradora".');
      }
      const servicioNombreFinal = serviceSnapshot?.servicioNombre || cotizacion.servicioNombre || solicitud.testType;
      const servicioIdFinal = serviceSnapshot?.servicioId || cotizacion.servicioId;
      const servicioCantidadFinal = serviceSnapshot?.cantidad || cotizacion.cantidad || 1;
      const laboratorioFinal = serviceSnapshot?.laboratorio || cotizacion.laboratorio || 'Tempus Labs, Inc';
      const aseguradoraIdFinal = serviceSnapshot?.aseguradoraId || cotizacion.aseguradoraId || solicitud.aseguradoraId;
      const aseguradoraRfcFinal = serviceSnapshot?.aseguradoraRfc || cotizacion.aseguradoraRfc;
      const catalogInfo =
        (servicioIdFinal && SERVICIOS_CATALOG.find((producto) => producto.id === servicioIdFinal)) ||
        (servicioNombreFinal ? getServicioByName(servicioNombreFinal) : undefined);
      const costoProducto = catalogInfo?.costo ?? fallbackMonto;

      const adminSolicitud = {
        id: vtId, // Usar el nuevo ID VT
        solicitudId: solicitudId, // Mantener referencia a la solicitud original
        solicitudOrigenId: solicitud.id, // ID de la solicitud de ventas
        paciente: nombreCompleto,
        servicio: servicioNombreFinal,
        servicioId: servicioIdFinal,
        servicioCantidad: servicioCantidadFinal,
        laboratorio: laboratorioFinal,
        monto: montoFinal,
        costoCompra: costoProducto,
        aseguradora: aseguradoraNombre,
        aseguradoraId: aseguradoraIdFinal,
        metodoPago,
        rfcAseguradora: aseguradoraRfcFinal,
        fechaSolicitud: new Date().toISOString(),

        // Estados del workflow
        statusAprobacion: 'pendiente' as const,
        statusCompra: 'pendiente' as const,
        statusLogistica: 'pendiente' as const,
        statusResultados: 'pendiente' as const,
        statusFacturacion: 'pendiente' as const,
        statusCobranza: 'pendiente' as const,

        // Información adicional
        pagosLaboratorio: [],
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
        // Snapshot para sincronizar datos del paciente
        patientData,
      };

      // Guardar con el nuevo ID VT
      localStorage.setItem(`admin-solicitud-${vtId}`, JSON.stringify(adminSolicitud));

      console.log('✅ Solicitud VT enviada a administración:', adminSolicitud);
      console.log('📋 ID VT generado:', vtId);
      console.log('🔗 Solicitud origen:', solicitudId);

      alert(`✅ Solicitud VT enviada a administración correctamente\n\n📋 ID VT: ${vtId}\n💰 Monto: $${montoFinal.toLocaleString('es-MX')}\n👤 Paciente: ${nombreCompleto}`);
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

      {insuranceProgress && (
        <div className="border border-[#E4D4C8] rounded-xl bg-white p-4 text-sm text-[#2C2C2C]">
          <p>
            Estado con aseguradora: <strong className="uppercase">{insuranceProgress.status}</strong>
          </p>
          {insuranceProgress.lastSentAt && (
            <p className="text-xs text-[#666]">Último envío: {new Date(insuranceProgress.lastSentAt).toLocaleString('es-MX')}</p>
          )}
          {!readyForVT && (
            <p className="text-xs text-red-600 mt-1">
              Necesitas marcar la respuesta de la aseguradora como aprobada antes de generar la solicitud VT.
            </p>
          )}
        </div>
      )}

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
                disabled={sending || !readyForVT}
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
