'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Package, Building2, Clock } from 'lucide-react';
import type { AdminSolicitud } from '@/types/admin-solicitud';

export default function ComprasPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = () => {
    const allSolicitudes: AdminSolicitud[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('admin-solicitud-')) {
        const data = localStorage.getItem(key);
        if (data) {
          const solicitud = JSON.parse(data) as AdminSolicitud;
          // Mostrar todas las solicitudes de administración
          allSolicitudes.push(solicitud);
        }
      }
    }
    setSolicitudes(allSolicitudes);
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Compras</h1>
        <p className="text-gray-600 mt-2">Gestión de órdenes de compra a laboratorios</p>
      </div>

      <div className="grid gap-4">
        {solicitudes.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay solicitudes aprobadas para compra</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          solicitudes.map((solicitud) => (
            <Card key={solicitud.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{solicitud.paciente}</CardTitle>
                  <Badge variant={
                    solicitud.statusCompra === 'recibido' ? 'default' :
                    solicitud.statusCompra === 'ordenado' ? 'secondary' : 'outline'
                  }>
                    {solicitud.statusCompra}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Servicio</p>
                    <p className="font-medium">{solicitud.servicio}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Laboratorio</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{solicitud.laboratorio}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Monto</p>
                    <p className="font-medium">${solicitud.monto?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Fecha de solicitud</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <p className="font-medium">{new Date(solicitud.fechaSolicitud).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Generar Orden
                  </Button>
                  <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                    Marcar como Recibido
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
