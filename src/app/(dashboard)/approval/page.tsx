import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { ApprovalClientView } from './ApprovalClientView';
import { redirect } from 'next/navigation';

export default async function ApprovalPage() {
  const currentUser = await getCurrentUser();
  if (!currentUser) redirect('/login');

  // Lấy các task đang ở trạng thái PENDING_APPROVAL
  const pendingTasks = await prisma.task.findMany({
    where: { status: 'PENDING_APPROVAL' },
    include: { project: true, assignee: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Lấy các ticket đang ở trạng thái RESOLVED (Chờ nghiệm thu)
  const pendingTickets = await prisma.ticket.findMany({
    where: { status: 'RESOLVED' },
    include: { project: true, reporter: true },
    orderBy: { updatedAt: 'desc' },
  });

  // Lấy lịch sử nghiệm thu trong AuditLog
  const auditLogs = await prisma.auditLog.findMany({
    where: {
      action: { in: ['APPROVE_SIGNOFF', 'REJECT_SIGNOFF'] },
    },
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  return (
    <ApprovalClientView
      currentUser={currentUser}
      pendingTasks={pendingTasks}
      pendingTickets={pendingTickets}
      auditLogs={auditLogs}
    />
  );
}
