import { requirePagePermission } from '@/core/server/page';
import { listDepartmentOptions } from '@/modules/users/users.service';
import { listRoleOptions } from '@/modules/roles/roles.service';
import { NewUserForm } from '@/modules/users/components/NewUserForm';

export default async function NewUserPage() {
  await requirePagePermission('users.create', '/users');

  const [departments, roles] = await Promise.all([listDepartmentOptions(), listRoleOptions()]);

  return <NewUserForm departments={departments} roles={roles} />;
}
