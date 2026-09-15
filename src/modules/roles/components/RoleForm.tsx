'use client';

import Link from 'next/link';
import { PERMISSION_MODULE_KEYS, permissionsOfModule } from '@/core/auth/permissions';
import { PERMISSION_LABELS, PERMISSION_MODULE_LABELS } from '../roles.constants';
import { useRoleForm, type RoleFormValue } from '../hooks/useRoleForm';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import { AppButton } from '@/shared/ui/AppButton';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormGroup from '@mui/material/FormGroup';

import { MorphIcon } from '@/shared/ui/MorphIcon';
import { ArrowLeft } from 'lucide';

export function RoleForm({ mode, role }: { mode: 'create' | 'edit'; role?: RoleFormValue }) {
  const {
    readOnly,
    name,
    setName,
    description,
    setDescription,
    permissions,
    togglePermission,
    toggleModule,
    isSubmitting,
    errorMessage,
    handleSubmit,
  } = useRoleForm(mode, role);

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      {/* Action Bar Header */}
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton component={Link} href="/roles" size="small">
              <MorphIcon icon={ArrowLeft} size={18} />
            </IconButton>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {mode === 'create' ? 'Tạo Vai Trò Mới' : readOnly ? 'Chi Tiết Vai Trò Hệ Thống' : 'Chỉnh Sửa Vai Trò'}
            </Typography>
          </Box>
          <Button component={Link} href="/roles" color="inherit" size="small">
            Quay lại danh sách
          </Button>
        </CardContent>
      </Card>

      <Card sx={{ width: '100%' }}>
        <Box component="form" onSubmit={handleSubmit}>
          <CardContent sx={{ p: { xs: 2, sm: 3 }, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
            {readOnly && (
              <Alert severity="info" variant="outlined" sx={{ fontSize: '0.75rem' }}>
                Đây là vai trò hệ thống, không thể chỉnh sửa hoặc xóa quyền hạn.
              </Alert>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' }, gap: 2.5 }}>
              <TextField
                label="Tên vai trò"
                required
                fullWidth
                size="small"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trưởng bộ phận Kế toán"
                disabled={readOnly}
              />

              <TextField
                label="Mô tả vai trò"
                fullWidth
                size="small"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="VD: Chịu trách nhiệm nghiệm thu và rà soát chi phí..."
                disabled={readOnly}
              />
            </Box>

            <Box sx={{ pt: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.primary' }}>
                Phân quyền chức năng hệ thống
              </Typography>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                {PERMISSION_MODULE_KEYS.map((module) => {
                  const modulePerms = permissionsOfModule(module);
                  const checkedCount = modulePerms.filter((p) => permissions.includes(p)).length;
                  return (
                    <Box
                      key={module}
                      sx={{
                        p: 2,
                        borderRadius: 1.5,
                        border: '1px solid #e2e8f0',
                        bgcolor: '#fafafa',
                      }}
                    >
                      <FormControlLabel
                        control={
                          <Checkbox
                            size="small"
                            checked={checkedCount === modulePerms.length}
                            indeterminate={checkedCount > 0 && checkedCount < modulePerms.length}
                            disabled={readOnly}
                            onChange={(e) => toggleModule(module, e.target.checked)}
                          />
                        }
                        label={
                          <Typography variant="caption" sx={{ fontWeight: 700, color: 'primary.main' }}>
                            {PERMISSION_MODULE_LABELS[module]}
                          </Typography>
                        }
                      />
                      <FormGroup sx={{ pl: 2, mt: 0.5 }}>
                        {modulePerms.map((p) => (
                          <FormControlLabel
                            key={p}
                            control={
                              <Checkbox
                                size="small"
                                checked={permissions.includes(p)}
                                disabled={readOnly}
                                onChange={(e) => togglePermission(p, e.target.checked)}
                              />
                            }
                            label={<Typography variant="caption">{PERMISSION_LABELS[p]}</Typography>}
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </CardContent>

          {!readOnly && (
            <Box
              sx={{
                px: 3,
                py: 2,
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 1.5,
                bgcolor: '#f8fafc',
              }}
            >
              <Button component={Link} href="/roles" color="inherit" size="small">
                Hủy
              </Button>
              <AppButton
                type="submit"
                size="small"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {mode === 'create' ? 'Tạo Vai Trò' : 'Lưu Thay Đổi'}
              </AppButton>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}
