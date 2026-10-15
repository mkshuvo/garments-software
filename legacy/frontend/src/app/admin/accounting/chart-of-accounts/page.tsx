'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Skeleton,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  AccountBalance as AccountBalanceIcon,
  Visibility as ViewIcon,
  FilterList as FilterIcon
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

interface ChartOfAccountsResponse {
  data: ChartOfAccount[]
  totalCount: number
  page: number
  pageSize: number
  totalPages: number
}

export default function ChartOfAccountsListPage() {
  const router = useRouter()
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [search, setSearch] = useState('')
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountType | ''>('')
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<ChartOfAccount | null>(null)
  const [deleting, setDeleting] = useState(false)

  const pageSize = 20

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString()
      })

      if (search.trim()) {
        params.append('search', search.trim())
      }

      if (accountTypeFilter !== '') {
        params.append('accountType', accountTypeFilter.toString())
      }

      const response = await fetch(`/api/ChartOfAccounts?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch chart of accounts')
      }

      const data: ChartOfAccountsResponse = await response.json()
      setAccounts(data.data)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching accounts')
    } finally {
      setLoading(false)
    }
  }, [page, search, accountTypeFilter, pageSize])

  useEffect(() => {
    fetchAccounts()
  }, [page, search, accountTypeFilter, fetchAccounts])

  const handleSearch = () => {
    setPage(1)
    fetchAccounts()
  }

  const handleDelete = async () => {
    if (!accountToDelete) return

    try {
      setDeleting(true)
      const response = await fetch(`/api/ChartOfAccounts/${accountToDelete.id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete account')
      }

      setDeleteDialogOpen(false)
      setAccountToDelete(null)
      fetchAccounts()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting account')
    } finally {
      setDeleting(false)
    }
  }

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

  const getAccountTypeColor = (accountType: AccountType): 'primary' | 'error' | 'secondary' | 'success' | 'warning' | 'default' => {
    switch (accountType) {
      case AccountType.Asset: return 'primary'
      case AccountType.Liability: return 'error'
      case AccountType.Equity: return 'secondary'
      case AccountType.Revenue: return 'success'
      case AccountType.Expense: return 'warning'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Chart of Accounts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your accounting categories and account structure
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => router.push('/admin/accounting/chart-of-accounts/create')}
          sx={{ borderRadius: 2 }}
        >
          Add New Account
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Search accounts"
              variant="outlined"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Account Type</InputLabel>
              <Select
                value={accountTypeFilter}
                onChange={(e) => setAccountTypeFilter(e.target.value as AccountType | '')}
                label="Account Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value={AccountType.Asset}>Asset</MenuItem>
                <MenuItem value={AccountType.Liability}>Liability</MenuItem>
                <MenuItem value={AccountType.Equity}>Equity</MenuItem>
                <MenuItem value={AccountType.Revenue}>Revenue</MenuItem>
                <MenuItem value={AccountType.Expense}>Expense</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<FilterIcon />}
              onClick={handleSearch}
              sx={{ borderRadius: 2 }}
            >
              Apply Filters
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Loading...' : `Showing ${accounts.length} of ${totalCount} accounts`}
        </Typography>
        
        {totalPages > 1 && (
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
            size="small"
          />
        )}
      </Box>

      {/* Accounts Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Account Code</strong></TableCell>
                <TableCell><strong>Account Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                // Loading skeletons
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={200} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={150} /></TableCell>
                    <TableCell><Skeleton width={80} /></TableCell>
                    <TableCell><Skeleton width={100} /></TableCell>
                    <TableCell><Skeleton width={120} /></TableCell>
                  </TableRow>
                ))
              ) : accounts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <AccountBalanceIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No accounts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {search || accountTypeFilter !== '' 
                        ? 'Try adjusting your search criteria' 
                        : 'Start by creating your first account'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id} hover>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {account.accountCode}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {account.accountName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getAccountTypeLabel(account.accountType)}
                        color={getAccountTypeColor(account.accountType)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {account.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={account.isActive ? 'Active' : 'Inactive'}
                        color={account.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(account.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/admin/accounting/chart-of-accounts/${account.id}`)}
                          >
                            <ViewIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Edit Account">
                          <IconButton
                            size="small"
                            onClick={() => router.push(`/admin/accounting/chart-of-accounts/${account.id}/edit`)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        
                        <Tooltip title="Delete Account">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setAccountToDelete(account)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this account?
          </Typography>
          {accountToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2">
                {accountToDelete.accountCode} - {accountToDelete.accountName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {getAccountTypeLabel(accountToDelete.accountType)}
              </Typography>
            </Box>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. The account will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
