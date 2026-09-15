import type { Prisma } from '@prisma/client';
import { prisma } from '@/core/db/prisma';
import type { CreateTicketInput, AddCommentInput } from '@/modules/tickets/tickets.schema';
import type { TicketStatus } from '@/modules/tickets/tickets.types';

/** Quan hệ cần cho danh sách ticket và dialog chi tiết. */
const ticketDetailInclude = {
  project: true,
  reporter: true,
  comments: { include: { user: true }, orderBy: { createdAt: 'asc' } },
  auditLogs: { include: { user: true }, orderBy: { createdAt: 'desc' } },
} satisfies Prisma.TicketInclude;

export function findManyByScope(where: Prisma.TicketWhereInput) {
  return prisma.ticket.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: ticketDetailInclude,
  });
}

export function findById(id: string) {
  return prisma.ticket.findUnique({ where: { id } });
}

export function create(input: CreateTicketInput & { reporterId: string }) {
  return prisma.ticket.create({
    data: {
      title: input.title,
      projectId: input.projectId,
      severity: input.severity,
      description: input.description,
      evidenceUrls: input.evidenceUrls,
      reporterId: input.reporterId,
      status: 'NEW',
    },
  });
}

export function updateStatus(id: string, status: TicketStatus) {
  return prisma.ticket.update({
    where: { id },
    data: { status },
  });
}

export function createComment(input: AddCommentInput & { userId: string }) {
  return prisma.comment.create({
    data: {
      ticketId: input.ticketId,
      userId: input.userId,
      content: input.content,
      attachments: input.attachments,
    },
    include: { user: true },
  });
}
