'use client';

import { useState } from 'react';
import { useUIStore } from '@/shared/stores/ui.store';
import { updateTicketStatusAction, addCommentAction } from '@/modules/tickets/tickets.actions';
import { useRouter } from 'next/navigation';
import { formatDateTime } from '@/shared/utils/date';
import { AuthJWTPayload } from '@/core/auth/auth.types';
import { hasPermission } from '@/core/auth/permissions';
import type { TicketStatus, TicketWithDetails } from '@/modules/tickets/tickets.types';
import {
  SEVERITY_DOT_COLOR,
  SEVERITY_OPTIONS,
  SEVERITY_TEXT_COLOR,
  STATUS_DOT_COLOR,
  STATUS_OPTIONS,
  STATUS_TEXT_COLOR,
} from '@/modules/tickets/tickets.constants';
import { useTicketFilters } from '@/modules/tickets/hooks/useTicketFilters';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { Search, Plus, Paperclip, X, Send, ExternalLink, Eye } from 'lucide';
import { TableActionMenu } from '@/shared/ui/TableActionMenu';

export function TicketListView({ initialTickets, currentUser }: { initialTickets: TicketWithDetails[]; currentUser: AuthJWTPayload }) {
  const { setTicketModalOpen } = useUIStore();
  const {
    searchTerm,
    setSearchTerm,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    filteredTickets,
  } = useTicketFilters(initialTickets);
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const router = useRouter();
  const canApprove = hasPermission(currentUser, 'tickets.approve');

  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  const handleUpdateStatus = async (status: TicketStatus) => {
    if (!selectedTicket) return;
    const res = await updateTicketStatusAction(selectedTicket.id, status);
    if (res.success) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
      router.refresh();
    }
  };

  const handleQuickUpdateStatus = async (ticketId: string, status: TicketStatus) => {
    setUpdatingTicketId(ticketId);
    await updateTicketStatusAction(ticketId, status);
    setUpdatingTicketId(null);
    router.refresh();
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !commentText.trim()) return;
    setIsSubmittingComment(true);

    const res = await addCommentAction(selectedTicket.id, commentText);
    setIsSubmittingComment(false);

    if (res.success) {
      const comment = res.data;
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, comment],
            }
          : null
      );
      setCommentText('');
      router.refresh();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Controls */}
      <Card>
        <CardContent
          sx={{
            p: 2,
            '&:last-child': { pb: 2 },
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5, flex: 1 }}>
            <TextField
              size="small"
              placeholder="Tìm kiếm ticket, mã #TK..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Box sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center' }}>
                      <MorphIcon icon={Search} size={18} />
                    </Box>
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 260 }}
            />

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <Select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                displayEmpty
                sx={{ fontSize: '0.8125rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                  Tất cả mức độ
                </MenuItem>
                {SEVERITY_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.8125rem' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                displayEmpty
                sx={{ fontSize: '0.8125rem' }}
              >
                <MenuItem value="" sx={{ fontSize: '0.8125rem' }}>
                  Tất cả trạng thái
                </MenuItem>
                {STATUS_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.8125rem' }}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <AppButton
            size="small"
            startIcon={<MorphIcon icon={Plus} size={18} />}
            onClick={() => setTicketModalOpen(true)}
          >
            Báo Bug Mới
          </AppButton>
        </CardContent>
      </Card>

      {/* Ticket Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 1050 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 100, whiteSpace: 'nowrap' }}>Mã Ticket</TableCell>
              <TableCell sx={{ minWidth: 260, whiteSpace: 'nowrap' }}>Tiêu đề Bug & Phân hệ</TableCell>
              <TableCell sx={{ width: 110, whiteSpace: 'nowrap' }}>Dự án</TableCell>
              <TableCell sx={{ width: 150, whiteSpace: 'nowrap' }}>Người báo</TableCell>
              <TableCell sx={{ width: 130, whiteSpace: 'nowrap' }}>Mức độ</TableCell>
              <TableCell sx={{ width: 180, whiteSpace: 'nowrap' }}>Trạng thái</TableCell>
              <TableCell sx={{ width: 90, whiteSpace: 'nowrap' }}>Đính kèm</TableCell>
              <TableCell sx={{ width: 80, whiteSpace: 'nowrap' }} align="right">
                Thao tác
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTickets.map((t) => (
              <TableRow
                key={t.id}
                hover
                sx={{ cursor: 'pointer' }}
              >
                <TableCell
                  onClick={() => setSelectedTicket(t)}
                  sx={{ fontWeight: 700, fontFamily: 'monospace', color: 'primary.main', whiteSpace: 'nowrap' }}
                >
                  #TK-{t.ticketNumber}
                </TableCell>

                <TableCell onClick={() => setSelectedTicket(t)} sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {t.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {t.submodule}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.6875rem' }}>•</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                      {formatDateTime(t.createdAt)}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell onClick={() => setSelectedTicket(t)} sx={{ whiteSpace: 'nowrap' }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      fontFamily: 'monospace',
                      color: t.project.code === 'LMS' ? 'primary.main' : 'warning.dark',
                    }}
                  >
                    {t.project.code}
                  </Typography>
                </TableCell>

                <TableCell onClick={() => setSelectedTicket(t)} sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
                  {t.reporter.fullName}
                </TableCell>

                {/* Severity: Text + Color Indicator */}
                <TableCell onClick={() => setSelectedTicket(t)} sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: SEVERITY_DOT_COLOR[t.severity],
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: SEVERITY_TEXT_COLOR[t.severity],
                      }}
                    >
                      {t.severity}
                    </Typography>
                  </Box>
                </TableCell>

                {/* Status: Quick Update Dropdown */}
                <TableCell sx={{ whiteSpace: 'nowrap' }} onClick={(e) => e.stopPropagation()}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {updatingTicketId === t.id ? (
                      <CircularProgress size={16} />
                    ) : (
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          bgcolor: STATUS_DOT_COLOR[t.status],
                        }}
                      />
                    )}

                    <Select
                      size="small"
                      variant="standard"
                      disableUnderline
                      value={t.status}
                      disabled={updatingTicketId === t.id}
                      onChange={(e) => handleQuickUpdateStatus(t.id, e.target.value as TicketStatus)}
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: STATUS_TEXT_COLOR[t.status],
                        '& .MuiSelect-select': {
                          py: 0.25,
                          pr: '20px !important',
                        },
                      }}
                    >
                      {STATUS_OPTIONS.filter((option) => option.value !== 'APPROVED' || canApprove).map((option) => (
                        <MenuItem key={option.value} value={option.value} sx={{ fontSize: '0.75rem' }}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>
                </TableCell>

                <TableCell onClick={() => setSelectedTicket(t)} sx={{ whiteSpace: 'nowrap' }}>
                  {t.evidenceUrls.length > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <MorphIcon icon={Paperclip} size={14} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {t.evidenceUrls.length}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                      -
                    </Typography>
                  )}
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <TableActionMenu
                    actions={[
                      {
                        label: 'Xem Chi Tiết',
                        icon: Eye,
                        onClick: () => setSelectedTicket(t),
                      },
                    ]}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Ticket Detail Dialog */}
      {selectedTicket && (
        <Dialog
          open={Boolean(selectedTicket)}
          onClose={() => setSelectedTicket(null)}
          maxWidth="xl"
          fullWidth
          PaperProps={{
            sx: {
              width: '95vw',
              maxHeight: '92vh',
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
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, minWidth: 0 }}>
              <Typography
                component="span"
                variant="subtitle2"
                sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'primary.main' }}
              >
                #TK-{selectedTicket.ticketNumber}
              </Typography>
              <Divider orientation="vertical" flexItem />
              <Typography component="span" variant="subtitle2" noWrap sx={{ fontWeight: 700 }}>
                {selectedTicket.title}
              </Typography>
            </Box>
            <IconButton
              onClick={() => setSelectedTicket(null)}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <MorphIcon icon={X} size={18} />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Meta tags */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(5, 1fr)' },
                gap: 1.5,
                p: 1.5,
                bgcolor: '#f8fafc',
                borderRadius: 1.5,
                border: '1px solid #e2e8f0',
              }}
            >
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Dự án:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  {selectedTicket.project.name}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Phân hệ:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  {selectedTicket.submodule}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Mức độ:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, fontSize: '0.8125rem', color: 'error.main' }}>
                  {selectedTicket.severity}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Người báo:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                  {selectedTicket.reporter.fullName}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                  Thời gian tạo:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                  {formatDateTime(selectedTicket.createdAt)}
                </Typography>
              </Box>
            </Box>

            {/* Description */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                Mô tả các bước tái hiện:
              </Typography>
              <Paper
                variant="outlined"
                sx={{ p: 2, bgcolor: '#f8fafc', whiteSpace: 'pre-wrap', fontSize: '0.8125rem' }}
              >
                {selectedTicket.description}
              </Paper>
            </Box>

            {/* Evidence Attachments */}
            {selectedTicket.evidenceUrls.length > 0 && (
              <Box>
                <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1 }}>
                  Tệp tin đính kèm:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {selectedTicket.evidenceUrls.map((url, i) => (
                    <Button
                      key={i}
                      component="a"
                      href={url}
                      target="_blank"
                      variant="outlined"
                      size="small"
                      startIcon={<MorphIcon icon={ExternalLink} size={14} />}
                    >
                      Mở tệp tin {i + 1}
                    </Button>
                  ))}
                </Box>
              </Box>
            )}

            {/* Status Update Quick Action */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: '#f1f5f9',
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Cập nhật tiến độ xử lý:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <AppButton
                  size="small"
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                >
                  Đang Xử Lý
                </AppButton>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                >
                  Đã Fix (Chờ Test)
                </Button>
                {canApprove && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => handleUpdateStatus('APPROVED')}
                  >
                    Nghiệm Thu (Đạt)
                  </Button>
                )}
              </Box>
            </Paper>

            {/* Comments */}
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 1.5 }}>
                Trao đổi & Bình luận ({selectedTicket.comments.length})
              </Typography>

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2, maxHeight: 180, overflowY: 'auto' }}>
                {selectedTicket.comments.map((c) => (
                  <Paper key={c.id} variant="outlined" sx={{ p: 1.5, bgcolor: '#f8fafc' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {c.user.fullName}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.6875rem', fontFamily: 'monospace' }}>
                        {formatDateTime(c.createdAt)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                      {c.content}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Box component="form" onSubmit={handleAddComment} sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Nhập nội dung trao đổi..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <AppButton
                  type="submit"
                  disabled={isSubmittingComment}
                  startIcon={isSubmittingComment ? <CircularProgress size={16} color="inherit" /> : <MorphIcon icon={Send} size={16} />}
                >
                  Gửi
                </AppButton>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}
