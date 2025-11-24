'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Truck, DollarSign, FlaskConical, Stethoscope, ClipboardList } from 'lucide-react';

const KPI = [
  { label: 'PO en curso', value: '$642K MXN', icon: DollarSign, detail: 'Programadas para diciembre' },
  { label: 'Órdenes pendientes', value: '7', icon: Package, detail: '3 requieren confirmación de pago' },
  { label: 'Entregas ETA semana', value: '4 envíos', icon: Truck, detail: '2 internacionales, 2 nacionales' },
];

const SECCIONES = [
  {
    title: 'Reactivos',
    description: 'Sigue el gasto operativo de consumibles, paneles y cartuchos.',
    href: '/zogen-meddev/compras-gastos/reactivos',
    icon: FlaskConical,
    badge: 'Catálogo laboratorio',
    color: 'border-emerald-200 bg-emerald-50/70',
    stat: '+2 órdenes por facturar',
  },
  {
    title: 'Equipo Médico',
    description: 'Ordenes de compra de hardware, refacciones y dispositivos.',
    href: '/zogen-meddev/compras-gastos/equipo-medico',
    icon: Stethoscope,
    badge: 'Capital equipment',
    color: 'border-sky-200 bg-sky-50/70',
    stat: '520K MXN pendientes',
  },
  {
    title: 'Costos y Gastos',
    description: 'Nómina, servicios, logística y aduanas bajo control semanal.',
    href: '/zogen-meddev/compras-gastos/otros-gastos',
    icon: ClipboardList,
    badge: 'Operación',
    color: 'border-amber-200 bg-amber-50/70',
    stat: 'Actualiza dispersiones',
  },
];

export default function ComprasGastosHubPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-600 font-semibold">Zogen Med Dev</p>
          <h1 className="text-3xl font-bold text-gray-900">Compras · Proveedores y abastecimiento</h1>
          <p className="text-gray-600 mt-2">Centraliza el seguimiento de reactivos, equipo médico y costos operativos.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {KPI.map(({ label, value, icon: Icon, detail }) => (
            <Card key={label} className="border-cyan-100">
              <CardHeader className="flex flex-row items-center gap-2">
                <Icon className="h-5 w-5 text-cyan-500" />
                <CardTitle className="text-sm text-gray-500">{label}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-500">{detail}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Catálogos de costos</h2>
            <p className="text-sm text-gray-600">Ingresa a cada módulo para registrar los movimientos correspondientes.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {SECCIONES.map((section) => {
              const Icon = section.icon;
              return (
                <Card key={section.title} className={`${section.color} border-2`}>
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-3 shadow-sm">
                        <Icon className="h-6 w-6 text-gray-900" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-gray-500">{section.badge}</p>
                        <CardTitle className="text-xl text-gray-900">{section.title}</CardTitle>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{section.description}</p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    <p className="text-sm font-semibold text-gray-800">{section.stat}</p>
                    <Button asChild className="bg-cyan-600 hover:bg-cyan-700">
                      <Link href={section.href}>Ir a {section.title}</Link>
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
