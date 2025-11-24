'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useClientesMedDev } from '@/hooks/useMedDevStorage';
import { Plus, Edit, Trash2, Users, Mail, Phone, MapPin } from 'lucide-react';

export default function ClientesMedDevPage() {
  const { clientes, loading, addCliente, updateCliente, deleteCliente } = useClientesMedDev();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    razonSocial: '',
    rfc: '',
    contacto: '',
    telefono: '',
    email: '',
    direccion: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingId) {
      updateCliente(editingId, formData);
      setEditingId(null);
    } else {
      addCliente(formData);
    }

    setFormData({
      razonSocial: '',
      rfc: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
    });
    setIsAdding(false);
  };

  const handleEdit = (id: string) => {
    const cliente = clientes.find((c) => c.id === id);
    if (cliente) {
      setFormData({
        razonSocial: cliente.razonSocial,
        rfc: cliente.rfc,
        contacto: cliente.contacto || '',
        telefono: cliente.telefono || '',
        email: cliente.email || '',
        direccion: cliente.direccion || '',
      });
      setEditingId(id);
      setIsAdding(true);
    }
  };

  const handleCancel = () => {
    setFormData({
      razonSocial: '',
      rfc: '',
      contacto: '',
      telefono: '',
      email: '',
      direccion: '',
    });
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
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Clientes</h1>
            <p className="text-gray-600">Gestiona tus clientes con RFC para facturación</p>
          </div>
          {!isAdding && (
            <Button onClick={() => setIsAdding(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          )}
        </div>

        {/* Formulario */}
        {isAdding && (
          <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader>
              <CardTitle>{editingId ? 'Editar Cliente' : 'Nuevo Cliente'}</CardTitle>
              <CardDescription>
                Complete los datos del cliente para facturación
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="razonSocial">Razón Social *</Label>
                    <Input
                      id="razonSocial"
                      value={formData.razonSocial}
                      onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                      placeholder="Hospital Angeles del Pedregal S.A. de C.V."
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rfc">RFC *</Label>
                    <Input
                      id="rfc"
                      value={formData.rfc}
                      onChange={(e) => setFormData({ ...formData, rfc: e.target.value.toUpperCase() })}
                      placeholder="HAP920415KL8"
                      maxLength={13}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contacto">Persona de Contacto</Label>
                    <Input
                      id="contacto"
                      value={formData.contacto}
                      onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      placeholder="Dr. Roberto Méndez"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefono">Teléfono</Label>
                    <Input
                      id="telefono"
                      value={formData.telefono}
                      onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                      placeholder="55-1234-5678"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="compras@hospital.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="direccion">Dirección</Label>
                    <Input
                      id="direccion"
                      value={formData.direccion}
                      onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                      placeholder="Calle 123, Ciudad"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
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

        {/* Lista de Clientes */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes Registrados</CardTitle>
            <CardDescription>
              {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {clientes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>No hay clientes registrados</p>
                  <p className="text-sm">Agrega tu primer cliente para comenzar</p>
                </div>
              ) : (
                clientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="p-3 bg-purple-100 rounded-lg">
                        <Users className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-gray-900">{cliente.razonSocial}</h3>
                          <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
                            RFC: {cliente.rfc}
                          </Badge>
                        </div>
                        <div className="mt-3 space-y-1">
                          {cliente.contacto && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {cliente.contacto}
                            </p>
                          )}
                          {cliente.telefono && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {cliente.telefono}
                            </p>
                          )}
                          {cliente.email && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {cliente.email}
                            </p>
                          )}
                          {cliente.direccion && (
                            <p className="text-sm text-gray-600 flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {cliente.direccion}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-gray-500 mt-2 block">
                          Creado: {new Date(cliente.createdAt).toLocaleDateString('es-MX')}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(cliente.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:bg-red-50"
                        onClick={() => {
                          if (confirm('¿Estás seguro de eliminar este cliente?')) {
                            deleteCliente(cliente.id);
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
