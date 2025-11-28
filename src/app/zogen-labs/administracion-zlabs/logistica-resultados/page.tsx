'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { Filter, Package, Search, X } from 'lucide-react';

const statusStyles: Record<string, string> = {
  'pendiente': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'programado': 'bg-blue-100 text-blue-800 border-blue-200',
  'en-ruta': 'bg-indigo-100 text-indigo-800 border-indigo-200',
  'recolectado': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  'entregado-lab': 'bg-purple-100 text-purple-800 border-purple-200',
};

const PAQUETERIAS = [
  'Estafeta',
  'DHL',
  'FedEx',
  'UPS',
  'Redpack',
  'Paquetexpress',
  'Mensajería local',
  'Otro',
];

export default function LogisticaResultadosPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [search, setSearch] = useState('');
  const [filterEspecialista, setFilterEspecialista] = useState('todos');
  const [filterPadecimiento, setFilterPadecimiento] = useState('todos');
  const [filterLaboratorio, setFilterLaboratorio] = useState('todos');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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

  const clearFilters = () => {
    setFilterEspecialista('todos');
    setFilterPadecimiento('todos');
    setFilterLaboratorio('todos');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Logística Laboratorios</h1>
          <p className="text-gray-600 mt-2">
            Seguimiento de logística y recolección de servicios aprobados
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
              const statusLogisticaBadge = statusStyles[solicitud.statusLogistica] || 'bg-gray-100 text-gray-700 border-gray-200';

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
                      <Button variant="outline" size="sm" onClick={() => setExpandedId(isExpanded ? null : solicitud.id)}>
                        {isExpanded ? 'Cerrar' : 'Gestionar'}
                      </Button>
                    </div>
                  </CardHeader>
                  {isExpanded && (
                    <CardContent className="border-t pt-6">
                      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-purple-100">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                          <Package className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">Información de envío</h3>
                          <p className="text-sm text-gray-600">Gestiona los datos logísticos del servicio</p>
                        </div>
                      </div>
                      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                          <Select
                            value={solicitud.paqueteria || ''}
                            onValueChange={(value) => updateSolicitud(solicitud.id, { paqueteria: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona paquetería" />
                            </SelectTrigger>
                            <SelectContent>
                              {PAQUETERIAS.map((paq) => (
                                <SelectItem key={paq} value={paq}>{paq}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
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
