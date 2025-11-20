'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, ShoppingCart, Users } from 'lucide-react';

const SERVICES = [
  { id: 'gtrain-1600', nombre: 'Gtrain 1,600', precio: 1600, etapa: 'Cotización', probabilidad: 65 },
  { id: 'gtrain-1199', nombre: 'Gtrain 1,199', precio: 1199, etapa: 'Negociación', probabilidad: 45 },
  { id: 'gtrain-1160', nombre: 'Gtrain 1,160', precio: 1160, etapa: 'Cierre', probabilidad: 80 },
];

const KPI = [
  { label: 'Ingresos proyectados', value: '$1.2M MXN', icon: TrendingUp },
  { label: 'Órdenes activas', value: '23', icon: ShoppingCart },
  { label: 'Clientes estratégicos', value: '15', icon: Users },
];

export default function MedDevVentasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-600 font-semibold">Zogen Med Dev</p>
          <h1 className="text-3xl font-bold text-gray-900">Ventas · Equipos Médicos y Reactivos</h1>
          <p className="text-gray-600 mt-2">Pipeline enfocado en la familia Gtrain con visibilidad de ingresos y próximos pasos.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {KPI.map(({ label, value, icon: Icon }) => (
            <Card key={label} className="border-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">{label}</CardTitle>
                <Icon className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-semibold text-gray-900">{value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-purple-100">
          <CardHeader>
            <CardTitle>Negocios activos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {SERVICES.map((servicio) => (
              <div key={servicio.id} className="rounded-xl border border-purple-100 bg-white/80 p-4 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm uppercase tracking-wide text-purple-600 font-semibold">{servicio.nombre}</p>
                    <p className="text-2xl font-bold text-gray-900">${servicio.precio.toLocaleString('es-MX')} USD</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">{servicio.etapa}</Badge>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Probabilidad de cierre</span>
                    <span>{servicio.probabilidad}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-purple-100">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-purple-400 to-purple-600"
                      style={{ width: `${servicio.probabilidad}%` }}
                    />
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button variant="outline" size="sm">Ver detalle</Button>
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 text-white">Generar propuesta</Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
