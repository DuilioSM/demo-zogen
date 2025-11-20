'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { PRODUCTOS_CATALOG, Producto } from '@/types/servicio';
import { ProductoFormDialog } from '@/components/producto-form-dialog';

export default function CatalogoProductosPage() {
  const [productos, setProductos] = useState<Producto[]>(PRODUCTOS_CATALOG);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | undefined>(undefined);

  const handleAddProducto = (producto: Producto) => {
    setProductos([...productos, producto]);
    setIsDialogOpen(false);
    setEditingProducto(undefined);
  };

  const handleEditProducto = (producto: Producto) => {
    setProductos(productos.map(p => p.id === producto.id ? producto : p));
    setIsDialogOpen(false);
    setEditingProducto(undefined);
  };

  const handleDeleteProducto = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      setProductos(productos.filter(p => p.id !== id));
    }
  };

  const openEditDialog = (producto: Producto) => {
    setEditingProducto(producto);
    setIsDialogOpen(true);
  };

  const openAddDialog = () => {
    setEditingProducto(undefined);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600 mt-2">
              Gestión de productos y estudios oncogenómicos disponibles
            </p>
          </div>
          <Button onClick={openAddDialog} className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>

        {/* Lista de productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Disponibles</CardTitle>
            <CardDescription>Lista completa de estudios oncogenómicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre del Producto</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Laboratorio</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Costo</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Precio</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map((producto) => (
                    <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{producto.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{producto.nombre}</p>
                          <p className="text-xs text-gray-500 mt-1">{producto.descripcion.substring(0, 60)}...</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{producto.laboratorio}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        ${producto.costo.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        ${producto.precio.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Activo
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost" onClick={() => openEditDialog(producto)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteProducto(producto.id)}
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

      <ProductoFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={editingProducto ? handleEditProducto : handleAddProducto}
        producto={editingProducto}
      />
    </div>
  );
}
