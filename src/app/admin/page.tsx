import { getDashboardStats } from '@/app/actions/admin-actions';
import AdminDashboard from './AdminDashboard';

export default async function AdminPage() {
  const stats = await getDashboardStats();

  return <AdminDashboard stats={stats} />;
}
