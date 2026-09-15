import { findRecentAuditLogs, writeAuditLog } from '@/core/audit/audit.service';
import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { hasPermission } from '@/core/auth/permissions';
import { ForbiddenError, ValidationError } from '@/core/errors';
import * as approvalRepository from './approval.repository';
import type { SignOffData } from './approval.schema';

const SIGNOFF_AUDIT_ACTIONS = ['APPROVE_SIGNOFF', 'REJECT_SIGNOFF'];

/** Hàng chờ nghiệm thu: task UAT, ticket đã fix và lịch sử sign-off gần nhất. */
export async function getApprovalQueue() {
  const [pendingTasks, pendingTickets, auditLogs] = await Promise.all([
    approvalRepository.findPendingTasks(),
    approvalRepository.findPendingTickets(),
    findRecentAuditLogs({ actions: SIGNOFF_AUDIT_ACTIONS, take: 10 }),
  ]);

  return { pendingTasks, pendingTickets, auditLogs };
}

/**
 * Ký duyệt nghiệm thu: chỉ Ban Quản Lý được thực hiện, từ chối thì buộc
 * nêu lý do rõ ràng và mọi quyết định đều được lưu vết audit.
 */
export async function signOff(actor: AuthJWTPayload, input: SignOffData) {
  const required = input.targetType === 'TICKET' ? 'tickets.approve' : 'tasks.approve';
  if (!hasPermission(actor, required)) {
    throw new ForbiddenError('Bạn không có quyền phê duyệt nghiệm thu mục này');
  }

  const isApprove = input.action === 'APPROVE';
  if (!isApprove && (!input.reason || input.reason.trim().length < 5)) {
    throw new ValidationError('Vui lòng nhập lý do từ chối nghiệm thu rõ ràng (tối thiểu 5 ký tự)');
  }

  if (input.targetType === 'TICKET') {
    await approvalRepository.updateTicketStatus(input.targetId, isApprove ? 'APPROVED' : 'REJECTED');
  } else {
    await approvalRepository.updateTaskSignoff(input.targetId, {
      status: isApprove ? 'DONE' : 'IN_PROGRESS',
      signoffReason: isApprove ? null : input.reason ?? null,
    });
  }

  await writeAuditLog({
    ticketId: input.targetType === 'TICKET' ? input.targetId : null,
    userId: actor.sub,
    action: isApprove ? 'APPROVE_SIGNOFF' : 'REJECT_SIGNOFF',
    detail: `${actor.fullName} (${actor.roleName}) đã ${isApprove ? 'CHẤP THUẬN NGHIỆM THU' : 'YÊU CẦU SỬA LẠI'}: ${input.reason ? `"${input.reason}"` : 'Đạt yêu cầu UAT'}`,
  });
}
