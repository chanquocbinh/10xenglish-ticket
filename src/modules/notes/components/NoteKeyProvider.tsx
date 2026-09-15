'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { deriveNoteKey } from '@/modules/notes/notes.crypto';

const NoteKeyContext = createContext<CryptoKey | null>(null);

/** Trả về CryptoKey đã dẫn xuất, hoặc null khi chưa sẵn sàng. */
export function useNoteKey(): CryptoKey | null {
  return useContext(NoteKeyContext);
}

/**
 * Dẫn xuất khóa mã hóa từ userId một lần, giữ trong RAM (React state).
 * Component con chờ key !== null trước khi encrypt/decrypt.
 */
export function NoteKeyProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const [key, setKey] = useState<CryptoKey | null>(null);

  useEffect(() => {
    let active = true;
    deriveNoteKey(userId)
      .then((derived) => {
        if (active) setKey(derived);
      })
      .catch((err) => {
        console.error('[notes] không dẫn xuất được khóa mã hóa', err);
      });
    return () => {
      active = false;
    };
  }, [userId]);

  return <NoteKeyContext.Provider value={key}>{children}</NoteKeyContext.Provider>;
}
