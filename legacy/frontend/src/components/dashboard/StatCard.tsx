'use client'

import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'

interface StatCardProps {
    title: string
    value: string | number
    subtitle?: string
    change?: number
    icon?: React.ReactNode
    iconBg?: string
}

export default function StatCard({
    title,
    value,
    subtitle,
    change,
    icon,
    iconBg = 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
}: StatCardProps) {
    const isPositive = change && change >= 0
    const changeColor = isPositive ? '#05CD99' : '#EE5D50'

    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: '20px',
                boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
                backgroundColor: '#ffffff',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: '#A3AED0',
                            fontWeight: 500,
                            fontSize: '0.8125rem',
                            mb: 1,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            color: '#2B3674',
                            fontSize: '1.75rem',
                            lineHeight: 1.2,
                        }}
                    >
                        {typeof value === 'number' ? `$${value.toLocaleString()}` : value}
                    </Typography>
                </Box>

                {icon && (
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: '50%',
                            background: iconBg,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            '& svg': {
                                fontSize: 28,
                            },
                        }}
                    >
                        {icon}
                    </Box>
                )}
            </Box>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                {change !== undefined && (
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            backgroundColor: isPositive ? 'rgba(5, 205, 153, 0.1)' : 'rgba(238, 93, 80, 0.1)',
                            borderRadius: '8px',
                            px: 1,
                            py: 0.5,
                        }}
                    >
                        {isPositive ? (
                            <TrendingUpIcon sx={{ fontSize: 14, color: changeColor }} />
                        ) : (
                            <TrendingDownIcon sx={{ fontSize: 14, color: changeColor }} />
                        )}
                        <Typography
                            variant="caption"
                            sx={{
                                color: changeColor,
                                fontWeight: 600,
                                fontSize: '0.75rem',
                            }}
                        >
                            {isPositive ? '+' : ''}{change}%
                        </Typography>
                    </Box>
                )}
                {subtitle && (
                    <Typography
                        variant="caption"
                        sx={{
                            color: '#A3AED0',
                            fontSize: '0.75rem',
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Box>
        </Paper>
    )
}
