import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Barber from '@/models/Barber';
import Service from '@/models/Service';

export async function GET() {
  try {
    // 1. Nos conectamos a MongoDB
    await connectToDatabase();

    // 2. Limpiamos los datos anteriores (para que no se dupliquen si recargás la página sin querer)
    await Barber.deleteMany({});
    await Service.deleteMany({});

    // 3. Creamos el primer Barbero (el Maestro)
    const newBarber = await Barber.create({
      name: "Benjamín",
      imageUrl: "/peluqueroBenja.jpg", // Las imágenes en /public se sirven desde la raíz '/'
      isActive: true
    });

    // 4. Creamos los servicios premium
    const newServices = await Service.insertMany([
      {
        name: "Corte Premium & Lavado",
        price: 70000,
        description: "Corte a tijera o máquina con lavado, secado y peinado final con productos premium."
      },
      {
        name: "Perfilado de Barba Tradicional",
        price: 40000,
        description: "Ritual de barba con navaja, toalla caliente y aceites esenciales."
      },
      {
        name: "Experiencia Benja (Corte + Barba)",
        price: 100000,
        description: "La experiencia definitiva de relajación y estilismo para el caballero."
      }
    ]);

    // 5. Devolvemos un mensaje de éxito con los datos creados
    return NextResponse.json({
      message: "¡Base de datos poblada con éxito!",
      barber: newBarber,
      services: newServices
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Hubo un error poblando la base de datos." }, 
      { status: 500 }
    );
  }
}