import { prisma } from '@/core/db/prisma';

/** Truy vấn dữ liệu dự án. Không phân quyền, không ghi audit. */

/** Danh sách dự án rút gọn (id + code + name) cho dropdown/label lookup. */
export function findOptions() {
  return prisma.project.findMany({
    select: { id: true, code: true, name: true },
    orderBy: { code: 'asc' },
  });
}

/** Danh sách dự án kèm số lượng thành viên cho bảng quản trị. */
export function findManyWithMemberCount() {
  return prisma.project.findMany({
    orderBy: { createdAt: 'asc' },
    include: { _count: { select: { members: true } } },
  });
}

export function findById(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: { members: { include: { user: true } } },
  });
}

export function findByCode(code: string) {
  return prisma.project.findUnique({ where: { code } });
}

export function create(data: { code: string; name: string; description?: string | null }) {
  return prisma.project.create({ data });
}

export function update(
  id: string,
  data: { name?: string; description?: string | null; isActive?: boolean },
) {
  return prisma.project.update({ where: { id }, data });
}

/** Dự án đang hoạt động mà người dùng là thành viên. */
export function findAccessibleByUser(userId: string) {
  return prisma.project.findMany({
    where: { members: { some: { userId } }, isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { code: 'asc' },
  });
}

/** Toàn bộ dự án đang hoạt động — cho super admin switcher. */
export function findAllActive() {
  return prisma.project.findMany({
    where: { isActive: true },
    select: { id: true, code: true, name: true },
    orderBy: { code: 'asc' },
  });
}

export function findMembership(userId: string, projectId: string) {
  return prisma.projectMember.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });
}

/** User kèm danh sách dự án tham gia + dự án mặc định. */
export function findUserWithMemberships(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: { memberships: { include: { project: true } } },
  });
}

/** Đồng bộ tập dự án của một user: xoá phần dư, thêm phần thiếu (transactional). */
export function setUserProjects(userId: string, projectIds: string[]) {
  return prisma.$transaction([
    prisma.projectMember.deleteMany({
      where: { userId, projectId: { notIn: projectIds } },
    }),
    ...projectIds.map((projectId) =>
      prisma.projectMember.upsert({
        where: { userId_projectId: { userId, projectId } },
        update: {},
        create: { userId, projectId },
      }),
    ),
  ]);
}

/** Đồng bộ tập thành viên của một dự án (transactional). */
export function setProjectMembers(projectId: string, userIds: string[]) {
  return prisma.$transaction([
    prisma.projectMember.deleteMany({
      where: { projectId, userId: { notIn: userIds } },
    }),
    ...userIds.map((userId) =>
      prisma.projectMember.upsert({
        where: { userId_projectId: { userId, projectId } },
        update: {},
        create: { userId, projectId },
      }),
    ),
  ]);
}

export function setUserDefaultProject(userId: string, projectId: string | null) {
  return prisma.user.update({
    where: { id: userId },
    data: { defaultProjectId: projectId },
  });
}
