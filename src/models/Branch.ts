import mongoose, { Schema, Document } from 'mongoose';

export interface IBranch extends Document {
  name: string; // Ej: "Centro" o "Cambyreta"
  address?: string;
}

const BranchSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true },
  address: { type: String }
}, { timestamps: true });

export default mongoose.models.Branch || mongoose.model<IBranch>('Branch', BranchSchema);
