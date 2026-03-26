import { ServiceCard } from './ServiceCard';
import { Scissors, Paintbrush } from 'lucide-react';

export function ServicesSection() {
  const services = [
    {
      title: 'Fades Profesionales',
      description: 'Degradados perfectos con técnica y precisión',
      Icon: Scissors,
    },
    {
      title: 'Color y Fantasía',
      description: 'Tintes vibrantes y colores únicos',
      Icon: Paintbrush,
    },
  ];

  return (
    <section className="w-full max-w-xl mx-auto flex flex-col gap-6 w-full mt-10">
      {services.map((service, index) => (
        <ServiceCard 
          key={index} 
          title={service.title} 
          description={service.description} 
          Icon={service.Icon} 
        />
      ))}
    </section>
  );
}
