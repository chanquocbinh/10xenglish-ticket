'use client';

import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { useToastStore } from '@/shared/stores/toast.store';

/**
 * Toast toàn cục neo ngay dưới topbar. Lắng nghe toast.store,
 * tự ẩn sau 4s hoặc khi người dùng bấm đóng.
 */
export function Toaster() {
  const { open, message, severity, close } = useToastStore();

  return (
    <Snackbar
      open={open}
      autoHideDuration={2000}
      onClose={(_, reason) => {
        if (reason === 'clickaway') return;
        close();
      }}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 7 }}
    >
      <Alert
        onClose={close}
        severity={severity}
        variant="filled"
        sx={{ width: '100%', boxShadow: 3, fontSize: '0.8125rem' }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
}
