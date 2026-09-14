import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { SprintClientView } from './SprintClientView';

export default async function SprintsPage() {
  const cookieStore = await cookies();
  const activeProject = cookieStore.get('active_project')?.value || 'ALL';

  const projectWhere = activeProject === 'ALL' ? {} : { project: { code: activeProject as 'LMS' | 'CRM' } };

  const currentSprint = await prisma.sprint.findFirst({
    where: { isCurrent: true },
    include: {
      tasks: {
        where: projectWhere,
        include: { project: true },
      },
    },
  });

  const backlogTasks = await prisma.task.findMany({
    where: {
      ...projectWhere,
      sprintId: null,
    },
    include: { project: true },
    orderBy: { createdAt: 'desc' },
  });

  const projects = await prisma.project.findMany({
    select: { id: true, code: true, name: true },
  });

  return (
    <SprintClientView
      currentSprint={currentSprint}
      backlogTasks={backlogTasks}
      projects={projects}
    />
  );
}
