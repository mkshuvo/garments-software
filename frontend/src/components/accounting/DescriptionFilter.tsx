'use client'

import React from 'react';
import { TextField } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

interface DescriptionFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function DescriptionFilter({ value, onChange }: DescriptionFilterProps) {
  return (
    <TextField
      fullWidth
      size="small"
      label="Search in Description/Particulars"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Search descriptions..."
      InputProps={{
        startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
      }}
    />
  );
}
