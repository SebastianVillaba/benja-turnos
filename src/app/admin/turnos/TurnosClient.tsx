'use client';

import { useState, useTransition, useEffect } from 'react';
import { getAppointmentsByDate, updateAppointmentStatus } from '@/app/actions/admin-actions';
import { CalendarCheck, CheckCircle, XCircle, Clock, Loader2, Phone, User } from 'lucide-react';
import { format } from 'date-fns';

interface AppointmentItem {
  _id: string;
  customerName: string;
  customerPhone: string;
  serviceNameSnapshot: string;
  priceSnapshot: number;
  status: string;
  date: string;
  time: string;
  formattedDate: string;
  barber?: {
    _id: string;
    name: string;
    imageUrl: string;
  } | null;
}

export default function TurnosClient() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  const loadAppointments = async (dateStr: string) => {
    setLoading(true);
    try {
      const data = await getAppointmentsByDate(dateStr);
      setAppointments(data);
    } catch {
      setAppointments([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAppointments(selectedDate);
  }, [selectedDate]);

  const handleStatusChange = (id: string, status: 'confirmed' | 'cancelled') => {
    startTransition(async () => {
      await updateAppointmentStatus(id, status);
      await loadAppointments(selectedDate);
    });
  };

  const statusConfig: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pendiente', color: 'text-yellow-500', bg: 'bg-yellow-950/30', border: 'border-yellow-900/50' },
    confirmed: { label: 'Confirmado', color: 'text-green-500', bg: 'bg-green-950/30', border: 'border-green-900/50' },
    cancelled: { label: 'Cancelado', color: 'text-red-500', bg: 'bg-red-950/30', border: 'border-red-900/50' },
  };

  // Group appointments by barber
  const groupedAppointments = appointments.reduce((acc, apt) => {
    const barberId = apt.barber?._id || 'unassigned';
    if (!acc[barberId]) {
      acc[barberId] = { barber: apt.barber, appointments: [] };
    }
    acc[barberId].appointments.push(apt);
    return acc;
  }, {} as Record<string, { barber: AppointmentItem['barber']; appointments: AppointmentItem[] }>);

  const groups = Object.values(groupedAppointments);

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Turnos</h1>
          <p className="text-zinc-400 mt-1">Gestiona los turnos por día</p>
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="bg-[#0d0d0d] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white focus:border-amber-600/50 focus:outline-none transition-colors text-sm [color-scheme:dark]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-20">
          <CalendarCheck className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <p className="text-zinc-500">No hay turnos para esta fecha.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 items-start">
          {groups.map((group) => (
            <div key={group.barber?._id || 'unassigned'} className="space-y-4">
              {/* Barber Header */}
              <div className="flex items-center gap-4 bg-[#141414] border border-zinc-800/80 p-4 rounded-2xl shadow-sm">
                {group.barber?.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={group.barber.imageUrl} alt={group.barber.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/50" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center border-2 border-zinc-700">
                    <User className="w-6 h-6 text-zinc-500" />
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold text-white">{group.barber?.name || 'Sin Especificar'}</h2>
                  <p className="text-sm text-zinc-400">
                    {group.appointments.length} {group.appointments.length === 1 ? 'turno' : 'turnos'}
                  </p>
                </div>
              </div>

              {/* Barber's Appointments */}
              <div className="space-y-3">
                {group.appointments.map((apt) => {
                  const config = statusConfig[apt.status] || statusConfig.pending;
                  return (
                    <div
                      key={apt._id}
                      className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700/80 transition-all duration-300 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Info */}
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-amber-500">{apt.time}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color} border ${config.border}`}>
                              {config.label}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-300">
                            <User className="w-4 h-4 text-zinc-500" />
                            <span className="font-medium">{apt.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Phone className="w-3.5 h-3.5 text-zinc-500" />
                            <span>{apt.customerPhone}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-zinc-400">{apt.serviceNameSnapshot}</span>
                            <span className="text-amber-500 font-medium">${apt.priceSnapshot.toLocaleString('es-AR')}</span>
                          </div>
                        </div>

                        {/* Actions */}
                        {apt.status === 'pending' && (
                          <div className="flex items-center gap-2 sm:flex-col">
                            <button
                              onClick={() => handleStatusChange(apt._id, 'confirmed')}
                              disabled={isPending}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-950/30 border border-green-900/50 text-green-400 hover:bg-green-900/40 hover:text-green-300 transition-all text-sm font-medium disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" /> Confirmar
                            </button>
                            <button
                              onClick={() => handleStatusChange(apt._id, 'cancelled')}
                              disabled={isPending}
                              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-950/30 border border-red-900/50 text-red-400 hover:bg-red-900/40 hover:text-red-300 transition-all text-sm font-medium disabled:opacity-50"
                            >
                              <XCircle className="w-4 h-4" /> Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
