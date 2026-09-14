import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(5, 'Tiêu đề nhiệm vụ tối thiểu 5 ký tự').max(200),
  projectId: z.string().min(1, 'Vui lòng chọn Dự án'),
  sprintId: z.string().optional(),
  type: z.enum(['PLANNED', 'UNPLANNED_BOSS']).default('PLANNED'),
  storyPoints: z.number().int().min(1).max(13, 'Story Points từ 1 đến 13 SP'),
  assigneeId: z.string().optional(),
  checklists: z.array(z.object({
    title: z.string().min(1),
    completed: z.boolean().default(false),
  })).optional().default([]),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'PENDING_APPROVAL', 'DONE']),
});

export const swapSprintTaskSchema = z.object({
  title: z.string().min(5, 'Tiêu đề nhiệm vụ mới tối thiểu 5 ký tự'),
  projectId: z.string().min(1),
  storyPoints: z.number().int().min(1).max(13),
  postponedTaskId: z.string().min(1, 'Vui lòng chọn task cần đẩy lùi sang Sprint sau'),
  bossReason: z.string().min(5, 'Lý do điều chỉnh kế hoạch Sprint tối thiểu 5 ký tự'),
});
