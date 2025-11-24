'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Activity,
  PieChart,
  LineChart,
  Target,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

export default function ZogenKPIsPage() {
  const kpis = [
    {
      title: 'Ingresos Totales',
      value: '$2,847,500',
      description: 'Este mes',
      icon: <DollarSign className="h-4 w-4 text-green-600" />,
      trend: '+18.2%',
      trendUp: true,
    },
    {
      title: 'Nuevos Clientes',
      value: '234',
      description: 'Este mes',
      icon: <Users className="h-4 w-4 text-blue-600" />,
      trend: '+12.5%',
      trendUp: true,
    },
    {
      title: 'Tasa de Conversión',
      value: '68.4%',
      description: 'Promedio mensual',
      icon: <Target className="h-4 w-4 text-purple-600" />,
      trend: '+3.1%',
      trendUp: true,
    },
    {
      title: 'Margen de Utilidad',
      value: '42.8%',
      description: 'Promedio consolidado',
      icon: <Activity className="h-4 w-4 text-orange-600" />,
      trend: '-2.3%',
      trendUp: false,
    },
  ];

  const dashboards = [
    {
      title: 'Dashboard Financiero',
      description: 'Análisis de ingresos, gastos, utilidades y flujo de caja consolidado de todas las unidades de negocio.',
      icon: <DollarSign className="h-8 w-8 text-green-600" />,
      href: '/zogen-kpis/analisis',
      color: 'border-green-200 bg-green-50/50',
      metrics: ['Ingresos', 'Gastos', 'Utilidad Neta', 'ROI'],
    },
    {
      title: 'Dashboard de Ventas',
      description: 'Seguimiento de pipeline, conversión, ticket promedio y desempeño del equipo comercial.',
      icon: <TrendingUp className="h-8 w-8 text-blue-600" />,
      href: '/zogen-kpis/analisis',
      color: 'border-blue-200 bg-blue-50/50',
      metrics: ['Pipeline', 'Tasa Conversión', 'Ticket Promedio', 'Cuota'],
    },
    {
      title: 'Dashboard Operativo',
      description: 'Monitoreo de eficiencia operativa, tiempos de entrega, SLA y satisfacción del cliente.',
      icon: <Activity className="h-8 w-8 text-purple-600" />,
      href: '/zogen-kpis/analisis',
      color: 'border-purple-200 bg-purple-50/50',
      metrics: ['SLA', 'Tiempo Entrega', 'CSAT', 'NPS'],
    },
    {
      title: 'Dashboard Estratégico',
      description: 'Visualización de KPIs estratégicos, crecimiento y comparativas vs objetivos anuales.',
      icon: <BarChart3 className="h-8 w-8 text-orange-600" />,
      href: '/zogen-kpis/analisis',
      color: 'border-orange-200 bg-orange-50/50',
      metrics: ['Crecimiento YoY', 'Market Share', 'CAC', 'LTV'],
    },
  ];

  const reportes = [
    {
      title: 'Reporte Mensual Ejecutivo',
      description: 'Resumen consolidado de todas las métricas clave',
      period: 'Noviembre 2025',
      icon: <Calendar className="h-5 w-5 text-gray-600" />,
    },
    {
      title: 'Análisis de Rentabilidad por Línea',
      description: 'Comparativa Labs vs MedDev',
      period: 'Q4 2025',
      icon: <PieChart className="h-5 w-5 text-gray-600" />,
    },
    {
      title: 'Proyección de Flujo de Caja',
      description: 'Forecast próximos 6 meses',
      period: 'Dic 2025 - Jun 2026',
      icon: <LineChart className="h-5 w-5 text-gray-600" />,
    },
  ];

  return (
    <div className="p-6 overflow-auto h-full bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-lg text-white">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-indigo-200 uppercase">
                    Zogen KPIs
                  </p>
                  <h1 className="text-3xl font-bold">
                    Centro de Inteligencia de Negocios
                  </h1>
                </div>
              </div>
              <p className="text-indigo-100 max-w-3xl">
                Visualiza y analiza los indicadores clave de rendimiento de todas las unidades de negocio.
                Toma decisiones basadas en datos en tiempo real.
              </p>
            </div>
          </section>

          {/* KPIs Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((kpi) => (
              <Card key={kpi.title} className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {kpi.title}
                  </CardTitle>
                  {kpi.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{kpi.value}</div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{kpi.description}</p>
                    <div className="flex items-center gap-1">
                      {kpi.trendUp ? (
                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 text-red-600" />
                      )}
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          kpi.trendUp
                            ? 'text-green-600 border-green-200 bg-green-50'
                            : 'text-red-600 border-red-200 bg-red-50'
                        }`}
                      >
                        {kpi.trend}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Dashboards Grid */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Dashboards Disponibles</h2>
              <p className="text-gray-600">Accede a los diferentes paneles de análisis</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dashboards.map((dashboard) => (
                <Card
                  key={dashboard.title}
                  className={`${dashboard.color} border-2 hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        {dashboard.icon}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl text-gray-900">
                          {dashboard.title}
                        </CardTitle>
                        <CardDescription className="mt-2 text-gray-600">
                          {dashboard.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {dashboard.metrics.map((metric) => (
                          <Badge
                            key={metric}
                            variant="outline"
                            className="text-xs bg-white"
                          >
                            {metric}
                          </Badge>
                        ))}
                      </div>
                      <Button asChild className="w-full">
                        <Link href={dashboard.href}>
                          Ver Dashboard
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Reportes Recientes */}
          <section>
            <Card>
              <CardHeader>
                <CardTitle>Reportes Recientes</CardTitle>
                <CardDescription>
                  Accede a los reportes y análisis generados recientemente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportes.map((reporte) => (
                    <div
                      key={reporte.title}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {reporte.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{reporte.title}</h4>
                          <p className="text-sm text-gray-600">{reporte.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{reporte.period}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Ver Reporte
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Call to Action */}
          <section className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-3xl p-8 border border-purple-100">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  ¿Necesitas un análisis personalizado?
                </h3>
                <p className="text-gray-600">
                  Genera reportes customizados con las métricas específicas que necesitas
                </p>
              </div>
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              >
                <Link href="/zogen-kpis/analisis">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  Crear Reporte Personalizado
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
  );
}
