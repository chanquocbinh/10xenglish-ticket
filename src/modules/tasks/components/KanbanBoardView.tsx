'use client';

import { useKanbanBoard } from '@/modules/tasks/hooks/useKanbanBoard';
import type { TaskItem } from '@/modules/tasks/tasks.types';
import { formatDateTime } from '@/shared/utils/date';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import Chip from '@mui/material/Chip';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Plus, ChevronRight, ChevronLeft, X } from 'lucide';

export function KanbanBoardView({
  initialTasks,
  projects,
}: {
  initialTasks: TaskItem[];
  projects: { id: string; code: string; name: string }[];
}) {
  const {
    columns,
    tasks,
    isModalOpen,
    openModal,
    closeModal,
    title,
    setTitle,
    projectId,
    setProjectId,
    storyPoints,
    setStoryPoints,
    isSubmitting,
    submitCreateTask,
    moveForward,
    moveBackward,
  } = useKanbanBoard({ initialTasks, projects });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Top action header */}
      <Card>
        <CardContent
          sx={{
            p: 2.5,
            '&:last-child': { pb: 2.5 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Kanban Board: Nhiệm Vụ Sprint 14
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Theo dõi tiến độ kế hoạch và các hạng mục đột xuất phát sinh
            </Typography>
          </Box>
          <AppButton
            size="small"
            startIcon={<MorphIcon icon={Plus} size={18} />}
            onClick={openModal}
          >
            Thêm Task Mới
          </AppButton>
        </CardContent>
      </Card>

      {/* 4 Columns Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        {columns.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.key);
          return (
            <Paper
              key={col.key}
              variant="outlined"
              sx={{ p: 1.5, bgcolor: '#f8fafc', borderRadius: 2 }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  pb: 1.5,
                  mb: 1.5,
                  borderBottom: '2px solid',
                  borderColor: col.headerColor,
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  {col.label}
                </Typography>
                <Chip
                  label={colTasks.length}
                  size="small"
                  sx={{ height: 20, fontSize: '0.6875rem', fontWeight: 700 }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {colTasks.map((t) => (
                  <Card
                    key={t.id}
                    sx={{
                      p: 2,
                      borderRadius: 1.5,
                      border: t.type === 'UNPLANNED_BOSS' ? '1px solid #ff9800' : '1px solid #e2e8f0',
                      bgcolor: '#ffffff',
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <Chip
                          label={t.project.code}
                          size="small"
                          variant="outlined"
                          color={t.project.code === 'LMS' ? 'primary' : 'warning'}
                          sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
                        />
                        {t.type === 'UNPLANNED_BOSS' && (
                          <Chip
                            label="ĐỘT XUẤT"
                            size="small"
                            color="warning"
                            sx={{ height: 18, fontSize: '0.625rem', fontWeight: 700 }}
                          />
                        )}
                      </Box>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {t.storyPoints} SP
                      </Typography>
                    </Box>

                    <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', mb: 1 }}>
                      {t.title}
                    </Typography>

                    {t.signoffReason && (
                      <Paper
                        variant="outlined"
                        sx={{ p: 1, mb: 1, bgcolor: '#fef2f2', borderColor: '#fecaca', fontSize: '0.6875rem', color: '#b91c1c' }}
                      >
                        <strong>Yêu cầu chỉnh sửa:</strong> {t.signoffReason}
                      </Paper>
                    )}

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        pt: 1,
                        mt: 1,
                        borderTop: '1px solid #f1f5f9',
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
                          {t.assignee?.fullName || 'Digihome'}
                        </Typography>
                        {t.createdAt && (
                          <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.625rem', fontFamily: 'monospace' }}>
                            {formatDateTime(t.createdAt)}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {col.key !== 'TODO' && (
                          <IconButton
                            size="small"
                            onClick={() => moveBackward(t)}
                            sx={{ p: 0.5 }}
                          >
                            <MorphIcon icon={ChevronLeft} size={14} />
                          </IconButton>
                        )}
                        {col.key !== 'DONE' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => moveForward(t)}
                            sx={{ p: 0.5 }}
                          >
                            <MorphIcon icon={ChevronRight} size={14} />
                          </IconButton>
                        )}
                      </Box>
                    </Box>
                  </Card>
                ))}
              </Box>
            </Paper>
          );
        })}
      </Box>

      {/* Modal Create Task */}
      <Dialog
        open={isModalOpen}
        onClose={closeModal}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            width: '90vw',
            maxHeight: '90vh',
            borderRadius: 2,
          },
        }}
      >
        <DialogTitle
          component="div"
          sx={{
            m: 0,
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Typography component="div" variant="subtitle1" sx={{ fontWeight: 700 }}>
            Thêm Task Vào Kế Hoạch
          </Typography>
          <IconButton onClick={closeModal} size="small" sx={{ color: 'text.secondary' }}>
            <MorphIcon icon={X} size={18} />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={submitCreateTask}>
          <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Tên công việc"
              required
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Cập nhật font chữ in phiếu thu Zalo..."
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="task-proj-label">Dự án</InputLabel>
                <Select
                  labelId="task-proj-label"
                  label="Dự án"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                >
                  {projects.map((p) => (
                    <MenuItem key={p.id} value={p.id}>
                      {p.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Story Points"
                type="number"
                inputProps={{ min: 1, max: 13 }}
                required
                fullWidth
                size="small"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0' }}>
            <Button onClick={closeModal} color="inherit" size="small">
              Hủy
            </Button>
            <AppButton
              type="submit"
              size="small"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Lưu Nhiệm Vụ
            </AppButton>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
