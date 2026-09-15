import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200),
  type: z.enum(['DOCUMENT', 'TODO', 'KANBAN']),
  encryptedContent: z.string().min(1),
  iv: z.string().min(1),
  tags: z.array(z.string()).optional().default([]),
});

export const updateNoteSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Tiêu đề không được để trống').max(200).optional(),
  encryptedContent: z.string().min(1).optional(),
  iv: z.string().min(1).optional(),
  isPinned: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export const reorderNotesSchema = z.object({
  orderedIds: z.array(z.string()).min(1),
});

/** Dữ liệu thô từ client (trước khi zod áp giá trị mặc định). */
export type CreateNotePayload = z.input<typeof createNoteSchema>;
/** Dữ liệu đã validate cho tầng service. */
export type CreateNoteInput = z.output<typeof createNoteSchema>;
export type UpdateNoteInput = z.output<typeof updateNoteSchema>;
export type ReorderNotesInput = z.output<typeof reorderNotesSchema>;
