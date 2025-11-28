'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { Download, FileText, Search, Filter, Plus, Trash2, Upload, X } from 'lucide-react';
import { SERVICIOS_CATALOG } from '@/types/servicio';
import type { PagoLaboratorio } from '@/types/admin-solicitud';

type PagoStatus = 'pendiente' | 'factura-recibida' | 'pagado';

const REGIMEN_OPTIONS = [
  '601 - General de Ley Personas Morales',
  '603 - Personas Morales con Fines no Lucrativos',
  '605 - Sueldos y Salarios e Ingresos Asimilados a Salarios',
  '606 - Arrendamiento',
  '612 - Personas Físicas con Actividades Empresariales y Profesionales',
  '621 - Incorporación Fiscal',
];

const statusCopy: Record<PagoStatus, { label: string; badge: string }> = {
  'pendiente': { label: 'Pendiente de pago', badge: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  'factura-recibida': { label: 'Factura recibida', badge: 'bg-blue-100 text-blue-800 border-blue-200' },
  'pagado': { label: 'Pago realizado', badge: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
};

type DocumentoTipo = 'factura' | 'comprobante';

const previewFile = (data?: string, name?: string) => {
  if (!data) return;
  if (typeof window === 'undefined') return;
  const source = data.startsWith('http') ? data : data;
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(`<!DOCTYPE html><html><head><title>${name || 'Documento'}</title></head><body style="margin:0;height:100vh"><iframe src="${source}" style="width:100%;height:100%;border:0"></iframe></body></html>`);
  win.document.close();
};

const getCostoServicio = (solicitud: AdminSolicitud) => {
  if (solicitud.costoCompra) return solicitud.costoCompra;
  if (solicitud.servicioId) {
    const byId = SERVICIOS_CATALOG.find((producto) => producto.id === solicitud.servicioId);
    if (byId) return byId.costo;
  }
  const byName = SERVICIOS_CATALOG.find((producto) => producto.nombre.toLowerCase() === solicitud.servicio.toLowerCase());
  return byName?.costo;
};

export default function CompraEstudiosPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<PagoStatus>('pendiente');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ id: string; tipo: DocumentoTipo } | null>(null);
  const [filterEspecialista, setFilterEspecialista] = useState('todos');
  const [filterLaboratorio, setFilterLaboratorio] = useState('todos');
  const [filterPadecimiento, setFilterPadecimiento] = useState('todos');
  const [showFilters, setShowFilters] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    const loadSolicitudes = () => {
      const services: AdminSolicitud[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith('admin-solicitud-')) continue;
        const data = localStorage.getItem(key);
        if (!data) continue;
        try {
          const solicitud = JSON.parse(data) as AdminSolicitud;
          if (solicitud.statusAprobacion === 'aprobado') {
            services.push({
              ...solicitud,
              statusPagoProveedor: solicitud.statusPagoProveedor || 'pendiente',
            });
          }
        } catch (error) {
          console.error('Error parsing admin solicitud', error);
        }
      }
      services.sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime());
      setSolicitudes(services);
    };

    loadSolicitudes();
  }, []);

  const updateSolicitud = (solicitudId: string, updates: Partial<AdminSolicitud>) => {
    setSolicitudes((prev) =>
      prev.map((item) => {
        if (item.id !== solicitudId) return item;
        const updated = { ...item, ...updates };
        localStorage.setItem(`admin-solicitud-${solicitudId}`, JSON.stringify(updated));
        return updated;
      })
    );
  };

  const handleFileUpload = (solicitudId: string, tipo: DocumentoTipo, file?: File | null) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setUploading({ id: solicitudId, tipo });
    const reader = new FileReader();
    reader.onloadend = () => {
      if (tipo === 'factura') {
        updateSolicitud(solicitudId, {
          facturaProveedorArchivo: reader.result as string,
          facturaProveedorNombre: file.name,
          statusPagoProveedor: 'factura-recibida',
        });
      } else {
        updateSolicitud(solicitudId, {
          comprobantePagoProveedorArchivo: reader.result as string,
          comprobantePagoProveedorNombre: file.name,
          statusPagoProveedor: 'pagado',
        });
      }
      setUploading(null);
    };
    reader.onerror = () => {
      setUploading(null);
      alert('No fue posible cargar el documento.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddFactura = (solicitudId: string) => {
    const solicitud = solicitudes.find((s) => s.id === solicitudId);
    if (!solicitud) return;

    const now = new Date();
    const newFactura: PagoLaboratorio = {
      id: `FAC-${now.getTime()}`,
      proveedor: solicitud.laboratorio,
      factura: '',
      fecha: new Date().toISOString().split('T')[0],
      monto: 0,
      moneda: 'MXN',
      status: 'pendiente',
    };

    const pagosLaboratorio = solicitud.pagosLaboratorio || [];
    updateSolicitud(solicitudId, {
      pagosLaboratorio: [...pagosLaboratorio, newFactura],
    });
  };

  const handleRemoveFactura = (solicitudId: string, facturaId: string) => {
    const solicitud = solicitudes.find((s) => s.id === solicitudId);
    if (!solicitud || !solicitud.pagosLaboratorio) return;

    updateSolicitud(solicitudId, {
      pagosLaboratorio: solicitud.pagosLaboratorio.filter((f) => f.id !== facturaId),
    });
  };

  const handleUpdateFactura = (solicitudId: string, facturaId: string, updates: Partial<PagoLaboratorio>) => {
    const solicitud = solicitudes.find((s) => s.id === solicitudId);
    if (!solicitud || !solicitud.pagosLaboratorio) return;

    updateSolicitud(solicitudId, {
      pagosLaboratorio: solicitud.pagosLaboratorio.map((f) =>
        f.id === facturaId ? { ...f, ...updates } : f
      ),
    });
  };

  const handleUploadFacturaPDF = (solicitudId: string, facturaId: string, file?: File | null) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      handleUpdateFactura(solicitudId, facturaId, {
        archivoUrl: reader.result as string,
        archivoNombre: file.name,
      });
    };
    reader.onerror = () => {
      alert('No fue posible cargar el documento.');
    };
    reader.readAsDataURL(file);
  };

  const handleMultipleFilesUpload = (files: FileList | null) => {
    if (!files) return;
    const fileArray = Array.from(files);
    setUploadedFiles(fileArray);
    setShowUploadModal(true);
  };

  const handleAssignFileToFactura = (fileIndex: number, solicitudId: string, facturaId: string) => {
    const file = uploadedFiles[fileIndex];
    if (!file) return;
    handleUploadFacturaPDF(solicitudId, facturaId, file);
  };

  const especialistas = useMemo(() => {
    const unique = new Set(solicitudes.map((s) => s.especialista).filter((v): v is string => Boolean(v)));
    return Array.from(unique).sort();
  }, [solicitudes]);

  const laboratorios = useMemo(() => {
    const unique = new Set(solicitudes.map((s) => s.laboratorio).filter((v): v is string => Boolean(v)));
    return Array.from(unique).sort();
  }, [solicitudes]);

  const padecimientos = useMemo(() => {
    const unique = new Set(solicitudes.map((s) => s.padecimiento).filter((v): v is string => Boolean(v)));
    return Array.from(unique).sort();
  }, [solicitudes]);

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      if ((solicitud.statusPagoProveedor || 'pendiente') !== activeTab) return false;

      const matchesSearch = !search || (() => {
        const term = search.toLowerCase();
        return (
          solicitud.paciente.toLowerCase().includes(term) ||
          solicitud.laboratorio.toLowerCase().includes(term) ||
          solicitud.servicio.toLowerCase().includes(term)
        );
      })();

      const matchesEspecialista = filterEspecialista === 'todos' || solicitud.especialista === filterEspecialista;
      const matchesLaboratorio = filterLaboratorio === 'todos' || solicitud.laboratorio === filterLaboratorio;
      const matchesPadecimiento = filterPadecimiento === 'todos' || solicitud.padecimiento === filterPadecimiento;

      return matchesSearch && matchesEspecialista && matchesLaboratorio && matchesPadecimiento;
    });
  }, [activeTab, search, solicitudes, filterEspecialista, filterLaboratorio, filterPadecimiento]);

  const counts = useMemo(() => ({
    pendiente: solicitudes.filter((s) => (s.statusPagoProveedor || 'pendiente') === 'pendiente').length,
    'factura-recibida': solicitudes.filter((s) => (s.statusPagoProveedor || 'pendiente') === 'factura-recibida').length,
    pagado: solicitudes.filter((s) => (s.statusPagoProveedor || 'pendiente') === 'pagado').length,
  }), [solicitudes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compra de Estudios</h1>
          <p className="text-gray-600 mt-2">
            Control de compras a laboratorios, pagos y evidencias
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar por paciente o laboratorio"
                  className="pl-10"
                />
              </div>
              <label htmlFor="multiple-files-upload">
                <input
                  id="multiple-files-upload"
                  type="file"
                  multiple
                  accept=".pdf"
                  onChange={(e) => handleMultipleFilesUpload(e.target.files)}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="default"
                  className="bg-[#9B7CB8] hover:bg-[#8A6BA7]"
                  onClick={() => document.getElementById('multiple-files-upload')?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Subir Facturas
                </Button>
              </label>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 grid gap-4 md:grid-cols-3 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Especialista</Label>
                  <Select value={filterEspecialista} onValueChange={setFilterEspecialista}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      {especialistas.map((esp) => (
                        <SelectItem key={esp} value={esp}>
                          {esp}
                        </SelectItem>
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
                        <SelectItem key={lab} value={lab}>
                          {lab}
                        </SelectItem>
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
                        <SelectItem key={pad} value={pad}>
                          {pad}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-3 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilterEspecialista('todos');
                      setFilterLaboratorio('todos');
                      setFilterPadecimiento('todos');
                    }}
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PagoStatus)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pendiente">
              Pendientes de Pago ({counts.pendiente})
            </TabsTrigger>
            <TabsTrigger value="factura-recibida">
              Factura Recibida ({counts['factura-recibida']})
            </TabsTrigger>
            <TabsTrigger value="pagado">
              Pago realizado ({counts.pagado})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6 space-y-4">
            {filteredSolicitudes.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-500">
                  No hay servicios en este estado.
                </CardContent>
              </Card>
            ) : (
              filteredSolicitudes.map((solicitud) => {
                const badge = statusCopy[(solicitud.statusPagoProveedor || 'pendiente') as PagoStatus];
                const isExpanded = expandedId === solicitud.id;
                const costoReferencia = getCostoServicio(solicitud) ?? solicitud.monto;
                const montoProveedor = solicitud.montoPagoProveedor ?? costoReferencia;
                return (
                  <Card key={solicitud.id}>
                    <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <CardTitle className="text-lg">{solicitud.paciente}</CardTitle>
                        <p className="text-sm text-gray-600">{solicitud.laboratorio}</p>
                        <p className="text-xs text-gray-500">Servicio: {solicitud.servicio}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900">${montoProveedor.toLocaleString('es-MX')}</p>
                        <Badge variant="outline" className={badge.badge}>{badge.label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="border-t pt-4">
                      {!isExpanded && (
                        <div className="flex justify-end">
                          <Button variant="outline" size="sm" onClick={() => setExpandedId(solicitud.id)}>
                            Actualizar
                          </Button>
                        </div>
                      )}
                      {isExpanded && (
                        <div className="space-y-5">
                          <div className="grid gap-6">
                            <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50/30 p-6">
                              <h3 className="font-semibold text-lg text-gray-900 mb-4">Información del Proveedor y Facturas</h3>

                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                  <Label>RFC del Proveedor *</Label>
                                  <Input
                                    value={solicitud.rfcProveedor || solicitud.rfcCliente || ''}
                                    onChange={(event) => updateSolicitud(solicitud.id, { rfcProveedor: event.target.value.toUpperCase() })}
                                    placeholder="XAXX010101000"
                                    maxLength={13}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Razón Social *</Label>
                                  <Input
                                    value={solicitud.razonSocialProveedor || solicitud.razonSocial || solicitud.laboratorio}
                                    onChange={(event) => updateSolicitud(solicitud.id, { razonSocialProveedor: event.target.value })}
                                    placeholder="Nombre o razón social del proveedor"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Régimen Fiscal *</Label>
                                  <Select
                                    value={solicitud.regimenFiscalProveedor || REGIMEN_OPTIONS[0]}
                                    onValueChange={(value) => updateSolicitud(solicitud.id, { regimenFiscalProveedor: value })}
                                  >
                                    <SelectTrigger>
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
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                  <Label>Estado</Label>
                                  <Select
                                    value={(solicitud.statusPagoProveedor || 'pendiente') as PagoStatus}
                                    onValueChange={(value) => updateSolicitud(solicitud.id, { statusPagoProveedor: value as PagoStatus })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un estado" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="pendiente">Pendiente de pago</SelectItem>
                                      <SelectItem value="factura-recibida">Factura recibida</SelectItem>
                                      <SelectItem value="pagado">Pago realizado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Monto a pagar (MXN)</Label>
                                  <Input
                                    type="number"
                                    step="0.01"
                                    value={solicitud.montoPagoProveedor ?? costoReferencia}
                                    onChange={(event) => updateSolicitud(solicitud.id, { montoPagoProveedor: Number(event.target.value) })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Número de factura</Label>
                                  <Input
                                    value={solicitud.numeroFactura || ''}
                                    onChange={(event) => updateSolicitud(solicitud.id, { numeroFactura: event.target.value })}
                                    placeholder="Folio del laboratorio"
                                  />
                                </div>
                              </div>

                              <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                  <Label>Fecha de Factura</Label>
                                  <Input
                                    type="date"
                                    value={solicitud.fechaFacturaProveedor || ''}
                                    onChange={(event) => updateSolicitud(solicitud.id, { fechaFacturaProveedor: event.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Fecha de Vencimiento</Label>
                                  <Input
                                    type="date"
                                    value={solicitud.fechaVencimientoProveedor || ''}
                                    onChange={(event) => updateSolicitud(solicitud.id, { fechaVencimientoProveedor: event.target.value })}
                                  />
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label>Notas</Label>
                                <Textarea
                                  value={solicitud.notasProveedor || ''}
                                  onChange={(event) => updateSolicitud(solicitud.id, { notasProveedor: event.target.value })}
                                  placeholder="Información adicional sobre la compra..."
                                  rows={3}
                                  className="resize-none"
                                />
                              </div>

                              <div className="border-t pt-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">Facturas del Proveedor</h4>
                                  <p className="text-xs text-gray-500">Gestiona múltiples facturas relacionadas con este servicio</p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleAddFactura(solicitud.id)}
                                  className="flex items-center gap-1"
                                >
                                  <Plus className="h-4 w-4" />
                                  Agregar Factura
                                </Button>
                              </div>

                              {(!solicitud.pagosLaboratorio || solicitud.pagosLaboratorio.length === 0) ? (
                                <div className="text-center py-8 text-gray-500 text-sm">
                                  No hay facturas agregadas. Haz clic en "Agregar Factura" para comenzar.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {solicitud.pagosLaboratorio.map((factura) => (
                                    <Card key={factura.id} className="bg-gray-50">
                                      <CardContent className="p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                          <div className="flex-1 grid gap-3 md:grid-cols-2">
                                            <div className="space-y-1">
                                              <Label className="text-xs">Número de Factura</Label>
                                              <Input
                                                value={factura.factura}
                                                onChange={(e) => handleUpdateFactura(solicitud.id, factura.id, { factura: e.target.value })}
                                                placeholder="Ej: FAC-001"
                                                className="text-sm"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-xs">Fecha</Label>
                                              <Input
                                                type="date"
                                                value={factura.fecha}
                                                onChange={(e) => handleUpdateFactura(solicitud.id, factura.id, { fecha: e.target.value })}
                                                className="text-sm"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-xs">Monto</Label>
                                              <Input
                                                type="number"
                                                value={factura.monto}
                                                onChange={(e) => handleUpdateFactura(solicitud.id, factura.id, { monto: Number(e.target.value) })}
                                                placeholder="0.00"
                                                className="text-sm"
                                              />
                                            </div>
                                            <div className="space-y-1">
                                              <Label className="text-xs">Estado</Label>
                                              <Select
                                                value={factura.status}
                                                onValueChange={(value) => handleUpdateFactura(solicitud.id, factura.id, { status: value as PagoLaboratorio['status'] })}
                                              >
                                                <SelectTrigger className="text-sm">
                                                  <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                                  <SelectItem value="factura-recibida">Factura Recibida</SelectItem>
                                                  <SelectItem value="pagado">Pagado</SelectItem>
                                                </SelectContent>
                                              </Select>
                                            </div>
                                          </div>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveFactura(solicitud.id, factura.id)}
                                            className="ml-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>

                                        <div className="space-y-2">
                                          <Label className="text-xs">Archivo PDF</Label>
                                          <div className="flex gap-2">
                                            <Input
                                              type="file"
                                              accept=".pdf"
                                              onChange={(e) => handleUploadFacturaPDF(solicitud.id, factura.id, e.target.files?.[0])}
                                              className="text-sm"
                                            />
                                            {factura.archivoUrl && (
                                              <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => previewFile(factura.archivoUrl, factura.archivoNombre)}
                                              >
                                                <FileText className="h-4 w-4 mr-1" />
                                                Ver
                                              </Button>
                                            )}
                                          </div>
                                          {factura.archivoNombre && (
                                            <p className="text-xs text-gray-600">📎 {factura.archivoNombre}</p>
                                          )}
                                        </div>

                                        {factura.notas !== undefined && (
                                          <div className="space-y-1">
                                            <Label className="text-xs">Notas</Label>
                                            <Input
                                              value={factura.notas || ''}
                                              onChange={(e) => handleUpdateFactura(solicitud.id, factura.id, { notas: e.target.value })}
                                              placeholder="Notas adicionales..."
                                              className="text-sm"
                                            />
                                          </div>
                                        )}
                                      </CardContent>
                                    </Card>
                                  ))}
                                </div>
                              )}
                              </div>
                            </div>

                            {solicitud.statusPagoProveedor === 'factura-recibida' && (
                              <div className="space-y-4">
                                <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Evidencia de Pago</h4>
                                  <DocumentoUploader
                                    label="Evidencia de Pago"
                                    descripcion="Comprobante o captura de la transferencia/pago realizado"
                                    archivo={solicitud.evidenciaPagoArchivo}
                                    nombre={solicitud.evidenciaPagoNombre}
                                    loading={uploading?.id === solicitud.id && uploading.tipo === 'evidencia'}
                                    onUpload={(file) => handleFileUpload(solicitud.id, 'evidencia', file)}
                                    onPreview={() => previewFile(solicitud.evidenciaPagoArchivo, solicitud.evidenciaPagoNombre)}
                                  />
                                </div>

                                <div className="rounded-lg border border-green-200 bg-green-50/30 p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Complemento de Pago</h4>
                                  <DocumentoUploader
                                    label="Complemento de Pago"
                                    descripcion="XML del complemento de pago emitido por el proveedor"
                                    archivo={solicitud.complementoPagoArchivo}
                                    nombre={solicitud.complementoPagoNombre}
                                    loading={uploading?.id === solicitud.id && uploading.tipo === 'complemento'}
                                    onUpload={(file) => handleFileUpload(solicitud.id, 'complemento', file)}
                                    onPreview={() => previewFile(solicitud.complementoPagoArchivo, solicitud.complementoPagoNombre)}
                                  />
                                </div>
                              </div>
                            )}

                            {solicitud.statusPagoProveedor === 'pagado' && (
                              <div className="space-y-4 rounded-lg border border-purple-200 bg-purple-50/30 p-6">
                                <h3 className="font-semibold text-lg text-gray-900 mb-4">Información de Pago Completado</h3>
                                <div className="grid gap-4 md:grid-cols-2">
                                  <div className="space-y-2">
                                    <Label>Fecha de Pago</Label>
                                    <Input
                                      type="date"
                                      value={solicitud.fechaPagoProveedor || ''}
                                      onChange={(event) => updateSolicitud(solicitud.id, { fechaPagoProveedor: event.target.value })}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Referencia de Pago</Label>
                                    <Input
                                      value={solicitud.referenciaPago || ''}
                                      onChange={(event) => updateSolicitud(solicitud.id, { referenciaPago: event.target.value })}
                                      placeholder="Número de referencia o folio"
                                    />
                                  </div>
                                </div>

                                <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-4 mt-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Evidencia de Pago</h4>
                                  <DocumentoUploader
                                    label="Evidencia de Pago"
                                    descripcion="Comprobante o captura de la transferencia/pago realizado"
                                    archivo={solicitud.evidenciaPagoArchivo}
                                    nombre={solicitud.evidenciaPagoNombre}
                                    loading={uploading?.id === solicitud.id && uploading.tipo === 'evidencia'}
                                    onUpload={(file) => handleFileUpload(solicitud.id, 'evidencia', file)}
                                    onPreview={() => previewFile(solicitud.evidenciaPagoArchivo, solicitud.evidenciaPagoNombre)}
                                  />
                                </div>

                                <div className="rounded-lg border border-green-200 bg-green-50/30 p-4">
                                  <h4 className="font-semibold text-gray-900 mb-3">Complemento de Pago</h4>
                                  <DocumentoUploader
                                    label="Complemento de Pago"
                                    descripcion="XML del complemento de pago emitido por el proveedor"
                                    archivo={solicitud.complementoPagoArchivo}
                                    nombre={solicitud.complementoPagoNombre}
                                    loading={uploading?.id === solicitud.id && uploading.tipo === 'complemento'}
                                    onUpload={(file) => handleFileUpload(solicitud.id, 'complemento', file)}
                                    onPreview={() => previewFile(solicitud.complementoPagoArchivo, solicitud.complementoPagoNombre)}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" onClick={() => setExpandedId(null)}>Cerrar</Button>
                            <Button onClick={() => alert('Cambios guardados automáticamente ✔️')}>
                              Listo
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {showUploadModal && uploadedFiles.length > 0 && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-auto">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Asignar Facturas Subidas</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Se detectaron {uploadedFiles.length} archivo(s). Asigna cada factura a su compra correspondiente.
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadedFiles([]);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {uploadedFiles.map((file, index) => {
                  const facturasPendientes = solicitudes.filter(s =>
                    s.pagosLaboratorio && s.pagosLaboratorio.some(f =>
                      !f.archivoUrl || f.status === 'pendiente'
                    )
                  );
                  return (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4 mb-3">
                          <FileText className="h-8 w-8 text-purple-600" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{file.name}</p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Asignar a factura de:</Label>
                          <Select onValueChange={(value) => {
                            const [solicitudId, facturaId] = value.split('|');
                            handleAssignFileToFactura(index, solicitudId, facturaId);
                          }}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona una factura..." />
                            </SelectTrigger>
                            <SelectContent>
                              {facturasPendientes.map((solicitud) =>
                                solicitud.pagosLaboratorio
                                  ?.filter(factura => !factura.archivoUrl || factura.status === 'pendiente')
                                  .map((factura) => (
                                    <SelectItem
                                      key={`${solicitud.id}|${factura.id}`}
                                      value={`${solicitud.id}|${factura.id}`}
                                    >
                                      {solicitud.laboratorio} - {factura.factura || 'Sin número'} - {solicitud.paciente}
                                    </SelectItem>
                                  ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUploadModal(false);
                      setUploadedFiles([]);
                    }}
                  >
                    Cerrar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

type DocumentoUploaderProps = {
  label: string;
  descripcion: string;
  archivo?: string;
  nombre?: string;
  loading: boolean;
  onUpload: (file?: File | null) => void;
  onPreview: () => void;
};

function DocumentoUploader({ label, descripcion, archivo, nombre, loading, onUpload, onPreview }: DocumentoUploaderProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{label}</CardTitle>
        <p className="text-sm text-gray-500 font-normal">{descripcion}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(event) => onUpload(event.target.files?.[0])} disabled={loading} />
        {loading && <p className="text-sm text-gray-600">Cargando documento…</p>}
        {archivo && (
          <div className="flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-sm">
            <div className="flex items-center gap-2 text-gray-700">
              <FileText className="h-4 w-4 text-purple-600" />
              <span>{nombre || 'Documento adjunto'}</span>
            </div>
            <Button variant="outline" size="sm" onClick={onPreview}>
              <Download className="h-4 w-4 mr-1" />
              Previsualizar
            </Button>
          </div>
        )}
        {!archivo && !loading && (
          <p className="text-xs text-gray-500">Aún no se adjunta ningún documento.</p>
        )}
      </CardContent>
    </Card>
  );
}
