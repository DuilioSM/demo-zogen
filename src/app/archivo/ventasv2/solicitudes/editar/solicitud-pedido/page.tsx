'use client';

import { useSearchParams } from 'next/navigation';
import { SolicitudEditor } from '@/components/SolicitudEditor';
import { useState, useEffect, useMemo } from 'react';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PADECIMIENTOS_CATALOG } from '@/types/padecimiento';
import { ESPECIALISTAS_CATALOG } from '@/types/especialista';
import type { Solicitud } from '@/types/solicitudes';

type OrderData = {
  patient: string;
  doctor: string;
  testType: string;
  condition: string;
  contactPhone: string;
};

export default function SolicitudPedidoPage() {
  const searchParams = useSearchParams();
  const solicitudId = searchParams.get('id') || '';
  const { solicitudes } = useSolicitudes();

  const solicitud = useMemo(() => {
    return solicitudes.find((s) => s.id === solicitudId);
  }, [solicitudes, solicitudId]);

  const [orderData, setOrderData] = useState<OrderData>({
    patient: '',
    doctor: '',
    testType: '',
    condition: '',
    contactPhone: '',
  });

  useEffect(() => {
    if (!solicitud) return;
    const stored = localStorage.getItem(`order-data-${solicitud.id}`);
    if (stored) {
      try {
        setOrderData(JSON.parse(stored));
      } catch (error) {
        setOrderData({
          patient: solicitud.patient,
          doctor: solicitud.doctor,
          testType: solicitud.testType,
          condition: solicitud.condition,
          contactPhone: solicitud.contactPhone,
        });
      }
    } else {
      setOrderData({
        patient: solicitud.patient,
        doctor: solicitud.doctor,
        testType: solicitud.testType,
        condition: solicitud.condition,
        contactPhone: solicitud.contactPhone,
      });
    }
  }, [solicitud]);

  const handleSave = () => {
    if (!solicitud) return;
    localStorage.setItem(`order-data-${solicitud.id}`, JSON.stringify(orderData));

    try {
      const storedSolicitudes = localStorage.getItem('zogen-solicitudes');
      if (storedSolicitudes) {
        const parsed = JSON.parse(storedSolicitudes);
        const updated = parsed.map((item: Solicitud) =>
          item.id === solicitud.id ? { ...item, ...orderData } : item
        );
        localStorage.setItem('zogen-solicitudes', JSON.stringify(updated));
      }
    } catch (error) {
      console.error('Error syncing order data:', error);
    }

    alert('Datos de la solicitud guardados correctamente');
  };

  const getEspecialista = () => {
    if (!solicitud) return 'No asignado';
    const especialista = ESPECIALISTAS_CATALOG.find(e => e.telefono === solicitud.vendorPhone);
    return especialista?.nombreCompleto || 'No asignado';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (!solicitud) {
    return <div>Cargando...</div>;
  }

  return (
    <SolicitudEditor solicitudId={solicitudId} currentStep="solicitud-pedido">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">
            Datos de la Solicitud
          </h2>
          <p className="text-sm text-gray-600">
            Los campos marcados con * son obligatorios
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Editar datos de la solicitud:</strong> Puedes modificar los campos de la solicitud de pedido.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Nombre del paciente *
            </label>
            <Input
              value={orderData.patient}
              onChange={(e) => setOrderData({ ...orderData, patient: e.target.value })}
              placeholder="Nombre completo del paciente"
              className="border-[#D5D0C8]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Teléfono de contacto *
            </label>
            <Input
              value={orderData.contactPhone}
              onChange={(e) => setOrderData({ ...orderData, contactPhone: e.target.value })}
              placeholder="+52 55 1234 5678"
              className="border-[#D5D0C8]"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Médico Solicitante
            </label>
            <Input
              value={orderData.doctor}
              onChange={(e) => setOrderData({ ...orderData, doctor: e.target.value })}
              placeholder="Nombre del médico"
              className="border-[#D5D0C8]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Especialista
            </label>
            <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
              {getEspecialista()}
            </div>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Tipo de prueba
            </label>
            <Input
              value={orderData.testType}
              onChange={(e) => setOrderData({ ...orderData, testType: e.target.value })}
              placeholder="Tipo de estudio"
              className="border-[#D5D0C8]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Padecimiento *
            </label>
            <Select
              value={orderData.condition}
              onValueChange={(value) => setOrderData({ ...orderData, condition: value })}
            >
              <SelectTrigger className="border-[#D5D0C8]">
                <SelectValue placeholder="Selecciona un padecimiento" />
              </SelectTrigger>
              <SelectContent>
                {PADECIMIENTOS_CATALOG.filter(p => p.activo).map((padecimiento) => (
                  <SelectItem key={padecimiento.id} value={padecimiento.nombre}>
                    {padecimiento.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Fecha de creación
          </label>
          <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-700">
            {formatDate(solicitud.createdAt)}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            className="bg-[#7B5C45] hover:bg-[#6A4D38] px-6 py-2"
          >
            Guardar Cambios
          </Button>
        </div>
      </div>
    </SolicitudEditor>
  );
}
