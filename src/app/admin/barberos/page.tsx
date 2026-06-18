import { getBarbersAdmin } from '@/app/actions/admin-actions';
import { getBranches } from '@/app/actions/actions';
import BarberosClient from './BarberosClient';

export const dynamic = 'force-dynamic';

export default async function BarberosPage() {
  const barbers = await getBarbersAdmin();
  const branches = await getBranches();

  return <BarberosClient initialBarbers={barbers} branches={branches} />;
}
