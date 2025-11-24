'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { AdminSolicitud } from '@/types/admin-solicitud';

export default function AdministracionServiciosPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
            // Asegurar que tenga statusAprobacion
            if (!solicitud.statusAprobacion) {
              solicitud.statusAprobacion = 'pendiente';
            }
            allSolicitudes.push(solicitud);
          } catch (e) {
            console.error('Error parsing solicitud:', e);
          }
        }
      }
    }

    // Ordenar por fecha más reciente
    allSolicitudes.sort((a, b) =>
      new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()
    );

    setSolicitudes(allSolicitudes);
    setLoading(false);
  };

  const handleAprobar = (solicitudId: string) => {
    const solicitud = solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) return;

    const updatedSolicitud = {
      ...solicitud,
      statusAprobacion: 'aprobado' as const,
      fechaAprobacion: new Date().toISOString(),
    };

    localStorage.setItem(`admin-solicitud-${solicitudId}`, JSON.stringify(updatedSolicitud));
    loadSolicitudes();
  };

  const handleRechazar = (solicitudId: string) => {
    const motivo = prompt('¿Motivo del rechazo?');
    if (!motivo) return;

    const solicitud = solicitudes.find(s => s.id === solicitudId);
    if (!solicitud) return;

    const updatedSolicitud = {
      ...solicitud,
      statusAprobacion: 'rechazado' as const,
      fechaAprobacion: new Date().toISOString(),
      motivoRechazo: motivo,
    };

    localStorage.setItem(`admin-solicitud-${solicitudId}`, JSON.stringify(updatedSolicitud));
    loadSolicitudes();
  };

  const pendientes = useMemo(() => {
    return solicitudes.filter(s => s.statusAprobacion === 'pendiente');
  }, [solicitudes]);

  const aprobados = useMemo(() => {
    return solicitudes.filter(s => s.statusAprobacion === 'aprobado');
  }, [solicitudes]);

  const rechazados = useMemo(() => {
    return solicitudes.filter(s => s.statusAprobacion === 'rechazado');
  }, [solicitudes]);

  const filteredPendientes = useMemo(() => {
    if (!searchTerm) return pendientes;
    const term = searchTerm.toLowerCase();
    return pendientes.filter(s =>
      s.paciente.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      s.solicitudId.toLowerCase().includes(term)
    );
  }, [pendientes, searchTerm]);

  const filteredAprobados = useMemo(() => {
    if (!searchTerm) return aprobados;
    const term = searchTerm.toLowerCase();
    return aprobados.filter(s =>
      s.paciente.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term) ||
      s.servicio.toLowerCase().includes(term)
    );
  }, [aprobados, searchTerm]);

  const filteredRechazados = useMemo(() => {
    if (!searchTerm) return rechazados;
    const term = searchTerm.toLowerCase();
    return rechazados.filter(s =>
      s.paciente.toLowerCase().includes(term) ||
      s.id.toLowerCase().includes(term)
    );
  }, [rechazados, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Administración de Servicios</h1>
          <p className="text-gray-600 mt-2">
            Gestión y aprobación de solicitudes de servicio
          </p>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar por paciente, ID de solicitud..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-purple-200 focus:border-purple-400"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pendientes" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="pendientes" className="flex items-center gap-2">
              Pendientes de Aprobar ({pendientes.length})
            </TabsTrigger>
            <TabsTrigger value="aprobados" className="flex items-center gap-2">
              Aprobados ({aprobados.length})
            </TabsTrigger>
            <TabsTrigger value="rechazados" className="flex items-center gap-2">
              Rechazados ({rechazados.length})
            </TabsTrigger>
          </TabsList>

          {/* Tab Pendientes */}
          <TabsContent value="pendientes">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Pendientes de Aprobación</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Cargando solicitudes...</p>
                  </div>
                ) : filteredPendientes.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm ? 'No se encontraron resultados' : 'No hay solicitudes pendientes'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredPendientes.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-mono">
                              {solicitud.solicitudId}
                            </Badge>
                            <div>
                              <h3 className="font-semibold text-lg text-gray-900">{solicitud.paciente}</h3>
                              <p className="text-sm text-gray-600">{solicitud.servicio}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => handleAprobar(solicitud.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => handleRechazar(solicitud.id)}
                              variant="outline"
                              className="border-red-300 text-red-600 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Rechazar
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Aprobados */}
          <TabsContent value="aprobados">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Aprobadas ({filteredAprobados.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Cargando solicitudes...</p>
                  </div>
                ) : filteredAprobados.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm ? 'No se encontraron resultados' : 'No hay solicitudes aprobadas'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAprobados.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">{solicitud.paciente}</h3>
                              <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                                {solicitud.id}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                              <div>
                                <p className="text-gray-500">Servicio</p>
                                <p className="font-medium text-gray-900">{solicitud.servicio}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Laboratorio</p>
                                <p className="font-medium text-gray-900">{solicitud.laboratorio}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Aseguradora</p>
                                <p className="font-medium text-gray-900">{solicitud.aseguradora}</p>
                              </div>
                              <div>
                                <p className="text-gray-500">Monto</p>
                                <p className="font-medium text-gray-900">
                                  ${solicitud.monto.toLocaleString('es-MX')}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="ml-4">
                            <Link href={`/administracion/servicios/${solicitud.id}`}>
                              <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalle
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Rechazados */}
          <TabsContent value="rechazados">
            <Card>
              <CardHeader>
                <CardTitle>Solicitudes Rechazadas ({filteredRechazados.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">Cargando solicitudes...</p>
                  </div>
                ) : filteredRechazados.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">
                      {searchTerm ? 'No se encontraron resultados' : 'No hay solicitudes rechazadas'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredRechazados.map((solicitud) => (
                      <div
                        key={solicitud.id}
                        className="border border-red-200 rounded-lg p-4 bg-red-50/30"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold text-lg text-gray-900">{solicitud.paciente}</h3>
                              <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                                {solicitud.id}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{solicitud.servicio}</p>
                            {solicitud.motivoRechazo && (
                              <div className="mt-2 p-2 bg-red-100 rounded border border-red-200">
                                <p className="text-xs font-semibold text-red-800">Motivo de rechazo:</p>
                                <p className="text-sm text-red-700">{solicitud.motivoRechazo}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
