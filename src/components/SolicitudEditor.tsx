'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, FilePenLine, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSolicitudes } from '@/hooks/useSolicitudes';
import type { Solicitud } from '@/types/solicitudes';

export type StepId = 'solicitud-pedido' | 'datos-paciente' | 'datos-servicio' | 'archivos' | 'aseguradora' | 'solicitud-vt';

export const STEPS: { id: StepId; label: string; path: string }[] = [
  { id: 'solicitud-pedido', label: 'Solicitud del pedido', path: 'solicitud-pedido' },
  { id: 'datos-paciente', label: 'Datos del paciente', path: 'datos-paciente' },
  { id: 'datos-servicio', label: 'Datos del Servicio', path: 'datos-servicio' },
  { id: 'archivos', label: 'Archivos y checklist', path: 'archivos-paciente' },
  { id: 'aseguradora', label: 'Gestión de aseguradora', path: 'aseguradora-expediente' },
  { id: 'solicitud-vt', label: 'Solicitud de VT', path: 'solicitud-vt' },
];

type ChangeLogEntry = {
  id: string;
  timestamp: string;
  step: string;
  action: string;
  user: string;
};

type SolicitudEditorProps = {
  solicitudId: string;
  currentStep: StepId;
  children: React.ReactNode;
  onAddChangeLog?: (step: string, action: string) => void;
};

export function SolicitudEditor({ solicitudId, currentStep, children }: SolicitudEditorProps) {
  const router = useRouter();
  const { solicitudes, status } = useSolicitudes();
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);
  const [isChangeLogOpen, setIsChangeLogOpen] = useState(false);

  const solicitud = useMemo(() => {
    return solicitudes.find((s) => s.id === solicitudId);
  }, [solicitudes, solicitudId]);

  const currentIndex = useMemo(() => {
    return solicitudes.findIndex((s) => s.id === solicitudId);
  }, [solicitudes, solicitudId]);

  const prevSolicitud = currentIndex > 0 ? solicitudes[currentIndex - 1] : null;
  const nextSolicitud = currentIndex < solicitudes.length - 1 ? solicitudes[currentIndex + 1] : null;

  useEffect(() => {
    if (!solicitud) return;

    // Cargar log de cambios dummy
    const dummyLog: ChangeLogEntry[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        step: 'Solicitud del pedido',
        action: 'Datos de solicitud guardados',
        user: 'Juan Pérez',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
        step: 'Datos del paciente',
        action: 'Información del paciente actualizada',
        user: 'María García',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 21600000).toISOString(),
        step: 'Datos del Servicio',
        action: 'Servicio seleccionado: xT/xR + xF',
        user: 'Juan Pérez',
      },
    ];
    setChangeLog(dummyLog);
  }, [solicitud]);

  const addChangeLogEntry = (step: string, action: string) => {
    const newEntry: ChangeLogEntry = {
      id: `change-${Date.now()}`,
      timestamp: new Date().toISOString(),
      step,
      action,
      user: 'Usuario Actual',
    };
    setChangeLog((prev) => [newEntry, ...prev]);
  };

  const handleNavigateStep = (stepPath: string) => {
    router.push(`/zogen-labs/ventas-zlabs/${stepPath}?id=${solicitudId}`);
  };

  const handleNavigateSolicitud = (targetSolicitudId: string) => {
    const currentStepPath = STEPS.find(s => s.id === currentStep)?.path || 'solicitud-pedido';
    router.push(`/zogen-labs/ventas-zlabs/${currentStepPath}?id=${targetSolicitudId}`);
  };

  if (!solicitud) {
    if (status === 'loading') {
      return (
        <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center gap-2 text-gray-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Cargando solicitud…
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center">
        <p className="text-gray-500">Solicitud no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F0E8] text-[#2C2C2C]">
      <header className="bg-white py-6 border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/zogen-labs/ventas-zlabs/solicitudes">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Button>
            </Link>

            <div className="flex items-center gap-3">
              <Link href={`/zogen-labs/ventas-zlabs/archivos-paciente?id=${solicitudId}`}>
                <Button className="bg-[#7B5C45] text-white hover:bg-[#6A4D38] flex items-center gap-2">
                  <FilePenLine className="h-4 w-4" />
                  Editar documentos
                </Button>
              </Link>
              <Dialog open={isChangeLogOpen} onOpenChange={setIsChangeLogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Historial ({changeLog.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Control de Cambios</DialogTitle>
                    <DialogDescription>
                      Historial de modificaciones realizadas en esta solicitud
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                    {changeLog.length === 0 ? (
                      <p className="text-sm text-gray-500 italic py-4 text-center">
                        No hay cambios registrados
                      </p>
                    ) : (
                      changeLog.map((log) => (
                        <div
                          key={log.id}
                          className="border-l-4 border-[#7B5C45] bg-[#F5F0E8] p-3 rounded-r-lg"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-xs font-semibold text-[#7B5C45] uppercase">
                              {log.step}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(log.timestamp).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-[#2C2C2C] mb-1">
                            {log.action}
                          </p>
                          <p className="text-xs text-gray-600">
                            por {log.user}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                disabled={!prevSolicitud}
                onClick={() => prevSolicitud && handleNavigateSolicitud(prevSolicitud.id)}
                className="hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <div>
                <h1 className="text-2xl font-semibold text-[#3C4858]">
                  {solicitud.patient}
                </h1>
                <p className="text-sm text-gray-600">ID: {solicitud.id}</p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                disabled={!nextSolicitud}
                onClick={() => nextSolicitud && handleNavigateSolicitud(nextSolicitud.id)}
                className="hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            <div className="text-sm text-gray-600">
              Solicitud {currentIndex + 1} de {solicitudes.length}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="w-full lg:w-[280px]">
            <nav className="rounded-lg bg-white p-4 shadow-sm sticky top-8">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Pasos de la Solicitud</h3>
              {STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => handleNavigateStep(step.path)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm mb-1 transition-colors ${
                    currentStep === step.id
                      ? 'bg-[#7B5C45] text-white font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </nav>
          </aside>

          <section className="flex-1 bg-white rounded-lg shadow-sm p-6">
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}

export function useSolicitudEditor(solicitudId: string) {
  const [changeLog, setChangeLog] = useState<ChangeLogEntry[]>([]);

  const addChangeLogEntry = (step: string, action: string) => {
    const newEntry: ChangeLogEntry = {
      id: `change-${Date.now()}`,
      timestamp: new Date().toISOString(),
      step,
      action,
      user: 'Usuario Actual',
    };
    setChangeLog((prev) => [newEntry, ...prev]);
  };

  return { changeLog, addChangeLogEntry };
}
