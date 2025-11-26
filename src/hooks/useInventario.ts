import { useState, useEffect } from 'react';

export interface ItemInventario {
  id: string;
  almacenId: string;
  productoId: string;
  cantidad: number;
  stockMinimo: number;
  lote?: string;
  updatedAt: string;
}

export interface MovimientoInventario {
  id: string;
  fecha: string;
  tipo: 'entrada' | 'salida';
  almacenId: string;
  productoId: string;
  cantidad: number;
  referencia?: string;
  notas?: string;
  createdAt: string;
}

const STORAGE_KEYS = {
  INVENTARIO: 'meddev-inventario',
  MOVIMIENTOS: 'meddev-movimientos',
};

// Datos iniciales de inventario
const INITIAL_INVENTARIO: ItemInventario[] = [];

const INITIAL_MOVIMIENTOS: MovimientoInventario[] = [];

function getFromStorage<T>(key: string, initial: T): T {
  if (typeof window === 'undefined') return initial;

  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }

  try {
    return JSON.parse(stored) as T;
  } catch {
    return initial;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

export function useInventario() {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const invData = getFromStorage(STORAGE_KEYS.INVENTARIO, INITIAL_INVENTARIO);
    const movData = getFromStorage(STORAGE_KEYS.MOVIMIENTOS, INITIAL_MOVIMIENTOS);
    setInventario(invData);
    setMovimientos(movData);
    setLoading(false);
  }, []);

  // Obtener inventario de un almacén específico
  const getInventarioByAlmacen = (almacenId: string) => {
    return inventario.filter((item) => item.almacenId === almacenId);
  };

  // Obtener movimientos de un almacén específico
  const getMovimientosByAlmacen = (almacenId: string) => {
    return movimientos
      .filter((mov) => mov.almacenId === almacenId)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
      .slice(0, 10); // Solo los últimos 10
  };

  // Agregar o actualizar item de inventario
  const setItemInventario = (item: Omit<ItemInventario, 'id' | 'updatedAt'>) => {
    const existing = inventario.find(
      (i) => i.almacenId === item.almacenId && i.productoId === item.productoId
    );

    if (existing) {
      // Actualizar
      const updated = inventario.map((i) =>
        i.id === existing.id
          ? { ...i, ...item, updatedAt: new Date().toISOString() }
          : i
      );
      setInventario(updated);
      saveToStorage(STORAGE_KEYS.INVENTARIO, updated);
    } else {
      // Crear
      const newItem: ItemInventario = {
        ...item,
        id: Date.now().toString(),
        updatedAt: new Date().toISOString(),
      };
      const updated = [...inventario, newItem];
      setInventario(updated);
      saveToStorage(STORAGE_KEYS.INVENTARIO, updated);
    }
  };

  // Registrar movimiento (entrada o salida)
  const registrarMovimiento = (movimiento: Omit<MovimientoInventario, 'id' | 'createdAt'>) => {
    // Crear el movimiento
    const newMovimiento: MovimientoInventario = {
      ...movimiento,
      id: `mv-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    const updatedMovimientos = [newMovimiento, ...movimientos];
    setMovimientos(updatedMovimientos);
    saveToStorage(STORAGE_KEYS.MOVIMIENTOS, updatedMovimientos);

    // Actualizar inventario
    const existing = inventario.find(
      (i) => i.almacenId === movimiento.almacenId && i.productoId === movimiento.productoId
    );

    if (existing) {
      const nuevaCantidad =
        movimiento.tipo === 'entrada'
          ? existing.cantidad + movimiento.cantidad
          : existing.cantidad - movimiento.cantidad;

      const updatedInventario = inventario.map((i) =>
        i.id === existing.id
          ? { ...i, cantidad: Math.max(0, nuevaCantidad), updatedAt: new Date().toISOString() }
          : i
      );

      setInventario(updatedInventario);
      saveToStorage(STORAGE_KEYS.INVENTARIO, updatedInventario);
    } else if (movimiento.tipo === 'entrada') {
      // Si es entrada y no existe, crear el item
      const newItem: ItemInventario = {
        id: Date.now().toString(),
        almacenId: movimiento.almacenId,
        productoId: movimiento.productoId,
        cantidad: movimiento.cantidad,
        stockMinimo: 0,
        updatedAt: new Date().toISOString(),
      };

      const updatedInventario = [...inventario, newItem];
      setInventario(updatedInventario);
      saveToStorage(STORAGE_KEYS.INVENTARIO, updatedInventario);
    }

    return newMovimiento;
  };

  // Actualizar stock mínimo
  const updateStockMinimo = (almacenId: string, productoId: string, stockMinimo: number) => {
    const updated = inventario.map((i) =>
      i.almacenId === almacenId && i.productoId === productoId
        ? { ...i, stockMinimo, updatedAt: new Date().toISOString() }
        : i
    );
    setInventario(updated);
    saveToStorage(STORAGE_KEYS.INVENTARIO, updated);
  };

  return {
    inventario,
    movimientos,
    loading,
    getInventarioByAlmacen,
    getMovimientosByAlmacen,
    setItemInventario,
    registrarMovimiento,
    updateStockMinimo,
  };
}
