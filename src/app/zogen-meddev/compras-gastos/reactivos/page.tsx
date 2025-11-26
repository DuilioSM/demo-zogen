'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus } from 'lucide-react';
import {
  ComprasGastosTabs,
  FormContainer,
  FormField,
  FormActions,
} from '@/components/ComprasGastosTabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface GastoReactivo {
  id: string;
  folio: string;
  fecha: string;
  proveedor: string;
  concepto: string;
  monto: number;
  estatus: 'registrado' | 'factura-recibida' | 'pago-realizado';
  numeroFactura?: string;
  facturaFile?: string;
  fechaFactura?: string;
  metodoPago?: string;
  referenciaPago?: string;
  fechaPago?: string;
  createdAt: string;
}

type StatusTab = 'PagoRegistrado' | 'PagoFacturado' | 'PagoRealizado';

export default function ReactivosComprasPage() {
  const [gastos, setGastos] = useState<GastoReactivo[]>([
    {
      id: '1',
      folio: 'GR-420',
      fecha: '2024-12-05',
      proveedor: 'OncoLab Suppliers',
      concepto: 'Kit reactivos OncoLab (10 unidades)',
      monto: 165000,
      estatus: 'registrado',
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      folio: 'GR-405',
      fecha: '2024-11-28',
      proveedor: 'PCR Global',
      concepto: 'Cartuchos PCR Prime (50 pz)',
      monto: 89000,
      estatus: 'factura-recibida',
      numeroFactura: 'FAC-2024-405',
      createdAt: new Date().toISOString(),
    },
    {
      id: '3',
      folio: 'GR-398',
      fecha: '2024-11-20',
      proveedor: 'Hematología Premium',
      concepto: 'Control hematología 3N (20 sets)',
      monto: 72000,
      estatus: 'pago-realizado',
      numeroFactura: 'FAC-2024-398',
      metodoPago: 'Transferencia',
      fechaPago: '2024-11-23',
      createdAt: new Date().toISOString(),
    },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const getStatus = (gasto: GastoReactivo): StatusTab => {
    if (gasto.estatus === 'pago-realizado') return 'PagoRealizado';
    if (gasto.estatus === 'factura-recibida') return 'PagoFacturado';
    return 'PagoRegistrado';
  };

  const handleUpdate = (id: string, updates: Partial<GastoReactivo>) => {
    setGastos((prev) =>
      prev.map((g) => {
        if (g.id === id) {
          let newEstatus = g.estatus;
          if (updates.numeroFactura || updates.facturaFile) {
            newEstatus = 'factura-recibida';
          } else if (updates.metodoPago && updates.fechaPago) {
            newEstatus = 'pago-realizado';
          }
          return { ...g, ...updates, estatus: newEstatus };
        }
        return g;
      })
    );
  };

  const handleSubmitGasto = (data: {
    proveedor: string;
    concepto: string;
    monto: number;
  }) => {
    const nuevoGasto: GastoReactivo = {
      id: Date.now().toString(),
      folio: `GR-${Math.floor(Math.random() * 900 + 100)}`,
      fecha: new Date().toISOString(),
      proveedor: data.proveedor,
      concepto: data.concepto,
      monto: data.monto,
      estatus: 'registrado',
      createdAt: new Date().toISOString(),
    };

    setGastos((prev) => [nuevoGasto, ...prev]);
    setIsDialogOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-semibold">
                Zogen Med Dev · Compras y Gastos
              </p>
              <h1 className="text-3xl font-bold text-gray-900">Reactivos</h1>
              <p className="text-gray-600 mt-1">
                Control de gastos operativos de consumibles y reactivos
              </p>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Gasto
            </Button>
          </div>
        </div>

        <ComprasGastosTabs
          items={gastos}
          getStatus={getStatus}
          onUpdate={handleUpdate}
          renderItemHeader={(gasto) => (
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
                    {gasto.folio}
                  </Badge>
                  {gasto.numeroFactura && (
                    <Badge variant="outline" className="text-blue-700 border-blue-300 bg-blue-50">
                      {gasto.numeroFactura}
                    </Badge>
                  )}
                </div>
                <p className="font-semibold text-lg">{gasto.proveedor}</p>
                <p className="text-sm text-gray-600">{gasto.concepto}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg text-emerald-700">
                  ${gasto.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500">{new Date(gasto.fecha).toLocaleDateString('es-MX')}</p>
              </div>
            </div>
          )}
          renderItemDetails={(gasto) => {
            if (getStatus(gasto) === 'PagoRealizado') {
              return (
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-600 space-y-1">
                    {gasto.metodoPago && (
                      <p>
                        Método de Pago: <span className="font-medium">{gasto.metodoPago}</span>
                      </p>
                    )}
                    {gasto.fechaPago && (
                      <p>
                        Fecha de Pago:{' '}
                        <span className="font-medium">
                          {new Date(gasto.fechaPago).toLocaleDateString('es-MX')}
                        </span>
                      </p>
                    )}
                    {gasto.referenciaPago && (
                      <p>
                        Referencia: <span className="font-medium">{gasto.referenciaPago}</span>
                      </p>
                    )}
                  </div>
                </div>
              );
            }
            return null;
          }}
          renderFacturacionForm={(gasto, onUpdate, onCancel) => (
            <FacturaForm gasto={gasto} onUpdate={onUpdate} onCancel={onCancel} />
          )}
          renderPagoForm={(gasto, onUpdate, onCancel) => (
            <PagoForm gasto={gasto} onUpdate={onUpdate} onCancel={onCancel} />
          )}
        />
      </div>

      <GastoDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSubmit={handleSubmitGasto}
        categoria="Reactivos"
      />
    </div>
  );
}

// Formulario para registrar factura recibida con carga de PDF
function FacturaForm({
  gasto,
  onUpdate,
  onCancel,
}: {
  gasto: GastoReactivo;
  onUpdate: (updates: Partial<GastoReactivo>) => void;
  onCancel: () => void;
}) {
  const [numeroFactura, setNumeroFactura] = useState('');
  const [fechaFactura, setFechaFactura] = useState(new Date().toISOString().split('T')[0]);
  const [facturaFile, setFacturaFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!numeroFactura.trim() || !facturaFile) {
      alert('Por favor ingresa el número de factura y sube el archivo PDF.');
      return;
    }

    // En una aplicación real, aquí subirías el archivo a un servidor
    onUpdate({
      numeroFactura,
      fechaFactura,
      facturaFile: facturaFile.name
    });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Registrar Factura Recibida">
        <FormField label="Número de Factura *" id={`factura-${gasto.id}`}>
          <Input
            id={`factura-${gasto.id}`}
            value={numeroFactura}
            onChange={(e) => setNumeroFactura(e.target.value)}
            placeholder="Ej: FAC-2024-001"
            required
          />
        </FormField>

        <FormField label="Fecha de Factura *" id={`fecha-${gasto.id}`}>
          <Input
            id={`fecha-${gasto.id}`}
            type="date"
            value={fechaFactura}
            onChange={(e) => setFechaFactura(e.target.value)}
            required
          />
        </FormField>

        <FormField label="Factura PDF *" id={`file-${gasto.id}`}>
          <Input
            id={`file-${gasto.id}`}
            type="file"
            accept=".pdf"
            onChange={(e) => setFacturaFile(e.target.files?.[0] || null)}
            required
          />
          {facturaFile && (
            <p className="text-sm text-gray-600 mt-1">
              Archivo: {facturaFile.name}
            </p>
          )}
        </FormField>

        <FormActions onCancel={onCancel} submitLabel="Registrar Factura" />
      </FormContainer>
    </form>
  );
}

// Formulario para registrar pago realizado
function PagoForm({
  gasto,
  onUpdate,
  onCancel,
}: {
  gasto: GastoReactivo;
  onUpdate: (updates: Partial<GastoReactivo>) => void;
  onCancel: () => void;
}) {
  const [metodoPago, setMetodoPago] = useState('');
  const [referenciaPago, setReferenciaPago] = useState('');
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!metodoPago.trim() || !fechaPago) {
      alert('Por favor completa todos los campos requeridos.');
      return;
    }

    onUpdate({ metodoPago, referenciaPago, fechaPago });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormContainer title="Registrar Pago Realizado">
        <FormField label="Método de Pago *" id={`metodo-${gasto.id}`}>
          <select
            id={`metodo-${gasto.id}`}
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
          </select>
        </FormField>

        <FormField label="Referencia de Pago" id={`referencia-${gasto.id}`}>
          <Input
            id={`referencia-${gasto.id}`}
            value={referenciaPago}
            onChange={(e) => setReferenciaPago(e.target.value)}
            placeholder="Ej: SPEI-12345678"
          />
        </FormField>

        <FormField label="Fecha de Pago *" id={`fecha-pago-${gasto.id}`}>
          <Input
            id={`fecha-pago-${gasto.id}`}
            type="date"
            value={fechaPago}
            onChange={(e) => setFechaPago(e.target.value)}
            required
          />
        </FormField>

        <FormActions onCancel={onCancel} submitLabel="Registrar Pago" />
      </FormContainer>
    </form>
  );
}

// Dialog para crear nuevo gasto
function GastoDialog({
  open,
  onOpenChange,
  onSubmit,
  categoria,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { proveedor: string; concepto: string; monto: number }) => void;
  categoria: string;
}) {
  const [formData, setFormData] = useState({
    proveedor: '',
    concepto: '',
    monto: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const monto = parseFloat(formData.monto);
    if (!formData.proveedor || !formData.concepto || isNaN(monto)) {
      alert('Por favor completa todos los campos correctamente.');
      return;
    }

    onSubmit({
      proveedor: formData.proveedor,
      concepto: formData.concepto,
      monto,
    });

    setFormData({ proveedor: '', concepto: '', monto: '' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Gasto - {categoria}</DialogTitle>
          <DialogDescription>Complete los datos del gasto a registrar</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="proveedor">Proveedor *</Label>
            <Input
              id="proveedor"
              value={formData.proveedor}
              onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
              placeholder="Nombre del proveedor"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="concepto">Concepto *</Label>
            <Input
              id="concepto"
              value={formData.concepto}
              onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
              placeholder="Descripción del gasto"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto (MXN) *</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              value={formData.monto}
              onChange={(e) => setFormData({ ...formData, monto: e.target.value })}
              placeholder="0.00"
              required
            />
          </div>

          <div className="flex gap-3">
            <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
              Registrar Gasto
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFormData({ proveedor: '', concepto: '', monto: '' });
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
