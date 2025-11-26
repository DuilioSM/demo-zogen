'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { generateInvoicePDF } from '@/components/FacturaPDF';
import {
  FacturacionCobranzaTabs,
  FormContainer,
  FormField,
  FormActions,
  StatusMessage
} from '@/components/FacturacionCobranzaTabs';

type Status = 'PendienteFacturar' | 'Facturado' | 'Cobrado';

export default function FacturacionCobranzaPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = () => {
    setLoading(true);
    const allSolicitudes: AdminSolicitud[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('admin-solicitud-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const solicitud = JSON.parse(data) as AdminSolicitud;
            if (solicitud.statusAprobacion === 'aprobado') {
              allSolicitudes.push(solicitud);
            }
          } catch (e) {
            console.error('Error parsing solicitud:', e);
          }
        }
      }
    }
    setSolicitudes(allSolicitudes.sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()));
    setLoading(false);
  };

  const updateSolicitud = (solicitudId: string, updatedData: Partial<AdminSolicitud>) => {
    const updatedSolicitudes = solicitudes.map(s => {
      if (s.id === solicitudId) {
        const newSolicitud = { ...s, ...updatedData };
        localStorage.setItem(`admin-solicitud-${solicitudId}`, JSON.stringify(newSolicitud));
        return newSolicitud;
      }
      return s;
    });
    setSolicitudes(updatedSolicitudes);
  };

  const getStatus = (s: AdminSolicitud): Status => {
    if (s.statusCobranza === 'pagado') return 'Cobrado';
    if (s.statusFacturacion === 'timbrado' || s.statusFacturacion === 'facturado') return 'Facturado';
    return 'PendienteFacturar';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
        <div className="text-center py-10">
          <p className="text-gray-500">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Facturación y Cobranza</h1>
          <p className="text-gray-600 mt-2">
            Seguimiento de facturación, timbrado y pagos de servicios asegurados.
          </p>
        </div>

        <FacturacionCobranzaTabs
          items={solicitudes}
          getStatus={getStatus}
          onUpdate={updateSolicitud}
          renderItemHeader={(solicitud) => (
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-lg">{solicitud.paciente}</p>
                <p className="text-sm text-gray-600">{solicitud.servicio} - {solicitud.aseguradora}</p>
                <p className="text-xs text-gray-500">ID: {solicitud.id}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">${solicitud.monto.toLocaleString('es-MX')}</p>
                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                  {solicitud.statusFacturacion}
                </span>
              </div>
            </div>
          )}
          renderItemDetails={(solicitud) => {
            if (getStatus(solicitud) === 'Cobrado') {
              return (
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  <p>Factura: <span className="font-medium">{solicitud.numeroFactura}</span></p>
                  <p>Fecha de Pago: <span className="font-medium">{solicitud.fechaPago ? new Date(solicitud.fechaPago).toLocaleDateString('es-MX') : 'N/A'}</span></p>
                </div>
              );
            }
            return null;
          }}
          renderFacturacionForm={(solicitud, onUpdate, onCancel) => (
            <FacturacionForm solicitud={solicitud} onUpdate={onUpdate} onCancel={onCancel} />
          )}
          renderCobranzaForm={(solicitud, onUpdate, onCancel) => (
            <CobranzaForm solicitud={solicitud} onUpdate={onUpdate} onCancel={onCancel} />
          )}
        />
      </div>
    </div>
  );
}

// Formularios específicos para Zogen Labs
function FacturacionForm({
  solicitud,
  onUpdate,
  onCancel
}: {
  solicitud: AdminSolicitud;
  onUpdate: (updates: Partial<AdminSolicitud>) => void;
  onCancel: () => void;
}) {
  const [montoFactura, setMontoFactura] = useState(solicitud.monto.toString());
  const [numeroFactura, setNumeroFactura] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroFactura.trim()) {
      alert('Por favor ingresa el número de factura.');
      return;
    }

    setIsGeneratingPdf(true);
    setTimeout(() => {
      const solicitudConMonto = {
        ...solicitud,
        monto: parseFloat(montoFactura),
        montoFactura: parseFloat(montoFactura),
      };

      generateInvoicePDF(solicitudConMonto);

      // Generar folio SAT automáticamente
      const folioSat = `SAT-${Math.floor(Math.random() * 1_000_000)}`;

      onUpdate({
        statusFacturacion: 'timbrado',
        montoFactura: parseFloat(montoFactura),
        fechaFactura: new Date().toISOString(),
        numeroFactura,
        uuidFactura: folioSat,
      });
      setIsGeneratingPdf(false);
      onCancel();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Generar y Timbrar Factura">
        <FormField label="Número de Factura / Folio *" id={`numero-${solicitud.id}`}>
          <Input
            id={`numero-${solicitud.id}`}
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
            placeholder="Ej: FAC-2024-001"
            disabled={isGeneratingPdf}
            required
          />
        </FormField>

        <FormField label="Monto de Factura" id={`monto-${solicitud.id}`}>
          <Input
            id={`monto-${solicitud.id}`}
            type="number"
            value={montoFactura}
            onChange={(e) => setMontoFactura(e.target.value)}
            placeholder="Monto"
            disabled={isGeneratingPdf}
          />
        </FormField>

        {isGeneratingPdf && (
          <StatusMessage
            type="info"
            message="Generando y timbrando factura... Se generará el PDF automáticamente."
          />
        )}

        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Generar Factura"
          isLoading={isGeneratingPdf}
          loadingLabel="Generando..."
        />
      </FormContainer>
    </form>
  );
}

function CobranzaForm({
  solicitud,
  onUpdate,
  onCancel
}: {
  solicitud: AdminSolicitud;
  onUpdate: (updates: Partial<AdminSolicitud>) => void;
  onCancel: () => void;
}) {
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [referenciaPago, setReferenciaPago] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaPago) {
      alert('Por favor completa la fecha de pago.');
      return;
    }
    onUpdate({ statusCobranza: 'pagado', fechaPago, referenciaPago });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Registrar Pago">
        <FormField label="Referencia de Pago" id={`referencia-${solicitud.id}`}>
          <Input
            id={`referencia-${solicitud.id}`}
            value={referenciaPago}
            onChange={(e) => setReferenciaPago(e.target.value)}
            placeholder="ID de transacción, etc."
          />
        </FormField>

        <FormField label="Fecha de Pago" id={`fecha-${solicitud.id}`}>
          <Input
            id={`fecha-${solicitud.id}`}
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
          />
        </FormField>

        <FormActions
          onSubmit={handleSubmit}
          onCancel={onCancel}
          submitLabel="Marcar como Pagado"
        />
      </FormContainer>
    </form>
  );
}
