'use client';

import { useState } from 'react';
import { useUIStore } from '@/shared/stores/ui.store';
import { toast } from '@/shared/stores/toast.store';
import { createTicketAction } from '@/modules/tickets/tickets.actions';
import { useFileUpload } from '@/modules/storage/hooks/useFileUpload';
import type { TicketSeverity } from '@/modules/tickets/tickets.types';
import { usePathname, useRouter } from 'next/navigation';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { X, UploadCloud, Paperclip, CheckCircle } from 'lucide';

export function CreateTicketModal({
  projects,
}: {
  projects: { id: string; code: string; name: string }[];
}) {
  const { ticketModalOpen, setTicketModalOpen } = useUIStore();
  const pathname = usePathname();
  const router = useRouter();

  const activeCode = pathname.split('/').filter(Boolean)[0];
  const initialProject =
    projects.find((p) => p.code === activeCode) ?? projects[0];

  const [selectedProjCode, setSelectedProjCode] = useState<string>(initialProject?.code ?? '');
  const [title, setTitle] = useState('');
  const [severity, setSeverity] = useState<TicketSeverity>('MEDIUM');
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const { upload, isUploading, error: uploadError } = useFileUpload();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentProj = projects.find((p) => p.code === selectedProjCode) || projects[0];

  const uploadFile = async (file: File) => {
    setErrorMessage('');
    const uploaded = await upload(file);
    if (uploaded) {
      setEvidenceUrls((prev) => [...prev, uploaded.url]);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          uploadFile(file);
          break;
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProj) return;
    setIsSubmitting(true);
    setErrorMessage('');

    const res = await createTicketAction({
      projectId: currentProj.id,
      title,
      severity,
      description,
      evidenceUrls,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setErrorMessage(res.error);
      toast.error(res.error);
    } else {
      toast.success('Đã gửi báo lỗi thành công');
      setTicketModalOpen(false);
      setTitle('');
      setDescription('');
      setEvidenceUrls([]);
      router.refresh();
    }
  };

  return (
    <Dialog
      open={ticketModalOpen}
      onClose={() => setTicketModalOpen(false)}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        onPaste: handlePaste,
        sx: {
          width: '95vw',
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
          Báo Bug Chuẩn Hóa
        </Typography>
        <IconButton
          aria-label="close"
          onClick={() => setTicketModalOpen(false)}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <MorphIcon icon={X} size={18} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {(errorMessage || uploadError) && <Alert severity="error">{errorMessage || uploadError}</Alert>}

          {/* Title */}
          <TextField
            label="Tiêu đề lỗi (Mô tả vắn tắt)"
            placeholder="VD: Bấm nút Hoàn tất học phí nhưng màn hình báo lỗi timeout..."
            required
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          {/* Project Choice */}
          <FormControl fullWidth size="small" required>
            <InputLabel id="project-label">Thuộc Dự Án</InputLabel>
            <Select
              labelId="project-label"
              label="Thuộc Dự Án"
              value={selectedProjCode}
              onChange={(e) => setSelectedProjCode(e.target.value)}
            >
              {projects.map((p) => (
                <MenuItem key={p.id} value={p.code}>
                  {p.code} — {p.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Severity */}
          <FormControl fullWidth size="small">
            <InputLabel id="severity-label">Mức độ nghiêm trọng</InputLabel>
            <Select
              labelId="severity-label"
              label="Mức độ nghiêm trọng"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as TicketSeverity)}
            >
              <MenuItem value="BLOCKER">Blocker (Sập hệ thống, dừng lớp học/thanh toán)</MenuItem>
              <MenuItem value="HIGH">High (Lỗi nặng dữ liệu, ảnh hưởng nhiều người)</MenuItem>
              <MenuItem value="MEDIUM">Medium (Lỗi giao diện hoặc quy trình có cách tránh)</MenuItem>
              <MenuItem value="LOW">Low (Lỗi font, sai màu, lệch nút bấm nhỏ)</MenuItem>
            </Select>
          </FormControl>

          {/* Description */}
          <TextField
            label="Các bước tái hiện lỗi (Step-by-step)"
            placeholder="1. Vào menu Điểm danh&#10;2. Chọn ngày 14/09 và tick Có mặt&#10;3. Bấm Lưu thì xuất hiện lỗi..."
            multiline
            minRows={4}
            required
            fullWidth
            size="small"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Upload Area */}
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 0.5 }}>
              Bằng chứng ảnh / video
            </Typography>

            <Box
              component="label"
              sx={{
                border: '1px dashed #cbd5e1',
                borderRadius: 2,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: '#f8fafc',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: '#f1f5f9',
                },
              }}
            >
              <input
                type="file"
                accept="image/*,video/*"
                hidden
                onChange={(e) => e.target.files?.[0] && uploadFile(e.target.files[0])}
              />
              {isUploading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', py: 1 }}>
                  <CircularProgress size={20} />
                  <Typography variant="caption" sx={{ fontWeight: 600 }}>
                    Đang nén và tải lên tệp tin...
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Box sx={{ color: 'text.secondary', mb: 0.5 }}>
                    <MorphIcon icon={UploadCloud} size={32} />
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                    Nhấn vào đây để tải file hoặc nhấn <strong>Ctrl + V</strong> để dán ảnh
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                    Tự động nén WebP • Video scale 720p
                  </Typography>
                </Box>
              )}
            </Box>

            {evidenceUrls.length > 0 && (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1.5 }}>
                {evidenceUrls.map((url, idx) => (
                  <Chip
                    key={idx}
                    icon={<MorphIcon icon={Paperclip} size={14} />}
                    label={url.split('/').pop() || url}
                    onDelete={() => setEvidenceUrls((prev) => prev.filter((_, i) => i !== idx))}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ px: 2.5, py: 1.5, borderTop: '1px solid #e2e8f0' }}>
          <Button onClick={() => setTicketModalOpen(false)} color="inherit" size="small">
            Hủy
          </Button>
          <AppButton
            type="submit"
            size="small"
            disabled={isSubmitting || isUploading}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <MorphIcon icon={CheckCircle} size={18} />
              )
            }
          >
            Gửi Báo Lỗi
          </AppButton>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
