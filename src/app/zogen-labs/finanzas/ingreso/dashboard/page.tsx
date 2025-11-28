'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import { DollarSign, TrendingUp, AlertCircle, FileText } from 'lucide-react';

type FilterType = 'todas' | 'pendientes' | 'cobradas';

export default function DashboardIngresosPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('todas');

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
            if (solicitud.statusAprobacion === 'aprobado') {
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

  const mesActual = useMemo(() => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth(),
    };
  }, []);

  const metricsDelMes = useMemo(() => {
    const solicitudesDelMes = solicitudes.filter(s => {
      const fecha = new Date(s.fechaSolicitud);
      return fecha.getFullYear() === mesActual.year && fecha.getMonth() === mesActual.month;
    });

    const facturado = solicitudesDelMes
      .filter(s => s.statusFacturacion === 'timbrado' || s.statusFacturacion === 'facturado')
      .reduce((sum, s) => sum + (s.montoFactura ?? s.monto), 0);

    const cobrado = solicitudesDelMes
      .filter(s => s.statusCobranza === 'pagado')
      .reduce((sum, s) => sum + (s.montoFactura ?? s.monto), 0);

    const pendienteCobrar = solicitudesDelMes
      .filter(s => (s.statusFacturacion === 'timbrado' || s.statusFacturacion === 'facturado') && s.statusCobranza !== 'pagado')
      .reduce((sum, s) => sum + (s.montoFactura ?? s.monto), 0);

    return {
      facturado,
      cobrado,
      pendienteCobrar,
      totalFacturas: solicitudesDelMes.filter(s => s.statusFacturacion === 'timbrado' || s.statusFacturacion === 'facturado').length,
    };
  }, [solicitudes, mesActual]);

  const facturasRecientes = useMemo(() => {
    let filtered = solicitudes.filter(s => s.statusFacturacion === 'timbrado' || s.statusFacturacion === 'facturado');

    if (filter === 'pendientes') {
      filtered = filtered.filter(s => s.statusCobranza !== 'pagado');
    } else if (filter === 'cobradas') {
      filtered = filtered.filter(s => s.statusCobranza === 'pagado');
    }

    return filtered.slice(0, 10);
  }, [solicitudes, filter]);

  const facturasPendientes = useMemo(() => {
    return solicitudes
      .filter(s => (s.statusFacturacion === 'timbrado' || s.statusFacturacion === 'facturado') && s.statusCobranza !== 'pagado')
      .length;
  }, [solicitudes]);

  const facturasCobradas = useMemo(() => {
    return solicitudes
      .filter(s => (s.statusFacturacion === 'timbrado' || s.statusFacturacion === 'facturado') && s.statusCobranza === 'pagado')
      .length;
  }, [solicitudes]);

  const nombreMes = new Date(mesActual.year, mesActual.month).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard y KPIs</h1>
          <p className="text-gray-600 mt-2">
            Visión financiera de ingresos - {nombreMes}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturado del Mes</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">
                ${metricsDelMes.facturado.toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {metricsDelMes.totalFacturas} facturas emitidas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cobrado del Mes</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${metricsDelMes.cobrado.toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((metricsDelMes.cobrado / (metricsDelMes.facturado || 1)) * 100).toFixed(1)}% del facturado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendiente por Cobrar</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">
                ${metricsDelMes.pendienteCobrar.toLocaleString('es-MX')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Por cobrar este mes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Facturas</CardTitle>
              <FileText className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {metricsDelMes.totalFacturas}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Facturas del mes actual
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Facturas Recientes</CardTitle>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'todas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('todas')}
                  className={filter === 'todas' ? 'bg-purple-600 hover:bg-purple-700' : ''}
                >
                  Todas
                </Button>
                <Button
                  variant={filter === 'pendientes' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('pendientes')}
                  className={filter === 'pendientes' ? 'bg-amber-600 hover:bg-amber-700' : ''}
                >
                  Pendientes ({facturasPendientes})
                </Button>
                <Button
                  variant={filter === 'cobradas' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter('cobradas')}
                  className={filter === 'cobradas' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  Cobradas ({facturasCobradas})
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {facturasRecientes.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                {filter === 'todas' && 'No hay facturas emitidas aún.'}
                {filter === 'pendientes' && 'No hay facturas pendientes de cobrar.'}
                {filter === 'cobradas' && 'No hay facturas cobradas.'}
              </p>
            ) : (
              <div className="space-y-3">
                {facturasRecientes.map((factura) => (
                  <div
                    key={factura.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{factura.paciente}</p>
                          <p className="text-sm text-gray-600">{factura.servicio}</p>
                          <p className="text-xs text-gray-500">
                            Factura: {factura.numeroFactura || factura.id}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        ${(factura.montoFactura ?? factura.monto).toLocaleString('es-MX')}
                      </p>
                      <Badge
                        variant="outline"
                        className={
                          factura.statusCobranza === 'pagado'
                            ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                        }
                      >
                        {factura.statusCobranza === 'pagado' ? 'Cobrado' : 'Pendiente cobro'}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(factura.fechaFactura || factura.fechaSolicitud).toLocaleDateString('es-MX')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
