'use client';

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertCircle, DollarSign, TrendingUp } from 'lucide-react';
import type { CompraEstudio } from '@/types/compra-estudio';

export default function DashboardCostosPage() {
  const [compras, setCompras] = useState<CompraEstudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCompras();
  }, []);

  const loadCompras = () => {
    setLoading(true);
    const allCompras: CompraEstudio[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('compra-estudio-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const compra = JSON.parse(data) as CompraEstudio;
            allCompras.push(compra);
          } catch (e) {
            console.error('Error parsing compra:', e);
          }
        }
      }
    }
    setCompras(allCompras.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    setLoading(false);
  };

  const facturasPendientes = useMemo(() => {
    return compras.filter(c => c.status === 'factura-recibida' && c.statusPago !== 'pagado');
  }, [compras]);

  const totalDeuda = useMemo(() => {
    return facturasPendientes.reduce((sum, compra) => {
      const monto = compra.montoPagado || compra.monto;
      const pagado = compra.montoPagado || 0;
      return sum + (monto - pagado);
    }, 0);
  }, [facturasPendientes]);

  const estadisticas = useMemo(() => {
    const porEstatus = compras.reduce((acc, compra) => {
      acc[compra.status] = (acc[compra.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalCompras = compras.reduce((sum, c) => sum + (c.monto || 0), 0);
    const totalPagado = compras.filter(c => c.statusPago === 'pagado').reduce((sum, c) => sum + (c.montoPagado || c.monto || 0), 0);

    return {
      porEstatus,
      totalCompras,
      totalPagado,
      pendientePago: totalCompras - totalPagado
    };
  }, [compras]);

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Costos</h1>
          <p className="text-gray-600 mt-2">
            Resumen de compras de estudios y facturas pendientes de pago
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Compras</CardTitle>
              <DollarSign className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${estadisticas.totalCompras.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">{compras.length} compras registradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Facturas Pendientes</CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{facturasPendientes.length}</div>
              <p className="text-xs text-gray-600 mt-1">Por pagar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deuda</CardTitle>
              <FileText className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">${totalDeuda.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">Monto pendiente de pago</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${estadisticas.totalPagado.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">Pagos completados</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Facturas Pendientes de Pago
            </CardTitle>
            <p className="text-sm text-gray-600">
              Facturas recibidas que aún no han sido pagadas
            </p>
          </CardHeader>
          <CardContent>
            {facturasPendientes.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay facturas pendientes de pago</p>
                <p className="text-xs text-gray-400 mt-2">¡Todas las facturas están al día!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {facturasPendientes.map((compra) => {
                  const montoTotal = compra.monto || 0;
                  const montoPagado = compra.montoPagado || 0;
                  const montoPendiente = montoTotal - montoPagado;
                  const diasVencimiento = compra.fechaVencimiento
                    ? Math.ceil((new Date(compra.fechaVencimiento).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : null;

                  return (
                    <div
                      key={compra.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">
                                {compra.numeroFactura || compra.id}
                              </p>
                              <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">
                                Pendiente de pago
                              </Badge>
                              {diasVencimiento !== null && (
                                <Badge
                                  variant="outline"
                                  className={
                                    diasVencimiento < 0
                                      ? 'bg-red-100 text-red-700 border-red-200'
                                      : diasVencimiento <= 7
                                      ? 'bg-orange-100 text-orange-700 border-orange-200'
                                      : 'bg-green-100 text-green-700 border-green-200'
                                  }
                                >
                                  {diasVencimiento < 0
                                    ? `Vencida hace ${Math.abs(diasVencimiento)} días`
                                    : `Vence en ${diasVencimiento} días`
                                  }
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {compra.razonSocial || compra.proveedor}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-xs text-gray-500">RFC: {compra.rfc || 'N/A'}</p>
                              <p className="text-xs text-gray-500">
                                Fecha factura: {compra.fechaFactura ? new Date(compra.fechaFactura).toLocaleDateString('es-MX') : 'N/A'}
                              </p>
                              {compra.estudio && (
                                <p className="text-xs text-gray-500">Estudio: {compra.estudio}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-red-600">
                          ${montoPendiente.toLocaleString('es-MX')}
                        </p>
                        <p className="text-xs text-gray-500">
                          de ${montoTotal.toLocaleString('es-MX')}
                        </p>
                        {compra.fechaVencimiento && (
                          <p className="text-xs text-gray-500 mt-1">
                            Vence: {new Date(compra.fechaVencimiento).toLocaleDateString('es-MX')}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumen por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium">Pendiente</p>
                <p className="text-2xl font-bold text-blue-900">{estadisticas.porEstatus['pendiente'] || 0}</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-700 font-medium">Factura Recibida</p>
                <p className="text-2xl font-bold text-green-900">{estadisticas.porEstatus['factura-recibida'] || 0}</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-sm text-purple-700 font-medium">Completado</p>
                <p className="text-2xl font-bold text-purple-900">{estadisticas.porEstatus['completado'] || 0}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-sm text-gray-700 font-medium">Total</p>
                <p className="text-2xl font-bold text-gray-900">{compras.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
