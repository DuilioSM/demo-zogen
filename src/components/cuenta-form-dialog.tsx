'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Cuenta } from '@/types/cuenta';
import { ESPECIALISTAS_CATALOG } from '@/types/especialista';

interface CuentaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (cuenta: Cuenta) => void;
  cuenta?: Cuenta;
}

const ZONAS = [
  'Zona Norte',
  'Zona Centro y Occidente',
  'Zona Centro y Golfo de México 1',
  'Zona Centro y Golfo de México 2',
  'Zona Sur',
];

export function CuentaFormDialog({ open, onOpenChange, onSubmit, cuenta }: CuentaFormDialogProps) {
  const [formData, setFormData] = useState<Cuenta>({
    id: '',
    zona: '',
    nombre: '',
    telefonoCuenta: '',
    especialistaId: '',
    telefonoEspecialista: '',
  });

  useEffect(() => {
    if (cuenta) {
      setFormData(cuenta);
    } else {
      setFormData({
        id: '',
        zona: '',
        nombre: '',
        telefonoCuenta: '',
        especialistaId: '',
        telefonoEspecialista: '',
      });
    }
  }, [cuenta, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleEspecialistaChange = (especialistaId: string) => {
    const especialista = ESPECIALISTAS_CATALOG.find(e => e.id === especialistaId);
    setFormData({
      ...formData,
      especialistaId,
      telefonoEspecialista: especialista?.telefono || '',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{cuenta ? 'Editar Cuenta' : 'Agregar Cuenta'}</DialogTitle>
          <DialogDescription>
            {cuenta ? 'Actualiza la información de la cuenta' : 'Ingresa los datos de la nueva cuenta'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="id">ID</Label>
            <Input
              id="id"
              value={formData.id}
              onChange={(e) => setFormData({ ...formData, id: e.target.value })}
              placeholder="ej: dana-guzman"
              required
              disabled={!!cuenta}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zona">Zona</Label>
              <Select
                value={formData.zona}
                onValueChange={(value) => setFormData({ ...formData, zona: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una zona" />
                </SelectTrigger>
                <SelectContent>
                  {ZONAS.map((zona) => (
                    <SelectItem key={zona} value={zona}>
                      {zona}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Cuenta</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="ej: Dana Guzman"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefonoCuenta">Teléfono Cuenta</Label>
            <Input
              id="telefonoCuenta"
              value={formData.telefonoCuenta}
              onChange={(e) => setFormData({ ...formData, telefonoCuenta: e.target.value })}
              placeholder="ej: 5569319837"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="especialista">Especialista</Label>
              <Select
                value={formData.especialistaId}
                onValueChange={handleEspecialistaChange}
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

            <div className="space-y-2">
              <Label htmlFor="telefonoEspecialista">Teléfono Especialista</Label>
              <Input
                id="telefonoEspecialista"
                value={formData.telefonoEspecialista}
                disabled
                placeholder="Se llena automáticamente"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
              {cuenta ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
