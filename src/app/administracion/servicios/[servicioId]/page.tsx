'use client';

import { useState, useEffect } from 'react';
import { use } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  ArrowLeft,
  Package,
  Truck,
  FileText,
  Save,
  Upload,
  Download,
  Pencil,
  Trash2,
  Eye,
} from 'lucide-react';
import type { AdminSolicitud } from '@/types/admin-solicitud';

type NuevoPagoForm = {
  proveedor: string;
  factura: string;
  fecha: string;
  monto: string;
  status: 'pendiente' | 'pagado';
  notas: string;
};

export default function ServicioDetallePage({ params }: { params: Promise<{ servicioId: string }> }) {
  const resolvedParams = use(params);
  const [solicitud, setSolicitud] = useState<AdminSolicitud | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [nuevoPago, setNuevoPago] = useState<NuevoPagoForm>({
    proveedor: '',
    factura: '',
    fecha: '',
    monto: '',
    status: 'pendiente',
    notas: '',
  });
  const [editingPagoId, setEditingPagoId] = useState<string | null>(null);
  const [nuevoPagoArchivo, setNuevoPagoArchivo] = useState<{ name: string; data: string } | null>(null);

  useEffect(() => {
    loadSolicitud();
  }, [resolvedParams.servicioId]);

  const loadSolicitud = () => {
    const data = localStorage.getItem(`admin-solicitud-${resolvedParams.servicioId}`);
    if (data) {
      setSolicitud(JSON.parse(data));
    }
    setLoading(false);
  };

  const persistSolicitud = (message?: string) => {
    if (!solicitud) return;
    localStorage.setItem(`admin-solicitud-${resolvedParams.servicioId}`, JSON.stringify(solicitud));
    if (message) {
      alert(message);
    }
  };

  const handleSave = () => {
    if (!solicitud) return;
    setSaving(true);
    persistSolicitud();
    setTimeout(() => {
      setSaving(false);
      alert('✅ Cambios guardados correctamente');
    }, 500);
  };

  const updateField = <K extends keyof AdminSolicitud>(field: K, value: AdminSolicitud[K]) => {
    if (!solicitud) return;
    setSolicitud({ ...solicitud, [field]: value });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    // Validar tipo
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de archivo no permitido. Solo PDF, JPG, PNG');
      return;
    }

    setUploadingFile(true);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      updateField('resultadosUrl', base64);
      setUploadingFile(false);
      alert('✅ Archivo cargado correctamente');
    };
    reader.onerror = () => {
      alert('❌ Error al cargar el archivo');
      setUploadingFile(false);
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    if (solicitud?.laboratorio) {
      setNuevoPago((prev) => ({ ...prev, proveedor: solicitud.laboratorio }));
    }
  }, [solicitud?.laboratorio]);

  const handleFacturaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('El archivo es demasiado grande. Máximo 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setNuevoPagoArchivo({ name: file.name, data: reader.result as string });
      setNuevoPago((prev) => ({ ...prev, factura: prev.factura || file.name }));
    };
    reader.readAsDataURL(file);
  };

  const handleSavePagoLaboratorio = () => {
    if (!solicitud) return;
    if (!nuevoPago.factura || !nuevoPago.fecha || !nuevoPago.monto) {
      alert('Completa los campos obligatorios del pago (factura, fecha y monto).');
      return;
    }
    if (!nuevoPagoArchivo && !editingPagoId) {
      alert('Carga el archivo de la factura antes de guardar.');
      return;
    }

    const pagoBase = {
      proveedor: nuevoPago.proveedor || solicitud.laboratorio || 'Laboratorio',
      factura: nuevoPago.factura,
      fecha: nuevoPago.fecha,
      monto: Number(nuevoPago.monto),
      moneda: 'MXN',
      status: nuevoPago.status,
      notas: nuevoPago.notas,
      archivoUrl: nuevoPagoArchivo?.data,
      archivoNombre: nuevoPagoArchivo?.name,
      validadoEn: nuevoPagoArchivo ? new Date().toISOString() : undefined,
    };

    let pagos = solicitud.pagosLaboratorio || [];
    if (editingPagoId) {
      pagos = pagos.map((pago) => (pago.id === editingPagoId ? { ...pago, ...pagoBase } : pago));
    } else {
      pagos = [
        ...pagos,
        {
          id: `PAY-${Date.now()}`,
          ...pagoBase,
        },
      ];
    }

    setSolicitud({ ...solicitud, pagosLaboratorio: pagos });
    setNuevoPago({
      proveedor: solicitud.laboratorio || '',
      factura: '',
      fecha: '',
      monto: '',
      status: 'pendiente',
      notas: '',
    });
    setNuevoPagoArchivo(null);
    setEditingPagoId(null);
    persistSolicitud('Pago registrado');
  };

  const handleRemovePagoLaboratorio = (pagoId: string) => {
    if (!solicitud) return;
    const pagos = (solicitud.pagosLaboratorio || []).filter((pago) => pago.id !== pagoId);
    setSolicitud({ ...solicitud, pagosLaboratorio: pagos });
    persistSolicitud();
  };

  const handleTogglePagoStatus = (pagoId: string) => {
    if (!solicitud) return;
    const pagos = (solicitud.pagosLaboratorio || []).map((pago) =>
      pago.id === pagoId
        ? { ...pago, status: pago.status === 'pagado' ? 'pendiente' : 'pagado' }
        : pago
    );
    setSolicitud({ ...solicitud, pagosLaboratorio: pagos });
    persistSolicitud();
  };

  const handleEditPago = (pago: AdminSolicitud['pagosLaboratorio'][number]) => {
    setEditingPagoId(pago.id);
    setNuevoPago({
      proveedor: pago.proveedor,
      factura: pago.factura,
      fecha: pago.fecha,
      monto: pago.monto.toString(),
      status: pago.status,
      notas: pago.notas || '',
    });
    if (pago.archivoUrl) {
      setNuevoPagoArchivo({ name: pago.archivoNombre || pago.factura, data: pago.archivoUrl });
    } else {
      setNuevoPagoArchivo(null);
    }
  };

  const handleCancelPagoEdit = () => {
    setEditingPagoId(null);
    setNuevoPago({
      proveedor: solicitud?.laboratorio || '',
      factura: '',
      fecha: '',
      monto: '',
      status: 'pendiente',
      notas: '',
    });
    setNuevoPagoArchivo(null);
  };

  const handleAddPagoLaboratorio = () => {
    // Placeholder function to avoid crash
    handleSavePagoLaboratorio();
  };

  const handleViewPagoFactura = (pago: AdminSolicitud['pagosLaboratorio'][number]) => {
    if (!pago.archivoUrl) return;
    const win = window.open();
    if (win) {
      win.document.write(
        `<iframe src="${pago.archivoUrl}" style="width:100%;height:100%" frameborder="0"></iframe>`
      );
    }
  };

  const downloadResultados = () => {
    if (!solicitud?.resultadosUrl) return;

    const link = document.createElement('a');
    link.href = solicitud.resultadosUrl;
    link.download = `resultados-${solicitud.id}.pdf`;
    link.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Cargando servicio...</p>
      </div>
    );
  }

  if (!solicitud) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg font-medium text-gray-900">Servicio no encontrado</p>
        <Link href="/administracion">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Administración
          </Button>
        </Link>
      </div>
    );
  }

  const pagosLaboratorio = solicitud.pagosLaboratorio || [];
  const totalPagosLaboratorio = pagosLaboratorio.reduce((sum, pago) => sum + (pago.monto || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/administracion">
              <Button variant="outline" className="mb-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Servicios
              </Button>
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">{solicitud.paciente}</h1>
            <p className="text-gray-600 mt-1">{solicitud.servicio} - {solicitud.laboratorio}</p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 text-lg px-4 py-2">
              {solicitud.id}
            </Badge>
            <Button onClick={handleSave} disabled={saving} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>

        {/* Información General */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Información General</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Paciente</p>
                <p className="font-medium text-gray-900">{solicitud.paciente}</p>
              </div>
              <div>
                <p className="text-gray-500">Aseguradora</p>
                <p className="font-medium text-gray-900">{solicitud.aseguradora}</p>
              </div>
              <div>
                <p className="text-gray-500">Monto Total</p>
                <p className="font-medium text-gray-900">${solicitud.monto.toLocaleString('es-MX')}</p>
              </div>
              <div>
                <p className="text-gray-500">Fecha Solicitud</p>
                <p className="font-medium text-gray-900">
                  {new Date(solicitud.fechaSolicitud).toLocaleDateString('es-MX')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs para cada sección */}
        <Tabs defaultValue="compras" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="compras" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Compras
            </TabsTrigger>
            <TabsTrigger value="logistica" className="flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Logística
            </TabsTrigger>
            <TabsTrigger value="resultados" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Resultados
            </TabsTrigger>
          </TabsList>

          {/* Tab Compras */}
          <TabsContent value="compras" className="space-y-6">
            {/* Datos Generales de Compra */}
            <Card>
              <CardHeader>
                <CardTitle>Datos Generales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Status de Compra</Label>
                    <Select
                      value={solicitud.statusCompra}
                      onValueChange={(value) => updateField('statusCompra', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="ordenado">Ordenado</SelectItem>
                        <SelectItem value="recibido">Recibido</SelectItem>
                        <SelectItem value="enviado-lab">Enviado a Laboratorio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Número de Orden</Label>
                    <Input
                      value={solicitud.numeroOrden || ''}
                      onChange={(e) => updateField('numeroOrden', e.target.value)}
                      placeholder="ORD-12345"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha de Orden</Label>
                    <Input
                      type="date"
                      value={solicitud.fechaOrdenCompra || ''}
                      onChange={(e) => updateField('fechaOrdenCompra', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Facturación de Compra */}
            <Card>
              <CardHeader>
                <CardTitle>Facturación</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Fecha</Label>
                      <Input
                        type="date"
                        value={nuevoPago.fecha}
                        onChange={(e) => setNuevoPago((prev) => ({ ...prev, fecha: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Monto MXN</Label>
                      <Input
                        type="number"
                        value={nuevoPago.monto}
                        onChange={(e) => setNuevoPago((prev) => ({ ...prev, monto: e.target.value }))}
                        placeholder="0.00"
                      />
                    </div>
                     <div className="space-y-2">
                        <Label>Adjuntar Factura</Label>
                        <Input type="file" onChange={handleFacturaFileChange} />
                      </div>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Logística */}
          <TabsContent value="logistica">
            <Card>
              <CardHeader>
                <CardTitle>Logística y Recolección</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status de Logística</Label>
                    <Select
                      value={solicitud.statusLogistica}
                      onValueChange={(value) => updateField('statusLogistica', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="programado">Programado</SelectItem>
                        <SelectItem value="en-ruta">En Ruta</SelectItem>
                        <SelectItem value="recolectado">Recolectado</SelectItem>
                        <SelectItem value="entregado-lab">Entregado a Laboratorio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha de Recolección</Label>
                    <Input
                      type="date"
                      value={solicitud.fechaRecoleccion || ''}
                      onChange={(e) => updateField('fechaRecoleccion', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Paquetería</Label>
                    <Input
                      value={solicitud.paqueteria || ''}
                      onChange={(e) => updateField('paqueteria', e.target.value)}
                      placeholder="Ej: FedEx, DHL, Estafeta"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Número de Guía</Label>
                    <Input
                      value={solicitud.numeroGuia || ''}
                      onChange={(e) => updateField('numeroGuia', e.target.value)}
                      placeholder="GUIA-12345"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Resultados */}
          <TabsContent value="resultados">
            <Card>
              <CardHeader>
                <CardTitle>Resultados del Estudio</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status de Resultados</Label>
                    <Select
                      value={solicitud.statusResultados}
                      onValueChange={(value) => updateField('statusResultados', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="en-proceso">En Proceso</SelectItem>
                        <SelectItem value="completado">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha Inicio</Label>
                    <Input
                      type="date"
                      value={solicitud.fechaInicioResultados || ''}
                      onChange={(e) => updateField('fechaInicioResultados', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Fecha Fin</Label>
                    <Input
                      type="date"
                      value={solicitud.fechaFinResultados || ''}
                      onChange={(e) => updateField('fechaFinResultados', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cargar Archivo de Resultados</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleFileUpload}
                      disabled={uploadingFile}
                      className="flex-1"
                    />
                    {solicitud.resultadosUrl && (
                      <Button
                        onClick={downloadResultados}
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Descargar
                      </Button>
                    )}
                  </div>
                  {uploadingFile && (
                    <p className="text-sm text-gray-600">Cargando archivo...</p>
                  )}
                  {solicitud.resultadosUrl && !uploadingFile && (
                    <p className="text-sm text-green-600">✓ Archivo cargado correctamente</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
