'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Plus } from 'lucide-react';

interface GastoDetalle {
  folio: string;
  proveedor: string;
  concepto: string;
  fecha: string;
  monto: number;
}

type StatusKey = 'pendiente' | 'facturado' | 'realizado';
type GastoSeccion = Record<StatusKey, GastoDetalle[]>;

const STATUS_COLUMNS: { key: StatusKey; title: string; accent: string }[] = [
  { key: 'pendiente', title: 'Gasto pendiente', accent: 'border-amber-200 bg-amber-50/60' },
  { key: 'facturado', title: 'Facturado', accent: 'border-sky-200 bg-sky-50/60' },
  { key: 'realizado', title: 'Gasto realizado', accent: 'border-emerald-200 bg-emerald-50/60' },
];

const INITIAL_EQUIPO: GastoSeccion = {
  pendiente: [
    { folio: 'GE-210', proveedor: 'Foundation Supply', concepto: 'Gtrain 1,600 (2ud)', fecha: '04 Dic', monto: 520000 },
  ],
  facturado: [
    { folio: 'GE-198', proveedor: 'Global Medical Parts', concepto: 'Refacciones Gtrain', fecha: '27 Nov', monto: 80000 },
  ],
  realizado: [
    { folio: 'GE-192', proveedor: 'Medtech Asia', concepto: 'Ventiladores serie V5', fecha: '19 Nov', monto: 310000 },
    { folio: 'GE-175', proveedor: 'CardioPlus', concepto: 'Monitores telemetría', fecha: '07 Nov', monto: 146000 },
  ],
};

const formatCurrency = (value: number) =>
  value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 });

export default function EquipoMedicoComprasPage() {
  const [data, setData] = useState(INITIAL_EQUIPO);
  const [form, setForm] = useState({ proveedor: '', concepto: '', monto: '', status: 'pendiente' as StatusKey });
  const [showForm, setShowForm] = useState(false);
  const today = useMemo(
    () => new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'short' }),
    []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.proveedor || !form.concepto || !form.monto) return;
    const montoNumber = parseFloat(form.monto);
    if (Number.isNaN(montoNumber)) return;

    const nuevo: GastoDetalle = {
      folio: `GE-${Math.floor(Math.random() * 900 + 100)}`,
      proveedor: form.proveedor,
      concepto: form.concepto,
      fecha: today,
      monto: montoNumber,
    };

    setData((prev) => ({
      ...prev,
      [form.status]: [nuevo, ...prev[form.status]],
    }));
    setForm({ proveedor: '', concepto: '', monto: '', status: 'pendiente' });
    setShowForm(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-sky-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-sky-600 font-semibold">Zogen Med Dev</p>
            <h1 className="text-3xl font-bold text-gray-900">Equipo Médico · Compras y Gastos</h1>
            <p className="text-gray-600 mt-1">Control de órdenes de compra de hardware y refacciones.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/zogen-meddev/compras-gastos" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al hub
            </Link>
          </Button>
        </div>

        <Card className="border-sky-200">
          <CardHeader className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <CardTitle>Registrar gasto de equipo médico</CardTitle>
              <Button variant="outline" onClick={() => setShowForm((prev) => !prev)}>
                <Plus className="h-4 w-4 mr-2" />
                {showForm ? 'Cerrar' : 'Nuevo registro'}
              </Button>
            </div>
            {showForm && (
              <form className="grid gap-3 md:grid-cols-4" onSubmit={handleSubmit}>
                <Input
                  placeholder="Proveedor"
                  value={form.proveedor}
                  onChange={(e) => setForm({ ...form, proveedor: e.target.value })}
                />
                <Input
                  placeholder="Concepto"
                  value={form.concepto}
                  onChange={(e) => setForm({ ...form, concepto: e.target.value })}
                />
                <Input
                  type="number"
                  placeholder="Monto"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: e.target.value })}
                />
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as StatusKey })}
                  className="rounded-md border border-gray-300 p-2"
                >
                  <option value="pendiente">Gasto pendiente</option>
                  <option value="facturado">Facturado</option>
                  <option value="realizado">Gasto realizado</option>
                </select>
                <div className="md:col-span-4 flex justify-end">
                  <Button type="submit" className="bg-sky-600 hover:bg-sky-700">
                    Guardar
                  </Button>
                </div>
              </form>
            )}
          </CardHeader>
        </Card>

        <div className="grid gap-4 md:grid-cols-3">
          {STATUS_COLUMNS.map((status) => (
            <Card key={status.key} className={status.accent}>
              <CardHeader>
                <CardTitle className="text-lg text-gray-900">{status.title}</CardTitle>
                <p className="text-sm text-gray-600">
                  {data[status.key].length} registro{data[status.key].length !== 1 ? 's' : ''}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(data[status.key].reduce((acc, gasto) => acc + gasto.monto, 0))}
                </p>
                {data[status.key].map((gasto) => (
                  <div key={gasto.folio} className="rounded-2xl border border-white/70 bg-white/80 p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{gasto.folio}</span>
                      <span>{gasto.fecha}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{gasto.proveedor}</p>
                    <p className="text-sm text-gray-600">{gasto.concepto}</p>
                    <Badge variant="outline" className="mt-2 text-sky-700 border-sky-200">
                      {formatCurrency(gasto.monto)}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
