'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createTicketSchema, updateTicketStatusSchema, addCommentSchema } from '@/lib/validations/ticket.schema';
import { revalidatePath } from 'next/cache';

export async function createTicketAction(data: {
  projectId: string;
  title: string;
  submodule: string;
  affectedRole: string;
  severity: 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  evidenceUrls?: string[];
}) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const parsed = createTicketSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Dữ liệu không hợp lệ' };
  }

  const ticket = await prisma.ticket.create({
    data: {
      title: data.title,
      projectId: data.projectId,
      submodule: data.submodule,
      affectedRole: data.affectedRole,
      severity: data.severity,
      description: data.description,
      evidenceUrls: data.evidenceUrls || [],
      reporterId: user.sub,
      status: 'NEW',
    },
  });

  await prisma.auditLog.create({
    data: {
      ticketId: ticket.id,
      userId: user.sub,
      action: 'CREATE_TICKET',
      detail: `${user.fullName} đã tạo ticket #${ticket.ticketNumber}: ${ticket.title}`,
    },
  });

  revalidatePath('/tickets');
  revalidatePath('/');
  return { success: true, ticket };
}

export async function updateTicketStatusAction(ticketId: string, status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'APPROVED' | 'CLOSED' | 'REJECTED', note?: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const parsed = updateTicketStatusSchema.safeParse({ ticketId, status, note });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const oldTicket = await prisma.ticket.findUnique({ where: { id: ticketId } });
  if (!oldTicket) return { error: 'Không tìm thấy ticket' };

  const updated = await prisma.ticket.update({
    where: { id: ticketId },
    data: { status },
  });

  await prisma.auditLog.create({
    data: {
      ticketId,
      userId: user.sub,
      action: 'UPDATE_STATUS',
      detail: `${user.fullName} chuyển trạng thái từ "${oldTicket.status}" sang "${status}"${note ? `: ${note}` : ''}`,
    },
  });

  revalidatePath('/tickets');
  revalidatePath('/approval');
  revalidatePath('/');
  return { success: true, ticket: updated };
}

export async function addCommentAction(ticketId: string, content: string, attachments: string[] = []) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const parsed = addCommentSchema.safeParse({ ticketId, content, attachments });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const comment = await prisma.comment.create({
    data: {
      ticketId,
      userId: user.sub,
      content,
      attachments,
    },
    include: { user: true },
  });

  revalidatePath('/tickets');
  return { success: true, comment };
}
