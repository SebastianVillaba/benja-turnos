import mongoose, { Schema, Document } from 'mongoose';

export interface IBarber extends Document {
  name: string; // Ej: "Hugo"
  imageUrl: string;
  isActive: boolean;
  unavailableDays: number[]; // Días de la semana no disponibles (0=Domingo, 1=Lunes, ..., 6=Sábado)
  branchAssignments?: {
    branchId: mongoose.Types.ObjectId | string;
    workDays: number[];
  }[];
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
  }
}, { timestamps: true });

export default mongoose.models.Barber || mongoose.model<IBarber>('Barber', BarberSchema);