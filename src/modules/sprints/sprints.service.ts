import * as sprintsRepository from './sprints.repository';
import type { SprintBoard } from './sprints.types';

/** Bảng sprint cho một dự án. */
export async function getSprintBoard(projectId: string): Promise<SprintBoard> {
  const scopeWhere = { projectId };

  const [currentSprint, backlogTasks] = await Promise.all([
    sprintsRepository.findCurrentSprintWithTasks(scopeWhere),
    sprintsRepository.findBacklogTasks(scopeWhere),
  ]);

  return { currentSprint, backlogTasks };
}
