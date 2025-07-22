'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Alert,
  Breadcrumbs,
  Link,
  IconButton,
  Chip,
  Divider,
  Skeleton
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material'

interface ChartOfAccount {
  id: string
  accountCode: string
  accountName: string
  accountType: AccountType
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

enum AccountType {
  Asset = 0,
  Liability = 1,
  Equity = 2,
  Revenue = 3,
  Expense = 4
}

export default function ViewChartOfAccountPage() {
  const router = useRouter()
  const params = useParams()
  const accountId = params.id as string

  const [account, setAccount] = useState<ChartOfAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchAccount = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/ChartOfAccounts/${accountId}`)
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Account not found')
        }
        throw new Error('Failed to fetch account details')
      }

      const data = await response.json()
      setAccount(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching account')
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    if (accountId) {
      fetchAccount()
    }
  }, [accountId, fetchAccount])

  const getAccountTypeLabel = (accountType: AccountType): string => {
    switch (accountType) {
      case AccountType.Asset: return 'Asset'
      case AccountType.Liability: return 'Liability'
      case AccountType.Equity: return 'Equity'
      case AccountType.Revenue: return 'Revenue'
      case AccountType.Expense: return 'Expense'
      default: return 'Unknown'
    }
  }

  const getAccountTypeColor = (accountType: AccountType) => {
    switch (accountType) {
      case AccountType.Asset: return 'primary'
      case AccountType.Liability: return 'error'
      case AccountType.Equity: return 'secondary'
      case AccountType.Revenue: return 'success'
      case AccountType.Expense: return 'warning'
      default: return 'default'
    }
  }

  const getAccountTypeDescription = (accountType: AccountType): string => {
    switch (accountType) {
      case AccountType.Asset: return 'Resources owned by the company'
      case AccountType.Liability: return 'Debts and obligations'
      case AccountType.Equity: return "Owner's equity and retained earnings"
      case AccountType.Revenue: return 'Income from sales and services'
      case AccountType.Expense: return 'Costs and expenses'
      default: return 'Other account type'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Skeleton variant="text" width={300} height={40} />
          <Skeleton variant="text" width={500} height={24} />
        </Box>
        <Card>
          <CardContent>
            <Stack spacing={3}>
              <Skeleton variant="rectangular" height={100} />
              <Skeleton variant="rectangular" height={200} />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/accounting/chart-of-accounts')}
        >
          Back to Chart of Accounts
        </Button>
      </Box>
    )
  }

  if (!account) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning" sx={{ mb: 3 }}>
          Account not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/accounting/chart-of-accounts')}
        >
          Back to Chart of Accounts
        </Button>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Account Details
          </Typography>
        </Box>

        <Breadcrumbs>
          <Link
            component="button"
            variant="body1"
            onClick={() => router.push('/admin/accounting')}
            sx={{ textDecoration: 'none' }}
          >
            Accounting
          </Link>
          <Link
            component="button"
            variant="body1"
            onClick={() => router.push('/admin/accounting/chart-of-accounts')}
            sx={{ textDecoration: 'none' }}
          >
            Chart of Accounts
          </Link>
          <Typography variant="body1" color="text.primary">
            {account.accountCode} - {account.accountName}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Account Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AccountBalanceIcon sx={{ fontSize: 40, color: 'primary.main' }} />
              <Box>
                <Typography variant="h5" fontWeight="bold">
                  {account.accountCode} - {account.accountName}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                  <Chip
                    label={getAccountTypeLabel(account.accountType)}
                    color={getAccountTypeColor(account.accountType) as 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'default'}
                    variant="outlined"
                  />
                  <Chip
                    label={account.isActive ? 'Active' : 'Inactive'}
                    color={account.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => router.push(`/admin/accounting/chart-of-accounts/${account.id}/edit`)}
              >
                Edit
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => {
                  // You can implement delete functionality here or navigate to a delete confirmation page
                  if (confirm('Are you sure you want to delete this account?')) {
                    // Implement delete logic
                  }
                }}
              >
                Delete
              </Button>
            </Stack>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Account Code
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>
                {account.accountCode}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Account Name
              </Typography>
              <Typography variant="body1" fontWeight="medium" sx={{ mb: 2 }}>
                {account.accountName}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Account Type
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={getAccountTypeLabel(account.accountType)}
                  color={getAccountTypeColor(account.accountType) as 'primary' | 'secondary' | 'error' | 'success' | 'warning' | 'default'}
                  variant="filled"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  {getAccountTypeDescription(account.accountType)}
                </Typography>
              </Box>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Status
              </Typography>
              <Chip
                label={account.isActive ? 'Active' : 'Inactive'}
                color={account.isActive ? 'success' : 'default'}
                variant="filled"
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Description
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {account.description || 'No description provided'}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Created Date
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {formatDate(account.createdAt)}
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Last Updated
              </Typography>
              <Typography variant="body1">
                {formatDate(account.updatedAt)}
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Account Usage Information */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Usage
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This section will show transaction history and account balance once integrated with the journal entries system.
          </Typography>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2">
              <strong>Current Balance:</strong> Coming soon
            </Typography>
            <Typography variant="body2">
              <strong>Total Transactions:</strong> Coming soon
            </Typography>
            <Typography variant="body2">
              <strong>Last Transaction:</strong> Coming soon
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  )
}
