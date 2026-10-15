/**
 * Example usage of the TransactionList component
 * This file demonstrates how to integrate the TransactionList component
 * with the existing cashbook entry system.
 */

'use client';

import React, { useState } from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { TransactionList } from './TransactionList';
import { CreditTransactionModal } from './CreditTransactionModal';
import { DebitTransactionModal } from './DebitTransactionModal';
import { CategoryType } from '@/services/categoryService';

// Sample data types (these should match your actual data models)
interface CreditTransaction {
  id: string;
  date: Date;
  categoryName: string;
  particulars: string;
  amount: number;
  contactName?: string;
}

interface DebitTransaction {
  id: string;
  date: Date;
  categoryName: string;
  supplierName?: string;
  buyerName?: string;
  particulars: string;
  amount: number;
}

// Sample data
const sampleCreditTransactions: CreditTransaction[] = [
  {
    id: '1',
    date: new Date('2024-01-15'),
    categoryName: 'Sales Revenue',
    particulars: 'Product sales for January batch',
    amount: 15000,
    contactName: 'ABC Company'
  },
  {
    id: '2',
    date: new Date('2024-01-16'),
    categoryName: 'Loan A/C Chairman',
    particulars: 'Monthly loan from chairman',
    amount: 25000
  }
];

const sampleDebitTransactions: DebitTransaction[] = [
  {
    id: '3',
    date: new Date('2024-01-17'),
    categoryName: 'Fabric Purchase',
    supplierName: 'Textile Supplier Ltd',
    particulars: 'Cotton fabric for production',
    amount: 12000
  },
  {
    id: '4',
    date: new Date('2024-01-18'),
    categoryName: 'Salary A/C',
    particulars: 'Monthly salary payment',
    amount: 28000
  }
];

export const TransactionListExample: React.FC = () => {
  const [creditTransactions, setCreditTransactions] = useState<CreditTransaction[]>(sampleCreditTransactions);
  const [debitTransactions, setDebitTransactions] = useState<DebitTransaction[]>(sampleDebitTransactions);
  const [loading] = useState(false);
  const [error] = useState<string>();
  
  // Modal states
  const [creditModalOpen, setCreditModalOpen] = useState(false);
  const [debitModalOpen, setDebitModalOpen] = useState(false);
  const [editingCredit, setEditingCredit] = useState<CreditTransaction>();
  const [editingDebit, setEditingDebit] = useState<DebitTransaction>();

  // Sample categories and contacts (replace with your actual data)
  const categories = [
    { 
      id: '1', 
      name: 'Sales Revenue', 
      type: CategoryType.Credit, 
      typeName: 'Credit',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      usageCount: 5
    },
    { 
      id: '2', 
      name: 'Loan A/C Chairman', 
      type: CategoryType.Credit, 
      typeName: 'Credit',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      usageCount: 3
    },
    { 
      id: '3', 
      name: 'Fabric Purchase', 
      type: CategoryType.Debit, 
      typeName: 'Debit',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      usageCount: 8
    },
    { 
      id: '4', 
      name: 'Salary A/C', 
      type: CategoryType.Debit, 
      typeName: 'Debit',
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      usageCount: 12
    }
  ];

  const contacts = [
    { id: '1', name: 'ABC Company', contactType: 'Customer' as const },
    { id: '2', name: 'Textile Supplier Ltd', contactType: 'Supplier' as const }
  ];

  // Event handlers
  const handleEditCredit = (transaction: CreditTransaction) => {
    setEditingCredit(transaction);
    setCreditModalOpen(true);
  };

  const handleEditDebit = (transaction: DebitTransaction) => {
    setEditingDebit(transaction);
    setDebitModalOpen(true);
  };

  const handleDeleteCredit = (id: string) => {
    setCreditTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleDeleteDebit = (id: string) => {
    setDebitTransactions(prev => prev.filter(t => t.id !== id));
  };

  const handleSaveCredit = (transaction: CreditTransaction) => {
    if (editingCredit) {
      // Update existing transaction
      setCreditTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
    } else {
      // Add new transaction
      setCreditTransactions(prev => [...prev, transaction]);
    }
    setCreditModalOpen(false);
    setEditingCredit(undefined);
  };

  const handleSaveDebit = (transaction: DebitTransaction) => {
    if (editingDebit) {
      // Update existing transaction
      setDebitTransactions(prev => 
        prev.map(t => t.id === transaction.id ? transaction : t)
      );
    } else {
      // Add new transaction
      setDebitTransactions(prev => [...prev, transaction]);
    }
    setDebitModalOpen(false);
    setEditingDebit(undefined);
  };

  const handleCancelModal = () => {
    setCreditModalOpen(false);
    setDebitModalOpen(false);
    setEditingCredit(undefined);
    setEditingDebit(undefined);
  };

  // Calculate balance
  const totalCredits = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = debitTransactions.reduce((sum, t) => sum + t.amount, 0);
  const difference = Math.abs(totalCredits - totalDebits);
  const isBalanced = difference < 0.01;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Transaction List Example
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This example demonstrates the TransactionList component with modal-based transaction entry.
      </Typography>

      {/* Add Transaction Buttons */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Button
          variant="contained"
          color="success"
          onClick={() => setCreditModalOpen(true)}
        >
          Add Credit Transaction
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => setDebitModalOpen(true)}
        >
          Add Debit Transaction
        </Button>
      </Stack>

      {/* Balance Summary */}
      <Box sx={{ mb: 3, p: 2, bgcolor: isBalanced ? 'success.light' : 'warning.light', borderRadius: 1 }}>
        <Typography variant="h6">
          Balance Status: {isBalanced ? '✅ Balanced' : '⚠️ Not Balanced'}
        </Typography>
        <Typography variant="body2">
          Credits: ৳{totalCredits.toFixed(2)} | Debits: ৳{totalDebits.toFixed(2)} | 
          Difference: ৳{difference.toFixed(2)}
        </Typography>
      </Box>

      {/* Transaction List */}
      <TransactionList
        creditTransactions={creditTransactions}
        debitTransactions={debitTransactions}
        onEditCredit={handleEditCredit}
        onEditDebit={handleEditDebit}
        onDeleteCredit={handleDeleteCredit}
        onDeleteDebit={handleDeleteDebit}
        loading={loading}
        error={error}
      />

      {/* Credit Transaction Modal */}
      <CreditTransactionModal
        isOpen={creditModalOpen}
        transaction={editingCredit}
        categories={categories.filter(c => c.type === CategoryType.Credit)}
        contacts={contacts}
        onSave={handleSaveCredit}
        onCancel={handleCancelModal}
      />

      {/* Debit Transaction Modal */}
      <DebitTransactionModal
        isOpen={debitModalOpen}
        transaction={editingDebit}
        categories={categories.filter(c => c.type === CategoryType.Debit)}
        contacts={contacts}
        onSave={handleSaveDebit}
        onCancel={handleCancelModal}
      />
    </Box>
  );
};

export default TransactionListExample;