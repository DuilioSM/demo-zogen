'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  Truck,
  Receipt,
  DollarSign,
  Clock,
  Building2,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function KPIsAdministracionPage() {
  const kpis = [
    {
      title: 'Estudios en Proceso',
      value: '34',
      change: '12 en laboratorio',
      icon: <Package className="h-5 w-5 text-blue-600" />,
    },
    {
      title: 'Logística Activa',
      value: '18',
      change: '8 recolecciones hoy',
      icon: <Truck className="h-5 w-5 text-orange-600" />,
    },
    {
      title: 'Por Facturar',
      value: '$856K',
      change: '14 estudios',
      icon: <Receipt className="h-5 w-5 text-purple-600" />,
    },
    {
      title: 'Por Cobrar',
      value: '$1.2M',
      change: '23 facturas',
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
    },
  ];

  const laboratories = [
    { name: 'Tempus Labs', studies: 12, avgTime: '16 días', onTime: '92%' },
    { name: 'Foundation Medicine', studies: 8, avgTime: '18 días', onTime: '88%' },
    { name: 'Guardant Health', studies: 7, avgTime: '15 días', onTime: '95%' },
    { name: 'Caris Life Sciences', studies: 4, avgTime: '20 días', onTime: '85%' },
    { name: 'NeoGenomics', studies: 3, avgTime: '17 días', onTime: '90%' },
  ];

  const insurancePayments = [
    { name: 'GNP Seguros', pending: '$345K', paid: '$1.2M', avgDays: 28 },
    { name: 'MetLife', pending: '$287K', paid: '$980K', avgDays: 32 },
    { name: 'AXA', pending: '$156K', paid: '$756K', avgDays: 25 },
    { name: 'Allianz', pending: '$68K', paid: '$432K', avgDays: 30 },
  ];

  const operationalMetrics = [
    { label: 'Tiempo promedio de entrega', value: '18 días', status: 'good' },
    { label: 'Estudios atrasados', value: '3', status: 'warning' },
    { label: 'Tasa de éxito en recolección', value: '96%', status: 'good' },
    { label: 'Facturación en tiempo', value: '89%', status: 'good' },
    { label: 'Cobranza menor a 30 días', value: '72%', status: 'warning' },
    { label: 'Estudios completados este mes', value: '42', status: 'good' },
  ];

  const purchaseOrders = [
    { id: 'PO-001', lab: 'Tempus Labs', studies: 3, amount: '$205,500', status: 'ordenado' },
    { id: 'PO-002', lab: 'Foundation Medicine', studies: 2, amount: '$146,000', status: 'recibido' },
    { id: 'PO-003', lab: 'Guardant Health', studies: 4, amount: '$236,800', status: 'en-proceso' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-purple-50 via-purple-100/30 to-white">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KPIs de Administración</h1>
          <p className="text-gray-600 mt-2">
            Métricas operativas y administrativas
          </p>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                {kpi.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <p className="text-xs text-gray-500 mt-1">{kpi.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Métricas operacionales */}
        <Card className="mb-6 bg-white">
          <CardHeader>
            <CardTitle>Métricas Operacionales</CardTitle>
            <CardDescription>Indicadores clave de rendimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {operationalMetrics.map((metric) => (
                <div key={metric.label} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">{metric.label}</p>
                      <p className="text-xl font-bold text-gray-900 mt-1">{metric.value}</p>
                    </div>
                    {metric.status === 'good' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Rendimiento de laboratorios */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Rendimiento de Laboratorios</CardTitle>
              <CardDescription>Estudios activos y tiempos de entrega</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {laboratories.map((lab) => (
                  <div key={lab.name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-900">{lab.name}</span>
                      </div>
                      <Badge variant="outline">{lab.studies} estudios</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{lab.avgTime}</span>
                      </div>
                      <span className="text-green-600 font-medium">{lab.onTime} a tiempo</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estado de cobranza */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Estado de Cobranza</CardTitle>
              <CardDescription>Por aseguradora</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {insurancePayments.map((insurance) => (
                  <div key={insurance.name} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{insurance.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {insurance.avgDays} días
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <p className="text-gray-600">Por cobrar</p>
                        <p className="font-semibold text-orange-600">{insurance.pending}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Cobrado</p>
                        <p className="font-semibold text-green-600">{insurance.paid}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Órdenes de compra */}
        <Card className="mt-6 bg-white">
          <CardHeader>
            <CardTitle>Órdenes de Compra Activas</CardTitle>
            <CardDescription>Estado de compras a laboratorios</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Laboratorio</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estudios</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Monto</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseOrders.map((po) => (
                    <tr key={po.id} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{po.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{po.lab}</td>
                      <td className="py-3 px-4 text-sm text-center text-gray-900">{po.studies}</td>
                      <td className="py-3 px-4 text-sm text-right font-semibold text-gray-900">{po.amount}</td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant="outline"
                          className={
                            po.status === 'recibido'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : po.status === 'ordenado'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }
                        >
                          {po.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
