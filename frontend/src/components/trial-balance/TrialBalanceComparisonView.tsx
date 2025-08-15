'use client'

import React, { useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme
} from '@mui/material'
import {
  ExpandMore as ExpandMoreIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  TrendingFlat as TrendingFlatIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import {
  TrialBalanceComparison
} from '@/types/trialBalance'

export interface TrialBalanceComparisonViewProps {
  comparison: TrialBalanceComparison
  significanceThreshold?: number // Percentage threshold for highlighting significant changes
}

export const TrialBalanceComparisonView: React.FC<TrialBalanceComparisonViewProps> = ({
  comparison,
  significanceThreshold = 10 // Default 10% threshold
}) => {
  // Group variances by category
  const variancesByCategory = useMemo(() => {
    const grouped: Record<string, AccountVariance[]> = {}
    
    comparison.variances.forEach(variance => {
      // Find the account in both periods to get category
      const account1 = comparison.period1.categories
        .flatMap(cat => cat.accounts)
        .find(acc => acc.accountId === variance.accountId)
      
      if (account1) {
        const categoryName = comparison.period1.categories
          .find(cat => cat.accounts.some(acc => acc.accountId === variance.accountId))?.name || 'Other'
        
        if (!grouped[categoryName]) {
          grouped[categoryName] = []
        }
        grouped[categoryName].push(variance)
      }
    })
    
    return grouped
  }, [comparison])

  // Calculate category-level variances
  const categoryVariances = useMemo(() => {
    const variances: Record<string, { period1: number; period2: number; change: number; percentChange: number }> = {}
    
    comparison.period1.categories.forEach(category1 => {
      const category2 = comparison.period2.categories.find(cat => cat.name === category1.name)
      
      if (category2) {
        const change = category2.subtotal - category1.subtotal
        const percentChange = category1.subtotal !== 0 ? (change / Math.abs(category1.subtotal)) * 100 : 0
        
        variances[category1.name] = {
          period1: category1.subtotal,
          period2: category2.subtotal,
          change,
          percentChange
        }
      }
    })
    
    return variances
  }, [comparison])

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getVarianceIcon = (change: number) => {
    if (change > 0) return <TrendingUpIcon color="success" fontSize="small" />
    if (change < 0) return <TrendingDownIcon color="error" fontSize="small" />
    return <TrendingFlatIcon color="disabled" fontSize="small" />
  }

  const getVarianceColor = (percentChange: number) => {
    if (Math.abs(percentChange) >= significanceThreshold) {
      return percentChange > 0 ? 'success.main' : 'error.main'
    }
    return 'text.secondary'
  }

  return (
    <Box>
      {/* Period Headers */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3 }}>
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'primary.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Period 1 (Baseline)
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(comparison.period1.finalBalance)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {format(comparison.period1.dateRange.startDate, 'MMM dd')} - {format(comparison.period1.dateRange.endDate, 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {comparison.period1.totalTransactions} transactions
            </Typography>
          </Paper>
        </Box>
        
        <Box sx={{ flex: 1 }}>
          <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: 'secondary.light', color: 'white' }}>
            <Typography variant="h6" gutterBottom>
              Period 2 (Comparison)
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              {formatCurrency(comparison.period2.finalBalance)}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              {format(comparison.period2.dateRange.startDate, 'MMM dd')} - {format(comparison.period2.dateRange.endDate, 'MMM dd, yyyy')}
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              {comparison.period2.totalTransactions} transactions
            </Typography>
          </Paper>
        </Box>
      </Box>

      {/* Overall Variance Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Overall Variance
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h4" color={getVarianceColor(
            ((comparison.period2.finalBalance - comparison.period1.finalBalance) / Math.abs(comparison.period1.finalBalance)) * 100
          )}>
            {formatCurrency(comparison.period2.finalBalance - comparison.period1.finalBalance)}
          </Typography>
          {getVarianceIcon(comparison.period2.finalBalance - comparison.period1.finalBalance)}
          <Typography variant="h6" color="text.secondary">
            ({comparison.period1.finalBalance !== 0 
              ? ((comparison.period2.finalBalance - comparison.period1.finalBalance) / Math.abs(comparison.period1.finalBalance) * 100).toFixed(1)
              : '0'}%)
          </Typography>
        </Stack>
      </Paper>

      {/* Category-Level Comparison */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Category Comparison
        </Typography>
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category</TableCell>
                <TableCell align="right">Period 1</TableCell>
                <TableCell align="right">Period 2</TableCell>
                <TableCell align="right">Change</TableCell>
                <TableCell align="right">% Change</TableCell>
                <TableCell align="center">Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(categoryVariances).map(([categoryName, variance]) => (
                <TableRow key={categoryName}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {categoryName}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(variance.period1)}
                  </TableCell>
                  <TableCell align="right">
                    {formatCurrency(variance.period2)}
                  </TableCell>
                  <TableCell align="right">
                    <Typography color={getVarianceColor(variance.percentChange)}>
                      {formatCurrency(variance.change)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography color={getVarianceColor(variance.percentChange)}>
                      {variance.percentChange.toFixed(1)}%
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    {getVarianceIcon(variance.change)}
                    {Math.abs(variance.percentChange) >= significanceThreshold && (
                      <Chip 
                        label="Significant" 
                        size="small" 
                        color={variance.change > 0 ? 'success' : 'error'}
                        variant="outlined"
                        sx={{ ml: 1 }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Account-Level Variances by Category */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Account-Level Variances
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Detailed account-level changes grouped by category. Only accounts with changes are shown.
        </Typography>

        {Object.entries(variancesByCategory).map(([categoryName, variances]) => (
          <Accordion key={categoryName} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Stack direction="row" alignItems="center" spacing={2} sx={{ width: '100%' }}>
                <Typography variant="subtitle1" fontWeight={600}>
                  {categoryName}
                </Typography>
                <Chip 
                  label={`${variances.length} accounts`} 
                  size="small" 
                  variant="outlined"
                />
                {categoryVariances[categoryName] && Math.abs(categoryVariances[categoryName].percentChange) >= significanceThreshold && (
                  <Chip 
                    label="Significant Changes" 
                    size="small" 
                    color={categoryVariances[categoryName].change > 0 ? 'success' : 'error'}
                    variant="filled"
                  />
                )}
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Account</TableCell>
                      <TableCell align="right">Period 1</TableCell>
                      <TableCell align="right">Period 2</TableCell>
                      <TableCell align="right">Change</TableCell>
                      <TableCell align="right">% Change</TableCell>
                      <TableCell align="center">Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {variances
                      .sort((a, b) => Math.abs(b.percentageChange) - Math.abs(a.percentageChange))
                      .map((variance) => (
                        <TableRow key={variance.accountId}>
                          <TableCell>
                            <Typography variant="body2">
                              {variance.accountName}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(variance.period1Balance)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatCurrency(variance.period2Balance)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              color={getVarianceColor(variance.percentageChange)}
                              fontWeight={Math.abs(variance.percentageChange) >= significanceThreshold ? 600 : 400}
                            >
                              {formatCurrency(variance.absoluteChange)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography 
                              variant="body2" 
                              color={getVarianceColor(variance.percentageChange)}
                              fontWeight={Math.abs(variance.percentageChange) >= significanceThreshold ? 600 : 400}
                            >
                              {variance.percentageChange.toFixed(1)}%
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                              {getVarianceIcon(variance.absoluteChange)}
                              {Math.abs(variance.percentageChange) >= significanceThreshold && (
                                <Chip 
                                  label="High" 
                                  size="small" 
                                  color={variance.absoluteChange > 0 ? 'success' : 'error'}
                                  variant="outlined"
                                />
                              )}
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>
        ))}

        {Object.keys(variancesByCategory).length === 0 && (
          <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
            No account-level variances found between the selected periods.
          </Typography>
        )}
      </Paper>
    </Box>
  )
}

export default TrialBalanceComparisonView