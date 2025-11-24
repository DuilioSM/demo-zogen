'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAlmacenes } from '@/hooks/useMedDevStorage';
import { Plus, Edit, Trash2, Warehouse } from 'lucide-react';

export default function AlmacenesPage() {
  const { almacenes, loading, addAlmacen, updateAlmacen, deleteAlmacen } = useAlmacenes();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    ubicacion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateAlmacen(editingId, formData);
      setEditingId(null);
    } else {
      addAlmacen(formData);
    }

    setFormData({ nombre: '', ubicacion: '' });
    setIsAdding(false);
  };

  const handleEdit = (id: string) => {
    const almacen = almacenes.find((a) => a.id === id);
    if (almacen) {
      setFormData({
        nombre: almacen.nombre,
        ubicacion: almacen.ubicacion,
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleCancel = () => {
    setFormData({ nombre: '', ubicacion: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="p-6 overflow-auto h-full bg-gray-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Almacenes</h1>
            <p className="text-gray-600">Gestiona los almacenes de inventario</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Almacén
            </Button>
          )}
        </div>

        {/* Formulario */}
        {isAdding && (
          <Card className="border-green-200 bg-green-50/50">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Almacén' : 'Nuevo Almacén'}</CardTitle>
              <CardDescription>
                Complete los datos básicos del almacén
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Almacén *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Almacén Central"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ubicacion">Ubicación *</Label>
                    <Input
                      id="ubicacion"
                      value={formData.ubicacion}
                      onChange={(e) => setFormData({ ...formData, ubicacion: e.target.value })}
                      placeholder="Ej: Guadalajara, Jalisco"
                      required
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingId ? 'Actualizar' : 'Guardar'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    Cancelar
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Lista de Almacenes */}
        <Card>
          <CardHeader>
            <CardTitle>Almacenes Registrados</CardTitle>
            <CardDescription>
              {almacenes.length} almacén{almacenes.length !== 1 ? 'es' : ''} configurado{almacenes.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {almacenes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Warehouse className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay almacenes registrados</p>
                  <p className="text-sm">Agrega tu primer almacén para comenzar</p>
                </div>
              ) : (
                almacenes.map((almacen) => (
                  <div
                    key={almacen.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-green-100 rounded-lg">
                        <Warehouse className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{almacen.nombre}</h3>
                        <p className="text-sm text-gray-600 mt-1">{almacen.ubicacion}</p>
                        <span className="text-xs text-gray-500 mt-2 block">
                          Creado: {new Date(almacen.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(almacen.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este almacén?')) {
                            deleteAlmacen(almacen.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
