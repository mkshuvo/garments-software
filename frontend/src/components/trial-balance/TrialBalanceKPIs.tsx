'use client'

import React from 'react'
import { Box, Paper, Typography, Skeleton } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import PaidIcon from '@mui/icons-material/Paid'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import WarningIcon from '@mui/icons-material/Warning'

interface KPICardProps {
    title: string
    value: number
    type: 'asset' | 'liability' | 'equity' | 'status'
    loading?: boolean
    trend?: number // Percentage change
    isBalanced?: boolean // Specific for status card
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD', // Should be dynamic or configurable
        minimumFractionDigits: 2
    }).format(amount)
}

const KPICard: React.FC<KPICardProps> = ({ title, value, type, loading, trend, isBalanced }) => {
    // Determine styles based on type
    const getIcon = () => {
        switch (type) {
            case 'asset':
                return <AccountBalanceWalletIcon sx={{ color: '#fff' }} />
            case 'liability':
                return <PaidIcon sx={{ color: '#fff' }} />
            case 'equity':
                return <TrendingUpIcon sx={{ color: '#fff' }} />
            case 'status':
                return isBalanced ? <CheckCircleIcon sx={{ color: '#fff' }} /> : <WarningIcon sx={{ color: '#fff' }} />
        }
    }

    const getBackground = () => {
        switch (type) {
            case 'asset':
                return 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)'
            case 'liability':
                return 'linear-gradient(135deg, #EE5D50 0%, #FF7B73 100%)' // Reddish for liabilities
            case 'equity':
                return 'linear-gradient(135deg, #05CD99 0%, #38D9AA 100%)' // Greenish for equity/net
            case 'status':
                return isBalanced
                    ? 'linear-gradient(135deg, #05CD99 0%, #38D9AA 100%)'
                    : 'linear-gradient(135deg, #FFCE20 0%, #FFE270 100%)'
        }
    }

    const getFormattedValue = () => {
        if (type === 'status') {
            return isBalanced ? 'Balanced' : 'Unbalanced'
        }
        return formatCurrency(value)
    }

    return (
        <Paper
            sx={{
                p: 2,
                borderRadius: '20px',
                boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                height: '100%',
                backgroundColor: '#ffffff'
            }}
        >
            <Box
                sx={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    background: getBackground(),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)'
                }}
            >
                {getIcon()}
            </Box>

            <Box sx={{ flex: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                    {title}
                </Typography>

                {loading ? (
                    <Skeleton variant="text" width="60%" height={32} />
                ) : (
                    <Typography
                        variant="h6"
                        sx={{
                            color: '#2B3674',
                            fontWeight: 700,
                            lineHeight: 1.2,
                            fontSize: '1.25rem'
                        }}
                    >
                        {getFormattedValue()}
                    </Typography>
                )}

                {trend !== undefined && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                        {trend >= 0 ? (
                            <TrendingUpIcon sx={{ fontSize: 16, color: '#05CD99' }} />
                        ) : (
                            <TrendingDownIcon sx={{ fontSize: 16, color: '#EE5D50' }} />
                        )}
                        <Typography
                            variant="caption"
                            sx={{
                                color: trend >= 0 ? '#05CD99' : '#EE5D50',
                                fontWeight: 700
                            }}
                        >
                            {Math.abs(trend)}%
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            vs last month
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    )
}

export interface TrialBalanceKPIsProps {
    data: {
        totalAssets: number
        totalLiabilities: number
        totalEquity: number
        isBalanced: boolean
    }
    loading?: boolean
}

export const TrialBalanceKPIs: React.FC<TrialBalanceKPIsProps> = ({ data, loading }) => {
    return (
        <Box
            sx={{
                display: 'grid',
                gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    lg: 'repeat(4, 1fr)',
                },
                gap: 3,
                mb: 3,
            }}
        >
            <KPICard
                title="Total Assets"
                value={data.totalAssets}
                type="asset"
                loading={loading}
                trend={2.5} // Mock trend for now
            />
            <KPICard
                title="Total Liabilities"
                value={data.totalLiabilities}
                type="liability"
                loading={loading}
                trend={-1.2}
            />
            <KPICard
                title="Net Position"
                value={data.totalEquity}
                type="equity"
                loading={loading}
                trend={5.4}
            />
            <KPICard
                title="Balance Status"
                value={0}
                type="status"
                isBalanced={data.isBalanced}
                loading={loading}
            />
        </Box>
    )
}
