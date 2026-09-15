import { notFound } from 'next/navigation';
import { requirePagePermission } from '@/core/server/page';
import { hasPermission } from '@/core/auth/permissions';
import { NotFoundError } from '@/core/errors';
import { getUserDetail } from '@/modules/users/users.service';
import { listRoleOptions } from '@/modules/roles/roles.service';
import {
  getUserProjectAssignment,
  listActiveProjects,
} from '@/modules/projects/projects.service';
import { UserDetailForm } from '@/modules/users/components/UserDetailForm';
import { UserProjectsPanel } from '@/modules/projects/components/UserProjectsPanel';
import Box from '@mui/material/Box';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const currentUser = await requirePagePermission('users.update', '/users');

  const { id } = await params;
  const canManageProjects = hasPermission(currentUser, 'projects.manageMembers');

  const [user, roles, allProjects, assignment] = await Promise.all([
    getUserDetail(id).catch((error: unknown) => {
      if (error instanceof NotFoundError) notFound();
      throw error;
    }),
    listRoleOptions(),
    canManageProjects ? listActiveProjects() : Promise.resolve([]),
    canManageProjects
      ? getUserProjectAssignment(id)
      : Promise.resolve({ memberProjectIds: [] as string[], defaultProjectId: null }),
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <UserDetailForm user={user} roles={roles} />
      {canManageProjects && (
        <UserProjectsPanel
          userId={id}
          allProjects={allProjects}
          memberProjectIds={assignment.memberProjectIds}
          defaultProjectId={assignment.defaultProjectId}
        />
      )}
    </Box>
  );
}
