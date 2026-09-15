import { notFound } from 'next/navigation';
import { requirePagePermission } from '@/core/server/page';
import { getProjectByCode, listProjectOptions } from '@/modules/projects/projects.service';
import { getSprintBoard } from '@/modules/sprints/sprints.service';
import { SprintBoardView } from '@/modules/sprints/components/SprintBoardView';

export default async function SprintsPage({
  params,
}: {
  params: Promise<{ projectCode: string }>;
}) {
  await requirePagePermission('sprints.view');
  const { projectCode } = await params;
  const project = await getProjectByCode(decodeURIComponent(projectCode).toUpperCase());
  if (!project) notFound();

  const [sprintBoard, projects] = await Promise.all([
    getSprintBoard(project.id),
    listProjectOptions(),
  ]);
  return <SprintBoardView {...sprintBoard} projects={projects} />;
}
