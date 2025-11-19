import { redirect } from 'next/navigation';

type Params = {
  telephone: string;
};

export default async function LegacySolicitudDetailPage({ params }: { params: Promise<Params> }) {
  const { telephone } = await params;
  redirect(`/ventas/crm-zogen/solicitudes/${telephone}`);
}
