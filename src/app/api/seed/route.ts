import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Barber from '@/models/Barber';
import Service from '@/models/Service';
import User from '@/models/User';
import bcrypt from 'bcrypt';

export async function GET() {
  try {
    // 1. Nos conectamos a MongoDB
    await connectToDatabase();

    // 2. Limpiamos los datos anteriores
    await Barber.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({});

    // 3. Creamos el primer Barbero (el Maestro)
    const newBarber = await Barber.create({
      name: "Benjamín",
      imageUrl: "/peluqueroBenja.jpg",
      isActive: true
    });

    // 4. Creamos los servicios premium con duración
    const newServices = await Service.insertMany([
      {
        name: "Corte Premium & Lavado",
        price: 70000,
        description: "Corte a tijera o máquina con lavado, secado y peinado final con productos premium.",
        durationMinutes: 45
      },
      {
        name: "Perfilado de Barba Tradicional",
        price: 40000,
        description: "Ritual de barba con navaja, toalla caliente y aceites esenciales.",
        durationMinutes: 30
      },
      {
        name: "Experiencia Benja (Corte + Barba)",
        price: 100000,
        description: "La experiencia definitiva de relajación y estilismo para el caballero.",
        durationMinutes: 60
      }
    ]);

    // 5. Creamos un usuario admin por defecto
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@benja.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'admin'
    });

    // 6. Devolvemos un mensaje de éxito con los datos creados
    return NextResponse.json({
      message: "¡Base de datos poblada con éxito!",
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