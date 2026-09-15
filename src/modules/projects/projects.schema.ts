import { z } from 'zod';

export const createProjectSchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^[A-Z][A-Z0-9]{1,15}$/, 'Mã dự án viết HOA, 2-16 ký tự (chữ/số, bắt đầu bằng chữ)'),
  name: z.string().trim().min(2, 'Tên dự án tối thiểu 2 ký tự'),
  description: z.string().trim().optional(),
});

export const updateProjectSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().trim().min(2, 'Tên dự án tối thiểu 2 ký tự'),
  description: z.string().trim().optional(),
  isActive: z.boolean(),
});

export const setUserProjectsSchema = z.object({
  userId: z.string().uuid(),
  projectIds: z.array(z.string().uuid()),
  defaultProjectId: z.string().uuid().nullable().optional(),
});

export const setProjectMembersSchema = z.object({
  projectId: z.string().uuid(),
  userIds: z.array(z.string().uuid()),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type SetUserProjectsInput = z.infer<typeof setUserProjectsSchema>;
export type SetProjectMembersInput = z.infer<typeof setProjectMembersSchema>;
