'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Users, Activity, KanbanSquare } from 'lucide-react';
import type { ClientStatus } from '@/types/whatsapp';

type Stats = {
  totalConversations: number;
  activeConversations: number;
  totalContacts: number;
  contactsWithStatus: number;
  statusBreakdown: Record<ClientStatus, number>;
};

export default function DashboardPage() {
  const params = useParams();
  const phoneNumberId = params.phoneNumberId as string;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`/api/stats?phoneNumberId=${phoneNumberId}`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [phoneNumberId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="p-6 overflow-auto h-full bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Título y acciones */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Resumen de actividad y estadísticas</p>
          </div>
          <div className="flex gap-3">
            <Link href={`/${phoneNumberId}/conversations`}>
              <Button className="bg-[#9B7CB8] hover:bg-[#8A6BA7] text-white">
                <MessageSquare className="h-4 w-4 mr-2" />
                Ver Conversaciones
              </Button>
            </Link>
            <Link href={`/${phoneNumberId}/kanban`}>
              <Button variant="outline" className="border-[#9B7CB8] text-[#9B7CB8] hover:bg-purple-50">
                <KanbanSquare className="h-4 w-4 mr-2" />
                Ver Kanban
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de estadísticas principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Conversaciones
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalConversations || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Todas las conversaciones registradas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Conversaciones Activas
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeConversations || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Conversaciones en curso
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Contactos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalContacts || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contactos registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Con Estado Asignado
              </CardTitle>
              <KanbanSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.contactsWithStatus || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Contactos con estado en el kanban
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Distribución por estados */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estados</CardTitle>
            <CardDescription>
              Cantidad de contactos en cada etapa del proceso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats?.statusBreakdown || {}).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-purple-50 transition-colors"
                >
                  <div>
                    <p className="font-medium text-gray-900">{status}</p>
                    <p className="text-sm text-gray-600">
                      {count} {count === 1 ? 'contacto' : 'contactos'}
                    </p>
                  </div>
                  <div className="text-2xl font-bold text-[#9B7CB8]">{count}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
