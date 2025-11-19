'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
  MessageSquare,
  Building2,
  BarChart3,
  ChevronDown,
  Menu,
  X,
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

const navigation: NavItem[] = [
  {
    label: 'Ventas',
    icon: <MessageSquare className="h-5 w-5" />,
    children: [
      { label: 'CRM WhatsApp', href: '/dashboard/ventas/crm-whatsapp', description: 'Gestión de conversaciones por vendedor' },
      { label: 'Solicitudes de Estudios', href: '/dashboard/ventas/crm-zogen/solicitudes', description: 'Solicitudes y cotizaciones de estudios' },
    ],
  },
  {
    label: 'Administración',
    icon: <Building2 className="h-5 w-5" />,
    children: [
      { label: 'Solicitudes de Venta', href: '/administracion/solicitudes-venta', description: 'Estudios aprobados para operación' },
      { label: 'Compras', href: '/administracion/compras', description: 'Coordinación con laboratorios' },
      { label: 'Logística', href: '/administracion/logistica', description: 'Recolección de tejidos y muestras' },
      { label: 'Facturación', href: '/administracion/facturacion', description: 'Facturación a aseguradoras' },
      { label: 'Cobranza', href: '/administracion/cobranza', description: 'Seguimiento de pagos' },
      { label: 'Pagos', href: '/administracion/pagos', description: 'Pagos a laboratorios y comisiones' },
    ],
  },
  {
    label: 'Reportes',
    icon: <BarChart3 className="h-5 w-5" />,
    children: [
      { label: 'KPIs Ventas', href: '/dashboard/reportes/ventas', description: 'Métricas y estadísticas de ventas' },
      { label: 'KPIs Administración', href: '/dashboard/reportes/administracion', description: 'Métricas operativas y administrativas' },
    ],
  },
  {
    label: 'Configuración',
    icon: <BarChart3 className="h-5 w-5" />,
    children: [
      { label: 'Catálogo de Servicios', href: '/dashboard/configuracion/servicios', description: 'Gestión de servicios y estudios' },
      { label: 'Catálogo de Laboratorios', href: '/dashboard/configuracion/laboratorios', description: 'Gestión de laboratorios' },
      { label: 'Catálogo de Aseguradoras', href: '/dashboard/configuracion/aseguradoras', description: 'Gestión de aseguradoras' },
    ],
  },
];

export default function SharedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [expandedSections, setExpandedSections] = useState<string[]>(['Ventas', 'Administración']);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSection = (label: string) => {
    setExpandedSections((prev) =>
      prev.includes(label) ? prev.filter((s) => s !== label) : [...prev, label]
    );
  };

  const isActive = (href: string) => {
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

  return (
    <div className={`flex h-screen ${bgClass}`}>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <Link href="/dashboard/ventas/crm-zogen/solicitudes" className="flex items-center gap-3">
              <Image
                src="/images/zogen-logo.png"
                alt="Zogen"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
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
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b bg-white">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Menu className="h-6 w-6" />
          </button>
          <Image
            src="/images/zogen-logo.png"
            alt="Zogen"
            width={100}
            height={32}
            className="h-6 w-auto"
          />
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
