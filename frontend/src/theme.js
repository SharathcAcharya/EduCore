import { createTheme, alpha } from '@mui/material/styles';

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Typography / Background colors
          primary: {
            main: '#4361ee', // A vibrant, modern blue
            light: alpha('#4361ee', 0.8),
            dark: '#3f37c9',
            contrastText: '#fff',
          },
          secondary: {
            main: '#f72585', // A vibrant pink accent
            light: alpha('#f72585', 0.8),
            dark: '#b5179e',
            contrastText: '#fff',
          },
          background: {
            default: '#f4f6f8', // Soft neutral background for contrast with floating elements
            paper: '#ffffff',
          },
          text: {
            primary: '#2b2d42',
            secondary: '#6c757d',
          },
        }
      : {
          // Dark Mode
          primary: {
            main: '#4cc9f0',
            light: alpha('#4cc9f0', 0.8),
            dark: '#4361ee',
            contrastText: '#fff',
          },
          secondary: {
            main: '#f72585',
            light: alpha('#f72585', 0.8),
            dark: '#b5179e',
            contrastText: '#fff',
          },
          background: {
            default: '#0f172a', // Tailwind slate-900 style
            paper: '#1e293b',   // Tailwind slate-800 style
          },
          text: {
            primary: '#f8f9fa',
            secondary: '#adb5bd',
          },
        }),
  },
  typography: {
    fontFamily: '"Poppins", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Outfit", sans-serif', fontWeight: 800, letterSpacing: '-0.025em' },
    h2: { fontFamily: '"Outfit", sans-serif', fontWeight: 700, letterSpacing: '-0.025em' },
    h3: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.015em' },
    h4: { fontFamily: '"Outfit", sans-serif', fontWeight: 600, letterSpacing: '-0.015em' },
    h5: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Space Grotesk", sans-serif', fontWeight: 600 },
    button: { fontFamily: '"Space Grotesk", sans-serif', textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16, // Global rounded corners for floating UI
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 28px',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0 12px 24px -8px rgba(67, 97, 238, 0.4)',
            transform: 'translateY(-3px)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: 'none',
          borderRadius: 24, // softer, very rounded look
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          boxShadow: theme.palette.mode === 'light' 
            ? '0 10px 40px -10px rgba(0,0,0,0.06)' 
            : '0 10px 40px -10px rgba(0,0,0,0.5)',
          border: `1px solid ${theme.palette.mode === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.08)'}`,
          backdropFilter: 'blur(10px)',
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(30, 41, 59, 0.7)',
          '&:hover': {
             transform: 'translateY(-5px)',
             boxShadow: theme.palette.mode === 'light'
                ? '0 20px 40px -10px rgba(0,0,0,0.1)'
                : '0 20px 40px -10px rgba(0,0,0,0.6)',
          }
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          overflow: 'visible',
          borderRadius: 24,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          border: 'none',
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(16px)',
          boxShadow: theme.palette.mode === 'light' ? '4px 0 24px rgba(0,0,0,0.04)' : '4px 0 24px rgba(0,0,0,0.2)',
          borderRadius: '0 24px 24px 0', // floating look setup
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? 'rgba(244, 246, 248, 0.7)' : 'rgba(15, 23, 42, 0.7)',
          color: theme.palette.text.primary,
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: `1px solid ${theme.palette.mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
        }),
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
        },
      },
    },
  },
});

export const lightTheme = createTheme(getDesignTokens('light'));
export const darkTheme = createTheme(getDesignTokens('dark'));
