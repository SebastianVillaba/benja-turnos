import Image from 'next/image';

const galleryItems = [
  { type: 'video', src: '/videoPeluqueria1.mp4' },
  { type: 'image', src: '/fotoPeluqueria1.jpeg' },
  { type: 'video', src: '/videoPeluqueria2.mp4' },
  { type: 'image', src: '/fotoPeluqueria2.jpeg' },
  { type: 'video', src: '/videoPeluqueria3.mp4' },
  { type: 'image', src: '/fotoPeluqueria3.jpeg' },
  { type: 'video', src: '/videoPeluqueria4.mp4' },
];

export function GallerySection() {
  return (
    <section id="galeria" className="w-full max-w-xl mx-auto flex flex-col items-center gap-8 mt-24 mb-24">
      <div className="text-center px-4">
        <h2 className="text-[2.5rem] font-black tracking-tighter text-amber-100 uppercase drop-shadow-[0_0_15px_rgba(217,176,108,0.3)]">
          Galería
        </h2>
        <p className="text-zinc-300 mt-4 text-lg">
          Un vistazo a nuestro trabajo en el templo.
        </p>
      </div>

      <div className="w-full px-2">
        <div className="grid grid-cols-2 gap-4">
          {galleryItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`w-full aspect-[4/5] rounded-3xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-zinc-800/30 ${
                idx === galleryItems.length - 1 && galleryItems.length % 2 !== 0 
                  ? 'col-span-2 aspect-[16/9]' 
                  : ''
              }`}
            >
              {item.type === 'image' ? (
                <Image 
                  src={item.src} 
                  alt={`Trabajo de barbería ${idx + 1}`} 
                  width={500}
                  height={625}
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              ) : (
                <video 
                  src={item.src} 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
