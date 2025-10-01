'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  AlertTitle,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  IconButton,
  Tooltip,
  TextField,
  InputAdornment,
  Pagination,
  Snackbar
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Refresh as RefreshIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Error as ErrorIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { journalEntryService, type JournalEntry, type JournalEntryFilters } from '@/services/journalEntryService';

export default function JournalEntriesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [entriesPerPage] = useState(20);
  const [error, setError] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [summary, setSummary] = useState({
    totalCredits: 0,
    totalDebits: 0,
    balance: 0
  });

  // Load journal entries from real API
  const loadJournalEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: JournalEntryFilters = {
        dateFrom: undefined,
        dateTo: undefined,
        transactionType: (selectedType as 'Credit' | 'Debit' | 'All') || 'All',
        amountMin: undefined,
        amountMax: undefined,
        category: selectedCategory || undefined,
        referenceNumber: searchTerm || undefined,
        contactName: undefined,
        description: undefined,
        status: (selectedStatus as 'Approved' | 'Pending' | 'Rejected' | 'All') || 'All',
        sortBy: 'TransactionDate',
        sortOrder: 'desc'
      };

      const response = await journalEntryService.getJournalEntries(filters, currentPage, entriesPerPage);
      
      setEntries(response.entries);
      setFilteredEntries(response.entries);
      setTotalPages(response.pagination.totalPages);
      setSummary({
        totalCredits: response.summary.totalCredits,
        totalDebits: response.summary.totalDebits,
        balance: response.summary.balance
      });
      setApiAvailable(true);

    } catch (err) {
      console.error('Error loading journal entries:', err);
      setError('Failed to load journal entries. The backend API may not be available.');
      setApiAvailable(false);
      
      // Set empty state
      setEntries([]);
      setFilteredEntries([]);
      setTotalPages(1);
      setSummary({ totalCredits: 0, totalDebits: 0, balance: 0 });
    } finally {
      setLoading(false);
    }
  }, [currentPage, entriesPerPage, selectedCategory, selectedStatus, selectedType, searchTerm]);

  // Load data on component mount and when filters change
  useEffect(() => {
    loadJournalEntries();
  }, [loadJournalEntries]);

  // Handle search and filtering
  useEffect(() => {
    if (!apiAvailable) {
      // Client-side filtering when API is not available
      let filtered = entries;

      if (searchTerm) {
        filtered = filtered.filter(entry =>
          entry.journalNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.particulars.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.referenceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          entry.contactName?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      if (selectedCategory) {
        filtered = filtered.filter(entry => entry.categoryName === selectedCategory);
      }

      if (selectedStatus) {
        filtered = filtered.filter(entry => entry.status === selectedStatus);
      }

      if (selectedType) {
        filtered = filtered.filter(entry => entry.type === selectedType);
      }

      setFilteredEntries(filtered);
    }
  }, [entries, searchTerm, selectedCategory, selectedStatus, selectedType, apiAvailable]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Pending':
        return 'warning';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getTypeColor = (type: string) => {
    return type === 'Credit' ? 'success' : 'error';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleRefresh = () => {
    loadJournalEntries();
  };

  const handleExport = () => {
    if (!apiAvailable) {
      setError('Export functionality requires the backend API to be available.');
      return;
    }
    // TODO: Implement export functionality
    console.log('Export functionality to be implemented');
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
        <Typography variant="h6" sx={{ ml: 2 }}>
          Loading journal entries...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link
          color="inherit"
          href="/admin"
          onClick={(e) => {
            e.preventDefault();
            router.push('/admin');
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <HomeIcon fontSize="small" />
          Admin
        </Link>
        <Link
          color="inherit"
          href="/admin/accounting"
          onClick={(e) => {
            e.preventDefault();
            router.push('/admin/accounting');
          }}
          sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
        >
          <AccountBalanceIcon fontSize="small" />
          Accounting
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ReceiptIcon fontSize="small" />
          Journal Entries
        </Typography>
      </Breadcrumbs>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Journal Entries
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Export">
            <IconButton onClick={handleExport} disabled={!apiAvailable}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print">
            <IconButton onClick={handlePrint}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* API Status Alert */}
      {!apiAvailable && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Retry
            </Button>
          }
        >
          <AlertTitle>Backend API Unavailable</AlertTitle>
          The backend API is not responding. Some features may be limited. Click "Retry" to attempt reconnection.
        </Alert>
      )}

      {/* Summary Cards */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Credits
            </Typography>
            <Typography variant="h5" color="success.main">
              {formatCurrency(summary.totalCredits)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Total Debits
            </Typography>
            <Typography variant="h5" color="error.main">
              {formatCurrency(summary.totalDebits)}
            </Typography>
          </CardContent>
        </Card>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography color="text.secondary" gutterBottom>
              Balance
            </Typography>
            <Typography variant="h5" color={summary.balance >= 0 ? 'success.main' : 'error.main'}>
              {formatCurrency(summary.balance)}
            </Typography>
          </CardContent>
        </Card>
      </Stack>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Filters
          </Typography>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ minWidth: 200 }}
            />
            <TextField
              select
              label="Category"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 150 }}
            >
              <option value="">All Categories</option>
              <option value="Sales Revenue">Sales Revenue</option>
              <option value="Service Revenue">Service Revenue</option>
              <option value="Office Supplies">Office Supplies</option>
              <option value="Travel Expenses">Travel Expenses</option>
              <option value="Utilities">Utilities</option>
              <option value="Marketing">Marketing</option>
              <option value="Rent">Rent</option>
              <option value="Insurance">Insurance</option>
              <option value="Professional Services">Professional Services</option>
            </TextField>
            <TextField
              select
              label="Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 120 }}
            >
              <option value="">All Status</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </TextField>
            <TextField
              select
              label="Type"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              SelectProps={{ native: true }}
              sx={{ minWidth: 120 }}
            >
              <option value="">All Types</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
            </TextField>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            Showing {filteredEntries.length} entries
            {apiAvailable ? ' (from API)' : ' (cached)'}
          </Typography>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Journal #</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Particulars</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEntries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        {apiAvailable 
                          ? 'No journal entries found. Try adjusting your filters or add some transactions.'
                          : 'No data available. Backend API is not responding.'
                        }
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEntries.map((entry) => (
                    <TableRow key={entry.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {entry.journalNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(entry.transactionDate)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.type}
                          color={getTypeColor(entry.type) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.categoryName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200 }}>
                          {entry.particulars}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="body2"
                          color={entry.type === 'Credit' ? 'success.main' : 'error.main'}
                          fontWeight="bold"
                        >
                          {formatCurrency(entry.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.referenceNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {entry.contactName || '-'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={entry.status}
                          color={getStatusColor(entry.status) as any}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Error Snackbar */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        message={error}
      />
    </Box>
  );
}