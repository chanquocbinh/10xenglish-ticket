import { prisma } from '@/core/db/prisma';

export interface AuditEntry {
  userId: string;
  action: string;
  detail: string;
  ticketId?: string | null;
}

/**
 * Ghi lưu vết nghiệm thu. Mọi module dùng chung hàm này để định dạng
 * audit log đồng nhất, không tự gọi prisma.auditLog.
 */
export async function writeAuditLog(entry: AuditEntry) {
  await prisma.auditLog.create({
    data: {
      userId: entry.userId,
      action: entry.action,
      detail: entry.detail,
      ticketId: entry.ticketId ?? null,
    },
  });
}

export function findRecentAuditLogs(params: { take?: number; actions?: string[] } = {}) {
  const { take = 10, actions } = params;
  return prisma.auditLog.findMany({
    where: actions ? { action: { in: actions } } : undefined,
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take,
  });
}
