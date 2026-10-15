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
    const [mounted, setMounted] = useState(false)
    const [formattedDates, setFormattedDates] = useState("")
    const [dateRange, setDateRange] = useState<DateRange>({
        startDate: startOfMonth(new Date()),
        endDate: new Date() // Current date
    })

    const [data, setData] = useState<TrialBalanceData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showZeroBalances, setShowZeroBalances] = useState(false)

    useEffect(() => {
        setMounted(true)
        // Format dates only on the client
        setFormattedDates(`${startOfMonth(new Date()).toLocaleDateString()} - ${new Date().toLocaleDateString()}`)
    }, [])

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const result = await trialBalanceService.generateTrialBalance(dateRange, {
                groupByCategory: true,
                includeZeroBalances: showZeroBalances
            })
            setData(result)

            // Update formatted dates if dateRange changes
            if (mounted) {
                setFormattedDates(`${dateRange.startDate.toLocaleDateString()} - ${dateRange.endDate.toLocaleDateString()}`)
            }
        } catch (error) {
            console.error("Failed to fetch trial balance:", error)
        } finally {
            setLoading(false)
        }
    }, [dateRange, showZeroBalances, mounted])

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

        const assets = data.categories.find(c => c.name === 'Assets')?.subtotal || 0
        const liabilities = data.categories.find(c => c.name === 'Liabilities')?.subtotal || 0

        // Final Fix for Sign Logic:
        // We want all KPI values to be shown as POSITIVE numbers (absolute values).
        const absAssets = Math.abs(assets)
        const absLiabilities = Math.abs(liabilities)

        return {
            totalAssets: absAssets,
            totalLiabilities: absLiabilities,
            // Net Position = |Assets| - |Liabilities|
            totalEquity: Math.abs(absAssets - absLiabilities),
            isBalanced: Math.abs(data.finalBalance) < 0.01
        }
    }

    return (
        <Box sx={{
            p: { xs: 1, md: 2 },
            maxWidth: '1600px',
            mx: 'auto'
        }}>
            {/* Top Toolbar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            color: '#FFFFFF',
                            fontWeight: 700,
                            mb: 0.5
                        }}
                    >
                        Trial Balance
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: '#A3AED0' }}
                    >
                        Financial Overview & Analysis • {formattedDates || "..."}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        startIcon={<FileDownloadIcon />}
                        variant="outlined"
                        sx={{
                            borderRadius: '12px',
                            color: '#FFFFFF',
                            borderColor: 'rgba(255, 255, 255, 0.1)',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                borderColor: 'rgba(255, 255, 255, 0.2)'
                            }
                        }}
                    >
                        Export
                    </Button>
                    <Button
                        startIcon={<AddIcon />}
                        variant="contained"
                        sx={{
                            borderRadius: '12px',
                            background: '#4318FF',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            boxShadow: '0px 4px 12px rgba(67, 24, 255, 0.4)',
                            '&:hover': {
                                background: '#3610E8'
                            }
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
                    backgroundColor: '#111C44',
                    p: 1.5,
                    borderRadius: '20px',
                    mb: 4,
                    boxShadow: '0px 18px 40px rgba(0, 0, 0, 0.2)'
                }}
            >
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="contained"
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            backgroundColor: '#4318FF',
                            fontWeight: 600,
                            px: 3
                        }}
                    >
                        Standard View
                    </Button>
                    <Button
                        variant="text"
                        sx={{
                            borderRadius: '12px',
                            textTransform: 'none',
                            color: '#A3AED0',
                            fontWeight: 600,
                            px: 3
                        }}
                    >
                        Comparison
                    </Button>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#FFFFFF', fontWeight: 600 }}>
                            Show Zero Balance
                        </Typography>
                        <IconButton
                            onClick={() => setShowZeroBalances(!showZeroBalances)}
                            sx={{ color: showZeroBalances ? '#4318FF' : '#A3AED0' }}
                        >
                            <FilterListIcon />
                        </IconButton>
                    </Box>

                    <Box
                        sx={{
                            borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
                            height: '24px',
                            mx: 2
                        }}
                    />

                    <Button
                        startIcon={<CalendarTodayIcon sx={{ fontSize: 18 }} />}
                        sx={{
                            color: '#FFFFFF',
                            fontWeight: 600,
                            textTransform: 'none',
                            backgroundColor: '#1B254B',
                            borderRadius: '12px',
                            py: 1.25,
                            px: 2.5,
                            '&:hover': {
                                backgroundColor: '#222E5E'
                            }
                        }}
                    >
                        {formattedDates || "..."}
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
