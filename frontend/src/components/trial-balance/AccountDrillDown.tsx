import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  Chip,
  IconButton,
  Breadcrumbs,
  Link,
  CircularProgress,
  Alert,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tooltip,
  useTheme,
  alpha
} from '@mui/material';
import {
  Close as CloseIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Receipt as ReceiptIcon,
  NavigateNext as NavigateNextIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import {
  AccountDrillDownProps,
  AccountTransactionResponse,
  TransactionSortField,
  SortDirection,
  TransactionSortOptions
} from '../../types/trialBalance';
import { trialBalanceService } from '../../services/trialBalanceService';

export const AccountDrillDown: React.FC<AccountDrillDownProps> = ({
  accountId,
  accountName,
  dateRange,
  isOpen,
  onClose
}) => {
  const theme = useTheme();
  
  // State management
  const [transactionData, setTransactionData] = useState<AccountTransactionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortOptions, setSortOptions] = useState<TransactionSortOptions>({
    field: TransactionSortField.DATE,
    direction: SortDirection.DESC
  });

  const loadTransactionData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await trialBalanceService.getAccountTransactions(
        accountId,
        dateRange,
        {
          page: currentPage,
          pageSize: pageSize
        }
      );
      setTransactionData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load transaction data';
      setError(errorMessage);
      console.error('Error loading account transactions:', err);
    } finally {
      setLoading(false);
    }
  }, [accountId, dateRange, currentPage, pageSize]);

  // Load transaction data when modal opens or parameters change
  useEffect(() => {
    if (isOpen && accountId) {
      loadTransactionData();
    }
  }, [isOpen, accountId, dateRange, currentPage, pageSize, sortOptions, loadTransactionData]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTransactionData(null);
      setError(null);
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Sort transactions based on current sort options
  const sortedTransactions = useMemo(() => {
    if (!transactionData?.transactions) return [];

    const transactions = [...transactionData.transactions];
    
    return transactions.sort((a, b) => {
      let comparison = 0;
      
      switch (sortOptions.field) {
        case TransactionSortField.DATE:
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
          break;
        case TransactionSortField.AMOUNT:
          const amountA = Math.abs(a.debitAmount) + Math.abs(a.creditAmount);
          const amountB = Math.abs(b.debitAmount) + Math.abs(b.creditAmount);
          comparison = amountA - amountB;
          break;
        case TransactionSortField.DESCRIPTION:
          comparison = a.particulars.localeCompare(b.particulars);
          break;
        case TransactionSortField.REFERENCE:
          comparison = a.referenceNumber.localeCompare(b.referenceNumber);
          break;
        default:
          comparison = 0;
      }
      
      return sortOptions.direction === SortDirection.ASC ? comparison : -comparison;
    });
  }, [transactionData?.transactions, sortOptions]);

  const handleSortChange = (field: TransactionSortField) => {
    setSortOptions(prev => ({
      field,
      direction: prev.field === field && prev.direction === SortDirection.ASC 
        ? SortDirection.DESC 
        : SortDirection.ASC
    }));
  };

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event: { target: { value: unknown } }) => {
    const newPageSize = Number(event.target.value);
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  const handleRetry = () => {
    loadTransactionData();
  };

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    return amount < 0 ? `(${formatted})` : formatted;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getAmountColor = (debitAmount: number, creditAmount: number) => {
    if (debitAmount !== 0) return theme?.palette?.error?.main || '#f44336';
    if (creditAmount !== 0) return theme?.palette?.success?.main || '#4caf50';
    return theme?.palette?.text?.secondary || '#757575';
  };

  const getAmountIcon = (debitAmount: number, creditAmount: number) => {
    if (debitAmount !== 0) return <TrendingDownIcon fontSize="small" />;
    if (creditAmount !== 0) return <TrendingUpIcon fontSize="small" />;
    return null;
  };

  const totalPages = Math.ceil((transactionData?.totalCount || 0) / pageSize);

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '70vh',
          maxHeight: '90vh'
        }
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 2,
          borderBottom: '1px solid',
          borderBottomColor: 'divider'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: '50%',
              backgroundColor: alpha(theme?.palette?.primary?.main || '#2196f3', 0.1),
              color: theme?.palette?.primary?.main || '#2196f3'
            }}
          >
            <AccountBalanceIcon />
          </Box>
          
          <Box>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              Account Transaction Details
            </Typography>
            
            {/* Breadcrumb Navigation */}
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ mt: 0.5 }}
            >
              <Link
                component="button"
                variant="body2"
                onClick={onClose}
                sx={{
                  textDecoration: 'none',
                  color: theme?.palette?.primary?.main || '#2196f3',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                Trial Balance
              </Link>
              <Typography variant="body2" color="text.primary">
                {accountName}
              </Typography>
            </Breadcrumbs>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Refresh data">
            <span>
              <IconButton
                onClick={handleRetry}
                disabled={loading}
                size="small"
              >
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          
          <Tooltip title="Close">
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent sx={{ p: 0 }}>
        {/* Account Summary Header */}
        <Box
          sx={{
            p: 3,
            backgroundColor: alpha(theme?.palette?.primary?.main || '#2196f3', 0.05),
            borderBottom: '1px solid',
            borderBottomColor: 'divider'
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              {accountName}
            </Typography>
            
            <Chip
              label={`${formatDate(dateRange.startDate)} - ${formatDate(dateRange.endDate)}`}
              variant="outlined"
              size="small"
            />
          </Box>
          
          {transactionData && (
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  Total Transactions
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {transactionData.totalCount}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Loading State */}
        {loading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 300,
              flexDirection: 'column',
              gap: 2
            }}
          >
            <CircularProgress />
            <Typography variant="body2" color="text.secondary">
              Loading transaction details...
            </Typography>
          </Box>
        )}

        {/* Error State */}
        {error && !loading && (
          <Box sx={{ p: 3 }}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Transaction Table */}
        {!loading && !error && transactionData && (
          <Box>
            {/* Table Controls */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderBottom: '1px solid',
                borderBottomColor: 'divider'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Showing {sortedTransactions.length} of {transactionData.totalCount} transactions
              </Typography>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Page Size</InputLabel>
                <Select
                  value={pageSize}
                  label="Page Size"
                  onChange={handlePageSizeChange}
                >
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                  <MenuItem value={50}>50</MenuItem>
                  <MenuItem value={100}>100</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Transactions Table */}
            <TableContainer component={Paper} elevation={0}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortOptions.field === TransactionSortField.DATE}
                        direction={sortOptions.field === TransactionSortField.DATE ? sortOptions.direction : 'asc'}
                        onClick={() => handleSortChange(TransactionSortField.DATE)}
                      >
                        Date
                      </TableSortLabel>
                    </TableCell>
                    
                    <TableCell>
                      Category Description
                    </TableCell>
                    
                    <TableCell>
                      <TableSortLabel
                        active={sortOptions.field === TransactionSortField.DESCRIPTION}
                        direction={sortOptions.field === TransactionSortField.DESCRIPTION ? sortOptions.direction : 'asc'}
                        onClick={() => handleSortChange(TransactionSortField.DESCRIPTION)}
                      >
                        Particulars
                      </TableSortLabel>
                    </TableCell>
                    
                    <TableCell>
                      <TableSortLabel
                        active={sortOptions.field === TransactionSortField.REFERENCE}
                        direction={sortOptions.field === TransactionSortField.REFERENCE ? sortOptions.direction : 'asc'}
                        onClick={() => handleSortChange(TransactionSortField.REFERENCE)}
                      >
                        Reference
                      </TableSortLabel>
                    </TableCell>
                    
                    <TableCell align="right">
                      <TableSortLabel
                        active={sortOptions.field === TransactionSortField.AMOUNT}
                        direction={sortOptions.field === TransactionSortField.AMOUNT ? sortOptions.direction : 'asc'}
                        onClick={() => handleSortChange(TransactionSortField.AMOUNT)}
                      >
                        Debit Amount
                      </TableSortLabel>
                    </TableCell>
                    
                    <TableCell align="right">
                      Credit Amount
                    </TableCell>
                    
                    <TableCell align="right">
                      Running Balance
                    </TableCell>
                  </TableRow>
                </TableHead>
                
                <TableBody>
                  {sortedTransactions.length > 0 ? (
                    sortedTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        sx={{
                          '&:hover': {
                            backgroundColor: alpha(theme?.palette?.primary?.main || '#2196f3', 0.04)
                          }
                        }}
                      >
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ReceiptIcon fontSize="small" color="action" />
                            <Typography variant="body2">
                              {formatDate(transaction.date)}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {transaction.categoryDescription || '-'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{
                              maxWidth: 200,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                            title={transaction.particulars}
                          >
                            {transaction.particulars || '-'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {transaction.referenceNumber || '-'}
                          </Typography>
                        </TableCell>
                        
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {transaction.debitAmount !== 0 && getAmountIcon(transaction.debitAmount, 0)}
                            <Typography
                              variant="body2"
                              sx={{
                                color: transaction.debitAmount !== 0 
                                  ? getAmountColor(transaction.debitAmount, 0)
                                  : theme?.palette?.text?.disabled || '#bdbdbd',
                                fontFamily: 'monospace',
                                fontWeight: transaction.debitAmount !== 0 ? 'medium' : 'normal'
                              }}
                            >
                              {transaction.debitAmount !== 0 ? formatAmount(transaction.debitAmount) : '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell align="right">
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                            {transaction.creditAmount !== 0 && getAmountIcon(0, transaction.creditAmount)}
                            <Typography
                              variant="body2"
                              sx={{
                                color: transaction.creditAmount !== 0 
                                  ? getAmountColor(0, transaction.creditAmount)
                                  : theme?.palette?.text?.disabled || '#bdbdbd',
                                fontFamily: 'monospace',
                                fontWeight: transaction.creditAmount !== 0 ? 'medium' : 'normal'
                              }}
                            >
                              {transaction.creditAmount !== 0 ? formatAmount(transaction.creditAmount) : '-'}
                            </Typography>
                          </Box>
                        </TableCell>
                        
                        <TableCell align="right">
                          <Typography
                            variant="body2"
                            sx={{
                              color: getAmountColor(
                                transaction.runningBalance < 0 ? transaction.runningBalance : 0,
                                transaction.runningBalance > 0 ? transaction.runningBalance : 0
                              ),
                              fontFamily: 'monospace',
                              fontWeight: 'bold'
                            }}
                          >
                            {formatAmount(transaction.runningBalance)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary">
                          No transactions found for the selected date range
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  p: 2,
                  borderTop: '1px solid',
                  borderTopColor: 'divider'
                }}
              >
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        )}
      </DialogContent>

      {/* Dialog Actions */}
      <DialogActions sx={{ p: 2, borderTop: '1px solid', borderTopColor: 'divider' }}>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AccountDrillDown;