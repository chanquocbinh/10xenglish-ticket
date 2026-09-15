'use client';

import { useState } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Plus, Trash2, Tag } from 'lucide';
import type { KanbanData } from '@/modules/notes/notes.types';

type KanbanBoardProps = {
  initialContent: KanbanData;
  onChange: (content: KanbanData) => void;
};

export function KanbanBoard({ initialContent, onChange }: KanbanBoardProps) {
  const [data, setData] = useState<KanbanData>(initialContent);
  const [newTaskText, setNewTaskText] = useState<Record<string, string>>({});

  const commit = (next: KanbanData) => {
    setData(next);
    onChange(next);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceCol = data.columns[source.droppableId];
    const destCol = data.columns[destination.droppableId];
    const sourceIds = [...sourceCol.taskIds];
    sourceIds.splice(source.index, 1);

    if (sourceCol.id === destCol.id) {
      sourceIds.splice(destination.index, 0, draggableId);
      commit({
        ...data,
        columns: { ...data.columns, [sourceCol.id]: { ...sourceCol, taskIds: sourceIds } },
      });
      return;
    }

    const destIds = [...destCol.taskIds];
    destIds.splice(destination.index, 0, draggableId);
    commit({
      ...data,
      columns: {
        ...data.columns,
        [sourceCol.id]: { ...sourceCol, taskIds: sourceIds },
        [destCol.id]: { ...destCol, taskIds: destIds },
      },
    });
  };

  const addTask = (columnId: string) => {
    const content = (newTaskText[columnId] ?? '').trim();
    if (!content) return;
    const id = crypto.randomUUID();
    const column = data.columns[columnId];
    commit({
      ...data,
      tasks: { ...data.tasks, [id]: { id, content, ticketRef: null } },
      columns: { ...data.columns, [columnId]: { ...column, taskIds: [...column.taskIds, id] } },
    });
    setNewTaskText((prev) => ({ ...prev, [columnId]: '' }));
  };

  const removeTask = (columnId: string, taskId: string) => {
    const column = data.columns[columnId];
    const nextTasks = { ...data.tasks };
    delete nextTasks[taskId];
    commit({
      ...data,
      tasks: nextTasks,
      columns: {
        ...data.columns,
        [columnId]: { ...column, taskIds: column.taskIds.filter((tid) => tid !== taskId) },
      },
    });
  };

  const pinTicket = (taskId: string) => {
    const current = data.tasks[taskId];
    const ref = window.prompt('Nhập mã ticket (VD: TCK-104)', current.ticketRef ?? '');
    if (ref === null) return;
    const trimmed = ref.trim();
    commit({
      ...data,
      tasks: { ...data.tasks, [taskId]: { ...current, ticketRef: trimmed || null } },
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start', overflowX: 'auto', pb: 1 }}>
        {data.columnOrder.map((columnId) => {
          const column = data.columns[columnId];
          return (
            <Box
              key={column.id}
              sx={{
                flex: '1 0 260px',
                minWidth: 260,
                bgcolor: '#f1f5f9',
                borderRadius: 2,
                p: 1.5,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {column.title}{' '}
                <Typography component="span" variant="caption" color="text.secondary">
                  ({column.taskIds.length})
                </Typography>
              </Typography>

              <Droppable droppableId={column.id}>
                {(provided) => (
                  <Box
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    sx={{ display: 'flex', flexDirection: 'column', gap: 1, minHeight: 40 }}
                  >
                    {column.taskIds.map((taskId, index) => {
                      const task = data.tasks[taskId];
                      if (!task) return null;
                      return (
                        <Draggable key={task.id} draggableId={task.id} index={index}>
                          {(dragProvided, snapshot) => (
                            <Box
                              ref={dragProvided.innerRef}
                              {...dragProvided.draggableProps}
                              {...dragProvided.dragHandleProps}
                              sx={{
                                bgcolor: '#fff',
                                border: '1px solid #e2e8f0',
                                borderRadius: 1.5,
                                p: 1,
                                boxShadow: snapshot.isDragging ? 3 : 0,
                                ...dragProvided.draggableProps.style,
                              }}
                            >
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 0.5 }}>
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {task.content}
                                </Typography>
                                <Box sx={{ display: 'flex' }}>
                                  <IconButton
                                    size="small"
                                    onClick={() => pinTicket(task.id)}
                                    title="Quick Pin Ticket"
                                  >
                                    <MorphIcon icon={Tag} size={14} />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    onClick={() => removeTask(column.id, task.id)}
                                    sx={{ color: '#d32f2f' }}
                                  >
                                    <MorphIcon icon={Trash2} size={14} />
                                  </IconButton>
                                </Box>
                              </Box>
                              {task.ticketRef && (
                                <Chip
                                  label={task.ticketRef}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                                />
                              )}
                            </Box>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </Box>
                )}
              </Droppable>

              <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Thêm thẻ..."
                  value={newTaskText[column.id] ?? ''}
                  onChange={(e) =>
                    setNewTaskText((prev) => ({ ...prev, [column.id]: e.target.value }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTask(column.id);
                    }
                  }}
                />
                <IconButton size="small" onClick={() => addTask(column.id)}>
                  <MorphIcon icon={Plus} size={16} />
                </IconButton>
              </Box>
            </Box>
          );
        })}
      </Box>
    </DragDropContext>
  );
}
