'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CRM_WHATSAPP_API_BASE } from '@/lib/constants';
import { Phone, MessageSquare, Users, CheckCircle2, Loader2, TrendingUp } from 'lucide-react';
import type { WhatsappChannelInfo } from '@/types/whatsapp';

export default function CRMVendedoresPage() {
  const router = useRouter();
  const [channels, setChannels] = useState<WhatsappChannelInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        const response = await fetch(`${CRM_WHATSAPP_API_BASE}/canales`);
        if (response.ok) {
          const data = await response.json();
          setChannels(data);
        }
      } catch (error) {
        console.error('Error cargando vendedores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChannels();
  }, []);

  const handleSelectVendor = (channel: WhatsappChannelInfo) => {
    const targetId = channel.realPhoneNumberId || channel.id;
    router.push(`/ventas/crm-whatsapp/${targetId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">CRM WhatsApp - Vendedores</h1>
          <p className="text-gray-600 mt-2">
            Selecciona un vendedor para gestionar sus conversaciones, leads y pipeline de ventas
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Vendedores Activos</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{channels.length}</div>
              <p className="text-xs text-gray-500 mt-1">Canales WhatsApp conectados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Conversaciones Totales</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">347</div>
              <p className="text-xs text-gray-500 mt-1">Activas en el sistema</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Tasa de Conversión</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">68%</div>
              <p className="text-xs text-gray-500 mt-1">De lead a solicitud</p>
            </CardContent>
          </Card>
        </div>

        {/* Vendedores list */}
        <Card>
          <CardHeader>
            <CardTitle>Vendedores Disponibles</CardTitle>
            <CardDescription>
              Accede al dashboard individual de cada vendedor para gestionar sus conversaciones y pipeline
            </CardDescription>
          </CardHeader>
          <CardContent>
            {channels.length === 0 ? (
              <div className="py-12 text-center">
                <Phone className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay vendedores conectados actualmente</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="flex items-start justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 hover:border-purple-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-6 w-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-base font-semibold text-gray-900">
                            {channel.displayName || 'Vendedor'}
                          </h3>
                          {channel.isConnected && (
                            <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Conectado
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 font-mono">{channel.phoneNumber}</p>
                        <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500 block">Conversaciones</span>
                            <p className="font-semibold text-gray-900">28</p>
                          </div>
                          <div>
                            <span className="text-gray-500 block">En pipeline</span>
                            <p className="font-semibold text-gray-900">12</p>
                          </div>
                          <div>
                            <span className="text-gray-500 block">Cerradas</span>
                            <p className="font-semibold text-gray-900">8</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-purple-600 hover:bg-purple-700 text-white flex-shrink-0"
                      onClick={() => handleSelectVendor(channel)}
                    >
                      Abrir CRM
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
