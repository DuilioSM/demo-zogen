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

type ModuleKey = 'labs' | 'meddev' | 'kpis';

const moduleOptions: { id: ModuleKey; label: string }[] = [
  { id: 'labs', label: 'Zogen Labs' },
  { id: 'meddev', label: 'Zogen MedDev' },
  { id: 'kpis', label: 'Zogen KPIs' },
];

const defaultSectionsPerModule: Record<ModuleKey, string[]> = {
  labs: ['Ventas-ZLabs', 'Administración-ZLabs', 'Configuración-ZLabs'],
  meddev: ['Ventas', 'Compras y Gastos', 'Inventarios', 'Configuración'],
  kpis: ['Generales', 'Zogen Labs', 'Zogen Med Dev'],
};

const moduleNavigation: Record<ModuleKey, NavItem[]> = {
  labs: [
    {
      label: 'Ventas-ZLabs',
      icon: <MessageSquare className="h-5 w-5" />,
      children: [
        { label: 'CRM WhatsApp', href: '/zogen-labs/ventas-zlabs/crm-whatsapp', description: 'Relación con médicos vía WhatsApp' },
        { label: 'Administración de Solicitudes', href: '/ventas/solicitudes', description: 'Cotizaciones y VT del laboratorio' },
        { label: 'Prospectos', href: '/ventas/prospectos', description: 'Nuevos contactos y cuentas médicas' },
      ],
    },
    {
      label: 'Administración-ZLabs',
      icon: <Building2 className="h-5 w-5" />,
      children: [
        { label: 'Aprobación VT', href: '/zogen-labs/administracion-zlabs/aprobacion-vt', description: 'Control de solicitudes VT' },
        { label: 'Logística y Resultados', href: '/zogen-labs/administracion-zlabs/logistica-resultados', description: 'Trazabilidad de recolecciones y resultados' },
        { label: 'Pagos y Proveedores', href: '/zogen-labs/administracion-zlabs/pagos-proveedores', description: 'Pagos a laboratorios' },
        { label: 'Facturación y Cobranza', href: '/zogen-labs/administracion-zlabs/facturacion-cobranza', description: 'Ciclo financiero de VT' },
      ],
    },
    {
      label: 'Configuración-ZLabs',
      icon: <Settings2 className="h-5 w-5" />,
      children: [
        { label: 'Productos', href: '/zogen-labs/configuracion-zlabs/productos', description: 'Gestión de servicios Labs' },
        { label: 'Laboratorios', href: '/zogen-labs/configuracion-zlabs/laboratorios', description: 'Catálogo de laboratorios' },
        { label: 'Aseguradoras', href: '/zogen-labs/configuracion-zlabs/aseguradoras', description: 'Convenios activos' },
        { label: 'Especialistas', href: '/zogen-labs/configuracion-zlabs/especialistas', description: 'Fuerza comercial' },
        { label: 'Cuentas', href: '/zogen-labs/configuracion-zlabs/cuentas', description: 'Hospitales y médicos' },
        { label: 'Comisiones', href: '/zogen-labs/configuracion-zlabs/comisiones', description: 'Modelos de comisión' },
        { label: 'Descuentos', href: '/zogen-labs/configuracion-zlabs/descuentos', description: 'Programas promocionales' },
      ],
    },
  ],
  meddev: [
    {
      label: 'Ventas',
      icon: <MessageSquare className="h-5 w-5" />,
      children: [
        { label: 'Equipo Médico', href: '/zogen-meddev/ventas/equipo-medico', description: 'Ventas de equipos médicos' },
        { label: 'Reactivos', href: '/zogen-meddev/ventas/reactivos', description: 'Ventas de reactivos' },
      ],
    },
    {
      label: 'Compras y Gastos',
      icon: <Factory className="h-5 w-5" />,
      children: [
        { label: 'Reactivos', href: '/zogen-meddev/compras-gastos/reactivos', description: 'Gastos de reactivos' },
        { label: 'Equipo Médico', href: '/zogen-meddev/compras-gastos/equipo-medico', description: 'Gastos de equipo médico' },
        { label: 'Gastos Generales', href: '/zogen-meddev/compras-gastos/otros-gastos', description: 'Gastos operativos generales' },
      ],
    },
    {
      label: 'Inventarios',
      icon: <Building2 className="h-5 w-5" />,
      children: [
        { label: 'Control de Inventarios', href: '/zogen-meddev/almacen', description: 'Visión de stock' },
      ],
    },
    {
      label: 'Configuración',
      icon: <Settings2 className="h-5 w-5" />,
      children: [
        { label: 'Productos', href: '/zogen-meddev/configuracion/productos', description: 'Catálogo de equipos médicos' },
        { label: 'Almacenes', href: '/zogen-meddev/configuracion/almacenes', description: 'Ubicaciones de inventario' },
        { label: 'Clientes', href: '/zogen-meddev/configuracion/clientes', description: 'Clientes con RFC' },
      ],
    },
  ],
  kpis: [
    {
      label: 'Generales',
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { label: 'Reporte financiero', href: '/zogen-kpis/generales/reporte-financiero', description: 'Ingresos vs gastos' },
        { label: 'Reporte YTD', href: '/zogen-kpis/generales/reporte-ytd', description: 'Avance anual' },
        { label: 'Reporte de ingresos', href: '/zogen-kpis/generales/reporte-ingresos', description: 'Detalle por línea' },
      ],
    },
    {
      label: 'Zogen Labs',
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { label: 'Reporte YTD', href: '/zogen-kpis/zogen-labs/reporte-ytd', description: 'Avance anual Labs' },
        { label: 'Reporte de ingresos', href: '/zogen-kpis/zogen-labs/reporte-ingresos', description: 'Detalle por canal' },
        { label: 'Reporte de KPIs', href: '/zogen-kpis/zogen-labs/reporte-kpis', description: 'Indicadores operativos' },
        { label: 'Reporte de cobranza', href: '/zogen-kpis/zogen-labs/reporte-cobranza', description: 'Seguimiento de pagos' },
      ],
    },
    {
      label: 'Zogen Med Dev',
      icon: <BarChart3 className="h-5 w-5" />,
      children: [
        { label: 'Reporte financiero', href: '/zogen-kpis/zogen-meddev/reporte-financiero', description: 'Ingresos y gastos MedDev' },
        { label: 'Reporte YTD', href: '/zogen-kpis/zogen-meddev/reporte-ytd', description: 'Avance anual MedDev' },
        { label: 'Reporte de ingresos', href: '/zogen-kpis/zogen-meddev/reporte-ingresos', description: 'Detalle por categoría' },
      ],
    },
  ],
};

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const inferModuleFromPath = (path: string | null): ModuleKey => {
    if (!path) return 'labs';
    if (path.startsWith('/zogen-meddev')) return 'meddev';
    if (path.startsWith('/zogen-kpis')) return 'kpis';
    if (path.startsWith('/zogen-labs')) return 'labs';
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
      router.push('/zogen-labs/ventas-zlabs/crm-whatsapp');
    } else if (module === 'meddev') {
      router.push('/zogen-meddev/ventas/equipo-medico');
    } else if (module === 'kpis') {
      router.push('/zogen-kpis/analisis');
    }
  };

  const toggleSection = (label: string) => {
    setExpandedSections((prev) => {
      if (currentModule === 'kpis') {
        const isOpen = prev.includes(label);
        const sections = ['Generales', 'Zogen Labs', 'Zogen Med Dev'];
        return isOpen ? sections.filter((section) => section !== label) : [...prev, label];
      }
      const isOpen = prev.includes(label);
      return isOpen ? prev.filter((s) => s !== label) : [...prev, label];
    });
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    const normalizedPath = pathname.endsWith('/') && pathname !== '/' ? pathname.slice(0, -1) : pathname;
    const normalizedHref = href.endsWith('/') && href !== '/' ? href.slice(0, -1) : href;
    return normalizedPath === normalizedHref || normalizedPath.startsWith(`${normalizedHref}/`);
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('zogen-authenticated');
      window.location.href = '/';
    }
  };

  // Determinar el background según la ruta
  const isAdminRoute = pathname?.includes('/administracion-zlabs');
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
            <Link href="/zogen-labs/ventas-zlabs/crm-whatsapp" className="flex items-center gap-3">
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
                          <Link key={child.href} href={child.href} onClick={() => handleChildClick(item.label)}>
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
