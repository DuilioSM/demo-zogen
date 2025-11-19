'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Plus, Edit, Trash2 } from 'lucide-react';
import { SERVICIOS_CATALOG } from '@/types/servicio';

export default function CatalogoServiciosPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Servicios</h1>
            <p className="text-gray-600 mt-2">
              Gestión de servicios y estudios oncogenómicos disponibles
            </p>
          </div>
          <Button className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Servicio
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Servicios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{SERVICIOS_CATALOG.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Precio Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                ${(SERVICIOS_CATALOG.reduce((sum, s) => sum + s.precio, 0) / SERVICIOS_CATALOG.length).toLocaleString()}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Laboratorios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {new Set(SERVICIOS_CATALOG.map(s => s.laboratorio)).size}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Más Solicitado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-gray-900">Panel Integral</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de servicios */}
        <Card>
          <CardHeader>
            <CardTitle>Servicios Disponibles</CardTitle>
            <CardDescription>Lista completa de estudios oncogenómicos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nombre del Servicio</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Laboratorio</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Precio</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {SERVICIOS_CATALOG.map((servicio) => (
                    <tr key={servicio.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{servicio.id}</td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{servicio.nombre}</p>
                          <p className="text-xs text-gray-500 mt-1">{servicio.descripcion.substring(0, 60)}...</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">{servicio.laboratorio}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        ${servicio.precio.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          Activo
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50">
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
    </div>
  );
}
