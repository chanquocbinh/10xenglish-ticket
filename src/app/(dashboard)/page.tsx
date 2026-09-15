import { redirect } from 'next/navigation';
import { requirePageUser } from '@/core/server/page';
import { resolveLandingProject } from '@/modules/projects/projects.service';

export default async function LandingPage() {
  const user = await requirePageUser();
  const code = await resolveLandingProject(user);
  redirect(code ? `/${code}` : '/forbidden');
}
