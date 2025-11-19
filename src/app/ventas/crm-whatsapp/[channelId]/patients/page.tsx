'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import type { ClientStatus } from '@/types/whatsapp';
import { ArrowLeft } from 'lucide-react';

const STAGES: ClientStatus[] = [
  'Cotizando',
  'Documentación',
  'Trámite Aprobado',
  'Muestra Tomada'
];

const SEGMENTS = ['IMSS', 'ISSSTE', 'Privado', 'Aseguradora'];
const CITIES = ['Guadalajara', 'CDMX', 'Monterrey', 'Querétaro', 'Puebla', 'León'];

const PATIENT_NAMES = [
  'Ana Sofía Domínguez', 'Luis Fernando Aguilar', 'Mariana Torres García', 'Carlos Alberto Medina',
  'Regina Hernández Soto', 'Diego Armando Salas', 'Valeria Ortiz Peña', 'Alejandro Cruz Ramírez',
  'Paola Jiménez Galindo', 'Ricardo Núñez Padilla', 'Fernanda Ruiz Esquivel', 'Emilio García Cárdenas',
  'Andrea Cabrera Núñez', 'Sebastián Varela Campos', 'Renata Solís Figueroa', 'Mauricio Camacho Lara',
  'Isabela Navarro Moguel', 'Jorge Eduardo Salazar', 'Lucía Serrano Ibarra', 'Héctor Manuel Ureña',
  'Daniela Ríos Brambila', 'Arturo Montiel Prieto', 'Montserrat Gutiérrez', 'Iván Quiroga Esqueda',
  'Camila Vázquez Merino', 'Samuel Herrera Nieto', 'Jimena Maldonado', 'Óscar Ruiz Zamora',
  'Loreto Sánchez Barrera', 'Rodrigo Mendoza Patiño', 'Victoria Encinas', 'Emanuel Orozco Chávez',
  'Natalia Figueroa Rangel', 'Pablo Santillán', 'Constanza Paredes', 'Hernán Martínez Landa',
  'Abril Castellanos', 'Tadeo Lozano', 'Romina Valdés', 'Mateo Jurado',
  'Saraí Guzmán', 'Leonardo Peralta', 'Ariadna Flores', 'Ricardo Ambriz',
  'Giovanna Trejo', 'Andrés Cuevas', 'Mónica Valencia', 'Claudio Ponce',
  'Elena Rosales', 'René Partida'
];

export default function PatientsPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const patients = useMemo(() => {
    return PATIENT_NAMES.map((name, index) => ({
      name,
      stage: STAGES[index % STAGES.length],
      segment: SEGMENTS[index % SEGMENTS.length],
      city: CITIES[index % CITIES.length],
      expediente: `EXP-${(1000 + index).toString()}`
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-purple-500 uppercase">Cartera de pacientes</p>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes asignados</h1>
            <p className="text-gray-600">Listado demo de 50 pacientes asociados al vendedor, con etapa del estudio y segmento.</p>
          </div>
          <Button asChild variant="outline">
        <Link href={`/ventas/crm-whatsapp/${channelId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver al dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pacientes prioritarios</CardTitle>
            <CardDescription>
              Usa este listado para revisar documentación y coordinar la toma de muestras.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-3">
                {patients.map((patient) => (
                  <div key={patient.expediente} className="rounded-2xl border border-purple-100 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{patient.name}</p>
                        <p className="text-xs text-gray-500">Expediente: {patient.expediente}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {patient.stage}
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div>
                        <p className="font-medium text-gray-700">Segmento</p>
                        <p>{patient.segment}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-700">Ciudad</p>
                        <p>{patient.city}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
