'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { Download, Search, Truck } from 'lucide-react';

const statusStyles: Record<string, string> = {
  'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'programado': 'bg-blue-100 text-blue-800 border-blue-200',
  'en-ruta': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'recolectado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'entregado-lab': 'bg-purple-100 text-purple-800 border-purple-200',
  'en-proceso': 'bg-blue-100 text-blue-800 border-blue-200',
  'completado': 'bg-green-100 text-green-800 border-green-200',
};

export default function LogisticaResultadosPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    const loadSolicitudes = () => {
      const aprobadas: AdminSolicitud[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('admin-solicitud-')) {
          const data = localStorage.getItem(key);
          if (!data) continue;
          try {
            const solicitud = JSON.parse(data) as AdminSolicitud;
            if (solicitud.statusAprobacion === 'aprobado') {
              aprobadas.push({
                ...solicitud,
                statusPagoProveedor: solicitud.statusPagoProveedor || 'pendiente',
              });
            }
          } catch (error) {
            console.error('Error parsing solicitud', error);
          }
        }
      }
      aprobadas.sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime());
      setSolicitudes(aprobadas);
    };

    loadSolicitudes();
  }, []);

  const filteredSolicitudes = useMemo(() => {
    if (!search) return solicitudes;
    const term = search.toLowerCase();
    return solicitudes.filter((solicitud) =>
      solicitud.paciente.toLowerCase().includes(term) ||
      solicitud.servicio.toLowerCase().includes(term) ||
      solicitud.laboratorio.toLowerCase().includes(term) ||
      solicitud.id.toLowerCase().includes(term)
    );
  }, [search, solicitudes]);

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

  const handleResultadosUpload = (solicitudId: string, file?: File | null) => {
    if (!file) return;
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setUploadingId(solicitudId);
    const reader = new FileReader();
    reader.onloadend = () => {
      updateSolicitud(solicitudId, {
        resultadosUrl: reader.result as string,
        resultadosNombre: file.name,
      });
      setUploadingId(null);
      alert('Archivo de resultados cargado correctamente');
    };
    reader.onerror = () => {
      setUploadingId(null);
      alert('No fue posible cargar el archivo');
    };
    reader.readAsDataURL(file);
  };

  const handlePreviewResultados = (solicitud: AdminSolicitud) => {
    if (!solicitud.resultadosUrl || typeof window === 'undefined') return;
    const win = window.open('', '_blank');
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>${solicitud.resultadosNombre || solicitud.id}</title></head><body style="margin:0;height:100vh"><iframe src="${solicitud.resultadosUrl}" style="width:100%;height:100%;border:0"></iframe></body></html>`);
    win.document.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Logística y Resultados</h1>
          <p className="text-gray-600 mt-2">
            Seguimiento operativo de servicios aprobados
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por paciente, servicio o laboratorio"
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {filteredSolicitudes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-500">
              {solicitudes.length === 0
                ? 'No hay servicios aprobados aún.'
                : 'No se encontraron servicios con tu búsqueda.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSolicitudes.map((solicitud) => {
              const isExpanded = expandedId === solicitud.id;
              const statusLogisticaBadge = statusStyles[solicitud.statusLogistica] || 'bg-gray-100 text-gray-700 border-gray-200';
              const statusResultadosBadge = statusStyles[solicitud.statusResultados] || 'bg-gray-100 text-gray-700 border-gray-200';

              return (
                <Card key={solicitud.id}>
                  <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <CardTitle className="text-lg">{solicitud.paciente}</CardTitle>
                      <p className="text-sm text-gray-600">{solicitud.servicio} · {solicitud.laboratorio}</p>
                      <p className="text-xs text-gray-500">ID servicio: {solicitud.id}</p>
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-6">
                      <div className="text-sm text-gray-500">
                        <p className="text-[11px] uppercase tracking-wide">Status logística</p>
                        <Badge variant="outline" className={statusLogisticaBadge}>
                          {solicitud.statusLogistica}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p className="text-[11px] uppercase tracking-wide">Status resultados</p>
                        <Badge variant="outline" className={statusResultadosBadge}>
                          {solicitud.statusResultados}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(isExpanded ? null : solicitud.id)}>
                        {isExpanded ? 'Cerrar' : 'Gestionar'}
                      </Button>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="space-y-6 border-t pt-6">
                      <div className="grid gap-6 lg:grid-cols-2">
                        <section className="space-y-4 rounded-lg border border-purple-100 bg-purple-50/40 p-4">
                          <h3 className="text-base font-semibold flex items-center gap-2 text-purple-900">
                            <Truck className="h-4 w-4" />
                            Logística y recolección
                          </h3>
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <Label>Status de logística</Label>
                              <Select
                                value={solicitud.statusLogistica}
                                onValueChange={(value) => updateSolicitud(solicitud.id, { statusLogistica: value as AdminSolicitud['statusLogistica'] })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                  <SelectItem value="programado">Programado</SelectItem>
                                  <SelectItem value="en-ruta">En ruta</SelectItem>
                                  <SelectItem value="recolectado">Recolectado</SelectItem>
                                  <SelectItem value="entregado-lab">Entregado a laboratorio</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Fecha de recolección</Label>
                              <Input
                                type="date"
                                value={solicitud.fechaRecoleccion || ''}
                                onChange={(event) => updateSolicitud(solicitud.id, { fechaRecoleccion: event.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Paquetería</Label>
                              <Input
                                value={solicitud.paqueteria || ''}
                                onChange={(event) => updateSolicitud(solicitud.id, { paqueteria: event.target.value })}
                                placeholder="Ej. Estafeta, DHL, FedEx"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Número de guía</Label>
                              <Input
                                value={solicitud.numeroGuia || ''}
                                onChange={(event) => updateSolicitud(solicitud.id, { numeroGuia: event.target.value })}
                                placeholder="GUIA-12345"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Número de orden del laboratorio</Label>
                              <Input
                                value={solicitud.numeroOrden || ''}
                                onChange={(event) => updateSolicitud(solicitud.id, { numeroOrden: event.target.value })}
                                placeholder="Número o referencia del laboratorio"
                              />
                            </div>
                          </div>
                        </section>

                        <section className="space-y-4 rounded-lg border border-emerald-100 bg-emerald-50/40 p-4">
                          <h3 className="text-base font-semibold text-emerald-900">Resultados del servicio</h3>
                          <div className="grid gap-4">
                            <div className="space-y-2">
                              <Label>Status de resultados</Label>
                              <Select
                                value={solicitud.statusResultados}
                                onValueChange={(value) => updateSolicitud(solicitud.id, { statusResultados: value as AdminSolicitud['statusResultados'] })}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecciona un estado" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pendiente">Pendiente</SelectItem>
                                  <SelectItem value="en-proceso">En proceso</SelectItem>
                                  <SelectItem value="completado">Completado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label>Fecha de inicio</Label>
                              <Input
                                type="date"
                                value={solicitud.fechaInicioResultados || ''}
                                onChange={(event) => updateSolicitud(solicitud.id, { fechaInicioResultados: event.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Fecha de entrega</Label>
                              <Input
                                type="date"
                                value={solicitud.fechaFinResultados || ''}
                                onChange={(event) => updateSolicitud(solicitud.id, { fechaFinResultados: event.target.value })}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Archivo de resultados</Label>
                              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                <Input
                                  type="file"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  className="flex-1"
                                  onChange={(event) => handleResultadosUpload(solicitud.id, event.target.files?.[0])}
                                  disabled={uploadingId === solicitud.id}
                                />
                                {solicitud.resultadosUrl && (
                                  <Button variant="outline" onClick={() => handlePreviewResultados(solicitud)}>
                                    <Download className="h-4 w-4 mr-2" />
                                    Previsualizar
                                  </Button>
                                )}
                              </div>
                              {uploadingId === solicitud.id && (
                                <p className="text-sm text-gray-600">Cargando archivo...</p>
                              )}
                              {solicitud.resultadosNombre && (
                                <p className="text-sm text-gray-600">Último archivo: {solicitud.resultadosNombre}</p>
                              )}
                            </div>
                          </div>
                        </section>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
