'use server';

import connectToDatabase from '@/lib/mongodb';
import Barber from '@/models/Barber';
import Service from '@/models/Service';
import Appointment from '@/models/Appointment';
import { startOfDay, endOfDay, addMinutes, format, parse, isBefore } from 'date-fns';
import { es } from 'date-fns/locale';
import { toZonedTime } from 'date-fns-tz';

// ============================================================
// QUERIES para el flujo de reserva (públicas)
// ============================================================

export async function getBarbers() {
  await connectToDatabase();
  const barbers = await Barber.find({ isActive: true }).lean();
  return barbers.map((b: any) => ({
    _id: b._id.toString(),
    name: b.name,
    imageUrl: b.imageUrl,
    unavailableDays: b.unavailableDays || [],
  }));
}

export async function getServices() {
  await connectToDatabase();
  const services = await Service.find({}).lean();
  return services.map((s: any) => {
    // Si se agenda desde la web, los cortes tienen un descuento (40.000 Gs)
    const today = toZonedTime(new Date(), 'America/Asuncion');
    const isHaircut = s.name.toLowerCase().includes('corte');
    const isMiercoles = today.getDay() === 3;
    const hasDiscount = isHaircut && s.price === 60000 && isMiercoles;
    
    return {
      _id: s._id.toString(),
      name: s.name,
      price: hasDiscount ? 40000 : s.price,
      originalPrice: hasDiscount ? 60000 : s.price,
      hasWebDiscount: hasDiscount,
      description: s.description || '',
      durationMinutes: s.durationMinutes || 30,
    };
  });
}

export async function getAvailableSlots(barberId: string, dateStr: string) {
  await connectToDatabase();

  const barber = await Barber.findById(barberId).lean();
  if (!barber) return [];

  // Parsear la fecha recibida
  const date = parse(dateStr, 'yyyy-MM-dd', new Date());
  const dayOfWeek = date.getDay();

  if (barber.unavailableDays && barber.unavailableDays.includes(dayOfWeek)) {
    return [];
  }

  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existingAppointments = await Appointment.find({
    barberId,
    date: { $gte: dayStart, $lte: dayEnd },
    status: { $ne: 'cancelled' },
  }).lean();

  const workStart = new Date(dayStart);
  workStart.setHours(9, 0, 0, 0);
  const workEnd = new Date(dayStart);
  workEnd.setHours(20, 0, 0, 0);

  const slots: { time: string; available: boolean }[] = [];
  let current = new Date(workStart);

  const now = toZonedTime(new Date(), 'America/Asuncion');
  
  while (isBefore(current, workEnd)) {
    const slotTime = format(current, 'HH:mm');

    const isOccupied = existingAppointments.some((apt: any) => {
      const aptTime = format(new Date(apt.date), 'HH:mm');
      return aptTime === slotTime;
    });

    const slotDateTime = new Date(date);
    slotDateTime.setHours(current.getHours(), current.getMinutes(), 0, 0);

    const isPast = isBefore(slotDateTime, now);

    slots.push({
      time: slotTime,
      available: !isOccupied && !isPast,
    });

    current = addMinutes(current, 30);
  }

  return slots;
}

// ============================================================
// MUTACIÓN: Crear turno
// ============================================================

interface CreateAppointmentData {
  barberId: string;
  serviceId: string;
  customerName: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  serviceName: string;
  servicePrice: number;
  barberName: string;
}

async function sendWhatsAppMessage(to: string, message: string) {
  try {
    const response = await fetch('https://api-whatsapp.elpedalbogado.com/enviar-turno', {
    //const response = await fetch('http://localhost:3001/enviar-turno', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        numero: to,
        mensaje: message,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error.message);
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error al enviar mensaje de WhatsApp:', error.message);
    return { success: false, error: 'Error al enviar mensaje de WhatsApp.' };
  }
}

export async function createAppointment(data: CreateAppointmentData) {
  await connectToDatabase();

  // Construir fecha/hora del turno
  const appointmentDate = parse(
    `${data.date} ${data.time}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  );

  // Verificar que no esté ocupado
  const dayStart = startOfDay(appointmentDate);
  const dayEnd = endOfDay(appointmentDate);

  const existing = await Appointment.findOne({
    barberId: data.barberId,
    date: appointmentDate,
    status: { $ne: 'cancelled' },
  });

  if (existing) {
    return { success: false, error: 'Este horario ya fue reservado.' };
  }

  const appointment = await Appointment.create({
    barberId: data.barberId,
    serviceId: data.serviceId,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    date: appointmentDate,
    serviceNameSnapshot: data.serviceName,
    priceSnapshot: data.servicePrice,
    status: 'pending',
  });

  // Formatear fecha para WhatsApp
  const formattedDate = format(appointmentDate, "EEEE d 'de' MMMM", { locale: es });
  const formattedTime = data.time;

  // Generar link de WhatsApp
  const CLIENT_NUMBER = `${data.customerPhone}`;
  const COMPANY_NUMBER = '595985674309';
  const messageEmpresa = `Turno reservado de *${data.customerName}*\nPara el servicio de *${data.serviceName}*\nCon el barbero *${data.barberName}*\nEl día *${formattedDate}*\nA las *${formattedTime}hs*.`;
  const messageCliente = `Hola *${data.customerName}* 👋\n\nTu turno en *Benja Turnos* fue agendado con éxito. Solo falta que lo confirmes.\n\n📅 *Fecha:* ${formattedDate}\n⏰ *Hora:* ${formattedTime}\n💈 *Barbero:* ${data.barberName}\n✂️ *Servicio:* ${data.serviceName}\n💰 *Precio:* ${data.servicePrice} Gs.\n\n⚠️ *IMPORTANTE:* Para confirmar tu turno, responde a este mensaje con la palabra *SI*. Si deseas cancelarlo, responde *NO*.\n\nRecuerda que si no confirmas, el turno se liberará automáticamente 1 hora antes. ¡Te esperamos!`;

  // Envio de mensaje al nro de la empresa
  try {
    await sendWhatsAppMessage(COMPANY_NUMBER, messageEmpresa);
  } catch (error) {
    console.error('Error al enviar mensaje al numero de la empresa:', error);
  }
  // Envio de mensaje al nro del cliente
  try {
    await sendWhatsAppMessage(CLIENT_NUMBER, messageCliente);
  } catch (error) {
    console.error('Error al enviar mensaje al numero del cliente:', error);
  }

  return {
    success: true,
    appointmentId: appointment._id.toString(),
  };
}
