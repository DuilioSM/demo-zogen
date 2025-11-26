'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Warehouse, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useAlmacenes, useProductosMedDev } from '@/hooks/useMedDevStorage';
import { useInventario } from '@/hooks/useInventario';
import { MovimientoDialog } from '@/components/MovimientoDialog';

export default function MedDevInventariosPage() {
  const { almacenes, loading: loadingAlmacenes } = useAlmacenes();
  const { productos, loading: loadingProductos } = useProductosMedDev();
  const {
    inventario,
    loading: loadingInventario,
    getInventarioByAlmacen,
    registrarMovimiento,
  } = useInventario();

  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isSalidaOpen, setIsSalidaOpen] = useState(false);

  const router = useRouter();

  const productosValidos = useMemo(() => new Set(productos.map((p) => p.id)), [productos]);

  const getProductoNombre = (productoId: string) => {
    return productos.find((p) => p.id === productoId)?.nombre || 'Producto desconocido';
  };

  const getStatus = (stock: number, seguridad: number) => (stock >= seguridad ? 'Óptimo' : 'Reabastecer');

  if (loadingAlmacenes || loadingProductos || loadingInventario) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-blue-600">
            <Warehouse className="h-6 w-6" />
            <p className="text-xs uppercase tracking-[0.3em] font-semibold">Zogen Med Dev</p>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Control de Inventarios</h1>
              <p className="text-gray-600 mt-1">
                Visión consolidada de almacenes con detalle de stock y registro de movimientos
              </p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => setIsEntradaOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Entrada
              </Button>
              <Button onClick={() => setIsSalidaOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Salida
              </Button>
            </div>
          </div>
        </div>

        {/* Grid de Almacenes */}
        {almacenes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Warehouse className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 font-medium mb-2">No hay almacenes configurados</p>
              <p className="text-sm text-gray-500">Ve a Configuración → Almacenes para agregar uno</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {almacenes.map((almacen) => {
              const itemsAlmacen = getInventarioByAlmacen(almacen.id).filter((item) =>
                productosValidos.has(item.productoId)
              );
              const totalStock = itemsAlmacen.reduce((sum, item) => sum + item.cantidad, 0);

              return (
                <button
                  key={almacen.id}
                  onClick={() => router.push(`/zogen-meddev/almacen/${almacen.id}`)}
                  className="flex h-full flex-col rounded-3xl border-2 border-gray-200 bg-white/70 p-5 text-left transition-all hover:border-blue-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xl font-bold text-gray-900">{almacen.nombre}</p>
                    <Badge className="bg-blue-100 text-blue-700">
                      {totalStock} piezas
                    </Badge>
                  </div>
                  <div className="space-y-2 flex-1">
                    {itemsAlmacen.length === 0 ? (
                      <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3 text-center">
                        <p className="text-sm text-gray-500">Sin inventario registrado</p>
                      </div>
                    ) : (
                      itemsAlmacen.slice(0, 3).map((item) => (
                        <div key={item.id} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                          <p className="text-sm font-semibold text-gray-900">{getProductoNombre(item.productoId)}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div>
                              <p className="text-[11px] uppercase tracking-wide text-gray-500">Stock actual</p>
                              <p className="text-xl font-bold text-gray-900">
                                {item.cantidad}
                                <span className="text-sm font-normal text-gray-500 ml-1">pzs</span>
                              </p>
                            </div>
                            <Badge
                              className={
                                getStatus(item.cantidad, item.stockMinimo) === 'Óptimo'
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-amber-100 text-amber-700'
                              }
                            >
                              {getStatus(item.cantidad, item.stockMinimo)}
                            </Badge>
                          </div>
                        </div>
                      ))
                    )}
                    {itemsAlmacen.length > 3 && (
                      <p className="text-xs text-center text-gray-500 pt-2">
                        +{itemsAlmacen.length - 3} productos más
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </div>

      {/* Dialog de Entrada */}
      <MovimientoDialog
        open={isEntradaOpen}
        onOpenChange={setIsEntradaOpen}
        tipo="entrada"
        almacenes={almacenes}
        productos={productos}
        onSubmit={(data) => {
          registrarMovimiento({
            tipo: 'entrada',
            ...data,
          });
          setIsEntradaOpen(false);
        }}
      />

      {/* Dialog de Salida */}
      <MovimientoDialog
        open={isSalidaOpen}
        onOpenChange={setIsSalidaOpen}
        tipo="salida"
        almacenes={almacenes}
        productos={productos}
        onSubmit={(data) => {
          registrarMovimiento({
            tipo: 'salida',
            ...data,
          });
          setIsSalidaOpen(false);
        }}
      />
    </div>
  );
}
