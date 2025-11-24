'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Receipt,
  Save,
  Download,
  XCircle,
  TrendingUp,
} from 'lucide-react';
import type { AdminSolicitud } from '@/types/admin-solicitud';
import jsPDF from 'jspdf';

type Status = 'Pendiente' | 'Facturado' | 'PendienteCobro' | 'Terminado';
const STATUS_LABELS: Record<Status, string> = {
  Pendiente: 'Pendiente',
  Facturado: 'Facturado',
  PendienteCobro: 'Pendiente de Cobro',
  Terminado: 'Terminado',
};

export default function FacturacionCobranzaPage() {
  const [solicitudes, setSolicitudes] = useState<AdminSolicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Status>('Pendiente');

  useEffect(() => {
    loadSolicitudes();
  }, []);

  const loadSolicitudes = () => {
    setLoading(true);
    const allSolicitudes: AdminSolicitud[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('admin-solicitud-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const solicitud = JSON.parse(data) as AdminSolicitud;
            if (solicitud.statusAprobacion === 'aprobado') {
              allSolicitudes.push(solicitud);
            }
          } catch (e) {
            console.error('Error parsing solicitud:', e);
          }
        }
      }
    }
    setSolicitudes(allSolicitudes.sort((a, b) => new Date(b.fechaSolicitud).getTime() - new Date(a.fechaSolicitud).getTime()));
    setLoading(false);
  };

  const updateSolicitud = (solicitudId: string, updatedData: Partial<AdminSolicitud>) => {
    const updatedSolicitudes = solicitudes.map(s => {
      if (s.id === solicitudId) {
        const newSolicitud = { ...s, ...updatedData };
        localStorage.setItem(`admin-solicitud-${solicitudId}`, JSON.stringify(newSolicitud));
        return newSolicitud;
      }
      return s;
    });
    setSolicitudes(updatedSolicitudes);
  };

  const filteredSolicitudes = useMemo(() => {
    const getStatus = (s: AdminSolicitud): Status => {
        if (s.statusCobranza === 'pagado') return 'Terminado';
        if (s.statusFacturacion === 'timbrado' && s.statusCobranza !== 'pagado') return 'PendienteCobro';
        if (s.statusFacturacion === 'facturado') return 'Facturado';
        return 'Pendiente';
    }

    return solicitudes.filter(s => getStatus(s) === activeTab);
  }, [solicitudes, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Facturación y Cobranza</h1>
          <p className="text-gray-600 mt-2">
            Seguimiento de facturación, timbrado y pagos de servicios asegurados.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-10">
            <p className="text-gray-500">Cargando datos...</p>
          </div>
        ) : (
          <Tabs defaultValue="Pendiente" onValueChange={(value) => setActiveTab(value as Status)}>
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="Pendiente">Pendiente ({solicitudes.filter(s => s.statusFacturacion === 'pendiente').length})</TabsTrigger>
              <TabsTrigger value="Facturado">Facturado ({solicitudes.filter(s => s.statusFacturacion === 'facturado').length})</TabsTrigger>
              <TabsTrigger value="PendienteCobro">Pendiente de Cobro ({solicitudes.filter(s => s.statusFacturacion === 'timbrado' && s.statusCobranza !== 'pagado').length})</TabsTrigger>
              <TabsTrigger value="Terminado">Terminado ({solicitudes.filter(s => s.statusCobranza === 'pagado').length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
                <div className="space-y-4">
                  {filteredSolicitudes.length > 0 ? (
                    filteredSolicitudes.map(solicitud => (
                      <SolicitudCard key={solicitud.id} solicitud={solicitud} onUpdate={updateSolicitud} activeTab={activeTab} />
                    ))
                  ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <p className="text-center text-gray-500">No hay solicitudes en estado &quot;{STATUS_LABELS[activeTab]}&quot;</p>
                        </CardContent>
                    </Card>
                  )}
                </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

function SolicitudCard({ solicitud, onUpdate, activeTab }: { solicitud: AdminSolicitud, onUpdate: (id: string, data: Partial<AdminSolicitud>) => void, activeTab: Status }) {
    const [showForm, setShowForm] = useState(false);

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-semibold text-lg">{solicitud.paciente}</p>
                        <p className="text-sm text-gray-600">{solicitud.servicio} - {solicitud.aseguradora}</p>
                        <p className="text-xs text-gray-500">ID: {solicitud.id}</p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg">${solicitud.monto.toLocaleString('es-MX')}</p>
                        <Badge variant="outline">{solicitud.statusFacturacion}</Badge>
                    </div>
                </div>

                {activeTab !== 'Terminado' && (
                    <div className="mt-4 pt-4 border-t">
                        {!showForm && <Button onClick={() => setShowForm(true)} size="sm">Actualizar Estado</Button>}
                        {showForm && (
                            <>
                                {activeTab === 'Pendiente' && <FacturacionForm solicitud={solicitud} onUpdate={onUpdate} onCancel={() => setShowForm(false)} />}
                                {activeTab === 'Facturado' && <TimbradoForm solicitud={solicitud} onUpdate={onUpdate} onCancel={() => setShowForm(false)} />}
                                {activeTab === 'PendienteCobro' && <CobranzaForm solicitud={solicitud} onUpdate={onUpdate} onCancel={() => setShowForm(false)} />}
                            </>
                        )}
                    </div>
                )}
                 {activeTab === 'Terminado' && (
                    <div className="mt-4 pt-4 border-t text-sm text-gray-600">
                        <p>Factura: <span className="font-medium">{solicitud.numeroFactura}</span></p>
                        <p>Fecha de Pago: <span className="font-medium">{solicitud.fechaPago ? new Date(solicitud.fechaPago).toLocaleDateString('es-MX') : 'N/A'}</span></p>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}


function FacturacionForm({ solicitud, onUpdate, onCancel }: { solicitud: AdminSolicitud, onUpdate: (id: string, data: Partial<AdminSolicitud>) => void, onCancel: () => void }) {
  const [montoFactura, setMontoFactura] = useState(solicitud.monto.toString());
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGeneratingPdf(true);
    setTimeout(() => {
      const pdf = new jsPDF();
      pdf.text('Factura Zogen', 20, 20);
      pdf.text(`Paciente: ${solicitud.paciente}`, 20, 30);
      pdf.text(`Servicio: ${solicitud.servicio}`, 20, 40);
      pdf.text(`Monto: $${Number(montoFactura).toLocaleString('es-MX')}`, 20, 50);
      const pdfUri = pdf.output('datauristring');
      if (typeof window !== 'undefined') {
        window.open(pdfUri, '_blank');
      }
      onUpdate(solicitud.id, {
        statusFacturacion: 'facturado',
        montoFactura: parseFloat(montoFactura),
        pdfFacturaUrl: pdfUri,
      });
      setIsGeneratingPdf(false);
      onCancel();
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">Generar Factura</h4>
      <div>
        <Label htmlFor={`monto-${solicitud.id}`}>Monto de Factura</Label>
        <Input id={`monto-${solicitud.id}`} type="number" value={montoFactura} onChange={(e) => setMontoFactura(e.target.value)} placeholder="Monto" disabled={isGeneratingPdf} />
      </div>
      {isGeneratingPdf && (
        <div className="rounded-md border border-purple-200 bg-purple-50 p-3 text-sm text-purple-800">
          Generando PDF de la factura... abre automáticamente una vista previa.
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={isGeneratingPdf}>
          {isGeneratingPdf ? 'Generando...' : 'Marcar como Facturado'}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isGeneratingPdf}>Cancelar</Button>
      </div>
    </form>
  );
}

function TimbradoForm({ solicitud, onUpdate, onCancel }: { solicitud: AdminSolicitud, onUpdate: (id: string, data: Partial<AdminSolicitud>) => void, onCancel: () => void }) {
    const [numeroFactura, setNumeroFactura] = useState(solicitud.numeroFactura || '');
    const [fechaFactura, setFechaFactura] = useState(new Date().toISOString().split('T')[0]);
    const [isStamping, setIsStamping] = useState(false);
    const [satStatus, setSatStatus] = useState<'idle' | 'validating' | 'validado'>('idle');
    const [satMessage, setSatMessage] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!numeroFactura || !fechaFactura) {
            alert('Por favor completa todos los campos.');
            return;
        }

        setIsStamping(true);
        setSatStatus('validating');
        setSatMessage('Validando la factura con el SAT...');

        // Simular validación con el SAT
        setTimeout(() => {
            const folioSat = `SAT-${Math.floor(Math.random() * 1_000_000)}`;
            onUpdate(solicitud.id, {
                statusFacturacion: 'timbrado',
                numeroFactura,
                fechaFactura,
                uuidFactura: folioSat,
            });
            setSatStatus('validado');
            setSatMessage(`SAT validó el comprobante. Folio: ${folioSat}`);
            setTimeout(() => {
                setIsStamping(false);
                setSatStatus('idle');
                onCancel();
            }, 1200);
        }, 2000);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Registrar Timbrado de Factura</h4>
            <div>
                <Label htmlFor={`numeroFactura-${solicitud.id}`}>Número de Factura / Folio</Label>
                <Input id={`numeroFactura-${solicitud.id}`} value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} placeholder="Folio de la factura" disabled={isStamping} />
            </div>
            <div>
                <Label htmlFor={`fechaFactura-${solicitud.id}`}>Fecha de Timbrado</Label>
                <Input id={`fechaFactura-${solicitud.id}`} type="date" value={fechaFactura} onChange={(e) => setFechaFactura(e.target.value)} disabled={isStamping} />
            </div>
            {satStatus !== 'idle' && (
                <div className={`rounded-md border p-3 text-sm ${satStatus === 'validando' ? 'border-yellow-200 bg-yellow-50 text-yellow-800' : 'border-green-200 bg-green-50 text-green-800'}`}>
                    {satMessage}
                </div>
            )}
            <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={isStamping}>
                    {isStamping ? 'Validando...' : 'Guardar Timbrado'}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={onCancel} disabled={isStamping}>Cancelar</Button>
            </div>
        </form>
    );
}


function CobranzaForm({ solicitud, onUpdate, onCancel }: { solicitud: AdminSolicitud, onUpdate: (id: string, data: Partial<AdminSolicitud>) => void, onCancel: () => void }) {
  const [fechaPago, setFechaPago] = useState(new Date().toISOString().split('T')[0]);
  const [referenciaPago, setReferenciaPago] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaPago) {
        alert('Por favor completa la fecha de pago.');
        return;
    }
    onUpdate(solicitud.id, { statusCobranza: 'pagado', fechaPago, referenciaPago });
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-medium">Registrar Pago</h4>
       <div>
        <Label htmlFor={`referencia-${solicitud.id}`}>Referencia de Pago</Label>
        <Input id={`referencia-${solicitud.id}`} value={referenciaPago} onChange={(e) => setReferenciaPago(e.target.value)} placeholder="ID de transacción, etc." />
      </div>
      <div>
        <Label htmlFor={`fecha-${solicitud.id}`}>Fecha de Pago</Label>
        <Input id={`fecha-${solicitud.id}`} type="date" value={fechaPago} onChange={(e) => setFechaPago(e.target.value)} />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm">Marcar como Pagado</Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>Cancelar</Button>
      </div>
    </form>
  );
}
