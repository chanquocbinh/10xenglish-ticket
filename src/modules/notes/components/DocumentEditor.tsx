'use client';

import { useEditor, EditorContent, type Content } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Box from '@mui/material/Box';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Divider from '@mui/material/Divider';
import type { DocumentContent } from '@/modules/notes/notes.types';

type DocumentEditorProps = {
  initialContent: DocumentContent;
  onChange: (content: DocumentContent) => void;
};

export function DocumentEditor({ initialContent, onChange }: DocumentEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      TaskList,
      TaskItem.configure({ nested: true }),
    ],
    content: initialContent as Content,
    onUpdate: ({ editor: ed }) => {
      onChange(ed.getJSON() as DocumentContent);
    },
    editorProps: {
      attributes: {
        style:
          'outline:none; min-height:320px; padding:16px; line-height:1.6; font-size:0.95rem;',
      },
    },
  });

  if (!editor) return null;

  return (
    <Box
      sx={{
        border: '1px solid #e2e8f0',
        borderRadius: 2,
        overflow: 'hidden',
        '& .ProseMirror': { outline: 'none' },
        '& .ProseMirror h1': { fontSize: '1.6rem', fontWeight: 700, mt: 1, mb: 0.5 },
        '& .ProseMirror h2': { fontSize: '1.35rem', fontWeight: 700, mt: 1, mb: 0.5 },
        '& .ProseMirror h3': { fontSize: '1.15rem', fontWeight: 600, mt: 1, mb: 0.5 },
        '& .ProseMirror ul[data-type="taskList"]': { listStyle: 'none', pl: 0 },
        '& .ProseMirror ul[data-type="taskList"] li': {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.5rem',
        },
        '& .ProseMirror ul[data-type="taskList"] li > label': { marginTop: '0.15rem' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          p: 1,
          borderBottom: '1px solid #e2e8f0',
          bgcolor: '#f8fafc',
        }}
      >
        <ToggleButtonGroup size="small" exclusive>
          <ToggleButton
            value="h1"
            selected={editor.isActive('heading', { level: 1 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            H1
          </ToggleButton>
          <ToggleButton
            value="h2"
            selected={editor.isActive('heading', { level: 2 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </ToggleButton>
          <ToggleButton
            value="h3"
            selected={editor.isActive('heading', { level: 3 })}
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            H3
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ToggleButtonGroup size="small">
          <ToggleButton
            value="bold"
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <strong>B</strong>
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <em>I</em>
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
          >
            <span style={{ textDecoration: 'underline' }}>U</span>
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider orientation="vertical" flexItem />

        <ToggleButtonGroup size="small">
          <ToggleButton
            value="bulletList"
            selected={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            • List
          </ToggleButton>
          <ToggleButton
            value="taskList"
            selected={editor.isActive('taskList')}
            onClick={() => editor.chain().focus().toggleTaskList().run()}
          >
            ☑ Task
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <EditorContent editor={editor} />
    </Box>
  );
}
