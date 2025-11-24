'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { TrendingUp, ShoppingCart, Users, Package, FlaskConical } from 'lucide-react';
import { useProductosMedDev } from '@/hooks/useMedDevStorage';

const KPI = [
  { label: 'Ingresos proyectados', value: '$1.2M MXN', icon: TrendingUp },
  { label: 'Órdenes activas', value: '23', icon: ShoppingCart },
  { label: 'Clientes estratégicos', value: '15', icon: Users },
];

const CATALOGOS = [
  {
    tipo: 'equipo-medico' as const,
    title: 'Catálogo · Equipos Médicos',
    description: 'Monitores, ventiladores y hardware especializado para hospitales',
    href: '/zogen-meddev/ventas/equipo-medico',
    accent: 'border-purple-200 bg-purple-50/60',
    pill: 'Venta consultiva',
    icon: Package,
  },
  {
    tipo: 'reactivo' as const,
    title: 'Catálogo · Reactivos',
    description: 'Paneles de laboratorio, cartuchos y controles de calidad',
    href: '/zogen-meddev/ventas/reactivos',
    accent: 'border-emerald-200 bg-emerald-50/60',
    pill: 'Venta recurrente',
    icon: FlaskConical,
  },
];

export default function MedDevVentasPage() {
  const { productos } = useProductosMedDev();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-purple-600 font-semibold">Zogen Med Dev</p>
          <h1 className="text-3xl font-bold text-gray-900">Ventas · Equipos Médicos y Reactivos</h1>
          <p className="text-gray-600 mt-2">
            Orquesta tus ciclos comerciales conectando los catálogos de productos con los módulos de venta.
          </p>
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

        <div className="space-y-4">
          {CATALOGOS.map((catalogo) => {
            const Icon = catalogo.icon;
            const productosCatalogo = productos
              .filter((p) => p.tipo === catalogo.tipo)
              .slice(0, 3);

            return (
              <Card key={catalogo.tipo} className={`${catalogo.accent} border-2`}>
                <CardHeader className="flex flex-col gap-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="rounded-2xl bg-white p-3 shadow-sm">
                      <Icon className={catalogo.tipo === 'equipo-medico' ? 'text-purple-600 h-6 w-6' : 'text-emerald-600 h-6 w-6'} />
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs uppercase tracking-[0.2em] text-gray-500">Catálogo</p>
                      <CardTitle className="text-2xl text-gray-900">{catalogo.title}</CardTitle>
                      <p className="text-sm text-gray-600">{catalogo.description}</p>
                    </div>
                    <Badge className="bg-white text-gray-800 border border-gray-200">{catalogo.pill}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {productosCatalogo.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-gray-300 bg-white/60 p-4 text-center text-sm text-gray-500 md:col-span-3">
                        No hay productos registrados en este catálogo aún.
                      </div>
                    ) : (
                      productosCatalogo.map((producto) => (
                        <div key={producto.id} className="rounded-2xl border border-white/60 bg-white p-4 shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                            SKU · {producto.id}
                          </p>
                          <p className="text-lg font-semibold text-gray-900">{producto.nombre}</p>
                          {producto.descripcion && (
                            <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                          )}
                          <p className="text-xl font-bold text-gray-900 mt-3">
                            ${producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button asChild className="bg-purple-600 hover:bg-purple-700">
                      <Link href={catalogo.href}>
                        Ir a ventas {catalogo.tipo === 'equipo-medico' ? 'de Equipo Médico' : 'de Reactivos'}
                      </Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/zogen-meddev/configuracion/productos">
                        Ver catálogo completo
                      </Link>
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
