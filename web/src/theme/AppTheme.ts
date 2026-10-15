import { createTheme } from '@mui/material/styles'
import { designTokens } from './Tokens'

const { color, radius, type } = designTokens

export const appTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: color.actionNeutral, contrastText: color.textInverse },
    background: { default: color.surfaceBase, paper: color.surfaceRaised },
    text: { primary: color.textPrimary, secondary: color.textSecondary },
    divider: color.borderSubtle,
    error: { main: color.stateDanger, light: color.stateDangerSoft },
    success: { main: color.stateSuccess, light: color.stateSuccessSoft },
    warning: { main: color.stateWarning, light: color.stateWarningSoft },
    info: { main: color.stateInfo },
  },
  shape: { borderRadius: radius.medium },
  typography: {
    // The stack order is the script fallback: Latin first, Bengali second, so a Bengali glyph
    // renders from Noto while digits and account codes stay in Inter (§4.1).
    fontFamily: `${type.latinFont}, ${type.bengaliFont}, ${type.fallbackFont}`,
    fontSize: 14,
    h1: { fontSize: type.titleSize, fontWeight: 600 },
    h2: { fontSize: type.bodySize, fontWeight: 600 },
    body2: { fontSize: type.bodySize },
    caption: { fontSize: type.labelSize, color: color.textSecondary },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  // One spacing unit in pixels. Design tokens carry their own units (see Tokens.ts), so this is
  // only here for components and third-party code that call theme.spacing() directly.
  spacing: 8,
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: 'none' } } },
    MuiTableCell: {
      styleOverrides: {
        root: { borderBottom: `1px solid ${color.borderSubtle}` },
        head: {
          position: 'sticky',
          top: 0,
          zIndex: 1,
          backgroundColor: color.surfaceMuted,
          color: color.textSecondary,
          fontWeight: 600,
          fontSize: type.labelSize,
        },
      },
    },
  },
})
