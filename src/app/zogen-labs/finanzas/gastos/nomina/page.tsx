'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import type { Nomina } from '@/types/nomina';

export default function NominaPage() {
  const [nominas, setNominas] = useState<Nomina[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Nomina>>({
    departamento: 'Administración',
    diasTrabajados: 30,
    metodoPago: 'Transferencia',
    status: 'pendiente',
  });

  useEffect(() => {
    loadNominas();
  }, []);

  const loadNominas = () => {
    const allNominas: Nomina[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('nomina-')) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            allNominas.push(JSON.parse(data) as Nomina);
          } catch (e) {
            console.error('Error parsing nomina:', e);
          }
        }
      }
    }
    setNominas(allNominas.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const calcularTotal = () => {
    const salario = (formData.salarioMensual || 0) * ((formData.diasTrabajados || 0) / 30);
    const horasExtra = formData.horasExtra || 0;
    const bonos = formData.bonos || 0;
    const deducciones = formData.deducciones || 0;
    return salario + horasExtra + bonos - deducciones;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.empleado || !formData.puesto || !formData.salarioMensual || !formData.periodo) {
      alert('Por favor completa los campos obligatorios');
      return;
    }

    const total = calcularTotal();

    const nuevaNomina: Nomina = {
      id: `nomina-${Date.now()}`,
      empleado: formData.empleado,
      puesto: formData.puesto,
      departamento: formData.departamento || 'Administración',
      salarioMensual: Number(formData.salarioMensual),
      periodo: formData.periodo,
      diasTrabajados: Number(formData.diasTrabajados) || 30,
      horasExtra: formData.horasExtra ? Number(formData.horasExtra) : undefined,
      bonos: formData.bonos ? Number(formData.bonos) : undefined,
      deducciones: formData.deducciones ? Number(formData.deducciones) : undefined,
      total,
      metodoPago: formData.metodoPago || 'Transferencia',
      fechaPago: formData.fechaPago,
      status: formData.status || 'pendiente',
      notas: formData.notas,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem(nuevaNomina.id, JSON.stringify(nuevaNomina));
    loadNominas();
    setShowModal(false);
    setFormData({
      departamento: 'Administración',
      diasTrabajados: 30,
      metodoPago: 'Transferencia',
      status: 'pendiente',
    });
  };

  const totalNomina = nominas.reduce((sum, n) => sum + n.total, 0);
  const nominasPendientes = nominas.filter(n => n.status === 'pendiente');
  const totalPendiente = nominasPendientes.reduce((sum, n) => sum + n.total, 0);
  const totalPagado = nominas.filter(n => n.status === 'pagado').reduce((sum, n) => sum + n.total, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-purple-100/30 to-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nómina</h1>
            <p className="text-gray-600 mt-2">
              Monitorea los pagos al equipo y su impacto en los márgenes
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="bg-purple-600 hover:bg-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pago de Nómina
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Nómina</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalNomina.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">{nominas.length} pagos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes de Pago</CardTitle>
              <DollarSign className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">${totalPendiente.toLocaleString('es-MX')}</div>
              <p className="text-xs text-gray-600 mt-1">{nominasPendientes.length} empleados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
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
                ${nominas.length > 0 ? (totalNomina / nominas.length).toLocaleString('es-MX') : '0'}
              </div>
              <p className="text-xs text-gray-600 mt-1">Por empleado</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registro de Nómina</CardTitle>
          </CardHeader>
          <CardContent>
            {nominas.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay pagos de nómina registrados</p>
                <p className="text-sm text-gray-400 mt-1">Haz clic en &quot;Nuevo Pago de Nómina&quot; para comenzar</p>
              </div>
            ) : (
              <div className="space-y-3">
                {nominas.map((nomina) => (
                  <div
                    key={nomina.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{nomina.empleado}</p>
                            <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
                              {nomina.puesto}
                            </Badge>
                            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
                              {nomina.departamento}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={
                                nomina.status === 'pagado'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-amber-100 text-amber-700 border-amber-200'
                              }
                            >
                              {nomina.status === 'pagado' ? 'Pagado' : 'Pendiente'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            Periodo: {nomina.periodo} | Salario base: ${nomina.salarioMensual.toLocaleString('es-MX')}
                          </p>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500">Días trabajados: {nomina.diasTrabajados}</p>
                            {nomina.horasExtra && (
                              <p className="text-xs text-gray-500">Horas extra: ${nomina.horasExtra.toLocaleString('es-MX')}</p>
                            )}
                            {nomina.bonos && (
                              <p className="text-xs text-gray-500">Bonos: ${nomina.bonos.toLocaleString('es-MX')}</p>
                            )}
                            {nomina.deducciones && (
                              <p className="text-xs text-gray-500 text-red-600">Deducciones: -${nomina.deducciones.toLocaleString('es-MX')}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-4 mt-1">
                            <p className="text-xs text-gray-500">Método: {nomina.metodoPago}</p>
                            {nomina.fechaPago && (
                              <p className="text-xs text-gray-500">
                                Fecha pago: {new Date(nomina.fechaPago).toLocaleDateString('es-MX')}
                              </p>
                            )}
                          </div>
                          {nomina.notas && (
                            <p className="text-xs text-gray-500 mt-1 italic">{nomina.notas}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-purple-600">
                        ${nomina.total.toLocaleString('es-MX')}
                      </p>
                      <p className="text-xs text-gray-500">Total neto</p>
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
          <Card className="max-w-3xl w-full max-h-[90vh] overflow-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registrar Pago de Nómina</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowModal(false);
                  setFormData({
                    departamento: 'Administración',
                    diasTrabajados: 30,
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
                    <Label htmlFor="empleado">Nombre del Empleado *</Label>
                    <Input
                      id="empleado"
                      value={formData.empleado || ''}
                      onChange={(e) => setFormData({ ...formData, empleado: e.target.value })}
                      placeholder="Ej: Juan Pérez"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="puesto">Puesto *</Label>
                    <Input
                      id="puesto"
                      value={formData.puesto || ''}
                      onChange={(e) => setFormData({ ...formData, puesto: e.target.value })}
                      placeholder="Ej: Médico General"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="departamento">Departamento *</Label>
                    <Select
                      value={formData.departamento}
                      onValueChange={(value) => setFormData({ ...formData, departamento: value as Nomina['departamento'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Administración">Administración</SelectItem>
                        <SelectItem value="Médico">Médico</SelectItem>
                        <SelectItem value="Laboratorio">Laboratorio</SelectItem>
                        <SelectItem value="Ventas">Ventas</SelectItem>
                        <SelectItem value="Operaciones">Operaciones</SelectItem>
                        <SelectItem value="Tecnología">Tecnología</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="periodo">Periodo *</Label>
                    <Input
                      id="periodo"
                      type="month"
                      value={formData.periodo || ''}
                      onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="salarioMensual">Salario Mensual *</Label>
                    <Input
                      id="salarioMensual"
                      type="number"
                      step="0.01"
                      value={formData.salarioMensual || ''}
                      onChange={(e) => setFormData({ ...formData, salarioMensual: parseFloat(e.target.value) })}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="diasTrabajados">Días Trabajados *</Label>
                    <Input
                      id="diasTrabajados"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.diasTrabajados || 30}
                      onChange={(e) => setFormData({ ...formData, diasTrabajados: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <Label htmlFor="horasExtra">Horas Extra</Label>
                    <Input
                      id="horasExtra"
                      type="number"
                      step="0.01"
                      value={formData.horasExtra || ''}
                      onChange={(e) => setFormData({ ...formData, horasExtra: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bonos">Bonos</Label>
                    <Input
                      id="bonos"
                      type="number"
                      step="0.01"
                      value={formData.bonos || ''}
                      onChange={(e) => setFormData({ ...formData, bonos: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deducciones">Deducciones</Label>
                    <Input
                      id="deducciones"
                      type="number"
                      step="0.01"
                      value={formData.deducciones || ''}
                      onChange={(e) => setFormData({ ...formData, deducciones: e.target.value ? parseFloat(e.target.value) : undefined })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-700">Total a Pagar:</p>
                    <p className="text-2xl font-bold text-purple-600">
                      ${calcularTotal().toLocaleString('es-MX')}
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label htmlFor="metodoPago">Método de Pago *</Label>
                    <Select
                      value={formData.metodoPago}
                      onValueChange={(value) => setFormData({ ...formData, metodoPago: value as Nomina['metodoPago'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Transferencia">Transferencia</SelectItem>
                        <SelectItem value="Efectivo">Efectivo</SelectItem>
                        <SelectItem value="Cheque">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Estado *</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as Nomina['status'] })}
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

                {formData.status === 'pagado' && (
                  <div>
                    <Label htmlFor="fechaPago">Fecha de Pago</Label>
                    <Input
                      id="fechaPago"
                      type="date"
                      value={formData.fechaPago || ''}
                      onChange={(e) => setFormData({ ...formData, fechaPago: e.target.value })}
                    />
                  </div>
                )}

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
                        departamento: 'Administración',
                        diasTrabajados: 30,
                        metodoPago: 'Transferencia',
                        status: 'pendiente',
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                    Guardar Nómina
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
