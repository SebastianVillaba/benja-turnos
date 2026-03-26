'use client';

import { useActionState } from 'react';
import { login } from '@/app/actions/auth-actions';
import { Lock, Mail, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <main className="min-h-screen bg-[#070707] flex items-center justify-center px-4 font-sans">
      <div className="w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-amber-100 tracking-tight">
            Benja Barber
          </h1>
          <p className="text-zinc-500 mt-2 text-sm">Panel de Administración</p>
        </div>

        {/* Login Card */}
        <div className="bg-[#0d0d0d] border border-zinc-800/80 rounded-2xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
          <h2 className="text-xl font-bold text-white mb-6">Iniciar Sesión</h2>

          <form action={action} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="admin@benja.com"
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#141414] border border-zinc-800/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-zinc-600 focus:border-amber-600/50 focus:outline-none focus:ring-1 focus:ring-amber-600/30 transition-colors"
                />
              </div>
            </div>

            {state?.error && (
              <div className="bg-red-950/30 border border-red-900/50 text-red-400 p-3 rounded-xl text-sm">
                {state.error}
              </div>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 disabled:cursor-not-allowed text-zinc-950 font-bold py-3.5 rounded-xl text-base transition-all duration-300 shadow-[0_0_15px_rgba(180,140,80,0.2)] hover:shadow-[0_0_30px_rgba(217,176,108,0.4)] flex items-center justify-center gap-2"
            >
              {pending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Ingresando...
                </>
              ) : (
                'Ingresar'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          © {new Date().getFullYear()} Benja Barber & Academy
        </p>
      </div>
    </main>
  );
}
