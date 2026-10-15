'use client'

import React from 'react';
import { Box, TextField } from '@mui/material';

interface AmountRangeFilterProps {
  amountMin?: number;
  amountMax?: number;
  onAmountMinChange: (value: number | undefined) => void;
  onAmountMaxChange: (value: number | undefined) => void;
}

export function AmountRangeFilter({ 
  amountMin, 
  amountMax, 
  onAmountMinChange, 
  onAmountMaxChange 
}: AmountRangeFilterProps) {
  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
      <TextField
        fullWidth
        size="small"
        label="Min Amount"
        type="number"
        value={amountMin || ''}
        onChange={(e) => onAmountMinChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        placeholder="0.00"
        InputProps={{
          startAdornment: '৳'
        }}
      />
      <TextField
        fullWidth
        size="small"
        label="Max Amount"
        type="number"
        value={amountMax || ''}
        onChange={(e) => onAmountMaxChange(e.target.value ? parseFloat(e.target.value) : undefined)}
        placeholder="999999.99"
        InputProps={{
          startAdornment: '৳'
        }}
      />
    </Box>
  );
}
