import { redirect } from 'next/navigation';
import { requirePageUser } from '@/core/server/page';
import { AppError } from '@/core/errors';
import { requireProjectAccess } from '@/modules/projects/projects.service';

export default async function ProjectScopedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectCode: string }>;
}) {
  const user = await requirePageUser();
  const { projectCode } = await params;

  try {
    await requireProjectAccess(user, decodeURIComponent(projectCode).toUpperCase());
  } catch (error) {
    if (error instanceof AppError) redirect('/forbidden');
    throw error;
  }

  return <>{children}</>;
}
