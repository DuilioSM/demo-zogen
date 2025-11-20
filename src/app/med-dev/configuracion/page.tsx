'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PRODUCTS = [
  { id: 'gtrain-1600', nombre: 'Gtrain 1,600', precio: '1,600 USD', costo: '1,150 USD', lead: '6 semanas' },
  { id: 'gtrain-1199', nombre: 'Gtrain 1,199', precio: '1,199 USD', costo: '980 USD', lead: '5 semanas' },
  { id: 'gtrain-1160', nombre: 'Gtrain 1,160', precio: '1,160 USD', costo: '890 USD', lead: '4 semanas' },
];

const WAREHOUSES = [
  { nombre: 'CDMX Central', capacidad: '600 m²', responsable: 'María López', tipo: 'Equipos' },
  { nombre: 'Guadalajara', capacidad: '300 m²', responsable: 'José Pérez', tipo: 'Refacciones' },
];

export default function MedDevConfiguracionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-purple-50 to-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-indigo-600 font-semibold">Zogen Med Dev</p>
          <h1 className="text-3xl font-bold text-gray-900">Configuración · Catálogos y parámetros</h1>
          <p className="text-gray-600 mt-2">Gestiona productos, precios y almacenes para la operación de equipos médicos.</p>
        </div>

        <Tabs defaultValue="productos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="productos">Productos y precios</TabsTrigger>
            <TabsTrigger value="almacenes">Almacenes</TabsTrigger>
          </TabsList>

          <TabsContent value="productos" className="mt-4">
            <Card className="border-indigo-100">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Catálogo de productos</CardTitle>
                <Button className="bg-indigo-600 hover:bg-indigo-700">Agregar producto</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {PRODUCTS.map((producto) => (
                  <div key={producto.id} className="rounded-lg border border-indigo-100 bg-white/80 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-indigo-600 font-semibold">{producto.id}</p>
                        <p className="text-lg font-semibold text-gray-900">{producto.nombre}</p>
                        <p className="text-sm text-gray-500">Lead time: {producto.lead}</p>
                      </div>
                      <div className="text-right text-sm text-gray-700">
                        <p>Precio: <span className="font-semibold text-gray-900">{producto.precio}</span></p>
                        <p>Costo: <span className="font-semibold text-gray-900">{producto.costo}</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="almacenes" className="mt-4">
            <Card className="border-indigo-100">
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Definición de almacenes</CardTitle>
                <Button variant="outline" className="border-indigo-200 text-indigo-700">Nuevo almacén</Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {WAREHOUSES.map((warehouse) => (
                  <div key={warehouse.nombre} className="rounded-lg border border-indigo-100 bg-white/80 p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-lg font-semibold text-gray-900">{warehouse.nombre}</p>
                      <p className="text-sm text-gray-500">Capacidad: {warehouse.capacidad}</p>
                      <p className="text-sm text-gray-500">Responsable: {warehouse.responsable}</p>
                      <p className="text-sm text-gray-500">Tipo: {warehouse.tipo}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
