import type { Prisma, TicketStatus } from '@prisma/client';
import { prisma } from '@/core/db/prisma';
import type { DashboardSprint, DashboardTask, DashboardTicket } from './dashboard.types';

/** Bug được coi là "đang mở" khi chưa fix xong. */
const OPEN_TICKET_STATUSES: TicketStatus[] = ['NEW', 'IN_PROGRESS'];

export function countOpenTickets(where: Prisma.TicketWhereInput): Promise<number> {
  return prisma.ticket.count({
    where: {
      ...where,
      status: { in: OPEN_TICKET_STATUSES },
    },
  });
}

export function countOpenBlockerTickets(where: Prisma.TicketWhereInput): Promise<number> {
  return prisma.ticket.count({
    where: {
      ...where,
      status: { in: OPEN_TICKET_STATUSES },
      severity: 'BLOCKER',
    },
  });
}

export function countTasks(where: Prisma.TaskWhereInput): Promise<number> {
  return prisma.task.count({ where });
}

export function countDoneTasks(where: Prisma.TaskWhereInput): Promise<number> {
  return prisma.task.count({ where: { ...where, status: 'DONE' } });
}

export function countPendingApprovalTasks(where: Prisma.TaskWhereInput): Promise<number> {
  return prisma.task.count({ where: { ...where, status: 'PENDING_APPROVAL' } });
}

/** Sprint đang chạy (không lọc dự án) kèm toàn bộ task để hiển thị Sprint Goal. */
export function findCurrentSprint(): Promise<DashboardSprint | null> {
  return prisma.sprint.findFirst({
    where: { isCurrent: true },
    include: { tasks: true },
  });
}

/** 5 bug mới nhất trong phạm vi dự án. */
export function findRecentTickets(where: Prisma.TicketWhereInput): Promise<DashboardTicket[]> {
  return prisma.ticket.findMany({
    where,
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { reporter: true, project: true },
  });
}

/** 5 task đang chờ sếp nghiệm thu. */
export function findPendingApprovalTasks(where: Prisma.TaskWhereInput): Promise<DashboardTask[]> {
  return prisma.task.findMany({
    where: {
      ...where,
      status: 'PENDING_APPROVAL',
    },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { project: true },
  });
}
