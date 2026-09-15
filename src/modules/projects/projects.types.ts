import type { ProjectRole } from '@prisma/client';

/** Option dự án dùng cho label lookup ở view task/sprint. */
export interface ProjectOption {
  id: string;
  code: string;
  name: string;
}

/** Dự án mà người dùng được phép truy cập (cho switcher). */
export interface AccessibleProject {
  id: string;
  code: string;
  name: string;
}

/** Dòng dự án trong bảng quản trị. */
export interface ProjectListItem {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  memberCount: number;
}

/** Thành viên của một dự án. */
export interface ProjectMemberItem {
  userId: string;
  fullName: string;
  username: string;
  role: ProjectRole;
}

/** Chi tiết dự án kèm danh sách thành viên. */
export interface ProjectDetail extends ProjectListItem {
  members: ProjectMemberItem[];
}
