'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { ESPECIALISTAS_CATALOG, Especialista } from '@/types/especialista';
import { EspecialistaFormDialog } from '@/components/especialista-form-dialog';

export default function EspecialistasPage() {
  const [especialistas, setEspecialistas] = useState<Especialista[]>(ESPECIALISTAS_CATALOG);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEspecialista, setEditingEspecialista] = useState<Especialista | undefined>(undefined);

  const handleAddEspecialista = (especialista: Especialista) => {
    setEspecialistas([...especialistas, especialista]);
    setIsDialogOpen(false);
    setEditingEspecialista(undefined);
  };

  const handleEditEspecialista = (especialista: Especialista) => {
    setEspecialistas(especialistas.map(e => e.id === especialista.id ? especialista : e));
    setIsDialogOpen(false);
    setEditingEspecialista(undefined);
  };

  const handleDeleteEspecialista = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este especialista?')) {
      setEspecialistas(especialistas.filter(e => e.id !== id));
    }
  };

  const openEditDialog = (especialista: Especialista) => {
    setEditingEspecialista(especialista);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingEspecialista(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Especialistas (Vendedores)</h1>
            <p className="text-gray-600 mt-2">
              Gestión del equipo de ventas y especialistas
            </p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Especialista
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Especialistas</CardTitle>
            <CardDescription>Equipo de ventas de Zogen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre Especialista</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Teléfono</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {especialistas.map((especialista) => (
                    <tr key={especialista.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{especialista.nombreCompleto}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{especialista.telefono}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(especialista)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteEspecialista(especialista.id)}
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

      <EspecialistaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingEspecialista ? handleEditEspecialista : handleAddEspecialista}
        especialista={editingEspecialista}
      />
    </div>
  );
}
