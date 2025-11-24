'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PROSPECTOS_CATALOG, Prospecto, EstadoProspecto } from '@/types/prospecto';
import { ESPECIALISTAS_CATALOG } from '@/types/especialista';
import { ProspectoFormDialog } from '@/components/prospecto-form-dialog';

const PROSPECTOS_STORAGE_KEY = 'zogen-prospectos';

const ESTADO_COLORS: Record<EstadoProspecto, string> = {
  nuevo: 'bg-blue-100 text-blue-700 border-blue-200',
  contactado: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  calificado: 'bg-purple-100 text-purple-700 border-purple-200',
  convertido: 'bg-green-100 text-green-700 border-green-200',
  perdido: 'bg-red-100 text-red-700 border-red-200',
};

const ESTADO_LABELS: Record<EstadoProspecto, string> = {
  nuevo: 'Nuevo',
  contactado: 'Contactado',
  calificado: 'Calificado',
  convertido: 'Convertido',
  perdido: 'Perdido',
};

export default function ProspectosPage() {
  const [prospectos, setProspectos] = useState<Prospecto[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProspecto, setEditingProspecto] = useState<Prospecto | undefined>(undefined);

  useEffect(() => {
    const stored = localStorage.getItem(PROSPECTOS_STORAGE_KEY);
    if (stored) {
      try {
        setProspectos(JSON.parse(stored));
        return;
      } catch (error) {
        console.error('Error cargando prospectos almacenados', error);
      }
    }
    setProspectos(PROSPECTOS_CATALOG);
    localStorage.setItem(PROSPECTOS_STORAGE_KEY, JSON.stringify(PROSPECTOS_CATALOG));
  }, []);

  const handleAddProspecto = (prospecto: Prospecto) => {
    setProspectos((prev) => {
      const updated = [...prev, prospecto];
      localStorage.setItem(PROSPECTOS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setIsDialogOpen(false);
    setEditingProspecto(undefined);
  };

  const handleEditProspecto = (prospecto: Prospecto) => {
    setProspectos((prev) => {
      const updated = prev.map(p => p.id === prospecto.id ? prospecto : p);
      localStorage.setItem(PROSPECTOS_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
    setIsDialogOpen(false);
    setEditingProspecto(undefined);
  };

  const handleDeleteProspecto = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este prospecto?')) {
      setProspectos((prev) => {
        const updated = prev.filter(p => p.id !== id);
        localStorage.setItem(PROSPECTOS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    }
  };

  const openEditDialog = (prospecto: Prospecto) => {
    setEditingProspecto(prospecto);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProspecto(undefined);
    setIsDialogOpen(true);
  };

  const getEspecialistaNombre = (especialistaId: string) => {
    return ESPECIALISTAS_CATALOG.find(e => e.id === especialistaId)?.nombreCompleto || 'No asignado';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Prospectos</h1>
            <p className="text-gray-600 mt-2">
              Gestión de prospectos de ventas y seguimiento
            </p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Prospecto
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Prospectos</CardTitle>
            <CardDescription>Prospectos con estado de seguimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Teléfono</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Especialista</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha Creación</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Último Contacto</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {prospectos.map((prospecto) => (
                    <tr key={prospecto.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{prospecto.nombre}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{prospecto.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{prospecto.telefono}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{getEspecialistaNombre(prospecto.especialistaId)}</td>
                      <td className="py-3 px-4">
                        <Badge className={ESTADO_COLORS[prospecto.estado]}>
                          {ESTADO_LABELS[prospecto.estado]}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{formatDate(prospecto.fechaCreacion)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{formatDate(prospecto.fechaUltimoContacto)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(prospecto)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProspecto(prospecto.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <ProspectoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingProspecto ? handleEditProspecto : handleAddProspecto}
        prospecto={editingProspecto}
      />
    </div>
  );
}
