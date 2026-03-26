'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { logout } from '@/app/actions/auth-actions';
import {
  LayoutDashboard,
  Scissors,
  Users,
  CalendarCheck,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Servicios', href: '/admin/servicios', icon: Scissors },
  { label: 'Barberos', href: '/admin/barberos', icon: Users },
  { label: 'Turnos', href: '/admin/turnos', icon: CalendarCheck },
];

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // No mostrar sidebar en login
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#070707] text-zinc-100 font-sans flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#0a0a0a] border-r border-zinc-800/80 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-zinc-800/80">
          <h1 className="text-xl font-extrabold text-amber-100 tracking-tight">
            Benja Admin
          </h1>
          <p className="text-xs text-zinc-600 mt-1">Panel de Administración</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-600/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-zinc-800/80">
          <form action={logout}>
            <button
              type="submit"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5" />
              Cerrar Sesión
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-[#070707]/95 backdrop-blur border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-bold text-amber-100">Benja Admin</h1>
          <div className="w-6" /> {/* spacer */}
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
