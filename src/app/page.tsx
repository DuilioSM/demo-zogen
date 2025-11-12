'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, CheckCircle2, Loader2 } from 'lucide-react';
import Image from 'next/image';
import type { PhoneNumberInfo } from '@/types/whatsapp';

export default function Home() {
  const router = useRouter();
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumberInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPhoneNumbers = async () => {
      try {
        const response = await fetch('/api/phone-numbers');
        if (response.ok) {
          const data = await response.json();
          setPhoneNumbers(data);
        }
      } catch (error) {
        console.error('Error cargando números:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPhoneNumbers();
  }, []);

  const handleSelectNumber = (phone: PhoneNumberInfo) => {
    // Si es un vendedor dummy, usa el realPhoneNumberId, sino usa el id
    const targetId = phone.realPhoneNumberId || phone.id;
    router.push(`/${targetId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-purple-100">
        <Loader2 className="h-12 w-12 animate-spin text-[#9B7CB8]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 p-6">
      <div className="max-w-4xl mx-auto pt-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/zogen-logo.png"
              alt="Zogen"
              width={300}
              height={100}
              className="h-20 w-auto"
              priority
            />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Zogen 
          </h1>
          <p className="text-lg text-gray-600">
            Vendedores activos
          </p>
        </div>

        {/* Phone Numbers Grid */}
        {phoneNumbers.length === 0 ? (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>No hay números conectados</CardTitle>
              <CardDescription>
                No se encontraron números de WhatsApp Business configurados.
                Verifica tu configuración de variables de entorno.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {phoneNumbers.map((phone) => (
              <Card
                key={phone.id}
                className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-[#9B7CB8]"
                onClick={() => handleSelectNumber(phone)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                        <Phone className="h-6 w-6 text-[#9B7CB8]" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">
                          {phone.displayName || 'Vendedor'}
                        </CardTitle>
                        <CardDescription className="font-mono text-sm">
                          {phone.phoneNumber}
                        </CardDescription>
                      </div>
                    </div>
                    {phone.isConnected && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-700 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span className="text-xs font-medium">Conectado</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <Button
                    className="w-full bg-[#9B7CB8] hover:bg-[#8A6BA7] text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectNumber(phone);
                    }}
                  >
                    Acceder al Dashboard
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
