import { Clock, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { BookingCard } from './BookingCard';
import connectToDatabase from '@/lib/mongodb';
import Barber from '@/models/Barber';

export async function BookingSection() {
  await connectToDatabase();
  const activeBarbers = await Barber.find({ isActive: true }).lean();
  return (
    <section className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 mt-24">
      <div className="text-center px-4">
        <h2 className="text-[2.5rem] font-black tracking-tighter text-amber-100 uppercase drop-shadow-[0_0_15px_rgba(217,176,108,0.3)]">
          Reserva tu turno
        </h2>
        <p className="text-zinc-300 mt-4 text-lg">
          Elige a tu profesional favorito y busca un hueco en su agenda... Apurate no te quedes atras!!
        </p>
      </div>

      {activeBarbers.map((barber) => (
        <BookingCard key={barber._id} Barber={barber} />
      ))}

    </section>
  );
}
