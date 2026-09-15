'use server';

import { revalidatePath } from 'next/cache';
import { parseInput, requirePermission, runAction } from '@/core/server/action';
import {
  createProjectSchema,
  setProjectMembersSchema,
  setUserProjectsSchema,
  updateProjectSchema,
} from './projects.schema';
import {
  assignProjectMembers,
  assignUserProjects,
  createProject,
  updateProject,
} from './projects.service';

export async function createProjectAction(input: {
  code: string;
  name: string;
  description?: string;
}) {
  return runAction(async () => {
    const actor = await requirePermission('projects.create');
    const parsed = parseInput(createProjectSchema, {
      code: input.code?.toUpperCase().trim(),
      name: input.name,
      description: input.description,
    });
    const project = await createProject(actor, parsed);
    revalidatePath('/admin/projects');
    return { projectId: project.id };
  });
}

export async function updateProjectAction(input: {
  projectId: string;
  name: string;
  description?: string;
  isActive: boolean;
}) {
  return runAction(async () => {
    const actor = await requirePermission('projects.update');
    const parsed = parseInput(updateProjectSchema, input);
    await updateProject(actor, parsed);
    revalidatePath('/admin/projects');
    revalidatePath(`/admin/projects/${input.projectId}`);
  });
}

export async function assignUserProjectsAction(
  userId: string,
  projectIds: string[],
  defaultProjectId: string | null,
) {
  return runAction(async () => {
    const actor = await requirePermission('projects.manageMembers');
    const parsed = parseInput(setUserProjectsSchema, { userId, projectIds, defaultProjectId });
    await assignUserProjects(actor, parsed);
    revalidatePath(`/users/${userId}`);
  });
}

export async function assignProjectMembersAction(projectId: string, userIds: string[]) {
  return runAction(async () => {
    const actor = await requirePermission('projects.manageMembers');
    const parsed = parseInput(setProjectMembersSchema, { projectId, userIds });
    await assignProjectMembers(actor, parsed);
    revalidatePath(`/admin/projects/${projectId}`);
  });
}
