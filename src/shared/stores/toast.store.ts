import { create } from 'zustand';

export type ToastSeverity = 'success' | 'error' | 'info' | 'warning';

/** State toast toàn cục hiển thị qua MUI Snackbar ở topbar. */
interface ToastState {
  open: boolean;
  message: string;
  severity: ToastSeverity;
  show: (message: string, severity?: ToastSeverity) => void;
  close: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  open: false,
  message: '',
  severity: 'success',
  show: (message, severity = 'success') => set({ open: true, message, severity }),
  close: () => set({ open: false }),
}));

/** Helper gọi được ở bất kỳ đâu (kể cả ngoài React component). */
export const toast = {
  success: (message: string) => useToastStore.getState().show(message, 'success'),
  error: (message: string) => useToastStore.getState().show(message, 'error'),
  info: (message: string) => useToastStore.getState().show(message, 'info'),
  warning: (message: string) => useToastStore.getState().show(message, 'warning'),
};
