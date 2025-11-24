'use client';

import { useState, useEffect, useMemo } from 'react';
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
  FileText,
  Download,
} from 'lucide-react';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { Solicitud } from '@/types/solicitudes';

const FILE_LABELS: Record<string, string> = {
  ine: 'INE (Identificación Oficial)',
  recetaMedica: 'Receta Médica',
  cartaPase: 'Carta Pase',
  caratulaPoliza: 'Carátula de Póliza',
  informeAseguradora: 'Informe Aseguradora',
  consentimientoInformado: 'Consentimiento Informado',
  estudiosLaboratorio: 'Estudios de Laboratorio',
  otros: 'Otros Documentos',
};

type ResumenSolicitudState = {
  admin: AdminSolicitud;
  solicitud: Solicitud | null;
  files: Record<string, string>;
  patient: unknown;
};

export default function AprobacionVTPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState<ResumenSolicitudState | null>(null);

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

  const handleVerResumen = (adminSolicitud: AdminSolicitud) => {
    // Buscar la solicitud original
    const solicitudData = localStorage.getItem(`zogen-solicitudes`);
    let solicitudOriginal: Solicitud | null = null;

    if (solicitudData) {
      try {
        const solicitudes = JSON.parse(solicitudData);
        solicitudOriginal = solicitudes.find((s: Solicitud) => s.id === adminSolicitud.solicitudId);
      } catch (e) {
        console.error('Error loading solicitud:', e);
      }
    }

    // Cargar archivos
    const filesData = localStorage.getItem(`files-${adminSolicitud.solicitudId}`);
    let filesMap: Record<string, string> = {};
    if (filesData) {
      try {
        filesMap = JSON.parse(filesData);
      } catch (e) {
        console.error('Error loading files:', e);
      }
    }

    // Cargar datos del paciente
    const patientData = localStorage.getItem(`patient-data-${adminSolicitud.solicitudId}`);
    let patientInfo: Record<string, unknown> | null = null;
    if (patientData) {
      try {
        patientInfo = JSON.parse(patientData);
      } catch (e) {
        console.error('Error loading patient data:', e);
      }
    }

    setSelectedSolicitud({
      admin: adminSolicitud,
      solicitud: solicitudOriginal,
      files: filesMap,
      patient: patientInfo,
    });
  };

  const handlePreviewArchivo = (fileData: string, fileName?: string) => {
    if (!fileData || typeof window === 'undefined') return;
    const win = window.open('', '_blank');
    if (!win) return;
    const source = fileData.startsWith('http') ? fileData : fileData;
    win.document.write(`<!DOCTYPE html><html><head><title>${fileName || 'Documento'}</title></head><body style="margin:0;height:100vh"><iframe src="${source}" style="width:100%;height:100%;border:0"></iframe></body></html>`);
    win.document.close();
  };

  const parseFileInfo = (rawValue: string) => {
    try {
      const parsed = JSON.parse(rawValue);
      if (parsed && typeof parsed === 'object' && parsed.data) {
        return {
          name: parsed.name || 'Documento adjunto',
          uploadedAt: parsed.uploadedAt,
          data: parsed.data as string,
        };
      }
    } catch (error) {
      console.warn('No se pudo interpretar el archivo cargado', error);
    }

    return {
      name: 'Documento adjunto',
      data: rawValue,
    };
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

  const renderFilesList = (entries: [string, string][]) => {
    if (entries.length === 0) {
      return (
        <p className="text-sm text-gray-600">
          Este apartado no tiene documentos adjuntos.
        </p>
      );
    }

    return (
      <div className="space-y-3">
        {entries.map(([key, value]) => {
          const meta = parseFileInfo(value);
          return (
            <div
              key={key}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-purple-500" />
                  {FILE_LABELS[key] || key}
                </p>
                <p className="text-xs text-gray-600">
                  {meta.name}
                  {meta.uploadedAt && (
                    <span className="ml-2 text-gray-500">
                      · Subido {new Date(meta.uploadedAt).toLocaleString('es-MX')}
                    </span>
                  )}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="border-purple-300 text-purple-600"
                onClick={() => handlePreviewArchivo(meta.data, meta.name)}
              >
                <Download className="h-4 w-4 mr-2" />
                Ver archivo
              </Button>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Aprobación VT</h1>
          <p className="text-gray-600 mt-2">
            Revisión y aprobación de solicitudes
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
                              onClick={() => handleVerResumen(solicitud)}
                              variant="outline"
                              size="sm"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Resumen
                            </Button>
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

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
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
                            </div>
                          </div>

                          <div className="ml-4 flex gap-2">
                            <Button
                              onClick={() => handleVerResumen(solicitud)}
                              size="sm"
                              variant="outline"
                              className="border-purple-300 text-purple-600 hover:bg-purple-50"
                            >
                              <Eye className="h-4 w-4" />
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
                          <Button
                            onClick={() => handleVerResumen(solicitud)}
                            size="sm"
                            variant="outline"
                            className="border-purple-300 text-purple-600 hover:bg-purple-50 ml-4"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialog de Resumen */}
        <Dialog open={!!selectedSolicitud} onOpenChange={(open) => {
          if (!open) {
            setSelectedSolicitud(null);
          }
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Resumen de Solicitud</DialogTitle>
              <DialogDescription>
                Información completa de la solicitud {selectedSolicitud?.admin.solicitudId}
              </DialogDescription>
            </DialogHeader>

            {selectedSolicitud && (
              <div className="space-y-6 py-4">
                {/* Información General */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-3">Información General</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">ID Solicitud</p>
                      <p className="font-medium">{selectedSolicitud.admin.solicitudId}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fecha</p>
                      <p className="font-medium">{new Date(selectedSolicitud.admin.fechaSolicitud).toLocaleDateString('es-MX')}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Paciente</p>
                      <p className="font-medium">{selectedSolicitud.admin.paciente}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Estado</p>
                      <Badge className={
                        selectedSolicitud.admin.statusAprobacion === 'aprobado' ? 'bg-green-100 text-green-800' :
                        selectedSolicitud.admin.statusAprobacion === 'rechazado' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {selectedSolicitud.admin.statusAprobacion === 'aprobado' ? 'Aprobado' :
                         selectedSolicitud.admin.statusAprobacion === 'rechazado' ? 'Rechazado' :
                         'Pendiente'}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Información del Servicio */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-semibold text-lg mb-3">Servicio</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Servicio</p>
                      <p className="font-medium">{selectedSolicitud.admin.servicio}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Laboratorio</p>
                      <p className="font-medium">{selectedSolicitud.admin.laboratorio}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Aseguradora</p>
                      <p className="font-medium">{selectedSolicitud.admin.aseguradora}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Monto</p>
                      <p className="font-medium">${selectedSolicitud.admin.monto.toLocaleString('es-MX')}</p>
                    </div>
                  </div>
                </div>

                {/* Información Adicional de Solicitud Original */}
                {selectedSolicitud.solicitud && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-3">Detalles Adicionales</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Médico Tratante</p>
                        <p className="font-medium">{selectedSolicitud.solicitud.doctor}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Padecimiento</p>
                        <p className="font-medium">{selectedSolicitud.solicitud.condition}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Teléfono Contacto</p>
                        <p className="font-medium">{selectedSolicitud.solicitud.contactPhone}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Teléfono Vendedor</p>
                        <p className="font-medium">{selectedSolicitud.solicitud.vendorPhone}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Documentos cargados */}
                <div className="border rounded-lg p-4 bg-gray-50 space-y-5">
                  <h3 className="font-semibold text-lg">Documentos cargados</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Documentos del paciente</p>
                      {renderFilesList(Object.entries(selectedSolicitud.files || {}).filter(([key]) => key !== 'cartaPase'))}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-2">Carta Pase</p>
                      {renderFilesList(Object.entries(selectedSolicitud.files || {}).filter(([key]) => key === 'cartaPase'))}
                    </div>
                  </div>
                </div>

                {/* Notas */}
                {selectedSolicitud.admin.notas && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h3 className="font-semibold text-lg mb-2">Notas</h3>
                    <p className="text-sm text-gray-700">{selectedSolicitud.admin.notas}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
