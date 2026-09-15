'use client';

import { useUIStore } from '@/stores/useUIStore';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/components/ui/AppButton';
import Chip from '@mui/material/Chip';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { MorphIcon } from '@/components/ui/MorphIcon';
import { ArrowLeftRight, Calendar, ArrowRight, Clock } from 'lucide';
import { formatDateTime, formatDate } from '@/lib/date';

interface SprintProps {
  currentSprint: {
    id: string;
    name: string;
    goal: string | null;
    capacitySp: number;
    startDate?: Date;
    endDate?: Date;
    tasks: { id: string; title: string; storyPoints: number; type: string; project: { code: string } }[];
  } | null;
  backlogTasks: { id: string; title: string; storyPoints: number; project: { code: string }; createdAt?: Date }[];
  projects: { id: string; code: string; name: string }[];
}

export function SprintClientView({ currentSprint, backlogTasks, projects }: SprintProps) {
  const { setSprintGuardModalOpen } = useUIStore();

  const totalPoints = currentSprint?.tasks.reduce((sum, t) => sum + t.storyPoints, 0) || 0;
  const capacity = currentSprint?.capacitySp || 24;
  const capacityPercent = Math.min(100, Math.round((totalPoints / capacity) * 100));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Sprint Header & Capacity */}
      <Card>
        <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  {currentSprint?.name || 'Sprint Hiện Hành'}
                </Typography>
                <Chip label="Active Sprint" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.6875rem' }} />
              </Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                Mục tiêu Sprint: {currentSprint?.goal || 'Chưa thiết lập mục tiêu'}
              </Typography>
              {currentSprint?.startDate && currentSprint?.endDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <MorphIcon icon={Clock} size={14} />
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    Thời gian: {formatDateTime(currentSprint.startDate)} - {formatDateTime(currentSprint.endDate)}
                  </Typography>
                </Box>
              )}
            </Box>

            <AppButton
              size="small"
              startIcon={<MorphIcon icon={ArrowLeftRight} size={18} />}
              onClick={() => setSprintGuardModalOpen(true)}
            >
              Yêu Cầu Chen Ngang & Bù Trừ Task
            </AppButton>
          </Box>

          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                Khối lượng Sprint: <strong>{totalPoints} / {capacity} Story Points ({capacityPercent}%)</strong>
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: capacityPercent > 85 ? 'error.main' : 'success.main',
                }}
              >
                {capacity - totalPoints > 0
                  ? `Còn dư ${capacity - totalPoints} SP đệm an toàn`
                  : 'Đã đạt giới hạn năng lực tải!'}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={capacityPercent}
              color={capacityPercent > 85 ? 'error' : 'primary'}
              sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Backlog vs Roadmap Split */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Product Backlog */}
        <Card>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1, borderBottom: '1px solid #f1f5f9' }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Product Backlog (Kho Ý Tưởng Tính Năng)
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Kho lưu trữ các hạng mục tính năng dự kiến triển khai
                </Typography>
              </Box>
              <Chip label={`${backlogTasks.length} nhiệm vụ`} size="small" variant="outlined" sx={{ height: 22, fontSize: '0.6875rem' }} />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {backlogTasks.length === 0 ? (
                <Typography variant="caption" sx={{ color: 'text.secondary', py: 2, textAlign: 'center' }}>
                  Chưa có tính năng nào trong kho backlog
                </Typography>
              ) : (
                backlogTasks.map((t) => (
                  <Paper
                    key={t.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      bgcolor: '#f8fafc',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Chip
                        label={t.project.code}
                        size="small"
                        variant="outlined"
                        color={t.project.code === 'LMS' ? 'primary' : 'warning'}
                        sx={{ height: 20, fontSize: '0.625rem', fontWeight: 700 }}
                      />
                      <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                        {t.title}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'text.secondary' }}>
                        {t.storyPoints} SP
                      </Typography>
                      <Button
                        size="small"
                        variant="text"
                        color="primary"
                        endIcon={<MorphIcon icon={ArrowRight} size={14} />}
                        onClick={() => alert('Tính năng đẩy vào sprint đang được kết nối')}
                        sx={{ fontSize: '0.75rem', py: 0.25 }}
                      >
                        Vào Sprint
                      </Button>
                    </Box>
                  </Paper>
                ))
              )}
            </Box>
          </CardContent>
        </Card>

        {/* Roadmap Preview */}
        <Card>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ color: 'primary.main', display: 'flex', alignItems: 'center' }}>
                <MorphIcon icon={Calendar} size={18} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5 }}>
                LỘ TRÌNH PHÁT HÀNH (ROADMAP)
              </Typography>
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
              Kế hoạch phát hành các mốc tính năng trung tâm:
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box sx={{ pl: 2, borderLeft: '3px solid var(--color-primary)' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  THÁNG 9 / 2026 (HIỆN TẠI)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', mt: 0.25 }}>
                  Sprint 14: Điểm danh & Cổng thanh toán
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Giải quyết dứt điểm nghẽn mạng lúc 18h tối
                </Typography>
              </Box>

              <Box sx={{ pl: 2, borderLeft: '3px solid #cbd5e1' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                  THÁNG 10 / 2026
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>
                  Sprint 15: Tuyển sinh khóa mới & Chia lớp
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Tự động phân ca học viên theo kết quả test
                </Typography>
              </Box>

              <Box sx={{ pl: 2, borderLeft: '3px solid #cbd5e1' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                  QUÝ 4 / 2026
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', mt: 0.25 }}>
                  Sprint 16: AI Chấm phát âm Speaking
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Tích hợp OpenAI Whisper kiểm tra âm đuôi
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
