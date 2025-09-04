'use client'

import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { type JournalEntry, type JournalEntryFilters } from '@/services/journalEntryService';

// Lazy load the print modal component
const PrintModal = lazy(() => import('./PrintModal'));

interface LazyPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  filters: JournalEntryFilters;
  totalEntries: number;
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
      Loading print options...
    </Typography>
  </Box>
);

export function LazyPrintModal(props: LazyPrintModalProps) {
  if (!props.isOpen) {
    return null;
  }

  return (
    <Suspense fallback={<ModalLoadingFallback />}>
      <PrintModal {...props} />
    </Suspense>
  );
}

