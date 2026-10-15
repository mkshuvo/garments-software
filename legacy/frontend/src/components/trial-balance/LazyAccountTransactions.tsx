'use client'

import React, { useState, useCallback, useEffect, useMemo } from 'react'
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Skeleton,
    Alert,
    Chip,
    IconButton,
    Collapse,
    CircularProgress
} from '@mui/material'
import {
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Refresh as RefreshIcon
} from '@mui/icons-material'
import { trialBalanceService } from '@/services/trialBalanceService'
import { AccountTransaction, DateRange } from '@/types/trialBalance'

export interface LazyAccountTransactionsProps {
    accountId: string
    accountName: string
    dateRange: DateRange
    initiallyExpanded?: boolean
    pageSize?: number
    className?: string
}

interface LoadingState {
    isLoading: boolean
    error: string | null
    hasLoaded: boolean
}

interface PaginationState {
    page: number
    rowsPerPage: number
    totalCount: number
}

export const LazyAccountTransactions: React.FC<LazyAccountTransactionsProps> = ({
    accountId,
    accountName,
    dateRange,
    initiallyExpanded = false,
    pageSize = 25,
    className
}) => {
    // State management
    const [expanded, setExpanded] = useState(initiallyExpanded)
    const [transactions, setTransactions] = useState<AccountTransaction[]>([])
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: false,
        error: null,
        hasLoaded: false
    })
    const [pagination, setPagination] = useState<PaginationState>({
        page: 0,
        rowsPerPage: pageSize,
        totalCount: 0
    })

    // Load transactions when expanded
    const loadTransactions = useCallback(async (force = false) => {
        if (!expanded && !force) return
        if (loadingState.hasLoaded && !force) return

        setLoadingState({
            isLoading: true,
            error: null,
            hasLoaded: loadingState.hasLoaded
        })

        try {
            const data = await trialBalanceService.getAccountTransactions(
                accountId,
                dateRange.startDate,
                dateRange.endDate
            )

            // Map TransactionDetail[] to AccountTransaction[]
            const mappedTransactions: AccountTransaction[] = data.map(transaction => ({
                ...transaction,
                accountId,
                accountName: accountName || 'Unknown Account'
            }))

            setTransactions(mappedTransactions)
            setPagination(prev => ({
                ...prev,
                totalCount: data.length,
                page: 0 // Reset to first page when reloading
            }))

            setLoadingState({
                isLoading: false,
                error: null,
                hasLoaded: true
            })
        } catch (error) {
            console.error('Failed to load account transactions:', error)
            setLoadingState({
                isLoading: false,
                error: error instanceof Error ? error.message : 'Failed to load transactions',
                hasLoaded: false
            })
        }
    }, [accountId, dateRange, expanded, loadingState.hasLoaded, accountName])

    // Handle expand/collapse
    const handleExpandClick = useCallback(() => {
        const newExpanded = !expanded
        setExpanded(newExpanded)
        
        if (newExpanded && !loadingState.hasLoaded) {
            loadTransactions(true)
        }
    }, [expanded, loadingState.hasLoaded, loadTransactions])

    // Handle pagination changes
    const handlePageChange = useCallback((event: unknown, newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }))
    }, [])

    const handleRowsPerPageChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newRowsPerPage = parseInt(event.target.value, 10)
        setPagination(prev => ({
            ...prev,
            rowsPerPage: newRowsPerPage,
            page: 0
        }))
    }, [])

    // Handle refresh
    const handleRefresh = useCallback(() => {
        loadTransactions(true)
    }, [loadTransactions])

    // Get paginated transactions
    const paginatedTransactions = useMemo(() => {
        const startIndex = pagination.page * pagination.rowsPerPage
        const endIndex = startIndex + pagination.rowsPerPage
        return transactions.slice(startIndex, endIndex)
    }, [transactions, pagination.page, pagination.rowsPerPage])

    // Format currency
    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount)
    }, [])

    // Get balance color
    const getBalanceColor = useCallback((balance: number) => {
        if (balance === 0) return 'default'
        return balance > 0 ? 'success' : 'error'
    }, [])

    // Load transactions when component mounts if initially expanded
    useEffect(() => {
        if (initiallyExpanded) {
            loadTransactions()
        }
    }, [initiallyExpanded, loadTransactions])

    // Render loading skeleton
    const renderLoadingSkeleton = () => (
        <TableContainer>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {['Date', 'Description', 'Reference', 'Debit', 'Credit', 'Balance'].map((header) => (
                            <TableCell key={header}>
                                <Skeleton variant="text" width="100%" />
                            </TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: 5 }).map((_, index) => (
                        <TableRow key={index}>
                            {Array.from({ length: 6 }).map((_, cellIndex) => (
                                <TableCell key={cellIndex}>
                                    <Skeleton variant="text" width="100%" />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    )

    // Render error state
    const renderError = () => (
        <Alert 
            severity="error" 
            action={
                <IconButton
                    color="inherit"
                    size="small"
                    onClick={handleRefresh}
                    disabled={loadingState.isLoading}
                >
                    <RefreshIcon />
                </IconButton>
            }
        >
            {loadingState.error}
        </Alert>
    )

    // Render empty state
    const renderEmptyState = () => (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
                No transactions found for this account in the selected date range.
            </Typography>
        </Box>
    )

    // Render transactions table
    const renderTransactionsTable = () => (
        <>
            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell>Reference</TableCell>
                            <TableCell align="right">Debit</TableCell>
                            <TableCell align="right">Credit</TableCell>
                            <TableCell align="right">Balance</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {paginatedTransactions.map((transaction) => (
                            <TableRow
                                key={transaction.id}
                                hover
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell>
                                    <Typography variant="body2">
                                        {transaction.date.toLocaleDateString()}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="caption" color="text.secondary">
                                        {transaction.categoryDescription}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography 
                                        variant="body2"
                                        sx={{
                                            maxWidth: 200,
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap'
                                        }}
                                        title={transaction.particulars}
                                    >
                                        {transaction.particulars}
                                    </Typography>
                                </TableCell>
                                <TableCell>
                                    <Typography variant="body2" color="text.secondary">
                                        {transaction.referenceNumber}
                                    </Typography>
                                </TableCell>
                                <TableCell align="right">
                                    {transaction.debitAmount !== 0 && (
                                        <Chip
                                            label={formatCurrency(Math.abs(transaction.debitAmount))}
                                            color="error"
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    {transaction.creditAmount !== 0 && (
                                        <Chip
                                            label={formatCurrency(transaction.creditAmount)}
                                            color="success"
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                </TableCell>
                                <TableCell align="right">
                                    <Chip
                                        label={formatCurrency(transaction.runningBalance)}
                                        color={getBalanceColor(transaction.runningBalance)}
                                        size="small"
                                        variant="filled"
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {transactions.length > pagination.rowsPerPage && (
                <TablePagination
                    component="div"
                    count={pagination.totalCount}
                    page={pagination.page}
                    onPageChange={handlePageChange}
                    rowsPerPage={pagination.rowsPerPage}
                    onRowsPerPageChange={handleRowsPerPageChange}
                    rowsPerPageOptions={[10, 25, 50, 100]}
                    showFirstButton
                    showLastButton
                />
            )}
        </>
    )

    return (
        <Paper elevation={1} className={className} sx={{ mb: 2 }}>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderBottom: expanded ? '1px solid' : 'none',
                    borderColor: 'divider',
                    cursor: 'pointer'
                }}
                onClick={handleExpandClick}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small">
                        {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                        {accountName} - Transaction Details
                    </Typography>
                    {loadingState.hasLoaded && (
                        <Chip
                            label={`${transactions.length} transactions`}
                            size="small"
                            variant="outlined"
                        />
                    )}
                </Box>

                {expanded && loadingState.hasLoaded && (
                    <IconButton
                        size="small"
                        onClick={(e) => {
                            e.stopPropagation()
                            handleRefresh()
                        }}
                        disabled={loadingState.isLoading}
                    >
                        {loadingState.isLoading ? (
                            <CircularProgress size={16} />
                        ) : (
                            <RefreshIcon />
                        )}
                    </IconButton>
                )}
            </Box>

            {/* Content */}
            <Collapse in={expanded}>
                <Box sx={{ minHeight: expanded ? 200 : 0 }}>
                    {loadingState.isLoading && renderLoadingSkeleton()}
                    {loadingState.error && !loadingState.isLoading && renderError()}
                    {!loadingState.isLoading && !loadingState.error && transactions.length === 0 && renderEmptyState()}
                    {!loadingState.isLoading && !loadingState.error && transactions.length > 0 && renderTransactionsTable()}
                </Box>
            </Collapse>
        </Paper>
    )
}

export default LazyAccountTransactions