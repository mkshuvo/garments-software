'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Box, Typography, Button, IconButton, Menu, MenuItem } from '@mui/material'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import FilterListIcon from '@mui/icons-material/FilterList'
import FileDownloadIcon from '@mui/icons-material/FileDownload'
import AddIcon from '@mui/icons-material/Add'
import { TrialBalanceKPIs } from './TrialBalanceKPIs'
import { TrialBalanceTreeGrid } from './TrialBalanceTreeGrid'
import { trialBalanceService } from '@/services/trialBalanceService'
import { TrialBalanceData, DateRange } from '@/types/trialBalance'
import { startOfMonth, endOfMonth } from 'date-fns'
import { DateRangeSelector } from './DateRangeSelector'

export default function TrialBalanceDashboard() {
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfMonth(new Date()),
        endDate: new Date() // Current date
    })

    const [data, setData] = useState<TrialBalanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showZeroBalances, setShowZeroBalances] = useState(false) // Toggle state

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const result = await trialBalanceService.generateTrialBalance(dateRange, {
                groupByCategory: true,
                includeZeroBalances: showZeroBalances
            })
            setData(result)
        } catch (error) {
            console.error("Failed to fetch trial balance:", error)
            // Handle error state suitable for dashboard
        } finally {
            setLoading(false)
        }
    }, [dateRange, showZeroBalances])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    // KPI Data Calculation
    const getKPIData = () => {
        if (!data) return {
            totalAssets: 0,
            totalLiabilities: 0,
            totalEquity: 0,
            isBalanced: false
        }

        // We assume categories are named consistently from backend/enum
        // If not, we might need to sum by AccountType from data
        const assets = data.categories.find(c => c.name === 'Assets')?.subtotal || 0
        const liabilities = data.categories.find(c => c.name === 'Liabilities')?.subtotal || 0
        const equity = data.categories.find(c => c.name === 'Equity')?.subtotal || 0
        const income = data.categories.find(c => c.name === 'Income')?.subtotal || 0
        const expenses = data.categories.find(c => c.name === 'Expenses')?.subtotal || 0

        // Net Position roughly Equity + (Income - Expenses) or just Assets - Liabilities
        // Let's use Assets - Liabilities for a quick "Net Assets" view, or strictly Equity
        // The dashboard screenshot showed "Net Position" which usually implies Equity or Net Assets.

        return {
            totalAssets: assets,
            totalLiabilities: liabilities,
            totalEquity: (assets - liabilities), // Simple Net Assets
            isBalanced: data.finalBalance === 0
        }
    }

    return (
        <Box sx={{ p: 3, maxWidth: '1600px', mx: 'auto' }}>
            {/* Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#2B3674',
                            fontWeight: 700,
                            mb: 0.5
                        }}
                    >
                        Trial Balance
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#A3AED0' }}>
                        Financial Overview & Analysis • {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<FileDownloadIcon />}
                        variant="outlined"
                        sx={{
                            borderRadius: '10px',
                            color: '#2B3674',
                            borderColor: '#E0E5F2',
                            textTransform: 'none',
                            fontWeight: 600
                        }}
                    >
                        Export
                    </Button>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        sx={{
                            borderRadius: '10px',
                            background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
                            textTransform: 'none',
                            fontWeight: 600,
                            boxShadow: '0 4px 10px rgba(67, 24, 255, 0.4)'
                        }}
                    >
                        New Journal Entry
                    </Button>
                </Box>
            </Box>

            {/* KPIs */}
            <TrialBalanceKPIs data={getKPIData()} loading={loading} />

            {/* Controls Bar */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#ffffff',
                    p: 1.5,
                    borderRadius: '16px',
                    boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
                    mb: 3
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            backgroundColor: '#4318FF',
                            fontWeight: 600
                        }}
                    >
                        Standard View
                    </Button>
                    <Button
                        variant="text"
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            color: '#A3AED0',
                            fontWeight: 600
                        }}
                    >
                        Comparison
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#2B3674', fontWeight: 600 }}>
                            Show Zero Balance
                        </Typography>
                        <IconButton
                            onClick={() => setShowZeroBalances(!showZeroBalances)}
                            color={showZeroBalances ? "primary" : "default"}
                        >
                            {/* Simple toggle visual using icons usually, or Switch. Using FilterList for now as placeholder or actual Switch */}
                            <FilterListIcon />
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            borderLeft: '1px solid #E0E5F2',
                            height: '24px',
                            mx: 1
                        }}
                    />

                    {/* Date Picker Trigger - Simplified */}
                    <Button
                        startIcon={<CalendarTodayIcon />}
                        sx={{
                            color: '#2B3674',
                            fontWeight: 600,
                            textTransform: 'none',
                            backgroundColor: '#F4F7FE',
                            borderRadius: '10px',
                            py: 1,
                            px: 2
                        }}
                    >
                        {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                    </Button>
                </Box>
            </Box>

            {/* Main Tree Grid */}
            {data && (
                <TrialBalanceTreeGrid
                    data={data}
                    onAccountClick={(id, name) => console.log('Clicked', id, name)}
                />
            )}
        </Box>
    )
}
