'use client';

import { useEffect, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface MovimientoDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tipo: 'entrada' | 'salida';
  almacenes: { id: string; nombre: string; ubicacion: string }[];
  productos: { id: string; nombre: string; tipo?: string }[];
  onSubmit: (data: {
    fecha: string;
    almacenId: string;
    productoId: string;
    cantidad: number;
    referencia?: string;
    notas?: string;
  }) => void;
  defaultAlmacenId?: string;
  lockAlmacen?: boolean;
}

export function MovimientoDialog({
  open,
  onOpenChange,
  tipo,
  almacenes,
  productos,
  onSubmit,
  defaultAlmacenId,
  lockAlmacen = false,
}: MovimientoDialogProps) {
  const [formData, setFormData] = useState({
    almacenId: defaultAlmacenId ?? '',
    productoId: '',
    cantidad: '1',
    referencia: '',
    notas: '',
  });

  useEffect(() => {
    if (open) {
      setFormData((prev) => ({
        ...prev,
        almacenId: defaultAlmacenId ?? prev.almacenId,
      }));
    }
  }, [open, defaultAlmacenId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cantidad = parseInt(formData.cantidad, 10);

    if (!formData.almacenId || !formData.productoId || isNaN(cantidad) || cantidad <= 0) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    onSubmit({
      fecha: new Date().toISOString(),
      almacenId: formData.almacenId,
      productoId: formData.productoId,
      cantidad,
      referencia: formData.referencia || undefined,
      notas: formData.notas || undefined,
    });

    setFormData({
      almacenId: defaultAlmacenId ?? '',
      productoId: '',
      cantidad: '1',
      referencia: '',
      notas: '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar {tipo === 'entrada' ? 'Entrada' : 'Salida'} de Almacén</DialogTitle>
          <DialogDescription>Complete los datos del movimiento</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="almacen">Almacén *</Label>
            <select
              id="almacen"
              value={formData.almacenId}
              onChange={(e) => setFormData({ ...formData, almacenId: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              required
              disabled={lockAlmacen}
            >
              <option value="">Seleccione almacén</option>
              {almacenes.map((almacen) => (
                <option key={almacen.id} value={almacen.id}>
                  {almacen.nombre} - {almacen.ubicacion}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="producto">Producto *</Label>
            <select
              id="producto"
              value={formData.productoId}
              onChange={(e) => setFormData({ ...formData, productoId: e.target.value })}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            >
              <option value="">Seleccione producto</option>
              {productos.map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} {producto.tipo ? `(${producto.tipo === 'equipo-medico' ? 'Equipo' : 'Reactivo'})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                value={formData.cantidad}
                onChange={(e) => setFormData({ ...formData, cantidad: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="referencia">Referencia</Label>
              <Input
                id="referencia"
                value={formData.referencia}
                onChange={(e) => setFormData({ ...formData, referencia: e.target.value })}
                placeholder="Ej: PO-1234"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              className="w-full min-h-[80px] rounded-md border border-gray-300 p-3"
              placeholder="Observaciones adicionales..."
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              className={
                tipo === 'entrada'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-orange-600 hover:bg-orange-700'
              }
            >
              {tipo === 'entrada' ? (
                <span className="flex items-center gap-2">
                  <ArrowDownToLine className="h-4 w-4" />
                  Registrar Entrada
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <ArrowUpFromLine className="h-4 w-4" />
                  Registrar Salida
                </span>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFormData({
                  almacenId: defaultAlmacenId ?? '',
                  productoId: '',
                  cantidad: '1',
                  referencia: '',
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
