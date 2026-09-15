import type { Prisma } from '@prisma/client';
import { prisma } from '@/core/db/prisma';
import type { SprintWithTasks, TaskWithProject } from './sprints.types';

/** Sprint đang chạy kèm danh sách task đã lọc theo phạm vi dự án. */
export function findCurrentSprintWithTasks(
  taskWhere: Prisma.TaskWhereInput,
): Promise<SprintWithTasks | null> {
  return prisma.sprint.findFirst({
    where: { isCurrent: true },
    include: {
      tasks: {
        where: taskWhere,
        include: { project: true },
      },
    },
  });
}

/** Task chưa gắn sprint nào (Product Backlog). */
export function findBacklogTasks(where: Prisma.TaskWhereInput): Promise<TaskWithProject[]> {
  return prisma.task.findMany({
    where: {
      ...where,
      sprintId: null,
    },
    include: { project: true },
    orderBy: { createdAt: 'desc' },
  });
}
