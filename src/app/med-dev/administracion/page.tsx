'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ClipboardList, ShieldCheck } from 'lucide-react';

const WORK_ORDERS = [
  { id: 'OC-4821', cliente: 'Hospital Central Sur', servicio: 'Gtrain 1,600', estado: 'Instalación programada', fecha: '2024-11-25' },
  { id: 'OC-4828', cliente: 'Centro Oncológico Monterrey', servicio: 'Gtrain 1,199', estado: 'Calibración en sitio', fecha: '2024-11-26' },
  { id: 'OC-4830', cliente: 'Clínica Norte', servicio: 'Gtrain 1,160', estado: 'Entrega en tránsito', fecha: '2024-11-27' },
];

const SLA = [
  { label: 'Instalaciones a tiempo', value: '92%', trend: '+4% vs mes anterior' },
  { label: 'Casos críticos', value: '2', trend: 'Prioridad alta' },
  { label: 'Clientes activos con servicio', value: '37', trend: '5 mantenimientos esta semana' },
];

export default function MedDevAdministracionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">Zogen Med Dev</p>
          <h1 className="text-3xl font-bold text-gray-900">Administración · Órdenes y Servicio</h1>
          <p className="text-gray-600 mt-2">Control operativo de equipos, instalaciones y pólizas activas.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {SLA.map((item) => (
            <Card key={item.label} className="border-emerald-100">
              <CardHeader>
                <CardTitle className="text-sm text-gray-500">{item.label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                <p className="text-xs text-emerald-700 mt-1">{item.trend}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-emerald-100">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Órdenes de trabajo activas</CardTitle>
              <p className="text-sm text-gray-500">Seguimiento diario de instalaciones y servicios.</p>
            </div>
            <Button variant="outline" className="border-emerald-200 text-emerald-700">Crear orden</Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {WORK_ORDERS.map((order) => (
              <div key={order.id} className="rounded-xl border border-emerald-100 bg-white/80 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-600 font-semibold">{order.id}</p>
                    <p className="text-lg font-semibold text-gray-900">{order.cliente}</p>
                    <p className="text-sm text-gray-500">{order.servicio}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-100 text-emerald-700">{order.estado}</Badge>
                    <p className="text-xs text-gray-500 mt-1">{new Date(order.fecha).toLocaleDateString('es-MX')}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                  <ClipboardList className="h-4 w-4 text-emerald-500" />
                  Orden pendiente de confirmación logística.
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardHeader>
            <CardTitle>Pólizas de mantenimiento</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {[1, 2].map((idx) => (
              <div key={idx} className="rounded-lg border border-dashed border-emerald-200 p-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Cobertura trimestral #{idx}</p>
                    <p className="text-xs text-gray-500">Incluye refacciones y soporte remoto.</p>
                  </div>
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Cliente: Hospital Referencia #{idx}<br />
                  Equipos: 3 unidades Gtrain<br />
                  Próxima visita: {new Date(Date.now() + idx * 7 * 86400000).toLocaleDateString('es-MX')}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
