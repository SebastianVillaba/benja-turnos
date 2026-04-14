import { BarberCard } from './BarberCard';
import connectToDatabase from '@/lib/mongodb'; // Ajusta la ruta si es necesario
import Barber from '@/models/Barber';

export async function BarbersSection() {
  // 1. Conectamos a la base de datos
  await connectToDatabase();

  // 2. Buscamos los barberos activos
  // Usamos .lean() para que Mongoose nos devuelva objetos JS puros,
  // que son más rápidos y fáciles de pasar a componentes cliente si hiciera falta.
  const activeBarbers = await Barber.find({ isActive: true }).lean();

  return (
    <section className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 mt-24">
      <div className="text-center px-4">
        <h2 className="text-[2.5rem] font-black tracking-tighter text-amber-100 uppercase drop-shadow-[0_0_15px_rgba(217,176,108,0.3)]">
          Nuestros Profesionales
        </h2>
        <p className="text-zinc-300 mt-4 text-lg">
          El equipo que lleva tu estilo al siguiente nivel.
        </p>
      </div>
      
      <div className="w-full px-2 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 3. Mapeamos los datos reales */}
        {activeBarbers.length > 0 ? (
          activeBarbers.map((barber: any) => (
             <BarberCard 
               key={barber._id.toString()} 
               name={barber.name} 
               imageUrl={barber.imageUrl} 
             />
          ))
        ) : (
          <p className="text-zinc-500 text-center col-span-full">
            No hay barberos disponibles en este momento.
          </p>
        )}
      </div>
    </section>
  );
}