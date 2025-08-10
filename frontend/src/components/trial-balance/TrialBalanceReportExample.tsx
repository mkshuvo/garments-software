'use client'

import React, { useState } from 'react'
import { Box, Container, Typography, Paper } from '@mui/material'
import { TrialBalanceReport } from './TrialBalanceReport'
import { DateRange } from '@/types/trialBalance'
import { startOfMonth, endOfMonth } from 'date-fns'

/**
 * Example component demonstrating the TrialBalanceReport usage
 * This shows how to integrate the component in a page with proper error handling
 */
export const TrialBalanceReportExample: React.FC = () => {
  const [selectedAccount, setSelectedAccount] = useState<{
    id: string
    name: string
  } | null>(null)

  // Default to current month
  const defaultDateRange: DateRange = {
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  }

  const handleAccountClick = (accountId: string, accountName: string) => {
    setSelectedAccount({ id: accountId, name: accountName })
    console.log('Account clicked:', { accountId, accountName })
    // Here you would typically open a drill-down modal or navigate to account details
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Trial Balance Reporting
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate comprehensive trial balance reports with detailed account breakdowns
        </Typography>
      </Box>

      {/* Main Trial Balance Report */}
      <TrialBalanceReport
        defaultDateRange={defaultDateRange}
        onAccountClick={handleAccountClick}
        showCalculationDetails={true}
        groupByCategory={true}
      />

      {/* Selected Account Info (for demonstration) */}
      {selectedAccount && (
        <Paper elevation={2} sx={{ p: 3, mt: 3, backgroundColor: 'info.light' }}>
          <Typography variant="h6" gutterBottom>
            Selected Account
          </Typography>
          <Typography variant="body1">
            <strong>ID:</strong> {selectedAccount.id}
          </Typography>
          <Typography variant="body1">
            <strong>Name:</strong> {selectedAccount.name}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            In a real application, this would open a detailed transaction view or drill-down modal.
          </Typography>
        </Paper>
      )}
    </Container>
  )
}

export default TrialBalanceReportExample