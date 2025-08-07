'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  CircularProgress,
  Pagination,
  IconButton,
  Tooltip
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
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useRouter } from 'next/navigation';
import ServiceStatusBanner from '@/components/ui/ServiceStatusBanner';
import { ExportModal } from '@/components/accounting/ExportModal';

interface JournalEntry {
  id: string;
  journalNumber: string;
  transactionDate: string;
  type: 'Credit' | 'Debit';
  categoryName: string;
  particulars: string;
  amount: number;
  referenceNumber: string;
  contactName?: string;
  accountName: string;
  createdAt: string;
}

interface JournalFilters {
  dateFrom?: Date;
  dateTo?: Date;
  transactionType: 'All' | 'Credit' | 'Debit';
  amountMin?: number;
  amountMax?: number;
  category: string;
  referenceNumber: string;
  contactName: string;
  description: string;
}

export default function JournalEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  
  const [filters, setFilters] = useState<JournalFilters>({
    transactionType: 'All',
    category: '',
    referenceNumber: '',
    contactName: '',
    description: ''
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Load journal entries
  const loadJournalEntries = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }
      if (filters.transactionType !== 'All') {
        params.append('type', filters.transactionType);
      }
      if (filters.amountMin !== undefined) {
        params.append('amountMin', filters.amountMin.toString());
      }
      if (filters.amountMax !== undefined) {
        params.append('amountMax', filters.amountMax.toString());
      }
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.referenceNumber) {
        params.append('referenceNumber', filters.referenceNumber);
      }
      if (filters.contactName) {
        params.append('contactName', filters.contactName);
      }
      if (filters.description) {
        params.append('description', filters.description);
      }

      const response = await fetch(`http://localhost:8080/api/cashbookentry/journal-entries?${params}`);
      if (!response.ok) {
        throw new Error('Failed to load journal entries');
      }

      const data = await response.json();
      setEntries(data.entries || []);
      setTotalPages(data.totalPages || 1);
      setTotalEntries(data.totalEntries || 0);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  };

  // Load categories for filter dropdown
  const loadCategories = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/cashbookentry/categories');
      if (response.ok) {
        const data = await response.json();
        const categoryNames = data.map((cat: any) => cat.name);
        setCategories(categoryNames);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadJournalEntries();
  }, [page, filters]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleFilterChange = (field: keyof JournalFilters, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      transactionType: 'All',
      category: '',
      referenceNumber: '',
      contactName: '',
      description: ''
    });
    setPage(1);
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleExport = async (selectedColumns: string[]) => {
    try {
      setExportLoading(true);
      
      // Build query parameters with current filters
      const params = new URLSearchParams();
      
      if (filters.dateFrom) {
        params.append('dateFrom', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append('dateTo', filters.dateTo.toISOString());
      }
      if (filters.transactionType !== 'All') {
        params.append('type', filters.transactionType);
      }
      if (filters.amountMin !== undefined) {
        params.append('amountMin', filters.amountMin.toString());
      }
      if (filters.amountMax !== undefined) {
        params.append('amountMax', filters.amountMax.toString());
      }
      if (filters.category) {
        params.append('category', filters.category);
      }
      if (filters.referenceNumber) {
        params.append('referenceNumber', filters.referenceNumber);
      }
      if (filters.contactName) {
        params.append('contactName', filters.contactName);
      }
      if (filters.description) {
        params.append('description', filters.description);
      }
      
      // Add selected columns
      params.append('columns', selectedColumns.join(','));

      // Create download link
      const url = `/api/cashbookentry/journal-entries/export?${params}`;
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExportModal(false);
    } catch (err) {
      setError('Failed to export data. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <ServiceStatusBanner
        showWhenHealthy={false}
        dismissible={true}
        showDetails={true}
        position="top"
      />

      <Box sx={{ p: 3, mt: 6 }}>
        {/* Navigation Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link
            color="inherit"
            href="/"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          <Link
            color="inherit"
            href="/admin/accounting"
            sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
          >
            <AccountBalanceIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Accounting
          </Link>
          <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
            <ReceiptIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Journal Entries
          </Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📋 Journal Entries
            </Typography>
            <Typography variant="body1" color="text.secondary">
              View and manage all your credit and debit transactions with advanced filtering
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={() => setShowExportModal(true)}
              disabled={loading || entries.length === 0}
              color="success"
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={() => loadJournalEntries()}
              disabled={loading}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => router.push('/admin/accounting')}
            >
              Back to Accounting
            </Button>
          </Stack>
        </Box>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                🔍 Filters & Search
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<FilterIcon />}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  {showFilters ? 'Hide Filters' : 'Show Filters'}
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={clearFilters}
                >
                  Clear All
                </Button>
              </Stack>
            </Box>

            {showFilters && (
              <Grid container spacing={2}>
                {/* Date Range */}
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Date From"
                    value={filters.dateFrom || null}
                    onChange={(date) => handleFilterChange('dateFrom', date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Date To"
                    value={filters.dateTo || null}
                    onChange={(date) => handleFilterChange('dateTo', date)}
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Grid>

                {/* Transaction Type */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Transaction Type</InputLabel>
                    <Select
                      value={filters.transactionType}
                      label="Transaction Type"
                      onChange={(e) => handleFilterChange('transactionType', e.target.value)}
                    >
                      <MenuItem value="All">All Types</MenuItem>
                      <MenuItem value="Credit">Credit (Money In)</MenuItem>
                      <MenuItem value="Debit">Debit (Money Out)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Category */}
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={filters.category}
                      label="Category"
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                    >
                      <MenuItem value="">All Categories</MenuItem>
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                {/* Amount Range */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Min Amount"
                    type="number"
                    value={filters.amountMin || ''}
                    onChange={(e) => handleFilterChange('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Max Amount"
                    type="number"
                    value={filters.amountMax || ''}
                    onChange={(e) => handleFilterChange('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </Grid>

                {/* Reference Number */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Reference Number"
                    value={filters.referenceNumber}
                    onChange={(e) => handleFilterChange('referenceNumber', e.target.value)}
                  />
                </Grid>

                {/* Contact Name */}
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Contact/Supplier"
                    value={filters.contactName}
                    onChange={(e) => handleFilterChange('contactName', e.target.value)}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Search in Description/Particulars"
                    value={filters.description}
                    onChange={(e) => handleFilterChange('description', e.target.value)}
                    InputProps={{
                      startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
              </Grid>
            )}
          </CardContent>
        </Card>

        {/* Results Summary */}
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            {loading ? 'Loading...' : `Showing ${entries.length} of ${totalEntries} entries`}
          </Typography>
          <Stack direction="row" spacing={1}>
            <Tooltip title="Export to CSV">
              <IconButton 
                size="small"
                onClick={() => setShowExportModal(true)}
                disabled={loading || entries.length === 0}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Print">
              <IconButton size="small">
                <PrintIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Error Display */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Journal Entries Table */}
        <Card>
          <TableContainer>
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
                  <TableCell>Account</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : entries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No journal entries found. Try adjusting your filters or add some transactions.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
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
                          color={entry.type === 'Credit' ? 'success' : 'error'}
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
                          fontWeight="medium"
                          color={entry.type === 'Credit' ? 'success.main' : 'error.main'}
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
                        <Typography variant="body2">
                          {entry.accountName}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
              />
            </Box>
          )}
        </Card>

        {/* Export Modal */}
        <ExportModal
          isOpen={showExportModal}
          onClose={() => setShowExportModal(false)}
          onExport={handleExport}
          loading={exportLoading}
        />
      </Box>
    </LocalizationProvider>
  );
}