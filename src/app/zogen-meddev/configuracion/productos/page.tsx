'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useProductosMedDev } from '@/hooks/useMedDevStorage';
import { Plus, Edit, Trash2, Package } from 'lucide-react';

export default function ProductosMedDevPage() {
  const { productos, loading, addProducto, updateProducto, deleteProducto } = useProductosMedDev();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTipo, setActiveTipo] = useState<'equipo-medico' | 'reactivo'>('equipo-medico');
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    descripcion: '',
    tipo: 'equipo-medico' as 'equipo-medico' | 'reactivo',
  });

  const categoriaConfig = useMemo(
    () => ({
      'equipo-medico': {
        label: 'Productos · Equipos Médicos',
        description: 'Monitores, ventiladores, kits quirúrgicos y hardware clínico',
        accent: 'border-blue-200 bg-blue-100/40 text-blue-700',
      },
      reactivo: {
        label: 'Productos · Reactivos',
        description: 'Insumos, cartuchos, paneles de laboratorio y controles',
        accent: 'border-emerald-200 bg-emerald-100/40 text-emerald-700',
      },
    }),
    []
  );

  const productosFiltrados = productos.filter((producto) => producto.tipo === activeTipo);

  useEffect(() => {
    if (!isAdding || editingId) return;
    setFormData((prev) => ({ ...prev, tipo: activeTipo }));
  }, [activeTipo, editingId, isAdding]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateProducto(editingId, {
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        descripcion: formData.descripcion,
        tipo: formData.tipo,
      });
      setEditingId(null);
    } else {
      addProducto({
        nombre: formData.nombre,
        precio: parseFloat(formData.precio),
        descripcion: formData.descripcion,
        tipo: formData.tipo,
      });
    }

    setFormData({ nombre: '', precio: '', descripcion: '', tipo: activeTipo });
    setIsAdding(false);
  };

  const handleEdit = (id: string) => {
    const producto = productos.find((p) => p.id === id);
    if (producto) {
      setActiveTipo(producto.tipo);
      setFormData({
        nombre: producto.nombre,
        precio: producto.precio.toString(),
        descripcion: producto.descripcion || '',
        tipo: producto.tipo,
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleCancel = () => {
    setFormData({ nombre: '', precio: '', descripcion: '', tipo: activeTipo });
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
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Productos</h1>
            <p className="text-gray-600">Administra los catálogos de reactivos y equipos médicos</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              {activeTipo === 'equipo-medico' ? 'Nuevo Equipo' : 'Nuevo Reactivo'}
            </Button>
          )}
        </div>

        {/* Selector de categoría */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['equipo-medico', 'reactivo'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => {
                setActiveTipo(tipo);
                if (!editingId && !isAdding) {
                  setFormData({ nombre: '', precio: '', descripcion: '', tipo });
                }
              }}
              className={`rounded-2xl border-2 p-4 text-left transition-all ${
                activeTipo === tipo
                  ? 'border-blue-400 bg-white shadow-md'
                  : 'border-gray-200 bg-white/60 hover:border-blue-200'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                {tipo === 'equipo-medico' ? 'Productos' : 'Consumibles'}
              </p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {categoriaConfig[tipo].label}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {categoriaConfig[tipo].description}
              </p>
              <p className="text-sm font-medium text-gray-700 mt-3">
                {productos.filter((p) => p.tipo === tipo).length} producto(s)
              </p>
            </button>
          ))}
        </div>

        {/* Formulario */}
        {isAdding && (
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle>
                {editingId
                  ? `Editar ${formData.tipo === 'equipo-medico' ? 'Equipo' : 'Reactivo'}`
                  : `Nuevo ${formData.tipo === 'equipo-medico' ? 'Equipo' : 'Reactivo'}`}
              </CardTitle>
              <CardDescription>
                Define el catálogo para {formData.tipo === 'equipo-medico' ? 'equipos médicos' : 'reactivos'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipo">Tipo de producto *</Label>
                  <select
                    id="tipo"
                    value={formData.tipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipo: e.target.value as 'equipo-medico' | 'reactivo',
                      })
                    }
                    className="w-full rounded-md border border-gray-300 p-2"
                    required
                  >
                    <option value="equipo-medico">Equipo Médico</option>
                    <option value="reactivo">Reactivo</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre del Producto *</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                      placeholder="Ej: Gtrain 1,600"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precio">Precio (MXN) *</Label>
                    <Input
                      id="precio"
                      type="number"
                      step="0.01"
                      value={formData.precio}
                      onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                      placeholder="45000"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descripcion">Descripción</Label>
                  <Input
                    id="descripcion"
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    placeholder="Monitor de signos vitales..."
                  />
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
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

        {/* Lista de Productos */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Registrados</CardTitle>
            <CardDescription>
              {productosFiltrados.length} producto{productosFiltrados.length !== 1 ? 's' : ''} en el catálogo de {activeTipo === 'equipo-medico' ? 'equipos médicos' : 'reactivos'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {productosFiltrados.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay productos registrados</p>
                  <p className="text-sm">Agrega tu primer producto para comenzar</p>
                </div>
              ) : (
                productosFiltrados.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-blue-100 rounded-lg">
                        <Package className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{producto.nombre}</h3>
                        {producto.descripcion && (
                          <p className="text-sm text-gray-600 mt-1">{producto.descripcion}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2">
                          <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">
                            ${producto.precio.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              producto.tipo === 'equipo-medico'
                                ? 'text-blue-700 border-blue-200 bg-blue-50'
                                : 'text-emerald-700 border-emerald-200 bg-emerald-50'
                            }
                          >
                            {producto.tipo === 'equipo-medico' ? 'Equipo Médico' : 'Reactivo'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            Creado: {new Date(producto.createdAt).toLocaleDateString('es-MX')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(producto.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este producto?')) {
                            deleteProducto(producto.id);
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
