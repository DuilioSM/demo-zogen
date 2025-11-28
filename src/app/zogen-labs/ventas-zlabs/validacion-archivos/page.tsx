import { redirect } from 'next/navigation';

export default function ValidacionArchivosPage({ searchParams }: { searchParams: { id?: string } }) {
  const solicitudId = searchParams.id ? `?id=${searchParams.id}` : '';
  redirect(`/zogen-labs/ventas-zlabs/archivos-paciente${solicitudId}`);
}
