'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Plus, Edit, Trash2, Mail, Phone, Globe } from 'lucide-react';

const LABORATORIOS = [
  {
    id: 'lab-001',
    nombre: 'Tempus Labs',
    pais: 'Estados Unidos',
    ciudad: 'Chicago, IL',
    email: 'support@tempus.com',
    telefono: '+1 (312) 292-0484',
    website: 'www.tempus.com',
    servicios: 3,
    tiempoEntrega: '16 días',
    especialidad: 'Oncogenómica integral',
    certificaciones: ['CAP', 'CLIA', 'ISO 15189'],
  },
  {
    id: 'lab-002',
    nombre: 'Foundation Medicine',
    pais: 'Estados Unidos',
    ciudad: 'Cambridge, MA',
    email: 'info@foundationmedicine.com',
    telefono: '+1 (888) 988-3639',
    website: 'www.foundationmedicine.com',
    servicios: 2,
    tiempoEntrega: '18 días',
    especialidad: 'Perfilado genómico completo',
    certificaciones: ['CAP', 'CLIA', 'ISO 15189'],
  },
  {
    id: 'lab-003',
    nombre: 'Guardant Health',
    pais: 'Estados Unidos',
    ciudad: 'Redwood City, CA',
    email: 'contact@guardanthealth.com',
    telefono: '+1 (855) 698-8887',
    website: 'www.guardanthealth.com',
    servicios: 2,
    tiempoEntrega: '15 días',
    especialidad: 'Biopsia líquida',
    certificaciones: ['CAP', 'CLIA', 'CE-IVD'],
  },
  {
    id: 'lab-004',
    nombre: 'Caris Life Sciences',
    pais: 'Estados Unidos',
    ciudad: 'Irving, TX',
    email: 'info@carisls.com',
    telefono: '+1 (888) 867-5633',
    website: 'www.carislifesciences.com',
    servicios: 1,
    tiempoEntrega: '20 días',
    especialidad: 'Medicina de precisión',
    certificaciones: ['CAP', 'CLIA'],
  },
  {
    id: 'lab-005',
    nombre: 'NeoGenomics',
    pais: 'Estados Unidos',
    ciudad: 'Fort Myers, FL',
    email: 'clientservices@neogenomics.com',
    telefono: '+1 (866) 776-5907',
    website: 'www.neogenomics.com',
    servicios: 1,
    tiempoEntrega: '17 días',
    especialidad: 'Patología oncológica',
    certificaciones: ['CAP', 'CLIA', 'ISO 15189'],
  },
];

export default function CatalogoLaboratoriosPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Catálogo de Laboratorios</h1>
            <p className="text-gray-600 mt-2">
              Gestión de laboratorios asociados para estudios oncogenómicos
            </p>
          </div>
          <Button className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Laboratorio
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Laboratorios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{LABORATORIOS.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Activos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{LABORATORIOS.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tiempo Promedio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">17 días</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Países</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">1</div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de laboratorios */}
        <div className="grid gap-4">
          {LABORATORIOS.map((lab) => (
            <Card key={lab.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{lab.nombre}</CardTitle>
                      <CardDescription>{lab.ciudad}, {lab.pais}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Contacto</p>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Mail className="h-3 w-3 text-gray-500" />
                        <span className="truncate">{lab.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Phone className="h-3 w-3 text-gray-500" />
                        <span>{lab.telefono}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Globe className="h-3 w-3 text-gray-500" />
                        <span className="truncate">{lab.website}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Servicios</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{lab.servicios} servicios activos</p>
                      <p className="text-xs text-gray-600">{lab.especialidad}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Tiempo de Entrega</p>
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-gray-900">{lab.tiempoEntrega}</p>
                      <Badge className="bg-green-100 text-green-700 border-green-200">
                        En tiempo
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Certificaciones</p>
                    <div className="flex flex-wrap gap-1">
                      {lab.certificaciones.map((cert) => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
