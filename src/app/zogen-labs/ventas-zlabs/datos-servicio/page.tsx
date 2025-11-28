'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';
import { useState, useEffect } from 'react';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { SolicitudServiceData } from '@/types/solicitudes';
import { SERVICIOS_CATALOG, getServicioByName } from '@/types/servicio';
import { ASEGURADORAS_CATALOG } from '@/types/aseguradora';
import { LABORATORIOS_CATALOG } from '@/types/laboratorio';
import { StepActions } from '@/components/solicitudes/StepActions';
import { cn } from '@/lib/utils';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
    </div>
  );
}

export default function DatosServicioPage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';
  const { solicitudes, status: solicitudesStatus } = useSolicitudes();
  const [serviceData, setServiceData] = useState<SolicitudServiceData | null>(null);
  const [savingService, setSavingService] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const solicitud = solicitudes.find((s) => s.id === solicitudId);

  useEffect(() => {
    if (!solicitud) {
      setServiceData(null);
      return;
    }

    if (typeof window === 'undefined') return;

    const storageKey = `service-data-${solicitud.id}`;
    try {
      const stored = window.localStorage.getItem(storageKey);
      if (stored) {
        setServiceData(JSON.parse(stored));
        return;
      }
    } catch (error) {
      console.error('Error loading service data', error);
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
      servicioId: servicio?.id || '',
      servicioNombre: servicio?.nombre || solicitud.testType,
      laboratorio: servicio?.laboratorio,
      precioUnitario: servicio?.precio,
      tiempoEntrega: servicio?.tiempoEntrega,
      cantidad: solicitud.servicioCantidad ?? 1,
      metodoPago: solicitud.metodoPago ?? (aseguradoraFromSolicitud ? 'aseguradora' : 'bolsillo'),
      aseguradoraId: solicitud.aseguradoraId ?? aseguradoraFromSolicitud?.id,
      aseguradoraNombre: solicitud.aseguradoraNombre ?? aseguradoraFromSolicitud?.nombre,
      aseguradoraRfc: solicitud.aseguradoraRFC ?? aseguradoraFromSolicitud?.rfc,
      notas: '',
    };

    setServiceData(initial);
  }, [solicitud]);

  const updateData = (updates: Partial<SolicitudServiceData>) => {
    if (!serviceData) return;
    setServiceData({ ...serviceData, ...updates });
  };

  const handleServicioChange = (value: string) => {
    if (!serviceData) return;
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
    const metodo = value === 'aseguradora' ? 'aseguradora' : 'bolsillo';
    updateData({
      metodoPago: metodo,
      ...(metodo === 'bolsillo'
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
    if (typeof window === 'undefined' || !serviceData) return;
    setSavingService(true);
    window.localStorage.setItem(`service-data-${solicitudId}`, JSON.stringify(serviceData));
    setTimeout(() => {
      setSavingService(false);
      setIsEditing(false);
      alert('Datos del servicio guardados');
    }, 300);
  };

  if (!solicitud) {
    if (solicitudesStatus === 'loading') {
      return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Cargando solicitud...</div>;
    }
    return <div className="flex min-h-[60vh] items-center justify-center text-gray-500">Solicitud no encontrada.</div>;
  }

  if (!serviceData) {
    return (
      <SolicitudEditor solicitudId={solicitudId} currentStep="datos-servicio">
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#7B5C45]" />
          <p className="text-sm text-gray-600">Preparando datos del servicio…</p>
        </div>
      </SolicitudEditor>
    );
  }

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="datos-servicio">
      <div className="space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
              Datos del Servicio
            </h2>
            <p className="text-sm text-gray-600">
              Configuración del servicio solicitado
            </p>
          </div>
          <StepActions
            isEditing={isEditing}
            onToggleEdit={() => setIsEditing((prev) => !prev)}
            onSave={handleSaveServiceData}
            saveDisabled={!serviceData}
            saving={savingService}
            className="justify-end"
          />
        </div>

        <fieldset disabled={!isEditing} className={cn('space-y-6', !isEditing && 'opacity-80')}>
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
              disabled={serviceData.metodoPago !== 'aseguradora'}
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
            {serviceData.metodoPago === 'aseguradora' && !serviceData.aseguradoraId && (
              <p className="mt-1 text-xs text-red-600">Selecciona una aseguradora para continuar.</p>
            )}
          </Field>
        </div>

          <Field label="Notas adicionales">
            <Textarea
              value={serviceData.notas || ''}
              onChange={(event) => updateData({ notas: event.target.value })}
              placeholder="Ej. Agregar interpretación clínica urgente, confirmar cobertura antes de facturar…"
              className="min-h-[140px] border-[#D5D0C8]"
            />
          </Field>
        </fieldset>

        <p className="text-xs text-gray-500 text-right">Los cambios se almacenan de forma local para continuar con el expediente.</p>
      </div>
    </SolicitudEditor>
  );
}
