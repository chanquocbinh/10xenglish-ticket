'use client';

import { useState } from 'react';
import { signOffAction } from '@/app/actions/task.actions';
import { useRouter } from 'next/navigation';
import { AuthJWTPayload } from '@/types/auth';
import { formatDateTime } from '@/lib/date';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import { MorphIcon } from '@/components/ui/MorphIcon';
import { Check, X, Shield, CheckCircle } from 'lucide';

interface ApprovalProps {
  currentUser: AuthJWTPayload;
  pendingTasks: {
    id: string;
    title: string;
    storyPoints: number;
    project: { code: string; name: string };
    assignee: { fullName: string } | null;
  }[];
  pendingTickets: {
    id: string;
    ticketNumber: number;
    title: string;
    severity: string;
    project: { code: string };
    reporter: { fullName: string };
    evidenceUrls: string[];
  }[];
  auditLogs: {
    id: string;
    action: string;
    detail: string;
    createdAt: Date;
    user: { fullName: string };
  }[];
}

export function ApprovalClientView({
  currentUser,
  pendingTasks,
  pendingTickets,
  auditLogs,
}: ApprovalProps) {
  const router = useRouter();
  const [rejectModalTarget, setRejectModalTarget] = useState<{
    type: 'TICKET' | 'TASK';
    id: string;
    name: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const canSignOff = currentUser.role === 'MANAGER' || currentUser.role === 'DEV_ADMIN';

  const handleApprove = async (type: 'TICKET' | 'TASK', id: string, name: string) => {
    if (!canSignOff) {
      alert('Chỉ tài khoản Quản lý (Role: MANAGER hoặc DEV_ADMIN) mới có quyền ký duyệt nghiệm thu!');
      return;
    }
    if (confirm(`Xác nhận phê duyệt ĐẠT cho: "${name}"?`)) {
      setIsProcessing(true);
      await signOffAction({ targetType: type, targetId: id, action: 'APPROVE' });
      setIsProcessing(false);
      router.refresh();
    }
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalTarget || !rejectReason.trim()) return;

    setIsProcessing(true);
    const res = await signOffAction({
      targetType: rejectModalTarget.type,
      targetId: rejectModalTarget.id,
      action: 'REJECT',
      reason: rejectReason,
    });
    setIsProcessing(false);

    if (res.error) {
      alert(res.error);
    } else {
      setRejectModalTarget(null);
      setRejectReason('');
      router.refresh();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Notice Protocol */}
      <Alert
        severity="info"
        variant="outlined"
        icon={<MorphIcon icon={Shield} size={20} />}
        sx={{ bgcolor: 'background.paper', fontSize: '0.8125rem' }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
          Quy Trình Phê Duyệt Nghiệm Thu (UAT Sign-off Protocol)
        </Typography>
        Khi nhân sự kỹ thuật hoàn tất tính năng hoặc sửa xong Bug, người quản lý/nghiệm thu bấm trực tiếp <strong>"Chấp thuận nghiệm thu"</strong> hoặc <strong>"Yêu cầu sửa lại"</strong> (bắt buộc nhập lý do). Toàn bộ quyết định được lưu vết thời gian thực vào hệ thống làm biên bản nghiệm thu.
      </Alert>

      {/* Grid items awaiting approval */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', lg: '1fr 1fr' }, gap: 2.5 }}>
        {/* Pending Tickets */}
        {pendingTickets.map((tk) => (
          <Card key={tk.id} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label={`#TK-${tk.ticketNumber} • ${tk.severity}`}
                  size="small"
                  color="error"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700, fontFamily: 'monospace' }}
                />
                <Chip
                  label="Chờ Duyệt UAT"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                />
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {tk.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Dự án: {tk.project.code} • Người báo: {tk.reporter.fullName}
              </Typography>

              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f8fafc' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Báo cáo kết quả xử lý:
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Đã hoàn tất chỉnh sửa mã nguồn, kiểm tra tải và cập nhật lên môi trường thử nghiệm thành công. Vui lòng kiểm tra và nghiệm thu.
                </Typography>
              </Paper>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                size="small"
                fullWidth
                disabled={isProcessing}
                startIcon={<MorphIcon icon={Check} size={16} />}
                onClick={() => handleApprove('TICKET', tk.id, tk.title)}
              >
                Chấp Thuận Nghiệm Thu (Đạt)
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                disabled={isProcessing}
                startIcon={<MorphIcon icon={X} size={16} />}
                onClick={() => setRejectModalTarget({ type: 'TICKET', id: tk.id, name: tk.title })}
              >
                Yêu Cầu Sửa Lại
              </Button>
            </CardActions>
          </Card>
        ))}

        {/* Pending Tasks */}
        {pendingTasks.map((t) => (
          <Card key={t.id} sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Chip
                  label={`FEATURE • ${t.project.code}`}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 700 }}
                />
                <Chip
                  label="Chờ Duyệt UAT"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                />
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
                {t.title}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
                Story Points: {t.storyPoints} SP • Người thực hiện: {t.assignee?.fullName || 'Chưa gán'}
              </Typography>

              <Paper variant="outlined" sx={{ p: 1.5, bgcolor: '#f8fafc' }}>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                  Tiêu chí hoàn thành (DoD):
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                  Đã hoàn tất danh sách công việc và triển khai lên hệ thống kiểm thử. Sẵn sàng đánh giá UAT.
                </Typography>
              </Paper>
            </CardContent>

            <CardActions sx={{ p: 2, pt: 0, gap: 1 }}>
              <Button
                variant="contained"
                color="success"
                size="small"
                fullWidth
                disabled={isProcessing}
                startIcon={<MorphIcon icon={Check} size={16} />}
                onClick={() => handleApprove('TASK', t.id, t.title)}
              >
                Chấp Thuận Nghiệm Thu (Đạt)
              </Button>
              <Button
                variant="outlined"
                color="error"
                size="small"
                fullWidth
                disabled={isProcessing}
                startIcon={<MorphIcon icon={X} size={16} />}
                onClick={() => setRejectModalTarget({ type: 'TASK', id: t.id, name: t.title })}
              >
                Yêu Cầu Sửa Lại
              </Button>
            </CardActions>
          </Card>
        ))}
      </Box>

      {pendingTickets.length === 0 && pendingTasks.length === 0 && (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Box sx={{ color: 'success.main', display: 'flex', justifyContent: 'center', mb: 1 }}>
            <MorphIcon icon={CheckCircle} size={40} />
          </Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Hiện không có hạng mục nào chờ nghiệm thu
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Mọi tính năng và bug đều đã được xử lý hoặc nghiệm thu hoàn tất.
          </Typography>
        </Card>
      )}

      {/* Audit History */}
      <Card>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: 0.5, display: 'block', mb: 2 }}>
            LỊCH SỬ CÁC QUYẾT ĐỊNH NGHIỆM THU ĐÃ LƯU VẾT
          </Typography>

          <List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {auditLogs.map((log) => (
              <ListItem
                key={log.id}
                disablePadding
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  bgcolor: '#f8fafc',
                  border: '1px solid #f1f5f9',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <ListItemText
                  primary={log.detail}
                  secondary={`Người duyệt: ${log.user.fullName} • ${formatDateTime(log.createdAt)}`}
                  primaryTypographyProps={{ fontSize: '0.8125rem', fontWeight: 600 }}
                  secondaryTypographyProps={{ fontSize: '0.6875rem' }}
                />
                <Chip
                  label={log.action === 'APPROVE_SIGNOFF' ? 'Đã duyệt đạt' : 'Yêu cầu sửa'}
                  size="small"
                  color={log.action === 'APPROVE_SIGNOFF' ? 'success' : 'error'}
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.6875rem', fontWeight: 600 }}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Modal Rejection Reason */}
      {rejectModalTarget && (
        <Dialog open={Boolean(rejectModalTarget)} onClose={() => setRejectModalTarget(null)} maxWidth="xs" fullWidth>
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
            <Typography component="div" variant="subtitle1" sx={{ fontWeight: 700, color: 'error.main' }}>
              Yêu Cầu Sửa Lại (Nhập Lý Do)
            </Typography>
            <IconButton onClick={() => setRejectModalTarget(null)} size="small" sx={{ color: 'text.secondary' }}>
              <MorphIcon icon={X} size={18} />
            </IconButton>
          </DialogTitle>

          <Box component="form" onSubmit={handleConfirmReject}>
            <DialogContent sx={{ p: 2.5 }}>
              <Typography variant="body2" sx={{ mb: 2, fontSize: '0.8125rem' }}>
                Đang từ chối nghiệm thu cho: <strong>{rejectModalTarget.name}</strong>
              </Typography>

              <TextField
                label="Lý do chưa đạt"
                placeholder="Nhập cụ thể điểm chưa đạt để Dev sửa lại..."
                multiline
                rows={3}
                required
                fullWidth
                size="small"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </DialogContent>

            <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0' }}>
              <Button onClick={() => setRejectModalTarget(null)} color="inherit" size="small">
                Hủy Bỏ
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="error"
                size="small"
                disabled={isProcessing}
                startIcon={isProcessing ? <CircularProgress size={16} color="inherit" /> : null}
              >
                Gửi Yêu Cầu Chỉnh Sửa
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}
