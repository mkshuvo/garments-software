import React from 'react';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';

interface StatusFilterProps {
  value: string;
  onChange: (status: string) => void;
  disabled?: boolean;
  size?: 'small' | 'medium';
  fullWidth?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'All', label: 'All Statuses' },
  { value: 'Draft', label: 'Draft' },
  { value: 'Posted', label: 'Posted' },
  { value: 'Approved', label: 'Approved' },
  { value: 'Reversed', label: 'Reversed' }
];

export function StatusFilter({ 
  value, 
  onChange, 
  disabled = false, 
  size = 'small',
  fullWidth = true 
}: StatusFilterProps) {
  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value);
  };

  return (
    <FormControl fullWidth={fullWidth} size={size} disabled={disabled}>
      <InputLabel>Status</InputLabel>
      <Select
        value={value}
        label="Status"
        onChange={handleChange}
      >
        {STATUS_OPTIONS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default StatusFilter;
