'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  IconButton,
  Stack,
  Chip,
  Paper,
  Divider,
  useTheme,
  CircularProgress,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';

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

interface TransactionListProps {
  creditTransactions: CreditTransaction[];
  debitTransactions: DebitTransaction[];
  onEditCredit: (transaction: CreditTransaction) => void;
  onEditDebit: (transaction: DebitTransaction) => void;
  onDeleteCredit: (id: string) => void;
  onDeleteDebit: (id: string) => void;
  loading?: boolean;
  error?: string;
  savingTransactionId?: string;
}

interface TransactionCardProps {
  transaction: CreditTransaction | DebitTransaction;
  type: 'credit' | 'debit';
  onEdit: () => void;
  onDelete: () => void;
  isSaving?: boolean;
}

interface DeleteConfirmation {
  isOpen: boolean;
  transactionId: string;
  transactionType: 'credit' | 'debit';
  transactionAmount: number;
  transactionParticulars: string;
}

const TransactionCard: React.FC<TransactionCardProps> = ({
  transaction,
  type,
  onEdit,
  onDelete,
  isSaving = false
}) => {
  const theme = useTheme();
  const isCredit = type === 'credit';
  const debitTransaction = transaction as DebitTransaction;

  return (
    <Paper
      sx={{
        p: 2,
        mb: 2,
        bgcolor: isCredit ? 'success.50' : 'error.50',
        border: `1px solid ${isCredit ? theme.palette.success.light : theme.palette.error.light}`,
        borderRadius: 2,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          boxShadow: theme.shadows[4],
          transform: 'translateY(-1px)'
        }
      }}
    >
      {/* Header with amount and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {isCredit ? (
            <TrendingUpIcon color="success" fontSize="small" />
          ) : (
            <TrendingDownIcon color="error" fontSize="small" />
          )}
          <Typography
            variant="h6"
            color={isCredit ? 'success.main' : 'error.main'}
            fontWeight="bold"
          >
            ৳{transaction.amount.toFixed(2)}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isSaving ? (
            <CircularProgress size={20} sx={{ m: 1 }} />
          ) : (
            <>
              <IconButton
                size="small"
                onClick={onEdit}
                disabled={isSaving}
                sx={{
                  color: 'primary.main',
                  '&:hover': {
                    bgcolor: 'primary.50'
                  }
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={onDelete}
                disabled={isSaving}
                sx={{
                  color: 'error.main',
                  '&:hover': {
                    bgcolor: 'error.50'
                  }
                }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Transaction details */}
      <Stack spacing={1.5}>
        {/* Date and Category */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            📅 {format(transaction.date, 'MMM dd, yyyy')}
          </Typography>
          <Chip
            label={transaction.categoryName}
            size="small"
            color={isCredit ? 'success' : 'error'}
            variant="outlined"
            sx={{ fontSize: '0.75rem' }}
          />
        </Box>

        {/* Particulars */}
        <Typography
          variant="body2"
          sx={{
            color: 'text.primary',
            fontWeight: 500,
            lineHeight: 1.4
          }}
        >
          {transaction.particulars}
        </Typography>

        {/* Contact information */}
        {isCredit && (transaction as CreditTransaction).contactName && (
          <Typography variant="caption" color="text.secondary">
            👤 Contact: {(transaction as CreditTransaction).contactName}
          </Typography>
        )}

        {!isCredit && (debitTransaction.supplierName || debitTransaction.buyerName) && (
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            {debitTransaction.supplierName && (
              <Typography variant="caption" color="text.secondary">
                🏪 Supplier: {debitTransaction.supplierName}
              </Typography>
            )}
            {debitTransaction.buyerName && (
              <Typography variant="caption" color="text.secondary">
                👤 Buyer: {debitTransaction.buyerName}
              </Typography>
            )}
          </Box>
        )}
      </Stack>
    </Paper>
  );
};

const EmptyState: React.FC<{ type: 'credit' | 'debit' }> = ({ type }) => {
  const isCredit = type === 'credit';

  return (
    <Box
      sx={{
        textAlign: 'center',
        py: 6,
        px: 3,
        color: 'text.secondary',
        bgcolor: isCredit ? 'success.25' : 'error.25',
        borderRadius: 2,
        border: `2px dashed ${isCredit ? 'success.light' : 'error.light'}`
      }}
    >
      <AccountBalanceIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
      <Typography variant="h6" gutterBottom>
        No {isCredit ? 'Credit' : 'Debit'} Transactions
      </Typography>
      <Typography variant="body2">
        {isCredit
          ? 'Add credit transactions to record money received or income'
          : 'Add debit transactions to record money paid out or expenses'
        }
      </Typography>
    </Box>
  );
};

const LoadingState: React.FC = () => (
  <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
    {/* Credit Loading Skeleton */}
    <Box sx={{ flex: 1 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
          {[1, 2, 3].map((i) => (
            <Paper key={i} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Skeleton variant="text" width={120} height={28} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              </Box>
              <Stack spacing={1}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </Stack>
            </Paper>
          ))}
        </CardContent>
      </Card>
    </Box>

    {/* Debit Loading Skeleton */}
    <Box sx={{ flex: 1 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Skeleton variant="text" width={200} height={32} />
            <Skeleton variant="rounded" width={80} height={24} />
          </Box>
          {[1, 2].map((i) => (
            <Paper key={i} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Skeleton variant="text" width={120} height={28} />
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                  <Skeleton variant="circular" width={32} height={32} />
                  <Skeleton variant="circular" width={32} height={32} />
                </Box>
              </Box>
              <Stack spacing={1}>
                <Skeleton variant="text" width="60%" height={20} />
                <Skeleton variant="text" width="80%" height={20} />
                <Skeleton variant="text" width="40%" height={16} />
              </Stack>
            </Paper>
          ))}
        </CardContent>
      </Card>
    </Box>
  </Stack>
);

const ErrorState: React.FC<{ error: string; onRetry?: () => void }> = ({ error, onRetry }) => (
  <Alert
    severity="error"
    sx={{ mb: 3 }}
    action={
      onRetry && (
        <IconButton
          color="inherit"
          size="small"
          onClick={onRetry}
        >
          <RefreshIcon />
        </IconButton>
      )
    }
  >
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <ErrorIcon />
      <Box>
        <Typography variant="subtitle2">Error Loading Transactions</Typography>
        <Typography variant="body2">{error}</Typography>
      </Box>
    </Box>
  </Alert>
);

export const TransactionList: React.FC<TransactionListProps> = ({
  creditTransactions,
  debitTransactions,
  onEditCredit,
  onEditDebit,
  onDeleteCredit,
  onDeleteDebit,
  loading = false,
  error,
  savingTransactionId
}) => {
  // Delete confirmation state
  const [deleteConfirmation, setDeleteConfirmation] = useState<DeleteConfirmation>({
    isOpen: false,
    transactionId: '',
    transactionType: 'credit',
    transactionAmount: 0,
    transactionParticulars: ''
  });

  // Calculate totals
  const totalCredits = creditTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalDebits = debitTransactions.reduce((sum, t) => sum + t.amount, 0);

  // Handle delete confirmation
  const handleDeleteClick = (
    transaction: CreditTransaction | DebitTransaction,
    type: 'credit' | 'debit'
  ) => {
    setDeleteConfirmation({
      isOpen: true,
      transactionId: transaction.id,
      transactionType: type,
      transactionAmount: transaction.amount,
      transactionParticulars: transaction.particulars
    });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation.transactionType === 'credit') {
      onDeleteCredit(deleteConfirmation.transactionId);
    } else {
      onDeleteDebit(deleteConfirmation.transactionId);
    }
    setDeleteConfirmation({
      isOpen: false,
      transactionId: '',
      transactionType: 'credit',
      transactionAmount: 0,
      transactionParticulars: ''
    });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({
      isOpen: false,
      transactionId: '',
      transactionType: 'credit',
      transactionAmount: 0,
      transactionParticulars: ''
    });
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} />;
  }

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
      {/* Credit Transactions Column */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ height: 'fit-content' }}>
          <CardContent>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6" color="success.main" fontWeight="bold">
                  Credit Transactions
                </Typography>
              </Box>
              <Chip
                label={`${creditTransactions.length} items`}
                size="small"
                color="success"
                variant="outlined"
              />
            </Box>

            {/* Transaction List */}
            {creditTransactions.length === 0 ? (
              <EmptyState type="credit" />
            ) : (
              <Box>
                {creditTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    type="credit"
                    onEdit={() => onEditCredit(transaction)}
                    onDelete={() => handleDeleteClick(transaction, 'credit')}
                    isSaving={savingTransactionId === transaction.id}
                  />
                ))}
              </Box>
            )}

            {/* Total */}
            {creditTransactions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'success.100',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total Credits:
                  </Typography>
                  <Typography
                    variant="h6"
                    color="success.main"
                    fontWeight="bold"
                  >
                    ৳{totalCredits.toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Debit Transactions Column */}
      <Box sx={{ flex: 1 }}>
        <Card sx={{ height: 'fit-content' }}>
          <CardContent>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TrendingDownIcon color="error" />
                <Typography variant="h6" color="error.main" fontWeight="bold">
                  Debit Transactions
                </Typography>
              </Box>
              <Chip
                label={`${debitTransactions.length} items`}
                size="small"
                color="error"
                variant="outlined"
              />
            </Box>

            {/* Transaction List */}
            {debitTransactions.length === 0 ? (
              <EmptyState type="debit" />
            ) : (
              <Box>
                {debitTransactions.map((transaction) => (
                  <TransactionCard
                    key={transaction.id}
                    transaction={transaction}
                    type="debit"
                    onEdit={() => onEditDebit(transaction)}
                    onDelete={() => handleDeleteClick(transaction, 'debit')}
                    isSaving={savingTransactionId === transaction.id}
                  />
                ))}
              </Box>
            )}

            {/* Total */}
            {debitTransactions.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    bgcolor: 'error.100',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle1" fontWeight="bold">
                    Total Debits:
                  </Typography>
                  <Typography
                    variant="h6"
                    color="error.main"
                    fontWeight="bold"
                  >
                    ৳{totalDebits.toFixed(2)}
                  </Typography>
                </Box>
              </>
            )}
          </CardContent>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={deleteConfirmation.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction"
        message={`Are you sure you want to delete this ${deleteConfirmation.transactionType} transaction of ৳${deleteConfirmation.transactionAmount.toFixed(2)}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        type="delete"
      />
    </Stack>
  );
};

export default TransactionList;