'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { Download, FileText, Search } from 'lucide-react';
import { SERVICIOS_CATALOG } from '@/types/servicio';

type PagoStatus = 'pendiente' | 'factura-recibida' | 'pagado';

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

export default function PagosProveedoresPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<PagoStatus>('pendiente');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<{ id: string; tipo: DocumentoTipo } | null>(null);

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

  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((solicitud) => {
      if ((solicitud.statusPagoProveedor || 'pendiente') !== activeTab) return false;
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        solicitud.paciente.toLowerCase().includes(term) ||
        solicitud.laboratorio.toLowerCase().includes(term) ||
        solicitud.servicio.toLowerCase().includes(term)
      );
    });
  }, [activeTab, search, solicitudes]);

  const counts = useMemo(() => ({
    pendiente: solicitudes.filter((s) => (s.statusPagoProveedor || 'pendiente') === 'pendiente').length,
    'factura-recibida': solicitudes.filter((s) => (s.statusPagoProveedor || 'pendiente') === 'factura-recibida').length,
    pagado: solicitudes.filter((s) => (s.statusPagoProveedor || 'pendiente') === 'pagado').length,
  }), [solicitudes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Pagos y Proveedores</h1>
          <p className="text-gray-600 mt-2">
            Control de saldos pendientes y evidencias de pago a laboratorios.
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por paciente o laboratorio"
                className="pl-10"
              />
            </div>
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
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
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
                              <div className="space-y-2">
                                <Label>Fecha de pago</Label>
                                <Input
                                  type="date"
                                  value={solicitud.fechaPagoProveedor || ''}
                                  onChange={(event) => updateSolicitud(solicitud.id, { fechaPagoProveedor: event.target.value })}
                                  disabled={(solicitud.statusPagoProveedor || 'pendiente') !== 'pagado'}
                                />
                              </div>
                            </div>
                            <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-4">
                              <DocumentoUploader
                                label="Factura del laboratorio"
                                descripcion="Adjunta la factura recibida para este servicio"
                                archivo={solicitud.facturaProveedorArchivo}
                                nombre={solicitud.facturaProveedorNombre}
                                loading={uploading?.id === solicitud.id && uploading.tipo === 'factura'}
                                onUpload={(file) => handleFileUpload(solicitud.id, 'factura', file)}
                                onPreview={() => previewFile(solicitud.facturaProveedorArchivo, solicitud.facturaProveedorNombre)}
                              />
                              <DocumentoUploader
                                label="Comprobante de pago"
                                descripcion="Documento o captura del pago realizado"
                                archivo={solicitud.comprobantePagoProveedorArchivo}
                                nombre={solicitud.comprobantePagoProveedorNombre}
                                loading={uploading?.id === solicitud.id && uploading.tipo === 'comprobante'}
                                onUpload={(file) => handleFileUpload(solicitud.id, 'comprobante', file)}
                                onPreview={() => previewFile(solicitud.comprobantePagoProveedorArchivo, solicitud.comprobantePagoProveedorNombre)}
                              />
                            </div>
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
