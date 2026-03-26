import { Clock, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export function BookingSection() {
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

      <div className="w-full bg-[#0d0d0d] border border-zinc-800/80 rounded-[32px] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        {/* Profile Info */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-amber-600/50 shadow-[0_0_15px_rgba(217,176,108,0.3)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&q=80&w=200&h=200" 
              alt="Hugo" 
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="text-2xl font-bold text-white">Hugo</h3>
        </div>

        {/* Info Box */}
        <div className="bg-[#141414] rounded-2xl p-5 mb-8 border border-zinc-800/50 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <span className="text-zinc-300 text-sm font-medium">Horarios actualizados al instante</span>
          </div>
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-amber-500" />
            <span className="text-zinc-300 text-sm font-medium">Reserva con confirmación inmediata</span>
          </div>
        </div>

        {/* Booking Button */}
        <Link 
          href="/reservar" 
          className="w-full border border-amber-600/50 transition-all duration-300 shadow-[0_0_15px_rgba(180,140,80,0.2)] hover:shadow-[0_0_30px_rgba(217,176,108,0.4)] bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold py-4 rounded-2xl text-lg flex items-center justify-center gap-2"
        >
          Ver Agenda y Reservar <ExternalLink className="w-5 h-5" />
        </Link>
        <p className="text-center text-sm font-medium text-zinc-600 mt-4">
          Se abrirá el calendario oficial
        </p>
      </div>
    </section>
  );
}
