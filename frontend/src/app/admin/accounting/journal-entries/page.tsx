'use client'

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Stack,
  Breadcrumbs,
  Link,
  Alert,
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

import { useRouter } from 'next/navigation';
import ServiceStatusBanner from '@/components/ui/ServiceStatusBanner';
import { ExportModal } from '@/components/accounting/ExportModal';
import { SummarySection } from '@/components/accounting/SummarySection';
import { StatusFilter } from '@/components/accounting/StatusFilter';
import { PrintModal } from '@/components/accounting/PrintModal';
import { DateRangeFilter } from '@/components/accounting/DateRangeFilter';
import { TransactionTypeFilter } from '@/components/accounting/TransactionTypeFilter';
import { AmountRangeFilter } from '@/components/accounting/AmountRangeFilter';
import { CategoryFilter } from '@/components/accounting/CategoryFilter';
import { ReferenceFilter } from '@/components/accounting/ReferenceFilter';
import { ContactFilter } from '@/components/accounting/ContactFilter';
import { DescriptionFilter } from '@/components/accounting/DescriptionFilter';
import { SearchSection } from '@/components/accounting/SearchSection';
import { JournalEntriesTable } from '@/components/accounting/JournalEntriesTable';
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
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [popularSearches] = useState<string[]>([
    'Today',
    'This Week',
    'High Amount',
    'Pending',
    'Completed'
  ]);

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

  const updateSearchHistory = (searchTerm: string) => {
    if (searchTerm.trim()) {
      setSearchHistory(prev => {
        const filtered = prev.filter(term => term !== searchTerm);
        return [searchTerm, ...filtered].slice(0, 10);
      });
    }
  };

  const handleQuickFilter = (filter: string) => {
    const today = new Date();
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    switch (filter) {
      case 'Today':
        setFilters(prev => ({ ...prev, dateFrom: today, dateTo: today }));
        break;
      case 'This Week':
        setFilters(prev => ({ ...prev, dateFrom: thisWeek, dateTo: today }));
        break;
      case 'This Month':
        setFilters(prev => ({ ...prev, dateFrom: thisMonth, dateTo: today }));
        break;
      case 'High Amount':
        setFilters(prev => ({ ...prev, amountMin: 10000 }));
        break;
      case 'Low Amount':
        setFilters(prev => ({ ...prev, amountMax: 1000 }));
        break;
      case 'Pending':
        setFilters(prev => ({ ...prev, status: 'Pending' }));
        break;
      case 'Completed':
        setFilters(prev => ({ ...prev, status: 'Completed' }));
        break;
    }
    setPage(1);
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
    <>
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

        {/* Search Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              🔍 Search Journal Entries
            </Typography>
            <SearchSection
              value={filters.description || ''}
              onChange={(value) => {
                handleFilterChange('description', value);
                updateSearchHistory(value);
              }}
              onQuickFilter={handleQuickFilter}
              searchHistory={searchHistory}
              popularSearches={popularSearches}
            />
          </CardContent>
        </Card>

        {/* Filters */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                🔍 Advanced Filters
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
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <DateRangeFilter
                    dateFrom={filters.dateFrom}
                    dateTo={filters.dateTo}
                    onDateFromChange={(date) => handleFilterChange('dateFrom', date)}
                    onDateToChange={(date) => handleFilterChange('dateTo', date)}
                  />
                </Box>

                {/* Transaction Type */}
                <TransactionTypeFilter
                  value={filters.transactionType}
                  onChange={(value) => handleFilterChange('transactionType', value)}
                />

                {/* Category */}
                <CategoryFilter
                  value={filters.category}
                  categories={categories}
                  onChange={(value) => handleFilterChange('category', value)}
                />

                {/* Amount Range */}
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <AmountRangeFilter
                    amountMin={filters.amountMin}
                    amountMax={filters.amountMax}
                    onAmountMinChange={(value) => handleFilterChange('amountMin', value)}
                    onAmountMaxChange={(value) => handleFilterChange('amountMax', value)}
                  />
                </Box>

                {/* Reference Number */}
                <ReferenceFilter
                  value={filters.referenceNumber}
                  onChange={(value) => handleFilterChange('referenceNumber', value)}
                />

                {/* Contact Name */}
                <ContactFilter
                  value={filters.contactName}
                  onChange={(value) => handleFilterChange('contactName', value)}
                />

                {/* Description - Full Width */}
                <Box sx={{ gridColumn: { xs: '1', md: '1 / -1' } }}>
                  <DescriptionFilter
                    value={filters.description}
                    onChange={(value) => handleFilterChange('description', value)}
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
        <JournalEntriesTable
          entries={entries}
          loading={loading}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />

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
    </>
  );
}