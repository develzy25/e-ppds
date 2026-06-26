import { RolePageClient } from '@/modules/master/role/components/RolePageClient';

export const metadata = {
  title: 'Master Role - PPDS ERP',
  description: 'Manajemen hak akses dan role sistem',
};

export default function MasterRolePage() {
  return <RolePageClient />;
}
