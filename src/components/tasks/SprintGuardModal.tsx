'use client';

import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { swapSprintTaskAction } from '@/app/actions/task.actions';
import { useRouter } from 'next/navigation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Radio from '@mui/material/Radio';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import { MorphIcon } from '@/components/ui/MorphIcon';
import { X, ArrowLeftRight } from 'lucide';

interface TaskOption {
  id: string;
  title: string;
  storyPoints: number;
  project: { code: string };
}

export function SprintGuardModal({
  currentTasks,
  projects,
}: {
  currentTasks: TaskOption[];
  projects: { id: string; code: string }[];
}) {
  const { sprintGuardModalOpen, setSprintGuardModalOpen } = useUIStore();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [storyPoints, setStoryPoints] = useState(3);
  const [selectedProjCode, setSelectedProjCode] = useState<'LMS' | 'CRM'>('LMS');
  const [postponedTaskId, setPostponedTaskId] = useState('');
  const [bossReason, setBossReason] = useState('Yêu cầu điều chỉnh ưu tiên tính năng mới phát sinh');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentProj = projects.find((p) => p.code === selectedProjCode) || projects[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postponedTaskId) {
      setErrorMessage('Vui lòng chọn 1 task để hoãn lại sang Sprint sau');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    const res = await swapSprintTaskAction({
      title,
      projectId: currentProj.id,
      storyPoints: Number(storyPoints),
      postponedTaskId,
      bossReason,
    });

    setIsSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
      setSprintGuardModalOpen(false);
      setTitle('');
      setPostponedTaskId('');
      router.refresh();
    }
  };

  return (
    <Dialog
      open={sprintGuardModalOpen}
      onClose={() => setSprintGuardModalOpen(false)}
      maxWidth="sm"
      fullWidth
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
          Ràng Buộc Năng Lực Sprint (Capacity Guard)
        </Typography>
        <IconButton
          aria-label="close"
          onClick={() => setSprintGuardModalOpen(false)}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <MorphIcon icon={X} size={18} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          <Alert severity="warning" variant="outlined" sx={{ fontSize: '0.8125rem' }}>
            Sprint hiện tại đã cam kết đầy đủ khối lượng. Nếu cần thêm nhiệm vụ đột xuất vào Sprint, hệ thống yêu cầu <strong>chọn 1 task tương đương để dời sang Sprint sau</strong> nhằm bảo toàn thời hạn bàn giao.
          </Alert>

          <TextField
            label="Nhiệm vụ đột xuất cần ưu tiên vào Sprint"
            placeholder="VD: Cập nhật form xuất danh sách học viên theo ca..."
            required
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="guard-project-label">Dự án</InputLabel>
              <Select
                labelId="guard-project-label"
                label="Dự án"
                value={selectedProjCode}
                onChange={(e) => setSelectedProjCode(e.target.value as 'LMS' | 'CRM')}
              >
                <MenuItem value="LMS">Project 1: LMS Học Vụ</MenuItem>
                <MenuItem value="CRM">Project 2: CRM & Kế Toán</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Story Points (SP)"
              type="number"
              inputProps={{ min: 1, max: 13 }}
              required
              fullWidth
              size="small"
              value={storyPoints}
              onChange={(e) => setStoryPoints(Number(e.target.value))}
            />
          </Box>

          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1, color: 'text.primary' }}>
              Chọn task trong Sprint cần hoãn lại sang tuần sau:
            </Typography>

            <Paper variant="outlined" sx={{ p: 1.5, maxHeight: 180, overflowY: 'auto' }}>
              <RadioGroup
                value={postponedTaskId}
                onChange={(e) => setPostponedTaskId(e.target.value)}
              >
                {currentTasks.length === 0 ? (
                  <Typography variant="caption" sx={{ color: 'text.secondary', p: 1, display: 'block' }}>
                    Không có task nào trong sprint để hoãn lại
                  </Typography>
                ) : (
                  currentTasks.map((t) => (
                    <FormControlLabel
                      key={t.id}
                      value={t.id}
                      control={<Radio size="small" />}
                      label={
                        <Box sx={{ py: 0.5 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                            {t.title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {t.project.code} • {t.storyPoints} Story Points
                          </Typography>
                        </Box>
                      }
                      sx={{
                        m: 0,
                        px: 1,
                        borderRadius: 1,
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}
                    />
                  ))
                )}
              </RadioGroup>
            </Paper>
          </Box>

          <TextField
            label="Lý do điều chỉnh kế hoạch Sprint (Lưu vết audit)"
            multiline
            minRows={2}
            required
            fullWidth
            size="small"
            value={bossReason}
            onChange={(e) => setBossReason(e.target.value)}
          />
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setSprintGuardModalOpen(false)} color="inherit" size="small">
            Hủy
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="warning"
            size="small"
            disabled={isSubmitting}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MorphIcon icon={ArrowLeftRight} size={18} />
              )
            }
          >
            Xác Nhận Đổi Task
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
