'use client';

import { useState, type FormEvent } from 'react';
import { useServerAction } from '@/shared/hooks/useServerAction';
import { createTaskAction, updateTaskStatusAction } from '@/modules/tasks/tasks.actions';
import { KANBAN_COLUMNS, nextStatus, previousStatus } from '@/modules/tasks/tasks.constants';
import type { TaskItem, TaskStatus } from '@/modules/tasks/tasks.types';

interface UseKanbanBoardParams {
  initialTasks: TaskItem[];
  projects: { id: string; code: string; name: string }[];
}

/**
 * State của Kanban Board: cập nhật lạc quan trạng thái task, điều hướng
 * task sang cột trước/sau và form thêm task mới.
 */
export function useKanbanBoard({ initialTasks, projects }: UseKanbanBoardParams) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [storyPoints, setStoryPoints] = useState(3);

  const updateStatus = useServerAction(updateTaskStatusAction);
  const createTask = useServerAction(createTaskAction, {
    onSuccess: () => {
      setIsModalOpen(false);
      setTitle('');
    },
  });

  const changeStatus = async (taskId: string, status: TaskStatus) => {
    const previous = tasks.find((t) => t.id === taskId)?.status;
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));

    const result = await updateStatus.execute(taskId, status);
    // Thất bại thì trả thẻ về đúng cột cũ để không lệch với dữ liệu server
    if (!result.success && previous) {
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: previous } : t)));
    }
  };

  const moveForward = (task: TaskItem) => {
    const status = nextStatus(task.status);
    if (status) void changeStatus(task.id, status);
  };

  const moveBackward = (task: TaskItem) => {
    const status = previousStatus(task.status);
    if (status) void changeStatus(task.id, status);
  };

  const submitCreateTask = async (event: FormEvent) => {
    event.preventDefault();
    await createTask.execute({
      title,
      projectId,
      storyPoints: Number(storyPoints),
      type: 'PLANNED',
    });
  };

  return {
    columns: KANBAN_COLUMNS,
    tasks,
    isModalOpen,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    title,
    setTitle,
    projectId,
    setProjectId,
    storyPoints,
    setStoryPoints,
    isSubmitting: createTask.isLoading,
    submitCreateTask,
    moveForward,
    moveBackward,
  };
}
