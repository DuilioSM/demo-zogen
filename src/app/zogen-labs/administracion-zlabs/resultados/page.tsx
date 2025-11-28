'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { Download, FileText, Filter, Search, X } from 'lucide-react';

const statusStyles: Record<string, string> = {
  'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'en-proceso': 'bg-blue-100 text-blue-800 border-blue-200',
  'completado': 'bg-green-100 text-green-800 border-green-200',
};

export default function ResultadosPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [search, setSearch] = useState('');
  const [filterEspecialista, setFilterEspecialista] = useState('todos');
  const [filterPadecimiento, setFilterPadecimiento] = useState('todos');
  const [filterLaboratorio, setFilterLaboratorio] = useState('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

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

      const matchesEspecialista = !filterEspecialista || filterEspecialista === 'todos' || solicitud.especialista === filterEspecialista;
      const matchesPadecimiento = !filterPadecimiento || filterPadecimiento === 'todos' || solicitud.padecimiento === filterPadecimiento;
      const matchesLaboratorio = !filterLaboratorio || filterLaboratorio === 'todos' || solicitud.laboratorio === filterLaboratorio;

      return matchesSearch && matchesEspecialista && matchesPadecimiento && matchesLaboratorio;
    });
  }, [search, solicitudes, filterEspecialista, filterPadecimiento, filterLaboratorio]);

  const activeFiltersCount = [filterEspecialista, filterPadecimiento, filterLaboratorio].filter(f => f && f !== 'todos').length;

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

  const handleExpand = (solicitudId: string) => {
    setExpandedId(expandedId === solicitudId ? null : solicitudId);

    // Pre-cargar fecha de inicio si no existe
    const solicitud = solicitudes.find(s => s.id === solicitudId);
    if (solicitud && !solicitud.fechaInicioResultados) {
      const today = new Date().toISOString().split('T')[0];
      updateSolicitud(solicitudId, { fechaInicioResultados: today });
    }
  };

  const clearFilters = () => {
    setFilterEspecialista('todos');
    setFilterPadecimiento('todos');
    setFilterLaboratorio('todos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Resultados Estudios</h1>
          <p className="text-gray-600 mt-2">
            Liberación y carga de resultados de estudios
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6 space-y-4">
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
          </CardContent>
        </Card>

        {filteredSolicitudes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-gray-500">
              {solicitudes.length === 0
                ? 'No hay servicios aprobados aún.'
                : 'No se encontraron servicios con los filtros seleccionados.'}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredSolicitudes.map((solicitud) => {
              const isExpanded = expandedId === solicitud.id;
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
                        <p className="text-[11px] uppercase tracking-wide">Status resultados</p>
                        <Badge variant="outline" className={statusResultadosBadge}>
                          {solicitud.statusResultados}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleExpand(solicitud.id)}>
                        {isExpanded ? 'Cerrar' : 'Gestionar'}
                      </Button>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="border-t pt-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-emerald-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-100">
                          <FileText className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Gestión de resultados</h3>
                          <p className="text-sm text-gray-600">Carga y liberación de resultados del estudio</p>
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
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
                        <div className="space-y-2 md:col-span-2 lg:col-span-3">
                          <Label>Comentarios y notas</Label>
                          <Textarea
                            value={solicitud.comentariosResultados || ''}
                            onChange={(event) => updateSolicitud(solicitud.id, { comentariosResultados: event.target.value })}
                            placeholder="Agrega comentarios o notas sobre los resultados..."
                            rows={3}
                            className="resize-none"
                          />
                        </div>
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
