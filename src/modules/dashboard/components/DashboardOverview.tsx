import Link from 'next/link';
import { formatDateTime } from '@/shared/utils/date';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { AppButton } from '@/shared/ui/AppButton';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Bug, CheckCircle, Clock, ShieldCheck, Download, ArrowRight } from 'lucide';

import { MODULE_PROGRESS } from '../dashboard.constants';
import type { DashboardData } from '../dashboard.types';

export function DashboardOverview({
  pendingBugsCount,
  blockerBugsCount,
  pendingApprovalCount,
  totalTasks,
  doneTasks,
  progressPercent,
  currentSprint,
  recentAuditLogs,
}: DashboardData) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 4 Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        <Card sx={{ borderLeft: '4px solid #d32f2f' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  TỔNG BUG ĐANG MỞ
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'error.main', mt: 0.5 }}>
                  {pendingBugsCount}
                </Typography>
                <Typography variant="caption" sx={{ color: 'error.dark', fontWeight: 600, display: 'block', mt: 1 }}>
                  {blockerBugsCount} lỗi Blocker nghiêm trọng
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: '#fee2e2',
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MorphIcon icon={Bug} size={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '4px solid var(--color-primary)' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  TIẾN ĐỘ SPRINT 14
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.main', mt: 0.5 }}>
                  {progressPercent}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, display: 'block', mt: 1 }}>
                  {doneTasks}/{totalTasks} tasks hoàn thành
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: '#dbeafe',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MorphIcon icon={CheckCircle} size={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '4px solid #2e7d32' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  THỜI GIAN FIX TB
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mt: 0.5 }}>
                  3.2 giờ
                </Typography>
                <Typography variant="caption" sx={{ color: 'success.main', fontWeight: 600, display: 'block', mt: 1 }}>
                  Tối ưu 25% trong tuần
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: '#dcfce7',
                  color: '#16a34a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MorphIcon icon={Clock} size={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderLeft: '4px solid #ed6c02' }}>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  CHỜ DUYỆT NGHIỆM THU
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.main', mt: 0.5 }}>
                  {pendingApprovalCount} việc
                </Typography>
                <Typography variant="caption" sx={{ color: 'warning.dark', fontWeight: 600, display: 'block', mt: 1 }}>
                  Cần ký duyệt UAT
                </Typography>
              </Box>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1,
                  bgcolor: '#ffedd5',
                  color: '#ea580c',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MorphIcon icon={ShieldCheck} size={20} />
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Main Sections */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' }, gap: 3 }}>
        {/* Module breakdown progress */}
        <Card>
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Tiến Độ Theo Phân Hệ Nghiệp Vụ
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Minh chứng kết quả thực tế để nghiệm thu tiến độ
                </Typography>
              </Box>
              <AppButton
                size="small"
                startIcon={<MorphIcon icon={Download} size={18} />}
              >
                Xuất Báo Cáo Tiến Độ
              </AppButton>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {MODULE_PROGRESS.map((module) => (
                <Box key={module.label}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {module.label}
                    </Typography>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: `${module.color}.main` }}>
                      {module.statusLabel}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={module.value}
                    color={module.color}
                    sx={{ height: 8, borderRadius: 4, bgcolor: '#f1f5f9' }}
                  />
                </Box>
              ))}
            </Box>

            {currentSprint && (
              <Box sx={{ mt: 3, p: 2, bgcolor: '#f8fafc', borderRadius: 1.5, border: '1px solid #e2e8f0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Sprint Goal ({currentSprint.name}):
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.5 }}>
                  {currentSprint.goal}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Audit Log Widget */}
        <Card sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <CardContent sx={{ p: 3, pb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1.5, borderBottom: '1px solid #f1f5f9' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5 }}>
                LƯU VẾT NGHIỆM THU (AUDIT)
              </Typography>
              <Chip label="Real-time" size="small" color="success" variant="outlined" sx={{ height: 20, fontSize: '0.6875rem' }} />
            </Box>

            <List disablePadding sx={{ mt: 1.5, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {recentAuditLogs.map((log) => (
                <ListItem key={log.id} disablePadding sx={{ alignItems: 'flex-start' }}>
                  <Box
                    sx={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      mt: 1,
                      mr: 1.5,
                      flexShrink: 0,
                    }}
                  />
                  <ListItemText
                    primary={log.user.fullName}
                    secondary={
                      <>
                        <Typography component="span" variant="caption" sx={{ color: 'text.primary', display: 'block' }}>
                          {log.detail}
                        </Typography>
                        <Typography component="span" variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                          {formatDateTime(log.createdAt)}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>

          <Box sx={{ p: 2, pt: 0 }}>
            <Divider sx={{ mb: 2 }} />
            <Link href="/approval" style={{ textDecoration: 'none' }}>
              <AppButton
                fullWidth
                size="small"
                endIcon={<MorphIcon icon={ArrowRight} size={16} />}
              >
                Đến Trang Phê Duyệt Nghiệm Thu
              </AppButton>
            </Link>
          </Box>
        </Card>
      </Box>
    </Box>
  );
}
