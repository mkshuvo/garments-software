/**
 * SINGLE SOURCE OF DESIGN TOKENS (law L15). Every colour, radius and spacing value in the
 * frontend is declared here; components and stylesheets reference these and nothing else.
 *
 * These are deliberately neutral placeholders, NOT brand identity. The visual direction is
 * chosen at the P4 gate from design/DESIGN.md via awesome-design-md and replaces this file's
 * values — the file itself stays the only place they exist.
 */
export const designTokens = {
  color: {
    textPrimary: '#111825',
    textSecondary: '#5b6472',
    textInverse: '#f7f9fb',
    surfaceBase: '#ffffff',
    surfaceMuted: '#f2f4f7',
    surfaceRaised: '#fbfcfd',
    borderSubtle: '#dfe3e8',
    borderStrong: '#b6bec9',
    actionNeutral: '#33415c',
    stateDanger: '#a31621',
    stateDangerSoft: '#fdecee',
    stateSuccess: '#14663d',
    stateSuccessSoft: '#e9f5ee',
    stateWarning: '#8a5300',
    stateWarningSoft: '#fdf3e2',
    stateInfo: '#0b5394',
    focusRing: '#33415c',
  },
  radius: {
    none: 0,
    small: 4,
    medium: 6,
  },
  // Spacing carries explicit units on purpose. MUI's `sx` reads a bare number as a multiple of
  // `theme.spacing`, so `gap: 16` silently became 128px and the login form rendered with a field
  // per screen. A token that means "16 of something" is not a single source of truth; a token that
  // means 16px is.
  space: {
    xxs: '2px',
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
  },
  type: {
    // next/font exposes these as CSS variables in AppFonts; naming a family here instead would
    // be a second source of truth that silently wins over the loaded font.
    latinFont: 'var(--font-latin)',
    bengaliFont: 'var(--font-bengali)',
    fallbackFont: 'system-ui, sans-serif',
    moneySize: '0.9375rem',
    labelSize: '0.75rem',
    bodySize: '0.875rem',
    titleSize: '1.125rem',
  },
  density: {
    tableRowPaddingY: '8px',
    stickyHeaderHeight: '44px',
  },
  layout: {
    formWidth: '384px',
    contentMaxWidth: '1200px',
  },
} as const
