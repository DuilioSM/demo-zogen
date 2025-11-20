'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Doctor } from '@/types/doctor';

interface DoctorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (doctor: Doctor) => void;
  doctor?: Doctor;
}

const ZONAS = [
  'Zona Norte',
  'Zona Centro y Occidente',
  'Zona Centro y Golfo de México 1',
  'Zona Centro y Golfo de México 2',
  'Zona Sur',
];

export function DoctorFormDialog({ open, onOpenChange, onSubmit, doctor }: DoctorFormDialogProps) {
  const [formData, setFormData] = useState<Doctor>({
    id: '',
    zona: '',
    nombre: '',
    telefono: '',
  });

  useEffect(() => {
    if (doctor) {
      setFormData(doctor);
    } else {
      setFormData({
        id: '',
        zona: '',
        nombre: '',
        telefono: '',
      });
    }
  }, [doctor, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{doctor ? 'Editar Doctor' : 'Agregar Doctor'}</DialogTitle>
          <DialogDescription>
            {doctor ? 'Actualiza la información del doctor' : 'Ingresa los datos del nuevo doctor'}
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
              disabled={!!doctor}
            />
          </div>

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
            <Label htmlFor="nombre">Nombre</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="ej: Dana Guzman"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefono">Teléfono</Label>
            <Input
              id="telefono"
              value={formData.telefono}
              onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              placeholder="ej: 5569319837"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
              {doctor ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
