'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign } from 'lucide-react';

export default function CobranzaPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Cobranza</h1>
        <p className="text-gray-600 mt-2">Seguimiento de pagos de aseguradoras</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay cobros pendientes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
