'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Receipt, X } from 'lucide-react';

type TicketVenta = {
  id: string;
  cliente: string;
  servicio: string;
  monto: number;
  metodoPago: 'efectivo' | 'transferencia' | 'tarjeta' | 'cheque';
  fecha: string;
  notas?: string;
  createdAt: string;
};

export default function TicketsVentaPage() {
  const [tickets, setTickets] = useState<TicketVenta[]>([]);
  const [showNuevaVenta, setShowNuevaVenta] = useState(false);
  const [formData, setFormData] = useState({
    cliente: '',
    servicio: '',
    monto: '',
    metodoPago: 'efectivo' as TicketVenta['metodoPago'],
    fecha: new Date().toISOString().split('T')[0],
    notas: '',
  });

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = () => {
    const allTickets: TicketVenta[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('ticket-venta-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const ticket = JSON.parse(data) as TicketVenta;
            allTickets.push(ticket);
          } catch (e) {
            console.error('Error parsing ticket:', e);
          }
        }
      }
    }
    allTickets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setTickets(allTickets);
  };

  const handleSubmit = () => {
    if (!formData.cliente || !formData.servicio || !formData.monto) {
      alert('Por favor completa los campos obligatorios: Cliente, Servicio y Monto');
      return;
    }

    const monto = parseFloat(formData.monto);
    if (isNaN(monto) || monto <= 0) {
      alert('El monto debe ser un número mayor a 0');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const ticketId = `TV-${dateStr}-${timeStr}-${randomSuffix}`;

    const newTicket: TicketVenta = {
      id: ticketId,
      cliente: formData.cliente,
      servicio: formData.servicio,
      monto,
      metodoPago: formData.metodoPago,
      fecha: formData.fecha,
      notas: formData.notas,
      createdAt: now.toISOString(),
    };

    localStorage.setItem(`ticket-venta-${ticketId}`, JSON.stringify(newTicket));
    loadTickets();
    setShowNuevaVenta(false);
    setFormData({
      cliente: '',
      servicio: '',
      monto: '',
      metodoPago: 'efectivo',
      fecha: new Date().toISOString().split('T')[0],
      notas: '',
    });
    alert(`✅ Ticket de venta creado\n\n📋 ID: ${ticketId}\n💰 Monto: $${monto.toLocaleString('es-MX')}\n👤 Cliente: ${formData.cliente}`);
  };

  const metodoPagoColors: Record<TicketVenta['metodoPago'], string> = {
    efectivo: 'bg-green-100 text-green-700 border-green-200',
    transferencia: 'bg-blue-100 text-blue-700 border-blue-200',
    tarjeta: 'bg-purple-100 text-purple-700 border-purple-200',
    cheque: 'bg-amber-100 text-amber-700 border-amber-200',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tickets de Venta</h1>
            <p className="text-gray-600 mt-2">
              Registro de ventas que no requieren facturación
            </p>
          </div>
          <Button
            onClick={() => setShowNuevaVenta(true)}
            className="bg-[#9B7CB8] hover:bg-[#8A6BA7] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nueva Venta
          </Button>
        </div>

        {showNuevaVenta && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Nueva Venta</CardTitle>
                  <p className="text-sm text-gray-600">Registra una venta sin facturación</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNuevaVenta(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Cliente / Paciente *</Label>
                  <Input
                    value={formData.cliente}
                    onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                    placeholder="Nombre del cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Servicio *</Label>
                  <Input
                    value={formData.servicio}
                    onChange={(e) => setFormData({ ...formData, servicio: e.target.value })}
                    placeholder="Descripción del servicio"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Monto *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.monto}
                    onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Método de Pago</Label>
                  <Select
                    value={formData.metodoPago}
                    onValueChange={(value) => setFormData({ ...formData, metodoPago: value as TicketVenta['metodoPago'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                      <SelectItem value="transferencia">Transferencia</SelectItem>
                      <SelectItem value="tarjeta">Tarjeta</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha</Label>
                  <Input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label>Notas</Label>
                  <Textarea
                    value={formData.notas}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Comentarios adicionales..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={() => setShowNuevaVenta(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-[#9B7CB8] hover:bg-[#8A6BA7]"
                >
                  Guardar Ticket
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Registro de Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            {tickets.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay tickets de venta registrados aún.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <p className="font-semibold text-gray-900">{ticket.cliente}</p>
                          <p className="text-sm text-gray-600">{ticket.servicio}</p>
                          <p className="text-xs text-gray-500">ID: {ticket.id}</p>
                          {ticket.notas && (
                            <p className="text-xs text-gray-600 mt-1 italic">{ticket.notas}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900">
                        ${ticket.monto.toLocaleString('es-MX')}
                      </p>
                      <Badge
                        variant="outline"
                        className={metodoPagoColors[ticket.metodoPago]}
                      >
                        {ticket.metodoPago}
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ticket.fecha).toLocaleDateString('es-MX')}
                      </p>
                    </div>
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
