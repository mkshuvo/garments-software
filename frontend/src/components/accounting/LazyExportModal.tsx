'use client'

import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { ExportModal } from './ExportModal';

interface LazyExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (selectedColumns: string[]) => Promise<void>;
  loading?: boolean;
  activeFilters?: {
    dateFrom?: Date;
    dateTo?: Date;
    transactionType?: string;
    amountMin?: number;
    amountMax?: number;
    category?: string;
    referenceNumber?: string;
    contactName?: string;
    description?: string;
  };
  totalEntries?: number;
}

// Loading fallback component
const ModalLoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: 200,
      gap: 2
    }}
  >
    <CircularProgress size={30} />
    <Typography variant="body2" color="text.secondary">
      Loading export options...
    </Typography>
  </Box>
);

export function LazyExportModal(props: LazyExportModalProps) {
  if (!props.isOpen) {
    return null;
  }

  // Show loading state if export is in progress
  if (props.loading) {
    return <ModalLoadingFallback />;
  }

  return <ExportModal {...props} />;
}

