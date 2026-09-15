import { notFound } from 'next/navigation';
import { requirePagePermission } from '@/core/server/page';
import { NotFoundError } from '@/core/errors';
import { getProjectDetail } from '@/modules/projects/projects.service';
import { listUsers } from '@/modules/users/users.service';
import { ProjectForm } from '@/modules/projects/components/ProjectForm';
import { ProjectMembersPanel } from '@/modules/projects/components/ProjectMembersPanel';

import Box from '@mui/material/Box';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requirePagePermission('projects.update', '/admin/projects');
  const { id } = await params;

  const [project, users] = await Promise.all([
    getProjectDetail(id).catch((error: unknown) => {
      if (error instanceof NotFoundError) notFound();
      throw error;
    }),
    listUsers(),
  ]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <ProjectForm mode="edit" project={project} />
      <ProjectMembersPanel
        project={project}
        users={users.map((u) => ({ id: u.id, fullName: u.fullName, username: u.username }))}
      />
    </Box>
  );
}
