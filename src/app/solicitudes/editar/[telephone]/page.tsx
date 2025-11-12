"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Eye, Undo2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
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

const STEPS = [
  { id: "order", label: "Solicitud del pedido" },
  { id: "patient", label: "Datos del paciente" },
  { id: "insurance", label: "Gestión de aseguradora" },
  { id: "prescription", label: "Receta médica" },
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
          <Link href="/solicitudes">
            <Button className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
              <Undo2 className="mr-2 h-4 w-4" /> Regresar
            </Button>
          </Link>
          <Link href={`/solicitudes/${telephoneParam}`}>
            <Button variant="outline" className="border-[#7B5C45] text-[#7B5C45]">
              Ver detalle
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const viewHref = `/solicitudes/${normalizedParam}`;

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2C2C2C]">
      <header className="bg-white py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-semibold text-[#3C4858]">Actualizar prueba</h1>
            </div>
            <div className="flex gap-3">
              <Link href="/solicitudes">
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

            {patientStatus === "ready" && !patient && (
              <div className="py-10 text-center text-sm text-[#666]">
                No encontramos información del paciente para este número.
              </div>
            )}

            {patientStatus === "ready" && patient && (
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Nombre(s)">
                  <ReadOnlyField value={patient.firstName} />
                </Field>
                <Field label="Apellidos">
                  <ReadOnlyField value={patient.lastName} />
                </Field>
                <Field label="Teléfono">
                  <ReadOnlyField value={formatPhone(patient.phone)} />
                </Field>
                <Field label="Género biológico">
                  <ReadOnlyField value={patient.gender} />
                </Field>
                <Field label="CURP">
                  <ReadOnlyField value={patient.curp} />
                </Field>
                <Field label="Fecha de nacimiento">
                  <ReadOnlyField value={patient.birthDate} />
                </Field>
                <Field label="País">
                  <ReadOnlyField value={patient.country} />
                </Field>
                <Field label="Estado">
                  <ReadOnlyField value={patient.state} />
                </Field>
                <Field label="Municipio / Delegación">
                  <ReadOnlyField value={patient.municipality} />
                </Field>
                <Field label="Colonia">
                  <ReadOnlyField value={patient.neighborhood} />
                </Field>
                <Field label="Código postal">
                  <ReadOnlyField value={patient.postalCode} />
                </Field>
                <Field label="Domicilio completo" >
                  <ReadOnlyField value={patient.address} multiLine />
                </Field>
                {patient.ineUrl ? (
                  <Field label="Identificación (INE)">
                    <a
                      href={patient.ineUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-[#8A6BA7] hover:underline"
                    >
                      Ver documento
                    </a>
                  </Field>
                ) : null}
              </div>
            )}
        </div>
      );
    case "insurance":
      return (
        <div className="space-y-6">
            {paymentStatus === "loading" && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#7B5C45]" />
                <p className="text-sm text-[#666]">Cargando método de pago…</p>
              </div>
            )}

            {paymentStatus === "error" && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="text-sm font-medium text-red-600">{paymentError}</p>
                <Button onClick={retryPayment} className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
                  Reintentar
                </Button>
              </div>
            )}

            {paymentStatus === "ready" && !paymentMethod && (
              <div className="py-10 text-center text-sm text-[#666]">
                No registramos información de aseguradora para este número.
              </div>
            )}

            {paymentStatus === "ready" && paymentMethod && (
              <div className="grid gap-6 md:grid-cols-2">
                <Field label="Método de pago">
                  <ReadOnlyField value={paymentMethod.method} />
                </Field>
                <Field label="Nombre de la aseguradora">
                  <ReadOnlyField value={paymentMethod.insurerName} />
                </Field>
                <Field label="Documento entregado">
                  <ReadOnlyField value={paymentMethod.document} />
                </Field>
                <Field label="Soporte">
                  {paymentMethod.documentUrl ? (
                    <a
                      href={paymentMethod.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-[#8A6BA7] hover:underline"
                    >
                      Descargar documento
                    </a>
                  ) : (
                    <ReadOnlyField value="Sin archivo" />
                  )}
                </Field>
              </div>
            )}
        </div>
      );
    case "prescription":
      return (
        <div className="space-y-6">
            {prescriptionStatus === "loading" && (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#7B5C45]" />
                <p className="text-sm text-[#666]">Cargando receta…</p>
              </div>
            )}

            {prescriptionStatus === "error" && (
              <div className="flex flex-col items-center gap-4 py-10 text-center">
                <p className="text-sm font-medium text-red-600">{prescriptionError}</p>
                <Button onClick={retryPrescription} className="bg-[#7B5C45] text-white hover:bg-[#6A4D38]">
                  Reintentar
                </Button>
              </div>
            )}

            {prescriptionStatus === "ready" && !prescription && (
              <div className="py-10 text-center text-sm text-[#666]">
                No hay receta registrada para este número.
              </div>
            )}

            {prescriptionStatus === "ready" && prescription && (
              <div className="space-y-6">
                <Field label="Diagnóstico / Indicaciones">
                  <ReadOnlyField value={prescription.diagnosis} multiLine />
                </Field>
                <Field label="Fecha de emisión">
                  <ReadOnlyField value={prescription.issuedAt} />
                </Field>
                <Field label="Documento">
                  {prescription.prescriptionUrl ? (
                    <a
                      href={prescription.prescriptionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-[#7B5C45] hover:underline"
                    >
                      Ver receta
                    </a>
                  ) : (
                    <ReadOnlyField value="Sin archivo" />
                  )}
                </Field>
              </div>
            )}
        </div>
      );
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
