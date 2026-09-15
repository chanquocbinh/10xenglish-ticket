import { requirePageUser } from '@/core/server/page';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';

export default async function ForbiddenPage() {
  await requirePageUser();

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Card sx={{ maxWidth: 480, width: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography variant="h6">Bạn không có quyền truy cập chức năng này</Typography>
          <Typography variant="body2" color="text.secondary">
            Vui lòng liên hệ quản trị viên nếu bạn cần được cấp quyền.
          </Typography>
          <Box>
            <Button href="/" variant="contained">
              Về trang tổng quan
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
