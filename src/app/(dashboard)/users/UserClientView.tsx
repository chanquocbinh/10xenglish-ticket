'use client';

import { useState } from 'react';
import { createUserAction, resetPasswordAction } from '@/app/actions/auth.actions';
import { useRouter } from 'next/navigation';
import { Role } from '@/types/auth';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
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
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';

import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined';
import DomainOutlinedIcon from '@mui/icons-material/DomainOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';

interface UserData {
  id: string;
  fullName: string;
  username: string;
  email: string;
  role: string;
  isPasswordChanged: boolean;
  department: { name: string } | null;
}

export function UserClientView({
  initialUsers,
  departments,
  currentUserRole,
}: {
  initialUsers: UserData[];
  departments: { id: string; name: string }[];
  currentUserRole: Role;
}) {
  const [users, setUsers] = useState<UserData[]>(initialUsers);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [departmentId, setDepartmentId] = useState(departments[0]?.id || '');
  const [role, setRole] = useState<Role>('STAFF');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('fullName', fullName);
    formData.append('username', username);
    formData.append('email', email);
    formData.append('departmentId', departmentId);
    formData.append('role', role);

    const res = await createUserAction(formData);
    setIsSubmitting(false);

    if (res.error) {
      setErrorMessage(res.error);
    } else {
      alert(`Đã tạo thành công tài khoản cho ${fullName}!\nMật khẩu mặc định: ${res.defaultPass}`);
      setIsModalOpen(false);
      setFullName('');
      setUsername('');
      setEmail('');
      router.refresh();
    }
  };

  const handleResetPass = async (userId: string, name: string) => {
    if (confirm(`Reset mật khẩu của "${name}" về mặc định "10xEnglish@2026"?`)) {
      const res = await resetPasswordAction(userId);
      if (res.success) {
        alert(`Đã reset mật khẩu thành công về: ${res.defaultPass}`);
        router.refresh();
      }
    }
  };

  const handleCopyZalo = (u: UserData) => {
    const text = `Chào ${u.fullName}, IT 10X English xin gửi tài khoản truy cập Portal Báo Bug & Nghiệm Thu:\n- Link: http://localhost:3000/login\n- Tên đăng nhập: ${u.username}\n- Mật khẩu mặc định: 10xEnglish@2026\n(Lưu ý: Hệ thống sẽ yêu cầu bạn đổi mật khẩu mới trong lần đầu đăng nhập).`;
    navigator.clipboard.writeText(text).then(() => {
      alert(`Đã sao chép thông tin gửi Zalo cho ${u.fullName}:\n\n${text}`);
    });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* 3 Metric Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 2 }}>
        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: '#dbeafe',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PeopleAltOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Tổng Tài Khoản
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {users.length} người dùng
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: '#f1f5f9',
                color: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DomainOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Phòng Ban
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {departments.length} phòng ban
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card>
          <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 }, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: '#ffedd5',
                color: 'warning.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <VpnKeyOutlinedIcon />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Mật Khẩu Cấp Ban Đầu
              </Typography>
              <Typography variant="subtitle2" sx={{ fontFamily: 'monospace', fontWeight: 700, color: 'warning.dark' }}>
                10xEnglish@2026
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Action Bar */}
      <Card>
        <CardContent
          sx={{
            p: 2,
            '&:last-child': { pb: 2 },
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
            Danh Sách Thành Viên & Phân Quyền
          </Typography>
          {currentUserRole === 'DEV_ADMIN' && (
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
            >
              Tạo Tài Khoản Mới
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Users Table */}
      <TableContainer component={Paper} variant="outlined" sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 900 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ minWidth: 200, whiteSpace: 'nowrap' }}>Thành viên</TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>Phòng ban</TableCell>
              <TableCell sx={{ width: 150, whiteSpace: 'nowrap' }}>Phân quyền</TableCell>
              <TableCell sx={{ width: 150, whiteSpace: 'nowrap' }}>Mật khẩu ban đầu</TableCell>
              <TableCell sx={{ width: 140, whiteSpace: 'nowrap' }}>Trạng thái</TableCell>
              <TableCell sx={{ width: 180, whiteSpace: 'nowrap' }} align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id} hover>
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
                    {u.fullName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                    {u.email} • @{u.username}
                  </Typography>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.8125rem' }}>
                    {u.department?.name || 'Chưa gán'}
                  </Typography>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 700,
                      color:
                        u.role === 'DEV_ADMIN'
                          ? 'primary.main'
                          : u.role === 'MANAGER'
                          ? 'warning.dark'
                          : 'text.secondary',
                    }}
                  >
                    {u.role === 'MANAGER' ? 'BAN QUẢN LÝ' : u.role}
                  </Typography>
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  {!u.isPasswordChanged ? (
                    <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'warning.dark', fontWeight: 600 }}>
                      10xEnglish@2026
                    </Typography>
                  ) : (
                    <Typography variant="caption" sx={{ color: 'text.disabled', fontStyle: 'italic' }}>
                      Đã đổi pass riêng
                    </Typography>
                  )}
                </TableCell>

                {/* Status: Text + Color Dot */}
                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: u.isPasswordChanged ? '#2e7d32' : '#ea580c',
                      }}
                    />
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 600,
                        color: u.isPasswordChanged ? 'success.main' : 'warning.dark',
                      }}
                    >
                      {u.isPasswordChanged ? 'Đã kích hoạt' : 'Chờ đổi pass'}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      color="inherit"
                      startIcon={<ContentCopyIcon fontSize="small" />}
                      onClick={() => handleCopyZalo(u)}
                      sx={{ fontSize: '0.6875rem', py: 0.25 }}
                    >
                      Gửi Zalo
                    </Button>
                    {currentUserRole === 'DEV_ADMIN' && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="inherit"
                        startIcon={<RestartAltIcon fontSize="small" />}
                        onClick={() => handleResetPass(u.id, u.fullName)}
                        sx={{ fontSize: '0.6875rem', py: 0.25 }}
                      >
                        Reset
                      </Button>
                    )}
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Modal Create User */}
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
            Tạo Tài Khoản Mới
          </Typography>
          <IconButton onClick={() => setIsModalOpen(false)} size="small" sx={{ color: 'text.secondary' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleCreateUser}>
          <DialogContent sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}

            <TextField
              label="Họ và tên"
              required
              fullWidth
              size="small"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
            />

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <TextField
                label="Username"
                required
                fullWidth
                size="small"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nguyenvana"
              />

              <TextField
                label="Email"
                type="email"
                required
                fullWidth
                size="small"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vana@10x..."
              />
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <FormControl fullWidth size="small">
                <InputLabel id="dept-label">Phòng ban</InputLabel>
                <Select
                  labelId="dept-label"
                  label="Phòng ban"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                >
                  {departments.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel id="role-select-label">Cấp quyền</InputLabel>
                <Select
                  labelId="role-select-label"
                  label="Cấp quyền"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                >
                  <MenuItem value="STAFF">STAFF (Nhân viên)</MenuItem>
                  <MenuItem value="LEAD_STAFF">LEAD (Trưởng bộ phận)</MenuItem>
                  <MenuItem value="MANAGER">MANAGER (Ban Quản Lý / Duyệt UAT)</MenuItem>
                  <MenuItem value="DEV_ADMIN">DEV_ADMIN (Super Admin)</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Alert severity="info" variant="outlined" sx={{ fontSize: '0.75rem' }}>
              Mật khẩu mặc định: <code>10xEnglish@2026</code>. Người dùng sẽ đổi mật khẩu ở lần đăng nhập đầu tiên.
            </Alert>
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
              Tạo Tài Khoản
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
