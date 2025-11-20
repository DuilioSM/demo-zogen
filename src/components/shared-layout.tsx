'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  MessageSquare,
  Building2,
  BarChart3,
  ChevronDown,
  Factory,
  Settings2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

type NavItem = {
  label: string;
  href?: string;
  icon: React.ReactNode;
  children?: {
    label: string;
    href: string;
    description?: string;
  }[];
};

type ModuleKey = 'labs' | 'meddev' | 'analisis';

const moduleOptions: { id: ModuleKey; label: string }[] = [
  { id: 'labs', label: 'Zogen Labs' },
  { id: 'meddev', label: 'Zogen Med Dev' },
  { id: 'analisis', label: 'Zogen Análisis' },
];

const defaultSectionsPerModule: Record<ModuleKey, string[]> = {
  labs: ['Ventas', 'Administración', 'Configuración'],
  meddev: ['Operación Med Dev'],
  analisis: ['Reportes y Dashboards'],
};

const moduleNavigation: Record<ModuleKey, NavItem[]> = {
  labs: [
    {
      label: 'Ventas',
      icon: <MessageSquare className="h-5 w-5" />,
      children: [
        { label: 'CRM WhatsApp', href: '/ventas/crm-whatsapp', description: 'Relación con médicos vía WhatsApp' },
        { label: 'Administración de Solicitudes', href: '/ventas/solicitudes', description: 'Cotizaciones y VT del laboratorio' },
        { label: 'Prospectos', href: '/ventas/prospectos', description: 'Nuevos contactos y cuentas médicas' },
      ],
    },
    {
      label: 'Administración',
      icon: <Building2 className="h-5 w-5" />,
      children: [
        { label: 'Aprobación VT', href: '/administracion/aprobacion-vt', description: 'Control de solicitudes VT' },
        { label: 'Logística y Resultados', href: '/administracion/logistica-resultados', description: 'Trazabilidad de recolecciones y resultados' },
        { label: 'Pagos y Proveedores', href: '/administracion/pagos-proveedores', description: 'Pagos a laboratorios' },
        { label: 'Facturación y Cobranza', href: '/administracion/facturacion-cobranza', description: 'Ciclo financiero de VT' },
      ],
    },
    {
      label: 'Configuración',
      icon: <Settings2 className="h-5 w-5" />,
      children: [
        { label: 'Productos', href: '/configuracion/productos', description: 'Gestión de servicios Labs' },
        { label: 'Laboratorios', href: '/configuracion/laboratorios', description: 'Catálogo de laboratorios' },
        { label: 'Aseguradoras', href: '/configuracion/aseguradoras', description: 'Convenios activos' },
        { label: 'Especialistas', href: '/configuracion/especialistas', description: 'Fuerza comercial' },
        { label: 'Cuentas', href: '/configuracion/cuentas', description: 'Hospitales y médicos' },
        { label: 'Comisiones', href: '/configuracion/comisiones', description: 'Modelos de comisión' },
        { label: 'Descuentos', href: '/configuracion/descuentos', description: 'Programas promocionales' },
      ],
    },
  ],
  meddev: [
    {
      label: 'Operación Med Dev',
      icon: <Factory className="h-5 w-5" />,
      children: [
        { label: 'Ventas', href: '/med-dev/ventas', description: 'Pipeline de equipos médicos' },
        { label: 'Administración', href: '/med-dev/administracion', description: 'Órdenes e instalaciones' },
        { label: 'Compras', href: '/med-dev/compras', description: 'Abastecimiento a proveedores' },
        { label: 'Inventarios', href: '/med-dev/inventarios', description: 'Stock por almacenes' },
        { label: 'Configuración', href: '/med-dev/configuracion', description: 'Productos, precios y almacenes' },
      ],
    },
  ],
  analisis: [
    {
      label: 'Reportes y Dashboards',
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { label: 'Zogen Análisis', href: '/analisis', description: 'Reportes financieros y KPIs corporativos' },
      ],
    },
  ],
};

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const inferModuleFromPath = (path: string | null): ModuleKey => {
    if (!path) return 'labs';
    if (path.startsWith('/med-dev')) return 'meddev';
    if (path.startsWith('/analisis')) return 'analisis';
    return 'labs';
  };
  const initialModule = inferModuleFromPath(pathname);
  const [currentModule, setCurrentModule] = useState<ModuleKey>(initialModule);
  const [expandedSections, setExpandedSections] = useState<string[]>(defaultSectionsPerModule[initialModule]);
  const [moduleMenuOpen, setModuleMenuOpen] = useState(false);

  useEffect(() => {
    const inferred = inferModuleFromPath(pathname);
    if (inferred !== currentModule) {
      setCurrentModule(inferred);
      setExpandedSections(defaultSectionsPerModule[inferred]);
    }
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('zogen-module', inferred);
    }
  }, [pathname, currentModule]);

  const handleModuleChange = (module: ModuleKey) => {
    setCurrentModule(module);
    setModuleMenuOpen(false);
    setExpandedSections(defaultSectionsPerModule[module]);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('zogen-module', module);
    }
    if (module === 'labs') {
      router.push('/ventas/solicitudes');
    } else if (module === 'meddev') {
      router.push('/med-dev/ventas');
    } else if (module === 'analisis') {
      router.push('/analisis');
    }
  };

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
    if (href === '/administracion') {
      return pathname === href;
    }
    return pathname?.startsWith(href);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('zogen-authenticated');
      window.location.href = '/';
    }
  };

  // Determinar el background según la ruta
  const isAdminRoute = pathname?.startsWith('/administracion');
  const bgClass = isAdminRoute
    ? 'bg-gradient-to-br from-purple-50 via-purple-100/30 to-white'
    : 'bg-gray-50';

  const navigation = moduleNavigation[currentModule];
  const selectedModuleLabel = moduleOptions.find((option) => option.id === currentModule)?.label ?? 'Zogen Labs';

  return (
    <div className={`flex h-screen ${bgClass}`}>
      {/* Sidebar - Siempre visible */}
      <aside className="w-72 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/ventas/crm-whatsapp" className="flex items-center gap-3">
              <Image
                src="/images/zogen-logo.png"
                alt="Zogen"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <div className="relative">
              <Button
                variant="outline"
                className="text-gray-700 flex items-center gap-2"
                onClick={() => setModuleMenuOpen((prev) => !prev)}
              >
                {selectedModuleLabel}
                <ChevronDown className={`h-4 w-4 transition-transform ${moduleMenuOpen ? 'rotate-180' : ''}`} />
              </Button>
              {moduleMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg z-10">
                  {moduleOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleModuleChange(option.id)}
                      className={`w-full px-4 py-2 text-left text-sm ${
                        option.id === currentModule ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-1">
            {navigation.map((item) => (
              <div key={item.label}>
                {item.children ? (
                  <div>
                    <button
                      onClick={() => toggleSection(item.label)}
                      className="flex items-center justify-between w-full px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex items-center gap-3">
                        {item.icon}
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          expandedSections.includes(item.label) ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {expandedSections.includes(item.label) && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link key={child.href} href={child.href}>
                            <div
                              className={`px-3 py-2 rounded-lg text-sm ${
                                isActive(child.href)
                                  ? 'bg-purple-100 text-purple-700 font-medium'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {child.label}
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : item.href ? (
                  <Link href={item.href}>
                    <div
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                        isActive(item.href)
                          ? 'bg-purple-100 text-purple-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                    </div>
                  </Link>
                ) : null}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full justify-start text-gray-700 hover:bg-gray-100"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
