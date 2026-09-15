import { writeAuditLog } from '@/core/audit/audit.service';
import { hasPermission } from '@/core/auth/permissions';
import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { ForbiddenError, NotFoundError } from '@/core/errors';
import * as ticketsRepository from '@/modules/tickets/tickets.repository';
import type {
  AddCommentInput,
  CreateTicketInput,
  UpdateTicketStatusInput,
} from '@/modules/tickets/tickets.schema';

/** Danh sách ticket của một dự án, mới nhất trước. */
export function listTickets(projectId: string) {
  return ticketsRepository.findManyByScope({ projectId });
}

export async function createTicket(actor: AuthJWTPayload, input: CreateTicketInput) {
  const ticket = await ticketsRepository.create({ ...input, reporterId: actor.sub });

  await writeAuditLog({
    ticketId: ticket.id,
    userId: actor.sub,
    action: 'CREATE_TICKET',
    detail: `${actor.fullName} đã tạo ticket #${ticket.ticketNumber}: ${ticket.title}`,
  });

  return ticket;
}

export async function updateTicketStatus(actor: AuthJWTPayload, input: UpdateTicketStatusInput) {
  if (input.status === 'APPROVED' && !hasPermission(actor, 'tickets.approve')) {
    throw new ForbiddenError(
      'Bạn không có quyền chuyển trạng thái sang "Đã nghiệm thu"',
    );
  }

  const current = await ticketsRepository.findById(input.ticketId);
  if (!current) throw new NotFoundError('Không tìm thấy ticket');

  const updated = await ticketsRepository.updateStatus(input.ticketId, input.status);

  await writeAuditLog({
    ticketId: input.ticketId,
    userId: actor.sub,
    action: 'UPDATE_STATUS',
    detail: `${actor.fullName} chuyển trạng thái từ "${current.status}" sang "${input.status}"${
      input.note ? `: ${input.note}` : ''
    }`,
  });

  return updated;
}

export function addComment(actor: AuthJWTPayload, input: AddCommentInput) {
  return ticketsRepository.createComment({ ...input, userId: actor.sub });
}
