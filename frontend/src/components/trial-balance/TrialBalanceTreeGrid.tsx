'use client'

import React, { useState } from 'react'
import {
    Box,
    Paper,
    Typography,
    IconButton,
    Collapse,
    Tooltip,
    Divider
} from '@mui/material'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import { TrialBalanceData, AccountCategory, AccountBalance } from '@/types/trialBalance'

interface TrialBalanceTreeGridProps {
    data: TrialBalanceData
    onAccountClick?: (accountId: string, accountName: string) => void
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
    }).format(Math.abs(amount)) // We handle signs visually or by column, usually absolute in columns
}

const Sparkline = ({ color }: { color: string }) => (
    <svg width="60" height="20" viewBox="0 0 60 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M1 18L10 12L20 16L30 8L40 12L50 4L59 10"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
)


const AccountRow = ({
    account,
    onClick
}: {
    account: AccountBalance,
    onClick?: (id: string, name: string) => void
}) => {
    const isPositive = account.netBalance >= 0

    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 2fr) 100px 1fr 1fr 1fr 100px',
                gap: 2,
                py: 2,
                px: 3,
                borderBottom: '1px solid #F4F7FE',
                alignItems: 'center',
                transition: 'background-color 0.2s',
                cursor: onClick ? 'pointer' : 'default',
                '&:hover': {
                    backgroundColor: '#FAFCFF',
                    '& .account-name': { color: '#4318FF' }
                }
            }}
            onClick={() => onClick && onClick(account.accountId, account.accountName)}
        >
            {/* Account Name */}
            <Box sx={{ pl: 4 }}>
                <Typography
                    variant="body2"
                    className="account-name"
                    sx={{ color: '#2B3674', fontWeight: 600, transition: 'color 0.2s' }}
                >
                    {account.accountName}
                </Typography>
            </Box>

            {/* Code */}
            <Typography variant="caption" sx={{ color: '#A3AED0', fontFamily: 'monospace' }}>
                {account.accountId.substring(0, 4)}...
            </Typography>

            {/* Debit */}
            <Typography variant="body2" sx={{ color: '#2B3674', textAlign: 'right' }}>
                {account.debitAmount !== 0 ? formatCurrency(account.debitAmount) : '-'}
            </Typography>

            {/* Credit */}
            <Typography variant="body2" sx={{ color: '#2B3674', textAlign: 'right' }}>
                {account.creditAmount !== 0 ? formatCurrency(account.creditAmount) : '-'}
            </Typography>

            {/* Net Balance */}
            <Typography
                variant="body2"
                sx={{
                    color: isPositive ? '#05CD99' : '#EE5D50',
                    fontWeight: 700,
                    textAlign: 'right'
                }}
            >
                {formatCurrency(account.netBalance)}
            </Typography>

            {/* Trend */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Sparkline color={isPositive ? '#05CD99' : '#EE5D50'} />
            </Box>
        </Box>
    )
}

const CategorySection = ({
    category,
    onAccountClick
}: {
    category: AccountCategory,
    onAccountClick?: (id: string, name: string) => void
}) => {
    const [expanded, setExpanded] = useState(true)

    return (
        <Box sx={{ mb: 1 }}>
            {/* Category Header */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 2fr) 100px 1fr 1fr 1fr 100px',
                    gap: 2,
                    py: 2,
                    px: 3,
                    backgroundColor: '#F7F9FB', // Light gray background for category headers
                    // borderBottom: expanded ? '1px solid #E0E5F2' : 'none',
                    cursor: 'pointer',
                    alignItems: 'center'
                }}
                onClick={() => setExpanded(!expanded)}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButton size="small" sx={{ p: 0.5 }}>
                        {expanded ? <KeyboardArrowDownIcon /> : <KeyboardArrowRightIcon />}
                    </IconButton>
                    <Typography variant="subtitle1" sx={{ color: '#2B3674', fontWeight: 700 }}>
                        {category.name}
                    </Typography>
                </Box>

                <Box /> {/* Spacer for Code */}

                <Box /> {/* Spacer for Debit */}
                <Box /> {/* Spacer for Credit */}

                {/* Subtotal */}
                <Typography
                    variant="subtitle2"
                    sx={{
                        color: '#2B3674',
                        fontWeight: 700,
                        textAlign: 'right'
                    }}
                >
                    {formatCurrency(category.subtotal)}
                </Typography>

                <Box /> {/* Spacer for Trend */}
            </Box>

            {/* Account Rows */}
            <Collapse in={expanded}>
                <Box>
                    {category.accounts.map((account) => (
                        <AccountRow
                            key={account.accountId}
                            account={account}
                            onClick={onAccountClick}
                        />
                    ))}
                    {category.accounts.length === 0 && (
                        <Typography
                            variant="body2"
                            sx={{ p: 2, textAlign: 'center', color: '#A3AED0', fontStyle: 'italic' }}
                        >
                            No accounts in this category
                        </Typography>
                    )}
                </Box>
            </Collapse>
        </Box>
    )
}

export const TrialBalanceTreeGrid: React.FC<TrialBalanceTreeGridProps> = ({ data, onAccountClick }) => {
    return (
        <Paper
            sx={{
                width: '100%',
                borderRadius: '20px',
                boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
                backgroundColor: '#ffffff',
                overflow: 'hidden'
            }}
        >
            {/* Grid Header */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 2fr) 100px 1fr 1fr 1fr 100px',
                    gap: 2,
                    py: 2.5,
                    px: 3,
                    borderBottom: '1px solid #E0E5F2',
                    backgroundColor: '#FAFCFF'
                }}
            >
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, letterSpacing: '0.5px' }}>
                    ACCOUNT NAME
                </Typography>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, letterSpacing: '0.5px' }}>
                    CODE
                </Typography>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'right' }}>
                    DEBIT
                </Typography>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'right' }}>
                    CREDIT
                </Typography>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'right' }}>
                    NET BALANCE
                </Typography>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontWeight: 700, letterSpacing: '0.5px', textAlign: 'center' }}>
                    TREND
                </Typography>
            </Box>

            {/* Content */}
            <Box>
                {data.categories.map((category) => (
                    <CategorySection
                        key={category.name}
                        category={category}
                        onAccountClick={onAccountClick}
                    />
                ))}
            </Box>

            {/* Footer / Grand Total */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(300px, 2fr) 100px 1fr 1fr 1fr 100px',
                    gap: 2,
                    py: 3,
                    px: 3,
                    borderTop: '2px solid #E0E5F2',
                    backgroundColor: '#FAFCFF'
                }}
            >
                <Typography variant="h6" sx={{ color: '#2B3674', fontWeight: 700 }}>
                    Grand Total
                </Typography>
                <Box />

                <Typography variant="subtitle1" sx={{ color: '#2B3674', fontWeight: 700, textAlign: 'right' }}>
                    {formatCurrency(data.totalDebits)}
                </Typography>

                <Typography variant="subtitle1" sx={{ color: '#2B3674', fontWeight: 700, textAlign: 'right' }}>
                    {formatCurrency(data.totalCredits)}
                </Typography>

                <Typography
                    variant="subtitle1"
                    sx={{
                        color: data.finalBalance === 0 ? '#05CD99' : '#EE5D50',
                        fontWeight: 700,
                        textAlign: 'right'
                    }}
                >
                    {formatCurrency(data.finalBalance)}
                </Typography>

                <Box />
            </Box>
        </Paper>
    )
}
