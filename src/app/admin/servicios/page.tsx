import { getServicesAdmin, getBarbersAdmin } from '@/app/actions/admin-actions';
import ServiciosClient from './ServiciosClient';

export const dynamic = 'force-dynamic';

export default async function ServiciosPage() {
  const services = await getServicesAdmin();
  const barbers = await getBarbersAdmin();

  return <ServiciosClient initialServices={services} barbers={barbers} />;
}
