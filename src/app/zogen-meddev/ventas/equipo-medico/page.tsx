'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useVentasMedDev } from '@/hooks/useVentasMedDev';
import { useProductosMedDev, useClientesMedDev } from '@/hooks/useMedDevStorage';
import { Plus, ShoppingCart, FileText, DollarSign, Edit, Trash2 } from 'lucide-react';
import type { VentaMedDev } from '@/types/meddev';

export default function EquipoMedicoPage() {
  const { ventas, loading, addVenta, updateVenta, deleteVenta, facturarVenta, cobrarVenta } = useVentasMedDev();
  const { productos } = useProductosMedDev();
  const { clientes } = useClientesMedDev();
  const productosEquipo = productos.filter((producto) => producto.tipo === 'equipo-medico');

  const [activeTab, setActiveTab] = useState<'vendido' | 'facturado' | 'cobrado'>('vendido');
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({
    clienteId: '',
    productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
    notas: '',
  });

  // Filter ventas by category and status
  const ventasFiltradas = ventas.filter(
    (v) => v.categoria === 'equipo-medico' && v.estatus === activeTab
  );

  const handleProductoChange = (index: number, productoId: string) => {
    const producto = productosEquipo.find((p) => p.id === productoId);
    const newProductos = [...formData.productos];
    newProductos[index] = {
      productoId,
      cantidad: 1,
      precioUnitario: producto?.precio || 0,
    };
    setFormData({ ...formData, productos: newProductos });
  };

  const handleCantidadChange = (index: number, cantidad: number) => {
    const newProductos = [...formData.productos];
    newProductos[index].cantidad = cantidad;
    setFormData({ ...formData, productos: newProductos });
  };

  const addProductoLine = () => {
    setFormData({
      ...formData,
      productos: [...formData.productos, { productoId: '', cantidad: 1, precioUnitario: 0 }],
    });
  };

  const removeProductoLine = (index: number) => {
    setFormData({
      ...formData,
      productos: formData.productos.filter((_, i) => i !== index),
    });
  };

  const calculateTotals = () => {
    const subtotal = formData.productos.reduce(
      (sum, p) => sum + p.cantidad * p.precioUnitario,
      0
    );
    const iva = subtotal * 0.16;
    const total = subtotal + iva;
    return { subtotal, iva, total };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { subtotal, iva, total } = calculateTotals();

    addVenta({
      fecha: new Date().toISOString(),
      clienteId: formData.clienteId,
      categoria: 'equipo-medico',
      productos: formData.productos,
      subtotal,
      iva,
      total,
      estatus: 'vendido',
      notas: formData.notas,
    });

    setFormData({
      clienteId: '',
      productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
      notas: '',
    });
    setIsAdding(false);
  };

  const handleFacturar = (venta: VentaMedDev) => {
    const facturaNumero = prompt('Ingrese el número de factura:');
    if (facturaNumero) {
      facturarVenta(venta.id, facturaNumero);
    }
  };

  const handleCobrar = (venta: VentaMedDev) => {
    const metodoPago = prompt('Ingrese el método de pago (ej: Transferencia, Cheque, Efectivo):');
    if (metodoPago) {
      cobrarVenta(venta.id, metodoPago);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  const { subtotal: formSubtotal, iva: formIva, total: formTotal } = calculateTotals();

  return (
    <div className="p-6 overflow-auto h-full bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Ventas - Equipo Médico</h1>
            <p className="text-gray-600">Gestión de ventas de equipos médicos</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          )}
        </div>

        {/* Formulario de Nueva Venta */}
        {isAdding && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle>Nueva Venta - Equipo Médico</CardTitle>
              <CardDescription>Complete los datos de la venta</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cliente">Cliente *</Label>
                  <select
                    id="cliente"
                    value={formData.clienteId}
                    onChange={(e) => setFormData({ ...formData, clienteId: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  >
                    <option value="">Seleccione un cliente</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.razonSocial} ({cliente.rfc})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Productos *</Label>
                    <Button type="button" size="sm" variant="outline" onClick={addProductoLine}>
                      <Plus className="h-4 w-4 mr-1" />
                      Agregar Producto
                    </Button>
                  </div>
                  {formData.productos.map((prod, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-6 space-y-2">
                        <Label>Producto</Label>
                        <select
                          value={prod.productoId}
                          onChange={(e) => handleProductoChange(index, e.target.value)}
                          className="w-full rounded-md border border-gray-300 p-2"
                          required
                        >
                          <option value="">Seleccione producto</option>
                          {productosEquipo.map((producto) => (
                            <option key={producto.id} value={producto.id}>
                              {producto.nombre} - ${producto.precio.toLocaleString('es-MX')}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label>Cantidad</Label>
                        <Input
                          type="number"
                          min="1"
                          value={prod.cantidad}
                          onChange={(e) => handleCantidadChange(index, parseInt(e.target.value) || 1)}
                          required
                        />
                      </div>
                      <div className="col-span-3 space-y-2">
                        <Label>Precio Unit.</Label>
                        <Input
                          type="number"
                          value={prod.precioUnitario}
                          disabled
                          className="bg-gray-100"
                        />
                      </div>
                      <div className="col-span-1">
                        {formData.productos.length > 1 && (
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="text-red-600"
                            onClick={() => removeProductoLine(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-100 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Subtotal</p>
                    <p className="text-lg font-semibold">${formSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">IVA (16%)</p>
                    <p className="text-lg font-semibold">${formIva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total</p>
                    <p className="text-xl font-bold text-purple-600">${formTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notas">Notas</Label>
                  <textarea
                    id="notas"
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    className="w-full rounded-md border border-gray-300 p-2 min-h-[80px]"
                    placeholder="Observaciones adicionales..."
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Guardar Venta
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    setIsAdding(false);
                    setFormData({
                      clienteId: '',
                      productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
                      notas: '',
                    });
                  }}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('vendido')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'vendido'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <ShoppingCart className="h-4 w-4 inline mr-2" />
            Vendido
          </button>
          <button
            onClick={() => setActiveTab('facturado')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'facturado'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FileText className="h-4 w-4 inline mr-2" />
            Facturado
          </button>
          <button
            onClick={() => setActiveTab('cobrado')}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === 'cobrado'
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <DollarSign className="h-4 w-4 inline mr-2" />
            Cobrado
          </button>
        </div>

        {/* Lista de Ventas */}
        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === 'vendido' && 'Ventas Realizadas'}
              {activeTab === 'facturado' && 'Ventas Facturadas'}
              {activeTab === 'cobrado' && 'Ventas Cobradas'}
            </CardTitle>
            <CardDescription>
              {ventasFiltradas.length} venta{ventasFiltradas.length !== 1 ? 's' : ''} en estado {activeTab}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {ventasFiltradas.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay ventas en este estado</p>
                </div>
              ) : (
                ventasFiltradas.map((venta) => {
                  const cliente = clientes.find((c) => c.id === venta.clienteId);
                  return (
                    <div
                      key={venta.id}
                      className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
                            {venta.folio}
                          </Badge>
                          <h3 className="font-semibold text-gray-900">
                            {cliente?.razonSocial || 'Cliente desconocido'}
                          </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600 mb-2">
                          <p>Fecha: {new Date(venta.fecha).toLocaleDateString('es-MX')}</p>
                          <p>Total: ${venta.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
                          {venta.facturaNumero && (
                            <p>Factura: {venta.facturaNumero}</p>
                          )}
                          {venta.metodoPago && (
                            <p>Pago: {venta.metodoPago}</p>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          {venta.productos.length} producto{venta.productos.length !== 1 ? 's' : ''}
                        </div>
                        {venta.notas && (
                          <p className="text-sm text-gray-600 mt-2 italic">{venta.notas}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {venta.estatus === 'vendido' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-blue-600 hover:bg-blue-50"
                            onClick={() => handleFacturar(venta)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            Facturar
                          </Button>
                        )}
                        {venta.estatus === 'facturado' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 hover:bg-green-50"
                            onClick={() => handleCobrar(venta)}
                          >
                            <DollarSign className="h-4 w-4 mr-1" />
                            Cobrar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-50"
                          onClick={() => {
                            if (confirm('¿Estás seguro de eliminar esta venta?')) {
                              deleteVenta(venta.id);
                            }
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
