'use client';

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Button,
  Chip,
  Divider,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Refresh as RefreshIcon,
  AccountBalance as DollarIcon,
  Wallet as WalletIcon,
  TrendingUp,
  TrendingDown,
  Warning as AlertIcon
} from '@mui/icons-material';

interface BalanceSummary {
  bankBalance: number;
  cashOnHand: number;
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  totalRevenue: number;
  totalExpenses: number;
  netIncome: number;
  lastUpdated: string;
  isFromCache: boolean;
  keyAccounts: AccountBalance[];
}

interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountType: string;
  balance: number;
  lastUpdated: string;
  isFromCache: boolean;
}

interface DashboardBalance {
  bankBalance: number;
  cashOnHand: number;
  totalLiquidAssets: number;
  currency: string;
  lastUpdated: string;
}

export default function BalancePage() {
  const [balanceSummary, setBalanceSummary] = useState<BalanceSummary | null>(null);
  const [dashboardBalance, setDashboardBalance] = useState<DashboardBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard balance (quick overview)
      const dashboardResponse = await fetch('/api/balance/dashboard', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setDashboardBalance(dashboardData);
      }

      // Fetch comprehensive balance summary
      const summaryResponse = await fetch('/api/balance/summary', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (summaryResponse.ok) {
        const summaryData = await summaryResponse.json();
        setBalanceSummary(summaryData);
      }
    } catch (error) {
      console.error('Error fetching balance data:', error);
      // TODO: Add proper error handling with Material-UI Snackbar
    } finally {
      setLoading(false);
    }
  };

  const refreshCache = async () => {
    try {
      setRefreshing(true);
      const response = await fetch('/api/balance/refresh-cache', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      
      if (response.ok) {
        // TODO: Add success notification with Material-UI Snackbar
        await fetchBalanceData();
      } else {
        // TODO: Add error notification with Material-UI Snackbar
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
      // TODO: Add error notification with Material-UI Snackbar
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalanceData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchBalanceData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-BD');
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CircularProgress />
          <Typography>Loading balance data...</Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Balance Overview
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time financial position and account balances
          </Typography>
        </Box>
        <Button 
          onClick={refreshCache} 
          disabled={refreshing}
          variant="outlined"
          startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
        >
          Refresh Cache
        </Button>
      </Box>

      {/* Quick Balance Cards */}
      {dashboardBalance && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Bank Balance
                  </Typography>
                  <DollarIcon color="action" />
                </Box>
              </CardHeader>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="primary.main">
                  {formatCurrency(dashboardBalance.bankBalance)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last updated: {formatDateTime(dashboardBalance.lastUpdated)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Cash on Hand
                  </Typography>
                  <WalletIcon color="action" />
                </Box>
              </CardHeader>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="success.main">
                  {formatCurrency(dashboardBalance.cashOnHand)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Physical cash available
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid component="div" size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Liquid Assets
                  </Typography>
                  <TrendingUp color="action" />
                </Box>
              </CardHeader>
              <CardContent>
                <Typography variant="h4" fontWeight="bold" color="secondary.main">
                  {formatCurrency(dashboardBalance.totalLiquidAssets)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Bank + Cash combined
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Comprehensive Balance Summary */}
      {balanceSummary && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {/* Financial Position Summary */}
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardHeader>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">Financial Position</Typography>
                  {balanceSummary.isFromCache && (
                    <Chip label="Cached" size="small" variant="outlined" />
                  )}
                </Box>
              </CardHeader>
              <CardContent>
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Total Assets</Typography>
                    <Typography variant="h6" color="primary.main" fontWeight="bold">
                      {formatCurrency(balanceSummary.totalAssets)}
                    </Typography>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Total Liabilities</Typography>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      {formatCurrency(balanceSummary.totalLiabilities)}
                    </Typography>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Total Equity</Typography>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {formatCurrency(balanceSummary.totalEquity)}
                    </Typography>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Net Income</Typography>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      color={balanceSummary.netIncome >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(balanceSummary.netIncome)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Divider sx={{ my: 2 }} />
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Total Revenue</Typography>
                    <Typography variant="h6" color="success.main" fontWeight="bold">
                      {formatCurrency(balanceSummary.totalRevenue)}
                    </Typography>
                  </Grid>
                  <Grid component="div" size={{ xs: 6 }}>
                    <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                    <Typography variant="h6" color="error.main" fontWeight="bold">
                      {formatCurrency(balanceSummary.totalExpenses)}
                    </Typography>
                  </Grid>
                </Grid>
                
                <Typography variant="caption" color="text.secondary">
                  Last updated: {formatDateTime(balanceSummary.lastUpdated)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Key Accounts */}
          <Grid component="div" size={{ xs: 12, lg: 6 }}>
            <Card>
              <CardHeader>
                <Typography variant="h6">Key Account Balances</Typography>
              </CardHeader>
              <CardContent>
                <Box sx={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {balanceSummary.keyAccounts
                    .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
                    .slice(0, 10)
                    .map((account) => (
                      <Box 
                        key={account.accountId} 
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          p: 2, 
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: 'grey.50'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {account.accountName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {account.accountCode}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: 'right' }}>
                          <Typography 
                            variant="body2" 
                            fontWeight="bold"
                            color={account.balance >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(account.balance)}
                          </Typography>
                          <Chip 
                            label={account.accountType} 
                            size="small" 
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Cache Status */}
      <Card>
        <CardHeader>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AlertIcon />
            <Typography variant="h6">Cache Status</Typography>
          </Box>
        </CardHeader>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="body2">
                Balance data is cached for improved performance. 
                {balanceSummary?.isFromCache ? ' Currently showing cached data.' : ' Currently showing fresh data.'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                Cache automatically refreshes every 5 minutes or when transactions are posted.
              </Typography>
            </Box>
            <Chip 
              label={balanceSummary?.isFromCache ? "Cached" : "Fresh"}
              variant={balanceSummary?.isFromCache ? "outlined" : "filled"}
              color={balanceSummary?.isFromCache ? "default" : "primary"}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}