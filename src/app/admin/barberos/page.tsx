import { getBarbersAdmin } from '@/app/actions/admin-actions';
import BarberosClient from './BarberosClient';

export default async function BarberosPage() {
  const barbers = await getBarbersAdmin();

  return <BarberosClient initialBarbers={barbers} />;
}
