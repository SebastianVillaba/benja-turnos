'use server';

import connectToDatabase from '@/lib/mongodb';
import Service from '@/models/Service';
import Barber from '@/models/Barber';
import Appointment from '@/models/Appointment';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';
import { startOfDay, endOfDay, format } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper: verificar que el usuario esté autenticado
async function requireAuth() {
  const session = await getSession();
  if (!session) throw new Error('No autorizado');
  return session;
}

// ============================================================
// CRUD SERVICIOS
// ============================================================

export async function getServicesAdmin() {
  await requireAuth();
  await connectToDatabase();
  const services = await Service.find({}).sort({ createdAt: -1 }).lean();
  return services.map((s: any) => ({
    _id: s._id.toString(),
    name: s.name,
    price: s.price,
    description: s.description || '',
    durationMinutes: s.durationMinutes || 30,
  }));
}

export async function createService(formData: FormData) {
  await requireAuth();
  await connectToDatabase();

  await Service.create({
    name: formData.get('name') as string,
    price: Number(formData.get('price')),
    description: formData.get('description') as string,
    durationMinutes: Number(formData.get('durationMinutes')) || 30,
  });

  revalidatePath('/admin/servicios');
  return { success: true };
}

export async function updateService(id: string, formData: FormData) {
  await requireAuth();
  await connectToDatabase();

  await Service.findByIdAndUpdate(id, {
    name: formData.get('name') as string,
    price: Number(formData.get('price')),
    description: formData.get('description') as string,
    durationMinutes: Number(formData.get('durationMinutes')) || 30,
  });

  revalidatePath('/admin/servicios');
  return { success: true };
}

export async function deleteService(id: string) {
  await requireAuth();
  await connectToDatabase();
  await Service.findByIdAndDelete(id);
  revalidatePath('/admin/servicios');
  return { success: true };
}

// ============================================================
// CRUD BARBEROS
// ============================================================

export async function getBarbersAdmin() {
  await requireAuth();
  await connectToDatabase();
  const barbers = await Barber.find({}).sort({ createdAt: -1 }).lean();
  return barbers.map((b: any) => ({
    _id: b._id.toString(),
    name: b.name,
    imageUrl: b.imageUrl,
    isActive: b.isActive,
  }));
}

export async function createBarber(formData: FormData) {
  await requireAuth();
  await connectToDatabase();

  await Barber.create({
    name: formData.get('name') as string,
    imageUrl: formData.get('imageUrl') as string,
    isActive: formData.get('isActive') === 'true',
  });

  revalidatePath('/admin/barberos');
  return { success: true };
}

export async function updateBarber(id: string, formData: FormData) {
  await requireAuth();
  await connectToDatabase();

  await Barber.findByIdAndUpdate(id, {
    name: formData.get('name') as string,
    imageUrl: formData.get('imageUrl') as string,
    isActive: formData.get('isActive') === 'true',
  });

  revalidatePath('/admin/barberos');
  return { success: true };
}

export async function deleteBarber(id: string) {
  await requireAuth();
  await connectToDatabase();
  await Barber.findByIdAndDelete(id);
  revalidatePath('/admin/barberos');
  return { success: true };
}

// ============================================================
// GESTIÓN DE TURNOS
// ============================================================

export async function getAppointmentsByDate(dateStr: string) {
  await requireAuth();
  await connectToDatabase();

  const date = new Date(dateStr);
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const appointments = await Appointment.find({
    date: { $gte: dayStart, $lte: dayEnd },
  })
    .sort({ date: 1 })
    .lean();

  return appointments.map((a: any) => ({
    _id: a._id.toString(),
    customerName: a.customerName,
    customerPhone: a.customerPhone,
    serviceNameSnapshot: a.serviceNameSnapshot,
    priceSnapshot: a.priceSnapshot,
    status: a.status,
    date: a.date.toISOString(),
    time: format(new Date(a.date), 'HH:mm'),
    formattedDate: format(new Date(a.date), "d 'de' MMMM, yyyy", { locale: es }),
  }));
}

export async function updateAppointmentStatus(id: string, status: 'confirmed' | 'cancelled') {
  await requireAuth();
  await connectToDatabase();
  await Appointment.findByIdAndUpdate(id, { status });
  revalidatePath('/admin/turnos');
  return { success: true };
}

// Dashboard stats
export async function getDashboardStats() {
  await requireAuth();
  await connectToDatabase();

  const today = new Date();
  const dayStart = startOfDay(today);
  const dayEnd = endOfDay(today);

  const todayAppointments = await Appointment.find({
    date: { $gte: dayStart, $lte: dayEnd },
  }).lean();

  const totalToday = todayAppointments.length;
  const pending = todayAppointments.filter((a: any) => a.status === 'pending').length;
  const confirmed = todayAppointments.filter((a: any) => a.status === 'confirmed').length;
  const cancelled = todayAppointments.filter((a: any) => a.status === 'cancelled').length;

  const totalBarbers = await Barber.countDocuments({ isActive: true });
  const totalServices = await Service.countDocuments({});

  return { totalToday, pending, confirmed, cancelled, totalBarbers, totalServices };
}
