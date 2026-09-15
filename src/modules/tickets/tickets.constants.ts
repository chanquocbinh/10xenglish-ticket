import type { TicketSeverity, TicketStatus } from '@/modules/tickets/tickets.types';

/** Bộ lọc mức độ nghiêm trọng trên thanh công cụ danh sách ticket. */
export const SEVERITY_OPTIONS: { value: TicketSeverity; label: string }[] = [
  { value: 'BLOCKER', label: 'Blocker (Cháy)' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

/** Trạng thái hiển thị cho cả bộ lọc và dropdown cập nhật nhanh. */
export const STATUS_OPTIONS: { value: TicketStatus; label: string }[] = [
  { value: 'NEW', label: 'Mới tiếp nhận' },
  { value: 'IN_PROGRESS', label: 'Đang xử lý' },
  { value: 'RESOLVED', label: 'Đã fix (Chờ test)' },
  { value: 'APPROVED', label: 'Đã nghiệm thu' },
  { value: 'CLOSED', label: 'Đóng' },
];

/** Màu điểm tròn chỉ thị mức độ nghiêm trọng. */
export const SEVERITY_DOT_COLOR: Record<TicketSeverity, string> = {
  BLOCKER: '#d32f2f',
  HIGH: '#ea580c',
  MEDIUM: '#eab308',
  LOW: '#94a3b8',
};

/** Màu chữ mức độ nghiêm trọng. */
export const SEVERITY_TEXT_COLOR: Record<TicketSeverity, string> = {
  BLOCKER: '#d32f2f',
  HIGH: '#c2410c',
  MEDIUM: 'text.primary',
  LOW: 'text.primary',
};

/** Màu điểm tròn chỉ thị trạng thái. */
export const STATUS_DOT_COLOR: Record<TicketStatus, string> = {
  NEW: '#64748b',
  IN_PROGRESS: 'var(--color-primary)',
  RESOLVED: '#ea580c',
  APPROVED: '#2e7d32',
  CLOSED: '#475569',
  REJECTED: '#475569',
};

/** Màu chữ trạng thái trong dropdown cập nhật nhanh. */
export const STATUS_TEXT_COLOR: Record<TicketStatus, string> = {
  NEW: 'text.secondary',
  IN_PROGRESS: 'primary.main',
  RESOLVED: 'warning.dark',
  APPROVED: 'success.main',
  CLOSED: 'text.secondary',
  REJECTED: 'text.secondary',
};
