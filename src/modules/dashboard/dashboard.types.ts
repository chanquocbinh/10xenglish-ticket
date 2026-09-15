import type { Prisma } from '@prisma/client';

/** Ticket kèm người báo lỗi và dự án. */
export type DashboardTicket = Prisma.TicketGetPayload<{
  include: { reporter: true; project: true };
}>;

/** Task kèm dự án. */
export type DashboardTask = Prisma.TaskGetPayload<{ include: { project: true } }>;

/** Sprint hiện hành kèm toàn bộ task. */
export type DashboardSprint = Prisma.SprintGetPayload<{ include: { tasks: true } }>;

/** Lưu vết nghiệm thu kèm người thực hiện. */
export type DashboardAuditLog = Prisma.AuditLogGetPayload<{ include: { user: true } }>;

/** Toàn bộ số liệu và danh sách hiển thị trên trang tổng quan. */
export interface DashboardData {
  pendingBugsCount: number;
  blockerBugsCount: number;
  pendingApprovalCount: number;
  totalTasks: number;
  doneTasks: number;
  progressPercent: number;
  currentSprint: DashboardSprint | null;
  recentTickets: DashboardTicket[];
  pendingApprovalTasks: DashboardTask[];
  recentAuditLogs: DashboardAuditLog[];
}
