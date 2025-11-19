'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Clock, XCircle, Eye, ShoppingCart } from 'lucide-react';
import type { VTRequest } from '@/types/vt-request';

export default function SolicitudesVentaPage() {
  const [solicitudes, setSolicitudes] = useState<VTRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar solicitudes de administración desde localStorage
    const loadSolicitudes = () => {
      const allAdminSolicitudes: VTRequest[] = [];

      // Recorrer localStorage para encontrar todas las solicitudes de administración
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('admin-solicitud-')) {
          const data = localStorage.getItem(key);
          if (data) {
            try {
              const adminSol = JSON.parse(data);

              // Verificar si ya fue aprobada por administración
              const vtKey = `vt-request-${adminSol.solicitudId}`;
              const vtData = localStorage.getItem(vtKey);
              const vt = vtData ? JSON.parse(vtData) : { status: 'enviado' };

              allAdminSolicitudes.push({
                id: adminSol.id,
                solicitudId: adminSol.solicitudId,
                solicitudTelefono: adminSol.solicitudId,
                paciente: adminSol.paciente,
                doctor: 'Doctor',
                tipoEstudio: adminSol.servicio,
                status: vt.status,
                fechaSolicitud: adminSol.fechaSolicitud,
                comentarios: vt.comentarios,
                aseguradora: adminSol.aseguradora,
                monto: `$${adminSol.monto.toLocaleString('es-MX')}`,
              });
            } catch (e) {
              console.error('Error parsing admin request:', e);
            }
          }
        }
      }

      setSolicitudes(allAdminSolicitudes);
      setLoading(false);
    };

    loadSolicitudes();
  }, []);

  const handleApprove = (solicitudId: string) => {
    const key = `vt-request-${solicitudId}`;
    const data = localStorage.getItem(key);
    if (data) {
      const parsed = JSON.parse(data);
      parsed.status = 'aprobado';
      parsed.fechaAprobacion = new Date().toISOString();
      localStorage.setItem(key, JSON.stringify(parsed));

      // Actualizar estado
      setSolicitudes(prev =>
        prev.map(s => s.id === solicitudId ? { ...s, status: 'aprobado' } : s)
      );

      alert('Solicitud aprobada correctamente');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'enviado':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Clock className="h-3 w-3 mr-1" />
            Pendiente
          </Badge>
        );
      case 'aprobado':
        return (
          <Badge className="bg-green-100 text-green-700 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Aprobado
          </Badge>
        );
      case 'rechazado':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rechazado
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Cargando solicitudes...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Solicitudes de Venta</h1>
          <p className="text-gray-600 mt-2">
            Gestiona las solicitudes enviadas por el equipo de ventas
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Solicitudes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{solicitudes.length}</div>
              <p className="text-xs text-gray-500 mt-1">Solicitudes recibidas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {solicitudes.filter(s => s.status === 'enviado').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Por revisar</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Aprobadas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {solicitudes.filter(s => s.status === 'aprobado').length}
              </div>
              <p className="text-xs text-gray-500 mt-1">Listas para compra</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de solicitudes */}
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Recibidas</CardTitle>
            <CardDescription>Revisa y aprueba las solicitudes para continuar con la compra del estudio</CardDescription>
          </CardHeader>
          <CardContent>
            {solicitudes.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay solicitudes pendientes</p>
                <p className="text-sm text-gray-400 mt-1">
                  Las solicitudes aparecerán aquí cuando ventas las envíe
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Paciente</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estudio</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Monto</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Estado</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {solicitudes.map((solicitud) => (
                      <tr key={solicitud.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">{solicitud.paciente}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">{solicitud.tipoEstudio}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">{solicitud.monto}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-MX')}
                        </td>
                        <td className="py-3 px-4">{getStatusBadge(solicitud.status)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/administracion/solicitudes-venta/${solicitud.id}`}>
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Ver
                              </Button>
                            </Link>
                            {solicitud.status === 'enviado' && (
                              <Button
                                size="sm"
                                onClick={() => handleApprove(solicitud.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Aprobar
                              </Button>
                            )}
                            {solicitud.status === 'aprobado' && (
                              <Link href={`/administracion/compras?solicitud=${solicitud.id}`}>
                                <Button size="sm" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
                                  <ShoppingCart className="h-3 w-3 mr-1" />
                                  Comprar
                                </Button>
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
