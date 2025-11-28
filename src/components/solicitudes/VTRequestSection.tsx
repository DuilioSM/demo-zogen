'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Solicitud, SolicitudServiceData } from '@/types/solicitudes';
import { getServicioByName, SERVICIOS_CATALOG } from '@/types/servicio';
import type { StoredInsuranceData } from './InsuranceManagementSection';

export type VTStatus = 'pendiente' | 'enviado' | 'aprobado';

type VTRequestSectionProps = {
  solicitudId: string;
  solicitud: Solicitud;
  serviceData: SolicitudServiceData | null;
  disabled?: boolean;
};

export function VTRequestSection({ solicitudId, solicitud, serviceData, disabled }: VTRequestSectionProps) {
  const [status, setStatus] = useState<VTStatus>('pendiente');
  const [comentarios, setComentarios] = useState('');
  const [sending, setSending] = useState(false);
  const [insuranceProgress, setInsuranceProgress] = useState<StoredInsuranceData | null>(null);
  const vtSentKey = `vt-sent-${solicitudId}`;

  useEffect(() => {
    const stored = localStorage.getItem(`vt-request-${solicitudId}`);
    if (stored) {
      const data = JSON.parse(stored);
      setStatus(data.status);
      setComentarios(data.comentarios || '');
      if (data.status === 'enviado') {
        localStorage.setItem(vtSentKey, 'true');
      }
    } else {
      const sentFlag = localStorage.getItem(vtSentKey);
      if (sentFlag === 'true') {
        setStatus('enviado');
      }
    }
  }, [solicitudId, vtSentKey]);

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

  useEffect(() => {
    if (!solicitudId || typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(`vt-request-${solicitudId}`);
      const parsed = stored ? JSON.parse(stored) : {};
      window.localStorage.setItem(
        `vt-request-${solicitudId}`,
        JSON.stringify({
          ...parsed,
          status,
          comentarios,
        })
      );
    } catch (error) {
      console.error('Error guardando borrador de VT', error);
    }
  }, [solicitudId, status, comentarios]);

  const handleSendRequest = () => {
    if (typeof window !== 'undefined') {
      const sentFlag = window.localStorage.getItem(vtSentKey);
      if (sentFlag === 'true') {
        alert('Esta solicitud ya fue enviada a administración.');
        return;
      }
    }
    setSending(true);
    setTimeout(() => {
      setStatus('enviado');
      setSending(false);

      const patientDataStr = localStorage.getItem(`patient-data-${solicitudId}`);
      const cotizacionDataStr = localStorage.getItem(`cotizacion-${solicitudId}`);
      const filesDataStr = localStorage.getItem(`files-${solicitudId}`);
      const serviceDataStr = localStorage.getItem(`service-data-${solicitudId}`);

      const patientData = patientDataStr ? JSON.parse(patientDataStr) : {};
      const cotizacion = cotizacionDataStr ? JSON.parse(cotizacionDataStr) : {};
      const filesData = filesDataStr ? JSON.parse(filesDataStr) : {};
      const serviceSnapshot: SolicitudServiceData | null = serviceData ?? (serviceDataStr ? JSON.parse(serviceDataStr) : null);

      const nombreCompleto = patientData.firstName && patientData.lastName
        ? `${patientData.firstName} ${patientData.lastName}`
        : solicitud.patient;

      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const vtId = `VT-${dateStr}-${timeStr}-${randomSuffix}`;

      localStorage.setItem(`vt-request-${solicitudId}`, JSON.stringify({
        status: 'enviado',
        comentarios,
        fecha: new Date().toISOString(),
        vtId,
      }));
      localStorage.setItem(vtSentKey, 'true');

      const metodoPago = serviceSnapshot?.metodoPago ?? cotizacion.metodoPago ?? 'aseguradora';
      const aseguradoraNombre = metodoPago === 'aseguradora'
        ? serviceSnapshot?.aseguradoraNombre || cotizacion.aseguradoraNombre || 'Aseguradora por definir'
        : 'Pago directo (Bolsillo)';
      const fallbackMonto = (serviceSnapshot?.precioUnitario ?? 0) * (serviceSnapshot?.cantidad ?? 1);
      const cotizacionMonto = Number(cotizacion.monto ?? 0);
      const montoFinal = cotizacionMonto > 0 ? cotizacionMonto : fallbackMonto;
      if (montoFinal <= 0) {
        alert('⚠️ Advertencia: No se ha establecido un precio para el estudio. Completa la información en "Gestión de Aseguradora".');
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
        id: vtId,
        solicitudId,
        solicitudOrigenId: solicitud.id,
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
        statusAprobacion: 'pendiente' as const,
        statusCompra: 'pendiente' as const,
        statusLogistica: 'pendiente' as const,
        statusResultados: 'pendiente' as const,
        statusFacturacion: 'pendiente' as const,
        statusCobranza: 'pendiente' as const,
        pagosLaboratorio: [],
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
        solicitudOriginal: {
          doctor: solicitud.doctor,
          padecimiento: solicitud.condition,
          tipoEstudio: solicitud.testType,
          telefonoContacto: solicitud.contactPhone,
          telefonoVendedor: solicitud.vendorPhone,
          fechaCreacion: solicitud.createdAt,
        },
        archivosCount: Object.keys(filesData).length,
        notas: comentarios,
        patientData,
      };

      localStorage.setItem(`admin-solicitud-${vtId}`, JSON.stringify(adminSolicitud));

      alert(`✅ Solicitud VT enviada a administración\n\n📋 ID VT: ${vtId}\n💰 Monto: $${montoFinal.toLocaleString('es-MX')}\n👤 Paciente: ${nombreCompleto}`);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <p className="text-sm text-purple-900">
          <strong>Solicitud VT:</strong> Una vez que la aseguradora aprueba y tienes la carta pase, envía la solicitud a administración para continuar el proceso.
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

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#2C2C2C]">Estado de la Solicitud VT</p>
        <div className={cn(
          'p-6 rounded-xl border-2',
          status === 'pendiente' && 'bg-gray-50 border-gray-300',
          status === 'enviado' && 'bg-blue-50 border-blue-300',
          status === 'aprobado' && 'bg-green-50 border-green-300'
        )}>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-lg text-[#2C2C2C]">
                {status === 'pendiente' && 'Pendiente de envío'}
                {status === 'enviado' && 'Enviado a administración'}
                {status === 'aprobado' && 'Aprobado por administración'}
              </p>
              <p className="text-sm text-[#666] mt-1">
                {status === 'pendiente' && 'La solicitud VT aún no ha sido enviada.'}
                {status === 'enviado' && 'Esperando respuesta de administración.'}
                {status === 'aprobado' && 'El proceso puede continuar.'}
              </p>
            </div>
            {status === 'pendiente' && (
              <Button
                onClick={handleSendRequest}
                disabled={sending || !readyForVT || disabled}
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
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-[#2C2C2C]">Notas y comentarios</label>
        <Textarea
          value={comentarios}
          onChange={(e) => setComentarios(e.target.value)}
          placeholder="Agrega comentarios o notas sobre la solicitud VT..."
          className="w-full min-h-[120px] rounded-xl border border-[#E4D4C8] bg-white px-4 py-3 text-sm text-[#3A2D28]"
          disabled={disabled}
        />
      </div>

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
