import { requirePagePermission } from '@/core/server/page';
import { listProjects } from '@/modules/projects/projects.service';
import { ProjectListView } from '@/modules/projects/components/ProjectListView';

export default async function ProjectsAdminPage() {
  await requirePagePermission('projects.view');
  const projects = await listProjects();
  return <ProjectListView projects={projects} />;
}
