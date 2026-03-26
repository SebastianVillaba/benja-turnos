import { getServicesAdmin } from '@/app/actions/admin-actions';
import ServiciosClient from './ServiciosClient';

export default async function ServiciosPage() {
  const services = await getServicesAdmin();

  return <ServiciosClient initialServices={services} />;
}
