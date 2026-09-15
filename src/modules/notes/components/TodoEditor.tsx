'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { AppButton } from '@/shared/ui/AppButton';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Plus, Trash2 } from 'lucide';
import { TODO_PRIORITY_LABELS } from '@/modules/notes/notes.constants';
import type { TodoItem, TodoPriority } from '@/modules/notes/notes.types';

type TodoEditorProps = {
  initialContent: TodoItem[];
  onChange: (content: TodoItem[]) => void;
};

const PRIORITIES: TodoPriority[] = ['P1', 'P2', 'P3'];

export function TodoEditor({ initialContent, onChange }: TodoEditorProps) {
  const [items, setItems] = useState<TodoItem[]>(initialContent);
  const [newText, setNewText] = useState('');

  const commit = (next: TodoItem[]) => {
    setItems(next);
    onChange(next);
  };

  const addItem = () => {
    const text = newText.trim();
    if (!text) return;
    const item: TodoItem = {
      id: crypto.randomUUID(),
      text,
      isCompleted: false,
      priority: 'P3',
      createdAt: new Date().toISOString(),
    };
    commit([...items, item]);
    setNewText('');
  };

  const updateItem = (id: string, patch: Partial<TodoItem>) => {
    commit(items.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  };

  const removeItem = (id: string) => {
    commit(items.filter((it) => it.id !== id));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Thêm việc cần làm..."
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
        />
        <AppButton onClick={addItem} startIcon={<MorphIcon icon={Plus} size={16} />}>
          Thêm
        </AppButton>
      </Box>

      {items.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
          Chưa có mục nào. Thêm việc đầu tiên ở trên.
        </Typography>
      )}

      {items.map((item) => (
        <Box
          key={item.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            border: '1px solid #e2e8f0',
            borderRadius: 2,
            p: 1,
          }}
        >
          <Checkbox
            checked={item.isCompleted}
            onChange={(e) => updateItem(item.id, { isCompleted: e.target.checked })}
          />
          <TextField
            variant="standard"
            fullWidth
            value={item.text}
            onChange={(e) => updateItem(item.id, { text: e.target.value })}
            InputProps={{ disableUnderline: true }}
            sx={{
              '& input': {
                textDecoration: item.isCompleted ? 'line-through' : 'none',
                color: item.isCompleted ? 'text.disabled' : 'text.primary',
              },
            }}
          />
          <Select
            size="small"
            value={item.priority}
            onChange={(e) => updateItem(item.id, { priority: e.target.value as TodoPriority })}
            sx={{ minWidth: 90, color: TODO_PRIORITY_LABELS[item.priority].color, fontWeight: 600 }}
          >
            {PRIORITIES.map((p) => (
              <MenuItem key={p} value={p} sx={{ color: TODO_PRIORITY_LABELS[p].color }}>
                {p}
              </MenuItem>
            ))}
          </Select>
          <IconButton size="small" onClick={() => removeItem(item.id)} sx={{ color: '#d32f2f' }}>
            <MorphIcon icon={Trash2} size={16} />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}
