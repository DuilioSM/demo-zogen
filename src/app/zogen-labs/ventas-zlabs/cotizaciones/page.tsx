import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Receipt, Send, FileText } from 'lucide-react';

const QUOTES = [
  {
    id: 'QT-1201',
    insurer: 'GNP Seguros',
    patient: 'María González',
    study: 'Oncogenómico integral',
    amount: '$68,500',
    status: 'Enviada',
    updatedAt: 'Hace 2 horas',
  },
  {
    id: 'QT-1194',
    insurer: 'MetLife',
    patient: 'Carlos Medina',
    study: 'Panel cáncer de mama',
    amount: '$42,000',
    status: 'Pendiente de carta pase',
    updatedAt: 'Hace 5 horas',
  },
  {
    id: 'QT-1188',
    insurer: 'AXA',
    patient: 'Ana Domínguez',
    study: 'Panel ginecológico',
    amount: '$37,800',
    status: 'Aprobada',
    updatedAt: 'Ayer',
  },
  {
    id: 'QT-1182',
    insurer: 'Seguros Monterrey',
    patient: 'Ricardo Núñez',
    study: 'Panel próstata',
    amount: '$40,600',
    status: 'En validación',
    updatedAt: 'Ayer',
  },
];

const STATUS_VARIANTS: Record<string, { label: string; className: string }> = {
  Enviada: { label: 'Enviada', className: 'bg-blue-100 text-blue-700' },
  'Pendiente de carta pase': { label: 'Pendiente', className: 'bg-amber-100 text-amber-700' },
  Aprobada: { label: 'Aprobada', className: 'bg-emerald-100 text-emerald-700' },
  'En validación': { label: 'En validación', className: 'bg-purple-100 text-purple-700' },
};

export default function CotizacionesPage() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-purple-600 uppercase">CRM Zogen</p>
          <h1 className="text-3xl font-bold text-gray-900">Cotizaciones enviadas a aseguradoras</h1>
          <p className="text-gray-600">
            Seguimiento de expedientes con aseguradoras, estado de carta pase y próximos pasos.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUOTES.map((quote) => {
            const badge = STATUS_VARIANTS[quote.status] ?? STATUS_VARIANTS['En validación'];
            return (
              <Card key={quote.id} className="shadow-sm border border-gray-100">
                <CardHeader className="space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-900 flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-purple-600" />
                      {quote.id}
                    </CardTitle>
                    <Badge className={`${badge.className} border-none`}>{badge.label}</Badge>
                  </div>
                  <CardDescription className="text-sm text-gray-600">
                    Aseguradora: <span className="font-medium text-gray-900">{quote.insurer}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-gray-600">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Paciente</p>
                      <p className="text-base font-semibold text-gray-900">{quote.patient}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Estudio</p>
                      <p className="text-base font-semibold text-gray-900">{quote.study}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Monto</p>
                      <p className="text-lg font-bold text-gray-900">{quote.amount}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">Última actualización</p>
                      <p className="text-base font-semibold text-gray-900">{quote.updatedAt}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button variant="outline" className="flex-1">
                      <FileText className="mr-2 h-4 w-4" />
                      Ver expediente
                    </Button>
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                      <Send className="mr-2 h-4 w-4" />
                      Reenviar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
