import { requirePagePermission } from '@/core/server/page';
import { listUsers } from '@/modules/users/users.service';
import { UserListView } from '@/modules/users/components/UserListView';

export default async function UsersPage() {
  const currentUser = await requirePagePermission('users.view');
  const users = await listUsers();

  return <UserListView initialUsers={users} currentUser={currentUser} />;
}
