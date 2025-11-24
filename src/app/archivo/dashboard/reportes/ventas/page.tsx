'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp,
  DollarSign,
  Users,
  Target,
  MessageSquare,
  CheckCircle2,
  Clock,
  FileText,
} from 'lucide-react';

export default function KPIsVentasPage() {
  const kpis = [
    {
      title: 'Ingresos del Mes',
      value: '$2.4M',
      change: '+23% vs mes anterior',
      trend: 'up',
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
    },
    {
      title: 'Conversaciones Activas',
      value: '156',
      change: '+12 nuevas hoy',
      trend: 'up',
      icon: <MessageSquare className="h-5 w-5 text-blue-600" />,
    },
    {
      title: 'Tasa de Conversión',
      value: '34%',
      change: '+5% vs mes anterior',
      trend: 'up',
      icon: <Target className="h-5 w-5 text-purple-600" />,
    },
    {
      title: 'Vendedores Activos',
      value: '12',
      change: '100% activos hoy',
      trend: 'neutral',
      icon: <Users className="h-5 w-5 text-orange-600" />,
    },
  ];

  const topVendors = [
    { name: 'Juan Pérez', sales: 23, amount: '$487,000', conversion: '42%' },
    { name: 'María García', sales: 19, amount: '$412,000', conversion: '38%' },
    { name: 'Carlos López', sales: 17, amount: '$368,000', conversion: '35%' },
    { name: 'Ana Martínez', sales: 15, amount: '$324,000', conversion: '32%' },
    { name: 'Luis Rodríguez', sales: 12, amount: '$276,000', conversion: '28%' },
  ];

  const pipelineStats = [
    { stage: 'Contacto inicial', count: 45, percentage: 100 },
    { stage: 'Información enviada', count: 38, percentage: 84 },
    { stage: 'Documentación en proceso', count: 28, percentage: 62 },
    { stage: 'Cotización enviada', count: 22, percentage: 49 },
    { stage: 'Aprobación pendiente', count: 18, percentage: 40 },
    { stage: 'Cerrado-Ganado', count: 15, percentage: 33 },
  ];

  const monthlyTrend = [
    { month: 'Ene', sales: 28, amount: 1.8 },
    { month: 'Feb', sales: 32, amount: 2.1 },
    { month: 'Mar', sales: 35, amount: 2.3 },
    { month: 'Abr', sales: 38, amount: 2.4 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">KPIs de Ventas</h1>
          <p className="text-gray-600 mt-2">
            Métricas y estadísticas del equipo de ventas
          </p>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{kpi.title}</CardTitle>
                {kpi.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <p className={`text-xs mt-1 flex items-center gap-1 ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {kpi.trend === 'up' && <TrendingUp className="h-3 w-3" />}
                  {kpi.change}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top vendedores */}
          <Card>
            <CardHeader>
              <CardTitle>Top Vendedores del Mes</CardTitle>
              <CardDescription>Rendimiento por vendedor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topVendors.map((vendor, index) => (
                  <div key={vendor.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-700">#{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{vendor.name}</p>
                        <p className="text-xs text-gray-500">{vendor.sales} ventas</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">{vendor.amount}</p>
                      <Badge variant="outline" className="text-xs">
                        {vendor.conversion}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pipeline */}
          <Card>
            <CardHeader>
              <CardTitle>Embudo de Ventas</CardTitle>
              <CardDescription>Estado actual del pipeline</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {pipelineStats.map((stage) => (
                  <div key={stage.stage}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-700">{stage.stage}</span>
                      <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-purple-500 to-purple-600"
                        style={{ width: `${stage.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tendencia mensual */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Tendencia Mensual</CardTitle>
            <CardDescription>Evolución de ventas e ingresos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mes</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ventas</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ingresos (M)</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ticket Promedio</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyTrend.map((data) => (
                    <tr key={data.month} className="border-b border-gray-100">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{data.month}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">{data.sales}</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">${data.amount}M</td>
                      <td className="py-3 px-4 text-sm text-right text-gray-900">
                        ${((data.amount / data.sales) * 1000000).toLocaleString()}
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
