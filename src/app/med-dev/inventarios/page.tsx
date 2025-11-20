'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const INVENTORY = [
  { almacen: 'CDMX - Central', producto: 'Gtrain 1,600', stock: 6, seguridad: 4 },
  { almacen: 'CDMX - Central', producto: 'Gtrain 1,199', stock: 4, seguridad: 5 },
  { almacen: 'Guadalajara', producto: 'Gtrain 1,160', stock: 3, seguridad: 2 },
  { almacen: 'Monterrey', producto: 'Refacciones Gtrain', stock: 21, seguridad: 15 },
];

export default function MedDevInventariosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-blue-600 font-semibold">Zogen Med Dev</p>
          <h1 className="text-3xl font-bold text-gray-900">Inventarios · Equipos y refacciones</h1>
          <p className="text-gray-600 mt-2">Monitoreo de stock por almacén, puntos de seguridad y alertas tempranas.</p>
        </div>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>Niveles por almacén</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {INVENTORY.map((item) => {
              const status = item.stock >= item.seguridad ? 'Óptimo' : 'Reabastecer';
              return (
                <div key={`${item.almacen}-${item.producto}`} className="rounded-lg border border-blue-100 bg-white/80 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">{item.almacen}</p>
                      <p className="text-lg font-semibold text-gray-900">{item.producto}</p>
                    </div>
                    <Badge className={status === 'Óptimo' ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}>
                      {status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg border border-blue-50 bg-blue-50/60 p-3">
                      <p className="text-xs text-gray-500">Stock disponible</p>
                      <p className="text-xl font-semibold text-gray-900">{item.stock} unidades</p>
                    </div>
                    <div className="rounded-lg border border-blue-50 bg-blue-50/60 p-3">
                      <p className="text-xs text-gray-500">Stock seguridad</p>
                      <p className="text-xl font-semibold text-gray-900">{item.seguridad}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
