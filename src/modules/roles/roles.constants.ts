import type { Permission, PermissionModule } from '@/core/auth/permissions';

export const PERMISSION_MODULE_LABELS: Record<PermissionModule, string> = {
  dashboard: 'Tổng quan',
  tickets: 'Ticket / Bug',
  tasks: 'Task',
  sprints: 'Feature & Sprint',
  approval: 'Nghiệm thu',
  users: 'Người dùng',
  roles: 'Vai trò',
  settings: 'Cấu hình hệ thống',
  projects: 'Dự án',
};

/** Nhãn tiếng Việt của từng quyền, dùng cho form và bảng danh sách vai trò. */
export const PERMISSION_LABELS: Record<Permission, string> = {
  'dashboard.view': 'Xem tổng quan',
  'tickets.view': 'Xem danh sách ticket',
  'tickets.create': 'Tạo ticket',
  'tickets.update': 'Cập nhật ticket / trạng thái',
  'tickets.comment': 'Bình luận ticket',
  'tickets.approve': 'Nghiệm thu ticket',
  'tasks.view': 'Xem danh sách task',
  'tasks.create': 'Tạo task',
  'tasks.update': 'Cập nhật task / trạng thái',
  'tasks.approve': 'Nghiệm thu task',
  'sprints.view': 'Xem Sprint',
  'sprints.update': 'Điều chỉnh Sprint (bù trừ task)',
  'approval.view': 'Xem hàng chờ nghiệm thu',
  'users.view': 'Xem danh sách người dùng',
  'users.create': 'Tạo tài khoản',
  'users.update': 'Sửa thông tin / đổi vai trò người dùng',
  'users.resetPassword': 'Reset mật khẩu người dùng',
  'roles.view': 'Xem vai trò',
  'roles.create': 'Tạo vai trò',
  'roles.update': 'Sửa vai trò',
  'roles.delete': 'Xóa vai trò',
  'settings.view': 'Xem cấu hình hệ thống',
  'settings.update': 'Cập nhật cấu hình hệ thống',
  'projects.view': 'Xem dự án',
  'projects.create': 'Tạo dự án',
  'projects.update': 'Sửa dự án',
  'projects.manageMembers': 'Gán thành viên dự án',
};

/** Nhãn hiển thị cho quyền đọc từ DB, gồm cả wildcard của vai trò hệ thống. */
export function permissionLabel(value: string): string {
  if (value === '*') return 'Toàn quyền hệ thống';
  if (value.endsWith('.*')) {
    const m = value.slice(0, -2) as PermissionModule;
    return `${PERMISSION_MODULE_LABELS[m] ?? m}: toàn quyền`;
  }
  return PERMISSION_LABELS[value as Permission] ?? value;
}
