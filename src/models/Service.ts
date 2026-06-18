import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  name: string;
  precioCentro: number;
  precioCambyreta: number;
  description?: string;
  durationMinutes: number; // Duración del servicio en minutos (default: 30)
}

const ServiceSchema: Schema = new Schema({
  name: { type: String, required: true },
  precioCentro: { type: Number, required: true },
  precioCambyreta: { type: Number, required: true },
  description: { type: String },
  durationMinutes: { type: Number, default: 30 }
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);