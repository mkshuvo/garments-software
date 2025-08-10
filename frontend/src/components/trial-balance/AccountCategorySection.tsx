import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Collapse,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Tooltip,
  Divider,
  Stack,
  useTheme,
  alpha
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Remove as RemoveIcon
} from '@mui/icons-material';
import { AccountCategory, AccountBalance } from '../../types/trialBalance';

interface AccountCategorySectionProps {
  category: AccountCategory;
  onAccountClick: (accountId: string, accountName: string) => void;
  showZeroBalances?: boolean;
  defaultExpanded?: boolean;
}

export const AccountCategorySection: React.FC<AccountCategorySectionProps> = ({
  category,
  onAccountClick,
  showZeroBalances = false,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const theme = useTheme();

  // Filter accounts based on showZeroBalances preference
  const filteredAccounts = showZeroBalances 
    ? category.accounts 
    : category.accounts.filter(account => account.netBalance !== 0);

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleAccountClick = (account: AccountBalance) => {
    onAccountClick(account.accountId, account.accountName);
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'assets':
        return <TrendingUpIcon />;
      case 'liabilities':
        return <TrendingDownIcon />;
      case 'equity':
        return <AccountBalanceIcon />;
      case 'income':
        return <TrendingUpIcon />;
      case 'expenses':
        return <TrendingDownIcon />;
      default:
        return <AccountBalanceIcon />;
    }
  };

  const getCategoryColor = (categoryName: string) => {
    switch (categoryName.toLowerCase()) {
      case 'assets':
        return theme?.palette?.success?.main || '#4caf50';
      case 'liabilities':
        return theme?.palette?.error?.main || '#f44336';
      case 'equity':
        return theme?.palette?.primary?.main || '#2196f3';
      case 'income':
        return theme?.palette?.info?.main || '#00bcd4';
      case 'expenses':
        return theme?.palette?.warning?.main || '#ff9800';
      default:
        return theme?.palette?.grey?.[600] || '#757575';
    }
  };

  const formatAmount = (amount: number) => {
    const formatted = Math.abs(amount).toLocaleString();
    return amount < 0 ? `(${formatted})` : formatted;
  };

  const getAmountColor = (amount: number) => {
    if (amount > 0) return theme?.palette?.success?.main || '#4caf50';
    if (amount < 0) return theme?.palette?.error?.main || '#f44336';
    return theme?.palette?.text?.secondary || '#757575';
  };

  const getBalanceIcon = (balance: number) => {
    if (balance > 0) return <TrendingUpIcon fontSize="small" />;
    if (balance < 0) return <TrendingDownIcon fontSize="small" />;
    return <RemoveIcon fontSize="small" />;
  };

  if (filteredAccounts.length === 0 && !showZeroBalances) {
    return null;
  }

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 2,
        border: '1px solid',
        borderColor: alpha(getCategoryColor(category.name), 0.3),
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      {/* Category Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          backgroundColor: alpha(getCategoryColor(category.name), 0.1),
          borderBottom: expanded ? '1px solid' : 'none',
          borderBottomColor: alpha(getCategoryColor(category.name), 0.2),
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          '&:hover': {
            backgroundColor: alpha(getCategoryColor(category.name), 0.15)
          }
        }}
        onClick={handleToggleExpanded}
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
              backgroundColor: alpha(getCategoryColor(category.name), 0.2),
              color: getCategoryColor(category.name)
            }}
          >
            {getCategoryIcon(category.name)}
          </Box>
          
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 'bold',
                color: getCategoryColor(category.name),
                mb: 0.5
              }}
            >
              {category.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              Subtotal
            </Typography>
            <Chip
              icon={getBalanceIcon(category.subtotal)}
              label={formatAmount(category.subtotal)}
              sx={{
                fontWeight: 'bold',
                color: getAmountColor(category.subtotal),
                backgroundColor: alpha(getAmountColor(category.subtotal), 0.1),
                '& .MuiChip-icon': {
                  color: getAmountColor(category.subtotal)
                }
              }}
            />
          </Box>
          
          <Tooltip title={expanded ? 'Collapse category' : 'Expand category'}>
            <IconButton
              sx={{
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease',
                color: getCategoryColor(category.name)
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Accounts Table */}
      <Collapse 
        in={expanded} 
        timeout={300}
        sx={{
          '& .MuiCollapse-wrapper': {
            transition: 'height 0.3s ease'
          }
        }}
      >
        {filteredAccounts.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ backgroundColor: alpha(getCategoryColor(category.name), 0.05) }}>
                  <TableCell sx={{ fontWeight: 'bold', color: getCategoryColor(category.name) }}>
                    Account Name
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: getCategoryColor(category.name) }}>
                    Category Description
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', color: getCategoryColor(category.name) }}>
                    Particulars
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: getCategoryColor(category.name) }}>
                    Debit Amount
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: getCategoryColor(category.name) }}>
                    Credit Amount
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold', color: getCategoryColor(category.name) }}>
                    Net Balance
                  </TableCell>
                  <TableCell align="center" sx={{ fontWeight: 'bold', color: getCategoryColor(category.name) }}>
                    Transactions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredAccounts.map((account, index) => (
                  <TableRow
                    key={account.accountId}
                    onClick={() => handleAccountClick(account)}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: alpha(getCategoryColor(category.name), 0.08),
                        transform: 'translateX(4px)'
                      },
                      '&:nth-of-type(even)': {
                        backgroundColor: alpha(theme?.palette?.grey?.[100] || '#f5f5f5', 0.5)
                      }
                    }}
                  >
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            backgroundColor: getCategoryColor(category.name),
                            opacity: 0.7
                          }}
                        />
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'medium',
                            color: theme?.palette?.text?.primary || '#212121'
                          }}
                        >
                          {account.accountName}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {account.categoryDescription || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {account.particulars || '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: account.debitAmount !== 0 ? (theme?.palette?.error?.main || '#f44336') : (theme?.palette?.text?.disabled || '#bdbdbd'),
                          fontFamily: 'monospace',
                          fontWeight: account.debitAmount !== 0 ? 'medium' : 'normal'
                        }}
                      >
                        {account.debitAmount !== 0 ? formatAmount(account.debitAmount) : '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          color: account.creditAmount !== 0 ? (theme?.palette?.success?.main || '#4caf50') : (theme?.palette?.text?.disabled || '#bdbdbd'),
                          fontFamily: 'monospace',
                          fontWeight: account.creditAmount !== 0 ? 'medium' : 'normal'
                        }}
                      >
                        {account.creditAmount !== 0 ? formatAmount(account.creditAmount) : '-'}
                      </Typography>
                    </TableCell>
                    
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                        {getBalanceIcon(account.netBalance)}
                        <Typography
                          variant="body2"
                          sx={{
                            color: getAmountColor(account.netBalance),
                            fontFamily: 'monospace',
                            fontWeight: 'bold'
                          }}
                        >
                          {formatAmount(account.netBalance)}
                        </Typography>
                      </Box>
                    </TableCell>
                    
                    <TableCell align="center">
                      <Chip
                        label={account.transactionCount}
                        size="small"
                        sx={{
                          minWidth: 40,
                          backgroundColor: alpha(getCategoryColor(category.name), 0.1),
                          color: getCategoryColor(category.name),
                          fontWeight: 'medium'
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No accounts with non-zero balances in this category
            </Typography>
          </Box>
        )}
        
        {/* Category Summary Footer */}
        {filteredAccounts.length > 0 && (
          <>
            <Divider />
            <Box
              sx={{
                p: 2,
                backgroundColor: alpha(getCategoryColor(category.name), 0.05),
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Total {category.name}: {filteredAccounts.length} accounts
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Category Total:
                </Typography>
                <Chip
                  icon={getBalanceIcon(category.subtotal)}
                  label={formatAmount(category.subtotal)}
                  sx={{
                    fontWeight: 'bold',
                    color: getAmountColor(category.subtotal),
                    backgroundColor: alpha(getAmountColor(category.subtotal), 0.1),
                    '& .MuiChip-icon': {
                      color: getAmountColor(category.subtotal)
                    }
                  }}
                />
              </Box>
            </Box>
          </>
        )}
      </Collapse>
    </Paper>
  );
};

export default AccountCategorySection;