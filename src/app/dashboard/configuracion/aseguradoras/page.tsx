'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Shield, Plus, Edit, Trash2, Mail, Phone, Clock } from 'lucide-react';

const ASEGURADORAS = [
  {
    id: 'ins-001',
    nombre: 'GNP Seguros',
    rfc: 'GSE950814AB7',
    email: 'atencion.cliente@gnp.com.mx',
    telefono: '(55) 5227-9000',
    tiempoRespuesta: '3-5 días',
    coberturaPromedio: '85%',
    estudiosActivos: 12,
    montoPromedio: '$48,500',
    estado: 'activo',
  },
  {
    id: 'ins-002',
    nombre: 'MetLife',
    rfc: 'MET890625C45',
    email: 'servicio@metlife.com.mx',
    telefono: '(55) 5328-7000',
    tiempoRespuesta: '4-6 días',
    coberturaPromedio: '80%',
    estudiosActivos: 8,
    montoPromedio: '$52,000',
    estado: 'activo',
  },
  {
    id: 'ins-003',
    nombre: 'AXA Seguros',
    rfc: 'AXA920315D89',
    email: 'contacto@axa.com.mx',
    telefono: '(55) 5169-1000',
    tiempoRespuesta: '2-4 días',
    coberturaPromedio: '90%',
    estudiosActivos: 15,
    montoPromedio: '$45,200',
    estado: 'activo',
  },
  {
    id: 'ins-004',
    nombre: 'Allianz',
    rfc: 'ALL880520E12',
    email: 'info@allianz.com.mx',
    telefono: '(55) 1500-4000',
    tiempoRespuesta: '3-5 días',
    coberturaPromedio: '82%',
    estudiosActivos: 6,
    montoPromedio: '$50,800',
    estado: 'activo',
  },
  {
    id: 'ins-005',
    nombre: 'Zurich Seguros',
    rfc: 'ZUR910710F23',
    email: 'servicio.cliente@zurich.com.mx',
    telefono: '(55) 5169-8000',
    tiempoRespuesta: '4-7 días',
    coberturaPromedio: '75%',
    estudiosActivos: 4,
    montoPromedio: '$46,300',
    estado: 'activo',
  },
  {
    id: 'ins-006',
    nombre: 'Mapfre',
    rfc: 'MAP850905G34',
    email: 'atencion@mapfre.com.mx',
    telefono: '(55) 5250-2000',
    tiempoRespuesta: '5-8 días',
    coberturaPromedio: '78%',
    estudiosActivos: 7,
    montoPromedio: '$44,700',
    estado: 'activo',
  },
];

export default function CatalogoAseguradorasPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Aseguradoras</h1>
            <p className="text-gray-600 mt-2">
              Gestión de aseguradoras y tiempos de respuesta
            </p>
          </div>
          <Button className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Aseguradora
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Aseguradoras</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{ASEGURADORAS.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Estudios Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {ASEGURADORAS.reduce((sum, a) => sum + a.estudiosActivos, 0)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tiempo Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">4 días</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cobertura Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">82%</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de aseguradoras */}
        <Card>
          <CardHeader>
            <CardTitle>Aseguradoras Registradas</CardTitle>
            <CardDescription>Detalle de aseguradoras y métricas de operación</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aseguradora</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">RFC</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Contacto</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Tiempo Respuesta</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Cobertura</th>
                    <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Estudios</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Monto Prom.</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ASEGURADORAS.map((aseguradora) => (
                    <tr key={aseguradora.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Shield className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{aseguradora.nombre}</p>
                            <Badge className="mt-1 bg-green-100 text-green-700 border-green-200 text-xs">
                              {aseguradora.estado}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm font-mono text-gray-600">{aseguradora.rfc}</td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[150px]">{aseguradora.email}</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="h-3 w-3" />
                            <span>{aseguradora.telefono}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 text-sm text-gray-900">
                          <Clock className="h-3 w-3 text-gray-500" />
                          <span>{aseguradora.tiempoRespuesta}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {aseguradora.coberturaPromedio}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-semibold text-gray-900">
                        {aseguradora.estudiosActivos}
                      </td>
                      <td className="py-3 px-4 text-sm font-semibold text-gray-900 text-right">
                        {aseguradora.montoPromedio}
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
