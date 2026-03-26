'use client';

import { CalendarCheck, Clock, CheckCircle, XCircle, Users, Scissors } from 'lucide-react';

interface Stats {
  totalToday: number;
  pending: number;
  confirmed: number;
  cancelled: number;
  totalBarbers: number;
  totalServices: number;
}

export default function AdminDashboard({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Turnos Hoy',
      value: stats.totalToday,
      icon: CalendarCheck,
      color: 'text-amber-500',
      bg: 'bg-amber-950/20',
      border: 'border-amber-900/40',
    },
    {
      label: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-500',
      bg: 'bg-yellow-950/20',
      border: 'border-yellow-900/40',
    },
    {
      label: 'Confirmados',
      value: stats.confirmed,
      icon: CheckCircle,
      color: 'text-green-500',
      bg: 'bg-green-950/20',
      border: 'border-green-900/40',
    },
    {
      label: 'Cancelados',
      value: stats.cancelled,
      icon: XCircle,
      color: 'text-red-500',
      bg: 'bg-red-950/20',
      border: 'border-red-900/40',
    },
    {
      label: 'Barberos Activos',
      value: stats.totalBarbers,
      icon: Users,
      color: 'text-blue-500',
      bg: 'bg-blue-950/20',
      border: 'border-blue-900/40',
    },
    {
      label: 'Servicios',
      value: stats.totalServices,
      icon: Scissors,
      color: 'text-purple-500',
      bg: 'bg-purple-950/20',
      border: 'border-purple-900/40',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-zinc-400 mt-1">Resumen general del día</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`${card.bg} border ${card.border} rounded-2xl p-6 transition-all duration-300 hover:shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.bg} border ${card.border}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-zinc-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
