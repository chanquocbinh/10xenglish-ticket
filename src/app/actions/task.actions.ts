'use server';

import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { createTaskSchema, updateTaskStatusSchema, swapSprintTaskSchema } from '@/lib/validations/task.schema';
import { signOffSchema } from '@/lib/validations/setting.schema';
import { revalidatePath } from 'next/cache';

export async function createTaskAction(data: {
  title: string;
  projectId: string;
  sprintId?: string;
  type?: 'PLANNED' | 'UNPLANNED_BOSS';
  storyPoints: number;
  assigneeId?: string;
  checklists?: { title: string; completed: boolean }[];
}) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const parsed = createTaskSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const task = await prisma.task.create({
    data: {
      title: data.title,
      projectId: data.projectId,
      sprintId: data.sprintId,
      type: data.type || 'PLANNED',
      storyPoints: data.storyPoints,
      assigneeId: data.assigneeId,
      checklists: data.checklists || [],
      status: 'TODO',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.sub,
      action: 'CREATE_TASK',
      detail: `${user.fullName} đã thêm task: "${task.title}" (${task.storyPoints} SP - ${task.type})`,
    },
  });

  revalidatePath('/tasks');
  revalidatePath('/sprints');
  return { success: true, task };
}

export async function updateTaskStatusAction(taskId: string, status: 'TODO' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'DONE') {
  const user = await getCurrentUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const parsed = updateTaskStatusSchema.safeParse({ taskId, status });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  const task = await prisma.task.update({
    where: { id: taskId },
    data: { status },
  });

  revalidatePath('/tasks');
  revalidatePath('/approval');
  revalidatePath('/');
  return { success: true, task };
}

export async function swapSprintTaskAction(data: {
  title: string;
  projectId: string;
  storyPoints: number;
  postponedTaskId: string;
  bossReason: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Chưa đăng nhập' };

  const parsed = swapSprintTaskSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  // Tìm task cần đẩy lùi
  const postponedTask = await prisma.task.findUnique({ where: { id: data.postponedTaskId } });
  if (!postponedTask) return { error: 'Không tìm thấy task cần đẩy lùi' };

  // Tạo task mới chen ngang
  const newTask = await prisma.task.create({
    data: {
      title: data.title,
      projectId: data.projectId,
      sprintId: postponedTask.sprintId,
      type: 'UNPLANNED_BOSS',
      storyPoints: data.storyPoints,
      status: 'TODO',
      assigneeId: user.sub,
    },
  });

  // Gỡ task cũ ra khỏi sprint hiện tại
  await prisma.task.update({
    where: { id: postponedTask.id },
    data: { sprintId: null },
  });

  // Ghi log bảo vệ tải sprint
  await prisma.auditLog.create({
    data: {
      userId: user.sub,
      action: 'SWAP_SPRINT_TASK',
      detail: `${user.fullName} đã thêm việc đột xuất "${data.title}" (${data.storyPoints} SP) và hoãn task "${postponedTask.title}" (${postponedTask.storyPoints} SP) sang Sprint sau. Lý do: "${data.bossReason}"`,
    },
  });

  revalidatePath('/tasks');
  revalidatePath('/sprints');
  revalidatePath('/');
  return { success: true, newTask };
}

export async function signOffAction(data: {
  targetType: 'TICKET' | 'TASK';
  targetId: string;
  action: 'APPROVE' | 'REJECT';
  reason?: string;
}) {
  const user = await getCurrentUser();
  if (!user) return { error: 'Chưa đăng nhập' };
  if (user.role !== 'MANAGER' && user.role !== 'DEV_ADMIN') {
    return { error: 'Chỉ Ban Quản Lý mới có quyền thực hiện phê duyệt nghiệm thu (Sign-off)' };
  }

  const parsed = signOffSchema.safeParse(data);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };

  if (data.action === 'REJECT' && (!data.reason || data.reason.trim().length < 5)) {
    return { error: 'Vui lòng nhập lý do từ chối nghiệm thu rõ ràng (tối thiểu 5 ký tự)' };
  }

  if (data.targetType === 'TICKET') {
    const newStatus = data.action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    await prisma.ticket.update({
      where: { id: data.targetId },
      data: { status: newStatus },
    });
  } else {
    const newStatus = data.action === 'APPROVE' ? 'DONE' : 'IN_PROGRESS';
    await prisma.task.update({
      where: { id: data.targetId },
      data: {
        status: newStatus,
        signoffReason: data.action === 'REJECT' ? data.reason : null,
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      ticketId: data.targetType === 'TICKET' ? data.targetId : null,
      userId: user.sub,
      action: data.action === 'APPROVE' ? 'APPROVE_SIGNOFF' : 'REJECT_SIGNOFF',
      detail: `${user.fullName} (${user.role}) đã ${data.action === 'APPROVE' ? 'CHẤP THUẬN NGHIỆM THU' : 'YÊU CẦU SỬA LẠI'}: ${data.reason ? `"${data.reason}"` : 'Đạt yêu cầu UAT'}`,
    },
  });

  revalidatePath('/approval');
  revalidatePath('/tasks');
  revalidatePath('/tickets');
  revalidatePath('/');
  return { success: true };
}
