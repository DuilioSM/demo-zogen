'use client';

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  XCircle,
} from 'lucide-react';

type AdminSolicitud = {
  id: string;
  solicitudId: string;
  paciente: string;
  servicio: string;
  laboratorio: string;
  monto: number;
  aseguradora: string;
  fechaSolicitud: string;
  statusCobranza: 'pendiente' | 'pagado' | 'vencido';
  fechaPago?: string;
  referenciaPago?: string;
  fechaFactura?: string;
  montoFactura?: number;
};

export default function CobranzaDashboardPage() {
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

  const kpis = useMemo(() => {
    const pendientes = solicitudes.filter(s => s.statusCobranza === 'pendiente');
    const pagados = solicitudes.filter(s => s.statusCobranza === 'pagado');
    const vencidos = solicitudes.filter(s => s.statusCobranza === 'vencido');

    const totalPendiente = pendientes.reduce((sum, s) => sum + (s.montoFactura || s.monto || 0), 0);
    const totalCobrado = pagados.reduce((sum, s) => sum + (s.montoFactura || s.monto || 0), 0);
    const totalVencido = vencidos.reduce((sum, s) => sum + (s.montoFactura || s.monto || 0), 0);

    // Calcular cobros del mes actual
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const cobrosMesActual = pagados.filter(s => {
      if (!s.fechaPago) return false;
      const fecha = new Date(s.fechaPago);
      return fecha.getMonth() === currentMonth && fecha.getFullYear() === currentYear;
    });

    const montoMesActual = cobrosMesActual.reduce((sum, s) => sum + (s.montoFactura || s.monto || 0), 0);

    // Calcular promedio de días para cobrar
    const cobrosConFecha = pagados.filter(s => s.fechaPago && s.fechaFactura);
    const diasPromedio = cobrosConFecha.length > 0
      ? cobrosConFecha.reduce((sum, s) => {
          const factura = new Date(s.fechaFactura!).getTime();
          const pago = new Date(s.fechaPago!).getTime();
          const dias = Math.floor((pago - factura) / (1000 * 60 * 60 * 24));
          return sum + dias;
        }, 0) / cobrosConFecha.length
      : 0;

    return {
      totalPendientes: pendientes.length,
      totalPagados: pagados.length,
      totalVencidos: vencidos.length,
      montoPendiente: totalPendiente,
      montoCobrado: totalCobrado,
      montoVencido: totalVencido,
      montoMesActual,
      cobrosMesActual: cobrosMesActual.length,
      diasPromedio: Math.round(diasPromedio),
      tasaCobranza: solicitudes.length > 0 ? (pagados.length / solicitudes.length) * 100 : 0,
    };
  }, [solicitudes]);

  const cobranzaPorAseguradora = useMemo(() => {
    const agrupadas = solicitudes.reduce((acc, s) => {
      if (!acc[s.aseguradora]) {
        acc[s.aseguradora] = {
          pendientes: 0,
          pagados: 0,
          vencidos: 0,
          montoPendiente: 0,
          montoCobrado: 0,
          montoVencido: 0,
        };
      }

      const monto = s.montoFactura || s.monto || 0;

      if (s.statusCobranza === 'pendiente') {
        acc[s.aseguradora].pendientes++;
        acc[s.aseguradora].montoPendiente += monto;
      } else if (s.statusCobranza === 'pagado') {
        acc[s.aseguradora].pagados++;
        acc[s.aseguradora].montoCobrado += monto;
      } else if (s.statusCobranza === 'vencido') {
        acc[s.aseguradora].vencidos++;
        acc[s.aseguradora].montoVencido += monto;
      }

      return acc;
    }, {} as Record<string, { pendientes: number; pagados: number; vencidos: number; montoPendiente: number; montoCobrado: number; montoVencido: number }>);

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Cobranza</h1>
          <p className="text-gray-600 mt-2">
            Métricas y KPIs de cobranza a aseguradoras
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
                    Pendientes de Cobro
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
                    Pagados
                  </CardTitle>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{kpis.totalPagados}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    ${kpis.montoCobrado.toLocaleString('es-MX')} MXN
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Vencidos
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{kpis.totalVencidos}</div>
                  <p className="text-xs text-red-600 mt-1">
                    ${kpis.montoVencido.toLocaleString('es-MX')} MXN
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Cobros Mes Actual
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{kpis.cobrosMesActual}</div>
                  <p className="text-xs text-gray-600 mt-1">
                    ${kpis.montoMesActual.toLocaleString('es-MX')} MXN
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Tasa de Cobranza
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {kpis.tasaCobranza.toFixed(1)}%
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    {kpis.diasPromedio} días promedio
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Cobranza por Aseguradora */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cobranza por Aseguradora
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cobranzaPorAseguradora.length === 0 ? (
                  <div className="text-center py-10">
                    <p className="text-gray-500">No hay datos de cobranza</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cobranzaPorAseguradora.map((item) => (
                      <div
                        key={item.aseguradora}
                        className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold text-lg text-gray-900">{item.aseguradora}</h3>
                          <div className="flex items-center gap-3">
                            {item.pendientes > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <Clock className="h-4 w-4 text-orange-600" />
                                <span className="text-orange-600 font-medium">
                                  {item.pendientes} pendiente{item.pendientes > 1 ? 's' : ''}
                                </span>
                              </div>
                            )}
                            {item.vencidos > 0 && (
                              <div className="flex items-center gap-1 text-sm">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="text-red-600 font-medium">
                                  {item.vencidos} vencido{item.vencidos > 1 ? 's' : ''}
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
                            <p className="text-gray-500">Monto Pendiente</p>
                            <p className="font-medium text-gray-900">
                              ${item.montoPendiente.toLocaleString('es-MX')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Pagados</p>
                            <p className="font-medium text-gray-900">{item.pagados}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monto Cobrado</p>
                            <p className="font-medium text-green-600 font-semibold">
                              ${item.montoCobrado.toLocaleString('es-MX')}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Vencidos</p>
                            <p className="font-medium text-red-600">{item.vencidos}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Monto Vencido</p>
                            <p className="font-medium text-red-600 font-semibold">
                              ${item.montoVencido.toLocaleString('es-MX')}
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
