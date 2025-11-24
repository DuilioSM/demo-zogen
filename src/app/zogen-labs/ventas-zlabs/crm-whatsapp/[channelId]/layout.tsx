'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, KanbanSquare, LayoutDashboard } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const channelId = params.channelId as string;

  // Si la ruta es de solicitudes, no aplicar este layout
  if (channelId === 'solicitudes') {
    return <>{children}</>;
  }

  const isConversationsActive = pathname?.includes('/conversations');
  const isKanbanActive = pathname?.includes('/kanban');
  const isDashboard = !isConversationsActive && !isKanbanActive;

  return (
    <div className="flex flex-col h-full">
      {/* Header con navbar */}
      <header className="border-b bg-white shadow-sm flex-shrink-0">
        <div className="flex flex-col gap-3 px-6 py-4">
          {/* Pestañas de navegación */}
          <nav className="flex gap-2">
            <Link href={`/zogen-labs/ventas-zlabs/crm-whatsapp/${channelId}/conversations`}>
              <Button
                variant={isConversationsActive ? 'default' : 'ghost'}
                size="sm"
                className={isConversationsActive ? 'bg-[#9B7CB8] hover:bg-[#8A6BA7]' : 'hover:bg-purple-50'}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Inbox
              </Button>
            </Link>
            <Link href={`/zogen-labs/ventas-zlabs/crm-whatsapp/${channelId}/kanban`}>
              <Button
                variant={isKanbanActive ? 'default' : 'ghost'}
                size="sm"
                className={isKanbanActive ? 'bg-[#9B7CB8] hover:bg-[#8A6BA7]' : 'hover:bg-purple-50'}
              >
                <KanbanSquare className="h-4 w-4 mr-2" />
                Pipeline
              </Button>
            </Link>
            <Link href={`/zogen-labs/ventas-zlabs/crm-whatsapp/${channelId}`}>
              <Button
                variant={isDashboard ? 'default' : 'ghost'}
                size="sm"
                className={isDashboard ? 'bg-[#9B7CB8] hover:bg-[#8A6BA7]' : 'hover:bg-purple-50'}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Contenido */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
