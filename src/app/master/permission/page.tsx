import { PermissionPageClient } from '@/modules/master/permission/components/PermissionPageClient';

export const metadata = {
  title: 'Master Permission - PPDS ERP',
  description: 'Manajemen hak akses granular',
};

export default function MasterPermissionPage() {
  return <PermissionPageClient />;
}
