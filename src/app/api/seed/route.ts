import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Barber from '@/models/Barber';
import Service from '@/models/Service';
import User from '@/models/User';
import Branch from '@/models/Branch';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    // 1. Nos conectamos a MongoDB
    await connectToDatabase();

    // 2. Limpiamos los datos anteriores
    await Branch.deleteMany({});
    await Barber.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({});

    // 3. Creamos las sucursales fijas
    const centroBranch = await Branch.create({ name: 'Centro' });
    const cambyretaBranch = await Branch.create({ name: 'Cambyreta' });

    // 4. Creamos el primer Barbero (el Maestro) con asignaciones
    const newBarber = await Barber.create({
      name: "Benjamín",
      imageUrl: "/peluqueroBenja.jpg",
      isActive: true,
      branchAssignments: [
        { branchId: centroBranch._id, workDays: [1, 2, 4] }, // Lunes, Martes, Jueves en Centro
        { branchId: cambyretaBranch._id, workDays: [3, 5, 6] } // Miércoles, Viernes, Sábado en Cambyreta
      ],
      unavailableDays: [0] // Domingo no trabaja
    });

    // 5. Creamos los servicios premium con duración y precios diferenciados
    const newServices = await Service.insertMany([
      {
        name: "Corte Premium & Lavado",
        precioCentro: 70000,
        precioCambyreta: 60000,
        description: "Corte a tijera o máquina con lavado, secado y peinado final con productos premium.",
        durationMinutes: 45
      },
      {
        name: "Perfilado de Barba Tradicional",
        precioCentro: 40000,
        precioCambyreta: 35000,
        description: "Ritual de barba con navaja, toalla caliente y aceites esenciales.",
        durationMinutes: 30
      },
      {
        name: "Experiencia Benja (Corte + Barba)",
        precioCentro: 100000,
        precioCambyreta: 90000,
        description: "La experiencia definitiva de relajación y estilismo para el caballero.",
        durationMinutes: 60
      }
    ]);

    // 6. Creamos un usuario admin por defecto
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@benja.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin'
    });

    // 7. Devolvemos un mensaje de éxito con los datos creados
    return NextResponse.json({
      message: "¡Base de datos poblada con éxito!",
      branches: [centroBranch, cambyretaBranch],
      barber: newBarber,
      services: newServices,
      admin: { email: adminUser.email, password: 'admin123 (hasheada en DB)' }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Hubo un error poblando la base de datos." }, 
      { status: 500 }
    );
  }
}