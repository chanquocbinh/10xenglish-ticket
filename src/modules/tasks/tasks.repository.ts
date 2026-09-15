import type { Prisma } from '@prisma/client';
import { prisma } from '@/core/db/prisma';
import type { TaskStatus, TaskType } from './tasks.types';

export interface CreateTaskRecord {
  title: string;
  projectId: string;
  sprintId?: string | null;
  type: TaskType;
  status: TaskStatus;
  storyPoints: number;
  assigneeId?: string | null;
  checklists?: Prisma.InputJsonValue;
}

/** Danh sách task kèm dự án + người thực hiện, mới nhất trước. */
export function findManyByScope(where: Prisma.TaskWhereInput) {
  return prisma.task.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      project: true,
      assignee: true,
    },
  });
}

export function findById(id: string) {
  return prisma.task.findUnique({ where: { id } });
}

export function create(data: CreateTaskRecord) {
  return prisma.task.create({ data });
}

export function updateStatus(id: string, status: TaskStatus) {
  return prisma.task.update({
    where: { id },
    data: { status },
  });
}

/** Gỡ task ra khỏi sprint đang chứa nó (đẩy về backlog). */
export function detachFromSprint(id: string) {
  return prisma.task.update({
    where: { id },
    data: { sprintId: null },
  });
}

/** Task của sprint đang chạy, dùng cho danh sách chọn task cần hoãn. */
export function findCurrentSprintTaskOptions() {
  return prisma.task.findMany({
    where: { sprint: { isCurrent: true } },
    select: {
      id: true,
      title: true,
      storyPoints: true,
      project: { select: { code: true } },
    },
    take: 10,
  });
}
