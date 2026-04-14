'use client';

import { useState, useTransition } from 'react';
import { getAvailableSlots, createAppointment } from '@/app/actions/actions';
import CustomCalendar from '@/components/CustomCalendar';
import { ArrowLeft, User, Scissors, Calendar, Clock, Check, MessageCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface Barber {
  _id: string;
  name: string;
  imageUrl: string;
}

interface Service {
  _id: string;
  name: string;
  price: number;
  description: string;
  durationMinutes: number;
}

interface Slot {
  time: string;
  available: boolean;
}

interface ReservarClientProps {
  barbers: Barber[];
  services: Service[];
}

export default function ReservarClient({ barbers, services }: ReservarClientProps) {
  const [step, setStep] = useState(1);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Paso 1: Seleccionar barbero
  const handleSelectBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    setStep(2);
  };

  // Paso 2: Seleccionar servicio
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep(3);
  };

  // Paso 3: Seleccionar fecha
  const handleDateChange = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    setLoadingSlots(true);
    try {
      const availableSlots = await getAvailableSlots(selectedBarber!._id, dateStr);
      setSlots(availableSlots);
    } catch {
      setError('Error al cargar horarios.');
    }
    setLoadingSlots(false);
  };

  // Paso 3: Seleccionar hora
  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  // Paso 4: Confirmar turno
  const handleConfirm = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Completá tu nombre y teléfono.');
      return;
    }
    setError('');

    startTransition(async () => {
      try {
        const result = await createAppointment({
          barberId: selectedBarber!._id,
          serviceId: selectedService!._id,
          customerName,
          customerPhone,
          date: selectedDate,
          time: selectedTime,
          serviceName: selectedService!.name,
          servicePrice: selectedService!.price,
          barberName: selectedBarber!.name,
        });

        if (result.success) {
          setStep(5);
        } else {
          setError(result.error || 'Error al crear el turno.');
        }
      } catch {
        setError('Error al crear el turno. Intenta de nuevo.');
      }
    });
  };

  const goBack = () => {
    setError('');
    if (step > 1) setStep(step - 1);
  };

  // Formatear fecha para mostrar
  const getFormattedDate = () => {
    if (!selectedDate) return '';
    try {
      const date = parse(selectedDate, 'yyyy-MM-dd', new Date());
      return format(date, "EEEE d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return selectedDate;
    }
  };

  // Fecha mínima: hoy
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {step > 1 && step < 5 ? (
          <button onClick={goBack} className="text-amber-500 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        ) : (
          <Link href="/" className="text-amber-500 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </Link>
        )}
        <h1 className="text-2xl font-bold text-amber-100">Reservar Turno</h1>
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              s <= step ? 'bg-amber-500' : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>

      {/* ==================== PASO 1: BARBERO ==================== */}
      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Elegí tu barbero</h2>
              <p className="text-sm text-zinc-400">Seleccioná al profesional que prefieras</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {barbers.map((barber) => (
              <button
                key={barber._id}
                onClick={() => handleSelectBarber(barber)}
                className="flex items-center gap-5 p-5 bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,176,108,0.1)] transition-all duration-300 text-left group"
              >
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-zinc-700 group-hover:border-amber-600/50 transition-colors flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={barber.imageUrl} alt={barber.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">{barber.name}</h3>
                  <p className="text-sm text-zinc-400">Profesional</p>
                </div>
                <ArrowLeft className="w-5 h-5 text-zinc-600 group-hover:text-amber-500 rotate-180 transition-colors" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PASO 2: SERVICIO ==================== */}
      {step === 2 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Elegí tu servicio</h2>
              <p className="text-sm text-zinc-400">¿Qué querés hacerte hoy?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => (
              <button
                key={service._id}
                onClick={() => handleSelectService(service)}
                className="flex flex-col p-5 bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,176,108,0.1)] transition-all duration-300 text-left group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-100">{service.name}</h3>
                  <span className="text-amber-500 font-bold text-lg">${service.price.toLocaleString('es-AR')}</span>
                </div>
                {service.description && (
                  <p className="text-sm text-zinc-400 mb-2">{service.description}</p>
                )}
                <div className="flex items-center gap-2 text-xs text-zinc-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{service.durationMinutes} min</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PASO 3: FECHA Y HORA ==================== */}
      {step === 3 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Elegí fecha y hora</h2>
              <p className="text-sm text-zinc-400">Seleccioná cuándo te queda bien</p>
            </div>
          </div>

          {/* Date picker */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-zinc-300 mb-3">Fecha</label>
            <CustomCalendar 
              selectedDate={selectedDate} 
              onDateChange={handleDateChange} 
            />
          </div>

          {/* Slots grid */}
          {selectedDate && (
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-3">Horarios disponibles</label>
              {loadingSlots ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((slot) => (
                    <button
                      key={slot.time}
                      onClick={() => slot.available && handleSelectTime(slot.time)}
                      disabled={!slot.available}
                      className={`py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        slot.available
                          ? selectedTime === slot.time
                            ? 'bg-amber-500 text-zinc-950 shadow-[0_0_15px_rgba(217,176,108,0.3)]'
                            : 'bg-[#0d0d0d] border border-zinc-800/80 text-zinc-300 hover:border-amber-600/50 hover:text-amber-100'
                          : 'bg-zinc-900/50 text-zinc-700 cursor-not-allowed line-through'
                      }`}
                    >
                      {slot.time}
                    </button>
                  ))}
                </div>
              )}
              {!loadingSlots && slots.length > 0 && !slots.some(s => s.available) && (
                <p className="text-center text-zinc-500 mt-4">No hay horarios disponibles para este día.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ==================== PASO 4: DATOS + CONFIRMACIÓN ==================== */}
      {step === 4 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
              <Check className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Confirmar turno</h2>
              <p className="text-sm text-zinc-400">Completá tus datos y confirmá</p>
            </div>
          </div>

          {/* Resumen */}
          <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-5 mb-6">
            <h3 className="text-sm font-medium text-zinc-400 mb-4 uppercase tracking-wider">Resumen</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Barbero</span>
                <span className="text-white font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Servicio</span>
                <span className="text-white font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Fecha</span>
                <span className="text-white font-medium capitalize">{getFormattedDate()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Hora</span>
                <span className="text-white font-medium">{selectedTime} hs</span>
              </div>
              <div className="border-t border-zinc-800 pt-3 flex justify-between items-center">
                <span className="text-zinc-300 font-medium">Total</span>
                <span className="text-amber-500 font-bold text-xl">${selectedService?.price.toLocaleString('es-AR')}</span>
              </div>
            </div>
          </div>

          {/* Datos del cliente */}
          <div className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tu nombre</label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ej: Juan Pérez"
                className="w-full bg-[#0d0d0d] border border-zinc-800/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">Tu teléfono</label>
              <input
                type="tel"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="Ej: 1122334455"
                className="w-full bg-[#0d0d0d] border border-zinc-800/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-colors"
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleConfirm}
            disabled={isPending}
            className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed text-zinc-950 font-bold py-4 rounded-2xl text-lg transition-all duration-300 shadow-[0_0_15px_rgba(180,140,80,0.2)] hover:shadow-[0_0_30px_rgba(217,176,108,0.4)] flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" /> Reservando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" /> Confirmar Turno
              </>
            )}
          </button>
        </div>
      )}

      {/* ==================== PASO 5: ÉXITO + WHATSAPP ==================== */}
      {step === 5 && (
        <div className="animate-in fade-in duration-300 text-center">
          <div className="w-20 h-20 rounded-full bg-green-950/30 border border-green-900/50 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-green-500" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">¡Turno Reservado!</h2>
          <p className="text-zinc-400 mb-8">Tu turno fue registrado con éxito.</p>

          {/* Resumen final */}
          <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-5 mb-8 text-left">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-zinc-400">Barbero</span>
                <span className="text-white font-medium">{selectedBarber?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Servicio</span>
                <span className="text-white font-medium">{selectedService?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Fecha</span>
                <span className="text-white font-medium capitalize">{getFormattedDate()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Hora</span>
                <span className="text-white font-medium">{selectedTime} hs</span>
              </div>
            </div>
          </div>

          <Link
            href="/"
            className="block w-full border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium py-3 rounded-2xl transition-all duration-300"
          >
            Volver al inicio
          </Link>
        </div>
      )}
    </div>
  );
}
