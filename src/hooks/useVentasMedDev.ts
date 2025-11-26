import { useState, useEffect } from 'react';
import type { VentaMedDev } from '@/types/meddev';

const STORAGE_KEY = 'meddev-ventas';

function getFromStorage(): VentaMedDev[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored) as VentaMedDev[];
  } catch {
    return [];
  }
}

function saveToStorage(data: VentaMedDev[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function useVentasMedDev() {
  const [ventas, setVentas] = useState<VentaMedDev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getFromStorage();
    setVentas(data);
    setLoading(false);
  }, []);

  const addVenta = (venta: Omit<VentaMedDev, 'id' | 'folio' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const folioNumber = ventas.length + 1;
    const folio = `VMD-${folioNumber.toString().padStart(5, '0')}`;

    const newVenta: VentaMedDev = {
      ...venta,
      id: Date.now().toString(),
      folio,
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...ventas, newVenta];
    setVentas(updated);
    saveToStorage(updated);
    return newVenta;
  };

  const updateVenta = (id: string, updates: Partial<VentaMedDev>) => {
    const updated = ventas.map((v) =>
      v.id === id
        ? { ...v, ...updates, updatedAt: new Date().toISOString() }
        : v
    );
    setVentas(updated);
    saveToStorage(updated);
  };

  const deleteVenta = (id: string) => {
    const updated = ventas.filter((v) => v.id !== id);
    setVentas(updated);
    saveToStorage(updated);
  };

  const facturarVenta = (id: string, facturaNumero: string) => {
    updateVenta(id, {
      estatus: 'facturado',
      facturaNumero,
      facturaFecha: new Date().toISOString(),
    });
  };

  const cobrarVenta = (id: string, metodoPago: string, cuentaCobro?: string, lugarRecepcion?: string) => {
    updateVenta(id, {
      estatus: 'cobrado',
      cobranzaFecha: new Date().toISOString(),
      metodoPago,
      cuentaCobro,
      lugarRecepcion,
    });
  };

  return {
    ventas,
    loading,
    addVenta,
    updateVenta,
    deleteVenta,
    facturarVenta,
    cobrarVenta,
  };
}
