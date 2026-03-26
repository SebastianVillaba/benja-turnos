import mongoose, { Schema, Document } from 'mongoose';

export interface IAppointment extends Document {
  barberId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  customerName: string;
  customerPhone: string;
  date: Date; // Fecha y hora exacta del turno (Ej: 2026-03-18T16:00:00.000Z)
  serviceNameSnapshot: string; // Ej: "Limpieza Facial Exprés"
  priceSnapshot: number; // Ej: 30000
  status: 'pending' | 'confirmed' | 'cancelled';
}

const AppointmentSchema: Schema = new Schema({
  barberId: { type: Schema.Types.ObjectId, ref: 'Barber', required: true },
  serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  date: { type: Date, required: true },
  serviceNameSnapshot: { type: String, required: true },
  priceSnapshot: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  }
}, { timestamps: true });

export default mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);