'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import type { AdminSolicitud } from '@/types/admin-solicitud';

export default function FacturacionDashboardPage() {
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
            allSolicitudes.push(solicitud);
          } catch (e) {
            console.error('Error parsing solicitud:', e);
          }
        }
      }
    }

    setSolicitudes(allSolicitudes);
    setLoading(false);
  };

  const facturasPendientes = useMemo(
    () => solicitudes.filter((s) => s.statusFacturacion === 'pendiente' || s.statusFacturacion === 'facturado'),
    [solicitudes]
  );

  const facturasTimbradas = useMemo(
    () => solicitudes.filter((s) => s.statusFacturacion === 'timbrado'),
    [solicitudes]
  );

  const facturasCobradas = useMemo(
    () => solicitudes.filter((s) => s.statusCobranza === 'pagado'),
    [solicitudes]
  );

  const kpis = useMemo(() => {
    const totalPendiente = facturasPendientes.reduce((sum, s) => sum + (s.monto || 0), 0);
    const totalTimbrado = facturasTimbradas.reduce((sum, s) => sum + (s.montoFactura || s.monto || 0), 0);
    const totalCobrado = facturasCobradas.reduce((sum, s) => sum + (s.montoFactura || s.monto || 0), 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const facturasMesActual = facturasTimbradas.filter((s) => {
      if (!s.fechaFactura) return false;
      const fecha = new Date(s.fechaFactura);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    const montoMesActual = facturasMesActual.reduce((sum, s) => sum + (s.montoFactura || s.monto || 0), 0);

    const facturasConFecha = facturasTimbradas.filter((s) => s.fechaFactura && s.fechaSolicitud);
    const diasPromedio = facturasConFecha.length > 0
      ? facturasConFecha.reduce((sum, s) => {
          const solicitud = new Date(s.fechaSolicitud).getTime();
          const factura = new Date(s.fechaFactura!).getTime();
          const dias = Math.floor((factura - solicitud) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0) / facturasConFecha.length
      : 0;

    return {
      totalPendientes: facturasPendientes.length,
      totalTimbradas: facturasTimbradas.length,
      totalCobradas: facturasCobradas.length,
      montoPendiente: totalPendiente,
      montoTimbrado: totalTimbrado,
      montoCobrado: totalCobrado,
      montoMesActual,
      facturasMesActual: facturasMesActual.length,
      diasPromedio: Math.round(diasPromedio),
      tasaFacturacion: solicitudes.length > 0 ? (facturasTimbradas.length / solicitudes.length) * 100 : 0,
    };
  }, [facturasPendientes, facturasTimbradas, facturasCobradas, solicitudes.length]);

  const facturasPorAseguradora = useMemo(() => {
    const agrupadas = solicitudes.reduce((acc, s) => {
      if (!acc[s.aseguradora]) {
        acc[s.aseguradora] = {
          pendientes: 0,
          timbradas: 0,
          cobradas: 0,
          montoPendiente: 0,
          montoTimbrado: 0,
          montoCobrado: 0,
        };
      }

      const montoBase = s.montoFactura || s.monto || 0;

      if (s.statusFacturacion === 'pendiente' || s.statusFacturacion === 'facturado') {
        acc[s.aseguradora].pendientes++;
        acc[s.aseguradora].montoPendiente += s.monto || 0;
      }

      if (s.statusFacturacion === 'timbrado') {
        acc[s.aseguradora].timbradas++;
        acc[s.aseguradora].montoTimbrado += montoBase;
      }

      if (s.statusCobranza === 'pagado') {
        acc[s.aseguradora].cobradas++;
        acc[s.aseguradora].montoCobrado += montoBase;
      }

      return acc;
    }, {} as Record<string, { pendientes: number; timbradas: number; cobradas: number; montoPendiente: number; montoTimbrado: number; montoCobrado: number }>);

    return Object.entries(agrupadas).map(([aseguradora, data]) => ({
      aseguradora,
      ...data,
    }));
  }, [solicitudes]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Facturación</h1>
          <p className="text-gray-600 mt-2">
            Métricas y KPIs de facturación a aseguradoras
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : (
          <>
            {/* KPIs Principales */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Pendientes de Facturar
                  </CardTitle>
                  <Clock className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{kpis.totalPendientes}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    ${kpis.montoPendiente.toLocaleString('es-MX')} MXN
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Timbradas
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{kpis.totalTimbradas}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    ${kpis.montoTimbrado.toLocaleString('es-MX')} MXN
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cobradas
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{kpis.totalCobradas}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    ${kpis.montoCobrado.toLocaleString('es-MX')} MXN
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Facturación Mes Actual
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{kpis.facturasMesActual}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    ${kpis.montoMesActual.toLocaleString('es-MX')} MXN
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tasa de Facturación
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {kpis.tasaFacturacion.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {kpis.diasPromedio} días promedio
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Estado de facturas y cobranza</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="pendientes" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="pendientes">
                      Factura Pendiente ({facturasPendientes.length})
                    </TabsTrigger>
                    <TabsTrigger value="timbradas">
                      Factura Timbrada ({facturasTimbradas.length})
                    </TabsTrigger>
                    <TabsTrigger value="cobradas">
                      Factura Cobrada ({facturasCobradas.length})
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="pendientes" className="mt-4">
                    {facturasPendientes.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-8">No hay facturas pendientes</p>
                    ) : (
                      <div className="space-y-3">
                        {facturasPendientes.map((solicitud) => (
                          <div
                            key={solicitud.id}
                            className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{solicitud.paciente}</p>
                              <p className="text-xs text-gray-600">{solicitud.servicio} · {solicitud.aseguradora}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                Creada {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-MX')}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant="outline"
                                className={
                                  solicitud.statusFacturacion === 'facturado'
                                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                                    : 'bg-orange-50 text-orange-700 border-orange-200'
                                }
                              >
                                {solicitud.statusFacturacion === 'facturado' ? 'Por timbrar' : 'Pendiente'}
                              </Badge>
                              <Link href={`/administracion/servicios/${solicitud.id}`}>
                                <Button size="sm" variant="outline">
                                  Revisar
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="timbradas" className="mt-4">
                    {facturasTimbradas.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-8">No hay facturas timbradas</p>
                    ) : (
                      <div className="space-y-3">
                        {facturasTimbradas.map((solicitud) => (
                          <div
                            key={solicitud.id}
                            className="flex flex-col gap-3 rounded-lg border border-green-100 bg-green-50/50 p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{solicitud.paciente}</p>
                              <p className="text-xs text-gray-600 mb-1">Factura #{solicitud.numeroFactura || 'Sin folio'}</p>
                              <p className="text-xs text-gray-500">
                                Timbrada:{' '}
                                {solicitud.fechaFactura
                                  ? new Date(solicitud.fechaFactura).toLocaleDateString('es-MX')
                                  : 'Sin fecha'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Cobranza: {solicitud.statusCobranza === 'pagado' ? 'Cobrada' : solicitud.statusCobranza}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  ${(solicitud.montoFactura || solicitud.monto).toLocaleString('es-MX')} MXN
                                </p>
                                <p className="text-xs text-gray-500">{solicitud.aseguradora}</p>
                              </div>
                              <Link href={`/administracion/servicios/${solicitud.id}`}>
                                <Button size="sm" variant="outline">
                                  Seguimiento
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="cobradas" className="mt-4">
                    {facturasCobradas.length === 0 ? (
                      <p className="text-center text-sm text-gray-500 py-8">No hay facturas cobradas</p>
                    ) : (
                      <div className="space-y-3">
                        {facturasCobradas.map((solicitud) => (
                          <div
                            key={solicitud.id}
                            className="flex flex-col gap-3 rounded-lg border border-emerald-200 bg-emerald-50/40 p-4 md:flex-row md:items-center md:justify-between"
                          >
                            <div>
                              <p className="text-sm font-semibold text-gray-900">{solicitud.paciente}</p>
                              <p className="text-xs text-gray-600">Pago recibido: {solicitud.fechaPago ? new Date(solicitud.fechaPago).toLocaleDateString('es-MX') : 'Sin fecha'}</p>
                              <p className="text-xs text-gray-500">
                                Referencia: {solicitud.referenciaPago || 'N/A'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900">
                                  ${(solicitud.montoFactura || solicitud.monto).toLocaleString('es-MX')} MXN
                                </p>
                                <p className="text-xs text-gray-500">{solicitud.aseguradora}</p>
                              </div>
                              <Link href={`/administracion/servicios/${solicitud.id}`}>
                                <Button size="sm" variant="outline">
                                  Ver detalle
                                </Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Facturación por Aseguradora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Facturación por Aseguradora
                </CardTitle>
              </CardHeader>
              <CardContent>
                {facturasPorAseguradora.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No hay datos de facturación</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {facturasPorAseguradora.map((item) => (
                      <div
                        key={item.aseguradora}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">{item.aseguradora}</h3>
                          <div className="flex items-center gap-2">
                            {item.pendientes > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <AlertCircle className="h-4 w-4 text-orange-600" />
                                <span className="text-orange-600 font-medium">
                                  {item.pendientes} pendiente{item.pendientes > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Pendientes</p>
                            <p className="font-medium text-gray-900">{item.pendientes}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Timbradas</p>
                            <p className="font-medium text-gray-900">{item.timbradas}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cobradas</p>
                            <p className="font-medium text-gray-900">{item.cobradas}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monto Pendiente</p>
                            <p className="font-medium text-gray-900">
                              ${item.montoPendiente.toLocaleString('es-MX')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monto Timbrado</p>
                            <p className="font-medium text-blue-600 font-semibold">
                              ${item.montoTimbrado.toLocaleString('es-MX')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monto Cobrado</p>
                            <p className="font-medium text-green-600 font-semibold">
                              ${item.montoCobrado.toLocaleString('es-MX')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
