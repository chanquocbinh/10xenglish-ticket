import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { writeAuditLog } from '@/core/audit/audit.service';
import { ConflictError, ForbiddenError, NotFoundError } from '@/core/errors';
import * as projectsRepository from './projects.repository';
import type {
  AccessibleProject,
  ProjectDetail,
  ProjectListItem,
  ProjectOption,
} from './projects.types';
import type {
  CreateProjectInput,
  SetProjectMembersInput,
  SetUserProjectsInput,
  UpdateProjectInput,
} from './projects.schema';

function isSuperAdmin(user: { permissions: string[] }): boolean {
  return user.permissions.includes('*');
}

/** Option dự án cho label lookup ở view task/sprint (không phải ranh giới bảo mật). */
export function listProjectOptions(): Promise<ProjectOption[]> {
  return projectsRepository.findOptions();
}

/** Dự án gọn theo code cho page scoped resolve id. */
export function getProjectByCode(code: string) {
  return projectsRepository.findByCode(code);
}

export async function listProjects(): Promise<ProjectListItem[]> {
  const projects = await projectsRepository.findManyWithMemberCount();
  return projects.map((p) => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    isActive: p.isActive,
    memberCount: p._count.members,
  }));
}

export async function getProjectDetail(id: string): Promise<ProjectDetail> {
  const project = await projectsRepository.findById(id);
  if (!project) throw new NotFoundError('Không tìm thấy dự án');

  return {
    id: project.id,
    code: project.code,
    name: project.name,
    description: project.description,
    isActive: project.isActive,
    memberCount: project.members.length,
    members: project.members.map((m) => ({
      userId: m.userId,
      fullName: m.user.fullName,
      username: m.user.username,
      role: m.role,
    })),
  };
}

export async function createProject(actor: AuthJWTPayload, input: CreateProjectInput) {
  const existing = await projectsRepository.findByCode(input.code);
  if (existing) throw new ConflictError('Mã dự án đã tồn tại');

  const project = await projectsRepository.create({
    code: input.code,
    name: input.name,
    description: input.description,
  });

  await writeAuditLog({
    userId: actor.sub,
    action: 'CREATE_PROJECT',
    detail: `${actor.fullName} đã tạo dự án "${project.name}" (${project.code})`,
  });

  return project;
}

export async function updateProject(actor: AuthJWTPayload, input: UpdateProjectInput) {
  const current = await projectsRepository.findById(input.projectId);
  if (!current) throw new NotFoundError('Không tìm thấy dự án');

  const project = await projectsRepository.update(input.projectId, {
    name: input.name,
    description: input.description,
    isActive: input.isActive,
  });

  await writeAuditLog({
    userId: actor.sub,
    action: 'UPDATE_PROJECT',
    detail: `${actor.fullName} đã cập nhật dự án "${project.name}" (${project.code})`,
  });

  return project;
}

/** Dự án người dùng được phép truy cập: super admin thấy tất cả, còn lại theo membership. */
export function listAccessibleProjects(user: AuthJWTPayload): Promise<AccessibleProject[]> {
  return isSuperAdmin(user)
    ? projectsRepository.findAllActive()
    : projectsRepository.findAccessibleByUser(user.sub);
}

/** Bảo vệ truy cập trang scoped theo project code. */
export async function requireProjectAccess(user: AuthJWTPayload, code: string) {
  const project = await projectsRepository.findByCode(code);
  if (!project || !project.isActive) throw new NotFoundError('Không tìm thấy dự án');

  if (!isSuperAdmin(user)) {
    const membership = await projectsRepository.findMembership(user.sub, project.id);
    if (!membership) throw new ForbiddenError('Bạn không phải thành viên của dự án này');
  }

  return project;
}

export async function assignUserProjects(actor: AuthJWTPayload, input: SetUserProjectsInput) {
  await projectsRepository.setUserProjects(input.userId, input.projectIds);

  if (input.defaultProjectId !== undefined) {
    const nextDefault =
      input.defaultProjectId && input.projectIds.includes(input.defaultProjectId)
        ? input.defaultProjectId
        : null;
    await projectsRepository.setUserDefaultProject(input.userId, nextDefault);
  }

  await writeAuditLog({
    userId: actor.sub,
    action: 'ASSIGN_USER_PROJECTS',
    detail: `${actor.fullName} đã cập nhật danh sách dự án của người dùng ${input.userId}: [${input.projectIds.length} dự án]`,
  });
}

export async function assignProjectMembers(actor: AuthJWTPayload, input: SetProjectMembersInput) {
  await projectsRepository.setProjectMembers(input.projectId, input.userIds);

  await writeAuditLog({
    userId: actor.sub,
    action: 'ASSIGN_PROJECT_MEMBERS',
    detail: `${actor.fullName} đã cập nhật thành viên dự án ${input.projectId}: [${input.userIds.length} người]`,
  });
}

/** Code dự án để redirect landing: ưu tiên default nếu còn accessible, else project đầu tiên. */
export async function resolveLandingProject(user: AuthJWTPayload): Promise<string | null> {
  const accessible = await listAccessibleProjects(user);
  if (accessible.length === 0) return null;

  const withMemberships = await projectsRepository.findUserWithMemberships(user.sub);
  const defaultId = withMemberships?.defaultProjectId;
  const defaultProject = defaultId ? accessible.find((p) => p.id === defaultId) : undefined;

  return (defaultProject ?? accessible[0]).code;
}

/** Toàn bộ dự án đang hoạt động (cho panel gán dự án của user). */
export function listActiveProjects(): Promise<AccessibleProject[]> {
  return projectsRepository.findAllActive();
}

/** Dữ liệu gán dự án của một user: danh sách dự án tham gia + dự án mặc định. */
export async function getUserProjectAssignment(
  userId: string,
): Promise<{ memberProjectIds: string[]; defaultProjectId: string | null }> {
  const user = await projectsRepository.findUserWithMemberships(userId);
  if (!user) throw new NotFoundError('Không tìm thấy tài khoản');

  return {
    memberProjectIds: user.memberships.map((m) => m.projectId),
    defaultProjectId: user.defaultProjectId,
  };
}
