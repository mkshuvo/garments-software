'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Autocomplete,
  Alert,
  IconButton,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface CashBookEntry {
  id: string;
  transactionDate: Date;
  referenceNumber: string;
  description: string;
  creditTransactions: CreditTransaction[];
  debitTransactions: DebitTransaction[];
}

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

interface Category {
  id: string;
  name: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
  accountCode: string;
}

interface Contact {
  id: string;
  name: string;
  contactType: 'Customer' | 'Supplier' | 'Both';
}

const SAMPLE_CATEGORIES: Category[] = [
  { id: '1', name: 'Loan A/C Chairman', accountType: 'Liability', accountCode: '2001' },
  { id: '2', name: 'Machine Purchase', accountType: 'Asset', accountCode: '1001' },
  { id: '3', name: 'Fabric Purchase', accountType: 'Expense', accountCode: '5001' },
  { id: '4', name: 'Salary A/C', accountType: 'Expense', accountCode: '6001' },
  { id: '5', name: 'Electric Bill', accountType: 'Expense', accountCode: '7001' },
  { id: '6', name: 'Received: Urbo ltd', accountType: 'Revenue', accountCode: '4001' },
  { id: '7', name: 'Received: Brooklyn BD', accountType: 'Revenue', accountCode: '4002' },
  { id: '8', name: 'Cash on Hand', accountType: 'Asset', accountCode: '1100' },
];

const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'Urbo ltd', contactType: 'Customer' },
  { id: '2', name: 'Brooklyn', contactType: 'Customer' },
  { id: '3', name: 'Fabric Supplier Ltd', contactType: 'Supplier' },
  { id: '4', name: 'Machine Parts Co', contactType: 'Supplier' },
];

export default function CashBookEntryPage() {
  const [entry, setEntry] = useState<CashBookEntry>({
    id: '',
    transactionDate: new Date(),
    referenceNumber: '',
    description: '',
    creditTransactions: [],
    debitTransactions: []
  });

  const [categories] = useState<Category[]>(SAMPLE_CATEGORIES);
  const [contacts] = useState<Contact[]>(SAMPLE_CONTACTS);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-generate reference number
  useEffect(() => {
    const today = new Date();
    const refNumber = `CB-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    setEntry(prev => ({ ...prev, referenceNumber: refNumber }));
  }, []);

  const addCreditTransaction = () => {
    const newTransaction: CreditTransaction = {
      id: Date.now().toString(),
      date: new Date(),
      categoryName: '',
      particulars: '',
      amount: 0
    };
    setEntry(prev => ({
      ...prev,
      creditTransactions: [...prev.creditTransactions, newTransaction]
    }));
  };

  const addDebitTransaction = () => {
    const newTransaction: DebitTransaction = {
      id: Date.now().toString(),
      date: new Date(),
      categoryName: '',
      particulars: '',
      amount: 0
    };
    setEntry(prev => ({
      ...prev,
      debitTransactions: [...prev.debitTransactions, newTransaction]
    }));
  };

  const updateCreditTransaction = (id: string, field: keyof CreditTransaction, value: string | number | Date) => {
    setEntry(prev => ({
      ...prev,
      creditTransactions: prev.creditTransactions.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const updateDebitTransaction = (id: string, field: keyof DebitTransaction, value: string | number | Date) => {
    setEntry(prev => ({
      ...prev,
      debitTransactions: prev.debitTransactions.map(t =>
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const removeCreditTransaction = (id: string) => {
    setEntry(prev => ({
      ...prev,
      creditTransactions: prev.creditTransactions.filter(t => t.id !== id)
    }));
  };

  const removeDebitTransaction = (id: string) => {
    setEntry(prev => ({
      ...prev,
      debitTransactions: prev.debitTransactions.filter(t => t.id !== id)
    }));
  };

  const calculateTotals = () => {
    const totalCredits = entry.creditTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalDebits = entry.debitTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
    return { totalCredits, totalDebits, difference: Math.abs(totalCredits - totalDebits) };
  };

  const validateEntry = (): string[] => {
    const errors: string[] = [];
    
    if (!entry.transactionDate) errors.push('Transaction date is required');
    if (!entry.referenceNumber.trim()) errors.push('Reference number is required');
    if (entry.creditTransactions.length === 0 && entry.debitTransactions.length === 0) {
      errors.push('At least one transaction is required');
    }

    // Validate credit transactions
    entry.creditTransactions.forEach((t, index) => {
      if (!t.categoryName.trim()) errors.push(`Credit transaction ${index + 1}: Category is required`);
      if (!t.particulars.trim()) errors.push(`Credit transaction ${index + 1}: Particulars is required`);
      if (t.amount <= 0) errors.push(`Credit transaction ${index + 1}: Amount must be greater than zero`);
    });

    // Validate debit transactions
    entry.debitTransactions.forEach((t, index) => {
      if (!t.categoryName.trim()) errors.push(`Debit transaction ${index + 1}: Category is required`);
      if (!t.particulars.trim()) errors.push(`Debit transaction ${index + 1}: Particulars is required`);
      if (t.amount <= 0) errors.push(`Debit transaction ${index + 1}: Amount must be greater than zero`);
    });

    return errors;
  };

  const handleSave = async () => {
    const validationErrors = validateEntry();
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors([]);
    
    try {
      // TODO: API call to save the cash book entry
      console.log('Saving cash book entry:', entry);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset form
      setEntry({
        id: '',
        transactionDate: new Date(),
        referenceNumber: '',
        description: '',
        creditTransactions: [],
        debitTransactions: []
      });
      
      // Generate new reference number
      const today = new Date();
      const refNumber = `CB-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
      setEntry(prev => ({ ...prev, referenceNumber: refNumber }));
      
    } catch {
      setErrors(['Failed to save cash book entry. Please try again.']);
    } finally {
      setLoading(false);
    }
  };

  const { totalCredits, totalDebits, difference } = calculateTotals();
  const isBalanced = difference < 0.01;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📚 Manual Cash Book Entry
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Enter accounting transactions manually in MM Fashion cash book format
        </Typography>

        {/* Header Information */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transaction Header
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Transaction Date"
                  value={entry.transactionDate}
                  onChange={(date) => setEntry(prev => ({ ...prev, transactionDate: date || new Date() }))}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Reference Number"
                  value={entry.referenceNumber}
                  onChange={(e) => setEntry(prev => ({ ...prev, referenceNumber: e.target.value }))}
                />
              </Box>
              <Box sx={{ flex: 2 }}>
                <TextField
                  fullWidth
                  label="Description (Optional)"
                  value={entry.description}
                  onChange={(e) => setEntry(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Overall transaction description"
                />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3}>
          {/* Credit Transactions (Money In) */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="success.main">
                    💰 Credit Transactions (Money In)
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addCreditTransaction}
                    size="small"
                  >
                    Add Credit
                  </Button>
                </Box>

                {entry.creditTransactions.map((transaction, index) => (
                  <Paper key={transaction.id} sx={{ p: 2, mb: 2, bgcolor: 'success.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2">Credit Transaction {index + 1}</Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeCreditTransaction(transaction.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <DatePicker
                          label="Date"
                          value={transaction.date}
                          onChange={(date) => updateCreditTransaction(transaction.id, 'date', date || new Date())}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          label="Amount (Tk.)"
                          type="number"
                          value={transaction.amount || ''}
                          onChange={(e) => updateCreditTransaction(transaction.id, 'amount', parseFloat(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                        />
                      </Stack>
                      <Autocomplete
                        freeSolo
                        options={categories.map(c => c.name)}
                        value={transaction.categoryName}
                        onChange={(_, value) => updateCreditTransaction(transaction.id, 'categoryName', value || '')}
                        onInputChange={(_, value) => updateCreditTransaction(transaction.id, 'categoryName', value || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Category"
                            placeholder="e.g., Loan A/C Chairman, Received: Customer Name"
                          />
                        )}
                      />
                      <TextField
                        size="small"
                        fullWidth
                        label="Particulars"
                        value={transaction.particulars}
                        onChange={(e) => updateCreditTransaction(transaction.id, 'particulars', e.target.value)}
                        placeholder="Transaction description"
                      />
                      <Autocomplete
                        freeSolo
                        options={contacts.map(c => c.name)}
                        value={transaction.contactName || ''}
                        onChange={(_, value) => updateCreditTransaction(transaction.id, 'contactName', value || '')}
                        onInputChange={(_, value) => updateCreditTransaction(transaction.id, 'contactName', value || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Contact (Optional)"
                            placeholder="Customer or supplier name"
                          />
                        )}
                      />
                    </Stack>
                  </Paper>
                ))}

                {entry.creditTransactions.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <AccountBalanceIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography>No credit transactions added</Typography>
                    <Typography variant="body2">Click &quot;Add Credit&quot; to start</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Debit Transactions (Money Out) */}
          <Box sx={{ flex: 1 }}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" color="error.main">
                    💸 Debit Transactions (Money Out)
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={addDebitTransaction}
                    size="small"
                  >
                    Add Debit
                  </Button>
                </Box>

                {entry.debitTransactions.map((transaction, index) => (
                  <Paper key={transaction.id} sx={{ p: 2, mb: 2, bgcolor: 'error.50' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle2">Debit Transaction {index + 1}</Typography>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => removeDebitTransaction(transaction.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                    
                    <Stack spacing={2}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <DatePicker
                          label="Date"
                          value={transaction.date}
                          onChange={(date) => updateDebitTransaction(transaction.id, 'date', date || new Date())}
                          slotProps={{ textField: { size: 'small', fullWidth: true } }}
                        />
                        <TextField
                          size="small"
                          fullWidth
                          label="Amount (Tk.)"
                          type="number"
                          value={transaction.amount || ''}
                          onChange={(e) => updateDebitTransaction(transaction.id, 'amount', parseFloat(e.target.value) || 0)}
                          InputProps={{ inputProps: { min: 0, step: 0.01 } }}
                        />
                      </Stack>
                      <Autocomplete
                        freeSolo
                        options={categories.map(c => c.name)}
                        value={transaction.categoryName}
                        onChange={(_, value) => updateDebitTransaction(transaction.id, 'categoryName', value || '')}
                        onInputChange={(_, value) => updateDebitTransaction(transaction.id, 'categoryName', value || '')}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            size="small"
                            label="Category"
                            placeholder="e.g., Fabric Purchase, Salary A/C, Electric Bill"
                          />
                        )}
                      />
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                        <Autocomplete
                          freeSolo
                          options={contacts.filter(c => c.contactType === 'Supplier' || c.contactType === 'Both').map(c => c.name)}
                          value={transaction.supplierName || ''}
                          onChange={(_, value) => updateDebitTransaction(transaction.id, 'supplierName', value || '')}
                          onInputChange={(_, value) => updateDebitTransaction(transaction.id, 'supplierName', value || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="Supplier (Optional)"
                              placeholder="Supplier name"
                            />
                          )}
                        />
                        <Autocomplete
                          freeSolo
                          options={contacts.filter(c => c.contactType === 'Customer' || c.contactType === 'Both').map(c => c.name)}
                          value={transaction.buyerName || ''}
                          onChange={(_, value) => updateDebitTransaction(transaction.id, 'buyerName', value || '')}
                          onInputChange={(_, value) => updateDebitTransaction(transaction.id, 'buyerName', value || '')}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              size="small"
                              label="Buyer (Optional)"
                              placeholder="Customer name"
                            />
                          )}
                        />
                      </Stack>
                      <TextField
                        size="small"
                        fullWidth
                        label="Particulars"
                        value={transaction.particulars}
                        onChange={(e) => updateDebitTransaction(transaction.id, 'particulars', e.target.value)}
                        placeholder="Transaction description"
                      />
                    </Stack>
                  </Paper>
                ))}

                {entry.debitTransactions.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>
                    <AccountBalanceIcon sx={{ fontSize: 48, mb: 1 }} />
                    <Typography>No debit transactions added</Typography>
                    <Typography variant="body2">Click &quot;Add Debit&quot; to start</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Stack>

        {/* Summary and Actions */}
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Transaction Summary
            </Typography>
            
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
              <Paper sx={{ p: 2, bgcolor: 'success.50', textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" color="success.main">
                  ৳{totalCredits.toFixed(2)}
                </Typography>
                <Typography variant="body2">Total Credits</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: 'error.50', textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" color="error.main">
                  ৳{totalDebits.toFixed(2)}
                </Typography>
                <Typography variant="body2">Total Debits</Typography>
              </Paper>
              <Paper sx={{ p: 2, bgcolor: difference < 0.01 ? 'success.50' : 'warning.50', textAlign: 'center', flex: 1 }}>
                <Typography variant="h6" color={isBalanced ? 'success.main' : 'warning.main'}>
                  ৳{difference.toFixed(2)}
                </Typography>
                <Typography variant="body2">Difference</Typography>
              </Paper>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
                <Chip 
                  label={isBalanced ? "Balanced" : "Not Balanced"} 
                  color={isBalanced ? "success" : "warning"}
                  variant={isBalanced ? "filled" : "outlined"}
                />
              </Box>
            </Stack>

            {/* Error Messages */}
            {errors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Please fix the following errors:</Typography>
                <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </Alert>
            )}

            {/* Balance Warning */}
            {!isBalanced && totalCredits > 0 && totalDebits > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Entry Not Balanced</Typography>
                <Typography variant="body2">
                  Total Credits (৳{totalCredits.toFixed(2)}) must equal Total Debits (৳{totalDebits.toFixed(2)}) for proper double-entry bookkeeping.
                </Typography>
              </Alert>
            )}

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={loading || !isBalanced || errors.length > 0}
                size="large"
              >
                {loading ? 'Saving...' : 'Save Cash Book Entry'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<CancelIcon />}
                onClick={() => window.location.reload()}
                disabled={loading}
                size="large"
              >
                Reset Form
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </LocalizationProvider>
  );
}
