'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { MessageSquare, FileText, Users, TrendingUp, Clock, Phone } from 'lucide-react';

export default function VentasOverviewPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Módulo de Ventas</h1>
          <p className="text-gray-600 mt-2">
            Gestión completa del proceso de ventas: desde el primer contacto hasta la cotización aprobada
          </p>
        </div>

        {/* KPIs de ventas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vendedores Activos</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">12</div>
              <p className="text-xs text-gray-500 mt-1">Con conexión WhatsApp</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversaciones</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">347</div>
              <p className="text-xs text-gray-500 mt-1">Leads en WhatsApp</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Solicitudes</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">47</div>
              <p className="text-xs text-gray-500 mt-1">Estudios solicitados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tasa de Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">68%</div>
              <p className="text-xs text-gray-500 mt-1">De lead a solicitud</p>
            </CardContent>
          </Card>
        </div>

        {/* Módulos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-purple-100 flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>CRM WhatsApp</CardTitle>
                  <CardDescription>Gestión de conversaciones por vendedor</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Administra las conversaciones de WhatsApp, leads y pipeline de ventas de cada vendedor.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Bandeja de conversaciones por vendedor</li>
                <li>• Cartera de pacientes y doctores</li>
                <li>• Pipeline kanban de ventas</li>
                <li>• Métricas individuales</li>
              </ul>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>12 vendedores activos</span>
                <span>347 conversaciones</span>
              </div>
              <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
                <Link href="/ventas/crm-whatsapp">
                  <Phone className="h-4 w-4 mr-2" />
                  Abrir CRM WhatsApp
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-blue-100 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>CRM Zogen</CardTitle>
                  <CardDescription>Solicitudes y cotizaciones de estudios</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-600">
                Gestiona solicitudes de estudios oncológicos, expedientes y cotizaciones a aseguradoras.
              </p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Registro de solicitudes de estudios</li>
                <li>• Gestión de documentación de pacientes</li>
                <li>• Preparación de expedientes</li>
                <li>• Cotizaciones y cartas pase</li>
              </ul>
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <span>47 solicitudes activas</span>
                <span>18 cotizaciones enviadas</span>
              </div>
              <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                <Link href="/ventas/crm-zogen">
                  <FileText className="h-4 w-4 mr-2" />
                  Abrir CRM Zogen
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Resumen de actividad */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Resumen de Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el módulo de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Nueva conversación WhatsApp iniciada</p>
                  <p className="text-xs text-gray-600">Vendedor: Ana García • Hace 5 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Solicitud de estudio registrada</p>
                  <p className="text-xs text-gray-600">Dr. Ramírez • Panel cáncer de mama • Hace 15 minutos</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-100">
                <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cotización enviada a aseguradora</p>
                  <p className="text-xs text-gray-600">GNP Seguros • Paciente: María González • Hace 1 hora</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
