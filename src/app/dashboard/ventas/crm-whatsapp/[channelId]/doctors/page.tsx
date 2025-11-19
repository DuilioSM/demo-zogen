'use client';

import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const SPECIALTIES = ['Oncología Médica', 'Cirugía Oncológica', 'Genética Clínica', 'Hematología', 'Ginecología Oncológica'];
const HOSPITALS = [
  'Hospital Civil de Guadalajara',
  'Centro Médico Nacional Siglo XXI',
  'Hospital Ángeles del Pedregal',
  'Clínica ABC Santa Fe',
  'Hospital San José Tec de Monterrey'
];
const DOCTOR_NAMES = [
  'Dr. Alejandro Gudiño Ortega', 'Dra. Beatriz Ramírez Landeta', 'Dr. Carlos Fabián Esquivel', 'Dra. Daniela Muñoz Hernández',
  'Dr. Eduardo Paredes Campos', 'Dra. Fernanda López Villaseñor', 'Dr. Gerardo Salcedo Aguado', 'Dra. Helena Vargas Mellado',
  'Dr. Ignacio Torres Rivera', 'Dra. Julieta Mora Fernández', 'Dr. Kenji Noguchi Morales', 'Dra. Laura Paola Narváez',
  'Dr. Mauricio Barrios Chávez', 'Dra. Natalia Goyenechea Cano', 'Dr. Óscar Pérez Jurado', 'Dra. Patricia Curiel Suárez',
  'Dr. Ricardo Imaz Santoyo', 'Dra. Silvia Alarcón Peñaloza', 'Dr. Tomás del Campo Ruiz', 'Dra. Verónica Lozano Castell'
];

export default function DoctorsPage() {
  const params = useParams();
  const channelId = params.channelId as string;

  const doctors = useMemo(() => {
    return DOCTOR_NAMES.map((name, index) => ({
      name,
      specialty: SPECIALTIES[index % SPECIALTIES.length],
      hospital: HOSPITALS[index % HOSPITALS.length],
      phone: `33${(75000000 + index * 1234).toString().padStart(8, '0')}`
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold tracking-widest text-purple-500 uppercase">Cartera de doctores</p>
            <h1 className="text-3xl font-bold text-gray-900">Médicos referenciadores</h1>
            <p className="text-gray-600">Listado demo de especialistas que envían pacientes y coordinan estudios genéticos.</p>
          </div>
          <Button asChild variant="outline">
        <Link href={`/ventas/crm-whatsapp/${channelId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Volver al dashboard
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Doctores aliados</CardTitle>
            <CardDescription>Utiliza esta vista para planear rondas de seguimiento y educación médica continua.</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[70vh] pr-4">
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <div key={doctor.name} className="rounded-2xl border border-purple-100 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{doctor.name}</p>
                        <p className="text-xs text-gray-500">Hospital: {doctor.hospital}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {doctor.specialty}
                      </Badge>
                    </div>
                    <div className="mt-3 text-xs text-gray-600">
                      <p className="font-medium text-gray-700">Contacto directo</p>
                      <p>{doctor.phone}</p>
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
