/** Mức độ nghiêm trọng của bug (khớp enum TicketSeverity của Prisma). */
export type TicketSeverity = 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW';

/** Trạng thái xử lý ticket (khớp enum TicketStatus của Prisma). */
export type TicketStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'APPROVED' | 'CLOSED' | 'REJECTED';

export type TicketComment = {
  id: string;
  content: string;
  createdAt: Date;
  user: { fullName: string };
};

export type TicketAuditLog = {
  id: string;
  detail: string;
  createdAt: Date;
  user: { fullName: string };
};

/** View model của một ticket kèm quan hệ, dùng cho danh sách và dialog chi tiết. */
export type TicketWithDetails = {
  id: string;
  ticketNumber: number;
  title: string;
  severity: TicketSeverity;
  status: TicketStatus;
  description: string | null;
  evidenceUrls: string[];
  createdAt: Date;
  project: { code: string; name: string };
  reporter: { fullName: string };
  comments: TicketComment[];
  auditLogs: TicketAuditLog[];
};
