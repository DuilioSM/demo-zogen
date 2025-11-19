'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { CRM_WHATSAPP_API_BASE } from '@/lib/constants';
import type { WhatsappChannelInfo } from '@/types/whatsapp';

export default function CRMWhatsAppRedirect() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        // Intentar obtener un vendedor real de la API
        const response = await fetch(`${CRM_WHATSAPP_API_BASE}/canales`);
        if (response.ok) {
          const channels: WhatsappChannelInfo[] = await response.json();
          if (channels.length > 0) {
            // Usar el primer vendedor disponible
            const firstChannel = channels[0];
            const targetId = firstChannel.realPhoneNumberId || firstChannel.id;
            router.push(`/ventas/crm-whatsapp/${targetId}/conversations`);
            return;
          }
        }
      } catch (error) {
        console.error('Error obteniendo vendedores:', error);
      }

      // Si no hay vendedores o hay error, usar un ID demo
      router.push('/ventas/crm-whatsapp/demo-vendor');
    };

    fetchAndRedirect();
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
        <p className="text-gray-600">Cargando CRM WhatsApp...</p>
      </div>
    </div>
  );
}
