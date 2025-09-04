'use client'

import React, { lazy, Suspense } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { type JournalEntry } from '@/services/journalEntryService';

// Lazy load the heavy table component
const JournalEntriesTable = lazy(() => import('./JournalEntriesTable'));

interface LazyJournalEntriesTableProps {
  entries: JournalEntry[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Loading fallback component
const TableLoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      minHeight: 400,
      gap: 2
    }}
  >
    <CircularProgress size={40} />
    <Typography variant="body2" color="text.secondary">
      Loading journal entries table...
    </Typography>
  </Box>
);

export function LazyJournalEntriesTable(props: LazyJournalEntriesTableProps) {
  return (
    <Suspense fallback={<TableLoadingFallback />}>
      <JournalEntriesTable {...props} />
    </Suspense>
  );
}

