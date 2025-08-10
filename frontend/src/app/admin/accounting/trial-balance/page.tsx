'use client'

import React, { useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Paper,
  Alert,
  useTheme,
  useMediaQuery,
  Container,
  Stack,
  Divider
} from '@mui/material'
import {
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { TrialBalanceReport } from '@/components/trial-balance/TrialBalanceReport'
import { DateRange, UserRole } from '@/types/trialBalance'
import { startOfMonth, endOfMonth } from 'date-fns'

// Mock user role for now - in a real app this would come from auth context
const getCurrentUserRole = (): UserRole => {
  // This would typically come from authentication context
  // For now, we'll assume Admin role for development
  return UserRole.ADMIN
}

// Role-based access control
const hasTrialBalanceAccess = (role: UserRole): boolean => {
  return role === UserRole.ADMIN || role === UserRole.MANAGER
}

export default function TrialBalancePage() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  
  // Get current user role
  const userRole = getCurrentUserRole()
  
  // Check access permissions
  const hasAccess = hasTrialBalanceAccess(userRole)
  
  // Default date range - current month
  const [defaultDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  })

  // Handle account drill-down navigation
  const handleAccountClick = useCallback((accountId: string, accountName: string) => {
    // This would navigate to account details page
    // For now, we'll just log the action
    console.log(`Navigating to account details: ${accountId} - ${accountName}`)
    // router.push(`/admin/accounting/accounts/${accountId}`)
  }, [])

  // Handle navigation
  const handleBreadcrumbNavigation = useCallback((path: string) => {
    router.push(path)
  }, [router])

  // If user doesn't have access, show access denied
  if (!hasAccess) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Access Denied
            </Typography>
            <Typography variant="body1">
              You don't have permission to access the Trial Balance reporting feature. 
              This feature is only available to Admin and Manager users.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Current role: {userRole}
          </Typography>
        </Paper>
      </Container>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            component="button"
            onClick={() => handleBreadcrumbNavigation('/')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            component="button"
            onClick={() => handleBreadcrumbNavigation('/admin/accounting')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <AccountBalanceIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Accounting
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <AssessmentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Trial Balance
          </Typography>
        </Breadcrumbs>

        {/* Page Header */}
        <Paper 
          elevation={0} 
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 3,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}
        >
          <Stack 
            direction={{ xs: 'column', md: 'row' }} 
            justifyContent="space-between" 
            alignItems={{ xs: 'flex-start', md: 'center' }}
            spacing={2}
          >
            <Box>
              <Typography 
                variant={isMobile ? 'h5' : 'h4'} 
                fontWeight="bold" 
                gutterBottom
              >
                Trial Balance Report
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Generate comprehensive trial balance reports to verify accounting accuracy 
                and analyze your financial position
              </Typography>
            </Box>
            
            {/* User Role Badge */}
            <Paper 
              sx={{ 
                px: 2, 
                py: 1, 
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}
            >
              <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                Access Level: {userRole}
              </Typography>
            </Paper>
          </Stack>
        </Paper>

        {/* Feature Description */}
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            About Trial Balance Reports
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            The trial balance is a fundamental accounting report that lists all accounts with their 
            debit and credit balances. It ensures that total debits equal total credits, verifying 
            the accuracy of your double-entry bookkeeping system.
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ✓ Account Verification
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verify that all accounts are properly balanced
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ✓ Financial Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Analyze your financial position by account category
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" color="primary" gutterBottom>
                ✓ Export Options
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Export reports in PDF and CSV formats
              </Typography>
            </Box>
          </Stack>
        </Paper>

        <Divider sx={{ my: 3 }} />

        {/* Main Trial Balance Report Component */}
        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
          <TrialBalanceReport
            defaultDateRange={defaultDateRange}
            onAccountClick={handleAccountClick}
            showCalculationDetails={true}
            groupByCategory={true}
          />
        </Paper>

        {/* Footer Information */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Trial balance calculations follow standard accounting principles where 
            debits are negative values and credits are positive values
          </Typography>
        </Box>
      </Container>
    </Box>
  )
}