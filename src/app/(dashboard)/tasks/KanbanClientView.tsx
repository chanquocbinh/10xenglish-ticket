'use client';

import { useState } from 'react';
import { updateTaskStatusAction, createTaskAction } from '@/app/actions/task.actions';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
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

import AddIcon from '@mui/icons-material/Add';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';

type TaskItem = {
  id: string;
  title: string;
  type: 'PLANNED' | 'UNPLANNED_BOSS';
  status: 'TODO' | 'IN_PROGRESS' | 'PENDING_APPROVAL' | 'DONE';
  storyPoints: number;
  project: { code: string; name: string };
  assignee: { fullName: string } | null;
  checklists: unknown;
  signoffReason: string | null;
};

export function KanbanClientView({
  initialTasks,
  projects,
}: {
  initialTasks: TaskItem[];
  projects: { id: string; code: string; name: string }[];
}) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [projectId, setProjectId] = useState(projects[0]?.id || '');
  const [storyPoints, setStoryPoints] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleStatusChange = async (taskId: string, newStatus: TaskItem['status']) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    await updateTaskStatusAction(taskId, newStatus);
    router.refresh();
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await createTaskAction({
      title,
      projectId,
      storyPoints: Number(storyPoints),
      type: 'PLANNED',
    });
    setIsSubmitting(false);

    if (res.success && res.task) {
      setIsModalOpen(false);
      setTitle('');
      router.refresh();
    }
  };

  const columns: { key: TaskItem['status']; label: string; headerColor: string }[] = [
    { key: 'TODO', label: 'CẦN LÀM (TO DO)', headerColor: '#64748b' },
    { key: 'IN_PROGRESS', label: 'ĐANG LÀM (IN PROGRESS)', headerColor: '#1976d2' },
    { key: 'PENDING_APPROVAL', label: 'CHỜ DUYỆT (UAT)', headerColor: '#ed6c02' },
    { key: 'DONE', label: 'ĐÃ XONG (DONE)', headerColor: '#2e7d32' },
  ];

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
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Thêm Task Mới
          </Button>
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
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem' }}>
                        {t.assignee?.fullName || 'Digihome'}
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {col.key !== 'TODO' && (
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleStatusChange(
                                t.id,
                                col.key === 'DONE'
                                  ? 'PENDING_APPROVAL'
                                  : col.key === 'PENDING_APPROVAL'
                                  ? 'IN_PROGRESS'
                                  : 'TODO'
                              )
                            }
                            sx={{ p: 0.5 }}
                          >
                            <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
                          </IconButton>
                        )}
                        {col.key !== 'DONE' && (
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() =>
                              handleStatusChange(
                                t.id,
                                col.key === 'TODO'
                                  ? 'IN_PROGRESS'
                                  : col.key === 'IN_PROGRESS'
                                  ? 'PENDING_APPROVAL'
                                  : 'DONE'
                              )
                            }
                            sx={{ p: 0.5 }}
                          >
                            <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
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
      <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)} maxWidth="xs" fullWidth>
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
          <IconButton onClick={() => setIsModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleCreateTask}>
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
            <Button onClick={() => setIsModalOpen(false)} color="inherit" size="small">
              Hủy
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="small"
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
            >
              Lưu Nhiệm Vụ
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
