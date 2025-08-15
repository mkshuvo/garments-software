'use client'

import React, { useMemo, useCallback, useState, useEffect } from 'react'
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    Chip,
    Skeleton,
    Alert
} from '@mui/material'
import { FixedSizeList as VirtualList } from 'react-window'
import { AccountBalance } from '@/types/trialBalance'

export interface VirtualizedAccountListProps {
    accounts: AccountBalance[]
    onAccountClick: (accountId: string, accountName: string) => void
    showZeroBalances?: boolean
    height?: number
    itemHeight?: number
    className?: string
    loading?: boolean
    error?: string
}

interface AccountItemProps {
    index: number
    style: React.CSSProperties
    data: {
        accounts: AccountBalance[]
        onAccountClick: (accountId: string, accountName: string) => void
    }
}

const AccountItem: React.FC<AccountItemProps> = ({ index, style, data }) => {
    const { accounts, onAccountClick } = data
    const account = accounts[index]

    const handleClick = useCallback(() => {
        if (account) {
            onAccountClick(account.accountId, account.accountName)
        }
    }, [account, onAccountClick])

    if (!account) {
        return (
            <div style={style}>
                <Skeleton variant="rectangular" height={60} sx={{ m: 1, borderRadius: 1 }} />
            </div>
        )
    }

    const getBalanceColor = (balance: number) => {
        if (balance === 0) return 'default'
        return balance > 0 ? 'success' : 'error'
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 2
        }).format(amount)
    }

    return (
        <div style={style}>
            <Paper
                elevation={1}
                sx={{
                    m: 0.5,
                    '&:hover': {
                        elevation: 2,
                        backgroundColor: 'action.hover'
                    }
                }}
            >
                <ListItemButton
                    onClick={handleClick}
                    sx={{
                        py: 1.5,
                        px: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2
                    }}
                >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 'medium',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}
                        >
                            {account.accountName}
                        </Typography>
                        
                        {account.categoryDescription && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                {account.categoryDescription}
                            </Typography>
                        )}
                        
                        {account.particulars && (
                            <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                    display: 'block',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    fontStyle: 'italic'
                                }}
                            >
                                {account.particulars}
                            </Typography>
                        )}
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
                        <Chip
                            label={formatCurrency(account.netBalance)}
                            color={getBalanceColor(account.netBalance)}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 'medium' }}
                        />
                        
                        {account.transactionCount > 0 && (
                            <Typography variant="caption" color="text.secondary">
                                {account.transactionCount} transactions
                            </Typography>
                        )}
                    </Box>
                </ListItemButton>
            </Paper>
        </div>
    )
}

export const VirtualizedAccountList: React.FC<VirtualizedAccountListProps> = ({
    accounts,
    onAccountClick,
    showZeroBalances = false,
    height = 400,
    itemHeight = 80,
    className,
    loading = false,
    error
}) => {
    const [containerHeight, setContainerHeight] = useState(height)

    // Filter accounts based on zero balance preference
    const filteredAccounts = useMemo(() => {
        if (showZeroBalances) {
            return accounts
        }
        return accounts.filter(account => account.netBalance !== 0)
    }, [accounts, showZeroBalances])

    // Memoize the data object to prevent unnecessary re-renders
    const itemData = useMemo(() => ({
        accounts: filteredAccounts,
        onAccountClick
    }), [filteredAccounts, onAccountClick])

    // Adjust height based on content
    useEffect(() => {
        const maxHeight = Math.min(filteredAccounts.length * itemHeight, height)
        setContainerHeight(maxHeight)
    }, [filteredAccounts.length, itemHeight, height])

    // Handle loading state
    if (loading) {
        return (
            <Box className={className} sx={{ height: containerHeight }}>
                <Typography variant="h6" gutterBottom>
                    Account List
                </Typography>
                <Box sx={{ height: containerHeight - 40 }}>
                    {Array.from({ length: Math.ceil(containerHeight / itemHeight) }).map((_, index) => (
                        <Skeleton
                            key={index}
                            variant="rectangular"
                            height={itemHeight - 8}
                            sx={{ mb: 1, borderRadius: 1 }}
                        />
                    ))}
                </Box>
            </Box>
        )
    }

    // Handle error state
    if (error) {
        return (
            <Box className={className}>
                <Typography variant="h6" gutterBottom>
                    Account List
                </Typography>
                <Alert severity="error" sx={{ mt: 2 }}>
                    {error}
                </Alert>
            </Box>
        )
    }

    // Handle empty state
    if (filteredAccounts.length === 0) {
        return (
            <Box className={className}>
                <Typography variant="h6" gutterBottom>
                    Account List
                </Typography>
                <Paper elevation={1} sx={{ p: 3, textAlign: 'center', mt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                        {showZeroBalances 
                            ? 'No accounts found for the selected criteria.'
                            : 'No accounts with non-zero balances found. Try enabling "Show Zero Balance Accounts".'}
                    </Typography>
                </Paper>
            </Box>
        )
    }

    return (
        <Box className={className}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                    Account List
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {filteredAccounts.length} accounts
                    {!showZeroBalances && accounts.length > filteredAccounts.length && 
                        ` (${accounts.length - filteredAccounts.length} zero balance accounts hidden)`}
                </Typography>
            </Box>

            <Paper elevation={1} sx={{ height: containerHeight, overflow: 'hidden' }}>
                <VirtualList
                    height={containerHeight}
                    width="100%"
                    itemCount={filteredAccounts.length}
                    itemSize={itemHeight}
                    itemData={itemData}
                    overscanCount={5} // Render 5 extra items for smooth scrolling
                >
                    {AccountItem}
                </VirtualList>
            </Paper>
        </Box>
    )
}

export default VirtualizedAccountList