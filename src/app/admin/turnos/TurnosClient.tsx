'use client';

import { useState, useTransition, useEffect } from 'react';
import { getAppointmentsByDate, updateAppointmentStatus, adminCreateAppointment } from '@/app/actions/admin-actions';
import { getAvailableSlots } from '@/app/actions/actions';
import { CalendarCheck, CheckCircle, XCircle, Clock, Loader2, Phone, User, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import CustomCalendar from '@/components/CustomCalendar';

interface Barber {
  _id: string;
  name: string;
  imageUrl: string;
  unavailableDays?: number[];
}

interface Service {
  _id: string;
  name: string;
  price: number;
}

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

interface TurnosClientProps {
  barbers?: Barber[];
  services?: Service[];
}

export default function TurnosClient({ barbers = [], services = [] }: TurnosClientProps) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [selectedDate, setSelectedDate] = useState(today);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newAptBarber, setNewAptBarber] = useState('');
  const [newAptService, setNewAptService] = useState('');
  const [newAptDate, setNewAptDate] = useState(today);
  const [newAptTime, setNewAptTime] = useState('');
  const [newAptName, setNewAptName] = useState('');
  const [newAptPhone, setNewAptPhone] = useState('');
  const [slots, setSlots] = useState<{ time: string; available: boolean }[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [error, setError] = useState('');

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

  // Load slots for modal
  useEffect(() => {
    if (newAptBarber && newAptDate) {
      setLoadingSlots(true);
      getAvailableSlots(newAptBarber, newAptDate).then((data) => {
        setSlots(data);
        setLoadingSlots(false);
        setNewAptTime(''); // Reset time if barber or date changes
      }).catch(() => {
        setSlots([]);
        setLoadingSlots(false);
      });
    } else {
      setSlots([]);
    }
  }, [newAptBarber, newAptDate]);

  const handleCreateAppointment = () => {
    if (!newAptBarber || !newAptService || !newAptDate || !newAptTime || !newAptName.trim() || !newAptPhone.trim()) {
      setError('Por favor completa todos los campos (Nombre y Teléfono son obligatorios).');
      return;
    }

    const serviceObj = services.find(s => s._id === newAptService);
    if (!serviceObj) return;

    setError('');
    startTransition(async () => {
      const result = await adminCreateAppointment({
        barberId: newAptBarber,
        serviceId: newAptService,
        date: newAptDate,
        time: newAptTime,
        customerName: newAptName,
        customerPhone: newAptPhone,
        serviceName: serviceObj.name,
        servicePrice: serviceObj.price,
      });

      if (result.success) {
        setShowModal(false);
        setNewAptName('');
        setNewAptPhone('');
        setNewAptTime('');
        if (selectedDate === newAptDate) {
          await loadAppointments(selectedDate);
        }
      } else {
        setError(result.error || 'Error al crear turno.');
      }
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Turnos</h1>
          <p className="text-zinc-400 mt-1">Gestiona los turnos por día</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold px-4 py-2.5 rounded-xl transition-all duration-300 text-sm"
          >
            <Plus className="w-4 h-4" /> Nuevo Turno Manual
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-[#0d0d0d] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white focus:border-amber-600/50 focus:outline-none transition-colors text-sm [color-scheme:dark]"
          />
        </div>
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

      {/* Modal Turno Manual */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Agendar Turno Manual</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Barbero</label>
                  <select
                    value={newAptBarber}
                    onChange={(e) => setNewAptBarber(e.target.value)}
                    className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                  >
                    <option value="">Selecciona un barbero</option>
                    {barbers.map(b => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Servicio</label>
                  <select
                    value={newAptService}
                    onChange={(e) => setNewAptService(e.target.value)}
                    className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                  >
                    <option value="">Selecciona un servicio</option>
                    {services.map(s => (
                      <option key={s._id} value={s._id}>{s.name} (${s.price.toLocaleString('es-AR')})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Fecha</label>
                <CustomCalendar 
                  selectedDate={newAptDate} 
                  onDateChange={setNewAptDate}
                  disabledDaysOfWeek={barbers.find(b => b._id === newAptBarber)?.unavailableDays}
                />
              </div>

              {newAptBarber && newAptDate && (
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Horario</label>
                  {loadingSlots ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-5 h-5 text-amber-500 animate-spin" />
                    </div>
                  ) : slots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          onClick={() => slot.available && setNewAptTime(slot.time)}
                          disabled={!slot.available}
                          className={`py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                            slot.available
                              ? newAptTime === slot.time
                                ? 'bg-amber-500 text-zinc-950'
                                : 'bg-[#141414] border border-zinc-800/80 text-zinc-300 hover:border-amber-600/50'
                              : 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed line-through'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">No hay horarios disponibles.</p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/80 mt-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Nombre (Obligatorio)</label>
                  <input
                    type="text"
                    value={newAptName}
                    onChange={(e) => setNewAptName(e.target.value)}
                    placeholder="Ej: Juan"
                    className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Teléfono (Obligatorio)</label>
                  <input
                    type="text"
                    value={newAptPhone}
                    onChange={(e) => setNewAptPhone(e.target.value)}
                    placeholder="Ej: 0981123456"
                    className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl px-4 py-2.5 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none transition-colors text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-xl text-sm mt-2">
                  {error}
                </div>
              )}

              <button
                onClick={handleCreateAppointment}
                disabled={isPending || !newAptTime}
                className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed text-zinc-950 font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 text-sm mt-4"
              >
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmar Turno'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
