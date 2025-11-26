'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MovimientoDialog } from '@/components/MovimientoDialog';
import { ArrowDownToLine, ArrowLeft, ArrowUpFromLine, Package2, Warehouse } from 'lucide-react';
import { useAlmacenes, useProductosMedDev } from '@/hooks/useMedDevStorage';
import { useInventario } from '@/hooks/useInventario';

export default function AlmacenDetallePage({ params }: { params: { almacenId: string } }) {
  const router = useRouter();
  const { almacenes, loading: loadingAlmacenes } = useAlmacenes();
  const { productos, loading: loadingProductos } = useProductosMedDev();
  const {
    loading: loadingInventario,
    getInventarioByAlmacen,
    movimientos,
    registrarMovimiento,
  } = useInventario();

  const [productoFiltro, setProductoFiltro] = useState<'todos' | string>('todos');
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [isSalidaOpen, setIsSalidaOpen] = useState(false);

  const productosValidos = useMemo(() => new Set(productos.map((p) => p.id)), [productos]);

  const almacen = almacenes.find((a) => a.id === params.almacenId);
  const inventarioAlmacen = getInventarioByAlmacen(params.almacenId).filter((item) =>
    productosValidos.has(item.productoId)
  );
  const movimientosAlmacen = movimientos
    .filter((mov) => mov.almacenId === params.almacenId && productosValidos.has(mov.productoId))
    .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  const movimientosFiltrados =
    productoFiltro === 'todos'
      ? movimientosAlmacen
      : movimientosAlmacen.filter((mov) => mov.productoId === productoFiltro);

  const productosDisponibles = productos.filter(
    (producto) =>
      inventarioAlmacen.some((item) => item.productoId === producto.id) ||
      movimientosAlmacen.some((mov) => mov.productoId === producto.id)
  );

  const totalProductos = inventarioAlmacen.length;
  const totalPiezas = inventarioAlmacen.reduce((sum, item) => sum + item.cantidad, 0);

  const getProductoNombre = (productoId: string) => {
    return productos.find((p) => p.id === productoId)?.nombre || 'Producto desconocido';
  };

  const getStatus = (stock: number, seguridad: number) => (stock >= seguridad ? 'Óptimo' : 'Reabastecer');

  if (loadingAlmacenes || loadingProductos || loadingInventario) {
    return <div className="p-6">Cargando...</div>;
  }

  if (!almacen) {
    return (
      <div className="p-6">
        <Button variant="ghost" onClick={() => router.push('/zogen-meddev/almacen')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Volver a inventarios
        </Button>
        <p className="mt-6 text-gray-600">No encontramos el almacén solicitado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/zogen-meddev/almacen')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al listado
          </Button>
          <div className="flex items-center gap-3 text-blue-600">
            <Warehouse className="h-5 w-5" />
            <span className="text-xs uppercase tracking-[0.3em] font-semibold">Zogen Med Dev</span>
          </div>
        </div>

        <header className="rounded-3xl border border-blue-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">Almacén</p>
              <h1 className="text-3xl font-bold text-gray-900">{almacen.nombre}</h1>
              <p className="text-gray-600">{almacen.ubicacion}</p>
              <div className="mt-4 flex flex-wrap gap-6 text-sm text-gray-600">
                <div>
                  <p className="uppercase text-[11px] tracking-wider">Productos</p>
                  <p className="text-2xl font-bold text-gray-900">{totalProductos}</p>
                </div>
                <div>
                  <p className="uppercase text-[11px] tracking-wider">Piezas totales</p>
                  <p className="text-2xl font-bold text-gray-900">{totalPiezas}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => setIsEntradaOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                Entrada
              </Button>
              <Button
                onClick={() => setIsSalidaOpen(true)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <ArrowUpFromLine className="h-4 w-4 mr-2" />
                Salida
              </Button>
            </div>
          </div>
        </header>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Inventario actual</h2>
            <p className="text-sm text-gray-600">Detalle de productos en este almacén</p>
          </div>

          {inventarioAlmacen.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-10 text-center">
              <Package2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-600">Aún no hay productos registrados en este almacén.</p>
              <p className="text-sm text-gray-500">Registra una entrada para comenzar a controlarlo.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {inventarioAlmacen.map((item) => (
                <Card key={item.id} className="border-gray-100">
                  <CardContent className="space-y-4 pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-lg font-semibold text-gray-900">{getProductoNombre(item.productoId)}</p>
                        {item.lote && <p className="text-xs text-gray-500">Lote: {item.lote}</p>}
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
                    <div className="rounded-2xl bg-gray-50 p-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500">Stock actual</p>
                        <p className="text-3xl font-bold text-gray-900">
                          {item.cantidad}
                          <span className="text-base font-normal text-gray-500 ml-1">pzs</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs uppercase tracking-wide text-gray-500">Stock mínimo</p>
                        <p className="text-xl font-semibold text-gray-900">{item.stockMinimo} pzs</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Histórico de movimientos</h2>
            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <label htmlFor="producto" className="text-sm font-medium text-gray-600">
                Filtrar por producto
              </label>
              <select
                id="producto"
                className="rounded-xl border border-gray-300 p-2"
                value={productoFiltro}
                onChange={(e) => setProductoFiltro(e.target.value)}
                disabled={productosDisponibles.length === 0}
              >
                <option value="todos">Todos los productos</option>
                {productosDisponibles.map((producto) => (
                  <option key={producto.id} value={producto.id}>
                    {producto.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {movimientosFiltrados.length === 0 ? (
            <Card className="border-dashed border-gray-200 bg-gray-50/60">
              <CardContent className="py-10 text-center text-gray-500">
                No hay movimientos registrados con el filtro seleccionado.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {movimientosFiltrados.map((movimiento) => (
                <Card key={movimiento.id} className="border-gray-100">
                  <CardContent className="flex flex-col gap-3 pt-5">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{new Date(movimiento.fecha).toLocaleString('es-MX')}</span>
                      {movimiento.referencia && <span>{movimiento.referencia}</span>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-semibold text-gray-900">
                        {getProductoNombre(movimiento.productoId)}
                      </p>
                      {movimiento.notas && <p className="text-xs text-gray-600">{movimiento.notas}</p>}
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge
                        className={
                          movimiento.tipo === 'entrada'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                        }
                      >
                        {movimiento.tipo === 'entrada' ? 'Entrada' : 'Salida'}
                      </Badge>
                      <p className="text-lg font-semibold text-gray-900">{movimiento.cantidad} pzs</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>

      <MovimientoDialog
        open={isEntradaOpen}
        onOpenChange={setIsEntradaOpen}
        tipo="entrada"
        almacenes={almacenes}
        productos={productos}
        defaultAlmacenId={almacen.id}
        lockAlmacen
        onSubmit={(data) => {
          registrarMovimiento({ tipo: 'entrada', ...data });
          setIsEntradaOpen(false);
        }}
      />
      <MovimientoDialog
        open={isSalidaOpen}
        onOpenChange={setIsSalidaOpen}
        tipo="salida"
        almacenes={almacenes}
        productos={productos}
        defaultAlmacenId={almacen.id}
        lockAlmacen
        onSubmit={(data) => {
          registrarMovimiento({ tipo: 'salida', ...data });
          setIsSalidaOpen(false);
        }}
      />
    </div>
  );
}
