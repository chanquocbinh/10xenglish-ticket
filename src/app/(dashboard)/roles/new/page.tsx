import { requirePagePermission } from '@/core/server/page';
import { RoleForm } from '@/modules/roles/components/RoleForm';

export default async function NewRolePage() {
  await requirePagePermission('roles.create', '/roles');

  return <RoleForm mode="create" />;
}
