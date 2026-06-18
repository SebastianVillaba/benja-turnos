import { getActiveBarbers, getServices, getBranches } from '@/app/actions/actions';
import ReservarClient from './ReservarClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Reservar Turno — Benja Barber & Academy',
  description: 'Reserva tu turno con los mejores barberos de la ciudad.',
};

export default async function ReservarPage() {
  const barbers = await getActiveBarbers();
  const services = await getServices();
  const branches = await getBranches();

  return (
    <main className="min-h-screen bg-[#070707] flex flex-col items-center py-8 px-4 text-zinc-100 font-sans">
      <ReservarClient barbers={barbers} services={services} branches={branches} />
    </main>
  );
}
