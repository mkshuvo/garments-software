'use client'

import React from 'react';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface CategoryFilterProps {
  value: string;
  categories: string[];
  onChange: (value: string) => void;
}

export function CategoryFilter({ value, categories, onChange }: CategoryFilterProps) {
  return (
    <FormControl fullWidth size="small">
      <InputLabel>Category</InputLabel>
      <Select
        value={value}
        label="Category"
        onChange={(e) => onChange(e.target.value)}
      >
        <MenuItem value="">All Categories</MenuItem>
        {categories.map((category) => (
          <MenuItem key={category} value={category}>
            {category}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
