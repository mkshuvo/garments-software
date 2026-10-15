'use client'

import React from 'react'
import { Box, Typography, Paper } from '@mui/material'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import ReceiptIcon from '@mui/icons-material/Receipt'
import PaymentsIcon from '@mui/icons-material/Payments'
import { StatCard, RecentTransactions, UpgradeBanner } from '@/components/dashboard'

// Sample data for the dashboard
const statsData = [
  {
    title: 'Profit & Loss',
    value: 100000,
    change: 30.02,
    subtitle: 'from this month',
    icon: <TrendingUpIcon />,
    iconBg: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
  },
  {
    title: 'Cash Flow',
    value: 502000,
    change: -1.25,
    subtitle: 'Decreases this month',
    icon: <AccountBalanceWalletIcon />,
    iconBg: 'linear-gradient(135deg, #05CD99 0%, #38D9AA 100%)',
  },
  {
    title: 'Sales',
    value: 220000,
    change: 1.53,
    subtitle: 'Increases this month',
    icon: <ReceiptIcon />,
    iconBg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    title: 'Payment',
    value: 15320,
    change: -0.11,
    subtitle: 'Decreases this month',
    icon: <PaymentsIcon />,
    iconBg: 'linear-gradient(135deg, #EE5D50 0%, #FF7B73 100%)',
  },
]

// Revenue chart data
const revenueData = [
  { month: 'JAN', revenue: 250, margin: 150 },
  { month: 'FEB', revenue: 180, margin: 100 },
  { month: 'MAR', revenue: 350, margin: 200 },
  { month: 'APR', revenue: 280, margin: 170 },
  { month: 'MAY', revenue: 420, margin: 350 },
  { month: 'JUN', revenue: 380, margin: 180 },
  { month: 'JUL', revenue: 180, margin: 150 },
  { month: 'AUG', revenue: 320, margin: 200 },
  { month: 'SEP', revenue: 280, margin: 380 },
  { month: 'OCT', revenue: 400, margin: 280 },
  { month: 'NOV', revenue: 350, margin: 220 },
  { month: 'DEC', revenue: 150, margin: 90 },
]

const maxRevenue = Math.max(...revenueData.map(d => Math.max(d.revenue, d.margin)))

// Expense breakdown
const expenseCategories = [
  { name: 'Email Marketing', value: 2.2, color: '#4318FF' },
  { name: 'Influencer', value: 4.6, color: '#7551FF' },
  { name: 'Google Ads', value: 116.0, color: '#05CD99' },
  { name: 'Social Media', value: 644.0, color: '#EE5D50' },
  { name: 'Back Links', value: 12.0, color: '#FFCE20' },
  { name: 'Ad Campaign', value: 85.2, color: '#2196f3' },
]

export default function AdminPage() {
  return (
    <Box>
      {/* Stats Row - CSS Grid */}
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
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </Box>

      {/* Charts Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
          mb: 3,
        }}
      >
        {/* Revenue vs Operating Margin Chart */}
        <Paper
          sx={{
            p: 3,
            borderRadius: '20px',
            boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2B3674' }}>
              Revenue Vs Operating Margin
            </Typography>
            <Typography variant="body2" sx={{ color: '#4318FF', fontWeight: 500, cursor: 'pointer' }}>
              This Year →
            </Typography>
          </Box>

          {/* Bar Chart */}
          <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1.5, height: 200, mt: 4 }}>
            {revenueData.map((data, index) => (
              <Box key={index} sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'flex-end', height: 160 }}>
                  <Box
                    sx={{
                      width: 16,
                      height: `${(data.revenue / maxRevenue) * 150}px`,
                      background: 'linear-gradient(180deg, #4318FF 0%, #7551FF 100%)',
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <Box
                    sx={{
                      width: 4,
                      height: `${(data.margin / maxRevenue) * 150}px`,
                      backgroundColor: '#05CD99',
                      borderRadius: '2px',
                    }}
                  />
                </Box>
                <Typography variant="caption" sx={{ color: '#A3AED0', fontSize: '0.625rem' }}>
                  {data.month}
                </Typography>
              </Box>
            ))}
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'flex', gap: 3, mt: 2, justifyContent: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: '#4318FF', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ color: '#A3AED0' }}>Revenue</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 12, height: 12, backgroundColor: '#05CD99', borderRadius: 1 }} />
              <Typography variant="caption" sx={{ color: '#A3AED0' }}>Operating Margin</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Marketing Expenses Donut */}
        <Paper
          sx={{
            p: 3,
            borderRadius: '20px',
            boxShadow: '0px 18px 40px rgba(112, 144, 176, 0.12)',
            height: '100%',
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, color: '#2B3674' }}>
              Marketing Expenses
            </Typography>
            <Typography variant="body2" sx={{ color: '#4318FF', fontWeight: 500, cursor: 'pointer' }}>
              Last Year →
            </Typography>
          </Box>

          {/* Donut */}
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <Box
              sx={{
                width: 160,
                height: 160,
                borderRadius: '50%',
                background: `conic-gradient(
                  #4318FF 0deg 60deg,
                  #7551FF 60deg 120deg,
                  #05CD99 120deg 180deg,
                  #EE5D50 180deg 270deg,
                  #FFCE20 270deg 300deg,
                  #2196f3 300deg 360deg
                )`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  borderRadius: '50%',
                  backgroundColor: 'white',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 700, color: '#2B3674' }}>
                  13.2 M
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Legend */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            {expenseCategories.map((cat, idx) => (
              <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: cat.color }} />
                <Typography variant="caption" sx={{ color: '#A3AED0' }}>
                  {cat.name}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Bottom Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          gap: 3,
        }}
      >
        <RecentTransactions />
        <UpgradeBanner />
      </Box>
    </Box>
  )
}
