import { useEffect, useState } from 'react';

import type { Solicitud, SolicitudServiceData } from '@/types/solicitudes';
import { SERVICIOS_CATALOG, getServicioByName } from '@/types/servicio';
import { ASEGURADORAS_CATALOG } from '@/types/aseguradora';

export function useServiceSnapshot(solicitud?: Solicitud | null) {
  const [serviceData, setServiceData] = useState<SolicitudServiceData | null>(null);

  useEffect(() => {
    if (!solicitud) {
      setServiceData(null);
      return;
    }

    if (typeof window === 'undefined') return;

    const storageKey = `service-data-${solicitud.id}`;
    const stored = window.localStorage.getItem(storageKey);
    if (stored) {
      try {
        setServiceData(JSON.parse(stored));
        return;
      } catch (error) {
        console.error('Error loading stored service data', error);
      }
    }

    const matchedById = solicitud.servicioId
      ? SERVICIOS_CATALOG.find((item) => item.id === solicitud.servicioId)
      : null;
    const matchedByName = !matchedById ? getServicioByName(solicitud.servicioNombre || solicitud.testType) : null;
    const servicio = matchedById || matchedByName || SERVICIOS_CATALOG[0];
    const aseguradoraFromSolicitud = solicitud.aseguradoraId
      ? ASEGURADORAS_CATALOG.find((item) => item.id === solicitud.aseguradoraId)
      : null;

    const snapshot: SolicitudServiceData = {
      servicioId: servicio?.id || '',
      servicioNombre: servicio?.nombre || solicitud.testType,
      laboratorio: servicio?.laboratorio,
      precioUnitario: servicio?.precio,
      tiempoEntrega: servicio?.tiempoEntrega,
      cantidad: solicitud.servicioCantidad ?? 1,
      metodoPago: solicitud.metodoPago ?? (aseguradoraFromSolicitud ? 'aseguradora' : 'bolsillo'),
      aseguradoraId: solicitud.aseguradoraId ?? aseguradoraFromSolicitud?.id,
      aseguradoraNombre: solicitud.aseguradoraNombre ?? aseguradoraFromSolicitud?.nombre,
      aseguradoraRfc: solicitud.aseguradoraRFC ?? aseguradoraFromSolicitud?.rfc,
      notas: '',
    };

    setServiceData(snapshot);
  }, [solicitud]);

  return serviceData;
}
