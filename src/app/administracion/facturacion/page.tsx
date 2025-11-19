'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Receipt } from 'lucide-react';

export default function FacturacionPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Facturación</h1>
        <p className="text-gray-600 mt-2">Generación de facturas para aseguradoras</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No hay facturas pendientes</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
