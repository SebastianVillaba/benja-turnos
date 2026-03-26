'use server';

import bcrypt from 'bcrypt';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { createSession, deleteSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export async function login(prevState: { error?: string } | undefined, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos.' };
  }

  await connectToDatabase();
  const user = await User.findOne({ email });

  if (!user) {
    return { error: 'Credenciales inválidas.' };
  }

  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return { error: 'Credenciales inválidas.' };
  }

  await createSession(user._id.toString(), user.role);
  redirect('/admin');
}

export async function logout() {
  await deleteSession();
  redirect('/admin/login');
}
