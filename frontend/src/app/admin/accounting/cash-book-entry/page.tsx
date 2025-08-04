'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Paper,
  Chip,
  Stack,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon,
  AccountBalance as AccountBalanceIcon,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  AccountBalanceWallet as AccountBalanceWalletIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { categoryService, CategoryType, Category as CategoryModel } from '@/services/categoryService';
import { TransactionList } from '@/components/accounting/TransactionList';
import { AddTransactionButtons } from '@/components/accounting/AddTransactionButtons';
import { CreditTransactionModal } from '@/components/accounting/CreditTransactionModal';
import { DebitTransactionModal } from '@/components/accounting/DebitTransactionModal';

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


interface Contact {
  id: string;
  name: string;
  contactType: 'Customer' | 'Supplier' | 'Both';
}



const SAMPLE_CONTACTS: Contact[] = [
  { id: '1', name: 'Urbo ltd', contactType: 'Customer' },
  { id: '2', name: 'Brooklyn', contactType: 'Customer' },
  { id: '3', name: 'Fabric Supplier Ltd', contactType: 'Supplier' },
  { id: '4', name: 'Machine Parts Co', contactType: 'Supplier' },
];

export default function CashBookEntryPage() {
  const router = useRouter();
  const [entry, setEntry] = useState<CashBookEntry>({
    id: '',
    transactionDate: new Date(),
    referenceNumber: '',
    description: '',
    creditTransactions: [],
    debitTransactions: []
  });


  const [creditCategories, setCreditCategories] = useState<CategoryModel[]>([]);
  const [debitCategories, setDebitCategories] = useState<CategoryModel[]>([]);
  const [contacts] = useState<Contact[]>(SAMPLE_CONTACTS);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  // Modal state management
  const [modals, setModals] = useState({
    creditModal: {
      isOpen: false,
      editingTransaction: undefined as CreditTransaction | undefined
    },
    debitModal: {
      isOpen: false,
      editingTransaction: undefined as DebitTransaction | undefined
    }
  });

  // Auto-generate reference number
  useEffect(() => {
    const today = new Date();
    const refNumber = `CB-${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}-${Date.now().toString().slice(-4)}`;
    setEntry(prev => ({ ...prev, referenceNumber: refNumber }));
  }, []);

  // Load categories from API
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setCategoriesLoading(true);
        const categories = await categoryService.getAll();
        
        // Separate categories by type
        const credits = categories.filter(c => c.type === CategoryType.Credit && c.isActive);
        const debits = categories.filter(c => c.type === CategoryType.Debit && c.isActive);
        
        setCreditCategories(credits);
        setDebitCategories(debits);
      } catch (error) {
        console.error('Failed to load categories:', error);
        setErrors(prev => [...prev, 'Failed to load categories. Please refresh the page.']);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);



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

  // Modal management functions
  const openCreditModal = (transaction?: CreditTransaction) => {
    setModals(prev => ({
      ...prev,
      creditModal: {
        isOpen: true,
        editingTransaction: transaction
      }
    }));
  };

  const closeCreditModal = () => {
    setModals(prev => ({
      ...prev,
      creditModal: {
        isOpen: false,
        editingTransaction: undefined
      }
    }));
  };

  const openDebitModal = (transaction?: DebitTransaction) => {
    setModals(prev => ({
      ...prev,
      debitModal: {
        isOpen: true,
        editingTransaction: transaction
      }
    }));
  };

  const closeDebitModal = () => {
    setModals(prev => ({
      ...prev,
      debitModal: {
        isOpen: false,
        editingTransaction: undefined
      }
    }));
  };

  const handleSaveCreditTransaction = (transaction: CreditTransaction) => {
    if (modals.creditModal.editingTransaction) {
      // Update existing transaction
      setEntry(prev => ({
        ...prev,
        creditTransactions: prev.creditTransactions.map(t =>
          t.id === transaction.id ? transaction : t
        )
      }));
    } else {
      // Add new transaction
      const newTransaction = {
        ...transaction,
        id: Date.now().toString()
      };
      setEntry(prev => ({
        ...prev,
        creditTransactions: [...prev.creditTransactions, newTransaction]
      }));
    }
    closeCreditModal();
  };

  const handleSaveDebitTransaction = (transaction: DebitTransaction) => {
    if (modals.debitModal.editingTransaction) {
      // Update existing transaction
      setEntry(prev => ({
        ...prev,
        debitTransactions: prev.debitTransactions.map(t =>
          t.id === transaction.id ? transaction : t
        )
      }));
    } else {
      // Add new transaction
      const newTransaction = {
        ...transaction,
        id: Date.now().toString()
      };
      setEntry(prev => ({
        ...prev,
        debitTransactions: [...prev.debitTransactions, newTransaction]
      }));
    }
    closeDebitModal();
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
      
      // Validate that the category exists in credit categories (if not freeSolo)
      const categoryExists = creditCategories.some(c => c.name === t.categoryName);
      if (!categoryExists && creditCategories.length > 0) {
        errors.push(`Credit transaction ${index + 1}: "${t.categoryName}" is not a valid Credit category`);
      }
    });

    // Validate debit transactions
    entry.debitTransactions.forEach((t, index) => {
      if (!t.categoryName.trim()) errors.push(`Debit transaction ${index + 1}: Category is required`);
      if (!t.particulars.trim()) errors.push(`Debit transaction ${index + 1}: Particulars is required`);
      if (t.amount <= 0) errors.push(`Debit transaction ${index + 1}: Amount must be greater than zero`);
      
      // Validate that the category exists in debit categories (if not freeSolo)
      const categoryExists = debitCategories.some(c => c.name === t.categoryName);
      if (!categoryExists && debitCategories.length > 0) {
        errors.push(`Debit transaction ${index + 1}: "${t.categoryName}" is not a valid Debit category`);
      }
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
  const hasTransactions = entry.creditTransactions.length > 0 || entry.debitTransactions.length > 0;
  const isFormValid = entry.referenceNumber.trim() && hasTransactions && isBalanced && !categoriesLoading;

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
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
            <AccountBalanceWalletIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Cash Book Entry
          </Typography>
        </Breadcrumbs>

        {/* Header with Navigation */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              📚 Manual Cash Book Entry
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter accounting transactions manually in MM Fashion cash book format
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => router.push('/admin/accounting')}
            sx={{ minWidth: 120 }}
          >
            Back to Accounting
          </Button>
        </Box>

        {/* Balance Status Alert */}
        {hasTransactions && (
          <Alert 
            severity={isBalanced ? 'success' : 'warning'} 
            sx={{ mb: 3 }}
            icon={<AccountBalanceIcon />}
          >
            <Typography variant="subtitle2">
              {isBalanced ? '✅ Entry is Balanced' : '⚠️ Entry Not Balanced'}
            </Typography>
            <Typography variant="body2">
              Credits: ৳{totalCredits.toFixed(2)} | Debits: ৳{totalDebits.toFixed(2)} | 
              Difference: ৳{difference.toFixed(2)}
            </Typography>
            {!isBalanced && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                💡 <strong>Tip:</strong> Add matching debit and credit transactions to balance the entry. 
                Total credits must equal total debits for proper double-entry bookkeeping.
              </Typography>
            )}
          </Alert>
        )}

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

        {/* Categories Loading State */}
        {categoriesLoading && (
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              Loading categories from the new category system...
            </Typography>
          </Alert>
        )}

        {/* Quick Help - Double Entry Bookkeeping */}
        <Card sx={{ mb: 3, backgroundColor: 'info.light', color: 'info.dark' }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              💡 Double-Entry Bookkeeping Guide
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Credit Transactions (Money In):</strong> Money received, income, or liability increases
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              <strong>Debit Transactions (Money Out):</strong> Money paid, expenses, or asset increases
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              ⚖️ <strong>Balance Rule:</strong> Total Credits must equal Total Debits for the entry to be saved
            </Typography>
            <Typography variant="body2" sx={{ mt: 2, fontStyle: 'italic' }}>
              📝 <strong>New:</strong> Categories are now managed through the dedicated Category Management system. 
              Only active Credit categories will appear in Credit transactions, and only active Debit categories in Debit transactions.
            </Typography>
          </CardContent>
        </Card>

        {/* Add Transaction Buttons */}
        <Box sx={{ mb: 3 }}>
          <AddTransactionButtons
            onAddCredit={() => openCreditModal()}
            onAddDebit={() => openDebitModal()}
            disabled={modals.creditModal.isOpen || modals.debitModal.isOpen}
          />
        </Box>

        {/* Transaction List */}
        <Box sx={{ mb: 3 }}>
          <TransactionList
            creditTransactions={entry.creditTransactions}
            debitTransactions={entry.debitTransactions}
            onEditCredit={openCreditModal}
            onEditDebit={openDebitModal}
            onDeleteCredit={removeCreditTransaction}
            onDeleteDebit={removeDebitTransaction}
            loading={false}
            error={undefined}
          />
        </Box>

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
                disabled={loading || !isFormValid}
                size="large"
                sx={{ 
                  minWidth: 200,
                  backgroundColor: isFormValid ? 'primary.main' : 'grey.400',
                  '&:hover': {
                    backgroundColor: isFormValid ? 'primary.dark' : 'grey.400',
                  }
                }}
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
              <Button
                variant="text"
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/admin/accounting')}
                disabled={loading}
                size="large"
              >
                Back to Accounting
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Credit Transaction Modal */}
        <CreditTransactionModal
          isOpen={modals.creditModal.isOpen}
          transaction={modals.creditModal.editingTransaction}
          categories={creditCategories}
          contacts={contacts}
          onSave={handleSaveCreditTransaction}
          onCancel={closeCreditModal}
        />

        {/* Debit Transaction Modal */}
        <DebitTransactionModal
          isOpen={modals.debitModal.isOpen}
          transaction={modals.debitModal.editingTransaction}
          categories={debitCategories}
          contacts={contacts}
          onSave={handleSaveDebitTransaction}
          onCancel={closeDebitModal}
        />
      </Box>
    </LocalizationProvider>
  );
}
