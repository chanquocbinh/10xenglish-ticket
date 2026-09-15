'use client';

import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import Tooltip from '@mui/material/Tooltip';
import { Pin, PinOff, ShieldCheck, AlertTriangle, Plus } from 'lucide';
import { useNoteKey } from '@/modules/notes/components/NoteKeyProvider';
import { useAutoSaveNote, type AutoSaveStatus } from '@/modules/notes/hooks/useAutoSaveNote';
import { decryptData } from '@/modules/notes/notes.crypto';
import { DocumentEditor } from '@/modules/notes/components/DocumentEditor';
import { TodoEditor } from '@/modules/notes/components/TodoEditor';
import { KanbanBoard } from '@/modules/notes/components/KanbanBoard';
import type {
  DocumentContent,
  KanbanData,
  NoteContent,
  NoteListItem,
  TodoItem,
} from '@/modules/notes/notes.types';

/**
 * Lưu + mã hóa chạy ngầm ở background. UI không nhấp nháy "đang lưu" theo từng
 * phím gõ; chỉ phản ánh trạng thái tĩnh: đã an toàn (icon mờ) hoặc thất bại (đỏ).
 */
function StatusBadge({ status }: { status: AutoSaveStatus }) {
  if (status === 'error') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: '#d32f2f' }}>
        <MorphIcon icon={AlertTriangle} size={14} />
        <Typography variant="caption" sx={{ fontWeight: 600 }}>
          Lưu thất bại, thử lại
        </Typography>
      </Box>
    );
  }
  if (status === 'idle') return null;
  // 'saving' và 'saved' hiển thị giống nhau => không nháy khi lưu ngầm.
  return (
    <Tooltip title="Đã mã hóa & lưu an toàn">
      <Box sx={{ display: 'flex', alignItems: 'center', color: '#94a3b8' }}>
        <MorphIcon icon={ShieldCheck} size={14} />
      </Box>
    </Tooltip>
  );
}

export function NoteEditorPane({
  note,
  onTitleChange,
}: {
  note: NoteListItem;
  onTitleChange?: (id: string, title: string) => void;
}) {
  const key = useNoteKey();
  const { save, status } = useAutoSaveNote(note.id, key);

  const [title, setTitle] = useState(note.title);
  const [isPinned, setIsPinned] = useState(note.isPinned);
  const [tags, setTags] = useState<string[]>(note.tags);
  const [newTag, setNewTag] = useState('');
  const [content, setContent] = useState<NoteContent | null>(null);
  const [decryptError, setDecryptError] = useState(false);

  // Giải mã nội dung khi có key / đổi note / ciphertext đổi.
  // content chỉ phụ thuộc ciphertext (encryptedContent/iv), KHÔNG phụ thuộc
  // metadata plaintext (title/pin/tags) => tránh reset nhầm gây kẹt spinner.
  useEffect(() => {
    if (!key) return;
    let active = true;
    setContent(null);
    setDecryptError(false);
    decryptData<NoteContent>(note.encryptedContent, note.iv, key)
      .then((decrypted) => {
        if (active) setContent(decrypted);
      })
      .catch((err) => {
        console.error('[notes] giải mã lỗi', err);
        if (active) setDecryptError(true);
      });
    return () => {
      active = false;
    };
  }, [key, note.id, note.encryptedContent, note.iv]);

  const handleTitleChange = (value: string) => {
    setTitle(value);
    onTitleChange?.(note.id, value);
    if (value.trim()) save({ title: value.trim() });
  };

  const togglePin = () => {
    const next = !isPinned;
    setIsPinned(next);
    save({ isPinned: next });
  };

  const addTag = () => {
    const tag = newTag.trim();
    if (!tag || tags.includes(tag)) {
      setNewTag('');
      return;
    }
    const next = [...tags, tag];
    setTags(next);
    setNewTag('');
    save({ tags: next });
  };

  const removeTag = (tag: string) => {
    const next = tags.filter((t) => t !== tag);
    setTags(next);
    save({ tags: next });
  };

  const handleContentChange = (next: NoteContent) => {
    save({ content: next });
  };

  if (!key) {
    return (
      <PaneMessage>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Đang chuẩn bị khóa mã hóa...
        </Typography>
      </PaneMessage>
    );
  }

  if (decryptError) {
    return (
      <PaneMessage>
        <MorphIcon icon={AlertTriangle} size={20} />
        <Typography variant="body2" color="error">
          Không giải mã được note này.
        </Typography>
      </PaneMessage>
    );
  }

  if (content === null) {
    return (
      <PaneMessage>
        <CircularProgress size={20} />
        <Typography variant="body2" color="text.secondary">
          Đang giải mã nội dung...
        </Typography>
      </PaneMessage>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <TextField
          variant="standard"
          fullWidth
          value={title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Tiêu đề note"
          InputProps={{ sx: { fontSize: '1.25rem', fontWeight: 700 } }}
        />
        <StatusBadge status={status} />
        <IconButton onClick={togglePin} title={isPinned ? 'Bỏ ghim' : 'Ghim'}>
          <MorphIcon icon={isPinned ? PinOff : Pin} size={18} />
        </IconButton>
      </Box>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 0.5 }}>
        {tags.map((tag) => (
          <Chip key={tag} label={tag} size="small" onDelete={() => removeTag(tag)} />
        ))}
        <TextField
          variant="standard"
          size="small"
          placeholder="+ tag"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addTag();
            }
          }}
          sx={{ width: 90 }}
          InputProps={{ disableUnderline: true }}
        />
        <IconButton size="small" onClick={addTag}>
          <MorphIcon icon={Plus} size={14} />
        </IconButton>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {note.type === 'DOCUMENT' && (
          <DocumentEditor
            initialContent={content as DocumentContent}
            onChange={handleContentChange}
          />
        )}
        {note.type === 'TODO' && (
          <TodoEditor initialContent={content as TodoItem[]} onChange={handleContentChange} />
        )}
        {note.type === 'KANBAN' && (
          <KanbanBoard initialContent={content as KanbanData} onChange={handleContentChange} />
        )}
      </Box>
    </Box>
  );
}

function PaneMessage({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        height: '100%',
        minHeight: 200,
      }}
    >
      {children}
    </Box>
  );
}
