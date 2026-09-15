import { requirePagePermission } from '@/core/server/page';
import { listRoles } from '@/modules/roles/roles.service';
import { RoleListView } from '@/modules/roles/components/RoleListView';

export default async function RolesPage() {
  await requirePagePermission('roles.view');

  const roles = await listRoles();

  return <RoleListView initialRoles={roles} />;
}
