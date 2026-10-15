import Box from '@mui/material/Box'
import { EmptyState } from '@/components/EmptyState'
import { PageHeading } from '@/components/PageHeading'
import { designTokens } from '@/theme/Tokens'

export default function DashboardPage() {
  return (
    <Box sx={{ display: 'grid', gap: designTokens.space.lg }}>
      <PageHeading messageKey="dashboard.title" />
      <EmptyState titleKey="common.emptyTitle" bodyKey="dashboard.ledgerPending" />
    </Box>
  )
}
