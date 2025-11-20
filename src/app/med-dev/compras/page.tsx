'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Truck, DollarSign } from 'lucide-react';

const PURCHASES = [
  { folio: 'PO-1201', proveedor: 'Foundation Supply', producto: 'Gtrain 1,600', eta: '2024-12-02', status: 'En tránsito', monto: '520,000 MXN' },
  { folio: 'PO-1205', proveedor: 'Global Medical Parts', producto: 'Refacciones Gtrain', eta: '2024-12-05', status: 'Confirmado', monto: '80,000 MXN' },
  { folio: 'PO-1207', proveedor: 'LabWare Latam', producto: 'Kit reactivos', eta: '2024-12-08', status: 'Pendiente de pago', monto: '42,500 MXN' },
];

export default function MedDevComprasPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 font-semibold">Zogen Med Dev</p>
          <h1 className="text-3xl font-bold text-gray-900">Compras · Proveedores y abastecimiento</h1>
          <p className="text-gray-600 mt-2">Órdenes internacionales y nacionales con fechas ETA controladas.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-cyan-100">
            <CardHeader className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-cyan-500" />
              <CardTitle className="text-sm text-gray-500">PO en curso</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">$642K MXN</p>
              <p className="text-xs text-gray-500">Programadas para diciembre</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-100">
            <CardHeader className="flex items-center gap-2">
              <Package className="h-4 w-4 text-cyan-500" />
              <CardTitle className="text-sm text-gray-500">Órdenes pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">7</p>
              <p className="text-xs text-gray-500">3 requieren confirmación de pago</p>
            </CardContent>
          </Card>
          <Card className="border-cyan-100">
            <CardHeader className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-cyan-500" />
              <CardTitle className="text-sm text-gray-500">Entregas ETA semana</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-gray-900">4 envíos</p>
              <p className="text-xs text-gray-500">2 internacionales, 2 nacionales</p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-cyan-100">
          <CardHeader>
            <CardTitle>Órdenes de compra</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-cyan-100 text-gray-500">
                  <th className="py-2 text-left">Folio</th>
                  <th className="py-2 text-left">Proveedor</th>
                  <th className="py-2 text-left">Producto</th>
                  <th className="py-2 text-left">Monto</th>
                  <th className="py-2 text-left">ETA</th>
                  <th className="py-2 text-left">Status</th>
                  <th className="py-2 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {PURCHASES.map((order) => (
                  <tr key={order.folio} className="border-b border-cyan-50">
                    <td className="py-3 font-semibold text-gray-900">{order.folio}</td>
                    <td className="py-3 text-gray-700">{order.proveedor}</td>
                    <td className="py-3 text-gray-700">{order.producto}</td>
                    <td className="py-3 text-gray-900">{order.monto}</td>
                    <td className="py-3 text-gray-500">{order.eta}</td>
                    <td className="py-3">
                      <Badge className="bg-cyan-100 text-cyan-700">{order.status}</Badge>
                    </td>
                    <td className="py-3 text-right">
                      <Button size="sm" variant="outline" className="border-cyan-200 text-cyan-700">Seguimiento</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
