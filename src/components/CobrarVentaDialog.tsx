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
import { DollarSign } from 'lucide-react';

interface CobrarVentaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ventaFolio: string;
  onCobrar: (metodoPago: string, cuentaCobro: string, lugarRecepcion: string) => void;
}

export function CobrarVentaDialog({
  open,
  onOpenChange,
  ventaFolio,
  onCobrar,
}: CobrarVentaDialogProps) {
  const [metodoPago, setMetodoPago] = useState('');
  const [cuentaCobro, setCuentaCobro] = useState('');
  const [lugarRecepcion, setLugarRecepcion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metodoPago.trim() && cuentaCobro.trim() && lugarRecepcion.trim()) {
      onCobrar(metodoPago, cuentaCobro, lugarRecepcion);
      setMetodoPago('');
      setCuentaCobro('');
      setLugarRecepcion('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Registrar Cobro
          </DialogTitle>
          <DialogDescription>
            Registre el pago recibido para la venta {ventaFolio}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metodoPago">Método de Pago *</Label>
            <select
              id="metodoPago"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
              className="w-full rounded-md border border-gray-300 p-2"
              required
            >
              <option value="">Seleccione método de pago</option>
              <option value="Transferencia Bancaria">Transferencia Bancaria</option>
              <option value="Cheque">Cheque</option>
              <option value="Efectivo">Efectivo</option>
              <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
              <option value="Tarjeta de Débito">Tarjeta de Débito</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cuentaCobro">Cuenta Bancaria *</Label>
            <Input
              id="cuentaCobro"
              value={cuentaCobro}
              onChange={(e) => setCuentaCobro(e.target.value)}
              placeholder="Ej: BBVA **** 1234"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lugarRecepcion">Lugar de Recepción *</Label>
            <Input
              id="lugarRecepcion"
              value={lugarRecepcion}
              onChange={(e) => setLugarRecepcion(e.target.value)}
              placeholder="Ej: Oficina principal, Sucursal Norte"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-green-600 hover:bg-green-700">
              Registrar Cobro
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setMetodoPago('');
                setCuentaCobro('');
                setLugarRecepcion('');
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
