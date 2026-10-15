'use client'

import React from 'react';
import { TextField } from '@mui/material';

interface ReferenceFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function ReferenceFilter({ value, onChange }: ReferenceFilterProps) {
  return (
    <TextField
      fullWidth
      size="small"
      label="Reference Number"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter reference number"
    />
  );
}
