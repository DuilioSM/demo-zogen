'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, DollarSign, FileText, Calendar, TrendingDown } from 'lucide-react';
import type { Gasto } from '@/types/gasto';

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Gasto>>({
    categoria: 'Servicios',
    metodoPago: 'Transferencia',
    status: 'pendiente',
  });

  useEffect(() => {
    loadGastos();
  }, []);

  const loadGastos = () => {
    const allGastos: Gasto[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('gasto-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            allGastos.push(JSON.parse(data) as Gasto);
          } catch (e) {
            console.error('Error parsing gasto:', e);
          }
        }
      }
    }
    setGastos(allGastos.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.concepto || !formData.proveedor || !formData.monto || !formData.fecha) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const nuevoGasto: Gasto = {
      id: `gasto-${Date.now()}`,
      concepto: formData.concepto,
      categoria: formData.categoria || 'Servicios',
      proveedor: formData.proveedor,
      monto: Number(formData.monto),
      fecha: formData.fecha,
      metodoPago: formData.metodoPago || 'Transferencia',
      numeroFactura: formData.numeroFactura,
      status: formData.status || 'pendiente',
      notas: formData.notas,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(nuevoGasto.id, JSON.stringify(nuevoGasto));
    loadGastos();
    setShowModal(false);
    setFormData({
      categoria: 'Servicios',
      metodoPago: 'Transferencia',
      status: 'pendiente',
    });
  };

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gastosPendientes = gastos.filter(g => g.status === 'pendiente');
  const totalPendiente = gastosPendientes.reduce((sum, g) => sum + g.monto, 0);
  const totalPagado = gastos.filter(g => g.status === 'pagado').reduce((sum, g) => sum + g.monto, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gastos Operativos</h1>
            <p className="text-gray-600 mt-2">
              Gestiona y monitorea todos los gastos operativos del negocio
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Gasto
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalGastos.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">{gastos.length} registros</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">${totalPendiente.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">{gastosPendientes.length} gastos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${totalPagado.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">Completados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Promedio</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                ${gastos.length > 0 ? (totalGastos / gastos.length).toLocaleString('es-MX') : '0'}
              </div>
              <p className="text-xs text-gray-600 mt-1">Por gasto</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Gastos</CardTitle>
          </CardHeader>
          <CardContent>
            {gastos.length === 0 ? (
              <div className="text-center py-12">
                <TrendingDown className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay gastos registrados</p>
                <p className="text-sm text-gray-400 mt-1">Haz clic en &quot;Nuevo Gasto&quot; para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {gastos.map((gasto) => (
                  <div
                    key={gasto.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{gasto.concepto}</p>
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                              {gasto.categoria}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                gasto.status === 'pagado'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-amber-100 text-amber-700 border-amber-200'
                              }
                            >
                              {gasto.status === 'pagado' ? 'Pagado' : 'Pendiente'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">Proveedor: {gasto.proveedor}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500">
                              Fecha: {new Date(gasto.fecha).toLocaleDateString('es-MX')}
                            </p>
                            <p className="text-xs text-gray-500">Método: {gasto.metodoPago}</p>
                            {gasto.numeroFactura && (
                              <p className="text-xs text-gray-500">Factura: {gasto.numeroFactura}</p>
                            )}
                          </div>
                          {gasto.notas && (
                            <p className="text-xs text-gray-500 mt-1 italic">{gasto.notas}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-red-600">
                        ${gasto.monto.toLocaleString('es-MX')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-6 z-50">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registrar Nuevo Gasto</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    categoria: 'Servicios',
                    metodoPago: 'Transferencia',
                    status: 'pendiente',
                  });
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="concepto">Concepto *</Label>
                    <Input
                      id="concepto"
                      value={formData.concepto || ''}
                      onChange={(e) => setFormData({ ...formData, concepto: e.target.value })}
                      placeholder="Ej: Pago de luz"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="categoria">Categoría *</Label>
                    <Select
                      value={formData.categoria}
                      onValueChange={(value) => setFormData({ ...formData, categoria: value as Gasto['categoria'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Servicios">Servicios</SelectItem>
                        <SelectItem value="Suministros">Suministros</SelectItem>
                        <SelectItem value="Mantenimiento">Mantenimiento</SelectItem>
                        <SelectItem value="Marketing">Marketing</SelectItem>
                        <SelectItem value="Tecnología">Tecnología</SelectItem>
                        <SelectItem value="Otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="proveedor">Proveedor *</Label>
                    <Input
                      id="proveedor"
                      value={formData.proveedor || ''}
                      onChange={(e) => setFormData({ ...formData, proveedor: e.target.value })}
                      placeholder="Nombre del proveedor"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="monto">Monto *</Label>
                    <Input
                      id="monto"
                      type="number"
                      step="0.01"
                      value={formData.monto || ''}
                      onChange={(e) => setFormData({ ...formData, monto: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="fecha">Fecha *</Label>
                    <Input
                      id="fecha"
                      type="date"
                      value={formData.fecha || ''}
                      onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="metodoPago">Método de Pago *</Label>
                    <Select
                      value={formData.metodoPago}
                      onValueChange={(value) => setFormData({ ...formData, metodoPago: value as Gasto['metodoPago'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="numeroFactura">Número de Factura</Label>
                    <Input
                      id="numeroFactura"
                      value={formData.numeroFactura || ''}
                      onChange={(e) => setFormData({ ...formData, numeroFactura: e.target.value })}
                      placeholder="Opcional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Gasto['status'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pendiente">Pendiente</SelectItem>
                        <SelectItem value="pagado">Pagado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notas">Notas</Label>
                  <Textarea
                    id="notas"
                    value={formData.notas || ''}
                    onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                    placeholder="Información adicional (opcional)"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({
                        categoria: 'Servicios',
                        metodoPago: 'Transferencia',
                        status: 'pendiente',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Guardar Gasto
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
