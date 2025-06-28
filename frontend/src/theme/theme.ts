'use client'

import { createTheme, ThemeOptions } from '@mui/material/styles'

// Custom theme configuration with proper spacing
const themeOptions: ThemeOptions = {
  spacing: 16, // Increase base spacing to 16px for better visual breathing room
  palette: {
    mode: 'light',
    primary: {
      main: '#FF6B35', // Orange from MMFashion logo
      light: '#FF8A65',
      dark: '#E65100',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#2C3E50', // Dark teal/navy from MMFashion logo
      light: '#34495E',
      dark: '#1A252F',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8f9fa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2C3E50', // Using secondary color for main text
      secondary: '#666666',
    },
    error: {
      main: '#f44336',
    },
    warning: {
      main: '#FF6B35', // Using primary orange for warnings
    },
    info: {
      main: '#2196f3',
    },
    success: {
      main: '#4caf50',
    },
    grey: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#eeeeee',
      300: '#e0e0e0',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02857em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    // Button improvements
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '1rem',
          padding: '12px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.2)',
          },
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1.125rem',
          minHeight: '56px',
        },
      },
    },
    // Card improvements
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 8px 30px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    // TextField improvements with proper spacing
    MuiTextField: {
      styleOverrides: {
        root: {
          marginBottom: '24px', // Generous bottom margin
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: '#fafafa',
            transition: 'all 0.2s ease-in-out',
            minHeight: '56px', // Ensure consistent height
            fontSize: '1rem',
            '&:hover': {
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.4)',
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
          '& .MuiInputLabel-root': {
            fontWeight: 500,
            fontSize: '1rem',
            '&.Mui-focused': {
              fontWeight: 600,
            },
          },
          '& .MuiFormHelperText-root': {
            marginLeft: 12,
            marginTop: 8,
            fontSize: '0.875rem',
          },
        },
      },
    },
    // Paper improvements
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
        },
        elevation4: {
          boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    // Container improvements
    MuiContainer: {
      styleOverrides: {
        root: {
          paddingLeft: '24px',
          paddingRight: '24px',
          '@media (max-width: 600px)': {
            paddingLeft: '16px',
            paddingRight: '16px',
          },
        },
      },
    },
    // Stack spacing improvements
    MuiStack: {
      defaultProps: {
        spacing: 3, // Default spacing for Stack components
      },
    },
    // Divider improvements
    MuiDivider: {
      styleOverrides: {
        root: {
          marginTop: '16px',
          marginBottom: '16px',
        },
      },
    },
  },
}

export const theme = createTheme(themeOptions)

export default theme
