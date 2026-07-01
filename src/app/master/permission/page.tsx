import { PermissionPageClient } from '@/modules/master/components/PermissionPageClient';

export const metadata = {
  title: 'Master Permission - PPDS ERP',
  description: 'Manajemen hak akses granular',
};

export default function MasterPermissionPage() {
  return <PermissionPageClient />;
}
