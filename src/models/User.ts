import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password: string; // hasheado con bcrypt
  name: string;
  role: 'admin';
}

const UserSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['admin'], default: 'admin' }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
