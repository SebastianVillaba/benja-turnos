import TurnosClient from './TurnosClient';
import { getBarbersAdmin, getServicesAdmin } from '@/app/actions/admin-actions';
import { getBranches } from '@/app/actions/actions';

export const dynamic = 'force-dynamic';

export default async function TurnosPage() {
  const barbers = await getBarbersAdmin();
  const services = await getServicesAdmin();
  const branches = await getBranches();

  // Filtramos solo los activos para el formulario de turnos
  const activeBarbers = barbers.filter(b => b.isActive);

  return <TurnosClient barbers={activeBarbers} services={services} branches={branches} />;
}
