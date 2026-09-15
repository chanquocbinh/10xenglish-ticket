import type {
  DocumentContent,
  KanbanData,
  NoteContent,
  NoteType,
  TodoItem,
  TodoPriority,
} from '@/modules/notes/notes.types';

/** Nhãn hiển thị cho từng loại note. */
export const NOTE_TYPE_LABELS: Record<NoteType, string> = {
  DOCUMENT: 'Tài liệu',
  TODO: 'Việc cần làm',
  KANBAN: 'Bảng Kanban',
};

/** Nhãn + màu cho độ ưu tiên TODO. */
export const TODO_PRIORITY_LABELS: Record<TodoPriority, { label: string; color: string }> = {
  P1: { label: 'P1 - Khẩn cấp', color: '#d32f2f' },
  P2: { label: 'P2 - Quan trọng', color: '#ea580c' },
  P3: { label: 'P3 - Bình thường', color: '#64748b' },
};

/** Nội dung DOCUMENT rỗng (Tiptap doc với 1 đoạn trống). */
export function emptyDocumentContent(): DocumentContent {
  return { type: 'doc', content: [{ type: 'paragraph' }] };
}

/** Nội dung TODO rỗng. */
export function emptyTodoContent(): TodoItem[] {
  return [];
}

/** Nội dung KANBAN rỗng với 3 cột mặc định. */
export function emptyKanbanContent(): KanbanData {
  return {
    columns: {
      'col-todo': { id: 'col-todo', title: 'Cần làm', taskIds: [] },
      'col-in-progress': { id: 'col-in-progress', title: 'Đang làm', taskIds: [] },
      'col-done': { id: 'col-done', title: 'Đã xong', taskIds: [] },
    },
    tasks: {},
    columnOrder: ['col-todo', 'col-in-progress', 'col-done'],
  };
}

/** Trả về nội dung rỗng theo loại note. */
export function createDefaultContent(type: NoteType): NoteContent {
  switch (type) {
    case 'DOCUMENT':
      return emptyDocumentContent();
    case 'TODO':
      return emptyTodoContent();
    case 'KANBAN':
      return emptyKanbanContent();
  }
}
