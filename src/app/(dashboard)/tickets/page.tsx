import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { TicketClientView } from './TicketClientView';

export default async function TicketsPage() {
  const cookieStore = await cookies();
  const activeProject = cookieStore.get('active_project')?.value || 'ALL';

  const projectWhere = activeProject === 'ALL' ? {} : { project: { code: activeProject as 'LMS' | 'CRM' } };

  const tickets = await prisma.ticket.findMany({
    where: projectWhere,
    orderBy: { createdAt: 'desc' },
    include: {
      project: true,
      reporter: true,
      comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
      auditLogs: { include: { user: true }, orderBy: { createdAt: 'desc' } },
    },
  });

  return <TicketClientView initialTickets={tickets} />;
}
