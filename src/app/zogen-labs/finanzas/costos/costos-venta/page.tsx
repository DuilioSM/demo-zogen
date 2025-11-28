'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X, Receipt, Edit, Save, FileText, MinusCircle } from 'lucide-react';
import type { AdminSolicitud } from '@/types/admin-solicitud';

type TipoEgreso = 'nota-credito' | 'descuento' | 'comision';

type CFDIEgreso = {
  id: string;
  tipoEgreso: TipoEgreso;
  rfcReceptor: string;
  razonSocial: string;
  monto: number;
  concepto: string;
  fecha: string;
  numeroFolio: string;
  uuid?: string;
  notas?: string;
  createdAt: string;
  facturaRelacionadaId?: string;
};

const tipoEgresoLabels: Record<TipoEgreso, { label: string; badge: string }> = {
  'nota-credito': { label: 'Nota de Crédito', badge: 'bg-red-100 text-red-700 border-red-200' },
  'descuento': { label: 'Descuento', badge: 'bg-orange-100 text-orange-700 border-orange-200' },
  'comision': { label: 'Comisión', badge: 'bg-blue-100 text-blue-700 border-blue-200' },
};

export default function CostosVentaPage() {
  const [egresos, setEgresos] = useState<CFDIEgreso[]>([]);
  const [facturas, setFacturas] = useState<AdminSolicitud[]>([]);
  const [showNuevoEgreso, setShowNuevoEgreso] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [facturaRelacionadaId, setFacturaRelacionadaId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tipoEgreso: 'nota-credito' as TipoEgreso,
    rfcReceptor: '',
    razonSocial: '',
    monto: '',
    concepto: '',
    fecha: new Date().toISOString().split('T')[0],
    numeroFolio: '',
    uuid: '',
    notas: '',
  });

  useEffect(() => {
    loadEgresos();
    loadFacturas();
  }, []);

  const loadEgresos = () => {
    const allEgresos: CFDIEgreso[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('cfdi-egreso-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const egreso = JSON.parse(data) as CFDIEgreso;
            allEgresos.push(egreso);
          } catch (e) {
            console.error('Error parsing egreso:', e);
          }
        }
      }
    }
    allEgresos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setEgresos(allEgresos);
  };

  const loadFacturas = () => {
    const allFacturas: AdminSolicitud[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('admin-solicitud-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const solicitud = JSON.parse(data) as AdminSolicitud;
            // Solo facturas timbradas o facturadas
            if (solicitud.statusFacturacion === 'timbrado' || solicitud.statusFacturacion === 'facturado') {
              allFacturas.push(solicitud);
            }
          } catch (e) {
            console.error('Error parsing solicitud:', e);
          }
        }
      }
    }
    allFacturas.sort((a, b) => new Date(b.fechaFactura || b.fechaSolicitud).getTime() - new Date(a.fechaFactura || a.fechaSolicitud).getTime());
    setFacturas(allFacturas);
  };

  const resetForm = () => {
    setFormData({
      tipoEgreso: 'nota-credito',
      rfcReceptor: '',
      razonSocial: '',
      monto: '',
      concepto: '',
      fecha: new Date().toISOString().split('T')[0],
      numeroFolio: '',
      uuid: '',
      notas: '',
    });
    setEditingId(null);
    setFacturaRelacionadaId(null);
  };

  const handleSubmit = () => {
    if (!formData.rfcReceptor || !formData.razonSocial || !formData.monto || !formData.concepto || !formData.numeroFolio) {
      alert('Por favor completa los campos obligatorios: RFC, Razón Social, Monto, Concepto y Folio');
      return;
    }

    const monto = parseFloat(formData.monto);
    if (isNaN(monto) || monto <= 0) {
      alert('El monto debe ser un número mayor a 0');
      return;
    }

    if (editingId) {
      // Actualizar egreso existente
      const updatedEgreso: CFDIEgreso = {
        id: editingId,
        tipoEgreso: formData.tipoEgreso,
        rfcReceptor: formData.rfcReceptor,
        razonSocial: formData.razonSocial,
        monto,
        concepto: formData.concepto,
        fecha: formData.fecha,
        numeroFolio: formData.numeroFolio,
        uuid: formData.uuid || undefined,
        notas: formData.notas || undefined,
        createdAt: egresos.find((e) => e.id === editingId)?.createdAt || new Date().toISOString(),
        facturaRelacionadaId: facturaRelacionadaId || egresos.find((e) => e.id === editingId)?.facturaRelacionadaId,
      };

      localStorage.setItem(`cfdi-egreso-${editingId}`, JSON.stringify(updatedEgreso));
      loadEgresos();
      setShowNuevoEgreso(false);
      resetForm();
      alert(`✅ CFDI actualizado correctamente`);
    } else {
      // Crear nuevo egreso
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const egresoId = `EGRESO-${dateStr}-${timeStr}-${randomSuffix}`;

      const newEgreso: CFDIEgreso = {
        id: egresoId,
        tipoEgreso: formData.tipoEgreso,
        rfcReceptor: formData.rfcReceptor,
        razonSocial: formData.razonSocial,
        monto,
        concepto: formData.concepto,
        fecha: formData.fecha,
        numeroFolio: formData.numeroFolio,
        uuid: formData.uuid || undefined,
        notas: formData.notas || undefined,
        createdAt: now.toISOString(),
        facturaRelacionadaId: facturaRelacionadaId || undefined,
      };

      localStorage.setItem(`cfdi-egreso-${egresoId}`, JSON.stringify(newEgreso));
      loadEgresos();
      setShowNuevoEgreso(false);
      resetForm();
      alert(`✅ CFDI tipo egreso creado\n\n📋 ID: ${egresoId}\n💰 Monto: $${monto.toLocaleString('es-MX')}\n🏢 Receptor: ${formData.razonSocial}`);
    }
  };

  const handleEdit = (egreso: CFDIEgreso) => {
    setFormData({
      tipoEgreso: egreso.tipoEgreso,
      rfcReceptor: egreso.rfcReceptor,
      razonSocial: egreso.razonSocial,
      monto: egreso.monto.toString(),
      concepto: egreso.concepto,
      fecha: egreso.fecha,
      numeroFolio: egreso.numeroFolio,
      uuid: egreso.uuid || '',
      notas: egreso.notas || '',
    });
    setEditingId(egreso.id);
    setFacturaRelacionadaId(egreso.facturaRelacionadaId || null);
    setShowNuevoEgreso(true);
  };

  const handleCrearEgresoDesdeFactura = (factura: AdminSolicitud) => {
    setFormData({
      tipoEgreso: 'nota-credito',
      rfcReceptor: factura.rfcCliente || factura.rfcAseguradora || '',
      razonSocial: factura.razonSocial || factura.aseguradora || factura.paciente,
      monto: '',
      concepto: `Relacionado a ${factura.servicio}`,
      fecha: new Date().toISOString().split('T')[0],
      numeroFolio: '',
      uuid: '',
      notas: `Factura relacionada: ${factura.numeroFactura || factura.id}`,
    });
    setFacturaRelacionadaId(factura.id);
    setEditingId(null);
    setShowNuevoEgreso(true);
  };

  const handleCancel = () => {
    setShowNuevoEgreso(false);
    resetForm();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Costos de Venta</h1>
            <p className="text-gray-600 mt-2">
              Registro de CFDI tipo egreso: notas de crédito, descuentos y comisiones
            </p>
          </div>
          <Button
            onClick={() => setShowNuevoEgreso(true)}
            className="bg-[#9B7CB8] hover:bg-[#8A6BA7] flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nuevo CFDI Egreso
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              Facturas Emitidas
            </CardTitle>
            <p className="text-sm text-gray-600">
              Selecciona una factura para crear un CFDI egreso relacionado
            </p>
          </CardHeader>
          <CardContent>
            {facturas.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay facturas emitidas aún.</p>
            ) : (
              <div className="space-y-3">
                {facturas.map((factura) => (
                  <div
                    key={factura.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">
                              {factura.numeroFactura || factura.id}
                            </p>
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                              {factura.statusFacturacion}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {factura.razonSocial || factura.aseguradora || factura.paciente}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500">
                              RFC: {factura.rfcCliente || factura.rfcAseguradora || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">
                              Servicio: {factura.servicio}
                            </p>
                            <p className="text-xs text-gray-500">
                              Fecha: {factura.fechaFactura ? new Date(factura.fechaFactura).toLocaleDateString('es-MX') : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div>
                        <p className="font-bold text-lg text-gray-900">
                          ${(factura.montoFactura ?? factura.monto).toLocaleString('es-MX')}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCrearEgresoDesdeFactura(factura)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <MinusCircle className="h-4 w-4 mr-2" />
                        Crear Egreso
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showNuevoEgreso && (
          <Card className="mb-6 border-2 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-purple-100">
                  <Receipt className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>
                    {editingId ? 'Editar CFDI Egreso' : facturaRelacionadaId ? 'Nuevo CFDI Egreso - Relacionado a Factura' : 'Nuevo CFDI Egreso'}
                  </CardTitle>
                  <p className="text-sm text-gray-600">Registra un costo de venta (nota de crédito, descuento o comisión)</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Tipo de Egreso *</Label>
                  <Select
                    value={formData.tipoEgreso}
                    onValueChange={(value) => setFormData({ ...formData, tipoEgreso: value as TipoEgreso })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nota-credito">Nota de Crédito</SelectItem>
                      <SelectItem value="descuento">Descuento</SelectItem>
                      <SelectItem value="comision">Comisión</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>RFC Receptor *</Label>
                  <Input
                    value={formData.rfcReceptor}
                    onChange={(e) => setFormData({ ...formData, rfcReceptor: e.target.value.toUpperCase() })}
                    placeholder="XAXX010101000"
                    maxLength={13}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Razón Social *</Label>
                  <Input
                    value={formData.razonSocial}
                    onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
                    placeholder="Nombre del receptor"
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
                  <Label>Número de Folio *</Label>
                  <Input
                    value={formData.numeroFolio}
                    onChange={(e) => setFormData({ ...formData, numeroFolio: e.target.value })}
                    placeholder="Ej: NC-001"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha *</Label>
                  <Input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>UUID (Opcional)</Label>
                  <Input
                    value={formData.uuid}
                    onChange={(e) => setFormData({ ...formData, uuid: e.target.value })}
                    placeholder="XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX"
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label>Concepto *</Label>
                  <Textarea
                    value={formData.concepto}
                    onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                    placeholder="Descripción del concepto del egreso..."
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="space-y-2 md:col-span-2 lg:col-span-3">
                  <Label>Notas (Opcional)</Label>
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
                  onClick={handleCancel}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="bg-[#9B7CB8] hover:bg-[#8A6BA7]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingId ? 'Actualizar' : 'Guardar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Registro de CFDI Egresos</CardTitle>
          </CardHeader>
          <CardContent>
            {egresos.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No hay CFDI de egreso registrados aún.</p>
            ) : (
              <div className="space-y-3">
                {egresos.map((egreso) => {
                  const tipoInfo = tipoEgresoLabels[egreso.tipoEgreso];
                  const facturaRelacionada = egreso.facturaRelacionadaId
                    ? facturas.find(f => f.id === egreso.facturaRelacionadaId)
                    : null;
                  return (
                    <div
                      key={egreso.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-gray-900">{egreso.razonSocial}</p>
                              <Badge variant="outline" className={tipoInfo.badge}>
                                {tipoInfo.label}
                              </Badge>
                              {facturaRelacionada && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                                  <FileText className="h-3 w-3 mr-1" />
                                  {facturaRelacionada.numeroFactura || 'Factura'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{egreso.concepto}</p>
                            <div className="flex items-center gap-4 mt-1">
                              <p className="text-xs text-gray-500">Folio: {egreso.numeroFolio}</p>
                              <p className="text-xs text-gray-500">RFC: {egreso.rfcReceptor}</p>
                              <p className="text-xs text-gray-500">Fecha: {new Date(egreso.fecha).toLocaleDateString('es-MX')}</p>
                            </div>
                            {egreso.uuid && (
                              <p className="text-xs text-gray-500 mt-1">UUID: {egreso.uuid}</p>
                            )}
                            {egreso.notas && (
                              <p className="text-xs text-gray-600 mt-1 italic">{egreso.notas}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                        <div>
                          <p className="font-bold text-lg text-red-600">
                            -${egreso.monto.toLocaleString('es-MX')}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(egreso.createdAt).toLocaleDateString('es-MX')}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(egreso)}
                          className="border-purple-300 text-purple-700 hover:bg-purple-50"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
