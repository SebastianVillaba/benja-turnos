export function GallerySection() {
  return (
    <section className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 mt-24 mb-24">
      <div className="text-center px-4">
        <h2 className="text-[2.5rem] font-black tracking-tighter text-amber-100 uppercase drop-shadow-[0_0_15px_rgba(217,176,108,0.3)]">
          Galería
        </h2>
        <p className="text-zinc-300 mt-4 text-lg">
          Un vistazo a nuestro trabajo en el templo.
        </p>
      </div>

      <div className="w-full px-2">
        <div className="w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-zinc-800/30">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=800&h=1000" 
            alt="Trabajo de barbería" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
