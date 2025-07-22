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
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
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
      toast.error('Failed to load balance data');
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
        toast.success('Balance cache refreshed successfully');
        await fetchBalanceData();
      } else {
        toast.error('Failed to refresh cache');
      }
    } catch (error) {
      console.error('Error refreshing cache:', error);
      toast.error('Failed to refresh cache');
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
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading balance data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Balance Overview</h1>
          <p className="text-muted-foreground">Real-time financial position and account balances</p>
        </div>
        <Button 
          onClick={refreshCache} 
          disabled={refreshing}
          variant="outline"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Cache
        </Button>
      </div>

      {/* Quick Balance Cards */}
      {dashboardBalance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bank Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(dashboardBalance.bankBalance)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last updated: {formatDateTime(dashboardBalance.lastUpdated)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash on Hand</CardTitle>
              <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(dashboardBalance.cashOnHand)}
              </div>
              <p className="text-xs text-muted-foreground">
                Physical cash available
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Liquid Assets</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {formatCurrency(dashboardBalance.totalLiquidAssets)}
              </div>
              <p className="text-xs text-muted-foreground">
                Bank + Cash combined
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Comprehensive Balance Summary */}
      {balanceSummary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Financial Position Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                Financial Position
                {balanceSummary.isFromCache && (
                  <Badge variant="secondary" className="ml-2">Cached</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Assets</p>
                  <p className="text-lg font-semibold text-blue-600">
                    {formatCurrency(balanceSummary.totalAssets)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Liabilities</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(balanceSummary.totalLiabilities)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Equity</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(balanceSummary.totalEquity)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Net Income</p>
                  <p className={`text-lg font-semibold ${balanceSummary.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(balanceSummary.netIncome)}
                  </p>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-lg font-semibold text-green-600">
                    {formatCurrency(balanceSummary.totalRevenue)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
                  <p className="text-lg font-semibold text-red-600">
                    {formatCurrency(balanceSummary.totalExpenses)}
                  </p>
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground">
                Last updated: {formatDateTime(balanceSummary.lastUpdated)}
              </p>
            </CardContent>
          </Card>

          {/* Key Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>Key Account Balances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {balanceSummary.keyAccounts
                  .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
                  .slice(0, 10)
                  .map((account) => (
                    <div key={account.accountId} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                      <div>
                        <p className="font-medium text-sm">{account.accountName}</p>
                        <p className="text-xs text-muted-foreground">{account.accountCode}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(account.balance)}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {account.accountType}
                        </Badge>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cache Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertCircle className="h-4 w-4 mr-2" />
            Cache Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm">
                Balance data is cached for improved performance. 
                {balanceSummary?.isFromCache ? ' Currently showing cached data.' : ' Currently showing fresh data.'}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Cache automatically refreshes every 5 minutes or when transactions are posted.
              </p>
            </div>
            <Badge variant={balanceSummary?.isFromCache ? "secondary" : "default"}>
              {balanceSummary?.isFromCache ? "Cached" : "Fresh"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}