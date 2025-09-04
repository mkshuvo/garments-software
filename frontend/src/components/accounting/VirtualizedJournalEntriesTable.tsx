'use client'

import React, { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { FixedSizeList as List } from 'react-window';
import { type JournalEntry } from '@/services/journalEntryService';

interface VirtualizedJournalEntriesTableProps {
  entries: JournalEntry[];
  loading: boolean;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onViewEntry?: (id: string) => void;
  onEditEntry?: (id: string) => void;
  onDeleteEntry?: (id: string) => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    entries: JournalEntry[];
    onViewEntry?: (id: string) => void;
    onEditEntry?: (id: string) => void;
    onDeleteEntry?: (id: string) => void;
  };
}

// Individual row component for virtualization
const JournalEntryRow: React.FC<RowProps> = ({ index, style, data }) => {
  const { entries, onViewEntry, onEditEntry, onDeleteEntry } = data;
  const entry = entries[index];

  if (!entry) {
    return (
      <div style={style}>
        <TableRow>
          <TableCell colSpan={10}>
            <Skeleton variant="text" width="100%" height={40} />
          </TableCell>
        </TableRow>
      </div>
    );
  }

  return (
    <div style={style}>
      <TableRow hover>
        <TableCell>
          <Typography variant="body2" fontWeight="medium">
            {entry.journalNumber}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {entry.formattedDate}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={entry.type}
            color={entry.type === 'Credit' ? 'success' : 'error'}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {entry.categoryName}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
            {entry.particulars}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <Typography variant="body2" fontWeight="medium">
            {entry.formattedAmount}
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
            color={entry.statusColor as any}
            size="small"
            variant="outlined"
          />
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            {onViewEntry && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={() => onViewEntry(entry.id)}
                >
                  <VisibilityIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onEditEntry && (
              <Tooltip title="Edit Entry">
                <IconButton
                  size="small"
                  onClick={() => onEditEntry(entry.id)}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onDeleteEntry && (
              <Tooltip title="Delete Entry">
                <IconButton
                  size="small"
                  onClick={() => onDeleteEntry(entry.id)}
                  color="error"
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </TableCell>
      </TableRow>
    </div>
  );
};

export function VirtualizedJournalEntriesTable({
  entries,
  loading,
  page,
  totalPages,
  onPageChange,
  onViewEntry,
  onEditEntry,
  onDeleteEntry
}: VirtualizedJournalEntriesTableProps) {
  // Use virtualization for large datasets (>100 entries)
  const shouldVirtualize = entries.length > 100;
  const itemHeight = 60; // Height of each row
  const maxHeight = 600; // Maximum height of the virtualized list

  const itemData = useMemo(() => ({
    entries,
    onViewEntry,
    onEditEntry,
    onDeleteEntry
  }), [entries, onViewEntry, onEditEntry, onDeleteEntry]);

  if (loading) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
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
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
          </Table>
        </TableContainer>
        <Box sx={{ p: 2 }}>
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Paper>
    );
  }

  if (entries.length === 0) {
    return (
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <Box sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No journal entries found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your filters or create a new entry
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <TableContainer>
        <Table stickyHeader>
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
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
        </Table>
      </TableContainer>

      {shouldVirtualize ? (
        <Box sx={{ height: Math.min(entries.length * itemHeight, maxHeight) }}>
          <List
            height={Math.min(entries.length * itemHeight, maxHeight)}
            itemCount={entries.length}
            itemSize={itemHeight}
            itemData={itemData}
            overscanCount={5} // Render 5 extra items for smooth scrolling
          >
            {JournalEntryRow}
          </List>
        </Box>
      ) : (
        <TableContainer>
          <Table>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {entry.journalNumber}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {entry.formattedDate}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={entry.type}
                      color={entry.type === 'Credit' ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {entry.categoryName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                      {entry.particulars}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      {entry.formattedAmount}
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
                      color={entry.statusColor as any}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {onViewEntry && (
                        <Tooltip title="View Details">
                          <IconButton
                            size="small"
                            onClick={() => onViewEntry(entry.id)}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onEditEntry && (
                        <Tooltip title="Edit Entry">
                          <IconButton
                            size="small"
                            onClick={() => onEditEntry(entry.id)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      {onDeleteEntry && (
                        <Tooltip title="Delete Entry">
                          <IconButton
                            size="small"
                            onClick={() => onDeleteEntry(entry.id)}
                            color="error"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TablePagination
        component="div"
        count={entries.length * totalPages} // This would be the total count from the API
        page={page - 1}
        onPageChange={(_, newPage) => onPageChange(newPage + 1)}
        rowsPerPage={20}
        onRowsPerPageChange={() => {}} // Handle rows per page change if needed
        rowsPerPageOptions={[10, 20, 50, 100]}
        labelRowsPerPage="Entries per page:"
        labelDisplayedRows={({ from, to, count }) => 
          `${from}-${to} of ${count !== -1 ? count : `more than ${to}`}`
        }
      />
    </Paper>
  );
}

