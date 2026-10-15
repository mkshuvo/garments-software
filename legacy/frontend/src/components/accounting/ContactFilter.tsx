'use client'

import React from 'react';
import { TextField } from '@mui/material';

interface ContactFilterProps {
  value: string;
  onChange: (value: string) => void;
}

export function ContactFilter({ value, onChange }: ContactFilterProps) {
  return (
    <TextField
      fullWidth
      size="small"
      label="Contact/Supplier"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter contact name"
    />
  );
}
