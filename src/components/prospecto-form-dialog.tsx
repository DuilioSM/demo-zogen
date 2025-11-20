'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Prospecto, EstadoProspecto } from '@/types/prospecto';
import { ESPECIALISTAS_CATALOG } from '@/types/especialista';

interface ProspectoFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (prospecto: Prospecto) => void;
  prospecto?: Prospecto;
}

export function ProspectoFormDialog({ open, onOpenChange, onSubmit, prospecto }: ProspectoFormDialogProps) {
  const [formData, setFormData] = useState<Prospecto>({
    id: '',
    nombre: '',
    email: '',
    telefono: '',
    especialistaId: '',
    estado: 'nuevo',
    notas: '',
    fechaCreacion: new Date().toISOString(),
  });

  useEffect(() => {
    if (prospecto) {
      setFormData(prospecto);
    } else {
      setFormData({
        id: '',
        nombre: '',
        email: '',
        telefono: '',
        especialistaId: '',
        estado: 'nuevo',
        notas: '',
        fechaCreacion: new Date().toISOString(),
      });
    }
  }, [prospecto, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Si no hay ID, generar uno nuevo
    const prospectoData = {
      ...formData,
      id: formData.id || `pros-${Date.now()}`,
    };

    onSubmit(prospectoData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{prospecto ? 'Editar Prospecto' : 'Agregar Prospecto'}</DialogTitle>
          <DialogDescription>
            {prospecto ? 'Actualiza la información del prospecto' : 'Ingresa los datos del nuevo prospecto'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {prospecto && (
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                value={formData.id}
                disabled
                className="bg-gray-100"
              />
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                placeholder="Dr. Roberto Martínez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="roberto@hospital.com"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono *</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                placeholder="+52 55 1234 5678"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="especialista">Especialista Asignado *</Label>
              <Select
                value={formData.especialistaId}
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estado">Estado *</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value as EstadoProspecto })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nuevo">Nuevo</SelectItem>
                  <SelectItem value="contactado">Contactado</SelectItem>
                  <SelectItem value="calificado">Calificado</SelectItem>
                  <SelectItem value="convertido">Convertido</SelectItem>
                  <SelectItem value="perdido">Perdido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {prospecto && (
              <div className="space-y-2">
                <Label htmlFor="fechaUltimoContacto">Fecha Último Contacto</Label>
                <Input
                  id="fechaUltimoContacto"
                  type="date"
                  value={formData.fechaUltimoContacto ? new Date(formData.fechaUltimoContacto).toISOString().split('T')[0] : ''}
                  onChange={(e) => setFormData({ ...formData, fechaUltimoContacto: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas (opcional)</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              placeholder="Notas adicionales sobre el prospecto"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
              {prospecto ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
