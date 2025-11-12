"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";
import {
  CheckCircle2,
  Loader2,
  Pencil,
  Eye,
  Undo2,
  Phone,
  CalendarClock,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useSolicitudes } from "@/hooks/useSolicitudes";

const STEP_LABELS = [
  "Solicitud del pedido",
  "Datos del paciente",
  "Gestión de aseguradora",
  "Receta médica",
];

const formatPhone = (value: string) => {
  if (!value || value === "Sin teléfono" || value === "Sin vendedor") {
    return value;
  }

  const cleaned = value.replace(/[^\d+]/g, "");
  return cleaned.startsWith("+") ? cleaned : `+${cleaned}`;
};

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

const sanitizePhone = (value: string) => value.replace(/[^\d]/g, "");

export default function EditSolicitudPage() {
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
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F7F4F1] text-center">
        <Loader2 className="h-10 w-10 animate-spin text-[#9B7CB8]" />
        <p className="mt-4 text-sm text-muted-foreground">Preparando formulario…</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#F7F4F1] text-center">
        <p className="text-lg font-medium text-red-600">{errorMessage}</p>
        <Button onClick={fetchSolicitudes} className="bg-[#9B7CB8] text-white">
          Reintentar
        </Button>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#F7F4F1] text-center">
        <p className="text-lg font-semibold text-[#3A2D28]">No encontramos esta solicitud.</p>
        <div className="flex gap-3">
          <Link href="/solicitudes">
            <Button className="bg-[#8A5A44] text-white">
              <Undo2 className="mr-2 h-4 w-4" /> Regresar
            </Button>
          </Link>
          <Link href={`/solicitudes/${telephoneParam}`}>
            <Button variant="outline" className="border-[#8A6BA7] text-[#8A6BA7]">
              Ver detalle
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const viewHref = `/solicitudes/${telephoneParam}`;

  return (
    <div className="min-h-screen bg-[#F7F4F1] text-[#2F2A25]">
      <header className="bg-white shadow-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
          <div>
            <p className="text-sm uppercase tracking-wide text-[#B26E3C]">Actualizar prueba</p>
            <h1 className="text-3xl font-semibold text-[#2F2A25]">Envío de muestra a laboratorio</h1>
            <p className="text-sm text-[#7B6B57]">Todos los campos marcados con * son obligatorios.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/solicitudes">
              <Button variant="outline" className="border-[#B26E3C] text-[#B26E3C]">
                Listar
              </Button>
            </Link>
            <Link href={viewHref}>
              <Button className="bg-[#8A5A44] text-white">
                <Eye className="mr-2 h-4 w-4" /> Ver
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 lg:flex-row">
        <aside className="sticky top-10 w-full self-start rounded-3xl border border-[#E5DBCE] bg-white p-6 shadow-sm lg:w-[30%]">
          <nav className="space-y-4">
            {STEP_LABELS.map((step) => (
              <StepIndicator key={step} label={step} />
            ))}
          </nav>
        </aside>

        <section className="flex-1 space-y-8 lg:w-[70%]">
          <Card className="border-[#E4D4C8] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#3A2D28]">Solicitud del pedido</CardTitle>
              <p className="text-sm text-muted-foreground">
                Información principal del médico solicitante y fechas clave.
              </p>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Field label="Paciente">
                <div className="rounded-xl border border-[#E4D4C8] bg-white px-4 py-3 text-sm font-semibold uppercase tracking-wide text-[#3A2D28]">
                  {solicitud.patient}
                </div>
              </Field>
              <Field label="Especialista médico *">
                <Select defaultValue={solicitud.doctor}>
                  <SelectTrigger className="border-[#E4D4C8] bg-[#F8F4EE]">
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={solicitud.doctor}>{solicitud.doctor}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Laboratorio *">
                <Input placeholder="Tempus Labs, Inc" className="border-[#E4D4C8] bg-[#F8F4EE]" />
              </Field>
              <Field label="Creado en">
                <div className="flex items-center gap-2 rounded-xl border border-[#E4D4C8] bg-white px-4 py-3 text-sm text-[#3A2D28]">
                  <CalendarClock className="h-4 w-4 text-[#B26E3C]" />
                  {formatDate(solicitud.createdAt)}
                </div>
              </Field>
              <Field label="Teléfono del solicitante">
                <div className="flex items-center gap-2 rounded-xl border border-[#E4D4C8] bg-white px-4 py-3 text-sm text-[#3A2D28]">
                  <Phone className="h-4 w-4 text-[#B26E3C]" />
                  {formatPhone(solicitud.vendorPhone)}
                </div>
              </Field>
              <Field label="Mensaje *">
                <Textarea placeholder="Agrega instrucciones o comentarios" className="border-[#E4D4C8] bg-[#F8F4EE]" rows={3} />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-[#E4D4C8] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#3A2D28]">Datos del paciente</CardTitle>
              <p className="text-sm text-muted-foreground">
                Información básica del paciente para referencia rápida.
              </p>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Field label="Nombre completo">
                <Input defaultValue={solicitud.patient} className="border-[#E4D4C8] bg-[#F8F4EE]" />
              </Field>
              <Field label="Padecimiento">
                <Input defaultValue={solicitud.condition} className="border-[#E4D4C8] bg-[#F8F4EE]" />
              </Field>
              <Field label="Teléfono de contacto">
                <Input defaultValue={formatPhone(solicitud.contactPhone)} className="border-[#E4D4C8] bg-[#F8F4EE]" />
              </Field>
              <Field label="Correo electrónico">
                <Input placeholder="correo@paciente.com" className="border-[#E4D4C8] bg-[#F8F4EE]" />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-[#E4D4C8] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#3A2D28]">Gestión de aseguradora</CardTitle>
              <p className="text-sm text-muted-foreground">
                Define quién cubrirá el servicio y sus referencias.
              </p>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <Field label="¿Quién paga el servicio?">
                <Select>
                  <SelectTrigger className="border-[#E4D4C8] bg-[#F8F4EE]">
                    <SelectValue placeholder="== Seleccione una opción ==" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aseguradora">Aseguradora</SelectItem>
                    <SelectItem value="paciente">Paciente</SelectItem>
                    <SelectItem value="empresa">Empresa</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label="Referencia de póliza">
                <Input placeholder="AXA-123456" className="border-[#E4D4C8] bg-[#F8F4EE]" />
              </Field>
              <Field label="Comentarios">
                <Textarea rows={4} placeholder="Notas internas sobre la aseguradora" className="border-[#E4D4C8] bg-[#F8F4EE]" />
              </Field>
            </CardContent>
          </Card>

          <Card className="border-[#E4D4C8] shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-[#3A2D28]">Receta médica</CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjunta la receta o indicaciones del médico tratante.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-dashed border-[#C8B6E2] bg-[#FBF8F4] p-6 text-center">
                <p className="text-sm text-[#7B6B57]">
                  Arrastra y suelta archivos aquí o <span className="font-semibold text-[#B26E3C]">haz clic para cargar</span>.
                </p>
                <p className="text-xs text-muted-foreground">Formatos permitidos: PDF, JPG, PNG. Máx 10MB.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-[#F5ECE2] text-[#8A5A44] border border-[#E4D4C8]">Receta.pdf</Badge>
                <Badge variant="outline" className="text-[#8A6BA7] border-[#C8B6E2]">
                  + Agregar otro archivo
                </Badge>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" className="border-[#B26E3C] text-[#B26E3C]">
                  Cancelar
                </Button>
                <Button className="bg-[#8A5A44] text-white">
                  <Pencil className="mr-2 h-4 w-4" /> Guardar cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#B26E3C]">{label}</p>
      {children}
    </div>
  );
}

type StepProps = {
  label: string;
  icon?: LucideIcon;
};

function StepIndicator({ label, icon: Icon = CheckCircle2 }: StepProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E4D4C8] bg-[#FFFBF7] px-4 py-3">
      <span className="text-sm font-medium text-[#3A2D28]">{label}</span>
      <Icon className="h-5 w-5 text-[#C37C4D]" />
    </div>
  );
}
