'use client'

import Box from '@mui/material/Box'
import { designTokens } from '@/theme/Tokens'
import { ErrorState } from '@/components/ErrorState'

// A failed render must never produce the blank page under a live header that the legacy build
// shipped; the reset action is the only recovery path a user needs from an unknown error.
export default function AppError({ reset }: { readonly reset: () => void }) {
  return (
    <Box sx={{ p: designTokens.space.xl }}>
      <ErrorState messageKey="errors.unexpected" onRetry={reset} />
    </Box>
  )
}
