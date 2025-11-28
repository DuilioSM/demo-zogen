'use client';

import { useState, useEffect, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { generateInvoicePDF } from '@/components/FacturaPDF';
import { Filter, Search, X } from 'lucide-react';
import {
  FacturacionCobranzaTabs,
  FormContainer,
  FormField,
  FormActions,
  StatusMessage
} from '@/components/FacturacionCobranzaTabs';

const FACTURA_TYPES = [
  { value: 'PUE', label: 'PUE - Pago en una sola exhibición' },
  { value: 'PPD', label: 'PPD - Pago en parcialidades o diferido' },
];

const FORMA_PAGO_OPTIONS = [
  '01 - Efectivo',
  '02 - Cheque nominativo',
  '03 - Transferencia electrónica',
  '04 - Tarjeta de crédito',
];

const REGIMEN_OPTIONS = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
];

type Status = 'PendienteFacturar' | 'Facturado' | 'Cobrado';

export default function VentasGeneralesPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEspecialista, setFilterEspecialista] = useState('todos');
  const [filterPadecimiento, setFilterPadecimiento] = useState('todos');
  const [filterLaboratorio, setFilterLaboratorio] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);

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
            // Filtrar solo solicitudes aprobadas con método de pago bolsillo
            if (solicitud.statusAprobacion === 'aprobado' && solicitud.metodoPago === 'bolsillo') {
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

  const especialistas = useMemo(() => {
    const unique = new Set(solicitudes.map((s) => s.especialista).filter(Boolean));
    return Array.from(unique).sort();
  }, [solicitudes]);

  const padecimientos = useMemo(() => {
    const unique = new Set(solicitudes.map((s) => s.padecimiento).filter(Boolean));
    return Array.from(unique).sort();
  }, [solicitudes]);

  const laboratorios = useMemo(() => {
    const unique = new Set(solicitudes.map((s) => s.laboratorio).filter(Boolean));
    return Array.from(unique).sort();
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      const matchesSearch = !search ||
        solicitud.paciente.toLowerCase().includes(search.toLowerCase()) ||
        solicitud.servicio.toLowerCase().includes(search.toLowerCase()) ||
        solicitud.laboratorio.toLowerCase().includes(search.toLowerCase()) ||
        solicitud.id.toLowerCase().includes(search.toLowerCase());

      const matchesEspecialista = filterEspecialista === 'todos' || solicitud.especialista === filterEspecialista;
      const matchesPadecimiento = filterPadecimiento === 'todos' || solicitud.padecimiento === filterPadecimiento;
      const matchesLaboratorio = filterLaboratorio === 'todos' || solicitud.laboratorio === filterLaboratorio;

      return matchesSearch && matchesEspecialista && matchesPadecimiento && matchesLaboratorio;
    });
  }, [search, solicitudes, filterEspecialista, filterPadecimiento, filterLaboratorio]);

  const activeFiltersCount = [filterEspecialista, filterPadecimiento, filterLaboratorio].filter(f => f && f !== 'todos').length;

  const clearFilters = () => {
    setFilterEspecialista('todos');
    setFilterPadecimiento('todos');
    setFilterLaboratorio('todos');
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

  const handleDownloadFactura = (solicitud: AdminSolicitud) => {
    generateInvoicePDF({
      ...solicitud,
      monto: solicitud.montoFactura ?? solicitud.monto,
    });
  };

  const handleDownloadComplementoPago = (solicitud: AdminSolicitud) => {
    // Crear un documento simple para el complemento de pago
    const doc = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Complemento de Pago - ${solicitud.numeroFactura || solicitud.id}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin: 20px 0; }
          .label { font-weight: bold; color: #666; }
          .value { color: #000; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
          th { background-color: #f5f5f5; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #333; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Complemento de Pago</h1>
          <p>Documento que relaciona el pago con la factura emitida</p>
        </div>

        <div class="section">
          <h2>Información del Pago</h2>
          <p><span class="label">Fecha de Pago:</span> <span class="value">${solicitud.fechaPago ? new Date(solicitud.fechaPago).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span></p>
          <p><span class="label">Referencia de Pago:</span> <span class="value">${solicitud.referenciaPago || 'N/A'}</span></p>
          <p><span class="label">Forma de Pago:</span> <span class="value">${solicitud.formaPago || 'N/A'}</span></p>
        </div>

        <div class="section">
          <h2>Factura Relacionada</h2>
          <p><span class="label">Número de Factura:</span> <span class="value">${solicitud.numeroFactura || solicitud.id}</span></p>
          <p><span class="label">Fecha de Factura:</span> <span class="value">${solicitud.fechaFactura ? new Date(solicitud.fechaFactura).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A'}</span></p>
          <p><span class="label">RFC Receptor:</span> <span class="value">${solicitud.rfcAseguradora || solicitud.rfcCliente || 'N/A'}</span></p>
          <p><span class="label">Razón Social:</span> <span class="value">${solicitud.razonSocial || solicitud.aseguradora || solicitud.paciente}</span></p>
        </div>

        <div class="section">
          <h2>Detalle del Pago</h2>
          <table>
            <thead>
              <tr>
                <th>Concepto</th>
                <th>Monto</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Monto Total de la Factura</td>
                <td>$${(solicitud.montoFactura ?? solicitud.monto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td>Monto Pagado</td>
                <td>$${(Math.max(0, (solicitud.montoFactura ?? solicitud.monto) - (solicitud.saldoPosterior ?? 0))).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
              <tr>
                <td><strong>Saldo Pendiente</strong></td>
                <td><strong>$${(solicitud.saldoPosterior ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="section">
          <h2>Información del Servicio</h2>
          <p><span class="label">Paciente:</span> <span class="value">${solicitud.paciente}</span></p>
          <p><span class="label">Servicio:</span> <span class="value">${solicitud.servicio}</span></p>
          <p><span class="label">Laboratorio:</span> <span class="value">${solicitud.laboratorio}</span></p>
        </div>

        <div class="footer">
          <p>Este documento es una representación impresa del Complemento de Pago</p>
          <p>Generado el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
        </div>
      </body>
      </html>
    `;

    // Crear blob y descargar
    const blob = new Blob([doc], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Complemento-Pago-${solicitud.numeroFactura || solicitud.id}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          <h1 className="text-3xl font-bold text-gray-900">Ventas Generales</h1>
          <p className="text-gray-600 mt-2">
            Facturación y cobranza de servicios de gasto de bolsillo
          </p>
        </div>

        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6 space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por paciente, servicio o laboratorio"
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="h-4 w-4" />
              Filtros
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </div>

          {showFilters && (
            <div className="grid gap-4 md:grid-cols-3 pt-4 border-t">
              <div className="space-y-2">
                <Label>Especialista</Label>
                <Select value={filterEspecialista} onValueChange={setFilterEspecialista}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {especialistas.map((esp) => (
                      <SelectItem key={esp} value={esp}>{esp}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Padecimiento</Label>
                <Select value={filterPadecimiento} onValueChange={setFilterPadecimiento}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {padecimientos.map((pad) => (
                      <SelectItem key={pad} value={pad}>{pad}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Laboratorio</Label>
                <Select value={filterLaboratorio} onValueChange={setFilterLaboratorio}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    {laboratorios.map((lab) => (
                      <SelectItem key={lab} value={lab}>{lab}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {activeFiltersCount > 0 && (
                <div className="md:col-span-3 flex justify-end">
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <FacturacionCobranzaTabs
          items={filteredSolicitudes}
          getStatus={getStatus}
          onUpdate={updateSolicitud}
          renderItemHeader={(solicitud) => {
            const status = getStatus(solicitud);
            const timbrado = solicitud.montoFactura ?? solicitud.monto;
            return (
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="font-semibold text-lg">{solicitud.paciente}</p>
                  <p className="text-sm text-gray-600">{solicitud.servicio} - {solicitud.aseguradora}</p>
                  <p className="text-xs text-gray-500">ID: {solicitud.id}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <p className="font-bold text-lg">${timbrado.toLocaleString('es-MX')}</p>
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {solicitud.statusFacturacion}
                    </span>
                  </div>
                  {(status === 'Facturado' || status === 'Cobrado') && (
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        onClick={() => handleDownloadFactura(solicitud)}
                      >
                        Descargar Factura
                      </Button>
                      {status === 'Cobrado' && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                          onClick={() => handleDownloadComplementoPago(solicitud)}
                        >
                          Complemento de Pago
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          }}
          renderItemDetails={(solicitud) => {
            const status = getStatus(solicitud);
            if (status === 'Facturado' || status === 'Cobrado') {
              const timbrado = solicitud.montoFactura ?? solicitud.monto;
              const cobrado = status === 'Cobrado'
                ? Math.max(0, timbrado - (solicitud.saldoPosterior ?? 0))
                : (timbrado - (solicitud.saldoPendiente ?? 0));
              return (
                <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                  {status === 'Cobrado' ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Total timbrado</p>
                        <p className="text-xl font-semibold text-[#2C2C2C]">${timbrado.toLocaleString('es-MX')}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Total cobrado</p>
                        <p className="text-xl font-semibold text-green-700">${cobrado.toLocaleString('es-MX')}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Total timbrado</p>
                        <p className="text-lg font-semibold text-[#2C2C2C]">${timbrado.toLocaleString('es-MX')}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Saldo pendiente</p>
                        <p className="text-lg font-semibold text-amber-600">${(solicitud.saldoPendiente ?? 0).toLocaleString('es-MX')}</p>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 grid gap-2 md:grid-cols-2">
                    <p>Factura: <span className="font-medium">{solicitud.numeroFactura || 'Sin folio'}</span></p>
                    <p>Fecha de factura: <span className="font-medium">{solicitud.fechaFactura ? new Date(solicitud.fechaFactura).toLocaleDateString('es-MX') : 'N/A'}</span></p>
                    {status === 'Cobrado' && (
                      <>
                        <p>Fecha de pago: <span className="font-medium">{solicitud.fechaPago ? new Date(solicitud.fechaPago).toLocaleDateString('es-MX') : 'Pendiente'}</span></p>
                        <p>Referencia de pago: <span className="font-medium">{solicitud.referenciaPago || 'N/A'}</span></p>
                        <p>Saldo final: <span className="font-medium">${(solicitud.saldoPosterior ?? 0).toLocaleString('es-MX')}</span></p>
                      </>
                    )}
                  </div>
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

// Los formularios FacturacionForm y CobranzaForm son idénticos al archivo original
// (incluir aquí el código completo de los formularios del archivo facturacion-cobranza)
function FacturacionForm({
  solicitud,
  onUpdate,
  onCancel
}: {
  solicitud: AdminSolicitud;
  onUpdate: (updates: Partial<AdminSolicitud>) => void;
  onCancel: () => void;
}) {
  const isAseguradora = solicitud.metodoPago !== 'bolsillo';
  const defaultRfc = isAseguradora ? (solicitud.rfcAseguradora ?? solicitud.rfcCliente ?? '') : (solicitud.rfcCliente ?? '');
  const defaultRazon = solicitud.razonSocial ?? (isAseguradora ? solicitud.aseguradora : solicitud.paciente);
  const defaultFormaPago = solicitud.formaPago ?? (isAseguradora ? '03 - Transferencia electrónica' : '01 - Efectivo');
  const [montoFactura, setMontoFactura] = useState(solicitud.monto.toString());
  const [numeroFactura, setNumeroFactura] = useState('');
  const [facturaDatos, setFacturaDatos] = useState({
    rfc: defaultRfc,
    razonSocial: defaultRazon,
    codigoPostal: solicitud.codigoPostal ?? '',
    tipoFactura: solicitud.tipoFactura ?? 'PUE',
    formaPago: defaultFormaPago,
    regimenFiscal: solicitud.regimenFiscal ?? (isAseguradora ? '601 - General de Ley Personas Morales' : '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios'),
    codigoProducto: solicitud.codigoProducto ?? solicitud.servicioId ?? '80101513',
    conceptoFactura: solicitud.conceptoFactura ?? solicitud.servicio,
    ivaPorcentaje: solicitud.iva ?? 16,
  });
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const ivaAmount = useMemo(() => {
    const base = parseFloat(montoFactura) || 0;
    return parseFloat(((base * facturaDatos.ivaPorcentaje) / 100).toFixed(2));
  }, [montoFactura, facturaDatos.ivaPorcentaje]);

  const totalFactura = useMemo(() => {
    const base = parseFloat(montoFactura) || 0;
    return parseFloat((base + ivaAmount).toFixed(2));
  }, [montoFactura, ivaAmount]);

  const handleFacturaDataChange = (key: keyof typeof facturaDatos, value: string | number) => {
    setFacturaDatos((prev) => ({ ...prev, [key]: value }));
  };

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

      const folioSat = `SAT-${Math.floor(Math.random() * 1_000_000)}`;

      onUpdate({
        statusFacturacion: 'timbrado',
        montoFactura: parseFloat(montoFactura),
        fechaFactura: new Date().toISOString(),
        numeroFactura,
        uuidFactura: folioSat,
        rfcCliente: facturaDatos.rfc,
        razonSocial: facturaDatos.razonSocial,
        codigoPostal: facturaDatos.codigoPostal,
        tipoFactura: facturaDatos.tipoFactura as 'PPD' | 'PUE',
        formaPago: facturaDatos.formaPago,
        regimenFiscal: facturaDatos.regimenFiscal,
        codigoProducto: facturaDatos.codigoProducto,
        conceptoFactura: facturaDatos.conceptoFactura,
        iva: facturaDatos.ivaPorcentaje,
        ivaDesglosado: ivaAmount,
        saldoPendiente: parseFloat(montoFactura),
      });
      setIsGeneratingPdf(false);
      onCancel();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Datos de Facturación">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="RFC" id={`rfc-${solicitud.id}`}>
            <Input
              id={`rfc-${solicitud.id}`}
              value={facturaDatos.rfc}
              onChange={(e) => handleFacturaDataChange('rfc', e.target.value.toUpperCase())}
              placeholder="RFC del receptor"
              disabled={isGeneratingPdf}
              required
            />
          </FormField>

          <FormField label="Razón Social" id={`razon-${solicitud.id}`}>
            <Input
              id={`razon-${solicitud.id}`}
              value={facturaDatos.razonSocial}
              onChange={(e) => handleFacturaDataChange('razonSocial', e.target.value)}
              placeholder="Razón social"
              disabled={isGeneratingPdf}
              required
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Código Postal" id={`cp-${solicitud.id}`}>
            <Input
              id={`cp-${solicitud.id}`}
              value={facturaDatos.codigoPostal}
              onChange={(e) => handleFacturaDataChange('codigoPostal', e.target.value)}
              placeholder="Ej. 01234"
              disabled={isGeneratingPdf}
            />
          </FormField>

          <FormField label="Tipo de factura" id={`tipo-${solicitud.id}`}>
            <Select
              value={facturaDatos.tipoFactura}
              onValueChange={(value) => handleFacturaDataChange('tipoFactura', value)}
              disabled={isGeneratingPdf}
            >
              <SelectTrigger id={`tipo-${solicitud.id}`} className="border-[#D5D0C8]">
                <SelectValue placeholder="Selecciona tipo" />
              </SelectTrigger>
              <SelectContent>
                {FACTURA_TYPES.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>

          <FormField label="Forma de pago" id={`forma-${solicitud.id}`}>
            <Select
              value={facturaDatos.formaPago}
              onValueChange={(value) => handleFacturaDataChange('formaPago', value)}
              disabled={isGeneratingPdf}
            >
              <SelectTrigger id={`forma-${solicitud.id}`} className="border-[#D5D0C8]">
                <SelectValue placeholder="Selecciona forma" />
              </SelectTrigger>
              <SelectContent>
                {FORMA_PAGO_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label="Régimen fiscal" id={`regimen-${solicitud.id}`}>
          <Select
            value={facturaDatos.regimenFiscal}
            onValueChange={(value) => handleFacturaDataChange('regimenFiscal', value)}
            disabled={isGeneratingPdf}
          >
            <SelectTrigger id={`regimen-${solicitud.id}`} className="border-[#D5D0C8]">
              <SelectValue placeholder="Selecciona régimen" />
            </SelectTrigger>
            <SelectContent>
              {REGIMEN_OPTIONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      </FormContainer>

      <FormContainer title="Detalle del concepto">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Código de producto/servicio" id={`producto-${solicitud.id}`}>
            <Input
              id={`producto-${solicitud.id}`}
              value={facturaDatos.codigoProducto}
              onChange={(e) => handleFacturaDataChange('codigoProducto', e.target.value)}
              placeholder="Clave SAT"
              disabled={isGeneratingPdf}
            />
          </FormField>
          <FormField label="Concepto" id={`concepto-${solicitud.id}`}>
            <Input
              id={`concepto-${solicitud.id}`}
              value={facturaDatos.conceptoFactura}
              onChange={(e) => handleFacturaDataChange('conceptoFactura', e.target.value)}
              placeholder="Descripción en la factura"
              disabled={isGeneratingPdf}
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Monto (sin IVA)" id={`monto-${solicitud.id}`}>
            <Input
              id={`monto-${solicitud.id}`}
              type="number"
              value={montoFactura}
              onChange={(e) => setMontoFactura(e.target.value)}
              placeholder="Monto"
              disabled={isGeneratingPdf}
            />
          </FormField>

          <FormField label="IVA %" id={`iva-${solicitud.id}`}>
            <Input
              id={`iva-${solicitud.id}`}
              type="number"
              value={facturaDatos.ivaPorcentaje}
              onChange={(e) => handleFacturaDataChange('ivaPorcentaje', Number(e.target.value))}
              placeholder="16"
              disabled={isGeneratingPdf}
            />
          </FormField>

          <FormField label="IVA desglosado" id={`iva-monto-${solicitud.id}`}>
            <Input
              id={`iva-monto-${solicitud.id}`}
              value={`$${ivaAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              disabled
            />
          </FormField>
        </div>

        <div className="text-right text-sm text-gray-600">
          <p>Subtotal: <strong>${(parseFloat(montoFactura) || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></p>
          <p>Total con IVA: <strong>${totalFactura.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</strong></p>
        </div>
      </FormContainer>

      <FormContainer title="Generar y timbrar factura">
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

        {isGeneratingPdf && (
          <StatusMessage
            type="info"
            message="Generando y timbrando factura... Se generará el PDF automáticamente."
          />
        )}

        <FormActions
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
  const saldoBase = solicitud.saldoPendiente ?? solicitud.montoFactura ?? solicitud.monto;
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [tipoCfdi, setTipoCfdi] = useState(solicitud.cfdiPagoTipo ?? 'Pago');
  const [razonSocial, setRazonSocial] = useState(solicitud.razonSocial || solicitud.complementoPagoRazonSocial || solicitud.aseguradora || solicitud.paciente);
  const [regimenFiscal, setRegimenFiscal] = useState(solicitud.complementoPagoRegimen || solicitud.regimenFiscal || REGIMEN_OPTIONS[0]);
  const [folioRelacionado, setFolioRelacionado] = useState(solicitud.numeroFactura || solicitud.complementoPagoFolio || '');
  const saldoActual = saldoBase;
  const [montoPago, setMontoPago] = useState(saldoBase.toString());
  const [referenciaPago, setReferenciaPago] = useState(solicitud.referenciaPago ?? '');
  const saldoPosterior = Math.max(0, saldoActual - (parseFloat(montoPago) || 0));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montoPago || parseFloat(montoPago) <= 0) {
      alert('Ingresa el monto de pago.');
      return;
    }
    const pago = parseFloat(montoPago);
    const nuevoSaldo = Math.max(0, saldoActual - pago);
    onUpdate({
      statusCobranza: nuevoSaldo <= 0 ? 'pagado' : 'pendiente',
      fechaPago,
      cfdiPagoTipo: tipoCfdi,
      complementoPagoRazonSocial: razonSocial,
      complementoPagoRegimen: regimenFiscal,
      complementoPagoFolio: folioRelacionado,
      montoPago: pago,
      saldoPosterior: nuevoSaldo,
      saldoPendiente: nuevoSaldo,
      referenciaPago,
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Complemento de pago">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField label="Tipo de CFDI" id={`tipo-cfdi-${solicitud.id}`}>
            <Select value={tipoCfdi} onValueChange={setTipoCfdi}>
              <SelectTrigger id={`tipo-cfdi-${solicitud.id}`} className="border-[#D5D0C8]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pago">CFDI Pago</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          <FormField label="Régimen fiscal" id={`regimen-pago-${solicitud.id}`}>
            <Select value={regimenFiscal} onValueChange={setRegimenFiscal}>
              <SelectTrigger id={`regimen-pago-${solicitud.id}`} className="border-[#D5D0C8]">
                <SelectValue placeholder="Selecciona régimen" />
              </SelectTrigger>
              <SelectContent>
                {REGIMEN_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        </div>

        <FormField label="Razón Social" id={`razon-pago-${solicitud.id}`}>
          <Input
            id={`razon-pago-${solicitud.id}`}
            value={razonSocial}
            onChange={(e) => setRazonSocial(e.target.value)}
            placeholder="Razón social del receptor"
          />
        </FormField>

        <FormField label="Folio de facturación relacionado" id={`folio-pago-${solicitud.id}`}>
          <Input
            id={`folio-pago-${solicitud.id}`}
            value={folioRelacionado}
            onChange={(e) => setFolioRelacionado(e.target.value)}
            placeholder="Folio original"
          />
        </FormField>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField label="Saldo actual" id={`saldo-actual-${solicitud.id}`}>
            <Input id={`saldo-actual-${solicitud.id}`} value={`$${saldoActual.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`} disabled />
          </FormField>
          <FormField label="Monto del pago" id={`pago-${solicitud.id}`}>
            <Input
              id={`pago-${solicitud.id}`}
              type="number"
              value={montoPago}
              onChange={(e) => setMontoPago(e.target.value)}
              placeholder="0.00"
            />
          </FormField>
          <FormField label="Saldo posterior" id={`saldo-posterior-${solicitud.id}`}>
            <Input
              id={`saldo-posterior-${solicitud.id}`}
              value={`$${saldoPosterior.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              disabled
            />
          </FormField>
        </div>

        <div className="grid gap-4 md:grid-cols-2 mt-2">
          <FormField label="Fecha de pago" id={`fecha-${solicitud.id}`}>
            <Input id={`fecha-${solicitud.id}`} type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
          </FormField>
          <FormField label="Referencia" id={`referencia-${solicitud.id}`}>
            <Input
              id={`referencia-${solicitud.id}`}
              placeholder="ID de transacción"
              value={referenciaPago}
              onChange={(e) => setReferenciaPago(e.target.value)}
            />
          </FormField>
        </div>

        <FormActions onCancel={onCancel} submitLabel="Registrar complemento" />
      </FormContainer>
    </form>
  );
}
