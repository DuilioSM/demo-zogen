'use client';

import { useMemo, use } from 'react';
import { notFound } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  AreaChart,
  Area,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useKpisData, type KpiScopeKey, type MonthlyPoint, type BreakdownPoint, type KpiAggregate } from '@/hooks/useKpisData';

const currencyFormatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
});
const PIE_COLORS = ['#7c3aed', '#4c1d95', '#0f766e', '#0369a1'];

const ROUTE_SCOPE_MAP = {
  'generales': {
    scope: 'general' as KpiScopeKey,
    label: 'Consolidado General',
    description: 'Reportes que agrupan toda la operación de Zogen.',
    reports: {
      'reporte-financiero': {
        title: 'Reporte Financiero',
        description: 'Ingresos, costos y gastos consolidados.',
        trendTitle: 'Histórico financiero consolidado',
        breakdownTitle: 'Distribución de ingresos por unidad',
        type: 'financiero' as ReportType,
      },
      'reporte-ytd': {
        title: 'Reporte YTD',
        description: 'Avance del año contra metas previstas.',
        trendTitle: 'Comportamiento mensual YTD',
        breakdownTitle: 'Origen de ingresos acumulados',
        type: 'ytd' as ReportType,
      },
      'reporte-ingresos': {
        title: 'Reporte de Ingresos',
        description: 'Detalle de ingresos por línea de negocio.',
        trendTitle: 'Ingresos mensuales',
        breakdownTitle: 'Peso relativo por unidad',
        type: 'ingresos' as ReportType,
      },
    },
  },
  'zogen-labs': {
    scope: 'labs' as KpiScopeKey,
    label: 'Zogen Labs',
    description: 'Dashboards enfocados en la operación de laboratorio.',
    reports: {
      'reporte-financiero': {
        title: 'Reporte Financiero Labs',
        description: 'Seguimiento financiero de servicios Labs.',
        trendTitle: 'Histórico financiero',
        breakdownTitle: 'Ingresos por tipo de pago',
        type: 'financiero' as ReportType,
      },
      'reporte-ytd': {
        title: 'Reporte YTD Labs',
        description: 'Ejecución acumulada del año en curso.',
        trendTitle: 'Avance mensual',
        breakdownTitle: 'Participación por canal',
        type: 'ytd' as ReportType,
      },
      'reporte-ingresos': {
        title: 'Reporte de Ingresos Labs',
        description: 'Análisis de facturación por canal.',
        trendTitle: 'Ingresos mensuales',
        breakdownTitle: 'Distribución por segmento',
        type: 'ingresos' as ReportType,
      },
      'reporte-kpis': {
        title: 'Reporte de KPIs Labs',
        description: 'Indicadores clave de operación y ventas.',
        trendTitle: 'VT facturadas vs costos',
        breakdownTitle: 'Participación por método de pago',
        type: 'labs-kpis' as ReportType,
      },
      'reporte-cobranza': {
        title: 'Reporte de Cobranza',
        description: 'Estado de cobranza por estatus.',
        trendTitle: 'Cobranza mensual',
        breakdownTitle: 'Distribución por estatus',
        type: 'cobranza' as ReportType,
        mode: 'cobranza' as const,
      },
    },
  },
  'zogen-meddev': {
    scope: 'meddev' as KpiScopeKey,
    label: 'Zogen MedDev',
    description: 'Dashboards financieros de la unidad MedDev.',
    reports: {
      'reporte-financiero': {
        title: 'Reporte Financiero MedDev',
        description: 'Comportamiento financiero de equipo médico y reactivos.',
        trendTitle: 'Histórico financiero',
        breakdownTitle: 'Ingresos por categoría',
        type: 'financiero' as ReportType,
      },
      'reporte-ytd': {
        title: 'Reporte YTD MedDev',
        description: 'Desempeño acumulado vs meta anual.',
        trendTitle: 'Ingresos acumulados',
        breakdownTitle: 'Participación por producto',
        type: 'ytd' as ReportType,
      },
      'reporte-ingresos': {
        title: 'Reporte de Ingresos MedDev',
        description: 'Detalle de ingresos por tipo de venta.',
        trendTitle: 'Ingresos mensuales',
        breakdownTitle: 'Peso por categoría',
        type: 'ingresos' as ReportType,
      },
    },
  },
} as const;

type RouteScopeKey = keyof typeof ROUTE_SCOPE_MAP;

type ReportType = 'financiero' | 'ytd' | 'ingresos' | 'cobranza' | 'labs-kpis' | 'default';

type ReportConfig = {
  title: string;
  description: string;
  trendTitle: string;
  breakdownTitle: string;
  mode?: 'default' | 'cobranza';
  type?: ReportType;
};

type LabsHighlights = {
  vendedores: { name: string; value: string }[];
  doctores: { name: string; value: string }[];
  estudios: { name: string; value: string }[];
};

type KpiPageProps = {
  params: Promise<{ scope: string; report?: string[] }>;
};

export default function KpiScopePage({ params }: KpiPageProps) {
  const resolvedParams = use(params);
  const routeScope = resolvedParams.scope as RouteScopeKey;
  const scopeEntry = ROUTE_SCOPE_MAP[routeScope];
  if (!scopeEntry) {
    notFound();
  }

  const reportSlug = resolvedParams.report?.[0] ?? 'reporte-financiero';
  const reportConfig = scopeEntry.reports[reportSlug as keyof typeof scopeEntry.reports] as ReportConfig | undefined;

  if (!reportConfig) {
    notFound();
  }

  const { data, loading, highlights } = useKpisData();
  const scopeData = data[scopeEntry.scope];

  const cards = useMemo(() => buildScorecards(scopeData, reportConfig), [scopeData, reportConfig]);

  const breakdownData = reportConfig.mode === 'cobranza'
    ? buildCobranzaBreakdown(scopeData)
    : scopeData.breakdown;

  const reportType: ReportType = reportConfig.type ?? (reportConfig.mode === 'cobranza' ? 'cobranza' : 'default');

  const renderContent = () => {
    if (loading) {
      return (
        <Card>
          <CardContent className="py-10 text-center text-gray-500">
            Cargando información financiera...
          </CardContent>
        </Card>
      );
    }

    switch (reportType) {
      case 'financiero':
        return <FinancialReportSection data={scopeData} title={reportConfig.trendTitle} subtitle={reportConfig.breakdownTitle} />;
      case 'ytd':
        return <YtdReportSection data={scopeData} title={reportConfig.trendTitle} />;
      case 'ingresos':
        return (
          <IncomeReportSection
            scopeKey={routeScope}
            scopeData={scopeData}
            allData={data}
            title={reportConfig.breakdownTitle}
            trendTitle={reportConfig.trendTitle}
          />
        );
      case 'labs-kpis':
        return <LabsKpisSection highlights={highlights?.labs} />;
      case 'cobranza':
        return <CobranzasSection data={scopeData} />;
      default:
        return (
          <DefaultReportSection
            cards={cards}
            trendTitle={reportConfig.trendTitle}
            breakdownTitle={reportConfig.breakdownTitle}
            chartData={scopeData.monthly}
            breakdownData={breakdownData}
            mode={reportConfig.mode}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col gap-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-purple-600 font-semibold">Zogen KPIs</p>
              <h1 className="text-3xl font-bold text-gray-900">{reportConfig.title}</h1>
              <p className="text-gray-600 mt-1">{reportConfig.description}</p>
            </div>
            <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
              {scopeEntry.label}
            </Badge>
          </div>
        </header>

        {renderContent()}
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return '$0';
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(1)}K`;
  }
  return currencyFormatter.format(value);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return '0%';
  return `${value.toFixed(1)}%`;
}

type ScoreCard = {
  label: string;
  value: string;
  helper: string;
};

function buildScorecards(scopeData: KpiAggregate, config: ReportConfig): ScoreCard[] {
  const monthly = scopeData.monthly;
  const last = monthly[monthly.length - 1];
  const prev = monthly[monthly.length - 2];
  const ingresoTrend = last && prev && prev.ingresos > 0 ? ((last.ingresos - prev.ingresos) / prev.ingresos) * 100 : 0;
  const gastoTrend = last && prev && prev.gastos > 0 ? ((last.gastos - prev.gastos) / prev.gastos) * 100 : 0;

  const cards: ScoreCard[] = [
    {
      label: 'Ingresos acumulados',
      value: formatCurrency(scopeData.ingresos),
      helper: ingresoTrend === 0 ? 'Sin variación vs mes anterior' : `${ingresoTrend > 0 ? '+' : ''}${ingresoTrend.toFixed(1)}% vs mes anterior`,
    },
    {
      label: 'Gastos operativos',
      value: formatCurrency(scopeData.gastos),
      helper: gastoTrend === 0 ? 'Sin variación vs mes anterior' : `${gastoTrend > 0 ? '+' : ''}${gastoTrend.toFixed(1)}% vs mes anterior`,
    },
    {
      label: 'Utilidad neta',
      value: formatCurrency(scopeData.utilidad),
      helper: `Margen ${formatPercent(scopeData.margen)}`,
    },
    {
      label: 'Ticket promedio',
      value: scopeData.operaciones > 0 ? formatCurrency(scopeData.ingresoPromedio) : '$0',
      helper: `${scopeData.operaciones} operaciones registradas`,
    },
  ];

  if (config.mode === 'cobranza' && scopeData.cobranzas) {
    const totalDocs = scopeData.cobranzas.pendientes + scopeData.cobranzas.pagados + scopeData.cobranzas.vencidos;
    const tasa = totalDocs > 0 ? (scopeData.cobranzas.pagados / totalDocs) * 100 : 0;
    cards[cards.length - 1] = {
      label: 'Tasa de Cobranza',
      value: formatPercent(tasa),
      helper: `${scopeData.cobranzas.pagados} pagadas · ${scopeData.cobranzas.pendientes} pendientes`,
    };
  }

  return cards;
}

function ScorecardGrid({ cards }: { cards: ScoreCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label} className="border-purple-100 bg-white/90">
          <CardHeader>
            <CardTitle className="text-xs font-medium text-gray-500 uppercase tracking-wide">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-2">{card.helper}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function TrendChart({ title, data }: { title: string; data: MonthlyPoint[] }) {
  const chartData = data.map((point) => ({
    name: point.label,
    ingresos: point.ingresos,
    gastos: point.gastos,
    utilidad: point.ingresos - point.gastos,
  }));

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay suficientes movimientos para graficar.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => formatCurrency(value)} width={90} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="ingresos" name="Ingresos" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="gastos" name="Gastos" fill="#fb7185" radius={[4, 4, 0, 0]} />
              <Line dataKey="utilidad" name="Utilidad" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function buildCobranzaBreakdown(scopeData: KpiAggregate): BreakdownPoint[] {
  if (!scopeData.cobranzas) return [];
  return [
    { label: 'Pagadas', value: scopeData.cobranzas.montoPagado },
    { label: 'Pendientes', value: scopeData.cobranzas.montoPendiente },
    { label: 'Vencidas', value: scopeData.cobranzas.montoVencido },
  ];
}

function BreakdownChart({ title, data, mode = 'default' }: { title: string; data: BreakdownPoint[]; mode?: 'default' | 'cobranza' }) {
  const chartData = data.map((item) => ({
    name: item.label,
    valor: item.value,
  }));
  const barColor = mode === 'cobranza' ? '#10b981' : '#7c3aed';

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay registros suficientes.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 20, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
              <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="valor" fill={barColor} radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function DefaultReportSection({
  cards,
  trendTitle,
  breakdownTitle,
  chartData,
  breakdownData,
  mode,
}: {
  cards: ScoreCard[];
  trendTitle: string;
  breakdownTitle: string;
  chartData: MonthlyPoint[];
  breakdownData: BreakdownPoint[];
  mode?: 'default' | 'cobranza';
}) {
  return (
    <div className="space-y-6">
      <ScorecardGrid cards={cards} />
      <div className="grid gap-4 md:grid-cols-2">
        <TrendChart title={trendTitle} data={chartData} />
        <BreakdownChart title={breakdownTitle} data={breakdownData} mode={mode} />
      </div>
    </div>
  );
}

function LabsKpisSection({ highlights }: { highlights?: LabsHighlights }) {
  const data = highlights ?? {
    vendedores: [
      { name: 'Sonia Cruz', value: '58 VT' },
      { name: 'Luis Hernández', value: '52 VT' },
      { name: 'Ana Velasco', value: '46 VT' },
    ],
    doctores: [
      { name: 'Dr. Martínez', value: '34 VT' },
      { name: 'Dra. López', value: '31 VT' },
      { name: 'Dr. Camacho', value: '28 VT' },
    ],
    estudios: [
      { name: 'Perfil oncológico', value: '42 VT' },
      { name: 'Panel inmunológico', value: '36 VT' },
      { name: 'Perfil metabólico', value: '28 VT' },
    ],
  };

  const parseValue = (value: string) => {
    const numeric = parseInt(value.replace(/[^0-9]/g, ''), 10);
    return Number.isFinite(numeric) ? numeric : 0;
  };

  const vendedoresData = data.vendedores.map((item) => ({ name: item.name, value: parseValue(item.value) }));
  const estudiosData = data.estudios.map((item) => ({ name: item.name, value: parseValue(item.value) }));

  const sections = [
    { title: 'Top vendedores', items: data.vendedores },
    { title: 'Top doctores', items: data.doctores },
    { title: 'Top estudios', items: data.estudios },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {sections.map((section) => (
          <Card key={section.title} className="border-purple-100">
            <CardHeader>
              <CardTitle>{section.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {section.items.map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded-xl border border-purple-50 px-3 py-2">
                  <span className="font-medium text-gray-900">{item.name}</span>
                  <span className="text-sm text-gray-500">{item.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle>Distribución por vendedor</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vendedoresData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value} VT`} />
                <Tooltip formatter={(value: number) => `${value} VT`} />
                <Bar dataKey="value" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle>Estudios con mayor demanda</CardTitle>
          </CardHeader>
          <CardContent className="h-64 pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={estudiosData}>
                <defs>
                  <linearGradient id="estudiosGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => `${value} VT`} />
                <Tooltip formatter={(value: number) => `${value} VT`} />
                <Area type="monotone" dataKey="value" stroke="#4338ca" fill="url(#estudiosGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CobranzasSection({ data }: { data: KpiAggregate }) {
  const cobranzas = data.cobranzas ?? {
    pendientes: 0,
    pagados: 0,
    vencidos: 0,
    montoPendiente: 0,
    montoPagado: 0,
    montoVencido: 0,
  };

  const cards: ScoreCard[] = [
    {
      label: 'Monto pendiente',
      value: formatCurrency(cobranzas.montoPendiente),
      helper: `${cobranzas.pendientes} documentos`,
    },
    {
      label: 'Monto cobrado',
      value: formatCurrency(cobranzas.montoPagado),
      helper: `${cobranzas.pagados} documentos`,
    },
    {
      label: 'Monto vencido',
      value: formatCurrency(cobranzas.montoVencido),
      helper: `${cobranzas.vencidos} documentos`,
    },
    {
      label: 'Tasa vencida',
      value: formatPercent(data.cartera?.porcentajeVencido ?? 0),
      helper: 'Participación cartera vencida',
    },
  ];

  const radiografia = [
    { label: 'Tiempo promedio orden', value: `${data.cartera?.diasOrden ?? 0} días` },
    { label: 'Tiempo promedio cobranza', value: `${data.cartera?.diasCobranza ?? 0} días` },
  ];

  return (
    <div className="space-y-6">
      <ScorecardGrid cards={cards} />
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle>Radiografía de cartera</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {radiografia.map((row) => (
              <div key={row.label} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                <span className="text-sm text-gray-500">{row.label}</span>
                <span className="font-semibold text-gray-900">{row.value}</span>
              </div>
            ))}
          </CardContent>
        </Card>
        <BreakdownChart title="Composición por estatus" data={buildCobranzaBreakdown(data)} mode="cobranza" />
      </div>
    </div>
  );
}

function FinancialReportSection({ data, title, subtitle }: { data: KpiAggregate; title: string; subtitle: string }) {
  const { costos, gastosOperativos } = deriveCostStructure(data);
  const utilidadBruta = data.ingresos - costos;
  const utilidadOperativa = utilidadBruta - gastosOperativos;
  const monthly = data.monthly.slice(-6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="Ingresos" value={formatCurrency(data.ingresos)} helper="Acumulado del periodo" />
        <MetricCard label="Costos" value={formatCurrency(costos)} helper="Costos directos de operación" />
        <MetricCard label="Gastos operativos" value={formatCurrency(gastosOperativos)} helper="Administración y logística" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StackedMonthlyChart title={title} data={monthly} />
        <NetIncomeChart title="Tendencia de utilidad" data={monthly} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <MetricCard label="Utilidad bruta" value={formatCurrency(utilidadBruta)} helper="Ingresos - Costos" />
        <MetricCard label="Utilidad operativa" value={formatCurrency(utilidadOperativa)} helper="Bruta - Gastos operativos" />
      </div>
    </div>
  );
}

function YtdReportSection({ data, title }: { data: KpiAggregate; title: string }) {
  const monthlyCosts = data.monthly.map(splitMonthlyCosts);
  const ingresosSeries = buildYtdSeries(data.monthly.map((point) => point.ingresos), data.monthly.map((point) => point.label), 1.05);
  const costosSeries = buildYtdSeries(monthlyCosts.map((point) => point.costo), data.monthly.map((point) => point.label), 0.95);
  const gastosSeries = buildYtdSeries(monthlyCosts.map((point) => point.operativo), data.monthly.map((point) => point.label), 0.9);

  const rows = [
    {
      label: 'Ingresos',
      value: data.ingresos,
      helper: 'Real acumulado',
      color: '#7c3aed',
      data: ingresosSeries,
    },
    {
      label: 'Costos',
      value: costosSeries.reduce((acc, point) => acc + point.real, 0),
      helper: 'Costos directos',
      color: '#38bdf8',
      data: costosSeries,
    },
    {
      label: 'Gastos',
      value: gastosSeries.reduce((acc, point) => acc + point.real, 0),
      helper: 'Gastos operativos',
      color: '#fb7185',
      data: gastosSeries,
    },
  ];

  return (
    <div className="space-y-6">
      {rows.map((row) => (
        <YtdMetricRow key={row.label} metric={row} />
      ))}
      <YtdBudgetChart title={title} data={ingresosSeries} />
    </div>
  );
}

type YtdChartPoint = {
  label: string;
  real: number;
  meta: number;
  acumulado: number;
};

function buildYtdSeries(values: number[], labels: string[], metaFactor: number): YtdChartPoint[] {
  if (values.length === 0) return [];
  const average = values.reduce((acc, value) => acc + value, 0) / values.length || 0;
  const metaMensual = average * metaFactor;
  let acumulado = 0;
  return labels.map((label, index) => {
    const real = values[index] ?? 0;
    acumulado += real;
    return {
      label,
      real,
      meta: metaMensual,
      acumulado,
    };
  });
}

function YtdMetricRow({ metric }: { metric: { label: string; value: number; helper: string; color: string; data: YtdChartPoint[] } }) {
  return (
    <div className="grid gap-4 md:grid-cols-[220px,1fr] items-stretch">
      <MetricCard label={metric.label} value={formatCurrency(metric.value)} helper={metric.helper} />
      <Card className="border-purple-100">
        <CardContent className="h-56 pt-6">
          {metric.data.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no hay datos suficientes.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={metric.data} margin={{ left: 4, right: 12 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="real" name="Real" fill={metric.color} radius={[4, 4, 0, 0]} />
                <Bar dataKey="meta" name="Meta" fill="#cbd5f5" radius={[4, 4, 0, 0]} />
                <Line dataKey="acumulado" name="Acumulado" stroke="#0f172a" strokeWidth={2} dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function IncomeReportSection({
  scopeKey,
  scopeData,
  allData,
  title,
  trendTitle,
}: {
  scopeKey: RouteScopeKey;
  scopeData: KpiAggregate;
  allData: ReturnType<typeof useKpisData>['data'];
  title: string;
  trendTitle: string;
}) {
  const composition = buildIncomeComposition(scopeKey, scopeData, allData);
  const incomeCards: ScoreCard[] = [
    {
      label: 'Ingresos totales',
      value: formatCurrency(composition.total),
      helper: 'Distribución por línea',
    },
    ...composition.categories.map((category) => ({
      label: category.label,
      value: formatCurrency(category.value),
      helper:
        composition.total > 0
          ? `${((category.value / composition.total) * 100).toFixed(1)}% del total`
          : '0% del total',
    })),
  ];

  return (
    <div className="space-y-6">
      <ScorecardGrid cards={incomeCards} />
      <div className="grid gap-4 md:grid-cols-2">
        <IncomePieChart title={title} categories={composition.categories} />
        <IncomeHistoryChart title={trendTitle} data={scopeData.monthly} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, helper }: { label: string; value: string; helper: string }) {
  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle className="text-xs text-gray-500 uppercase tracking-wide">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-2">{helper}</p>
      </CardContent>
    </Card>
  );
}

function StackedMonthlyChart({ title, data }: { title: string; data: MonthlyPoint[] }) {
  const chartData = data.map((point) => {
    const { costo, operativo } = splitMonthlyCosts(point);
    return {
      name: point.label,
      ingresos: point.ingresos,
      costo,
      operativo,
    };
  });

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay datos suficientes.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="ingresos" name="Ingresos" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costo" name="Costos" stackId="gastos" fill="#60a5fa" radius={[4, 4, 0, 0]} />
              <Bar dataKey="operativo" name="Gastos operativos" stackId="gastos" fill="#fb7185" radius={[4, 4, 0, 0]} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

function NetIncomeChart({ title, data }: { title: string; data: MonthlyPoint[] }) {
  const chartData = data.map((point) => ({ name: point.label, utilidad: point.ingresos - point.gastos }));
  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay datos suficientes.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ left: 4, right: 12 }}>
              <defs>
                <linearGradient id="netGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Area type="monotone" dataKey="utilidad" stroke="#4338ca" strokeWidth={2} fill="url(#netGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}


function YtdBudgetChart({ title, data }: { title: string; data: YtdChartPoint[] }) {
  const chartData = data.map((point) => ({
    name: point.label,
    real: point.real,
    meta: point.meta,
    acumulado: point.acumulado,
  }));

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-72">
        {chartData.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay datos suficientes.</p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ left: 4, right: 12 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(value) => formatCurrency(value)} width={90} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="real" name="Real" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" name="Meta" fill="#cbd5f5" radius={[4, 4, 0, 0]} />
              <Line dataKey="acumulado" name="Acumulado" stroke="#0ea5e9" strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

type IncomeComposition = {
  total: number;
  categories: { label: string; value: number }[];
};

function buildIncomeComposition(scopeKey: RouteScopeKey, scopeData: KpiAggregate, allData: ReturnType<typeof useKpisData>['data']): IncomeComposition {
  if (scopeKey === 'generales') {
    const labsIncome = allData.labs.ingresos;
    const meddevIncome = allData.meddev.ingresos;
    const sangre = labsIncome * 0.5;
    const tejido = labsIncome * 0.3;
    const equipos = meddevIncome + Math.max(0, labsIncome - sangre - tejido);
    const total = sangre + tejido + equipos;
    return {
      total,
      categories: [
        { label: 'Estudios de sangre', value: sangre },
        { label: 'Estudios de tejido', value: tejido },
        { label: 'Equipo médico y reactivos', value: equipos },
      ],
    };
  }

  const categories = scopeData.breakdown.length > 0
    ? scopeData.breakdown
    : [{ label: 'Ingresos', value: scopeData.ingresos }];

  return {
    total: scopeData.ingresos,
    categories,
  };
}

function IncomePieChart({ title, categories }: { title: string; categories: { label: string; value: number }[] }) {
  const total = categories.reduce((acc, item) => acc + item.value, 0);
  const segments = categories.reduce<{ label: string; value: number; color: string; start: number; end: number }[]>((acc, item, index) => {
    const prev = acc[index - 1]?.end ?? 0;
    const percentage = total > 0 ? (item.value / total) * 100 : 0;
    const colorPalette = ['#7c3aed', '#4c1d95', '#0f766e', '#0369a1'];
    acc.push({ label: item.label, value: item.value, color: colorPalette[index % colorPalette.length], start: prev, end: prev + percentage });
    return acc;
  }, []);

  const gradient = segments.map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`).join(', ');

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-around gap-6">
        <div
          className="w-40 h-40 rounded-full"
          style={{ background: total > 0 ? `conic-gradient(${gradient})` : '#e5e7eb' }}
        />
        <div className="space-y-2 text-sm text-gray-600">
          {segments.map((segment) => (
            <div key={segment.label} className="flex items-center gap-2">
              <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: segment.color }} />
              <div>
                <p className="font-semibold text-gray-900">{segment.label}</p>
                <p>{formatCurrency(segment.value)} ({total > 0 ? ((segment.value / total) * 100).toFixed(1) : '0'}%)</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function IncomeHistoryChart({ title, data }: { title: string; data: MonthlyPoint[] }) {
  const cumulative = [] as { label: string; value: number }[];
  let running = 0;
  data.forEach((point) => {
    running += point.ingresos;
    cumulative.push({ label: point.label, value: running });
  });
  const max = Math.max(...data.map((p) => p.ingresos), 1);
  const maxCumulative = Math.max(...cumulative.map((p) => p.value), 1);

  return (
    <Card className="border-purple-100">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-gray-500">Aún no hay datos suficientes.</p>
        ) : (
          <div className="space-y-4">
            {data.map((point, index) => (
              <div key={point.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{point.label}</span>
                  <span>{formatCurrency(point.ingresos)}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-2 rounded-full bg-gradient-to-r from-indigo-400 to-indigo-600"
                    style={{ width: `${(point.ingresos / max) * 100}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>Acumulado</span>
                  <span>{formatCurrency(cumulative[index].value)}</span>
                </div>
                <div className="h-1 rounded-full bg-slate-100">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                    style={{ width: `${(cumulative[index].value / maxCumulative) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function deriveCostStructure(data: KpiAggregate) {
  const costos = Math.max(0, data.gastos * 0.7);
  const gastosOperativos = Math.max(0, data.gastos - costos);
  return { costos, gastosOperativos };
}

function splitMonthlyCosts(point: MonthlyPoint) {
  const costo = Math.max(0, point.gastos * 0.7);
  const operativo = Math.max(0, point.gastos - costo);
  return { costo, operativo };
}
