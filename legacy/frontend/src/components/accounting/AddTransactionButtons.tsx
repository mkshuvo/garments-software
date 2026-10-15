'use client';

import React from 'react';
import {
  Box,
  Button,
  Stack,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as CreditIcon,
  TrendingDown as DebitIcon
} from '@mui/icons-material';

interface AddTransactionButtonsProps {
  onAddCredit: () => void;
  onAddDebit: () => void;
  disabled?: boolean;
}

export const AddTransactionButtons: React.FC<AddTransactionButtonsProps> = ({
  onAddCredit,
  onAddDebit,
  disabled = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 3,
        p: 3,
        bgcolor: 'background.paper',
        borderRadius: 2,
        boxShadow: 1,
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      {/* Header */}
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Add New Transaction
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Choose the type of transaction you want to record
        </Typography>
      </Box>

      {/* Buttons */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={3}
        sx={{ width: '100%', maxWidth: 600 }}
      >
        {/* Add Credit Transaction Button */}
        <Button
          variant="contained"
          size="large"
          onClick={onAddCredit}
          disabled={disabled}
          startIcon={<CreditIcon />}
          endIcon={<AddIcon />}
          sx={{
            flex: 1,
            minHeight: 80,
            bgcolor: 'success.main',
            color: 'success.contrastText',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 1,
            '&:hover': {
              bgcolor: 'success.dark',
              transform: 'translateY(-2px)',
              boxShadow: 4
            },
            '&:disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            },
            transition: 'all 0.2s ease-in-out',
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600
          }}
          aria-label="Add credit transaction - money received or income"
          aria-describedby="credit-description"
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" component="span" sx={{ display: 'block' }}>
              Add Credit Transaction
            </Typography>
            <Typography 
              variant="caption" 
              component="span" 
              sx={{ 
                display: 'block',
                opacity: 0.9,
                fontWeight: 400
              }}
              id="credit-description"
            >
              Money In • Income • Receipts
            </Typography>
          </Box>
        </Button>

        {/* Add Debit Transaction Button */}
        <Button
          variant="contained"
          size="large"
          onClick={onAddDebit}
          disabled={disabled}
          startIcon={<DebitIcon />}
          endIcon={<AddIcon />}
          sx={{
            flex: 1,
            minHeight: 80,
            bgcolor: 'warning.main',
            color: 'warning.contrastText',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 1,
            '&:hover': {
              bgcolor: 'warning.dark',
              transform: 'translateY(-2px)',
              boxShadow: 4
            },
            '&:disabled': {
              bgcolor: 'action.disabledBackground',
              color: 'action.disabled'
            },
            transition: 'all 0.2s ease-in-out',
            textTransform: 'none',
            fontSize: '1.1rem',
            fontWeight: 600
          }}
          aria-label="Add debit transaction - money paid out or expenses"
          aria-describedby="debit-description"
        >
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" component="span" sx={{ display: 'block' }}>
              Add Debit Transaction
            </Typography>
            <Typography 
              variant="caption" 
              component="span" 
              sx={{ 
                display: 'block',
                opacity: 0.9,
                fontWeight: 400
              }}
              id="debit-description"
            >
              Money Out • Expenses • Payments
            </Typography>
          </Box>
        </Button>
      </Stack>

      {/* Help Text */}
      <Box 
        sx={{ 
          textAlign: 'center',
          maxWidth: 500,
          p: 2,
          bgcolor: 'info.light',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'info.main'
        }}
      >
        <Typography variant="body2" color="info.dark">
          💡 <strong>Double-Entry Bookkeeping:</strong> For each transaction entry, 
          the total credits must equal the total debits to maintain balance.
        </Typography>
      </Box>
    </Box>
  );
};

export default AddTransactionButtons;