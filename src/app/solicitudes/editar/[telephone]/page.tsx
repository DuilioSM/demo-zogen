import { redirect } from 'next/navigation';

type Params = {
  telephone: string;
};

export default async function LegacySolicitudEditPage({ params }: { params: Promise<Params> }) {
  const { telephone } = await params;
  redirect(`/ventas/crm-zogen/solicitudes/editar/${telephone}`);
}
