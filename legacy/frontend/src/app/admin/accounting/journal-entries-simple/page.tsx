'use client'

import React, { useState, useEffect } from 'react';
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
  Alert
} from '@mui/material';

// Simple mock data
const mockJournalEntries = [
  {
    id: '1',
    journalNumber: 'JE-001',
    transactionDate: '2024-01-15',
    type: 'Credit',
    categoryName: 'Sales Revenue',
    particulars: 'Product sales for Q1',
    amount: 15000.00,
    referenceNumber: 'INV-001',
    contactName: 'ABC Company',
    accountName: 'Cash Account',
    status: 'Approved'
  },
  {
    id: '2',
    journalNumber: 'JE-002',
    transactionDate: '2024-01-16',
    type: 'Debit',
    categoryName: 'Office Supplies',
    particulars: 'Purchase of office supplies',
    amount: 500.00,
    referenceNumber: 'PO-002',
    contactName: 'Office Depot',
    accountName: 'Expense Account',
    status: 'Pending'
  },
  {
    id: '3',
    journalNumber: 'JE-003',
    transactionDate: '2024-01-17',
    type: 'Debit',
    categoryName: 'Travel Expenses',
    particulars: 'Business trip expenses',
    amount: 1200.00,
    referenceNumber: 'TR-003',
    contactName: 'Travel Agency',
    accountName: 'Expense Account',
    status: 'Approved'
  }
];

export default function SimpleJournalEntriesPage() {
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState(mockJournalEntries);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Journal Entries
      </Typography>
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This is a simplified version of the journal entries page with mock data.
      </Alert>

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
                  <TableCell>Amount</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {entries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>{entry.journalNumber}</TableCell>
                    <TableCell>{entry.transactionDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.type} 
                        color={getTypeColor(entry.type) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{entry.categoryName}</TableCell>
                    <TableCell>{entry.particulars}</TableCell>
                    <TableCell>
                      <Typography 
                        color={entry.type === 'Credit' ? 'success.main' : 'error.main'}
                        fontWeight="bold"
                      >
                        ${entry.amount.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{entry.referenceNumber}</TableCell>
                    <TableCell>{entry.contactName}</TableCell>
                    <TableCell>
                      <Chip 
                        label={entry.status} 
                        color={getStatusColor(entry.status) as any}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
