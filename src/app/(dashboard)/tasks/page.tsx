import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { KanbanClientView } from './KanbanClientView';

export default async function TasksPage() {
  const cookieStore = await cookies();
  const activeProject = cookieStore.get('active_project')?.value || 'ALL';

  const projectWhere = activeProject === 'ALL' ? {} : { project: { code: activeProject as 'LMS' | 'CRM' } };

  const tasks = await prisma.task.findMany({
    where: projectWhere,
    orderBy: { createdAt: 'desc' },
    include: {
      project: true,
      assignee: true,
    },
  });

  const projects = await prisma.project.findMany({
    select: { id: true, code: true, name: true },
  });

  return <KanbanClientView initialTasks={tasks} projects={projects} />;
}
