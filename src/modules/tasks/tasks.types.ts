/** Trạng thái task trên Kanban (khớp enum TaskStatus của Prisma). */
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'DONE';

/** Loại task: trong kế hoạch Sprint hoặc do sếp yêu cầu chen ngang. */
export type TaskType = 'PLANNED' | 'UNPLANNED_BOSS';

/** View model của một thẻ task hiển thị trên Kanban Board. */
export interface TaskItem {
  id: string;
  title: string;
  type: TaskType;
  status: TaskStatus;
  storyPoints: number;
  project: { code: string; name: string };
  assignee: { fullName: string } | null;
  checklists: unknown;
  signoffReason: string | null;
  createdAt?: Date;
}

/** Task của Sprint hiện tại dùng cho danh sách chọn task cần hoãn. */
export interface SprintTaskOption {
  id: string;
  title: string;
  storyPoints: number;
  project: { code: string };
}
