import { ServicesSection } from '@/components/Services/ServicesSection';
import { BarbersSection } from '@/components/Barbers/BarbersSection';
import { BookingSection } from '@/components/Booking/BookingSection';
import { GallerySection } from '@/components/Gallery/GallerySection';
import { WelcomeSection } from '@/components/Welcome/WelcomeSection';

export default function Home() {
  return (
    // Fondo negro carbón muy profundo, apto para scroll
    <main className="min-h-screen bg-[#070707] flex flex-col items-center py-12 px-4 text-zinc-100 font-sans overflow-x-hidden">
      {/* Nuevas Secciones */}
      <WelcomeSection />
      <ServicesSection />
      <BarbersSection />
      <BookingSection />
      <GallerySection />

    </main>
  );
}