'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ShoppingCart,
  Package,
  DollarSign,
  TrendingUp,
  FileText,
  ClipboardList,
  Warehouse,
  CreditCard
} from 'lucide-react';

export default function ZogenMedDevPage() {
  const stats = [
    {
      title: 'Compras del Mes',
      value: '$342,500',
      description: 'Total en compras',
      icon: <ShoppingCart className="h-4 w-4 text-blue-600" />,
      trend: '+12.5%',
    },
    {
      title: 'Inventario Total',
      value: '1,234',
      description: 'Productos en stock',
      icon: <Package className="h-4 w-4 text-green-600" />,
      trend: '+8.2%',
    },
    {
      title: 'Ventas del Mes',
      value: '$487,900',
      description: 'Ingresos totales',
      icon: <DollarSign className="h-4 w-4 text-purple-600" />,
      trend: '+15.3%',
    },
    {
      title: 'Cuentas por Cobrar',
      value: '$125,400',
      description: 'Pendientes de cobro',
      icon: <CreditCard className="h-4 w-4 text-orange-600" />,
      trend: '-5.1%',
    },
  ];

  const modules = [
    {
      title: 'Compras y Gastos',
      description: 'Gestiona las compras a proveedores y registra los gastos operativos del negocio.',
      icon: <ShoppingCart className="h-8 w-8 text-blue-600" />,
      href: '/zogen-meddev/compras-gastos',
      color: 'border-blue-200 bg-blue-50/50',
      stats: '45 compras este mes',
    },
    {
      title: 'Almacén',
      description: 'Controla el inventario de productos médicos, equipos y dispositivos.',
      icon: <Warehouse className="h-8 w-8 text-green-600" />,
      href: '/zogen-meddev/almacen',
      color: 'border-green-200 bg-green-50/50',
      stats: '1,234 productos en stock',
    },
    {
      title: 'Facturación',
      description: 'Genera y administra facturas para los equipos y dispositivos médicos vendidos.',
      icon: <FileText className="h-8 w-8 text-purple-600" />,
      href: '/zogen-meddev/ventas/facturacion',
      color: 'border-purple-200 bg-purple-50/50',
      stats: '28 facturas emitidas',
    },
    {
      title: 'Cobranza',
      description: 'Da seguimiento a los pagos pendientes y gestiona el flujo de caja.',
      icon: <ClipboardList className="h-8 w-8 text-orange-600" />,
      href: '/zogen-meddev/ventas/cobranza',
      color: 'border-orange-200 bg-orange-50/50',
      stats: '$125,400 por cobrar',
    },
  ];

  return (
    <div className="p-6 overflow-auto h-full bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <section className="bg-white rounded-3xl p-8 shadow-sm border border-gray-200">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 rounded-2xl">
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold tracking-widest text-blue-600 uppercase">
                    Zogen MedDev
                  </p>
                  <h1 className="text-3xl font-bold text-gray-900">
                    Equipos Médicos y Dispositivos
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 max-w-3xl">
                Gestiona todo el ciclo de negocio de equipos médicos: desde la compra de inventario hasta
                la facturación y cobranza de ventas a hospitales y clínicas.
              </p>
            </div>
          </section>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat) => (
              <Card key={stat.title} className="bg-white">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-500">{stat.description}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        stat.trend.startsWith('+')
                          ? 'text-green-600 border-green-200'
                          : 'text-red-600 border-red-200'
                      }`}
                    >
                      {stat.trend}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </section>

          {/* Modules Grid */}
          <section>
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Módulos Disponibles</h2>
              <p className="text-gray-600">Accede a las diferentes áreas de gestión de MedDev</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card
                  key={module.title}
                  className={`${module.color} border-2 hover:shadow-lg transition-shadow`}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-white rounded-xl shadow-sm">
                          {module.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl text-gray-900">
                            {module.title}
                          </CardTitle>
                          <CardDescription className="mt-2 text-gray-600">
                            {module.description}
                          </CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-500">{module.stats}</p>
                      <Button asChild>
                        <Link href={module.href}>
                          Ir al módulo
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Quick Actions */}
          <section className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accesos Rápidos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 justify-start border-blue-200 hover:bg-white"
              >
                <Link href="/zogen-meddev/compras-gastos">
                  <div className="flex items-center gap-3">
                    <ShoppingCart className="h-5 w-5 text-blue-600" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Nueva Compra</p>
                      <p className="text-xs text-gray-500">Registrar compra de inventario</p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 justify-start border-purple-200 hover:bg-white"
              >
                <Link href="/zogen-meddev/ventas/facturacion">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-purple-600" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Nueva Factura</p>
                      <p className="text-xs text-gray-500">Emitir factura de venta</p>
                    </div>
                  </div>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 justify-start border-green-200 hover:bg-white"
              >
                <Link href="/zogen-meddev/almacen">
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-5 w-5 text-green-600" />
                    <div className="text-left">
                      <p className="font-semibold text-gray-900">Ver Inventario</p>
                      <p className="text-xs text-gray-500">Consultar stock disponible</p>
                    </div>
                  </div>
                </Link>
              </Button>
            </div>
          </section>
        </div>
      </div>
  );
}
