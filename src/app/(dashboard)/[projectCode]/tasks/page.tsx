import { notFound } from 'next/navigation';
import { requirePagePermission } from '@/core/server/page';
import { getProjectByCode, listProjectOptions } from '@/modules/projects/projects.service';
import { listTasks } from '@/modules/tasks/tasks.service';
import { KanbanBoardView } from '@/modules/tasks/components/KanbanBoardView';

export default async function TasksPage({
  params,
}: {
  params: Promise<{ projectCode: string }>;
}) {
  await requirePagePermission('tasks.view');
  const { projectCode } = await params;
  const project = await getProjectByCode(decodeURIComponent(projectCode).toUpperCase());
  if (!project) notFound();

  const [tasks, projects] = await Promise.all([listTasks(project.id), listProjectOptions()]);
  return <KanbanBoardView initialTasks={tasks} projects={projects} />;
}
