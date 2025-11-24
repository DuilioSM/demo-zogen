'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { DESCUENTOS_CATALOG, Descuento } from '@/types/descuento';
import { PRODUCTOS_CATALOG } from '@/types/servicio';
import { ASEGURADORAS_CATALOG } from '@/types/aseguradora';
import { DescuentoFormDialog } from '@/components/descuento-form-dialog';

export default function DescuentosPage() {
  const [descuentos, setDescuentos] = useState<Descuento[]>(DESCUENTOS_CATALOG);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDescuento, setEditingDescuento] = useState<Descuento | undefined>(undefined);

  const handleAddDescuento = (descuento: Descuento) => {
    setDescuentos([...descuentos, descuento]);
    setIsDialogOpen(false);
    setEditingDescuento(undefined);
  };

  const handleEditDescuento = (descuento: Descuento) => {
    setDescuentos(descuentos.map(d => d.id === descuento.id ? descuento : d));
    setIsDialogOpen(false);
    setEditingDescuento(undefined);
  };

  const handleDeleteDescuento = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este descuento?')) {
      setDescuentos(descuentos.filter(d => d.id !== id));
    }
  };

  const openEditDialog = (descuento: Descuento) => {
    setEditingDescuento(descuento);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingDescuento(undefined);
    setIsDialogOpen(true);
  };

  const getProductoName = (productoId: string) => {
    return PRODUCTOS_CATALOG.find(p => p.id === productoId)?.nombre || 'Desconocido';
  };

  const getAseguradoraName = (aseguradoraId: string) => {
    return ASEGURADORAS_CATALOG.find(a => a.id === aseguradoraId)?.nombre || 'Desconocido';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Descuentos</h1>
            <p className="text-gray-600 mt-2">
              Gestión de descuentos por producto y aseguradora
            </p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Descuento
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Descuentos</CardTitle>
            <CardDescription>Descuentos configurados por producto y cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aseguradora</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">% Descuento</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descripción</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {descuentos.map((descuento) => (
                    <tr key={descuento.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{getProductoName(descuento.productoId)}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{getAseguradoraName(descuento.aseguradoraId)}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">{descuento.porcentaje}%</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{descuento.descripcion || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(descuento)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteDescuento(descuento.id)}
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

      <DescuentoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingDescuento ? handleEditDescuento : handleAddDescuento}
        descuento={editingDescuento}
      />
    </div>
  );
}
