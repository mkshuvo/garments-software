'use client'

import { createTheme, ThemeOptions } from '@mui/material/styles'

// Finalmente Dashboard Theme
// Modern purple/blue aesthetic with soft shadows and clean typography

const themeOptions: ThemeOptions = {
  spacing: 8, // Base spacing unit
  palette: {
    mode: 'light',
    primary: {
      main: '#4318FF', // Deep Purple (buttons, active states)
      light: '#7551FF',
      dark: '#2B0AE8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#764ba2', // Purple for gradients
      light: '#9575cd',
      dark: '#5e378f',
      contrastText: '#ffffff',
    },
    background: {
      default: '#F4F7FE', // Light blue-grey canvas
      paper: '#ffffff',
    },
    text: {
      primary: '#2B3674', // Dark blue-grey for headers
      secondary: '#A3AED0', // Light grey for secondary text
    },
    error: {
      main: '#EE5D50',
      light: '#FF7B73',
      dark: '#CC4B40',
    },
    warning: {
      main: '#FFCE20',
      light: '#FFD84D',
      dark: '#E5B600',
    },
    info: {
      main: '#2196f3',
      light: '#64B5F6',
      dark: '#1976D2',
    },
    success: {
      main: '#05CD99', // Bright green for positive stats
      light: '#38D9AA',
      dark: '#04B586',
    },
    grey: {
      50: '#F4F7FE',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
    divider: 'rgba(0, 0, 0, 0.05)',
  },
  typography: {
    fontFamily: '"DM Sans", "Poppins", "Inter", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      color: '#2B3674',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      color: '#2B3674',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
      color: '#2B3674',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2B3674',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      color: '#2B3674',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      color: '#2B3674',
    },
    body1: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      color: '#2B3674',
    },
    body2: {
      fontSize: '0.8125rem',
      fontWeight: 400,
      lineHeight: 1.5,
      color: '#A3AED0',
    },
    subtitle1: {
      fontSize: '0.875rem',
      fontWeight: 500,
      color: '#2B3674',
    },
    subtitle2: {
      fontSize: '0.75rem',
      fontWeight: 500,
      color: '#A3AED0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      color: '#A3AED0',
    },
    overline: {
      fontSize: '0.625rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '1px',
      color: '#A3AED0',
    },
  },
  shape: {
    borderRadius: 16,
  },
  shadows: [
    'none',
    '0px 2px 4px rgba(112, 144, 176, 0.06)',
    '0px 4px 8px rgba(112, 144, 176, 0.08)',
    '0px 6px 12px rgba(112, 144, 176, 0.10)',
    '0px 8px 16px rgba(112, 144, 176, 0.12)',
    '0px 10px 20px rgba(112, 144, 176, 0.14)',
    '0px 12px 24px rgba(112, 144, 176, 0.16)',
    '0px 14px 28px rgba(112, 144, 176, 0.18)',
    '0px 16px 32px rgba(112, 144, 176, 0.20)',
    '0px 18px 40px rgba(112, 144, 176, 0.12)', // Main card shadow
    '0px 20px 44px rgba(112, 144, 176, 0.14)',
    '0px 22px 48px rgba(112, 144, 176, 0.16)',
    '0px 24px 52px rgba(112, 144, 176, 0.18)',
    '0px 26px 56px rgba(112, 144, 176, 0.20)',
    '0px 28px 60px rgba(112, 144, 176, 0.22)',
    '0px 30px 64px rgba(112, 144, 176, 0.24)',
    '0px 32px 68px rgba(112, 144, 176, 0.26)',
    '0px 34px 72px rgba(112, 144, 176, 0.28)',
    '0px 36px 76px rgba(112, 144, 176, 0.30)',
    '0px 38px 80px rgba(112, 144, 176, 0.32)',
    '0px 40px 84px rgba(112, 144, 176, 0.34)',
    '0px 42px 88px rgba(112, 144, 176, 0.36)',
    '0px 44px 92px rgba(112, 144, 176, 0.38)',
    '0px 46px 96px rgba(112, 144, 176, 0.40)',
    '0px 48px 100px rgba(112, 144, 176, 0.42)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#F4F7FE',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#F4F7FE',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#CBD5E0',
            borderRadius: '4px',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 24px',
          boxShadow: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(67, 24, 255, 0.25)',
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #3610E8 0%, #6644EE 100%)',
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
        },
        outlined: {
          borderColor: '#E2E8F0',
          color: '#2B3674',
          '&:hover': {
            borderColor: '#4318FF',
            backgroundColor: 'rgba(67, 24, 255, 0.04)',
          },
        },
        text: {
          color: '#4318FF',
          '&:hover': {
            backgroundColor: 'rgba(67, 24, 255, 0.04)',
          },
        },
        sizeLarge: {
          padding: '14px 32px',
          fontSize: '1rem',
          minHeight: '52px',
        },
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.8125rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
          border: 'none',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0px 24px 48px rgba(112, 144, 176, 0.16)',
          },
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: '24px',
          '&:last-child': {
            paddingBottom: '24px',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
        },
        elevation0: {
          boxShadow: 'none',
        },
        elevation1: {
          boxShadow: '0px 4px 12px rgba(112, 144, 176, 0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            backgroundColor: '#ffffff',
            transition: 'all 0.2s ease-in-out',
            '& fieldset': {
              borderColor: '#E2E8F0',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#A3AED0',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#4318FF',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#A3AED0',
            fontWeight: 500,
            '&.Mui-focused': {
              color: '#4318FF',
            },
          },
          '& .MuiOutlinedInput-input': {
            padding: '16px',
            fontSize: '0.875rem',
            '&::placeholder': {
              color: '#A3AED0',
              opacity: 1,
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        colorSuccess: {
          backgroundColor: 'rgba(5, 205, 153, 0.1)',
          color: '#05CD99',
        },
        colorError: {
          backgroundColor: 'rgba(238, 93, 80, 0.1)',
          color: '#EE5D50',
        },
        colorWarning: {
          backgroundColor: 'rgba(255, 206, 32, 0.1)',
          color: '#E5B600',
        },
        colorInfo: {
          backgroundColor: 'rgba(67, 24, 255, 0.1)',
          color: '#4318FF',
        },
      },
    },
    MuiTable: {
      styleOverrides: {
        root: {
          '& .MuiTableHead-root': {
            '& .MuiTableCell-head': {
              backgroundColor: 'transparent',
              color: '#A3AED0',
              fontWeight: 600,
              fontSize: '0.75rem',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              borderBottom: 'none',
              padding: '12px 16px',
            },
          },
          '& .MuiTableBody-root': {
            '& .MuiTableRow-root': {
              transition: 'background-color 0.2s ease',
              '&:hover': {
                backgroundColor: '#F4F7FE',
              },
            },
            '& .MuiTableCell-body': {
              borderBottom: '1px solid #F4F7FE',
              padding: '16px',
              fontSize: '0.875rem',
              color: '#2B3674',
            },
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #F4F7FE',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: 'none',
          boxShadow: '0px 4px 20px rgba(112, 144, 176, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 12px',
          padding: '12px 16px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: '#F4F7FE',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(67, 24, 255, 0.08)',
            color: '#4318FF',
            '& .MuiListItemIcon-root': {
              color: '#4318FF',
            },
            '&:hover': {
              backgroundColor: 'rgba(67, 24, 255, 0.12)',
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              right: 0,
              top: '50%',
              transform: 'translateY(-50%)',
              width: 4,
              height: 24,
              backgroundColor: '#4318FF',
              borderRadius: '4px 0 0 4px',
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#A3AED0',
          minWidth: 40,
        },
      },
    },
    MuiListItemText: {
      styleOverrides: {
        primary: {
          fontSize: '0.875rem',
          fontWeight: 500,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: 'transparent',
          boxShadow: 'none',
          borderBottom: 'none',
        },
      },
    },
    MuiToolbar: {
      styleOverrides: {
        root: {
          minHeight: '80px !important',
          padding: '0 24px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: '#F4F7FE',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
        standardSuccess: {
          backgroundColor: 'rgba(5, 205, 153, 0.1)',
          color: '#04B586',
        },
        standardError: {
          backgroundColor: 'rgba(238, 93, 80, 0.1)',
          color: '#CC4B40',
        },
        standardWarning: {
          backgroundColor: 'rgba(255, 206, 32, 0.1)',
          color: '#E5B600',
        },
        standardInfo: {
          backgroundColor: 'rgba(67, 24, 255, 0.1)',
          color: '#4318FF',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2B3674',
          borderRadius: 8,
          fontSize: '0.75rem',
          padding: '8px 12px',
        },
      },
    },
    MuiSwitch: {
      styleOverrides: {
        root: {
          '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#4318FF',
          },
          '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#4318FF',
          },
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#E2E8F0',
          '&.Mui-checked': {
            color: '#4318FF',
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: '#E2E8F0',
          '&.Mui-checked': {
            color: '#4318FF',
          },
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: '#EDF2F7',
        },
        bar: {
          borderRadius: 4,
          background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
        },
      },
    },
    MuiCircularProgress: {
      styleOverrides: {
        root: {
          color: '#4318FF',
        },
      },
    },
    MuiBadge: {
      styleOverrides: {
        colorPrimary: {
          backgroundColor: '#EE5D50',
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
          boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
          marginTop: 8,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px 8px',
          padding: '10px 16px',
          fontSize: '0.875rem',
          '&:hover': {
            backgroundColor: '#F4F7FE',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#4318FF',
          height: 3,
          borderRadius: '3px 3px 0 0',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#A3AED0',
          '&.Mui-selected': {
            color: '#4318FF',
            fontWeight: 600,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 24px 48px rgba(112, 144, 176, 0.16)',
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(4px)',
          backgroundColor: 'rgba(43, 54, 116, 0.4)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#2B3674',
          padding: '24px 24px 16px',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px 24px',
          gap: 12,
        },
      },
    },
    MuiSnackbar: {
      styleOverrides: {
        root: {
          '& .MuiPaper-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: {
          '& .MuiPaginationItem-root': {
            borderRadius: 8,
            '&.Mui-selected': {
              backgroundColor: '#4318FF',
              color: '#ffffff',
              '&:hover': {
                backgroundColor: '#3610E8',
              },
            },
          },
        },
      },
    },
    MuiBreadcrumbs: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          '& .MuiLink-root': {
            color: '#A3AED0',
            textDecoration: 'none',
            '&:hover': {
              color: '#4318FF',
            },
          },
          '& .MuiTypography-root': {
            color: '#2B3674',
            fontWeight: 500,
          },
        },
      },
    },
    MuiAccordion: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 4px 12px rgba(112, 144, 176, 0.08)',
          '&:before': {
            display: 'none',
          },
          '&.Mui-expanded': {
            margin: 0,
          },
        },
      },
    },
    MuiAccordionSummary: {
      styleOverrides: {
        root: {
          padding: '0 24px',
          minHeight: 64,
          '&.Mui-expanded': {
            minHeight: 64,
          },
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          backgroundColor: '#EDF2F7',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
  },
}

export const theme = createTheme(themeOptions)

// Helper for gradients
export const gradients = {
  primary: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
  secondary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  success: 'linear-gradient(135deg, #05CD99 0%, #38D9AA 100%)',
  info: 'linear-gradient(135deg, #2196f3 0%, #64B5F6 100%)',
  warning: 'linear-gradient(135deg, #FFCE20 0%, #FFD84D 100%)',
  error: 'linear-gradient(135deg, #EE5D50 0%, #FF7B73 100%)',
  dark: 'linear-gradient(135deg, #2B3674 0%, #1A202C 100%)',
  sidebar: 'linear-gradient(180deg, #4318FF 0%, #7551FF 50%, #9575cd 100%)',
}

export default theme
