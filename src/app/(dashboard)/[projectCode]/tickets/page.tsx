import { notFound } from 'next/navigation';
import { requirePagePermission } from '@/core/server/page';
import { getProjectByCode } from '@/modules/projects/projects.service';
import { listTickets } from '@/modules/tickets/tickets.service';
import { TicketListView } from '@/modules/tickets/components/TicketListView';

export default async function TicketsPage({
  params,
}: {
  params: Promise<{ projectCode: string }>;
}) {
  const currentUser = await requirePagePermission('tickets.view');
  const { projectCode } = await params;
  const project = await getProjectByCode(decodeURIComponent(projectCode).toUpperCase());
  if (!project) notFound();

  const tickets = await listTickets(project.id);
  return <TicketListView initialTickets={tickets} currentUser={currentUser} />;
}
