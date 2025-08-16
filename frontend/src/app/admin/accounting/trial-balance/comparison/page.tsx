'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
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
  Button,
  CircularProgress
} from '@mui/material'
import {
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  Assessment as AssessmentIcon,
  Compare as CompareIcon
} from '@mui/icons-material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { useRouter } from 'next/navigation'
import { DateRangeSelector } from '@/components/trial-balance/DateRangeSelector'
import { TrialBalanceComparisonView } from '@/components/trial-balance/TrialBalanceComparisonView'
import { useRoles } from '@/hooks/useRoles'
import { trialBalanceService } from '@/services/trialBalanceService'
import {
  DateRange,
  TrialBalanceComparison
} from '@/types/trialBalance'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export default function TrialBalanceComparisonPage() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const { isAdmin, isRolesLoading } = useRoles()
  
  // State management
  const [period1, setPeriod1] = useState<DateRange>({
    startDate: startOfMonth(subMonths(new Date(), 1)), // Last month
    endDate: endOfMonth(subMonths(new Date(), 1))
  })
  
  const [period2, setPeriod2] = useState<DateRange>({
    startDate: startOfMonth(new Date()), // This month
    endDate: endOfMonth(new Date())
  })
  
  const [comparisonData, setComparisonData] = useState<TrialBalanceComparison | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [hasGenerated, setHasGenerated] = useState(false)

  // Handle navigation
  const handleBreadcrumbNavigation = useCallback((path: string) => {
    router.push(path)
  }, [router])

  // Generate comparison report
  const handleGenerateComparison = useCallback(async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const comparison = await trialBalanceService.compareTrialBalances(period1, period2, {
        groupByCategory: true,
        includeZeroBalances: false
      })
      
      setComparisonData(comparison)
      setHasGenerated(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate comparison report')
    } finally {
      setIsLoading(false)
    }
  }, [period1, period2])

  // Validate date ranges
  const dateRangeErrors = useMemo(() => {
    const errors: string[] = []
    
    if (!trialBalanceService.validateDateRange(period1)) {
      errors.push('Period 1 date range is invalid')
    }
    
    if (!trialBalanceService.validateDateRange(period2)) {
      errors.push('Period 2 date range is invalid')
    }
    
    return errors
  }, [period1, period2])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      // Ctrl/Cmd + R: Refresh comparison
      if ((event.ctrlKey || event.metaKey) && event.key === 'r') {
        event.preventDefault()
        if (hasGenerated) {
          handleGenerateComparison()
        }
      }

      // Ctrl/Cmd + G: Generate comparison
      if ((event.ctrlKey || event.metaKey) && event.key === 'g') {
        event.preventDefault()
        handleGenerateComparison()
      }

      // Escape: Close any open modals
      if (event.key === 'Escape') {
        const closeEvent = new CustomEvent('trialBalanceCloseModal')
        window.dispatchEvent(closeEvent)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasGenerated, handleGenerateComparison])

  // Check if user is still loading or doesn't have admin access
  if (isRolesLoading()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading...
        </Typography>
      </Container>
    )
  }

  if (!isAdmin()) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Alert severity="error" sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Admin Access Required
            </Typography>
            <Typography variant="body1">
              The Trial Balance Comparison feature is only available to Admin users.
              Please contact your system administrator if you need access to this feature.
            </Typography>
          </Alert>
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
          <Link
            color="inherit"
            component="button"
            onClick={() => handleBreadcrumbNavigation('/admin/accounting/trial-balance')}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' }
            }}
          >
            <AssessmentIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Trial Balance
          </Link>
          <Typography 
            color="text.primary" 
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <CompareIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Period Comparison
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
                Trial Balance Comparison
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Compare trial balances across different periods to identify trends and changes in account balances
              </Typography>
            </Box>
            
            {/* Admin Badge */}
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
                Admin Only Feature
              </Typography>
            </Paper>
          </Stack>
        </Paper>

        {/* Date Range Selectors */}
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                Period 1 (Baseline)
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateRangeSelector
                  startDate={period1.startDate}
                  endDate={period1.endDate}
                  onDateChange={(start, end) => setPeriod1({ startDate: start, endDate: end })}
                  maxRange={365}
                  helperText="Select the baseline period for comparison"
                />
              </LocalizationProvider>
            </Paper>
          </Box>
          
          <Box sx={{ flex: 1 }}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                Period 2 (Comparison)
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateRangeSelector
                  startDate={period2.startDate}
                  endDate={period2.endDate}
                  onDateChange={(start, end) => setPeriod2({ startDate: start, endDate: end })}
                  maxRange={365}
                  helperText="Select the period to compare against baseline"
                />
              </LocalizationProvider>
            </Paper>
          </Box>
        </Box>

        {/* Generate Button */}
        <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateComparison}
            disabled={isLoading || dateRangeErrors.length > 0}
            startIcon={isLoading ? <CircularProgress size={20} /> : <CompareIcon />}
            sx={{ minWidth: 200 }}
          >
            {isLoading ? 'Generating...' : 'Generate Comparison'}
          </Button>
          
          {dateRangeErrors.length > 0 && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" gutterBottom>
                Please fix the following errors:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {dateRangeErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}
          
          {error && (
            <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
              {error}
            </Alert>
          )}
        </Paper>

        {/* Comparison Results */}
        {hasGenerated && comparisonData && (
          <TrialBalanceComparisonView 
            comparison={comparisonData}
            significanceThreshold={10} // 10% threshold for highlighting significant changes
          />
        )}
      </Container>
    </Box>
  )
}