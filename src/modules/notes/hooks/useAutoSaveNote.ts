'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { updateNoteAction } from '@/modules/notes/notes.actions';
import { encryptData } from '@/modules/notes/notes.crypto';
import type { UpdateNoteInput } from '@/modules/notes/notes.schema';
import type { NoteContent } from '@/modules/notes/notes.types';

export type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export type AutoSavePartial = {
  title?: string;
  content?: NoteContent;
  isPinned?: boolean;
  tags?: string[];
};

export type UseAutoSaveNote = {
  save: (partial: AutoSavePartial) => void;
  status: AutoSaveStatus;
};

const DEBOUNCE_MS = 1500;

/**
 * Auto-save note với debounce 1500ms. Gộp các thay đổi liên tiếp, mã hóa
 * content bằng khóa rồi gọi updateNoteAction.
 */
export function useAutoSaveNote(noteId: string, key: CryptoKey | null): UseAutoSaveNote {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRef = useRef<AutoSavePartial>({});

  // Reset khi đổi note.
  useEffect(() => {
    setStatus('idle');
    pendingRef.current = {};
    clearTimeout(timerRef.current ?? undefined);
  }, [noteId]);

  useEffect(() => {
    return () => clearTimeout(timerRef.current ?? undefined);
  }, []);

  const flush = useCallback(async () => {
    const partial = pendingRef.current;
    pendingRef.current = {};

    if (!key) {
      setStatus('error');
      return;
    }

    setStatus('saving');
    try {
      const input: UpdateNoteInput = { id: noteId };
      if (partial.title !== undefined) input.title = partial.title;
      if (partial.isPinned !== undefined) input.isPinned = partial.isPinned;
      if (partial.tags !== undefined) input.tags = partial.tags;
      if (partial.content !== undefined) {
        const encrypted = await encryptData(partial.content, key);
        input.encryptedContent = encrypted.encryptedContent;
        input.iv = encrypted.iv;
      }

      const result = await updateNoteAction(input);
      setStatus(result.success ? 'saved' : 'error');
    } catch (err) {
      console.error('[notes] auto-save lỗi', err);
      setStatus('error');
    }
  }, [key, noteId]);

  const save = useCallback(
    (partial: AutoSavePartial) => {
      pendingRef.current = { ...pendingRef.current, ...partial };
      clearTimeout(timerRef.current ?? undefined);
      timerRef.current = setTimeout(() => {
        void flush();
      }, DEBOUNCE_MS);
    },
    [flush],
  );

  return { save, status };
}
