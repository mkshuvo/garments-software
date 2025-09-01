'use client'

import React, { useState, useEffect, useCallback } from 'react';
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
  Chip,
  Stack,
  Breadcrumbs,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { SummarySection } from '@/components/accounting/SummarySection';
import { StatusFilter } from '@/components/accounting/StatusFilter';
import { PrintModal } from '@/components/accounting/PrintModal';
import { journalEntryService, type JournalEntry, type JournalEntryFilters, type SummaryInfo } from '@/services/journalEntryService';

// Using types from the service

export default function JournalEntriesPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const [summary, setSummary] = useState<SummaryInfo | null>(null);

  const [filters, setFilters] = useState<JournalEntryFilters>({
    transactionType: 'All',
    category: '',
    referenceNumber: '',
    contactName: '',
    description: '',
    status: 'All'
  });

  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Load journal entries
  const loadJournalEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await journalEntryService.getJournalEntries(filters, page, 20);
      
      setEntries(response.entries);
      setTotalPages(response.pagination.totalPages);
      setTotalEntries(response.pagination.totalEntries);
      setSummary(response.summary);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load journal entries');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  // Load categories for filter dropdown
  const loadCategories = async () => {
    try {
      const response = await fetch('/api/cashbookentry/categories');
      if (response.ok) {
        const data = await response.json();
        const categoryNames = data.map((cat: { name: string }) => cat.name);
        setCategories(categoryNames);
      }
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  useEffect(() => {
    loadJournalEntries();
  }, [loadJournalEntries]);

  useEffect(() => {
    loadCategories();
  }, []);

  const handleFilterChange = (field: keyof JournalEntryFilters, value: string | number | Date | undefined | null) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPage(1); // Reset to first page when filtering
  };

  const clearFilters = () => {
    setFilters({
      transactionType: 'All',
      category: '',
      referenceNumber: '',
      contactName: '',
      description: '',
      status: 'All'
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

      const exportRequest = {
        format: 'csv' as const,
        columns: selectedColumns,
        dateFrom: filters.dateFrom?.toISOString(),
        dateTo: filters.dateTo?.toISOString(),
        type: filters.transactionType !== 'All' ? filters.transactionType : undefined,
        amountMin: filters.amountMin,
        amountMax: filters.amountMax,
        category: filters.category || undefined,
        referenceNumber: filters.referenceNumber || undefined,
        contactName: filters.contactName || undefined,
        description: filters.description || undefined,
        status: filters.status !== 'All' ? filters.status : undefined
      };

      const response = await journalEntryService.exportJournalEntries(exportRequest);
      
      if (response.success && response.downloadUrl) {
        // Create a temporary link and trigger download
        const link = document.createElement('a');
        link.href = response.downloadUrl;
        link.download = response.fileName || `journal-entries-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error(response.message || 'Export failed');
      }

      setShowExportModal(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to export data. Please try again.');
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
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: 2 }}>
                {/* Date Range */}
                <DatePicker
                  label="Date From"
                  value={filters.dateFrom || null}
                  onChange={(date) => handleFilterChange('dateFrom', date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />
                <DatePicker
                  label="Date To"
                  value={filters.dateTo || null}
                  onChange={(date) => handleFilterChange('dateTo', date)}
                  slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                />

                {/* Transaction Type */}
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

                {/* Category */}
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

                {/* Amount Range */}
                <TextField
                  fullWidth
                  size="small"
                  label="Min Amount"
                  type="number"
                  value={filters.amountMin || ''}
                  onChange={(e) => handleFilterChange('amountMin', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Max Amount"
                  type="number"
                  value={filters.amountMax || ''}
                  onChange={(e) => handleFilterChange('amountMax', e.target.value ? parseFloat(e.target.value) : undefined)}
                />

                {/* Reference Number */}
                <TextField
                  fullWidth
                  size="small"
                  label="Reference Number"
                  value={filters.referenceNumber}
                  onChange={(e) => handleFilterChange('referenceNumber', e.target.value)}
                />

                {/* Contact Name */}
                <TextField
                  fullWidth
                  size="small"
                  label="Contact/Supplier"
                  value={filters.contactName}
                  onChange={(e) => handleFilterChange('contactName', e.target.value)}
                />

                {/* Description - Full Width */}
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
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
                </Box>

                {/* Status Filter */}
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <StatusFilter
                    value={filters.status || 'All'}
                    onChange={(status) => handleFilterChange('status', status)}
                  />
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Summary Section */}
        <SummarySection
          summary={summary}
          loading={loading}
          error={error}
        />

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
              <IconButton 
                size="small"
                onClick={() => setShowPrintModal(true)}
                disabled={loading || entries.length === 0}
              >
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
          activeFilters={filters}
          totalEntries={totalEntries}
        />

        {/* Print Modal */}
        <PrintModal
          isOpen={showPrintModal}
          onClose={() => setShowPrintModal(false)}
          entries={entries}
          filters={filters}
          totalEntries={totalEntries}
        />
      </Box>
    </LocalizationProvider>
  );
}