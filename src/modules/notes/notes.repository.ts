import { prisma } from '@/core/db/prisma';
import type { CreateNoteInput, UpdateNoteInput } from '@/modules/notes/notes.schema';

/** Danh sách note của một user, sắp theo thứ tự thủ công (sortOrder), mới trước khi bằng. */
export function findManyByUser(userId: string) {
  return prisma.personalNote.findMany({
    where: { userId },
    orderBy: [{ sortOrder: 'desc' }, { createdAt: 'desc' }],
  });
}

export async function create(input: CreateNoteInput & { userId: string }) {
  const agg = await prisma.personalNote.aggregate({
    where: { userId: input.userId },
    _max: { sortOrder: true },
  });
  return prisma.personalNote.create({
    data: {
      userId: input.userId,
      title: input.title,
      type: input.type,
      encryptedContent: input.encryptedContent,
      iv: input.iv,
      tags: input.tags,
      sortOrder: (agg._max.sortOrder ?? 0) + 1,
    },
  });
}

/** Cập nhật note; where khớp cả id lẫn userId để enforce ownership. */
export function updateOwned(userId: string, input: UpdateNoteInput) {
  return prisma.personalNote.updateMany({
    where: { id: input.id, userId },
    data: {
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.encryptedContent !== undefined
        ? { encryptedContent: input.encryptedContent }
        : {}),
      ...(input.iv !== undefined ? { iv: input.iv } : {}),
      ...(input.isPinned !== undefined ? { isPinned: input.isPinned } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
    },
  });
}

/** Xóa note; where khớp cả id lẫn userId để enforce ownership. */
export function deleteOwned(userId: string, id: string) {
  return prisma.personalNote.deleteMany({
    where: { id, userId },
  });
}

/**
 * Ghi lại thứ tự theo mảng id (đầu mảng = trên cùng = sortOrder cao nhất).
 * Mỗi update ràng buộc userId để enforce ownership; trả số bản ghi đã đổi.
 */
export async function reorderOwned(userId: string, orderedIds: string[]) {
  const results = await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.personalNote.updateMany({
        where: { id, userId },
        data: { sortOrder: orderedIds.length - index },
      }),
    ),
  );
  return results.reduce((sum, r) => sum + r.count, 0);
}
