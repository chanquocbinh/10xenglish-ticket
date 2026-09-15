import { notFound } from 'next/navigation';
import { requirePagePermission } from '@/core/server/page';
import { getProjectByCode } from '@/modules/projects/projects.service';
import { getDashboardData } from '@/modules/dashboard/dashboard.service';
import { DashboardOverview } from '@/modules/dashboard/components/DashboardOverview';

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ projectCode: string }>;
}) {
  await requirePagePermission('dashboard.view');
  const { projectCode } = await params;
  const project = await getProjectByCode(decodeURIComponent(projectCode).toUpperCase());
  if (!project) notFound();

  const dashboardData = await getDashboardData(project.id);
  return <DashboardOverview {...dashboardData} />;
}
