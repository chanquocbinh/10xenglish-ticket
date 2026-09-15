'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';

import { AppButton } from '@/shared/ui/AppButton';
import { MorphIcon } from '@/shared/ui/MorphIcon';

import {
  Plus,
  Search,
  Trash2,
  Pin,
  FileText,
  ListChecks,
  Kanban,
  GripVertical,
} from 'lucide';

import { useServerAction } from '@/shared/hooks/useServerAction';

import {
  NoteKeyProvider,
  useNoteKey,
} from '@/modules/notes/components/NoteKeyProvider';

import { NoteEditorPane } from '@/modules/notes/components/NoteEditorPane';

import {
  createNoteAction,
  deleteNoteAction,
  reorderNotesAction,
} from '@/modules/notes/notes.actions';

import { encryptData } from '@/modules/notes/notes.crypto';

import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
} from '@hello-pangea/dnd';

import {
  createDefaultContent,
  NOTE_TYPE_LABELS,
} from '@/modules/notes/notes.constants';

import type {
  NoteListItem,
  NoteType,
} from '@/modules/notes/notes.types';

const TYPE_ICON: Record<NoteType, typeof FileText> = {
  DOCUMENT: FileText,
  TODO: ListChecks,
  KANBAN: Kanban,
};

export function NotesView({
  initialNotes,
  userId,
}: {
  initialNotes: NoteListItem[];
  userId: string;
}) {
  return (
    <NoteKeyProvider userId={userId}>
      <NotesViewInner initialNotes={initialNotes} />
    </NoteKeyProvider>
  );
}

function NotesViewInner({
  initialNotes,
}: {
  initialNotes: NoteListItem[];
}) {
  const key = useNoteKey();
  const router = useRouter();

  const [notes, setNotes] = useState<NoteListItem[]>(initialNotes);

  const [selectedId, setSelectedId] = useState<string | null>(
    initialNotes[0]?.id ?? null,
  );

  const [search, setSearch] = useState('');

  const [typeFilter, setTypeFilter] = useState<
    NoteType | 'ALL'
  >('ALL');

  const [tagFilter, setTagFilter] = useState<string>('ALL');

  const [menuAnchor, setMenuAnchor] =
    useState<HTMLElement | null>(null);

  const [creating, setCreating] = useState(false);

  // Đồng bộ lại khi server refresh trả dữ liệu mới.
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  const deleteAction = useServerAction(
    deleteNoteAction,
    { refresh: false },
  );

  const reorderAction = useServerAction(
    reorderNotesAction,
    { refresh: false },
  );

  const isFilterActive =
    search !== '' ||
    typeFilter !== 'ALL' ||
    tagFilter !== 'ALL';

  const allTags = useMemo(
    () =>
      Array.from(
        new Set(
          notes.flatMap((note) => note.tags),
        ),
      ).sort(),
    [notes],
  );

  const filtered = useMemo(() => {
    return notes.filter((note) => {
      if (
        typeFilter !== 'ALL' &&
        note.type !== typeFilter
      ) {
        return false;
      }

      if (
        tagFilter !== 'ALL' &&
        !note.tags.includes(tagFilter)
      ) {
        return false;
      }

      if (
        search &&
        !note.title
          .toLowerCase()
          .includes(search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [
    notes,
    typeFilter,
    tagFilter,
    search,
  ]);

  const selectedNote =
    notes.find((note) => note.id === selectedId) ?? null;

  // Cập nhật title realtime ở sidebar.
  const handleTitleChange = (
    id: string,
    title: string,
  ) => {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id
          ? { ...note, title }
          : note,
      ),
    );
  };

  const handleCreate = async (
    type: NoteType,
  ) => {
    setMenuAnchor(null);

    if (!key) {
      return;
    }

    setCreating(true);

    try {
      const {
        encryptedContent,
        iv,
      } = await encryptData(
        createDefaultContent(type),
        key,
      );

      const res = await createNoteAction({
        title: 'Note mới',
        type,
        encryptedContent,
        iv,
      });

      if (res.success) {
        setSelectedId(res.data.id);
        router.refresh();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (
    id: string,
  ) => {
    setNotes((prev) =>
      prev.filter((note) => note.id !== id),
    );

    if (selectedId === id) {
      setSelectedId(null);
    }

    const res = await deleteAction.execute(id);

    if (!res.success) {
      router.refresh();
    }
  };

  const handleDragEnd = (
    result: DropResult,
  ) => {
    if (isFilterActive) {
      return;
    }

    const {
      source,
      destination,
    } = result;

    if (
      !destination ||
      destination.index === source.index
    ) {
      return;
    }

    const next = [...notes];

    const [moved] = next.splice(
      source.index,
      1,
    );

    next.splice(
      destination.index,
      0,
      moved,
    );

    setNotes(next);

    void reorderAction.execute(
      next.map((note) => note.id),
    );
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        height: 'calc(100vh - 120px)',
        p: 1,
      }}
    >
      {/* =====================================================
          CỘT TRÁI
          ===================================================== */}
      <Box
        sx={{
          width: 340,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minHeight: 0,
        }}
      >
        {/* ===================================================
            TITLE + CREATE
            =================================================== */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: 40,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
            }}
          >
            Ghi chú cá nhân
          </Typography>

          <AppButton
            size="small"
            startIcon={
              creating ? (
                <CircularProgress
                  size={14}
                  color="inherit"
                />
              ) : (
                <MorphIcon
                  icon={Plus}
                  size={16}
                />
              )
            }
            disabled={!key || creating}
            onClick={(e) =>
              setMenuAnchor(
                e.currentTarget,
              )
            }
          >
            Note mới
          </AppButton>

          <Menu
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() =>
              setMenuAnchor(null)
            }
          >
            {(
              [
                'DOCUMENT',
                'TODO',
                'KANBAN',
              ] as NoteType[]
            ).map((type) => {
              const Icon =
                TYPE_ICON[type];

              return (
                <MenuItem
                  key={type}
                  onClick={() =>
                    handleCreate(type)
                  }
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <MorphIcon
                      icon={Icon}
                      size={16}
                    />

                    {
                      NOTE_TYPE_LABELS[
                        type
                      ]
                    }
                  </Box>
                </MenuItem>
              );
            })}
          </Menu>
        </Box>

        {/* ===================================================
            SEARCH
            =================================================== */}
        <TextField
          size="small"
          fullWidth
          placeholder="Tìm theo tiêu đề..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MorphIcon
                  icon={Search}
                  size={16}
                />
              </InputAdornment>
            ),
          }}
        />

        {/* ===================================================
            FILTER
            =================================================== */}
        <Box
          sx={{
            display: 'flex',
            gap: 1,
          }}
        >
          <FormControl
            size="small"
            fullWidth
          >
            <InputLabel id="type-filter">
              Loại
            </InputLabel>

            <Select
              labelId="type-filter"
              label="Loại"
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(
                  e.target.value as
                    | NoteType
                    | 'ALL',
                )
              }
            >
              <MenuItem value="ALL">
                Tất cả
              </MenuItem>

              <MenuItem value="DOCUMENT">
                {
                  NOTE_TYPE_LABELS
                    .DOCUMENT
                }
              </MenuItem>

              <MenuItem value="TODO">
                {
                  NOTE_TYPE_LABELS.TODO
                }
              </MenuItem>

              <MenuItem value="KANBAN">
                {
                  NOTE_TYPE_LABELS
                    .KANBAN
                }
              </MenuItem>
            </Select>
          </FormControl>

          <FormControl
            size="small"
            fullWidth
          >
            <InputLabel id="tag-filter">
              Tag
            </InputLabel>

            <Select
              labelId="tag-filter"
              label="Tag"
              value={tagFilter}
              onChange={(e) =>
                setTagFilter(
                  e.target.value,
                )
              }
            >
              <MenuItem value="ALL">
                Tất cả
              </MenuItem>

              {allTags.map((tag) => (
                <MenuItem
                  key={tag}
                  value={tag}
                >
                  {tag}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* ===================================================
            NOTE LIST PAPER
            =================================================== */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            p: 1.5,
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              borderBottom: 1,
              pb: 1,
              mb: 1,
              borderColor: 'divider',
            }}
          >
            Notes
          </Typography>

          {/* Scroll chỉ nằm ở danh sách */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflow: 'auto',
            }}
          >
            {filtered.length === 0 && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  p: 2,
                  textAlign: 'center',
                }}
              >
                Chưa có note nào.
              </Typography>
            )}

            <DragDropContext
              onDragEnd={handleDragEnd}
            >
              <Droppable
                droppableId="note-list"
              >
                {(dropProvided) => (
                  <Box
                    ref={
                      dropProvided.innerRef
                    }
                    {...dropProvided.droppableProps}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5,
                    }}
                  >
                    {filtered.map(
                      (note, index) => {
                        const Icon =
                          TYPE_ICON[
                            note.type
                          ];

                        const active =
                          note.id ===
                          selectedId;

                        return (
                          <Draggable
                            key={note.id}
                            draggableId={
                              note.id
                            }
                            index={index}
                            isDragDisabled={
                              isFilterActive
                            }
                          >
                            {(
                              dragProvided,
                              snapshot,
                            ) => (
                              <Box
                                ref={
                                  dragProvided.innerRef
                                }
                                {...dragProvided.draggableProps}
                                onClick={() =>
                                  setSelectedId(
                                    note.id,
                                  )
                                }
                                sx={{
                                  display:
                                    'flex',
                                  alignItems:
                                    'center',
                                  gap: 1,
                                  p: 1,
                                  borderRadius: 1.5,
                                  cursor:
                                    'pointer',
                                  bgcolor:
                                    active
                                      ? 'primary.50'
                                      : 'transparent',
                                  border:
                                    active
                                      ? '1px solid'
                                      : '1px solid transparent',
                                  borderColor:
                                    active
                                      ? 'primary.main'
                                      : 'transparent',
                                  boxShadow:
                                    snapshot.isDragging
                                      ? 3
                                      : 0,

                                  '&:hover': {
                                    bgcolor:
                                      active
                                        ? 'primary.50'
                                        : '#f1f5f9',
                                  },

                                  '&:hover .drag-handle':
                                    {
                                      opacity:
                                        isFilterActive
                                          ? 0
                                          : 0.6,
                                    },

                                  ...dragProvided
                                    .draggableProps
                                    .style,
                                }}
                              >
                                {/* Drag handle */}
                                <Box
                                  className="drag-handle"
                                  {...dragProvided.dragHandleProps}
                                  onClick={(e) =>
                                    e.stopPropagation()
                                  }
                                  sx={{
                                    display:
                                      'flex',
                                    alignItems:
                                      'center',
                                    opacity: 0,
                                    color:
                                      'text.secondary',
                                    cursor:
                                      isFilterActive
                                        ? 'default'
                                        : 'grab',
                                  }}
                                  title={
                                    isFilterActive
                                      ? 'Bỏ lọc để sắp xếp'
                                      : 'Kéo để sắp xếp'
                                  }
                                >
                                  <MorphIcon
                                    icon={
                                      GripVertical
                                    }
                                    size={14}
                                  />
                                </Box>

                                {/* Note icon */}
                                <MorphIcon
                                  icon={Icon}
                                  size={16}
                                />

                                {/* Note info */}
                                <Box
                                  sx={{
                                    flex: 1,
                                    minWidth: 0,
                                  }}
                                >
                                  <Typography
                                    variant="body2"
                                    noWrap
                                    sx={{
                                      fontWeight: 600,
                                    }}
                                  >
                                    {note.title ||
                                      'Không tiêu đề'}
                                  </Typography>

                                  <Box
                                    sx={{
                                      display:
                                        'flex',
                                      gap: 0.5,
                                      flexWrap:
                                        'wrap',
                                    }}
                                  >
                                    {note.tags
                                      .slice(
                                        0,
                                        2,
                                      )
                                      .map(
                                        (
                                          tag,
                                        ) => (
                                          <Chip
                                            key={
                                              tag
                                            }
                                            label={
                                              tag
                                            }
                                            size="small"
                                            sx={{
                                              height: 16,
                                              fontSize:
                                                '0.65rem',
                                            }}
                                          />
                                        ),
                                      )}
                                  </Box>
                                </Box>

                                {/* Pin */}
                                {note.isPinned && (
                                  <MorphIcon
                                    icon={Pin}
                                    size={14}
                                  />
                                )}

                                {/* Delete */}
                                <IconButton
                                  size="small"
                                  onClick={(
                                    e,
                                  ) => {
                                    e.stopPropagation();
                                    handleDelete(
                                      note.id,
                                    );
                                  }}
                                  sx={{
                                    color:
                                      '#d32f2f',
                                  }}
                                >
                                  <MorphIcon
                                    icon={
                                      Trash2
                                    }
                                    size={14}
                                  />
                                </IconButton>
                              </Box>
                            )}
                          </Draggable>
                        );
                      },
                    )}

                    {
                      dropProvided.placeholder
                    }
                  </Box>
                )}
              </Droppable>
            </DragDropContext>
          </Box>
        </Paper>
      </Box>

      {/* =====================================================
          CỘT PHẢI: NOTE EDITOR
          ===================================================== */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minWidth: 0,
          p: 2,
          overflow: 'hidden',
        }}
      >
        {selectedNote ? (
          <NoteEditorPane
            key={selectedNote.id}
            note={selectedNote}
            onTitleChange={
              handleTitleChange
            }
          />
        ) : (
          <Box
            sx={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
            >
              Chọn một note để xem, hoặc
              tạo note mới.
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}