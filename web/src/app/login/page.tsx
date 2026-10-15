import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import { LoginPanel } from '@/components/LoginPanel'
import { LocaleSwitcher } from '@/components/LocaleSwitcher'
import { designTokens } from '@/theme/Tokens'

export default function LoginPage() {
  return (
    <Container maxWidth={false} sx={{ py: designTokens.space.xxl }}>
      <Box sx={{ display: 'grid', gap: designTokens.space.xl, width: designTokens.layout.formWidth }}>
        <Box sx={{ justifySelf: 'end' }}>
          <LocaleSwitcher />
        </Box>
        <LoginPanel />
      </Box>
    </Container>
  )
}
