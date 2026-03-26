import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Appointment from '@/models/Appointment';

export async function GET() {
  try {
    await connectToDatabase();
    const appointments = await Appointment.find({})
      .sort({ date: -1 })
      .limit(50)
      .lean();

    return NextResponse.json(appointments);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Error al obtener turnos.' },
      { status: 500 }
    );
  }
}
