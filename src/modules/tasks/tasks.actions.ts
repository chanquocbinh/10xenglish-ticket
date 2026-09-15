'use server';

import { revalidatePath } from 'next/cache';
import { requirePermission, runAction } from '@/core/server/action';
import {
  createTaskSchema,
  swapSprintTaskSchema,
  updateTaskStatusSchema,
  type CreateTaskInput,
  type SwapSprintTaskInput,
} from './tasks.schema';
import * as tasksService from './tasks.service';
import type { TaskStatus } from './tasks.types';

export async function createTaskAction(input: CreateTaskInput) {
  return runAction(async () => {
    const actor = await requirePermission('tasks.create');
    await tasksService.createTask(actor, createTaskSchema.parse(input));

    revalidatePath('/tasks');
    revalidatePath('/sprints');
  });
}

export async function updateTaskStatusAction(taskId: string, status: TaskStatus) {
  return runAction(async () => {
    const actor = await requirePermission('tasks.update');
    await tasksService.updateTaskStatus(actor, updateTaskStatusSchema.parse({ taskId, status }));

    revalidatePath('/tasks');
    revalidatePath('/approval');
    revalidatePath('/');
  });
}

export async function swapSprintTaskAction(input: SwapSprintTaskInput) {
  return runAction(async () => {
    const actor = await requirePermission('sprints.update');
    await tasksService.swapSprintTask(actor, swapSprintTaskSchema.parse(input));

    revalidatePath('/tasks');
    revalidatePath('/sprints');
    revalidatePath('/');
  });
}
