'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Paper,
  Stack,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';
import { SavedTransaction } from '@/services/transactionService';

interface SavedTransactionsListProps {
  transactions: SavedTransaction[];
  loading?: boolean;
  error?: string;
  onRefresh?: () => void;
  showTotals?: boolean;
  maxHeight?: number;
}

type SortField = 'date' | 'amount' | 'categoryName' | 'type';
type SortOrder = 'asc' | 'desc';

export const SavedTransactionsList: React.FC<SavedTransactionsListProps> = ({
  transactions,
  loading = false,
  error,
  onRefresh,
  showTotals = true,
  maxHeight = 400
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Credit' | 'Debit'>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Filter and sort transactions
  const filteredAndSortedTransactions = React.useMemo(() => {
    const filtered = transactions.filter(transaction => {
      const matchesSearch = 
        transaction.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (transaction.contactName && transaction.contactName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (transaction.supplierName && transaction.supplierName.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesType = typeFilter === 'all' || transaction.type === typeFilter;
      
      return matchesSearch && matchesType;
    });

    // Sort transactions
    const sorted = [...filtered].sort((a, b) => {
      let aValue: string | number | Date, bValue: string | number | Date;
      
      switch (sortField) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'amount':
          aValue = a.amount;
          bValue = b.amount;
          break;
        case 'categoryName':
          aValue = a.categoryName.toLowerCase();
          bValue = b.categoryName.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        default:
          aValue = new Date(a.date);
          bValue = new Date(b.date);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sorted;
  }, [transactions, searchTerm, typeFilter, sortField, sortOrder]);

  // Calculate totals
  const totals = React.useMemo(() => {
    const totalCredits = filteredAndSortedTransactions
      .filter(t => t.type === 'Credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalDebits = filteredAndSortedTransactions
      .filter(t => t.type === 'Debit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const netAmount = totalCredits - totalDebits;
    
    return { totalCredits, totalDebits, netAmount };
  }, [filteredAndSortedTransactions]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setSortField('date');
    setSortOrder('desc');
  };

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error">
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            💾 Saved Transactions
          </Typography>
          <Stack direction="row" spacing={1}>
            {onRefresh && (
              <Tooltip title="Refresh">
                <IconButton 
                  onClick={onRefresh} 
                  disabled={loading}
                  size="small"
                >
                  {loading ? <CircularProgress size={20} /> : <RefreshIcon />}
                </IconButton>
              </Tooltip>
            )}
          </Stack>
        </Box>

        {/* Filters and Search */}
        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <TextField
            size="small"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
            }}
            sx={{ minWidth: 200 }}
          />
          
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Type</InputLabel>
            <Select
              value={typeFilter}
              label="Type"
              onChange={(e) => setTypeFilter(e.target.value as 'all' | 'Credit' | 'Debit')}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="Credit">Credit</MenuItem>
              <MenuItem value="Debit">Debit</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortField}
              label="Sort By"
              onChange={(e) => handleSort(e.target.value as SortField)}
            >
              <MenuItem value="date">Date</MenuItem>
              <MenuItem value="amount">Amount</MenuItem>
              <MenuItem value="categoryName">Category</MenuItem>
              <MenuItem value="type">Type</MenuItem>
            </Select>
          </FormControl>

          <Button
            size="small"
            variant="outlined"
            onClick={clearFilters}
            startIcon={<FilterIcon />}
          >
            Clear Filters
          </Button>
        </Stack>

        {/* Totals Display */}
        {showTotals && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'grey.50' }}>
            <Stack direction="row" spacing={3} justifyContent="space-between">
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Credits
                </Typography>
                <Typography variant="h6" color="success.main">
                  ৳{totals.totalCredits.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Debits
                </Typography>
                <Typography variant="h6" color="error.main">
                  ৳{totals.totalDebits.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Net Amount
                </Typography>
                <Typography 
                  variant="h6" 
                  color={totals.netAmount >= 0 ? 'success.main' : 'error.main'}
                >
                  ৳{totals.netAmount.toFixed(2)}
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography variant="h6">
                  {filteredAndSortedTransactions.length}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        )}

        {/* Transactions List */}
        <Box sx={{ maxHeight, overflowY: 'auto' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : filteredAndSortedTransactions.length === 0 ? (
            <Alert severity="info">
              <Typography variant="body2">
                {searchTerm || typeFilter !== 'all' 
                  ? 'No transactions match your filters. Try adjusting your search criteria.'
                  : 'No saved transactions yet. Add and save some transactions to see them here.'
                }
              </Typography>
            </Alert>
          ) : (
            filteredAndSortedTransactions.map((transaction) => (
              <Paper 
                key={transaction.id} 
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  backgroundColor: transaction.type === 'Credit' ? 'success.50' : 'error.50',
                  border: `1px solid ${transaction.type === 'Credit' ? 'success.200' : 'error.200'}`,
                  '&:hover': {
                    backgroundColor: transaction.type === 'Credit' ? 'success.100' : 'error.100',
                  }
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 1 }}>
                      <Chip 
                        label={transaction.type}
                        color={transaction.type === 'Credit' ? 'success' : 'error'}
                        size="small"
                      />
                      <Typography variant="body2" fontWeight="bold">
                        {transaction.categoryName}
                      </Typography>
                    </Stack>
                    
                    <Typography variant="body2" sx={{ mb: 1 }}>
                      {transaction.particulars}
                    </Typography>
                    
                    <Stack direction="row" spacing={2} flexWrap="wrap">
                      <Typography variant="caption" color="text.secondary">
                        📅 {new Date(transaction.date).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        🔗 Ref: {transaction.referenceNumber}
                      </Typography>
                      {transaction.contactName && (
                        <Typography variant="caption" color="text.secondary">
                          👤 {transaction.contactName}
                        </Typography>
                      )}
                      {transaction.supplierName && (
                        <Typography variant="caption" color="text.secondary">
                          🏢 {transaction.supplierName}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    color={transaction.type === 'Credit' ? 'success.main' : 'error.main'}
                    sx={{ fontWeight: 'bold' }}
                  >
                    ৳{transaction.amount.toFixed(2)}
                  </Typography>
                </Stack>
              </Paper>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
