'use client';

import { useState } from 'react';
import { useUIStore } from '@/stores/useUIStore';
import { useProjectStore } from '@/stores/useProjectStore';
import { createTicketAction } from '@/app/actions/ticket.actions';
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
import FormLabel from '@mui/material/FormLabel';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import CloseIcon from '@mui/icons-material/Close';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

export function CreateTicketModal({
  projects,
}: {
  projects: { id: string; code: string; name: string }[];
}) {
  const { ticketModalOpen, setTicketModalOpen } = useUIStore();
  const { activeProject } = useProjectStore();
  const router = useRouter();

  const [selectedProjCode, setSelectedProjCode] = useState<string>(
    activeProject === 'ALL' ? 'LMS' : activeProject
  );
  const [title, setTitle] = useState('');
  const [submodule, setSubmodule] = useState('LMS: Điểm danh & Sĩ số lớp');
  const [affectedRole, setAffectedRole] = useState('Giáo viên (Teacher)');
  const [severity, setSeverity] = useState<'BLOCKER' | 'HIGH' | 'MEDIUM' | 'LOW'>('MEDIUM');
  const [description, setDescription] = useState('');
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const currentProj = projects.find((p) => p.code === selectedProjCode) || projects[0];

  const handleProjectChange = (code: string) => {
    setSelectedProjCode(code);
    if (code === 'LMS') {
      setSubmodule('LMS: Điểm danh & Sĩ số lớp');
      setAffectedRole('Giáo viên (Teacher)');
    } else {
      setSubmodule('CRM: Quản lý Lead & Tuyển sinh');
      setAffectedRole('Tư vấn viên / Sale');
    }
  };

  const uploadFile = async (file: File) => {
    setIsUploading(true);
    setErrorMessage('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error || 'Lỗi khi tải file');
      } else if (data.url) {
        setEvidenceUrls((prev) => [...prev, data.url]);
      }
    } catch {
      setErrorMessage('Lỗi kết nối khi tải file');
    } finally {
      setIsUploading(false);
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
      submodule,
      affectedRole,
      severity,
      description,
      evidenceUrls,
    });

    setIsSubmitting(false);
    if (res.error) {
      setErrorMessage(res.error);
    } else {
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
      maxWidth="sm"
      fullWidth
      PaperProps={{
        onPaste: handlePaste,
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
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

          {/* Project Choice */}
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ fontSize: '0.8125rem', fontWeight: 600, mb: 0.5 }}>
              Thuộc Dự Án *
            </FormLabel>
            <RadioGroup
              row
              value={selectedProjCode}
              onChange={(e) => handleProjectChange(e.target.value)}
            >
              <FormControlLabel
                value="LMS"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Project 1: Học Vụ & LMS</Typography>}
              />
              <FormControlLabel
                value="CRM"
                control={<Radio size="small" />}
                label={<Typography variant="body2">Project 2: CRM & Kế Toán</Typography>}
              />
            </RadioGroup>
          </FormControl>

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

          {/* Submodule & Affected Role */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="submodule-label">Phân hệ con bị lỗi</InputLabel>
              <Select
                labelId="submodule-label"
                label="Phân hệ con bị lỗi"
                value={submodule}
                onChange={(e) => setSubmodule(e.target.value)}
              >
                {selectedProjCode === 'LMS' ? (
                  [
                    <MenuItem key="1" value="LMS: Điểm danh & Sĩ số lớp">
                      LMS: Điểm danh & Sĩ số lớp
                    </MenuItem>,
                    <MenuItem key="2" value="LMS: Bài tập & Chấm điểm Speaking/Writing">
                      LMS: Bài tập & Chấm điểm
                    </MenuItem>,
                    <MenuItem key="3" value="LMS: Lịch dạy & Đổi ca giáo viên">
                      LMS: Lịch dạy & Đổi ca
                    </MenuItem>,
                    <MenuItem key="4" value="Portal: Phụ huynh xem điểm số Zalo">
                      Portal: Phụ huynh xem bảng điểm
                    </MenuItem>,
                  ]
                ) : (
                  [
                    <MenuItem key="5" value="CRM: Quản lý Lead & Tuyển sinh">
                      CRM: Quản lý Lead & Tuyển sinh
                    </MenuItem>,
                    <MenuItem key="6" value="Kế toán: Thu học phí & Xuất biên lai A5">
                      Kế toán: Thu học phí & Biên lai A5
                    </MenuItem>,
                    <MenuItem key="7" value="Cổng thanh toán: Tích hợp VietQR">
                      Cổng thanh toán: Tích hợp VietQR
                    </MenuItem>,
                    <MenuItem key="8" value="Báo cáo: Thống kê doanh thu cơ sở">
                      Báo cáo: Thống kê doanh thu cơ sở
                    </MenuItem>,
                  ]
                )}
              </Select>
            </FormControl>

            <FormControl fullWidth size="small">
              <InputLabel id="role-label">Tài khoản gặp lỗi</InputLabel>
              <Select
                labelId="role-label"
                label="Tài khoản gặp lỗi"
                value={affectedRole}
                onChange={(e) => setAffectedRole(e.target.value)}
              >
                <MenuItem value="Giáo viên (Teacher)">Giáo viên (Teacher)</MenuItem>
                <MenuItem value="Học viên / Phụ huynh">Học viên / Phụ huynh</MenuItem>
                <MenuItem value="Tư vấn viên / Sale">Tư vấn viên / Sale</MenuItem>
                <MenuItem value="Kế toán">Kế toán</MenuItem>
                <MenuItem value="Quản trị viên (Admin)">Quản trị viên (Admin)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Severity */}
          <FormControl fullWidth size="small">
            <InputLabel id="severity-label">Mức độ nghiêm trọng</InputLabel>
            <Select
              labelId="severity-label"
              label="Mức độ nghiêm trọng"
              value={severity}
              onChange={(e) => setSeverity(e.target.value as typeof severity)}
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
              Bằng chứng ảnh / video (Hỗ trợ <strong>Ctrl + V dán ảnh trực tiếp</strong>)
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
                <Box sx={{ textAlign: 'center' }}>
                  <CloudUploadOutlinedIcon sx={{ color: 'text.secondary', fontSize: 32, mb: 0.5 }} />
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
                    icon={<AttachFileIcon fontSize="small" />}
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="small"
            disabled={isSubmitting || isUploading}
            startIcon={
              isSubmitting ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <CheckCircleOutlinedIcon fontSize="small" />
              )
            }
          >
            Gửi Báo Lỗi
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
