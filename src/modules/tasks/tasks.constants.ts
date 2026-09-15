import type { TaskStatus } from './tasks.types';

export interface KanbanColumn {
  key: TaskStatus;
  label: string;
  headerColor: string;
}

/** 4 cột của Kanban Board, đồng thời là thứ tự luồng xử lý của task. */
export const KANBAN_COLUMNS: KanbanColumn[] = [
  { key: 'TODO', label: 'CẦN LÀM (TO DO)', headerColor: '#64748b' },
  { key: 'IN_PROGRESS', label: 'ĐANG LÀM (IN PROGRESS)', headerColor: 'var(--color-primary)' },
  { key: 'PENDING_APPROVAL', label: 'CHỜ DUYỆT (UAT)', headerColor: '#ed6c02' },
  { key: 'DONE', label: 'ĐÃ XONG (DONE)', headerColor: '#2e7d32' },
];

const STATUS_FLOW: TaskStatus[] = KANBAN_COLUMNS.map((column) => column.key);

/** Trạng thái kế tiếp khi đẩy task sang phải; `null` nếu đã ở cột cuối. */
export function nextStatus(status: TaskStatus): TaskStatus | null {
  return STATUS_FLOW[STATUS_FLOW.indexOf(status) + 1] ?? null;
}

/** Trạng thái trước đó khi trả task về bên trái; `null` nếu đã ở cột đầu. */
export function previousStatus(status: TaskStatus): TaskStatus | null {
  const index = STATUS_FLOW.indexOf(status);
  return index > 0 ? STATUS_FLOW[index - 1] : null;
}
