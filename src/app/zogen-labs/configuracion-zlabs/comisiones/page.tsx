'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { COMISIONES_CATALOG, Comision } from '@/types/comision';
import { PRODUCTOS_CATALOG } from '@/types/servicio';
import { ESPECIALISTAS_CATALOG } from '@/types/especialista';
import { CUENTAS_CATALOG } from '@/types/cuenta';
import { ComisionFormDialog } from '@/components/comision-form-dialog';

export default function ComisionesPage() {
  const [comisiones, setComisiones] = useState<Comision[]>(COMISIONES_CATALOG);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingComision, setEditingComision] = useState<Comision | undefined>(undefined);

  const handleAddComision = (comision: Comision) => {
    setComisiones([...comisiones, comision]);
    setIsDialogOpen(false);
    setEditingComision(undefined);
  };

  const handleEditComision = (comision: Comision) => {
    setComisiones(comisiones.map(c => c.id === comision.id ? comision : c));
    setIsDialogOpen(false);
    setEditingComision(undefined);
  };

  const handleDeleteComision = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar esta comisión?')) {
      setComisiones(comisiones.filter(c => c.id !== id));
    }
  };

  const openEditDialog = (comision: Comision) => {
    setEditingComision(comision);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingComision(undefined);
    setIsDialogOpen(true);
  };

  const getProductoName = (productoId: string) => {
    return PRODUCTOS_CATALOG.find(p => p.id === productoId)?.nombre || 'Desconocido';
  };

  const getEspecialistaName = (especialistaId?: string) => {
    if (!especialistaId) return '-';
    const esp = ESPECIALISTAS_CATALOG.find(e => e.id === especialistaId);
    return esp ? esp.nombreCompleto : 'Desconocido';
  };

  const getCuentaName = (cuentaId?: string) => {
    if (!cuentaId) return '-';
    return CUENTAS_CATALOG.find(c => c.id === cuentaId)?.nombre || 'Desconocido';
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Comisiones</h1>
            <p className="text-gray-600 mt-2">
              Gestión de comisiones para especialistas y cuentas
            </p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Comisión
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Lista de Comisiones</CardTitle>
            <CardDescription>Comisiones configuradas por producto y vendedor/cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Producto</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Beneficiario</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Monto</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">%</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Descripción</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {comisiones.map((comision) => (
                    <tr key={comision.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{getProductoName(comision.productoId)}</td>
                      <td className="py-3 px-4">
                        <Badge className={comision.tipo === 'especialista' ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-green-100 text-green-700 border-green-200'}>
                          {comision.tipo === 'especialista' ? 'Especialista' : 'Cuenta'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {comision.tipo === 'especialista' ? getEspecialistaName(comision.especialistaId) : getCuentaName(comision.cuentaId)}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        ${comision.monto.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right">
                        {comision.porcentaje ? `${comision.porcentaje}%` : '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{comision.descripcion || '-'}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(comision)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteComision(comision.id)}
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

      <ComisionFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingComision ? handleEditComision : handleAddComision}
        comision={editingComision}
      />
    </div>
  );
}
