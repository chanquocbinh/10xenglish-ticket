'use client';

import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'light',
    // Mirror of --color-primary (globals.css). MUI's color engine (alpha/darken
    // used by text & outlined variants) needs static values, so keep hex here.
    primary: {
      main: '#051F4D',
      light: '#33527A',
      dark: '#03132F',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#475569',
      light: '#64748b',
      dark: '#334155',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#475569',
    },
    divider: '#e2e8f0',
    error: {
      main: '#d32f2f',
      light: '#ef5350',
      dark: '#c62828',
    },
    warning: {
      main: '#ed6c02',
      light: '#ff9800',
      dark: '#e65100',
    },
    success: {
      main: '#2e7d32',
      light: '#4caf50',
      dark: '#1b5e20',
    },
    info: {
      main: '#0288d1',
    },
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 600 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.8125rem',
          padding: '6px 16px',
        },
        containedPrimary: {
          backgroundColor: 'var(--color-primary)',
          '&:hover': {
            backgroundColor: 'var(--color-primary-dark)',
          },
        },
      },
    },
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
          borderRadius: 12,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.75rem',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#f1f5f9',
          padding: '10px 16px',
          fontSize: '0.8125rem',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#475569',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: '1px solid #e2e8f0',
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: '0.8125rem',
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: '#cbd5e1',
            borderWidth: 1,
            transition: 'border-color 0.15s ease-in-out',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#94a3b8',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-primary)',
            borderWidth: 1, // Giữ nguyên độ dày 1px, không nở to viền đậm
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d32f2f',
            borderWidth: 1,
          },
        },
        input: {
          padding: '8px 12px',
        },
        multiline: {
          padding: '10px 12px',
          lineHeight: 1.5,
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          '&.Mui-focused': {
            color: 'var(--color-primary)',
          },
        },
        outlined: {
          transform: 'translate(12px, 9px) scale(1)',
          '&.MuiInputLabel-shrink': {
            transform: 'translate(12px, -9px) scale(0.75)',
          },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontSize: '0.8125rem',
          '&.Mui-focused': {
            color: 'var(--color-primary)',
          },
        },
      },
    },
  },
});
