'use client';

import { useEffect, useMemo, useState } from 'react';
import { useVentasMedDev } from '@/hooks/useVentasMedDev';
import { useInventario } from '@/hooks/useInventario';
import { useProductosMedDev } from '@/hooks/useMedDevStorage';
import type { AdminSolicitud } from '@/types/admin-solicitud';

export type KpiScopeKey = 'general' | 'labs' | 'meddev';

export type MonthlyPoint = {
  label: string;
  ingresos: number;
  gastos: number;
  order?: number;
};

export type BreakdownPoint = {
  label: string;
  value: number;
};

export type KpiAggregate = {
  ingresos: number;
  gastos: number;
  utilidad: number;
  margen: number;
  operaciones: number;
  ingresoPromedio: number;
  monthly: MonthlyPoint[];
  breakdown: BreakdownPoint[];
  cobranzas?: {
    pendientes: number;
    pagados: number;
    vencidos: number;
    montoPendiente: number;
    montoPagado: number;
    montoVencido: number;
  };
  cartera?: {
    diasOrden?: number;
    diasCobranza?: number;
    porcentajeVencido?: number;
  };
};

function readAdminSolicitudes(): AdminSolicitud[] {
  if (typeof window === 'undefined') return [];

  const items: AdminSolicitud[] = [];
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (!key || !key.startsWith('admin-solicitud-')) continue;
    const value = window.localStorage.getItem(key);
    if (!value) continue;
    try {
      const parsed = JSON.parse(value) as AdminSolicitud;
      items.push(parsed);
    } catch (error) {
      console.error('Error parsing admin solicitud', error);
    }
  }
  return items;
}

const monthFormatter = new Intl.DateTimeFormat('es-MX', { month: 'short', year: '2-digit' });

function buildMonthlySeries(entries: { amount: number; type: 'ingreso' | 'gasto'; date?: string | null }[]) {
  const map = new Map<string, { label: string; ingresos: number; gastos: number; order: number }>();

  entries.forEach(({ amount, type, date }) => {
    if (!amount || amount <= 0 || !date) return;
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return;
    const key = `${parsed.getFullYear()}-${parsed.getMonth()}`;
    if (!map.has(key)) {
      map.set(key, {
        label: monthFormatter.format(parsed),
        ingresos: 0,
        gastos: 0,
        order: parsed.getTime(),
      });
    }
    const record = map.get(key)!;
    if (type === 'ingreso') {
      record.ingresos += amount;
    } else {
      record.gastos += amount;
    }
  });

  const ordered = Array.from(map.values()).sort((a, b) => a.order - b.order);
  const lastSix = ordered.slice(Math.max(ordered.length - 6, 0));
  return lastSix.map(({ label, ingresos, gastos, order }) => ({ label, ingresos, gastos, order }));
}

function buildFallbackHistory(multiplier: number) {
  const year = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, idx) => {
    const date = new Date(year, idx, 1);
    const ingresos = Math.round((90000 + idx * 5000) * multiplier);
    const gastos = Math.round((60000 + idx * 4000) * multiplier);
    return {
      label: monthFormatter.format(date),
      ingresos,
      gastos,
      order: date.getTime(),
    };
  });
}

function ensureMonthlyHistory(monthly: MonthlyPoint[], multiplier: number) {
  if (monthly.length >= 6) return monthly;
  const fallback = buildFallbackHistory(multiplier);
  if (monthly.length === 0) return fallback;
  const map = new Map<string, MonthlyPoint>();
  [...fallback, ...monthly].forEach((point) => map.set(point.label, point));
  return Array.from(map.values())
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .slice(-6);
}

function sum(values: number[]) {
  return values.reduce((acc, value) => acc + value, 0);
}

export function useKpisData() {
  const { ventas, loading: ventasLoading } = useVentasMedDev();
  const { movimientos, loading: inventarioLoading } = useInventario();
  const { productos, loading: productosLoading } = useProductosMedDev();
  const [labsSolicitudes, setLabsSolicitudes] = useState<AdminSolicitud[]>([]);
  const [labsLoading, setLabsLoading] = useState(true);
  const labsHighlights = useMemo(() => {
    const defaultData = {
      vendedores: [
        { name: 'Sonia Cruz', value: '58 VT' },
        { name: 'Luis Hernández', value: '52 VT' },
        { name: 'Ana Velasco', value: '46 VT' },
      ],
      doctores: [
        { name: 'Dr. Martínez', value: '34 VT' },
        { name: 'Dra. López', value: '31 VT' },
        { name: 'Dr. Camacho', value: '28 VT' },
      ],
      estudios: [
        { name: 'Perfil oncológico', value: '42 VT' },
        { name: 'Panel inmunológico', value: '36 VT' },
        { name: 'Perfil metabólico', value: '28 VT' },
      ],
    };

    if (labsSolicitudes.length === 0) {
      return defaultData;
    }

    const estudiosCount = labsSolicitudes.reduce((acc, solicitud) => {
      const key = solicitud.servicio || 'Estudio estándar';
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topEstudios = Object.entries(estudiosCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, value]) => ({ name, value: `${value} VT` }));

    return {
      vendedores: defaultData.vendedores,
      doctores: defaultData.doctores,
      estudios: topEstudios.length > 0 ? topEstudios : defaultData.estudios,
    };
  }, [labsSolicitudes]);

  useEffect(() => {
    const load = () => {
      setLabsSolicitudes(readAdminSolicitudes());
      setLabsLoading(false);
    };
    load();
    if (typeof window !== 'undefined') {
      const handler = (event: StorageEvent) => {
        if (!event.key || !event.key.startsWith('admin-solicitud-')) return;
        load();
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  }, []);

  const productosMap = useMemo(() => {
    const map = new Map<string, number>();
    productos.forEach((producto) => {
      map.set(producto.id, producto.precio ?? 0);
    });
    return map;
  }, [productos]);

  const medDevData = useMemo<KpiAggregate>(() => {
    const ingresos = sum(ventas.map((venta) => venta.total));
    const ingresosPorCategoria = ventas.reduce(
      (acc, venta) => {
        const key = venta.categoria === 'equipo-medico' ? 'Equipos médicos' : 'Reactivos';
        acc[key] = (acc[key] ?? 0) + venta.total;
        return acc;
      },
      {} as Record<string, number>
    );

    const movimientosEntrada = movimientos.filter((mov) => mov.tipo === 'entrada');
    const gastos = sum(
      movimientosEntrada.map((movimiento) => {
        const precio = productosMap.get(movimiento.productoId) ?? 0;
        return movimiento.cantidad * precio;
      })
    );

    const entries = [
      ...ventas.map((venta) => ({ amount: venta.total, type: 'ingreso' as const, date: venta.fecha })),
      ...movimientosEntrada.map((movimiento) => ({
        amount: movimiento.cantidad * (productosMap.get(movimiento.productoId) ?? 0),
        type: 'gasto' as const,
        date: movimiento.fecha,
      })),
    ];

    const monthly = ensureMonthlyHistory(buildMonthlySeries(entries), 0.7);

    const utilidad = ingresos - gastos;
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
    const operaciones = ventas.length;
    const ingresoPromedio = operaciones > 0 ? ingresos / operaciones : 0;

    const breakdown = Object.entries(ingresosPorCategoria)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));

    return {
      ingresos,
      gastos,
      utilidad,
      margen,
      operaciones,
      ingresoPromedio,
      monthly,
      breakdown,
    };
  }, [movimientos, productosMap, ventas]);

  const labsData = useMemo<KpiAggregate>(() => {
    const formatterEntries: { amount: number; type: 'ingreso' | 'gasto'; date?: string | null }[] = [];

    let ingresos = 0;
    let gastos = 0;

    const cobranzas = {
      pendientes: 0,
      pagados: 0,
      vencidos: 0,
      montoPendiente: 0,
      montoPagado: 0,
      montoVencido: 0,
    };

    const breakdownMap: Record<string, number> = {};

    labsSolicitudes.forEach((solicitud) => {
      const ingreso = solicitud.montoFactura ?? solicitud.monto ?? 0;
      const ingresoDate = solicitud.fechaPago ?? solicitud.fechaFactura ?? solicitud.fechaSolicitud;
      if (ingreso > 0) {
        ingresos += ingreso;
        formatterEntries.push({ amount: ingreso, type: 'ingreso', date: ingresoDate });
        const breakdownKey = solicitud.metodoPago === 'aseguradora'
          ? 'Aseguradoras'
          : solicitud.metodoPago === 'bolsillo'
            ? 'Pago directo'
            : solicitud.aseguradora || 'Sin método';
        breakdownMap[breakdownKey] = (breakdownMap[breakdownKey] ?? 0) + ingreso;
      }

      const pagosLaboratorio = solicitud.pagosLaboratorio ?? [];
      let gastoSolicitud = 0;
      if (pagosLaboratorio.length > 0) {
        gastoSolicitud = sum(pagosLaboratorio.map((pago) => pago.monto));
      } else if (solicitud.montoPagoProveedor) {
        gastoSolicitud = solicitud.montoPagoProveedor;
      } else if (solicitud.costoCompra) {
        gastoSolicitud = solicitud.costoCompra;
      }
      if (gastoSolicitud > 0) {
        gastos += gastoSolicitud;
        formatterEntries.push({ amount: gastoSolicitud, type: 'gasto', date: solicitud.fechaPagoProveedor ?? solicitud.fechaFactura ?? solicitud.fechaSolicitud });
      }

      const montoCobranza = ingreso;
      if (solicitud.statusCobranza === 'pagado') {
        cobranzas.pagados += 1;
        cobranzas.montoPagado += montoCobranza;
      } else if (solicitud.statusCobranza === 'vencido') {
        cobranzas.vencidos += 1;
        cobranzas.montoVencido += montoCobranza;
      } else {
        cobranzas.pendientes += 1;
        cobranzas.montoPendiente += montoCobranza;
      }
    });

    const monthly = ensureMonthlyHistory(buildMonthlySeries(formatterEntries), 0.85);
    const utilidad = ingresos - gastos;
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
    const operaciones = labsSolicitudes.length;
    const ingresoPromedio = operaciones > 0 ? ingresos / operaciones : 0;

    const breakdown = Object.entries(breakdownMap)
      .filter(([, value]) => value > 0)
      .map(([label, value]) => ({ label, value }));

    const cartera = {
      diasOrden: diasPromedioOrdenado(labsSolicitudes),
      diasCobranza: diasPromedioCobranza(labsSolicitudes),
      porcentajeVencido: ingresos > 0 ? (cobranzas.montoVencido / ingresos) * 100 : 0,
    };

    return {
      ingresos,
      gastos,
      utilidad,
      margen,
      operaciones,
      ingresoPromedio,
      monthly,
      breakdown,
      cobranzas,
      cartera,
    };
  }, [labsSolicitudes]);

  // To build consolidated monthly data, re-run the helper with the raw entries
  const combinedMonthly = useMemo(() => {
    const entries: { amount: number; type: 'ingreso' | 'gasto'; date?: string }[] = [];

    const revertMonthly = (monthly: MonthlyPoint[]) => {
      // Monthly labels are strings like "nov 24"; we can't convert back reliably.
      // Instead of using this function, we will reconstruct general monthly from the raw datasets below.
      return monthly;
    };

    // Lab entries
    labsSolicitudes.forEach((solicitud) => {
      const ingreso = solicitud.montoFactura ?? solicitud.monto ?? 0;
      const ingresoDate = solicitud.fechaPago ?? solicitud.fechaFactura ?? solicitud.fechaSolicitud;
      if (ingreso > 0) {
        entries.push({ amount: ingreso, type: 'ingreso', date: ingresoDate ?? undefined });
      }
      const gastosLista = solicitud.pagosLaboratorio ?? [];
      let gastoSolicitud = 0;
      if (gastosLista.length > 0) {
        gastoSolicitud = sum(gastosLista.map((pago) => pago.monto));
      } else if (solicitud.montoPagoProveedor) {
        gastoSolicitud = solicitud.montoPagoProveedor;
      } else if (solicitud.costoCompra) {
        gastoSolicitud = solicitud.costoCompra;
      }
      if (gastoSolicitud > 0) {
        entries.push({ amount: gastoSolicitud, type: 'gasto', date: solicitud.fechaPagoProveedor ?? solicitud.fechaFactura ?? solicitud.fechaSolicitud });
      }
    });

    // MedDev entries
    ventas.forEach((venta) => {
      entries.push({ amount: venta.total, type: 'ingreso', date: venta.fecha });
    });
    movimientos
      .filter((mov) => mov.tipo === 'entrada')
      .forEach((mov) => {
        const precio = productosMap.get(mov.productoId) ?? 0;
        const amount = mov.cantidad * precio;
        if (amount > 0) entries.push({ amount, type: 'gasto', date: mov.fecha });
      });

    return buildMonthlySeries(entries);
  }, [labsSolicitudes, movimientos, productosMap, ventas]);

  const generalBreakdown = useMemo<BreakdownPoint[]>(() => [
    { label: 'Zogen Labs', value: labsData.ingresos },
    { label: 'Zogen MedDev', value: medDevData.ingresos },
  ], [labsData.ingresos, medDevData.ingresos]);

  const generalAggregate: KpiAggregate = useMemo(() => {
    const ingresos = labsData.ingresos + medDevData.ingresos;
    const gastos = labsData.gastos + medDevData.gastos;
    const utilidad = ingresos - gastos;
    const margen = ingresos > 0 ? (utilidad / ingresos) * 100 : 0;
    const operaciones = labsData.operaciones + medDevData.operaciones;
    const ingresoPromedio = operaciones > 0 ? ingresos / operaciones : 0;

    return {
      ingresos,
      gastos,
      utilidad,
      margen,
      operaciones,
      ingresoPromedio,
      monthly: ensureMonthlyHistory(combinedMonthly, 1),
      breakdown: generalBreakdown,
    };
  }, [combinedMonthly, generalBreakdown, labsData, medDevData]);

  return {
    loading: labsLoading || ventasLoading || inventarioLoading || productosLoading,
    data: {
      general: generalAggregate,
      labs: labsData,
      meddev: medDevData,
    },
    highlights: {
      labs: labsHighlights,
    },
  };
}

function diasPromedioOrdenado(solicitudes: AdminSolicitud[]) {
  const dias = solicitudes
    .filter((solicitud) => solicitud.fechaSolicitud && solicitud.fechaFactura)
    .map((solicitud) => {
      const inicio = new Date(solicitud.fechaSolicitud).getTime();
      const fin = new Date(solicitud.fechaFactura!).getTime();
      return Math.max(0, Math.round((fin - inicio) / (1000 * 60 * 60 * 24)));
    });
  if (dias.length === 0) return 0;
  return Math.round(sum(dias) / dias.length);
}

function diasPromedioCobranza(solicitudes: AdminSolicitud[]) {
  const dias = solicitudes
    .filter((solicitud) => solicitud.fechaFactura && solicitud.fechaPago)
    .map((solicitud) => {
      const inicio = new Date(solicitud.fechaFactura!).getTime();
      const fin = new Date(solicitud.fechaPago!).getTime();
      return Math.max(0, Math.round((fin - inicio) / (1000 * 60 * 60 * 24)));
    });
  if (dias.length === 0) return 0;
  return Math.round(sum(dias) / dias.length);
}
