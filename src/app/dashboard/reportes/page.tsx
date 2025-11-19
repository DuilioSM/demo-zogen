'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Activity,
  TrendingUp,
  Users,
  FileText,
  Receipt,
  Package,
  AlertCircle,
  CheckCircle2,
  Clock,
  DollarSign,
} from 'lucide-react';

export default function DashboardPage() {
  // KPIs principales del proceso completo
  const kpis = [
    {
      title: 'Solicitudes Activas',
      value: '47',
      change: '+12% vs mes anterior',
      icon: <FileText className="h-5 w-5 text-blue-600" />,
      color: 'blue',
    },
    {
      title: 'En Cotización',
      value: '18',
      change: '8 enviadas a aseguradoras',
      icon: <Receipt className="h-5 w-5 text-purple-600" />,
      color: 'purple',
    },
    {
      title: 'En Operación',
      value: '23',
      change: '15 en laboratorio',
      icon: <Package className="h-5 w-5 text-orange-600" />,
      color: 'orange',
    },
    {
      title: 'Facturación Pendiente',
      value: '$1.2M',
      change: '12 estudios por facturar',
      icon: <DollarSign className="h-5 w-5 text-green-600" />,
      color: 'green',
    },
  ];

  // Pipeline de proceso completo
  const processStages = [
    { stage: 'Solicitud recibida', count: 47, color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { stage: 'Documentación en proceso', count: 32, color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { stage: 'Cotización enviada', count: 18, color: 'bg-purple-100 text-purple-700 border-purple-200' },
    { stage: 'Aprobado por seguro', count: 15, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { stage: 'En operación', count: 23, color: 'bg-orange-100 text-orange-700 border-orange-200' },
    { stage: 'Resultados entregados', count: 12, color: 'bg-green-100 text-green-700 border-green-200' },
    { stage: 'Facturado', count: 8, color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  ];

  // Estudios recientes
  const recentStudies = [
    {
      id: 'EST-001',
      patient: 'María González',
      doctor: 'Dr. Ramírez',
      study: 'Panel cáncer de mama',
      stage: 'Cotización enviada',
      status: 'warning',
      insurance: 'GNP Seguros',
      amount: '$42,000',
    },
    {
      id: 'EST-002',
      patient: 'Carlos Medina',
      doctor: 'Dr. Torres',
      study: 'Oncogenómico integral',
      stage: 'En laboratorio',
      status: 'success',
      insurance: 'MetLife',
      amount: '$68,500',
    },
    {
      id: 'EST-003',
      patient: 'Ana Domínguez',
      doctor: 'Dr. López',
      study: 'Cáncer gastrointestinal',
      stage: 'Recolección programada',
      status: 'info',
      insurance: 'AXA',
      amount: '$55,200',
    },
    {
      id: 'EST-004',
      patient: 'Diego Salas',
      doctor: 'Dr. Martínez',
      study: 'Panel ginecológico',
      stage: 'Documentación pendiente',
      status: 'warning',
      insurance: 'Allianz',
      amount: '$47,800',
    },
  ];

  // Alertas y pendientes
  const alerts = [
    { type: 'urgent', message: '3 estudios requieren documentación adicional', count: 3 },
    { type: 'warning', message: '5 cotizaciones esperando respuesta de aseguradoras', count: 5 },
    { type: 'info', message: '8 estudios listos para facturación', count: 8 },
  ];

  // Métricas de ventas
  const salesMetrics = [
    { label: 'Total vendedores activos', value: '12' },
    { label: 'Conversiones este mes', value: '34' },
    { label: 'Ticket promedio', value: '$52,400' },
    { label: 'Tiempo promedio de cierre', value: '12 días' },
  ];

  // Métricas de operación
  const operationMetrics = [
    { label: 'Laboratorios activos', value: '5' },
    { label: 'Tiempo promedio de entrega', value: '18 días' },
    { label: 'Estudios en tránsito', value: '7' },
    { label: 'Recolecciones programadas', value: '11' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
          <p className="text-gray-600 mt-2">
            Vista integral del proceso de Zogen: desde la solicitud hasta la cobranza
          </p>
        </div>

        {/* KPIs principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {kpis.map((kpi) => (
            <Card key={kpi.title} className="border-gray-200">
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

        {/* Alertas */}
        <Card className="mb-6 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900">
              <AlertCircle className="h-5 w-5" />
              Alertas y pendientes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {alerts.map((alert, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-100"
              >
                <div className="flex items-center gap-3">
                  {alert.type === 'urgent' && <AlertCircle className="h-4 w-4 text-red-600" />}
                  {alert.type === 'warning' && <Clock className="h-4 w-4 text-yellow-600" />}
                  {alert.type === 'info' && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                  <span className="text-sm text-gray-700">{alert.message}</span>
                </div>
                <Badge variant="outline" className="ml-2">
                  {alert.count}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pipeline de proceso */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pipeline del Proceso</CardTitle>
              <CardDescription>Estado de todos los estudios en el sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {processStages.map((stage) => (
                  <div key={stage.stage} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Badge className={`${stage.color} border`}>{stage.count}</Badge>
                      <span className="text-sm text-gray-700">{stage.stage}</span>
                    </div>
                    <div className="w-24 bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${stage.color.split(' ')[0].replace('bg-', 'bg-').replace('-100', '-500')}`}
                        style={{ width: `${(stage.count / 47) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Métricas rápidas */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métricas de Ventas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {salesMetrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{metric.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Métricas de Operación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {operationMetrics.map((metric) => (
                  <div key={metric.label} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{metric.label}</span>
                    <span className="text-sm font-semibold text-gray-900">{metric.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Estudios recientes */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Estudios Recientes</CardTitle>
            <CardDescription>Últimas solicitudes y su estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Paciente</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Doctor</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estudio</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aseguradora</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Monto</th>
                  </tr>
                </thead>
                <tbody>
                  {recentStudies.map((study) => (
                    <tr key={study.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{study.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{study.patient}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{study.doctor}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{study.study}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{study.insurance}</td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            study.status === 'success'
                              ? 'bg-green-50 text-green-700 border-green-200'
                              : study.status === 'warning'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-blue-50 text-blue-700 border-blue-200'
                          }
                        >
                          {study.stage}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        {study.amount}
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
