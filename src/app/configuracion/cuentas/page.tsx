'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { CUENTAS_CATALOG, Cuenta } from '@/types/cuenta';
import { ESPECIALISTAS_CATALOG } from '@/types/especialista';
import { CuentaFormDialog } from '@/components/cuenta-form-dialog';

export default function CuentasPage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>(CUENTAS_CATALOG);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCuenta, setEditingCuenta] = useState<Cuenta | undefined>(undefined);

  const handleAddCuenta = (cuenta: Cuenta) => {
    setCuentas([...cuentas, cuenta]);
    setIsDialogOpen(false);
    setEditingCuenta(undefined);
  };

  const handleEditCuenta = (cuenta: Cuenta) => {
    setCuentas(cuentas.map(c => c.id === cuenta.id ? cuenta : c));
    setIsDialogOpen(false);
    setEditingCuenta(undefined);
  };

  const handleDeleteCuenta = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta cuenta?')) {
      setCuentas(cuentas.filter(c => c.id !== id));
    }
  };

  const openEditDialog = (cuenta: Cuenta) => {
    setEditingCuenta(cuenta);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingCuenta(undefined);
    setIsDialogOpen(true);
  };

  const getEspecialistaNombre = (especialistaId: string) => {
    return ESPECIALISTAS_CATALOG.find(e => e.id === especialistaId)?.nombreCompleto || 'No asignado';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cuentas</h1>
            <p className="text-gray-600 mt-2">
              Gestión de cuentas médicas y doctores
            </p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Cuenta
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Cuentas</CardTitle>
            <CardDescription>Cuentas médicas con especialistas asignados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Zona</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre Cuenta</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Teléfono Cuenta</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre Especialista</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Teléfono Especialista</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cuentas.map((cuenta) => (
                    <tr key={cuenta.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{cuenta.zona}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{cuenta.nombre}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{cuenta.telefonoCuenta}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{getEspecialistaNombre(cuenta.especialistaId)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{cuenta.telefonoEspecialista}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(cuenta)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCuenta(cuenta.id)}
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

      <CuentaFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingCuenta ? handleEditCuenta : handleAddCuenta}
        cuenta={editingCuenta}
      />
    </div>
  );
}
