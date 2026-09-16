import mongoose, { Schema, Document } from 'mongoose';

export interface IBarberServicePrice {
  serviceId: mongoose.Types.ObjectId | string;
  precioCentro?: number;
  precioCambyreta?: number;
  price?: number;
}

export interface IBarber extends Document {
  name: string; // Ej: "Hugo"
  imageUrl: string;
  isActive: boolean;
  unavailableDays: number[]; // Días de la semana no disponibles (0=Domingo, 1=Lunes, ..., 6=Sábado)
  branchAssignments?: {
    branchId: mongoose.Types.ObjectId | string;
    workDays: number[];
  }[];
  servicePrices?: IBarberServicePrice[];
}

const BarberSchema: Schema = new Schema({
  name: { type: String, required: true },
  imageUrl: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  unavailableDays: { type: [Number], default: [] },
  branchAssignments: {
    type: [{
      branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
      workDays: { type: [Number], default: [] }
    }],
    default: []
  },
  servicePrices: {
    type: [{
      serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
      precioCentro: { type: Number },
      precioCambyreta: { type: Number },
      price: { type: Number }
    }],
    default: []
  }
}, { timestamps: true });

export default mongoose.models.Barber || mongoose.model<IBarber>('Barber', BarberSchema);