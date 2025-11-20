'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Producto } from '@/types/servicio';
import { LABORATORIOS_CATALOG } from '@/types/laboratorio';

interface ProductoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (producto: Producto) => void;
  producto?: Producto;
}

export function ProductoFormDialog({ open, onOpenChange, onSubmit, producto }: ProductoFormDialogProps) {
  const [formData, setFormData] = useState<Producto>({
    id: '',
    nombre: '',
    descripcion: '',
    precio: 0,
    costo: 0,
    laboratorio: '',
    tiempoEntrega: '',
    categoria: 'oncogenomico',
  });

  useEffect(() => {
    if (producto) {
      setFormData(producto);
    } else {
      setFormData({
        id: '',
        nombre: '',
        descripcion: '',
        precio: 0,
        costo: 0,
        laboratorio: '',
        tiempoEntrega: '',
        categoria: 'oncogenomico',
      });
    }
  }, [producto, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
          <DialogDescription>
            {producto ? 'Actualiza la información del producto' : 'Ingresa los datos del nuevo producto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="ej: foundation-one-liq"
                required
                disabled={!!producto}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="ej: FoundationOneLiq"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción detallada del producto"
              rows={3}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="laboratorio">Laboratorio</Label>
              <Select
                value={formData.laboratorio}
                onValueChange={(value) => setFormData({ ...formData, laboratorio: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un laboratorio" />
                </SelectTrigger>
                <SelectContent>
                  {LABORATORIOS_CATALOG.map((lab) => (
                    <SelectItem key={lab.id} value={lab.nombre}>
                      {lab.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría</Label>
              <Select
                value={formData.categoria}
                onValueChange={(value) => setFormData({ ...formData, categoria: value as Producto['categoria'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="oncogenomico">Oncogenómico</SelectItem>
                  <SelectItem value="panel-cancer">Panel Cáncer</SelectItem>
                  <SelectItem value="predisposicion">Predisposición</SelectItem>
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="costo">Costo</Label>
              <Input
                id="costo"
                type="number"
                step="0.01"
                value={formData.costo}
                onChange={(e) => setFormData({ ...formData, costo: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="precio">Precio</Label>
              <Input
                id="precio"
                type="number"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiempoEntrega">Tiempo de Entrega</Label>
              <Input
                id="tiempoEntrega"
                value={formData.tiempoEntrega}
                onChange={(e) => setFormData({ ...formData, tiempoEntrega: e.target.value })}
                placeholder="15-20 días"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
              {producto ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
