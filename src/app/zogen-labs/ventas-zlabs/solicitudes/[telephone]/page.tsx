"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  List,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  Trash2,
  Undo2,
  ArrowRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSolicitudes } from "@/hooks/useSolicitudes";
import { usePatients } from "@/hooks/usePatients";
import { usePaymentMethods } from "@/hooks/usePaymentMethods";
import { useMedicalPrescriptions } from "@/hooks/useMedicalPrescriptions";
import type { SolicitudServiceData } from "@/types/solicitudes";

const formatDate = (value: string | null) => {
  if (!value) {
    return "Sin fecha";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Sin fecha";
  }

  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(date);
};

const formatPhone = (value: string) => {
  if (!value || value === "Sin teléfono" || value === "Sin vendedor") {
    return value;
  }

  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};

const sanitizePhone = (value?: string) => (value ? value.replace(/[^\d]/g, "") : "");

const SOLICITUDES_ACTIONS = [
  { label: "Listar", icon: List },
  { label: "Agregar", icon: Plus },
  { label: "Editar", icon: Pencil },
  { label: "Borrar", icon: Trash2 },
];

export default function SolicitudDetailPage() {
  const params = useParams();
  const telephoneParam = params.telephone as string;
  const normalizedParam = sanitizePhone(telephoneParam);
  const { solicitudes, status, errorMessage, fetchSolicitudes } = useSolicitudes();
  const { patients } = usePatients();
  const { methods } = usePaymentMethods();
  const { prescriptions } = useMedicalPrescriptions();
  const [serviceData, setServiceData] = useState<SolicitudServiceData | null>(null);

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

  const fallbackPatient = useMemo(() => {
    if (!solicitud?.patientData) return null;
    const data = solicitud.patientData;
    return {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      gender: data.gender,
      curp: data.curp,
      birthDate: data.birthDate,
      country: data.country,
      state: data.state,
      municipality: data.municipality,
      neighborhood: data.neighborhood,
      postalCode: data.postalCode,
      address: data.address,
    };
  }, [solicitud?.patientData]);

  const patientToShow = patient || fallbackPatient;

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
    try {
      const stored = window.localStorage.getItem(`service-data-${solicitud.id}`);
      if (stored) {
        setServiceData(JSON.parse(stored));
      } else {
        setServiceData(null);
      }
    } catch (error) {
      console.error("Error reading service data", error);
      setServiceData(null);
    }
  }, [solicitud]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-[#F7F4F1] to-white text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#9B7CB8]" />
        <p className="mt-4 text-sm text-muted-foreground">Cargando solicitud…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gradient-to-br from-[#F7F4F1] to-white text-center">
        <p className="text-lg font-medium text-red-600">{errorMessage}</p>
        <Button onClick={fetchSolicitudes} className="bg-[#9B7CB8] text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gradient-to-br from-[#F7F4F1] to-white text-center">
        <p className="text-lg font-semibold text-[#3A2D28]">
          No encontramos una solicitud con este teléfono.
        </p>
        <Link href="/zogen-labs/ventas-zlabs/solicitudes">
          <Button className="bg-[#8A5A44] text-white">
            <Undo2 className="mr-2 h-4 w-4" /> Volver al listado
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F7F4F1] to-white">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-[#B26E3C]">Ver solicitud</p>
            <h1 className="text-3xl font-semibold text-[#3A2D28]">Detalle del servicio</h1>
            <p className="text-sm text-muted-foreground">
              Información completa del paciente y del médico solicitante.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
            {SOLICITUDES_ACTIONS.map(({ label, icon: Icon }) => (
              <Button key={label} variant="outline" className="border-[#E4D4C8] text-[#3A2D28]">
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-6">
          <Link href="/zogen-labs/ventas-zlabs/solicitudes">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Solicitudes
            </Button>
          </Link>
        </div>
        <Card className="border-[#E4D4C8] shadow-sm">
          <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-wide text-[#B26E3C]">Solicitud</p>
              <CardTitle className="text-2xl text-[#3A2D28]">{solicitud.patient}</CardTitle>
              <p className="text-sm text-muted-foreground">Médico responsable: {solicitud.doctor}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge className="bg-[#F5ECE2] text-[#8A5A44] border border-[#E4D4C8]">
                {solicitud.testType}
              </Badge>
              <Badge variant="outline" className="text-[#8A6BA7] border-[#C8B6E2]">
                Pedido: Nuevo
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <SectionHeader title="Solicitud del pedido" />
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoItem label="Paciente" value={solicitud.patient} />
                <InfoItem label="Tipo de prueba" value={solicitud.testType} />
                <InfoItem label="Padecimiento" value={solicitud.condition} />
                <InfoItem label="Médico" value={solicitud.doctor} icon={Stethoscope} />
                <InfoItem label="Fecha de solicitud" value={formatDate(solicitud.createdAt)} icon={CalendarClock} />
                <InfoItem label="Teléfono vendedor" value={formatPhone(solicitud.vendorPhone)} icon={Phone} />
              </div>
            </section>

            {patientToShow ? (
              <section>
                <SectionHeader title="Datos del paciente" />
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InfoItem label="Nombre(s)" value={patientToShow.firstName || ''} />
                  <InfoItem label="Apellidos" value={patientToShow.lastName || ''} />
                  <InfoItem label="Teléfono" value={patientToShow.phone ? formatPhone(patientToShow.phone) : ''} icon={Phone} />
                  <InfoItem label="Género" value={patientToShow.gender || ''} />
                  <InfoItem label="CURP" value={patientToShow.curp || ''} />
                  <InfoItem label="Fecha de nacimiento" value={patientToShow.birthDate || ''} />
                  <InfoItem label="País" value={patientToShow.country || ''} />
                  <InfoItem label="Estado" value={patientToShow.state || ''} />
                  <InfoItem label="Municipio" value={patientToShow.municipality || ''} />
                  <InfoItem label="Colonia" value={patientToShow.neighborhood || ''} />
                  <InfoItem label="Código postal" value={patientToShow.postalCode || ''} />
                  <InfoItem label="Domicilio" value={patientToShow.address || ''} />
                </div>
              </section>
            ) : null}

            <section>
              <SectionHeader title="Datos del servicio" />
              {serviceData ? (
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InfoItem label="Servicio" value={serviceData.servicioNombre || solicitud.testType} />
                  <InfoItem label="Laboratorio" value={serviceData.laboratorio || "Por definir"} />
                  <InfoItem label="Método de pago" value={serviceData.metodoPago === 'bolsillo' ? 'Pago directo (Bolsillo)' : 'Cobro a aseguradora'} />
                  <InfoItem
                    label="Aseguradora"
                    value={serviceData.metodoPago === 'aseguradora' ? serviceData.aseguradoraNombre || 'Por definir' : 'No aplica'}
                  />
                  <InfoItem label="Cantidad" value={`${serviceData.cantidad} estudio(s)`} />
                  <InfoItem label="Total estimado" value="Dato reservado" />
                </div>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No hay información del servicio guardada todavía. Actualiza la solicitud para definir método de pago y
                  aseguradora.
                </p>
              )}
            </section>

            {paymentMethod ? (
              <section>
                <SectionHeader title="Gestión de aseguradora" />
                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                  <InfoItem label="Método de pago" value={paymentMethod.method} />
                  <InfoItem label="Aseguradora" value={paymentMethod.insurerName} />
                  <InfoItem label="Documento" value={paymentMethod.document} />
                </div>
                {paymentMethod.documentUrl ? (
                  <div className="mt-4">
                    <Link
                      href={paymentMethod.documentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm font-medium text-[#8A6BA7] hover:underline"
                    >
                      Ver soporte
                    </Link>
                  </div>
                ) : null}
              </section>
            ) : null}

            {prescription ? (
              <section>
                <SectionHeader title="Receta médica" />
                <div className="mt-4 grid grid-cols-1 gap-4">
                  <InfoItem label="Diagnóstico / indicaciones" value={prescription.diagnosis} />
                  <InfoItem label="Fecha de emisión" value={prescription.issuedAt} />
                  {prescription.prescriptionUrl ? (
                    <Link
                      href={prescription.prescriptionUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center text-sm font-medium text-[#8A6BA7] hover:underline"
                    >
                      Ver receta
                    </Link>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Call to action para gestionar solicitud */}
            <section className="mt-8 bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-[#3A2D28] mb-1">
                    Gestionar Flujo de Trabajo
                  </h3>
                  <p className="text-sm text-[#666]">
                    Completa los pasos del proceso: datos del paciente, carga de archivos, cotizaciones, y más.
                  </p>
                </div>
                <Link href={`/zogen-labs/ventas-zlabs/solicitudes/editar/${solicitud.id || normalizedParam}`}>
                  <Button size="lg" className="bg-[#9B7CB8] hover:bg-[#8A6BA7] text-white">
                    Ir a Gestión
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

type InfoItemProps = {
  label: string;
  value: string;
  icon?: LucideIcon;
};

function InfoItem({ label, value, icon: Icon }: InfoItemProps) {
  return (
    <div className="rounded-xl border border-[#F0E3D9] bg-[#FFFBF7] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#B26E3C]">{label}</p>
      <div className="mt-1 flex items-center gap-2 text-sm font-medium text-[#3A2D28]">
        {Icon ? <Icon className="h-4 w-4 text-[#B26E3C]" /> : null}
        <span>{value}</span>
      </div>
    </div>
  );
}

type SectionHeaderProps = {
  title: string;
};

function SectionHeader({ title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="hidden flex-1 bg-[#E4D4C8] md:block" />
      <p className="text-sm font-semibold uppercase tracking-wide text-[#B26E3C]">{title}</p>
      <Separator className="flex-1 bg-[#E4D4C8]" />
    </div>
  );
}
