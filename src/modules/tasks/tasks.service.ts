import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { writeAuditLog } from '@/core/audit/audit.service';
import { hasPermission } from '@/core/auth/permissions';
import { ForbiddenError, NotFoundError } from '@/core/errors';
import * as taskRepository from './tasks.repository';
import type { CreateTaskData, SwapSprintTaskData, UpdateTaskStatusData } from './tasks.schema';

export function listTasks(projectId: string) {
  return taskRepository.findManyByScope({ projectId });
}

export function listCurrentSprintTaskOptions() {
  return taskRepository.findCurrentSprintTaskOptions();
}

export async function createTask(actor: AuthJWTPayload, input: CreateTaskData) {
  const task = await taskRepository.create({
    title: input.title,
    projectId: input.projectId,
    sprintId: input.sprintId,
    type: input.type,
    status: 'TODO',
    storyPoints: input.storyPoints,
    assigneeId: input.assigneeId,
    checklists: input.checklists,
  });

  await writeAuditLog({
    userId: actor.sub,
    action: 'CREATE_TASK',
    detail: `${actor.fullName} đã thêm task: "${task.title}" (${task.storyPoints} SP - ${task.type})`,
  });

  return task;
}

export function updateTaskStatus(actor: AuthJWTPayload, input: UpdateTaskStatusData) {
  if (input.status === 'DONE' && !hasPermission(actor, 'tasks.approve')) {
    throw new ForbiddenError('Bạn không có quyền nghiệm thu task');
  }
  return taskRepository.updateStatus(input.taskId, input.status);
}

/**
 * Bảo vệ năng lực Sprint: muốn chen một việc đột xuất vào Sprint thì phải
 * đẩy một task đang cam kết ra khỏi Sprint, và ghi lại lý do điều chỉnh.
 */
export async function swapSprintTask(actor: AuthJWTPayload, input: SwapSprintTaskData) {
  const postponedTask = await taskRepository.findById(input.postponedTaskId);
  if (!postponedTask) throw new NotFoundError('Không tìm thấy task cần đẩy lùi');

  const newTask = await taskRepository.create({
    title: input.title,
    projectId: input.projectId,
    sprintId: postponedTask.sprintId,
    type: 'UNPLANNED_BOSS',
    status: 'TODO',
    storyPoints: input.storyPoints,
    assigneeId: actor.sub,
  });

  await taskRepository.detachFromSprint(postponedTask.id);

  await writeAuditLog({
    userId: actor.sub,
    action: 'SWAP_SPRINT_TASK',
    detail: `${actor.fullName} đã thêm việc đột xuất "${input.title}" (${input.storyPoints} SP) và hoãn task "${postponedTask.title}" (${postponedTask.storyPoints} SP) sang Sprint sau. Lý do: "${input.bossReason}"`,
  });

  return newTask;
}
