'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Comision, TipoComision } from '@/types/comision';
import { PRODUCTOS_CATALOG } from '@/types/servicio';
import { ESPECIALISTAS_CATALOG } from '@/types/especialista';
import { CUENTAS_CATALOG } from '@/types/cuenta';

interface ComisionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (comision: Comision) => void;
  comision?: Comision;
}

export function ComisionFormDialog({ open, onOpenChange, onSubmit, comision }: ComisionFormDialogProps) {
  const [formData, setFormData] = useState<Comision>({
    id: '',
    productoId: '',
    tipo: 'especialista',
    especialistaId: undefined,
    cuentaId: undefined,
    monto: 0,
    porcentaje: undefined,
    descripcion: '',
  });

  useEffect(() => {
    if (comision) {
      setFormData(comision);
    } else {
      setFormData({
        id: '',
        productoId: '',
        tipo: 'especialista',
        especialistaId: undefined,
        cuentaId: undefined,
        monto: 0,
        porcentaje: undefined,
        descripcion: '',
      });
    }
  }, [comision, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleTipoChange = (tipo: TipoComision) => {
    setFormData({
      ...formData,
      tipo,
      especialistaId: tipo === 'especialista' ? formData.especialistaId : undefined,
      cuentaId: tipo === 'cuenta' ? formData.cuentaId : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{comision ? 'Editar Comisión' : 'Agregar Comisión'}</DialogTitle>
          <DialogDescription>
            {comision ? 'Actualiza la información de la comisión' : 'Ingresa los datos de la nueva comisión'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="ej: com-1"
              required
              disabled={!!comision}
            />
          </div>

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
            <Label htmlFor="tipo">Tipo de Comisión</Label>
            <Select
              value={formData.tipo}
              onValueChange={(value) => handleTipoChange(value as TipoComision)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="especialista">Especialista</SelectItem>
                <SelectItem value="cuenta">Cuenta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.tipo === 'especialista' && (
            <div className="space-y-2">
              <Label htmlFor="especialistaId">Especialista</Label>
              <Select
                value={formData.especialistaId || ''}
                onValueChange={(value) => setFormData({ ...formData, especialistaId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un especialista" />
                </SelectTrigger>
                <SelectContent>
                  {ESPECIALISTAS_CATALOG.map((especialista) => (
                    <SelectItem key={especialista.id} value={especialista.id}>
                      {especialista.nombreCompleto}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.tipo === 'cuenta' && (
            <div className="space-y-2">
              <Label htmlFor="cuentaId">Cuenta</Label>
              <Select
                value={formData.cuentaId || ''}
                onValueChange={(value) => setFormData({ ...formData, cuentaId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una cuenta" />
                </SelectTrigger>
                <SelectContent>
                  {CUENTAS_CATALOG.map((cuenta) => (
                    <SelectItem key={cuenta.id} value={cuenta.id}>
                      {cuenta.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="monto">Monto</Label>
              <Input
                id="monto"
                type="number"
                step="0.01"
                value={formData.monto}
                onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) || 0 })}
                placeholder="5000"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="porcentaje">Porcentaje (opcional)</Label>
              <Input
                id="porcentaje"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.porcentaje || ''}
                onChange={(e) => setFormData({ ...formData, porcentaje: e.target.value ? parseFloat(e.target.value) : undefined })}
                placeholder="7.5"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Descripción de la comisión"
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
              {comision ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
