/** Loại note (khớp enum NoteType của Prisma). */
export type NoteType = 'DOCUMENT' | 'TODO' | 'KANBAN';

/** Độ ưu tiên của một mục TODO. */
export type TodoPriority = 'P1' | 'P2' | 'P3';

/** Một mục trong note dạng TODO. */
export type TodoItem = {
  id: string;
  text: string;
  isCompleted: boolean;
  priority: TodoPriority;
  createdAt: string;
};

/** Một thẻ task trong board Kanban. */
export type KanbanTask = {
  id: string;
  content: string;
  ticketRef: string | null;
};

/** Một cột trong board Kanban. */
export type KanbanColumn = {
  id: string;
  title: string;
  taskIds: string[];
};

/** Toàn bộ dữ liệu board Kanban. */
export type KanbanData = {
  columns: Record<string, KanbanColumn>;
  tasks: Record<string, KanbanTask>;
  columnOrder: string[];
};

/** Nội dung note dạng DOCUMENT (Tiptap doc JSON). */
export type DocumentContent = {
  type: 'doc';
  content: unknown[];
};

/** Nội dung note (đã giải mã) theo từng loại. */
export type NoteContent = DocumentContent | TodoItem[] | KanbanData;

/**
 * View model gửi về client. Gồm cả ciphertext + iv để client tự giải mã tại chỗ.
 * Server/DB không bao giờ thấy plaintext nội dung.
 */
export type NoteListItem = {
  id: string;
  title: string;
  type: NoteType;
  encryptedContent: string;
  iv: string;
  isPinned: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};
