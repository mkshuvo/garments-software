'use client'

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Download as DownloadIcon,
  SelectAll as SelectAllIcon,
  Clear as ClearIcon
} from '@mui/icons-material';

interface ExportColumn {
  key: string;
  label: string;
  description: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (selectedColumns: string[]) => Promise<void>;
  loading?: boolean;
}

const AVAILABLE_COLUMNS: ExportColumn[] = [
  { key: 'journalNumber', label: 'Journal Number', description: 'Unique journal entry identifier' },
  { key: 'transactionDate', label: 'Transaction Date', description: 'Date when transaction occurred' },
  { key: 'type', label: 'Transaction Type', description: 'Credit (Money In) or Debit (Money Out)' },
  { key: 'categoryName', label: 'Category', description: 'Transaction category name' },
  { key: 'particulars', label: 'Particulars', description: 'Transaction description/details' },
  { key: 'amount', label: 'Amount', description: 'Transaction amount in currency' },
  { key: 'referenceNumber', label: 'Reference Number', description: 'Transaction reference number' },
  { key: 'contactName', label: 'Contact Name', description: 'Customer/Supplier name' },
  { key: 'accountName', label: 'Account Name', description: 'Chart of account name' },
  { key: 'createdAt', label: 'Created At', description: 'When the entry was created in system' }
];

export function ExportModal({ isOpen, onClose, onExport, loading = false }: ExportModalProps) {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([
    'journalNumber',
    'transactionDate', 
    'type',
    'categoryName',
    'particulars',
    'amount',
    'referenceNumber',
    'contactName'
  ]);

  const handleColumnToggle = (columnKey: string) => {
    setSelectedColumns(prev => 
      prev.includes(columnKey)
        ? prev.filter(key => key !== columnKey)
        : [...prev, columnKey]
    );
  };

  const handleSelectAll = () => {
    setSelectedColumns(AVAILABLE_COLUMNS.map(col => col.key));
  };

  const handleClearAll = () => {
    setSelectedColumns([]);
  };

  const handleExport = async () => {
    if (selectedColumns.length === 0) {
      return;
    }
    await onExport(selectedColumns);
  };

  return (
    <Dialog 
      open={isOpen} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <DownloadIcon />
          Export Journal Entries to CSV
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Select the columns you want to include in your CSV export. The export will include all transactions that match your current filters.
        </Typography>

        {selectedColumns.length === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Please select at least one column to export.
          </Alert>
        )}

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<SelectAllIcon />}
            onClick={handleSelectAll}
          >
            Select All
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ClearIcon />}
            onClick={handleClearAll}
          >
            Clear All
          </Button>
          <Typography variant="body2" color="text.secondary" sx={{ ml: 'auto', alignSelf: 'center' }}>
            {selectedColumns.length} of {AVAILABLE_COLUMNS.length} columns selected
          </Typography>
        </Box>

        <FormGroup>
          {AVAILABLE_COLUMNS.map((column) => (
            <FormControlLabel
              key={column.key}
              control={
                <Checkbox
                  checked={selectedColumns.includes(column.key)}
                  onChange={() => handleColumnToggle(column.key)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight="medium">
                    {column.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {column.description}
                  </Typography>
                </Box>
              }
            />
          ))}
        </FormGroup>

        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2">
            💡 <strong>Tip:</strong> The exported CSV will respect all your current filters (date range, transaction type, amount range, etc.). 
            Only the transactions currently visible in your filtered results will be exported.
          </Typography>
        </Alert>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleExport}
          disabled={selectedColumns.length === 0 || loading}
          startIcon={loading ? <CircularProgress size={20} /> : <DownloadIcon />}
        >
          {loading ? 'Exporting...' : `Export ${selectedColumns.length} Columns`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}