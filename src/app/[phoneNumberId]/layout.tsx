'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare, KanbanSquare } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const phoneNumberId = params.phoneNumberId as string;

  // Si la ruta es de solicitudes, no aplicar este layout
  if (phoneNumberId === 'solicitudes') {
    return <>{children}</>;
  }

  const isConversationsActive = pathname?.includes('/conversations');
  const isKanbanActive = pathname?.includes('/kanban');
  const isDashboard = !isConversationsActive && !isKanbanActive;

  return (
    <div className="h-screen flex flex-col">
      {/* Header con navbar */}
      <header className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/${phoneNumberId}`}>
              <Button variant="ghost" size="sm" className="hover:bg-purple-50">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <Link href="/">
              <Image
                src="/images/zogen-logo.png"
                alt="Zogen"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {!isDashboard && (
            <nav className="flex gap-2">
              <Link href={`/${phoneNumberId}`}>
                <Button
                  variant={isDashboard ? 'default' : 'ghost'}
                  size="sm"
                  className={isDashboard ? 'bg-[#9B7CB8] hover:bg-[#8A6BA7]' : 'hover:bg-purple-50'}
                >
                  Dashboard
                </Button>
              </Link>
              <Link href={`/${phoneNumberId}/conversations`}>
                <Button
                  variant={isConversationsActive ? 'default' : 'ghost'}
                  size="sm"
                  className={isConversationsActive ? 'bg-[#9B7CB8] hover:bg-[#8A6BA7]' : 'hover:bg-purple-50'}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Conversaciones
                </Button>
              </Link>
              <Link href={`/${phoneNumberId}/kanban`}>
                <Button
                  variant={isKanbanActive ? 'default' : 'ghost'}
                  size="sm"
                  className={isKanbanActive ? 'bg-[#9B7CB8] hover:bg-[#8A6BA7]' : 'hover:bg-purple-50'}
                >
                  <KanbanSquare className="h-4 w-4 mr-2" />
                  Pipeline de venta
                </Button>
              </Link>
            </nav>
          )}
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
