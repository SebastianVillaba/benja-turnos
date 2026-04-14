import Image from 'next/image';
import Link from 'next/link';

export function WelcomeSection() {

  return (
    <section className="w-full max-w-xl mx-auto flex flex-col gap-6 w-full mt-10">
      {/* Contenedor Hero */}
      <div className="flex flex-col items-center text-center max-w-xl w-full gap-10 p-10 rounded-3xl border border-zinc-800 bg-black/40 shadow-[0_0_60px_rgba(217,176,108,0.05)]">
        
        {/* Usamos el componente <Image> optimizado de Next.js para tu logo real */}
        <div className="w-56 h-auto p-4 flex items-center justify-center">
          <Image
            src="/logo-benja-fondoNegro.jpeg" // Asegúrate de haber puesto la imagen en /public/
            alt="Logo Benja Barber & Academy"
            width={300} 
            height={300}
            className="object-contain" 
            priority 
          />
        </div>

        {/* Títulos y Descripción actualizados */}
        <div className="flex flex-col gap-3">
          {/* Título principal con un toque dorado suave */}
          <h1 className="text-5xl font-extrabold tracking-tighter text-amber-100 leading-tight">
            Benja Barber <br /> & Academy
          </h1>
          
          {/* Subtítulo elegante */}
          <h2 className="text-base font-medium text-amber-400 tracking-widest mt-2 uppercase">
            The Art of Traditional Barbering & Elite Education
          </h2>
          
          {/* Descripción refinada */}
          <p className="text-zinc-400 mt-5 text-sm md:text-base max-w-sm mx-auto">
            Servicios de barbería premium y centro de capacitación profesional. Reserva tu experiencia con los maestros.
          </p>
        </div>

        <div className="flex flex-col w-full items-center gap-4 mt-8">
          <Link
            href="/reservar" 
            className="w-full max-w-xs border border-amber-600/50 hover:border-amber-500 bg-amber-950/20 hover:bg-amber-900/40 text-amber-200 font-bold py-4 rounded-xl text-lg transition-all duration-300 shadow-[0_0_15px_rgba(180,140,80,0.2)] hover:shadow-[0_0_30px_rgba(217,176,108,0.4)]"
          >
            Reservar mi turno
          </Link>
          {/* Botón de ver trabajos */}
          <Link 
            href="#galeria" 
            className="w-full max-w-xs border border-amber-600/50 hover:border-amber-500 bg-amber-950/20 hover:bg-amber-900/40 text-amber-200 font-bold py-4 rounded-xl text-lg transition-all duration-300 shadow-[0_0_15px_rgba(180,140,80,0.2)] hover:shadow-[0_0_30px_rgba(217,176,108,0.4)]"
          >
            Ver trabajos
          </Link>
        </div>
      </div>
    </section>
  );
}
