'use client'

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface TransactionTypeFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function TransactionTypeFilter({ value, onChange }: TransactionTypeFilterProps) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Transaction Type</InputLabel>
      <Select
        value={value}
        label="Transaction Type"
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="All">All Types</MenuItem>
        <MenuItem value="Credit">Credit (Money In)</MenuItem>
        <MenuItem value="Debit">Debit (Money Out)</MenuItem>
      </Select>
    </FormControl>
  );
}
