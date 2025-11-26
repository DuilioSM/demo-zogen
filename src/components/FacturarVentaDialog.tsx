'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileText } from 'lucide-react';

interface FacturarVentaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaFolio: string;
  onFacturar: (facturaNumero: string) => void;
}

export function FacturarVentaDialog({
  open,
  onOpenChange,
  ventaFolio,
  onFacturar,
}: FacturarVentaDialogProps) {
  const [facturaNumero, setFacturaNumero] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (facturaNumero.trim()) {
      onFacturar(facturaNumero);
      setFacturaNumero('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Facturar Venta
          </DialogTitle>
          <DialogDescription>
            Ingrese el número de factura para la venta {ventaFolio}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="facturaNumero">Número de Factura *</Label>
            <Input
              id="facturaNumero"
              value={facturaNumero}
              onChange={(e) => setFacturaNumero(e.target.value)}
              placeholder="Ej: FAC-2024-001"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
              Facturar
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setFacturaNumero('');
                onOpenChange(false);
              }}
            >
              Cancelar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
