'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';

const initialForm = {
  nomina: '',
  servicios: '',
  logistica: '',
  aduanas: '',
  notas: '',
};

export default function OtrosGastosPage() {
  const [form, setForm] = useState(initialForm);
  const [mensaje, setMensaje] = useState('');

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje('Control actualizado. Recuerda programar la dispersión semanal.');
    setTimeout(() => setMensaje(''), 4000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-amber-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-amber-600 font-semibold">Zogen Med Dev</p>
            <h1 className="text-3xl font-bold text-gray-900">Costos y Gastos Operativos</h1>
            <p className="text-gray-600 mt-1">Captura nómina, servicios, logística y aduanas en un solo panel.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/zogen-meddev/compras-gastos" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Volver al hub
            </Link>
          </Button>
        </div>

        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle>Registrar costos</CardTitle>
            <p className="text-sm text-gray-600">Introduce los montos planificados para esta semana.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="nomina">Nómina semanal</Label>
                  <Input
                    id="nomina"
                    type="number"
                    placeholder="120000"
                    value={form.nomina}
                    onChange={(e) => handleChange('nomina', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="servicios">Servicios (luz, agua, data)</Label>
                  <Input
                    id="servicios"
                    type="number"
                    placeholder="38000"
                    value={form.servicios}
                    onChange={(e) => handleChange('servicios', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logistica">Logística</Label>
                  <Input
                    id="logistica"
                    type="number"
                    placeholder="22000"
                    value={form.logistica}
                    onChange={(e) => handleChange('logistica', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="aduanas">Aduanas / importaciones</Label>
                  <Input
                    id="aduanas"
                    type="number"
                    placeholder="54000"
                    value={form.aduanas}
                    onChange={(e) => handleChange('aduanas', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notas">Notas de control</Label>
                <textarea
                  id="notas"
                  value={form.notas}
                  onChange={(e) => handleChange('notas', e.target.value)}
                  className="w-full min-h-[90px] rounded-md border border-gray-300 p-3"
                  placeholder="Ej. Programar dispersión con finanzas, validar CFDI de servicios."
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" className="bg-amber-500 hover:bg-amber-600">
                  Guardar control
                </Button>
                {mensaje && <p className="text-sm text-emerald-700">{mensaje}</p>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
