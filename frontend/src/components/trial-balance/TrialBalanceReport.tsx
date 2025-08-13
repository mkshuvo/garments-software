'use client'

import React, { useState, useCallback, useEffect } from 'react'
import {
    Box,
    Typography,
    Paper,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel,
    Stack,
    Skeleton,
    Fade,
    Collapse,
    IconButton
} from '@mui/material'
import {
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material'
import { DateRangeSelector } from './DateRangeSelector'
import { AccountCategorySection } from './AccountCategorySection'
import { TrialBalanceCalculation } from './TrialBalanceCalculation'
import { AccountDrillDown } from './AccountDrillDown'
import { trialBalanceService } from '@/services/trialBalanceService'
import {
    TrialBalanceData,
    DateRange,
    TrialBalanceError
} from '@/types/trialBalance'
import {
    startOfMonth,
    endOfMonth
} from 'date-fns'

export interface TrialBalanceReportProps {
    defaultDateRange?: DateRange
    onAccountClick?: (accountId: string, accountName: string) => void
    showCalculationDetails?: boolean
    groupByCategory?: boolean
    className?: string
}

interface LoadingState {
    isLoading: boolean
    error: TrialBalanceError | null
    lastUpdated: Date | null
}

export const TrialBalanceReport: React.FC<TrialBalanceReportProps> = ({
    defaultDateRange,
    onAccountClick,
    showCalculationDetails = true,
    groupByCategory = true,
    className
}) => {
    // State management
    const [dateRange, setDateRange] = useState<DateRange>(() => {
        if (defaultDateRange) {
            return defaultDateRange
        }
        const now = new Date()
        return {
            startDate: startOfMonth(now),
            endDate: endOfMonth(now)
        }
    })

    const [trialBalanceData, setTrialBalanceData] = useState<TrialBalanceData | null>(null)
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: false,
        error: null,
        lastUpdated: null
    })

    // UI preferences
    const [showZeroBalances, setShowZeroBalances] = useState(false)
    const [expandedCategories] = useState<Set<string>>(new Set())
    const [showFilters, setShowFilters] = useState(false)
    
    // Account drill-down modal state
    const [drillDownState, setDrillDownState] = useState<{
        isOpen: boolean
        accountId: string | null
        accountName: string | null
    }>({
        isOpen: false,
        accountId: null,
        accountName: null
    })

    // Generate trial balance report
    const generateReport = useCallback(async (dateRangeToUse?: DateRange) => {
        const targetDateRange = dateRangeToUse || dateRange

        // Validate date range
        const validationError = trialBalanceService.getDateRangeValidationError(targetDateRange)
        if (validationError) {
            setLoadingState({
                isLoading: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: validationError
                },
                lastUpdated: null
            })
            return
        }

        setLoadingState({
            isLoading: true,
            error: null,
            lastUpdated: null
        })

        try {
            const data = await trialBalanceService.generateTrialBalance(targetDateRange, {
                groupByCategory,
                includeZeroBalances: showZeroBalances
            })

            setTrialBalanceData(data)
            setLoadingState({
                isLoading: false,
                error: null,
                lastUpdated: new Date()
            })
        } catch (error) {
            console.error('Failed to generate trial balance:', error)

            setLoadingState({
                isLoading: false,
                error: {
                    code: 'GENERATION_ERROR',
                    message: error instanceof Error ? error.message : 'Failed to generate trial balance report'
                },
                lastUpdated: null
            })
        }
    }, [dateRange, groupByCategory, showZeroBalances])

    // Handle date range changes
    const handleDateRangeChange = useCallback((startDate: Date, endDate: Date) => {
        const newDateRange = { startDate, endDate }
        setDateRange(newDateRange)

        // Auto-generate report when date range changes
        generateReport(newDateRange)
    }, [generateReport])

    // Handle account click for drill-down
    const handleAccountClick = useCallback((accountId: string, accountName: string) => {
        // Open the drill-down modal
        setDrillDownState({
            isOpen: true,
            accountId,
            accountName
        })
        
        // Also call the external handler if provided
        if (onAccountClick) {
            onAccountClick(accountId, accountName)
        }
    }, [onAccountClick])
    
    // Handle drill-down modal close
    const handleDrillDownClose = useCallback(() => {
        setDrillDownState({
            isOpen: false,
            accountId: null,
            accountName: null
        })
    }, [])

    // Handle show zero balances toggle
    const handleShowZeroBalancesChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked
        setShowZeroBalances(newValue)

        // Regenerate report with new setting immediately
        const generateWithNewSetting = async () => {
            const validationError = trialBalanceService.getDateRangeValidationError(dateRange)
            if (validationError) {
                setLoadingState({
                    isLoading: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: validationError
                    },
                    lastUpdated: null
                })
                return
            }

            setLoadingState({
                isLoading: true,
                error: null,
                lastUpdated: null
            })

            try {
                const data = await trialBalanceService.generateTrialBalance(dateRange, {
                    groupByCategory,
                    includeZeroBalances: newValue // Use the new value directly
                })

                setTrialBalanceData(data)
                setLoadingState({
                    isLoading: false,
                    error: null,
                    lastUpdated: new Date()
                })
            } catch (error) {
                console.error('Failed to generate trial balance:', error)

                setLoadingState({
                    isLoading: false,
                    error: {
                        code: 'GENERATION_ERROR',
                        message: error instanceof Error ? error.message : 'Failed to generate trial balance report'
                    },
                    lastUpdated: null
                })
            }
        }

        generateWithNewSetting()
    }, [dateRange, groupByCategory])

    // Initial load
    useEffect(() => {
        generateReport()
    }, [generateReport]) // Include generateReport in dependencies

    // Render loading skeleton
    const renderLoadingSkeleton = () => (
        <Stack spacing={3}>
            <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
            <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 2 }} />
            {[1, 2, 3].map((index) => (
                <Skeleton key={index} variant="rectangular" height={300} sx={{ borderRadius: 2 }} />
            ))}
        </Stack>
    )

    // Render error state
    const renderError = () => (
        <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
                <IconButton
                    size="small"
                    aria-label="refresh"
                    onClick={() => generateReport()}
                    sx={{ color: 'inherit' }}
                >
                    <RefreshIcon />
                </IconButton>
            }
        >
            <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {loadingState.error?.message || 'An error occurred while generating the trial balance report'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Click the refresh icon to try again
            </Typography>
        </Alert>
    )

    // Render empty state
    const renderEmptyState = () => (
        <Paper elevation={1} sx={{ p: 4, textAlign: 'center', mt: 3 }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
                No Data Available
            </Typography>
            <Typography variant="body2" color="text.secondary">
                No transactions found for the selected date range. Try adjusting your date selection.
            </Typography>
        </Paper>
    )

    // Filter categories based on zero balance preference
    const getFilteredCategories = () => {
        if (!trialBalanceData) return []

        return trialBalanceData.categories.filter(category => {
            if (showZeroBalances) return true
            return category.accounts.some(account => account.netBalance !== 0)
        })
    }

    const filteredCategories = getFilteredCategories()

    return (
        <Box
            className={className}
            sx={{ width: '100%' }}
            data-testid="trial-balance-report"
        >
            {/* Header Section */}
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
                <Box sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', md: 'center' },
                    gap: 2,
                    mb: 2
                }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                        Trial Balance Report
                    </Typography>

                    {loadingState.lastUpdated && (
                        <Typography variant="caption" color="text.secondary">
                            Last updated: {loadingState.lastUpdated.toLocaleString()}
                        </Typography>
                    )}
                </Box>

                {/* Controls Section */}
                <Stack spacing={2}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        alignItems: { xs: 'stretch', sm: 'center' },
                        gap: 2
                    }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showZeroBalances}
                                    onChange={handleShowZeroBalancesChange}
                                    disabled={loadingState.isLoading}
                                    icon={<VisibilityOffIcon />}
                                    checkedIcon={<VisibilityIcon />}
                                />
                            }
                            label="Show Zero Balance Accounts"
                            sx={{ mr: { xs: 0, sm: 2 } }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={showFilters}
                                    onChange={(e) => setShowFilters(e.target.checked)}
                                    icon={<FilterIcon />}
                                    checkedIcon={<FilterIcon />}
                                />
                            }
                            label="Show Filters"
                        />
                    </Box>

                    <Collapse in={showFilters}>
                        <Box sx={{ pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Typography variant="subtitle2" gutterBottom>
                                Additional filters and options will be available here
                            </Typography>
                        </Box>
                    </Collapse>
                </Stack>
            </Paper>

            {/* Date Range Selector */}
            <DateRangeSelector
                startDate={dateRange.startDate}
                endDate={dateRange.endDate}
                onDateChange={handleDateRangeChange}
                disabled={loadingState.isLoading}
                error={loadingState.error?.code === 'VALIDATION_ERROR' ? loadingState.error.message : undefined}
                helperText="Select the date range for your trial balance report"
            />

            {/* Loading State */}
            {loadingState.isLoading && (
                <Box sx={{ mt: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography variant="body2" color="text.secondary">
                            Generating trial balance report...
                        </Typography>
                    </Box>
                    {renderLoadingSkeleton()}
                </Box>
            )}

            {/* Error State */}
            {loadingState.error && !loadingState.isLoading && renderError()}

            {/* Main Content */}
            {!loadingState.isLoading && !loadingState.error && trialBalanceData && (
                <Fade in={true} timeout={500}>
                    <Box sx={{ mt: 3 }}>
                        {/* Trial Balance Calculation */}
                        {showCalculationDetails && (
                            <TrialBalanceCalculation
                                data={trialBalanceData}
                                showDetailedBreakdown={true}
                                variant="standard"
                            />
                        )}

                        {/* Summary Information */}
                        <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Report Summary
                            </Typography>

                            <Box sx={{
                                display: 'grid',
                                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
                                gap: 2
                            }}>
                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Categories
                                    </Typography>
                                    <Typography variant="h6">
                                        {filteredCategories.length}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Accounts
                                    </Typography>
                                    <Typography variant="h6">
                                        {filteredCategories.reduce((sum, cat) => sum + cat.accounts.length, 0)}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Total Transactions
                                    </Typography>
                                    <Typography variant="h6">
                                        {trialBalanceData.totalTransactions.toLocaleString()}
                                    </Typography>
                                </Box>

                                <Box>
                                    <Typography variant="body2" color="text.secondary">
                                        Final Balance
                                    </Typography>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            color: trialBalanceData.finalBalance === 0
                                                ? 'success.main'
                                                : trialBalanceData.finalBalance > 0
                                                    ? 'success.main'
                                                    : 'error.main'
                                        }}
                                    >
                                        {trialBalanceData.finalBalance.toLocaleString()}
                                    </Typography>
                                </Box>
                            </Box>
                        </Paper>

                        {/* Account Categories */}
                        {filteredCategories.length > 0 ? (
                            <Stack spacing={2}>
                                {filteredCategories.map((category) => (
                                    <AccountCategorySection
                                        key={category.name}
                                        category={category}
                                        onAccountClick={handleAccountClick}
                                        showZeroBalances={showZeroBalances}
                                        defaultExpanded={expandedCategories.has(category.name)}
                                    />
                                ))}
                            </Stack>
                        ) : (
                            renderEmptyState()
                        )}

                        {/* Footer Information */}
                        <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center' }}>
                                Report generated on {trialBalanceData.generatedAt.toLocaleString()} •
                                Date range: {trialBalanceData.dateRange.startDate.toLocaleDateString()} - {trialBalanceData.dateRange.endDate.toLocaleDateString()}
                                {showZeroBalances && ' • Including zero balance accounts'}
                            </Typography>
                        </Paper>
                    </Box>
                </Fade>
            )}
            
            {/* Account Drill-Down Modal */}
            {drillDownState.isOpen && drillDownState.accountId && drillDownState.accountName && (
                <AccountDrillDown
                    accountId={drillDownState.accountId}
                    accountName={drillDownState.accountName}
                    dateRange={dateRange}
                    isOpen={drillDownState.isOpen}
                    onClose={handleDrillDownClose}
                />
            )}
        </Box>
    )
}

export default TrialBalanceReport