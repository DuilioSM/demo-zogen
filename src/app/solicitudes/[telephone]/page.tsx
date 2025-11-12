"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CalendarClock,
  List,
  Loader2,
  Pencil,
  Phone,
  Plus,
  Stethoscope,
  Trash2,
  Undo2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useSolicitudes } from "@/hooks/useSolicitudes";

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

const sanitizePhone = (value: string) => value.replace(/[^\d]/g, "");

const SOLICITUDES_ACTIONS = [
  { label: "Listar", icon: List },
  { label: "Agregar", icon: Plus },
  { label: "Editar", icon: Pencil },
  { label: "Borrar", icon: Trash2 },
];

export default function SolicitudDetailPage() {
  const params = useParams();
  const telephoneParam = params.telephone as string;
  const { solicitudes, status, errorMessage, fetchSolicitudes } = useSolicitudes();

  const solicitud = useMemo(() => {
    return solicitudes.find((item) => {
      const contact = sanitizePhone(item.contactPhone);
      const vendor = sanitizePhone(item.vendorPhone);
      return contact === telephoneParam || vendor === telephoneParam || item.id === telephoneParam;
    });
  }, [solicitudes, telephoneParam]);

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
        <Link href="/solicitudes">
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
          <Link href="/solicitudes" className="inline-flex items-center text-sm text-[#8A6BA7] hover:underline">
            <Undo2 className="mr-2 h-4 w-4" />
            Volver al listado
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
              <SectionHeader title="Datos Generales" />
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoItem label="Médico" value={solicitud.doctor} icon={Stethoscope} />
                <InfoItem label="Creado en" value={formatDate(solicitud.createdAt)} icon={CalendarClock} />
                <InfoItem label="Teléfono vendedor" value={formatPhone(solicitud.vendorPhone)} icon={Phone} />
              </div>
            </section>

            <section>
              <SectionHeader title="Datos del Paciente" />
              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
                <InfoItem label="Nombre" value={solicitud.patient} />
                <InfoItem label="Padecimiento" value={solicitud.condition} />
                <InfoItem label="Teléfono" value={formatPhone(solicitud.contactPhone)} icon={Phone} />
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
