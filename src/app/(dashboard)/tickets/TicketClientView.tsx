'use client';

import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { updateTicketStatusAction, addCommentAction } from '@/app/actions/ticket.actions';
import { useRouter } from 'next/navigation';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
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
import DialogActions from '@mui/material/DialogActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';

import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

type TicketWithDetails = {
  id: string;
  ticketNumber: number;
  title: string;
  submodule: string;
  affectedRole: string;
  severity: 'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW';
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'APPROVED' | 'CLOSED' | 'REJECTED';
  description: string | null;
  evidenceUrls: string[];
  createdAt: Date;
  project: { code: string; name: string };
  reporter: { fullName: string };
  comments: { id: string; content: string; createdAt: Date; user: { fullName: string } }[];
  auditLogs: { id: string; detail: string; createdAt: Date; user: { fullName: string } }[];
};

export function TicketClientView({ initialTickets }: { initialTickets: TicketWithDetails[] }) {
  const { setTicketModalOpen } = useUIStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<TicketWithDetails | null>(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const router = useRouter();

  const filteredTickets = initialTickets.filter((t) => {
    const matchSearch =
      searchTerm === '' ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `#tk-${t.ticketNumber}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSeverity = severityFilter === '' || t.severity === severityFilter;
    const matchStatus = statusFilter === '' || t.status === statusFilter;
    return matchSearch && matchSeverity && matchStatus;
  });

  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null);

  const handleUpdateStatus = async (status: TicketWithDetails['status']) => {
    if (!selectedTicket) return;
    const res = await updateTicketStatusAction(selectedTicket.id, status);
    if (res.success) {
      setSelectedTicket((prev) => (prev ? { ...prev, status } : null));
      router.refresh();
    }
  };

  const handleQuickUpdateStatus = async (ticketId: string, status: TicketWithDetails['status']) => {
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

    if (res.success && res.comment) {
      setSelectedTicket((prev) =>
        prev
          ? {
              ...prev,
              comments: [...prev.comments, res.comment as unknown as TicketWithDetails['comments'][0]],
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
                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
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
                <MenuItem value="BLOCKER" sx={{ fontSize: '0.8125rem' }}>
                  Blocker (Cháy)
                </MenuItem>
                <MenuItem value="HIGH" sx={{ fontSize: '0.8125rem' }}>
                  High
                </MenuItem>
                <MenuItem value="MEDIUM" sx={{ fontSize: '0.8125rem' }}>
                  Medium
                </MenuItem>
                <MenuItem value="LOW" sx={{ fontSize: '0.8125rem' }}>
                  Low
                </MenuItem>
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
                <MenuItem value="NEW" sx={{ fontSize: '0.8125rem' }}>
                  Mới tiếp nhận
                </MenuItem>
                <MenuItem value="IN_PROGRESS" sx={{ fontSize: '0.8125rem' }}>
                  Đang xử lý
                </MenuItem>
                <MenuItem value="RESOLVED" sx={{ fontSize: '0.8125rem' }}>
                  Đã fix (Chờ test)
                </MenuItem>
                <MenuItem value="APPROVED" sx={{ fontSize: '0.8125rem' }}>
                  Đã nghiệm thu
                </MenuItem>
                <MenuItem value="CLOSED" sx={{ fontSize: '0.8125rem' }}>
                  Đóng
                </MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setTicketModalOpen(true)}
          >
            Báo Bug Mới
          </Button>
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
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    {t.submodule}
                  </Typography>
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
                        bgcolor:
                          t.severity === 'BLOCKER'
                            ? '#d32f2f'
                            : t.severity === 'HIGH'
                            ? '#ea580c'
                            : t.severity === 'MEDIUM'
                            ? '#eab308'
                            : '#94a3b8',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color:
                          t.severity === 'BLOCKER'
                            ? '#d32f2f'
                            : t.severity === 'HIGH'
                            ? '#c2410c'
                            : 'text.primary',
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
                          bgcolor:
                            t.status === 'APPROVED'
                              ? '#2e7d32'
                              : t.status === 'RESOLVED'
                              ? '#ea580c'
                              : t.status === 'IN_PROGRESS'
                              ? '#1976d2'
                              : t.status === 'NEW'
                              ? '#64748b'
                              : '#475569',
                        }}
                      />
                    )}

                    <Select
                      size="small"
                      variant="standard"
                      disableUnderline
                      value={t.status}
                      disabled={updatingTicketId === t.id}
                      onChange={(e) =>
                        handleQuickUpdateStatus(t.id, e.target.value as TicketWithDetails['status'])
                      }
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color:
                          t.status === 'APPROVED'
                            ? 'success.main'
                            : t.status === 'RESOLVED'
                            ? 'warning.dark'
                            : t.status === 'IN_PROGRESS'
                            ? 'primary.main'
                            : 'text.secondary',
                        '& .MuiSelect-select': {
                          py: 0.25,
                          pr: '20px !important',
                        },
                      }}
                    >
                      <MenuItem value="NEW" sx={{ fontSize: '0.75rem' }}>
                        Mới tiếp nhận
                      </MenuItem>
                      <MenuItem value="IN_PROGRESS" sx={{ fontSize: '0.75rem' }}>
                        Đang xử lý
                      </MenuItem>
                      <MenuItem value="RESOLVED" sx={{ fontSize: '0.75rem' }}>
                        Đã fix (Chờ test)
                      </MenuItem>
                      <MenuItem value="APPROVED" sx={{ fontSize: '0.75rem' }}>
                        Đã nghiệm thu
                      </MenuItem>
                      <MenuItem value="CLOSED" sx={{ fontSize: '0.75rem' }}>
                        Đóng
                      </MenuItem>
                    </Select>
                  </Box>
                </TableCell>

                <TableCell onClick={() => setSelectedTicket(t)} sx={{ whiteSpace: 'nowrap' }}>
                  {t.evidenceUrls.length > 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                      <AttachFileIcon fontSize="inherit" />
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
                  <Button
                    size="small"
                    variant="text"
                    color="primary"
                    onClick={() => setSelectedTicket(t)}
                    sx={{ minWidth: 'auto', p: 0.5, fontSize: '0.75rem' }}
                  >
                    Chi tiết
                  </Button>
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
          maxWidth="md"
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
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>

          <DialogContent sx={{ p: 3, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Meta tags */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
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
                      startIcon={<OpenInNewIcon fontSize="small" />}
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
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => handleUpdateStatus('IN_PROGRESS')}
                >
                  Đang Xử Lý
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  size="small"
                  onClick={() => handleUpdateStatus('RESOLVED')}
                >
                  Đã Fix (Chờ Test)
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleUpdateStatus('APPROVED')}
                >
                  Nghiệm Thu (Đạt)
                </Button>
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
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(c.createdAt).toLocaleTimeString('vi-VN')}
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
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmittingComment}
                  startIcon={isSubmittingComment ? <CircularProgress size={16} color="inherit" /> : <SendIcon fontSize="small" />}
                >
                  Gửi
                </Button>
              </Box>
            </Box>
          </DialogContent>
        </Dialog>
      )}
    </Box>
  );
}
