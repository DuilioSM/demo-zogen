'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Trash2 } from 'lucide-react';
import { useProductosMedDev, useClientesMedDev } from '@/hooks/useMedDevStorage';
import type { ProductoMedDev } from '@/types/meddev';

interface VentaMedDevDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoria: 'equipo-medico' | 'reactivos';
  onSubmit: (data: {
    clienteId: string;
    productos: { productoId: string; cantidad: number; precioUnitario: number }[];
    notas: string;
  }) => void;
}

export function VentaMedDevDialog({
  open,
  onOpenChange,
  categoria,
  onSubmit,
}: VentaMedDevDialogProps) {
  const { productos } = useProductosMedDev();
  const { clientes } = useClientesMedDev();

  // Normalizar categoria: 'reactivos' -> 'reactivo', 'equipo-medico' -> 'equipo-medico'
  const tipoProducto = categoria === 'reactivos' ? 'reactivo' : 'equipo-medico';
  const productosFiltrados = productos.filter((p) => p.tipo === tipoProducto);

  const [formData, setFormData] = useState({
    clienteId: '',
    productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
    notas: '',
  });

  const handleProductoChange = (index: number, productoId: string) => {
    const producto = productosFiltrados.find((p) => p.id === productoId);
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
    onSubmit(formData);
    setFormData({
      clienteId: '',
      productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
      notas: '',
    });
    onOpenChange(false);
  };

  const { subtotal, iva, total } = calculateTotals();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nueva Venta - {categoria === 'reactivos' ? 'Reactivos' : 'Equipo Médico'}</DialogTitle>
          <DialogDescription>Complete los datos de la venta</DialogDescription>
        </DialogHeader>

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
                    {productosFiltrados.map((producto) => (
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
              <p className="text-lg font-semibold">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">IVA (16%)</p>
              <p className="text-lg font-semibold">${iva.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-purple-600">${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFormData({
                  clienteId: '',
                  productos: [{ productoId: '', cantidad: 1, precioUnitario: 0 }],
                  notas: '',
                });
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
