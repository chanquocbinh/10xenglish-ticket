import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { UserClientView } from './UserClientView';
import { redirect } from 'next/navigation';

export default async function UsersPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser || (currentUser.role !== 'DEV_ADMIN' && currentUser.role !== 'MANAGER')) {
    redirect('/');
  }

  const users = await prisma.user.findMany({
    include: { department: true },
    orderBy: { createdAt: 'desc' },
  });

  const departments = await prisma.department.findMany({
    orderBy: { name: 'asc' },
  });

  return (
    <UserClientView
      initialUsers={users}
      departments={departments}
      currentUserRole={currentUser.role}
    />
  );
}
