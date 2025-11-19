'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FileText, Receipt, Users, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';

export default function CRMZogenPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRM Zogen</h1>
          <p className="text-gray-600 mt-2">
            Gestión completa de solicitudes de estudios oncológicos y cotizaciones
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Solicitudes Activas</CardTitle>
              <FileText className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">47</div>
              <p className="text-xs text-gray-500 mt-1">En proceso</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">En Documentación</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">32</div>
              <p className="text-xs text-gray-500 mt-1">Recopilando expedientes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Cotizaciones</CardTitle>
              <Receipt className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">18</div>
              <p className="text-xs text-gray-500 mt-1">Enviadas a aseguradoras</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aprobadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">15</div>
              <p className="text-xs text-gray-500 mt-1">Con carta pase</p>
            </CardContent>
          </Card>
        </div>

        {/* Módulos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Solicitudes de Estudios</CardTitle>
                  <CardDescription>Gestión de peticiones de doctores</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Administra las solicitudes de estudios oncológicos desde que el doctor las solicita por WhatsApp.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Registro de solicitudes de doctores</li>
                <li>• Recopilación de documentación del paciente</li>
                <li>• Gestión de expedientes completos</li>
                <li>• Seguimiento de estado</li>
              </ul>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/ventas/crm-zogen/solicitudes">
                  Ir a Solicitudes
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <Receipt className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Cotizaciones</CardTitle>
                  <CardDescription>Envío a aseguradoras</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Prepara y envía cotizaciones con expedientes completos a las aseguradoras para aprobación.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Preparación de expedientes completos</li>
                <li>• Envío a aseguradoras por correo</li>
                <li>• Seguimiento de cartas pase</li>
                <li>• Control de aprobaciones</li>
              </ul>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/ventas/crm-zogen/cotizaciones">
                  Ir a Cotizaciones
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Actividad reciente */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el CRM Zogen</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nueva solicitud registrada</p>
                  <p className="text-xs text-gray-600">Dr. Ramírez • Panel cáncer de mama • Hace 10 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-orange-50 border border-orange-100">
                <Clock className="h-5 w-5 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Documentación recibida</p>
                  <p className="text-xs text-gray-600">Paciente: María González • Expediente 80% completo • Hace 30 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <Receipt className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cotización enviada</p>
                  <p className="text-xs text-gray-600">GNP Seguros • Oncogenómico integral • Hace 1 hora</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Carta pase recibida</p>
                  <p className="text-xs text-gray-600">MetLife • Paciente: Carlos Medina • Hace 2 horas</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
