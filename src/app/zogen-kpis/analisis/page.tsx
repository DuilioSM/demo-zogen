'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const generalScores = [
  { label: 'Ingresos acumulados', value: '$8.4M MXN', helper: '+12% vs 2023' },
  { label: 'Gastos operativos', value: '$5.2M MXN', helper: 'Plan: $5.5M' },
  { label: 'Utilidad neta', value: '$3.2M MXN', helper: 'Margen 38%' },
  { label: 'Cumplimiento presupuesto', value: '42%', helper: 'Objetivo anual $20M' },
];

const labsScores = [
  { label: 'Ingresos Labs', value: '$6.3M MXN', helper: '+15% vs 2023' },
  { label: 'Gastos Labs', value: '$3.8M MXN', helper: 'Logística + comisiones' },
  { label: 'Utilidad Labs', value: '$2.5M MXN', helper: 'Margen 39%' },
  { label: 'VT generadas', value: '198', helper: 'Meta anual 420' },
];

const medDevScores = [
  { label: 'Ingresos Med Dev', value: '$2.1M MXN', helper: '+8% vs mes anterior' },
  { label: 'Gastos Med Dev', value: '$1.4M MXN', helper: 'Inventario y logística' },
  { label: 'Utilidad Med Dev', value: '$700K MXN', helper: 'Margen 33%' },
  { label: 'Cumplimiento objetivo', value: '38%', helper: 'Plan anual $5.5M' },
];

const generalCharts = [
  {
    title: '** Reporte Financiero',
    data: [
      { label: 'Ingresos', value: 84 },
      { label: 'Gastos', value: 52 },
      { label: 'Utilidad', value: 32 },
    ],
  },
  {
    title: '** Reporte YTD',
    data: [
      { label: 'Presupuesto', value: 100 },
      { label: 'YTD real', value: 42 },
    ],
  },
  {
    title: '** Reporte Ingresos (Líneas)',
    data: [
      { label: 'Labs', value: 75 },
      { label: 'Med Dev', value: 25 },
    ],
  },
];

const labsCharts = [
  {
    title: '** Reporte Financiero',
    data: [
      { label: 'Ingresos', value: 63 },
      { label: 'Gastos', value: 38 },
      { label: 'Utilidad', value: 25 },
    ],
  },
  {
    title: '** Reporte YTD',
    data: [
      { label: 'Meta VT', value: 100 },
      { label: 'VT reales', value: 47 },
    ],
  },
  {
    title: '** Desglose Ingresos',
    data: [
      { label: 'Aseguradoras', value: 59 },
      { label: 'Bolsillo', value: 41 },
    ],
  },
];

const labsKPIs = [
  { label: 'Top Vendedores', value: 'Sonia Cruz · 58 VT' },
  { label: 'Top Doctores', value: 'Dr. Martínez · 34 VT' },
  { label: 'Tiempo promedio VT', value: '6.5 días' },
];

const medDevCharts = [
  {
    title: '** Reporte Financiero',
    data: [
      { label: 'Ingresos', value: 21 },
      { label: 'Gastos', value: 14 },
      { label: 'Utilidad', value: 7 },
    ],
  },
  {
    title: '** Reporte YTD',
    data: [
      { label: 'Plan anual', value: 100 },
      { label: 'Avance', value: 38 },
    ],
  },
  {
    title: '** Desglose Ingresos',
    data: [
      { label: 'Equipos Gtrain', value: 76 },
      { label: 'Refacciones', value: 24 },
    ],
  },
];

function ScoreGrid({ scores }: { scores: { label: string; value: string; helper: string }[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {scores.map((score) => (
        <Card key={score.label} className="border-purple-100">
          <CardHeader>
            <CardTitle className="text-xs text-gray-500">{score.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">{score.value}</p>
            <p className="text-xs text-gray-500 mt-1">{score.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ChartCard({ title, data }: { title: string; data: { label: string; value: number }[] }) {
  const maxValue = Math.max(...data.map((item) => item.value), 1);
  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>{item.label}</span>
              <span>{item.value}%</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-purple-50">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                style={{ width: `${(item.value / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default function AnalisisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-600 font-semibold">Zogen Análisis</p>
          <h1 className="text-3xl font-bold text-gray-900">Reportes financieros y operativos</h1>
          <p className="text-gray-600 mt-2">Cada pestaña representa una sección principal (*) con sus dashboards (**) formados por scorecards y gráficas de referencia.</p>
        </div>

        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="labs">Zogen Labs</TabsTrigger>
            <TabsTrigger value="meddev">Zogen Med Dev</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6 pt-4">
            <p className="text-sm text-gray-600">* Reportes Zogen (General)</p>
            <ScoreGrid scores={generalScores} />
            <div className="grid gap-4 md:grid-cols-3">
              {generalCharts.map((chart) => (
                <ChartCard key={chart.title} title={chart.title} data={chart.data} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="labs" className="space-y-6 pt-4">
            <p className="text-sm text-gray-600">* Reportes Zogen Labs</p>
            <ScoreGrid scores={labsScores} />
            <div className="grid gap-4 md:grid-cols-3">
              {labsCharts.map((chart) => (
                <ChartCard key={chart.title} title={chart.title} data={chart.data} />
              ))}
            </div>
            <Card className="border-purple-100">
              <CardHeader>
                <CardTitle>** Reporte KPI&apos;s</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                {labsKPIs.map((kpi) => (
                  <div key={kpi.label} className="rounded-lg border border-purple-100 bg-white/80 p-3">
                    <p className="text-xs text-gray-500">{kpi.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{kpi.value}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meddev" className="space-y-6 pt-4">
            <p className="text-sm text-gray-600">* Reportes Zogen Med Dev</p>
            <ScoreGrid scores={medDevScores} />
            <div className="grid gap-4 md:grid-cols-3">
              {medDevCharts.map((chart) => (
                <ChartCard key={chart.title} title={chart.title} data={chart.data} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
