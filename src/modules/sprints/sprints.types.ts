import type { Prisma } from '@prisma/client';

/** Sprint kèm danh sách task (mỗi task kèm dự án). */
export type SprintWithTasks = Prisma.SprintGetPayload<{
  include: { tasks: { include: { project: true } } };
}>;

/** Task kèm dự án, dùng cho Product Backlog. */
export type TaskWithProject = Prisma.TaskGetPayload<{ include: { project: true } }>;

/** Dữ liệu bảng sprint: sprint hiện hành + kho backlog. */
export interface SprintBoard {
  currentSprint: SprintWithTasks | null;
  backlogTasks: TaskWithProject[];
}
