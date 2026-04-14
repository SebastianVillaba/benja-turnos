import { ServicesSection } from '@/components/Services/ServicesSection';
import { BarbersSection } from '@/components/Barbers/BarbersSection';
import { BookingSection } from '@/components/Booking/BookingSection';
import { GallerySection } from '@/components/Gallery/GallerySection';
import { WelcomeSection } from '@/components/Welcome/WelcomeSection';
import { getSession } from '@/lib/session';
import Link from 'next/link';

export default async function Home() {
  const session = await getSession();

  return (
    // Fondo negro carbón muy profundo, apto para scroll
    <main className="min-h-screen bg-[#070707] flex flex-col items-center py-12 px-4 text-zinc-100 font-sans overflow-x-hidden relative">
      {/* Nuevas Secciones */}
      <WelcomeSection />
      <ServicesSection />
      <BarbersSection />
      <BookingSection />
      <GallerySection />

      {/* Admin Quick Access */}
      <div className="fixed bottom-6 right-6 z-50">
        <Link
          href={session ? "/admin" : "/admin/login"}
          className="flex items-center justify-center w-12 h-12 bg-amber-900/40 border border-amber-600/50 hover:bg-amber-600 hover:border-amber-400 text-amber-200 hover:text-white rounded-full shadow-[0_0_15px_rgba(180,140,80,0.2)] hover:shadow-[0_0_30px_rgba(217,176,108,0.4)] transition-all duration-300 backdrop-blur-sm"
          title={session ? "Ir al Panel Admin" : "Inicio de Sesión Admin"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        </Link>
      </div>
    </main>
  );
}