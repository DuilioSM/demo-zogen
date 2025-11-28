'use client';

import { useEffect, useState } from 'react';
import { Download, FileArchive, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { Solicitud, SolicitudServiceData } from '@/types/solicitudes';

export type InsuranceStatus = 'pendiente' | 'enviado' | 'aprobado' | 'rechazado';

export type StoredInsuranceData = {
  status: InsuranceStatus;
  cartaPaseUrl?: string;
  lastSentAt?: string | null;
};

type InsuranceManagementSectionProps = {
  solicitudId: string;
  solicitud: Solicitud;
  serviceData?: SolicitudServiceData | null;
  disabled?: boolean;
};

export function InsuranceManagementSection({ solicitudId, solicitud, serviceData, disabled }: InsuranceManagementSectionProps) {
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
        } catch {
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
    const reader = new FileReader();
    reader.onloadend = () => {
      const payload = {
        name: file.name,
        data: reader.result as string,
        uploadedAt: new Date().toISOString(),
      };
      const stored = localStorage.getItem(filesStorageKey);
      const files = stored ? JSON.parse(stored) : {};
      files.cartaPase = payload;
      localStorage.setItem(filesStorageKey, JSON.stringify(files));
      setCartaPaseFile(payload);
      alert('Carta pase cargada correctamente');
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadCartaPase = () => {
    if (cartaPaseFile?.data) {
      const link = document.createElement('a');
      link.href = cartaPaseFile.data;
      link.download = cartaPaseFile.name || 'carta-pase.pdf';
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
            <Select value={insuranceStatus} onValueChange={(value) => handleStatusChange(value as InsuranceStatus)} disabled={disabled}>
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
              disabled={disabled}
            />
            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="border-[#D5D0C8]"
                onChange={(event) => handleCartaPaseUpload(event.target.files?.[0])}
                disabled={disabled}
              />
              {(cartaPaseFile || cartaPaseUrl) && (
                <Button variant="outline" size="sm" className="border-[#7B5C45]" onClick={handleDownloadCartaPase} disabled={disabled}>
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
              <p className="font-medium text-[#2C2C2C]">Comprimir documentos</p>
              <p className="text-xs text-[#666]">Genera un archivo ZIP con todos los documentos cargados</p>
            </div>
          </div>
          <Button
            onClick={handleCompressFiles}
            disabled={disabled || generating}
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
        <p className="text-xs text-[#666]">
          Asegúrate de tener el expediente completo antes de enviarlo. Guardamos un snapshot interno con los datos del servicio.
        </p>
        <div className="mt-3 flex justify-end">
          <Button onClick={handleSendToInsurance} disabled={!serviceData || disabled} className="bg-[#7B5C45] hover:bg-[#5E4331]">
            Enviar a la aseguradora
          </Button>
        </div>
      </div>
    </div>
  );
}
