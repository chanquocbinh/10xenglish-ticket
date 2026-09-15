import type { ProjectRole } from '@prisma/client';

export const PROJECT_ROLE_LABELS: Record<ProjectRole, string> = {
  MANAGER: 'Quản lý dự án',
  MEMBER: 'Thành viên',
};
