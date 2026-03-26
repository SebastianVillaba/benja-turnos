import Image from 'next/image';

interface BarberCardProps {
  name: string;
  imageUrl: string;
}

export function BarberCard({ name, imageUrl }: BarberCardProps) {
  return (
    <div className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-zinc-800/30">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img 
        src={imageUrl} 
        alt={`Barbero ${name}`} 
        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex items-end p-8">
        <h3 className="text-5xl font-black italic text-white tracking-wider drop-shadow-[0_4px_15px_rgba(0,0,0,0.9)]">
          {name}
        </h3>
      </div>
    </div>
  );
}
