import { useState, useEffect } from 'react';
import type { ProductoMedDev, Almacen, ClienteMedDev } from '@/types/meddev';

const STORAGE_KEYS = {
  PRODUCTOS: 'meddev-productos',
  ALMACENES: 'meddev-almacenes',
  CLIENTES: 'meddev-clientes',
};

// Datos iniciales
const now = new Date().toISOString();

const INITIAL_PRODUCTOS: ProductoMedDev[] = [
  {
    id: 'eq-1',
    nombre: 'Gtrain 1,600',
    precio: 45000,
    descripcion: 'Monitor de signos vitales Gtrain modelo 1,600',
    tipo: 'equipo-medico',
    createdAt: now,
  },
  {
    id: 'eq-2',
    nombre: 'Gtrain 1,199',
    precio: 38000,
    descripcion: 'Monitor de signos vitales Gtrain modelo 1,199',
    tipo: 'equipo-medico',
    createdAt: now,
  },
  {
    id: 'eq-3',
    nombre: 'Gtrain 1,1160',
    precio: 52000,
    descripcion: 'Monitor de signos vitales Gtrain modelo 1,1160',
    tipo: 'equipo-medico',
    createdAt: now,
  },
  {
    id: 're-1',
    nombre: 'Kit reactivos OncoLab',
    precio: 16500,
    descripcion: 'Panel de reactivos para oncología con 24 pruebas',
    tipo: 'reactivo',
    createdAt: now,
  },
  {
    id: 're-2',
    nombre: 'Cartuchos PCR Prime',
    precio: 8900,
    descripcion: 'Cartuchos desechables para PCR en punto de atención',
    tipo: 'reactivo',
    createdAt: now,
  },
  {
    id: 're-3',
    nombre: 'Control hematología 3N',
    precio: 7200,
    descripcion: 'Control interno de 3 niveles para analizadores hematológicos',
    tipo: 'reactivo',
    createdAt: now,
  },
];

const INITIAL_ALMACENES: Almacen[] = [
  {
    id: '1',
    nombre: 'Almacén Central',
    ubicacion: 'Guadalajara, Jalisco',
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_CLIENTES: ClienteMedDev[] = [
  {
    id: '1',
    razonSocial: 'Hospital Angeles del Pedregal S.A. de C.V.',
    rfc: 'HAP920415KL8',
    contacto: 'Dr. Roberto Méndez',
    telefono: '55-1234-5678',
    email: 'compras@angelespedregal.com',
    direccion: 'Camino a Santa Teresa 1055, Ciudad de México',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    razonSocial: 'Hospital Civil de Guadalajara',
    rfc: 'HCG851201MN3',
    contacto: 'Lic. María Fernández',
    telefono: '33-3614-5500',
    email: 'adquisiciones@civilgdl.gob.mx',
    direccion: 'Hospital 320, Guadalajara, Jalisco',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    razonSocial: 'Clínica San José S.C.',
    rfc: 'CSJ070618RT5',
    contacto: 'Dr. Carlos Ramírez',
    telefono: '81-8356-7890',
    email: 'compras@clinicasanjose.com',
    direccion: 'Av. Constitución 2000, Monterrey, N.L.',
    createdAt: new Date().toISOString(),
  },
];

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

export function useProductosMedDev() {
  const [productos, setProductos] = useState<ProductoMedDev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getFromStorage(STORAGE_KEYS.PRODUCTOS, INITIAL_PRODUCTOS);
    const normalized = data.map((producto) =>
      producto.tipo ? producto : { ...producto, tipo: 'equipo-medico' }
    );
    setProductos(normalized);
    setLoading(false);
  }, []);

  const addProducto = (producto: Omit<ProductoMedDev, 'id' | 'createdAt'>) => {
    const newProducto: ProductoMedDev = {
      ...producto,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...productos, newProducto];
    setProductos(updated);
    saveToStorage(STORAGE_KEYS.PRODUCTOS, updated);
    return newProducto;
  };

  const updateProducto = (id: string, updates: Partial<ProductoMedDev>) => {
    const updated = productos.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProductos(updated);
    saveToStorage(STORAGE_KEYS.PRODUCTOS, updated);
  };

  const deleteProducto = (id: string) => {
    const updated = productos.filter((p) => p.id !== id);
    setProductos(updated);
    saveToStorage(STORAGE_KEYS.PRODUCTOS, updated);
  };

  return { productos, loading, addProducto, updateProducto, deleteProducto };
}

export function useAlmacenes() {
  const [almacenes, setAlmacenes] = useState<Almacen[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getFromStorage(STORAGE_KEYS.ALMACENES, INITIAL_ALMACENES);
    setAlmacenes(data);
    setLoading(false);
  }, []);

  const addAlmacen = (almacen: Omit<Almacen, 'id' | 'createdAt'>) => {
    const newAlmacen: Almacen = {
      ...almacen,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...almacenes, newAlmacen];
    setAlmacenes(updated);
    saveToStorage(STORAGE_KEYS.ALMACENES, updated);
    return newAlmacen;
  };

  const updateAlmacen = (id: string, updates: Partial<Almacen>) => {
    const updated = almacenes.map((a) => (a.id === id ? { ...a, ...updates } : a));
    setAlmacenes(updated);
    saveToStorage(STORAGE_KEYS.ALMACENES, updated);
  };

  const deleteAlmacen = (id: string) => {
    const updated = almacenes.filter((a) => a.id !== id);
    setAlmacenes(updated);
    saveToStorage(STORAGE_KEYS.ALMACENES, updated);
  };

  return { almacenes, loading, addAlmacen, updateAlmacen, deleteAlmacen };
}

export function useClientesMedDev() {
  const [clientes, setClientes] = useState<ClienteMedDev[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const data = getFromStorage(STORAGE_KEYS.CLIENTES, INITIAL_CLIENTES);
    setClientes(data);
    setLoading(false);
  }, []);

  const addCliente = (cliente: Omit<ClienteMedDev, 'id' | 'createdAt'>) => {
    const newCliente: ClienteMedDev = {
      ...cliente,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...clientes, newCliente];
    setClientes(updated);
    saveToStorage(STORAGE_KEYS.CLIENTES, updated);
    return newCliente;
  };

  const updateCliente = (id: string, updates: Partial<ClienteMedDev>) => {
    const updated = clientes.map((c) => (c.id === id ? { ...c, ...updates } : c));
    setClientes(updated);
    saveToStorage(STORAGE_KEYS.CLIENTES, updated);
  };

  const deleteCliente = (id: string) => {
    const updated = clientes.filter((c) => c.id !== id);
    setClientes(updated);
    saveToStorage(STORAGE_KEYS.CLIENTES, updated);
  };

  return { clientes, loading, addCliente, updateCliente, deleteCliente };
}
