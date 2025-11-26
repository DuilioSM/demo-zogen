'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useVentasMedDev } from '@/hooks/useVentasMedDev';
import { useProductosMedDev, useClientesMedDev } from '@/hooks/useMedDevStorage';
import { Plus, Download } from 'lucide-react';
import { VentaMedDevDialog } from '@/components/VentaMedDevDialog';
import { generateFacturaMedDevPDF } from '@/components/FacturaMedDevPDF';
import type { VentaMedDev } from '@/types/meddev';
import {
  FacturacionCobranzaTabs,
  FormContainer,
  FormField,
  FormActions,
  StatusMessage,
} from '@/components/FacturacionCobranzaTabs';

type Status = 'PendienteFacturar' | 'Facturado' | 'Cobrado';

export default function ReactivosPage() {
  const { ventas, loading, addVenta, facturarVenta, cobrarVenta } = useVentasMedDev();
  const { productos } = useProductosMedDev();
  const { clientes } = useClientesMedDev();

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const ventasReactivos = ventas.filter((v) => v.categoria === 'reactivos');

  const handleSubmitVenta = (data: {
    clienteId: string;
    productos: { productoId: string; cantidad: number; precioUnitario: number }[];
    notas: string;
  }) => {
    const subtotal = data.productos.reduce((sum, p) => sum + p.cantidad * p.precioUnitario, 0);
    const iva = subtotal * 0.16;
    const total = subtotal + iva;

    addVenta({
      fecha: new Date().toISOString(),
      clienteId: data.clienteId,
      categoria: 'reactivos',
      productos: data.productos,
      subtotal,
      iva,
      total,
      estatus: 'vendido',
      notas: data.notas,
    });
  };

  const getStatus = (venta: VentaMedDev): Status => {
    if (venta.estatus === 'cobrado') return 'Cobrado';
    if (venta.estatus === 'facturado') return 'Facturado';
    if (venta.estatus === 'vendido') return 'PendienteFacturar';
    return 'PendienteFacturar';
  };

  const handleUpdate = (id: string, updates: Partial<VentaMedDev>) => {
    if (updates.facturaNumero) {
      facturarVenta(id, updates.facturaNumero);
    } else if (updates.metodoPago && updates.cuentaCobro && updates.lugarRecepcion) {
      cobrarVenta(id, updates.metodoPago, updates.cuentaCobro, updates.lugarRecepcion);
    }
  };

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.3em] text-purple-600 font-semibold">
            Zogen Med Dev · Ventas
          </p>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Reactivos</h1>
              <p className="text-gray-600 mt-1">Ciclo completo de venta: Vendido, Facturado, Cobrado</p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Venta
            </Button>
          </div>
        </div>

        <FacturacionCobranzaTabs
          items={ventasReactivos}
          getStatus={getStatus}
          onUpdate={handleUpdate}
          renderItemHeader={(venta) => {
            const cliente = clientes.find((c) => c.id === venta.clienteId);
            return (
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-purple-700 border-purple-200 bg-purple-50">
                      {venta.folio}
                    </Badge>
                    {venta.facturaNumero && (
                      <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                        {venta.facturaNumero}
                      </Badge>
                    )}
                  </div>
                  <p className="font-semibold text-lg">{cliente?.razonSocial || 'Cliente desconocido'}</p>
                  <p className="text-sm text-gray-600">RFC: {cliente?.rfc || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-purple-700">
                    ${venta.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500">{new Date(venta.fecha).toLocaleDateString('es-MX')}</p>
                </div>
              </div>
            );
          }}
          renderItemDetails={(venta) => {
            const status = getStatus(venta);

            if (status === 'Facturado' || status === 'Cobrado') {
              return (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 space-y-1">
                      {venta.metodoPago && <p>Método de Pago: <span className="font-medium">{venta.metodoPago}</span></p>}
                      {venta.cuentaCobro && <p>Cuenta: <span className="font-medium">{venta.cuentaCobro}</span></p>}
                      {venta.lugarRecepcion && <p>Lugar: <span className="font-medium">{venta.lugarRecepcion}</span></p>}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-300"
                      onClick={() => {
                        const cliente = clientes.find((c) => c.id === venta.clienteId);
                        if (cliente) {
                          generateFacturaMedDevPDF({ venta, cliente, productos });
                        }
                      }}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Ver Factura
                    </Button>
                  </div>
                </div>
              );
            }
            return null;
          }}
          renderFacturacionForm={(venta, onUpdate, onCancel) => (
            <FacturacionForm venta={venta} clientes={clientes} productos={productos} onUpdate={onUpdate} onCancel={onCancel} />
          )}
          renderCobranzaForm={(venta, onUpdate, onCancel) => (
            <CobranzaForm venta={venta} onUpdate={onUpdate} onCancel={onCancel} />
          )}
        />
      </div>

      <VentaMedDevDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        categoria="reactivos"
        onSubmit={handleSubmitVenta}
      />
    </div>
  );
}

// Formulario para estado "Vendido" -> "Facturado" (Timbrado)
function FacturacionForm({
  venta,
  clientes,
  productos,
  onUpdate,
  onCancel
}: {
  venta: VentaMedDev;
  clientes: any[];
  productos: any[];
  onUpdate: (updates: Partial<VentaMedDev>) => void;
  onCancel: () => void;
}) {
  const cliente = clientes.find((c) => c.id === venta.clienteId);
  const [facturaNumero, setFacturaNumero] = useState('');
  const [fechaFactura, setFechaFactura] = useState(new Date().toISOString().split('T')[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facturaNumero.trim() || !fechaFactura) {
      alert('Por favor completa todos los campos.');
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      // Generar PDF automáticamente
      if (cliente) {
        generateFacturaMedDevPDF({ venta, cliente, productos });
      }

      onUpdate({ facturaNumero });
      setIsProcessing(false);
      onCancel();
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Generar y Timbrar Factura">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm font-medium text-blue-900">Datos del Cliente</p>
          <div className="mt-2 text-sm text-blue-800 space-y-1">
            <p><span className="font-semibold">Cliente:</span> {cliente?.razonSocial || 'N/A'}</p>
            <p><span className="font-semibold">RFC:</span> {cliente?.rfc || 'N/A'}</p>
          </div>
        </div>

        <FormField label="Número de Factura / Folio *" id={`factura-${venta.id}`}>
          <Input
            id={`factura-${venta.id}`}
            value={facturaNumero}
            onChange={(e) => setFacturaNumero(e.target.value)}
            placeholder="Ej: FAC-2024-001"
            disabled={isProcessing}
            required
          />
        </FormField>

        <FormField label="Fecha de Factura *" id={`fecha-${venta.id}`}>
          <Input
            id={`fecha-${venta.id}`}
            type="date"
            value={fechaFactura}
            onChange={(e) => setFechaFactura(e.target.value)}
            disabled={isProcessing}
            required
          />
        </FormField>

        {isProcessing && (
          <StatusMessage
            type="info"
            message="Generando factura y PDF... Se abrirá automáticamente."
          />
        )}

        <FormActions
          onCancel={onCancel}
          submitLabel="Timbrar Factura"
          isLoading={isProcessing}
          loadingLabel="Timbrando..."
        />
      </FormContainer>
    </form>
  );
}

function CobranzaForm({
  venta,
  onUpdate,
  onCancel
}: {
  venta: VentaMedDev;
  onUpdate: (updates: Partial<VentaMedDev>) => void;
  onCancel: () => void;
}) {
  const [metodoPago, setMetodoPago] = useState('');
  const [cuentaCobro, setCuentaCobro] = useState('');
  const [lugarRecepcion, setLugarRecepcion] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (metodoPago.trim() && cuentaCobro.trim() && lugarRecepcion.trim()) {
      onUpdate({ metodoPago, cuentaCobro, lugarRecepcion });
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Registrar Cobro">
        <FormField label="Método de Pago *" id={`metodo-${venta.id}`}>
          <select
            id={`metodo-${venta.id}`}
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
        </FormField>

        <FormField label="Cuenta Bancaria *" id={`cuenta-${venta.id}`}>
          <Input
            id={`cuenta-${venta.id}`}
            value={cuentaCobro}
            onChange={(e) => setCuentaCobro(e.target.value)}
            placeholder="Ej: BBVA **** 1234"
            required
          />
        </FormField>

        <FormField label="Lugar de Recepción *" id={`lugar-${venta.id}`}>
          <Input
            id={`lugar-${venta.id}`}
            value={lugarRecepcion}
            onChange={(e) => setLugarRecepcion(e.target.value)}
            placeholder="Ej: Oficina principal, Sucursal Norte"
            required
          />
        </FormField>

        <FormActions
          onCancel={onCancel}
          submitLabel="Marcar como Cobrado"
        />
      </FormContainer>
    </form>
  );
}
