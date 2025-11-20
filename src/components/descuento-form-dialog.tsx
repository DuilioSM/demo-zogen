'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Descuento } from '@/types/descuento';
import { PRODUCTOS_CATALOG } from '@/types/servicio';
import { ASEGURADORAS_CATALOG } from '@/types/aseguradora';

interface DescuentoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (descuento: Descuento) => void;
  descuento?: Descuento;
}

export function DescuentoFormDialog({ open, onOpenChange, onSubmit, descuento }: DescuentoFormDialogProps) {
  const [formData, setFormData] = useState<Descuento>({
    id: '',
    productoId: '',
    aseguradoraId: '',
    porcentaje: 0,
    descripcion: '',
  });

  useEffect(() => {
    if (descuento) {
      setFormData(descuento);
    } else {
      setFormData({
        id: '',
        productoId: '',
        aseguradoraId: '',
        porcentaje: 0,
        descripcion: '',
      });
    }
  }, [descuento, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{descuento ? 'Editar Descuento' : 'Agregar Descuento'}</DialogTitle>
          <DialogDescription>
            {descuento ? 'Actualiza la información del descuento' : 'Ingresa los datos del nuevo descuento'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="ej: desc-1"
              required
              disabled={!!descuento}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productoId">Producto</Label>
              <Select
                value={formData.productoId}
                onValueChange={(value) => setFormData({ ...formData, productoId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un producto" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCTOS_CATALOG.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aseguradoraId">Aseguradora</Label>
              <Select
                value={formData.aseguradoraId}
                onValueChange={(value) => setFormData({ ...formData, aseguradoraId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una aseguradora" />
                </SelectTrigger>
                <SelectContent>
                  {ASEGURADORAS_CATALOG.map((aseguradora) => (
                    <SelectItem key={aseguradora.id} value={aseguradora.id}>
                      {aseguradora.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="porcentaje">Porcentaje de Descuento (%)</Label>
            <Input
              id="porcentaje"
              type="number"
              step="0.1"
              min="0"
              max="100"
              value={formData.porcentaje}
              onChange={(e) => setFormData({ ...formData, porcentaje: parseFloat(e.target.value) || 0 })}
              placeholder="10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción del descuento"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
              {descuento ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
