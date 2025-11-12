'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { Contact, ClientStatus } from '@/types/whatsapp';

const STATUS_OPTIONS: ClientStatus[] = [
  "Cotizando",
  "Documentación",
  "Trámite Aprobado",
  "Muestra Tomada",
];

const STATUS_COLORS: Record<ClientStatus, string> = {
  Cotizando: 'bg-purple-50 border-purple-100',
  Documentación: 'bg-sky-50 border-sky-100',
  'Trámite Aprobado': 'bg-emerald-50 border-emerald-100',
  'Muestra Tomada': 'bg-amber-50 border-amber-100',
};

const DUMMY_LEADS = [
  'Ana Sofía Domínguez',
  'Luis Fernando Aguilar',
  'Mariana Torres García',
  'Carlos Alberto Medina',
  'Regina Hernández Soto',
  'Diego Armando Salas',
  'Valeria Ortiz Peña',
  'Alejandro Cruz Ramírez',
  'Paola Jiménez Galindo',
  'Ricardo Núñez Padilla',
  'Fernanda Ruiz Esquivel',
  'Emilio García Cárdenas',
  'Andrea Cabrera Núñez',
  'Sebastián Varela Campos',
  'Renata Solís Figueroa',
  'Mauricio Camacho Lara',
  'Isabela Navarro Moguel',
  'Jorge Eduardo Salazar',
  'Lucía Serrano Ibarra',
  'Héctor Manuel Ureña',
];





type Conversation = {
  id: string;
  phoneNumber: string;
  contactName?: string;
  lastActiveAt: string;
  status?: string;
};

export default function KanbanPage() {
  const params = useParams();
  const phoneNumberId = params.phoneNumberId as string;
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingContact, setUpdatingContact] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Obtener contactos con estados
      const contactsResponse = await fetch(`/api/contacts?phoneNumberId=${phoneNumberId}`);
      if (contactsResponse.ok) {
        const contactsData = await contactsResponse.json();
        if (contactsData.length < 20) {
          const fillerCount = 20 - contactsData.length;
          for (let i = 0; i < fillerCount; i++) {
            const index = contactsData.length + i;
            contactsData.push({
              phoneNumber: `demo-${index}` as const,
              contactName: DUMMY_LEADS[index % DUMMY_LEADS.length],
              status: STATUS_OPTIONS[index % STATUS_OPTIONS.length],
              updatedAt: new Date().toISOString(),
            });
          }
        }
        setContacts(contactsData);
      }

      // Obtener conversaciones
      const conversationsResponse = await fetch(`/api/conversations?phoneNumberId=${phoneNumberId}`);
      if (conversationsResponse.ok) {
        const conversationsData = await conversationsResponse.json();
        setConversations(conversationsData.conversations || []);
      }
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  }, [phoneNumberId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateContactStatus = async (phoneNumber: string, status: ClientStatus, contactName?: string) => {
    setUpdatingContact(phoneNumber);
    try {
      const response = await fetch('/api/contacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber, status, contactName }),
      });

      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
    } finally {
      setUpdatingContact(null);
    }
  };

  const getConversationsByStatus = (status: ClientStatus) => {
    const contactsWithStatus = contacts
      .filter(c => c.status === status)
      .map(c => c.phoneNumber);

    return conversations.filter(conv =>
      contactsWithStatus.includes(conv.phoneNumber)
    );
  };

  const getConversationsWithoutStatus = () => {
    const contactsWithStatus = new Set(
      contacts.filter(c => c.status).map(c => c.phoneNumber)
    );

    return conversations.filter(conv =>
      !contactsWithStatus.has(conv.phoneNumber)
    );
  };

  const getInitials = (name?: string, phoneNumber?: string) => {
    if (name) {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return phoneNumber?.slice(-2) || '??';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-12 w-12 animate-spin text-[#9B7CB8]" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto bg-gray-50 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pipeline de venta</h1>
        <p className="text-gray-600 mt-1">
          Gestiona el estado de cada cliente en el proceso
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {/* Columna de Sin Estado */}
        <div className="flex-shrink-0 w-72">
          <Card className="h-full flex flex-col border border-gray-200 bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Sin Estado Asignado</span>
                <Badge variant="secondary" className="bg-gray-200">
                  {getConversationsWithoutStatus().length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-[calc(100vh-280px)]">
                <div className="space-y-2 p-4 pt-0">
                  {getConversationsWithoutStatus().map(conv => (
                    <Card key={conv.id} className="p-3 hover:shadow-md transition-shadow bg-white/90 border border-white">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getInitials(conv.contactName, conv.phoneNumber)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {conv.contactName || conv.phoneNumber}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDate(conv.lastActiveAt)}
                          </p>
                          <Select
                            onValueChange={(value) =>
                              updateContactStatus(conv.phoneNumber, value as ClientStatus, conv.contactName)
                            }
                            disabled={updatingContact === conv.phoneNumber}
                          >
                            <SelectTrigger className="mt-2 h-8 text-xs">
                              <SelectValue placeholder="Asignar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              {STATUS_OPTIONS.map(status => (
                                <SelectItem key={status} value={status} className="text-xs">
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {getConversationsWithoutStatus().length === 0 && (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No hay conversaciones sin estado
                    </p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Columnas por estado */}
        {STATUS_OPTIONS.map(status => {
          const conversationsInStatus = getConversationsByStatus(status);
          const contactsInStatus = contacts.filter(c => c.status === status);
          const displayLeads = conversationsInStatus.length
            ? conversationsInStatus
            : contactsInStatus.map((contact, idx) => ({
                id: `${contact.phoneNumber}-${idx}`,
                phoneNumber: contact.phoneNumber,
                contactName: contact.contactName,
                lastActiveAt: contact.updatedAt ?? new Date().toISOString(),
              }));

          return (
            <div key={status} className="flex-shrink-0 w-72">
              <Card className={`h-full flex flex-col border ${STATUS_COLORS[status]}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span className="line-clamp-2">{status}</span>
                    <Badge variant="default" className="bg-[#9B7CB8] hover:bg-[#8A6BA7]">
                      {conversationsInStatus.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    <div className="space-y-2 p-4 pt-0">
                    {displayLeads.map(conv => (
                      <Card key={conv.id} className="p-3 hover:shadow-md transition-shadow bg-white/90 border border-white">
                          <div className="flex items-start gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {getInitials(conv.contactName, conv.phoneNumber)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">
                                {conv.contactName || conv.phoneNumber}
                              </p>
                              <p className="text-xs text-gray-500 mb-2">
                                {formatDate(conv.lastActiveAt)}
                              </p>
                              <Select
                                value={status}
                                onValueChange={(value) =>
                                  updateContactStatus(conv.phoneNumber, value as ClientStatus, conv.contactName)
                                }
                                disabled={updatingContact === conv.phoneNumber}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {STATUS_OPTIONS.map(s => (
                                    <SelectItem key={s} value={s} className="text-xs">
                                      {s}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </Card>
                      ))}
                      {conversationsInStatus.length === 0 && (
                        <p className="text-sm text-gray-500 text-center py-8">
                          No hay contactos en este estado
                        </p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
