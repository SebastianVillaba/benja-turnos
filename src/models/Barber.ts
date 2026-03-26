import mongoose, { Schema, Document } from 'mongoose';

export interface IBarber extends Document {
  name: string; // Ej: "Hugo"
  imageUrl: string;
  isActive: boolean;
}

const BarberSchema: Schema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Barber || mongoose.model<IBarber>('Barber', BarberSchema);