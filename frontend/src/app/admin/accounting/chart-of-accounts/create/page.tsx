'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
  Divider
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Info as InfoIcon
} from '@mui/icons-material'

interface CreateAccountRequest {
  accountCode: string
  accountName: string
  accountType: AccountType
  description?: string
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

export default function CreateChartOfAccountPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [accountTypes, setAccountTypes] = useState<AccountTypeInfo[]>([])
  const [suggestedCode, setSuggestedCode] = useState('')

  const [formData, setFormData] = useState<CreateAccountRequest>({
    accountCode: '',
    accountName: '',
    accountType: AccountType.Expense,
    description: ''
  })

  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

  const fetchSuggestedCode = useCallback(async (accountType: AccountType) => {
    try {
      const response = await fetch(`/api/ChartOfAccounts/next-account-code?accountType=${accountType}`)
      if (response.ok) {
        const code = await response.text()
        setSuggestedCode(code.replace(/"/g, '')) // Remove quotes from response
        if (!formData.accountCode) {
          setFormData(prev => ({ ...prev, accountCode: code.replace(/"/g, '') }))
        }
      }
    } catch (err) {
      console.error('Error fetching suggested code:', err)
    }
  }, [formData.accountCode])

  useEffect(() => {
    fetchAccountTypes()
  }, [])

  useEffect(() => {
    if (formData.accountType !== undefined) {
      fetchSuggestedCode(formData.accountType)
    }
  }, [formData.accountType, fetchSuggestedCode])

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
      setLoading(true)

      const response = await fetch('/api/ChartOfAccounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to create account')
      }

      setSuccess('Account created successfully!')

      // Redirect after a short delay
      setTimeout(() => {
        router.push('/admin/accounting/chart-of-accounts')
      }, 1500)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creating account')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof CreateAccountRequest, value: string | AccountType) => {
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

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton onClick={() => router.back()} sx={{ mr: 1 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" fontWeight="bold">
            Create New Account
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
            Create Account
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

      {/* Create Form */}
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
                helperText={formErrors.accountCode || (suggestedCode ? `Suggested: ${suggestedCode}` : '')}
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

              {/* Action Buttons */}
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', pt: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<CancelIcon />}
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={loading}
                  sx={{ borderRadius: 2 }}
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </Button>
              </Box>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Help Information */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Account Numbering Guidelines
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>Assets (1000-1999):</strong> Cash, inventory, equipment, buildings
            </Typography>
            <Typography variant="body2">
              <strong>Liabilities (2000-2999):</strong> Loans, accounts payable, accrued expenses
            </Typography>
            <Typography variant="body2">
              <strong>Equity (3000-3999):</strong> Owner&apos;s equity, retained earnings
            </Typography>
            <Typography variant="body2">
              <strong>Revenue (4000-4999):</strong> Sales income, service fees, other income
            </Typography>
            <Typography variant="body2">
              <strong>Expenses (5000-5999):</strong> Cost of goods sold, operating expenses
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  )
}
