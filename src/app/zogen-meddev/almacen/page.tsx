'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Warehouse, ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';

const INVENTARIO_KPIS = [
  { label: 'Almacenes activos', value: '4', detail: 'CDMX, Guadalajara, Monterrey y Mérida' },
  { label: 'Piezas en stock', value: '312', detail: '+8% vs semana anterior' },
  { label: 'Alertas de reorden', value: '2', detail: 'Monterrey y Mérida' },
];

const ALMACENES = [
  {
    id: 'cdmx',
    nombre: 'CDMX · Centro Logístico',
    ubicacion: 'Vallejo, Ciudad de México',
    capacidad: '1,200 m²',
    ocupacion: 78,
    piezas: [
      { sku: 'GT-1600', nombre: 'Gtrain 1,600', stock: 6, seguridad: 4, lote: 'PO-1201' },
      { sku: 'PCR-PRIME', nombre: 'Cartuchos PCR Prime', stock: 120, seguridad: 80, lote: 'GR-094' },
    ],
    movimientos: [
      { id: 'MV-901', fecha: '30 Nov', tipo: 'Entrada', referencia: 'PO-1201', producto: 'Gtrain 1,600', cantidad: 2 },
      { id: 'MV-899', fecha: '26 Nov', tipo: 'Salida', referencia: 'Entrega CH-45', producto: 'Cartuchos PCR Prime', cantidad: 30 },
    ],
  },
  {
    id: 'gdl',
    nombre: 'Guadalajara · Occidente',
    ubicacion: 'El Salto, Jalisco',
    capacidad: '900 m²',
    ocupacion: 64,
    piezas: [
      { sku: 'GT-1199', nombre: 'Gtrain 1,199', stock: 4, seguridad: 5, lote: 'GE-195' },
      { sku: 'CTRL-3N', nombre: 'Control Hematología 3N', stock: 85, seguridad: 60, lote: 'GR-074' },
    ],
    movimientos: [
      { id: 'MV-888', fecha: '28 Nov', tipo: 'Salida', referencia: 'Hospital Puerta de Hierro', producto: 'Gtrain 1,199', cantidad: 1 },
      { id: 'MV-886', fecha: '24 Nov', tipo: 'Entrada', referencia: 'GE-195', producto: 'Gtrain 1,199', cantidad: 2 },
    ],
  },
  {
    id: 'mty',
    nombre: 'Monterrey · Norte',
    ubicacion: 'Apodaca, Nuevo León',
    capacidad: '650 m²',
    ocupacion: 82,
    piezas: [
      { sku: 'VENT-V5', nombre: 'Ventilador Serie V5', stock: 3, seguridad: 4, lote: 'GE-192' },
      { sku: 'KIT-ONCO', nombre: 'Kit reactivos OncoLab', stock: 40, seguridad: 45, lote: 'GR-091' },
    ],
    movimientos: [
      { id: 'MV-875', fecha: '27 Nov', tipo: 'Entrada', referencia: 'GE-192', producto: 'Ventilador Serie V5', cantidad: 1 },
      { id: 'MV-870', fecha: '22 Nov', tipo: 'Salida', referencia: 'Clínica San José', producto: 'Kit reactivos OncoLab', cantidad: 10 },
    ],
  },
  {
    id: 'mid',
    nombre: 'Mérida · Sureste',
    ubicacion: 'Mérida, Yucatán',
    capacidad: '480 m²',
    ocupacion: 58,
    piezas: [
      { sku: 'GT-11160', nombre: 'Gtrain 1,1160', stock: 2, seguridad: 4, lote: 'GE-188' },
      { sku: 'ADU-LOG', nombre: 'Logística Aduanas', stock: 18, seguridad: 12, lote: 'GR-080' },
    ],
    movimientos: [
      { id: 'MV-862', fecha: '29 Nov', tipo: 'Entrada', referencia: 'GR-080', producto: 'Logística Aduanas', cantidad: 5 },
      { id: 'MV-858', fecha: '21 Nov', tipo: 'Salida', referencia: 'Hospital El Faro', producto: 'Gtrain 1,1160', cantidad: 1 },
    ],
  },
];

const getStatus = (stock: number, seguridad: number) =>
  stock >= seguridad ? 'Óptimo' : 'Reabastecer';

export default function MedDevInventariosPage() {
  const [selectedAlmacenId, setSelectedAlmacenId] = useState(ALMACENES[0].id);
  const [movimientoForm, setMovimientoForm] = useState({
    tipo: 'entrada',
    productoSku: ALMACENES[0].piezas[0].sku,
    cantidad: '1',
    referencia: '',
    notas: '',
  });
  const [mensaje, setMensaje] = useState('');

  const selectedAlmacen = useMemo(
    () => ALMACENES.find((almacen) => almacen.id === selectedAlmacenId) ?? ALMACENES[0],
    [selectedAlmacenId]
  );

  useEffect(() => {
    setMovimientoForm((prev) => ({
      ...prev,
      productoSku: selectedAlmacen.piezas[0]?.sku || '',
    }));
  }, [selectedAlmacen]);

  const handleMovimientoChange = (field: string, value: string) => {
    setMovimientoForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleMovimientoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setMensaje(`Movimiento ${movimientoForm.tipo === 'entrada' ? 'registrado' : 'aplicado'} para ${selectedAlmacen.nombre}`);
    setTimeout(() => setMensaje(''), 4000);
    setMovimientoForm((prev) => ({ ...prev, cantidad: '1', notas: '', referencia: '' }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-cyan-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 text-blue-600">
            <Warehouse className="h-6 w-6" />
            <p className="text-xs uppercase tracking-[0.3em] font-semibold">Zogen Med Dev</p>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Inventarios · Dashboard general</h1>
          <p className="text-gray-600">
            Visión consolidada de cuatro almacenes con detalle de piezas críticas y registro inmediato de entradas / salidas.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {INVENTARIO_KPIS.map((kpi) => (
            <Card key={kpi.label} className="border-blue-100">
              <CardHeader className="space-y-1">
                <CardTitle className="text-sm font-medium text-gray-500">{kpi.label}</CardTitle>
                <p className="text-3xl font-bold text-gray-900">{kpi.value}</p>
                <p className="text-xs text-gray-500">{kpi.detail}</p>
              </CardHeader>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {ALMACENES.map((almacen) => (
            <button
              key={almacen.id}
              onClick={() => setSelectedAlmacenId(almacen.id)}
              className={`rounded-3xl border-2 p-5 text-left transition-all ${
                selectedAlmacenId === almacen.id
                  ? 'border-blue-400 bg-white shadow-lg'
                  : 'border-gray-200 bg-white/70 hover:border-blue-200'
              }`}
              aria-pressed={selectedAlmacenId === almacen.id}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Almacén</p>
                  <p className="text-xl font-bold text-gray-900">{almacen.nombre}</p>
                  <p className="text-sm text-gray-600">{almacen.ubicacion}</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">
                  Ocupación {almacen.ocupacion}%
                </Badge>
              </div>
              <div className="mt-4 space-y-3">
                {almacen.piezas.map((pieza) => (
                  <div key={pieza.sku} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-3">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{pieza.sku}</span>
                      <span>Lote {pieza.lote}</span>
                    </div>
                    <p className="text-sm font-semibold text-gray-900">{pieza.nombre}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span>{pieza.stock} en stock</span>
                      <span>Seguridad: {pieza.seguridad}</span>
                    </div>
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        <Card className="border-blue-100">
          <CardHeader>
            <CardTitle>Detalle · {selectedAlmacen.nombre}</CardTitle>
            <p className="text-sm text-gray-600">{selectedAlmacen.ubicacion} · {selectedAlmacen.capacidad}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {selectedAlmacen.piezas.map((pieza) => (
                <div key={pieza.sku} className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">SKU {pieza.sku}</p>
                      <p className="text-lg font-semibold text-gray-900">{pieza.nombre}</p>
                    </div>
                    <Badge
                      className={
                        getStatus(pieza.stock, pieza.seguridad) === 'Óptimo'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }
                    >
                      {getStatus(pieza.stock, pieza.seguridad)}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Stock disponible</span>
                      <span className="font-semibold text-gray-900">{pieza.stock} pzs</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Stock seguridad</span>
                      <span className="font-semibold text-gray-900">{pieza.seguridad} pzs</span>
                    </div>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-gray-100">
                    <div
                      className={`h-2 rounded-full ${
                        pieza.stock >= pieza.seguridad ? 'bg-emerald-400' : 'bg-amber-400'
                      }`}
                      style={{ width: `${Math.min((pieza.stock / pieza.seguridad) * 100, 120)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Movimientos recientes</h3>
                <div className="space-y-3">
                  {selectedAlmacen.movimientos.map((movimiento) => (
                    <div key={movimiento.id} className="rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{movimiento.fecha}</span>
                        <span>{movimiento.referencia}</span>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">{movimiento.producto}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <Badge
                          className={
                            movimiento.tipo === 'Entrada'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-orange-100 text-orange-700'
                          }
                        >
                          {movimiento.tipo}
                        </Badge>
                        <p className="text-sm font-semibold text-gray-900">{movimiento.cantidad} pzs</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Registrar entrada / salida</h3>
                <form className="space-y-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm" onSubmit={handleMovimientoSubmit}>
                  <div className="space-y-2">
                    <Label htmlFor="tipo-mov">Tipo de movimiento</Label>
                    <select
                      id="tipo-mov"
                      value={movimientoForm.tipo}
                      onChange={(e) => handleMovimientoChange('tipo', e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      <option value="entrada">Entrada</option>
                      <option value="salida">Salida</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="producto">Producto</Label>
                    <select
                      id="producto"
                      value={movimientoForm.productoSku}
                      onChange={(e) => handleMovimientoChange('productoSku', e.target.value)}
                      className="w-full rounded-md border border-gray-300 p-2"
                    >
                      {selectedAlmacen.piezas.map((pieza) => (
                        <option key={pieza.sku} value={pieza.sku}>
                          {pieza.nombre}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="cantidad">Cantidad</Label>
                      <Input
                        id="cantidad"
                        type="number"
                        min="1"
                        value={movimientoForm.cantidad}
                        onChange={(e) => handleMovimientoChange('cantidad', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="referencia">Referencia / folio</Label>
                      <Input
                        id="referencia"
                        placeholder="PO / entrega"
                        value={movimientoForm.referencia}
                        onChange={(e) => handleMovimientoChange('referencia', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notas">Notas</Label>
                    <textarea
                      id="notas"
                      value={movimientoForm.notas}
                      onChange={(e) => handleMovimientoChange('notas', e.target.value)}
                      className="w-full min-h-[80px] rounded-md border border-gray-300 p-3"
                      placeholder="Ej. Ajuste inventario después de auditoría."
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {movimientoForm.tipo === 'entrada' ? (
                        <span className="flex items-center gap-2">
                          <ArrowDownToLine className="h-4 w-4" />
                          Registrar entrada
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <ArrowUpFromLine className="h-4 w-4" />
                          Registrar salida
                        </span>
                      )}
                    </Button>
                    {mensaje && <p className="text-sm text-emerald-700">{mensaje}</p>}
                  </div>
                </form>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
