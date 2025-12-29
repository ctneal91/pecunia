import { createTheme } from '@mui/material';

// Pecunia Theme: Trust & Growth
// Primary: Deep teal - conveys trust and stability
// Secondary: Warm gold - represents wealth and achievement
// Neutral: Slate grays for text and backgrounds

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0D9488', // Deep teal
      light: '#14B8A6',
      dark: '#0F766E',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#F59E0B', // Warm gold
      light: '#FBBF24',
      dark: '#D97706',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#10B981', // Emerald for positive progress
      light: '#34D399',
      dark: '#059669',
    },
    warning: {
      main: '#F59E0B', // Amber for alerts
      light: '#FBBF24',
      dark: '#D97706',
    },
    error: {
      main: '#EF4444', // Red for errors/negative balances (use sparingly)
      light: '#F87171',
      dark: '#DC2626',
    },
    background: {
      default: '#F8FAFC', // Slate 50
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B', // Slate 800
      secondary: '#64748B', // Slate 500
    },
    divider: '#E2E8F0', // Slate 200
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      color: '#1E293B',
    },
    h2: {
      fontWeight: 700,
      color: '#1E293B',
    },
    h3: {
      fontWeight: 600,
      color: '#1E293B',
    },
    h4: {
      fontWeight: 600,
      color: '#1E293B',
    },
    h5: {
      fontWeight: 600,
      color: '#1E293B',
    },
    h6: {
      fontWeight: 600,
      color: '#1E293B',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
  },
});
