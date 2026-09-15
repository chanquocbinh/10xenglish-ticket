import type { AuthJWTPayload } from '@/core/auth/auth.types';
import { NotFoundError } from '@/core/errors';
import * as notesRepository from '@/modules/notes/notes.repository';
import type { CreateNoteInput, UpdateNoteInput } from '@/modules/notes/notes.schema';

/** Danh sách note của user đang đăng nhập. */
export function listNotes(actor: AuthJWTPayload) {
  return notesRepository.findManyByUser(actor.sub);
}

export function createNote(actor: AuthJWTPayload, input: CreateNoteInput) {
  return notesRepository.create({ ...input, userId: actor.sub });
}

export async function updateNote(actor: AuthJWTPayload, input: UpdateNoteInput) {
  const result = await notesRepository.updateOwned(actor.sub, input);
  if (result.count === 0) throw new NotFoundError('Không tìm thấy note');
  return { success: true };
}

export async function deleteNote(actor: AuthJWTPayload, id: string) {
  const result = await notesRepository.deleteOwned(actor.sub, id);
  if (result.count === 0) throw new NotFoundError('Không tìm thấy note');
  return { success: true };
}

export async function reorderNotes(actor: AuthJWTPayload, orderedIds: string[]) {
  await notesRepository.reorderOwned(actor.sub, orderedIds);
  return { success: true };
}
