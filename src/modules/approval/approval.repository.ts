import { prisma } from '@/core/db/prisma';
import type { TaskStatus } from '@/modules/tasks/tasks.types';

/** Trạng thái ticket sau khi nghiệm thu. */
type SignedOffTicketStatus = 'APPROVED' | 'REJECTED';

/** Task đang chờ nghiệm thu (UAT). */
export function findPendingTasks() {
  return prisma.task.findMany({
    where: { status: 'PENDING_APPROVAL' },
    include: { project: true, assignee: true },
    orderBy: { updatedAt: 'desc' },
  });
}

/** Ticket đã fix, đang chờ nghiệm thu. */
export function findPendingTickets() {
  return prisma.ticket.findMany({
    where: { status: 'RESOLVED' },
    include: { project: true, reporter: true },
    orderBy: { updatedAt: 'desc' },
  });
}

export function updateTicketStatus(id: string, status: SignedOffTicketStatus) {
  return prisma.ticket.update({
    where: { id },
    data: { status },
  });
}

export function updateTaskSignoff(
  id: string,
  data: { status: TaskStatus; signoffReason: string | null },
) {
  return prisma.task.update({
    where: { id },
    data: { status: data.status, signoffReason: data.signoffReason },
  });
}
