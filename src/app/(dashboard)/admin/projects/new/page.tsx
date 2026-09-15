import { requirePagePermission } from '@/core/server/page';
import { ProjectForm } from '@/modules/projects/components/ProjectForm';

export default async function NewProjectPage() {
  await requirePagePermission('projects.create', '/admin/projects');
  return <ProjectForm mode="create" />;
}
