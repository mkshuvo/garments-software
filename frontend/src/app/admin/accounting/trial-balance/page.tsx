'use client'

import React, { useState, useCallback, useEffect } from 'react'
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
  Divider,
  Button,
  Tooltip,
  Chip,
  Skeleton
} from '@mui/material'
import {
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Compare as CompareIcon,
  Help as HelpIcon
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useRouter } from 'next/navigation'
import { TrialBalanceReport } from '@/components/trial-balance/TrialBalanceReport'
import { TrialBalanceHelp } from '@/components/trial-balance/TrialBalanceHelp'
import { DateRange, UserRole } from '@/types/trialBalance'
import { useRoles } from '@/hooks/useRoles'
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
  const { isAdmin } = useRoles()
  
  // Get current user role
  const userRole = getCurrentUserRole()
  
  // Check access permissions
  const hasAccess = hasTrialBalanceAccess(userRole)
  
  // Default date range - current month
  const [defaultDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  })

  // Loading state for skeleton screens
  const [isPageLoading, setIsPageLoading] = useState(true)
  
  // Help dialog state
  const [showHelp, setShowHelp] = useState(false)

  // Simulate page loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Ctrl/Cmd + R: Refresh report
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        window.location.reload()
      }

      // Ctrl/Cmd + E: Export (will be handled by child components)
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault()
        // This will be handled by the ExportOptions component
        const exportEvent = new CustomEvent('trialBalanceExport')
        window.dispatchEvent(exportEvent)
      }

      // Ctrl/Cmd + C: Compare periods (Admin only)
      if ((event.ctrlKey || event.metaKey) && event.key === 'c' && isAdmin()) {
        event.preventDefault()
        router.push('/admin/accounting/trial-balance/comparison')
      }

      // F1 or Ctrl/Cmd + H: Show help
      if (event.key === 'F1' || ((event.ctrlKey || event.metaKey) && event.key === 'h')) {
        event.preventDefault()
        setShowHelp(true)
      }

      // Escape: Close any open modals
      if (event.key === 'Escape') {
        if (showHelp) {
          setShowHelp(false)
        } else {
          const closeEvent = new CustomEvent('trialBalanceCloseModal')
          window.dispatchEvent(closeEvent)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isAdmin, router, showHelp])

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
              You don&apos;t have permission to access the Trial Balance reporting feature. 
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
        {isPageLoading ? (
          <Paper 
            elevation={0} 
            sx={{ 
              p: { xs: 2, md: 3 }, 
              mb: 3,
              borderRadius: 2
            }}
          >
            <Stack spacing={2}>
              <Skeleton variant="text" width="40%" height={40} />
              <Skeleton variant="text" width="80%" height={24} />
              <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Skeleton variant="rectangular" width={150} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={120} height={36} sx={{ borderRadius: 1 }} />
              </Stack>
            </Stack>
          </Paper>
        ) : (
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
                  <Tooltip 
                    title="A trial balance lists all accounts with their debit and credit balances to verify accounting accuracy"
                    arrow
                    placement="right"
                  >
                    <Chip 
                      label="?" 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontSize: '0.75rem',
                        height: 20,
                        cursor: 'help'
                      }} 
                    />
                  </Tooltip>
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Generate comprehensive trial balance reports to verify accounting accuracy 
                  and analyze your financial position
                </Typography>
                
                {/* Keyboard shortcuts hint */}
                <Box sx={{ mt: 1, opacity: 0.7 }}>
                  <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                    💡 Shortcuts: Ctrl+R (Refresh), Ctrl+E (Export)
                    {isAdmin() && ', Ctrl+C (Compare)'}, F1 (Help)
                  </Typography>
                </Box>
              </Box>
              
              {/* User Role Badge and Actions */}
              <Stack direction="row" spacing={2} alignItems="center">
                <Tooltip title="Get help and learn about trial balance features (F1)" arrow>
                  <Button
                    variant="outlined"
                    startIcon={<HelpIcon />}
                    onClick={() => setShowHelp(true)}
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.5)',
                      color: 'white',
                      backdropFilter: 'blur(10px)',
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Help
                  </Button>
                </Tooltip>

                {isAdmin() && (
                  <Tooltip title="Compare trial balances across different periods (Ctrl+C)" arrow>
                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<CompareIcon />}
                      onClick={() => router.push('/admin/accounting/trial-balance/comparison')}
                      sx={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(255, 255, 255, 0.3)',
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.3)'
                        }
                      }}
                    >
                      Compare Periods
                    </Button>
                  </Tooltip>
                )}
                
                <Tooltip title="Your current access level determines available features" arrow>
                  <Paper 
                    sx={{ 
                      px: 2, 
                      py: 1, 
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      cursor: 'help'
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontWeight: 500 }}>
                      Access Level: {userRole}
                    </Typography>
                  </Paper>
                </Tooltip>
              </Stack>
            </Stack>
          </Paper>
        )}

        {/* Feature Description */}
        {isPageLoading ? (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Skeleton variant="text" width="30%" height={32} sx={{ mb: 2 }} />
            <Skeleton variant="text" width="100%" height={20} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
              {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="100%" height={20} />
                </Box>
              ))}
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              About Trial Balance Reports
              <Tooltip 
                title="Learn more about how trial balance reports work and their importance in accounting"
                arrow
                placement="right"
              >
                <Chip 
                  label="ℹ" 
                  size="small" 
                  sx={{ 
                    ml: 1, 
                    backgroundColor: 'primary.light',
                    color: 'primary.contrastText',
                    fontSize: '0.75rem',
                    height: 20,
                    cursor: 'help'
                  }} 
                />
              </Tooltip>
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              The trial balance is a fundamental accounting report that lists all accounts with their 
              debit and credit balances. It ensures that total debits equal total credits, verifying 
              the accuracy of your double-entry bookkeeping system.
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ mt: 2 }}>
              <Tooltip title="Ensures all debits equal credits in your accounting system" arrow>
                <Box sx={{ cursor: 'help' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    ✓ Account Verification
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verify that all accounts are properly balanced
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Analyze your business performance by account categories" arrow>
                <Box sx={{ cursor: 'help' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    ✓ Financial Analysis
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Analyze your financial position by account category
                  </Typography>
                </Box>
              </Tooltip>
              <Tooltip title="Download reports as PDF for printing or CSV for further analysis" arrow>
                <Box sx={{ cursor: 'help' }}>
                  <Typography variant="subtitle2" color="primary" gutterBottom>
                    ✓ Export Options
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Export reports in PDF and CSV formats (Ctrl+E)
                  </Typography>
                </Box>
              </Tooltip>
            </Stack>
          </Paper>
        )}

        <Divider sx={{ my: 3 }} />

        {/* Main Trial Balance Report Component */}
        {isPageLoading ? (
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            {/* Date Range Selector Skeleton */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 1 }} />
              <Skeleton variant="rectangular" width={120} height={56} sx={{ borderRadius: 1 }} />
            </Stack>
            
            {/* Report Content Skeleton */}
            <Stack spacing={3}>
              {/* Calculation Display Skeleton */}
              <Paper sx={{ p: 2, backgroundColor: 'grey.50' }}>
                <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={24} />
              </Paper>
              
              {/* Account Categories Skeleton */}
              {['Assets', 'Liabilities', 'Equity', 'Income', 'Expenses'].map((category) => (
                <Paper key={category} sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="text" width="20%" height={28} />
                    <Box sx={{ flex: 1 }} />
                    <Skeleton variant="text" width="15%" height={24} />
                  </Stack>
                  {[1, 2, 3].map((item) => (
                    <Stack key={item} direction="row" spacing={2} sx={{ mb: 1, pl: 4 }}>
                      <Skeleton variant="text" width="30%" height={20} />
                      <Box sx={{ flex: 1 }} />
                      <Skeleton variant="text" width="10%" height={20} />
                      <Skeleton variant="text" width="10%" height={20} />
                    </Stack>
                  ))}
                </Paper>
              ))}
              
              {/* Export Options Skeleton */}
              <Stack direction="row" spacing={2} justifyContent="center">
                <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
              </Stack>
            </Stack>
          </Paper>
        ) : (
          <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2 }}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <TrialBalanceReport
                defaultDateRange={defaultDateRange}
                onAccountClick={handleAccountClick}
                showCalculationDetails={true}
                groupByCategory={true}
              />
            </LocalizationProvider>
          </Paper>
        )}

        {/* Footer Information */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Trial balance calculations follow standard accounting principles where 
            debits are negative values and credits are positive values
          </Typography>
        </Box>
      </Container>

      {/* Help Dialog */}
      <TrialBalanceHelp
        open={showHelp}
        onClose={() => setShowHelp(false)}
      />
    </Box>
  )
}