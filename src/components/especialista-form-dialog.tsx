'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Especialista } from '@/types/especialista';

interface EspecialistaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (especialista: Especialista) => void;
  especialista?: Especialista;
}

export function EspecialistaFormDialog({ open, onOpenChange, onSubmit, especialista }: EspecialistaFormDialogProps) {
  const [formData, setFormData] = useState<Especialista>({
    id: '',
    nombreCompleto: '',
    telefono: '',
  });

  useEffect(() => {
    if (especialista) {
      setFormData(especialista);
    } else {
      setFormData({
        id: '',
        nombreCompleto: '',
        telefono: '',
      });
    }
  }, [especialista, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{especialista ? 'Editar Especialista' : 'Agregar Especialista'}</DialogTitle>
          <DialogDescription>
            {especialista ? 'Actualiza la información del especialista' : 'Ingresa los datos del nuevo especialista'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="ej: sonia-cruz"
              required
              disabled={!!especialista}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nombreCompleto">Nombre Completo</Label>
            <Input
              id="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={(e) => setFormData({ ...formData, nombreCompleto: e.target.value })}
              placeholder="ej: Sonia Cruz"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="ej: +52 55 689"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
              {especialista ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
