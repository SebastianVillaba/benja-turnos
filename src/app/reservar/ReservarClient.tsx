'use client';

import { useState, useTransition } from 'react';
import { getAvailableSlots, createAppointment } from '@/app/actions/actions';
import CustomCalendar from '@/components/CustomCalendar';
import { ArrowLeft, User, Scissors, Calendar, Clock, Check, Loader2, MapPin } from 'lucide-react';
import Link from 'next/link';
import { format, parse } from 'date-fns';
import { es } from 'date-fns/locale';

interface Branch {
  _id: string;
  name: string;
}

interface Barber {
  _id: string;
  name: string;
  imageUrl: string;
  unavailableDays?: number[];
  branchAssignments?: {
    branchId: string;
    workDays: number[];
  }[];
}

interface Service {
  _id: string;
  name: string;
  precioCentro: number;
  precioCambyreta: number;
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
  branches: Branch[];
}

export default function ReservarClient({ barbers, services, branches }: ReservarClientProps) {
  const [step, setStep] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [countryCode, setCountryCode] = useState('595');
  const [error, setError] = useState('');
  const [isPending, startTransition] = useTransition();
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Paso 1: Seleccionar sucursal
  const handleSelectBranch = (branch: Branch) => {
    setSelectedBranch(branch);
    // Limpiar elecciones posteriores por si vuelve atrás y cambia
    setSelectedBarber(null);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setStep(2);
  };

  // Paso 2: Seleccionar barbero
  const handleSelectBarber = (barber: Barber) => {
    setSelectedBarber(barber);
    setSelectedService(null);
    setSelectedDate('');
    setSelectedTime('');
    setStep(3);
  };

  // Paso 3: Seleccionar servicio
  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setSelectedDate('');
    setSelectedTime('');
    setStep(4);
  };

  // Paso 4: Seleccionar fecha y hora
  const handleDateChange = async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedTime('');
    setLoadingSlots(true);
    try {
      const availableSlots = await getAvailableSlots(selectedBarber!._id, dateStr, selectedBranch!._id);
      setSlots(availableSlots);
    } catch {
      setError('Error al cargar horarios.');
    }
    setLoadingSlots(false);
  };

  const handleSelectTime = (time: string) => {
    setSelectedTime(time);
    setStep(5);
  };

  // Obtener detalles de precios diferenciados
  const getPriceDetails = (service: Service) => {
    if (!selectedBranch) return { price: 0, originalPrice: 0, hasWebDiscount: false };
    const isCentro = selectedBranch.name === 'Centro';
    const basePrice = isCentro ? service.precioCentro : service.precioCambyreta;

    // Lógica de descuento web de los miércoles (15% aprox, o corte simple de 60.000 a 40.000 Gs)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const isHaircut = service.name.toLowerCase().includes('corte');
    const isMiercoles = dayOfWeek === 3;
    const hasDiscount = isHaircut && basePrice === 60000 && isMiercoles;

    return {
      price: hasDiscount ? 40000 : basePrice,
      originalPrice: basePrice,
      hasWebDiscount: hasDiscount
    };
  };

  // Paso 5: Confirmar turno
  const handleConfirm = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError('Completá tu nombre y teléfono.');
      return;
    }

    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.startsWith('0')) {
      setError('El número de teléfono no debe comenzar con 0.');
      return;
    }

    if (cleanPhone.length < 9) {
      setError('El número de teléfono debe tener al menos 9 dígitos.');
      return;
    }

    setError('');
    const fullPhone = `${countryCode} ${cleanPhone}`;
    const priceDetails = selectedService ? getPriceDetails(selectedService) : { price: 0 };

    startTransition(async () => {
      try {
        const result = await createAppointment({
          barberId: selectedBarber!._id,
          serviceId: selectedService!._id,
          branchId: selectedBranch!._id,
          customerName,
          customerPhone: fullPhone,
          date: selectedDate,
          time: selectedTime,
          serviceName: selectedService!.name,
          servicePrice: priceDetails.price,
          barberName: selectedBarber!.name,
          branchName: selectedBranch!.name,
        });

        if (result.success) {
          setStep(6);
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

  // Calcular días de la semana deshabilitados para el barbero
  const getDisabledDaysOfWeek = () => {
    if (!selectedBarber || !selectedBranch) return [];
    
    // Buscar asignación específica
    const assignment = selectedBarber.branchAssignments?.find(
      (ba) => ba.branchId === selectedBranch._id
    );
    
    if (assignment) {
      const workDays = assignment.workDays || [];
      // Deshabilitar días que NO están en workDays
      return [0, 1, 2, 3, 4, 5, 6].filter(d => !workDays.includes(d));
    }
    
    // Fallback si no tiene asignación (usar unavailableDays generales)
    return selectedBarber.unavailableDays || [];
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {step > 1 && step < 6 ? (
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
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
              s <= step ? 'bg-amber-500' : 'bg-zinc-800'
            }`}
          />
        ))}
      </div>

      {/* ==================== PASO 1: SUCURSAL ==================== */}
      {step === 1 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Elegí la sucursal</h2>
              <p className="text-sm text-zinc-400">Seleccioná dónde querés atenderte</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {branches.map((branch) => (
              <button
                key={branch._id}
                onClick={() => handleSelectBranch(branch)}
                className="flex flex-col items-center justify-center p-8 bg-[#0d0d0d] border border-zinc-800/80 rounded-3xl hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,176,108,0.1)] transition-all duration-300 group text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-amber-950/30 border border-amber-900/50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-bold text-white group-hover:text-amber-100 transition-colors">
                  {branch.name}
                </h3>
                <p className="text-xs text-zinc-500 mt-2">
                  {branch.name === 'Centro' ? 'Ubicación céntrica con accesibilidad total' : 'Ubicación Cambyreta con amplio estacionamiento'}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PASO 2: BARBERO ==================== */}
      {step === 2 && (
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

      {/* ==================== PASO 3: SERVICIO ==================== */}
      {step === 3 && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-amber-950/30 border border-amber-900/50 flex items-center justify-center">
              <Scissors className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Elegí tu servicio</h2>
              <p className="text-sm text-zinc-400">¿Qué querés hacerte hoy en sucursal {selectedBranch?.name}?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {services.map((service) => {
              const { price, originalPrice, hasWebDiscount } = getPriceDetails(service);
              return (
                <button
                  key={service._id}
                  onClick={() => handleSelectService(service)}
                  className="flex flex-col p-5 bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl hover:border-amber-600/50 hover:shadow-[0_0_20px_rgba(217,176,108,0.1)] transition-all duration-300 text-left group"
                >
                  <div className="flex justify-between items-start mb-2 gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-amber-100 flex py-1 items-center gap-2 flex-wrap">
                        {service.name}
                        {hasWebDiscount && (
                          <span className="inline-flex items-center rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-bold text-green-400 border border-green-500/20 uppercase tracking-widest">
                            Descuento Web
                          </span>
                        )}
                      </h3>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      {hasWebDiscount && (
                        <span className="text-zinc-500 line-through text-xs font-medium">Gs. {originalPrice.toLocaleString('es-AR')}</span>
                      )}
                      <span className="text-amber-500 font-bold text-lg">Gs. {price.toLocaleString('es-AR')}</span>
                    </div>
                  </div>
                  {service.description && (
                    <p className="text-sm text-zinc-400 mb-2">{service.description}</p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{service.durationMinutes} min</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== PASO 4: FECHA Y HORA ==================== */}
      {step === 4 && (
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
              disabledDaysOfWeek={getDisabledDaysOfWeek()}
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

      {/* ==================== PASO 5: DATOS + CONFIRMACIÓN ==================== */}
      {step === 5 && (
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
                <span className="text-zinc-400">Sucursal</span>
                <span className="text-white font-medium">{selectedBranch?.name}</span>
              </div>
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
              <div className="border-t border-zinc-800 pt-3 flex flex-col gap-1">
                {selectedService && (() => {
                  const { price, originalPrice, hasWebDiscount } = getPriceDetails(selectedService);
                  return (
                    <>
                      {hasWebDiscount && (
                        <div className="flex justify-between items-center text-sm mb-1">
                          <span className="text-zinc-500">Precio Regular</span>
                          <span className="text-zinc-500 line-through">Gs. {originalPrice.toLocaleString('es-AR')}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-300 font-medium">Total</span>
                        <div className="flex items-center gap-2">
                          {hasWebDiscount && (
                            <span className="text-green-400 text-[10px] font-bold bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 uppercase tracking-wider hidden sm:inline-block">Descuento Web</span>
                          )}
                          <span className="text-amber-500 font-bold text-xl">Gs. {price.toLocaleString('es-AR')}</span>
                        </div>
                      </div>
                    </>
                  );
                })()}
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
            <div className='flex gap-2 sm:gap-3'>
              <div className='w-[130px] shrink-0'>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Código</label>
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="w-full bg-[#0d0d0d] border border-zinc-800/80 rounded-xl pl-3 pr-8 py-3 text-white appearance-none cursor-pointer focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-colors"
                  >
                    <option value="595">🇵🇾 +595</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/>
                    </svg>
                  </div>
                </div>
              </div>
              <div className='flex-1'>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Tu teléfono</label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, '');
                    setCustomerPhone(val);
                  }}
                  placeholder="Ej: 983475319"
                  className="w-full bg-[#0d0d0d] border border-zinc-800/80 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-colors"
                />
              </div>
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

      {/* ==================== PASO 6: ÉXITO + WHATSAPP ==================== */}
      {step === 6 && (
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
                <span className="text-zinc-400">Sucursal</span>
                <span className="text-white font-medium">{selectedBranch?.name}</span>
              </div>
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
