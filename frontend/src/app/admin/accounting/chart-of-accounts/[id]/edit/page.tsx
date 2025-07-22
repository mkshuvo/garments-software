'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Alert,
  Paper,
  Breadcrumbs,
  Link,
  IconButton,
  Divider,
  Switch,
  FormControlLabel,
  Skeleton
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material'

interface UpdateAccountRequest {
  accountCode: string
  accountName: string
  accountType: AccountType
  description?: string
  isActive: boolean
}

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

interface AccountTypeInfo {
  value: AccountType
  name: string
  description: string
}

export default function EditChartOfAccountPage() {
  const router = useRouter()
  const params = useParams()
  const accountId = params.id as string

  const [account, setAccount] = useState<ChartOfAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [accountTypes, setAccountTypes] = useState<AccountTypeInfo[]>([])

  const [formData, setFormData] = useState<UpdateAccountRequest>({
    accountCode: '',
    accountName: '',
    accountType: AccountType.Expense,
    description: '',
    isActive: true
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

      const data: ChartOfAccount = await response.json()
      setAccount(data)
      setFormData({
        accountCode: data.accountCode,
        accountName: data.accountName,
        accountType: data.accountType,
        description: data.description || '',
        isActive: data.isActive
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching account')
    } finally {
      setLoading(false)
    }
  }, [accountId])

  useEffect(() => {
    if (accountId) {
      fetchAccount()
      fetchAccountTypes()
    }
  }, [accountId, fetchAccount])

  const fetchAccountTypes = async () => {
    try {
      const response = await fetch('/api/ChartOfAccounts/account-types')
      if (response.ok) {
        const types = await response.json()
        setAccountTypes(types)
      }
    } catch (err) {
      console.error('Error fetching account types:', err)
    }
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!formData.accountCode.trim()) {
      errors.accountCode = 'Account code is required'
    } else if (formData.accountCode.length > 20) {
      errors.accountCode = 'Account code must be 20 characters or less'
    }

    if (!formData.accountName.trim()) {
      errors.accountName = 'Account name is required'
    } else if (formData.accountName.length > 100) {
      errors.accountName = 'Account name must be 100 characters or less'
    }

    if (formData.description && formData.description.length > 500) {
      errors.description = 'Description must be 500 characters or less'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateForm()) {
      return
    }

    try {
      setSaving(true)

      const response = await fetch(`/api/ChartOfAccounts/${accountId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update account')
      }

      const updatedAccount = await response.json()
      setAccount(updatedAccount)
      setSuccess('Account updated successfully!')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating account')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof UpdateAccountRequest, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const getAccountTypeDescription = (accountType: AccountType): string => {
    const type = accountTypes.find(t => t.value === accountType)
    return type?.description || ''
  }

  const getAccountTypePrefix = (accountType: AccountType): string => {
    switch (accountType) {
      case AccountType.Asset: return '10xx'
      case AccountType.Liability: return '20xx'
      case AccountType.Equity: return '30xx'
      case AccountType.Revenue: return '40xx'
      case AccountType.Expense: return '50xx'
      default: return '90xx'
    }
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
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={60} />
              <Skeleton variant="rectangular" height={100} />
            </Stack>
          </CardContent>
        </Card>
      </Box>
    )
  }

  if (error && !account) {
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Edit Account
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
          <Link
            component="button"
            variant="body1"
            onClick={() => router.push(`/admin/accounting/chart-of-accounts/${accountId}`)}
            sx={{ textDecoration: 'none' }}
          >
            {account?.accountCode} - {account?.accountName}
          </Link>
          <Typography variant="body1" color="text.primary">
            Edit
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Success/Error Messages */}
      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Edit Form */}
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              {/* Account Type Selection */}
              <FormControl fullWidth error={!!formErrors.accountType}>
                <InputLabel>Account Type *</InputLabel>
                <Select
                  value={formData.accountType}
                  onChange={(e) => handleInputChange('accountType', e.target.value)}
                  label="Account Type *"
                >
                  {accountTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      <Box>
                        <Typography variant="body1">{type.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          Code Range: {getAccountTypePrefix(type.value)} - {type.description}
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Account Type Info */}
              {formData.accountType !== undefined && (
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'info.contrastText' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <InfoIcon fontSize="small" />
                    <Typography variant="subtitle2">
                      {getAccountTypeDescription(formData.accountType)}
                    </Typography>
                  </Box>
                </Paper>
              )}

              <Divider />

              {/* Account Code */}
              <TextField
                label="Account Code *"
                value={formData.accountCode}
                onChange={(e) => handleInputChange('accountCode', e.target.value)}
                error={!!formErrors.accountCode}
                helperText={formErrors.accountCode}
                fullWidth
                placeholder="e.g., 5001"
              />

              {/* Account Name */}
              <TextField
                label="Account Name *"
                value={formData.accountName}
                onChange={(e) => handleInputChange('accountName', e.target.value)}
                error={!!formErrors.accountName}
                helperText={formErrors.accountName}
                fullWidth
                placeholder="e.g., Fabric Purchase"
              />

              {/* Description */}
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={!!formErrors.description}
                helperText={formErrors.description || 'Optional description for this account'}
                fullWidth
                multiline
                rows={3}
                placeholder="Enter a detailed description of this account..."
              />

              {/* Active Status */}
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  />
                }
                label="Account is active"
              />

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => router.back()}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={saving}
                  sx={{ borderRadius: 2 }}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Account History */}
      {account && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Created: {new Date(account.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date(account.updatedAt).toLocaleString()}
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  )
}
