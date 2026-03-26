import { LucideIcon } from 'lucide-react';

interface ServiceCardProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

export function ServiceCard({ title, description, Icon }: ServiceCardProps) {
  return (
    <div className="flex flex-col items-center text-center gap-4 p-8 rounded-2xl border border-zinc-800/80 bg-[#0d0d0d] shadow-[0_4px_20px_rgba(0,0,0,0.5)] transition-all duration-300 hover:border-amber-600/50 hover:shadow-[0_0_30px_rgba(217,176,108,0.15)]">
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-amber-950/30 border border-amber-900/50 mb-2 shadow-[0_0_15px_rgba(217,176,108,0.2)]">
        <Icon className="w-8 h-8 text-amber-500" />
      </div>
      <h3 className="text-xl font-bold text-white tracking-wide">{title}</h3>
      <p className="text-zinc-400 text-sm leading-relaxed max-w-[250px]">
        {description}
      </p>
    </div>
  );
}
