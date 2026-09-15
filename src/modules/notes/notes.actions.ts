'use server';

import { revalidatePath } from 'next/cache';
import { requireUser, runAction } from '@/core/server/action';
import {
  createNoteSchema,
  reorderNotesSchema,
  updateNoteSchema,
  type CreateNotePayload,
  type UpdateNoteInput,
} from '@/modules/notes/notes.schema';
import * as notesService from '@/modules/notes/notes.service';

export async function createNoteAction(data: CreateNotePayload) {
  return runAction(async () => {
    const actor = await requireUser();
    const note = await notesService.createNote(actor, createNoteSchema.parse(data));

    revalidatePath('/notes');
    return note;
  });
}

export async function updateNoteAction(input: UpdateNoteInput) {
  return runAction(async () => {
    const actor = await requireUser();
    const result = await notesService.updateNote(actor, updateNoteSchema.parse(input));

    revalidatePath('/notes');
    return result;
  });
}

export async function deleteNoteAction(id: string) {
  return runAction(async () => {
    const actor = await requireUser();
    const result = await notesService.deleteNote(actor, id);

    revalidatePath('/notes');
    return result;
  });
}

export async function reorderNotesAction(orderedIds: string[]) {
  return runAction(async () => {
    const actor = await requireUser();
    const parsed = reorderNotesSchema.parse({ orderedIds });
    const result = await notesService.reorderNotes(actor, parsed.orderedIds);

    revalidatePath('/notes');
    return result;
  });
}
