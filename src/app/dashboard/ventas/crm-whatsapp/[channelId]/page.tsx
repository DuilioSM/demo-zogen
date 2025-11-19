'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Activity, KanbanSquare, Phone, Wallet, Stethoscope } from 'lucide-react';
import { CRM_WHATSAPP_API_BASE } from '@/lib/constants';
import type { ClientStatus, WhatsappChannelInfo } from '@/types/whatsapp';

type Stats = {
  totalConversations: number;
  activeConversations: number;
  totalContacts: number;
  contactsWithStatus: number;
  statusBreakdown: Record<ClientStatus, number>;
};

export default function SellerDashboardPage() {
  const params = useParams();
  const channelId = params.channelId as string;
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [seller, setSeller] = useState<WhatsappChannelInfo | null>(null);
  const [sellerLoading, setSellerLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${CRM_WHATSAPP_API_BASE}/stats?channelId=${channelId}`);
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
  }, [channelId]);

  useEffect(() => {
    const fetchSeller = async () => {
      setSellerLoading(true);
      try {
        const response = await fetch(`${CRM_WHATSAPP_API_BASE}/canales`);
        if (response.ok) {
          const data: WhatsappChannelInfo[] = await response.json();
          const match = data.find((item) => item.id === channelId || item.realPhoneNumberId === channelId);
          setSeller(match ?? null);
        }
      } catch (error) {
        console.error('Error obteniendo vendedor:', error);
        setSeller(null);
      } finally {
        setSellerLoading(false);
      }
    };

    fetchSeller();
  }, [channelId]);

  const kanbanStatuses = ['Cotizando', 'Documentación', 'Trámite Aprobado', 'Muestra Tomada'] as const;
  const STATUS_COLORS: Record<(typeof kanbanStatuses)[number], string> = {
    Cotizando: 'bg-purple-50 border-purple-100',
    Documentación: 'bg-sky-50 border-sky-100',
    'Trámite Aprobado': 'bg-emerald-50 border-emerald-100',
    'Muestra Tomada': 'bg-amber-50 border-amber-100',
  };
  const kanbanLeads = useMemo(() => [
    { name: 'Mariana Torres', study: 'Panel cáncer de mama', status: 'Cotizando', amount: '$42,000', note: 'Cotización enviada' },
    { name: 'Carlos Medina', study: 'Oncogenómico integral', status: 'Documentación', amount: '$68,500', note: 'Esperando firmas' },
    { name: 'Ana Sofía Domínguez', study: 'Cáncer gastrointestinal', status: 'Muestra Tomada', amount: '$55,200', note: 'Muestra en ruta' },
    { name: 'Diego Salas', study: 'Panel ginecológico', status: 'Trámite Aprobado', amount: '$47,800', note: 'Seguro aprobado' },
    { name: 'Valeria Ortiz', study: 'Panel predisposición', status: 'Cotizando', amount: '$33,400', note: 'Comparativo con aseguradora' },
    { name: 'Alejandro Cruz', study: 'Leucemia avanzada', status: 'Documentación', amount: '$61,900', note: 'Recibiendo consentimientos' },
    { name: 'Paola Jiménez', study: 'Oncogenómico integral', status: 'Trámite Aprobado', amount: '$70,000', note: 'Pago programado' },
    { name: 'Ricardo Núñez', study: 'Panel próstata', status: 'Muestra Tomada', amount: '$39,600', note: 'En análisis de laboratorio' },
    { name: 'Fernanda Ruiz', study: 'Panel pediátrico', status: 'Documentación', amount: '$52,300', note: 'Revisión legal' },
    { name: 'Emilio García', study: 'Cáncer de pulmón', status: 'Cotizando', amount: '$48,900', note: 'Llamada de seguimiento' },
    { name: 'Andrea Cabrera', study: 'Panel ginecológico', status: 'Trámite Aprobado', amount: '$44,100', note: 'Factura emitida' },
    { name: 'Sebastián Varela', study: 'Oncogenómico integral', status: 'Muestra Tomada', amount: '$72,400', note: 'Resultados en 5 días' },
  ], []);
  const statusCounts = kanbanStatuses.map(status => ({
    status,
    count: kanbanLeads.filter(lead => lead.status === status).length
  }));
  const leadsByStatus = useMemo(() => (
    kanbanStatuses.map((status) => ({
      status,
      leads: kanbanLeads.filter(lead => lead.status === status)
    }))
  ), [kanbanLeads]);

  if (loading && sellerLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900" />
      </div>
    );
  }

  const estimatedRevenue = (stats?.totalContacts ?? 0) * 4200;
  const scoreCards = [
    {
      title: '# Leads',
      value: stats?.totalConversations ?? 0,
      description: 'Conversaciones gestionadas',
      icon: <MessageSquare className="h-4 w-4 text-[#9B7CB8]" />,
    },
    {
      title: '# Clientes',
      value: stats?.totalContacts ?? 0,
      description: 'Pacientes con seguimiento',
      icon: <Users className="h-4 w-4 text-[#9B7CB8]" />,
    },
    {
      title: '$ Ingresos',
      value: `$${estimatedRevenue.toLocaleString('es-MX')}`,
      description: 'Estimado por estudios vendidos',
      icon: <Activity className="h-4 w-4 text-[#9B7CB8]" />,
    }
  ];

  const sellerLabel = seller?.displayName || seller?.phoneNumber || 'Vendedor';

  return (
    <div className="p-6 overflow-auto h-full bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-purple-100">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold tracking-widest text-purple-500 uppercase">Dashboard del vendedor</p>
              <h1 className="text-3xl font-bold text-gray-900">
                {sellerLabel}
              </h1>
              <p className="text-gray-600">
                Controla las conversaciones, los pacientes y el flujo de estudios gestionados por este perfil.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href={`/ventas/crm-whatsapp/${channelId}/conversations`}>
                  <Button className="bg-[#9B7CB8] hover:bg-[#8A6BA7] text-white">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ir a conversaciones
                  </Button>
                </Link>
                <Link href={`/ventas/crm-whatsapp/${channelId}/kanban`}>
                  <Button variant="outline" className="border-[#9B7CB8] text-[#9B7CB8] hover:bg-purple-50">
                    <KanbanSquare className="h-4 w-4 mr-2" />
                    Ver pipeline
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-dashed border-purple-200 p-6 bg-purple-50/50 min-w-[260px]">
              <p className="text-sm text-gray-500">Número conectado</p>
              <p className="mt-2 text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="h-4 w-4 text-[#9B7CB8]" />
                {seller?.phoneNumber || '—'}
              </p>
              <div className="mt-4 text-sm text-gray-500">
                ID de conexión:
                <span className="ml-2 font-mono text-gray-800">{channelId}</span>
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[2fr_1fr]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scoreCards.map((card) => (
              <ScoreCard key={card.title} {...card} loading={loading} />
            ))}
          </div>
          <Card className="bg-white/80">
            <CardHeader>
              <CardTitle>Carteras clave</CardTitle>
              <CardDescription>Explora pacientes y doctores vinculados a este vendedor.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full bg-[#9B7CB8] hover:bg-[#8A6BA7]">
                <Link href={`/ventas/crm-whatsapp/${channelId}/patients`}>
                  <Wallet className="h-4 w-4 mr-2" />
                  Cartera de pacientes
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-[#9B7CB8] text-[#9B7CB8] hover:bg-purple-50">
                <Link href={`/ventas/crm-whatsapp/${channelId}/doctors`}>
                  <Stethoscope className="h-4 w-4 mr-2" />
                  Cartera de doctores
                </Link>
              </Button>
              <p className="text-xs text-gray-500">
                Las carteras se abren en vista completa para revisar historiales y etiquetas sin distracciones.
              </p>
            </CardContent>
          </Card>
        </section>

      <section>
        <Card>
          <CardHeader>
            <CardTitle>Pipeline de Ventas</CardTitle>
            <CardDescription>Herramienta de seguimiento de prospectos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {leadsByStatus.map(({ status, leads }) => (
                <div key={status} className={`rounded-2xl border p-3 flex flex-col h-full ${STATUS_COLORS[status]}`}>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-gray-900">{status}</p>
                    <Badge variant="outline" className="text-xs text-[#7c3aed] border-[#d8c5f5] bg-white/80">
                      {leads.length}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2 flex-1">
                    {leads.slice(0, 3).map((lead) => (
                      <div key={lead.name} className="rounded-xl border border-white/80 bg-white px-3 py-2 text-xs space-y-1">
                        <p className="font-semibold text-gray-900 text-sm">{lead.name}</p>
                        <p className="text-gray-600">{lead.study}</p>
                        <p className="text-gray-500">{lead.note}</p>
                        <p className="font-semibold text-gray-900">{lead.amount}</p>
                      </div>
                    ))}
                    {leads.length === 0 && (
                      <p className="text-xs text-gray-400 border border-dashed border-purple-100 rounded-lg px-3 py-4 text-center">
                        Sin leads en esta etapa
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Mostrando un resumen de {kanbanLeads.length} leads.</p>
              <Button asChild variant="outline" className="border-[#9B7CB8] text-[#9B7CB8] hover:bg-purple-50">
                <Link href={`/ventas/crm-whatsapp/${channelId}/kanban`}>
                  Ver pipeline completo
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  </div>
);
}

function ScoreCard({
  title,
  value,
  description,
  icon,
  loading,
}: {
  title: string;
  value: number | string;
  description: string;
  icon: ReactNode;
  loading: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-500">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-gray-900">{loading ? '—' : value}</div>
        <p className="text-xs text-gray-500 mt-1">{description}</p>
      </CardContent>
    </Card>
  );
}
