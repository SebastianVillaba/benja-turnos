import AdminLayoutClient from './AdminLayoutClient';

export const metadata = {
  title: 'Admin — Benja Barber & Academy',
  description: 'Panel de administración de Benja Barber & Academy',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
