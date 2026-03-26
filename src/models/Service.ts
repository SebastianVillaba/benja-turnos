import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  price: number; // Ej: 70000 para "Corte + Cejas"
  description?: string;
  durationMinutes: number; // Duración del servicio en minutos (default: 30)
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  durationMinutes: { type: Number, default: 30 }
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);