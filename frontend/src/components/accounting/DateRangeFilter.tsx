'use client'

import React from 'react';
import { Box, TextField } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

interface DateRangeFilterProps {
  dateFrom?: Date | null;
  dateTo?: Date | null;
  onDateFromChange: (date: Date | null) => void;
  onDateToChange: (date: Date | null) => void;
}

export function DateRangeFilter({ 
  dateFrom, 
  dateTo, 
  onDateFromChange, 
  onDateToChange 
}: DateRangeFilterProps) {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
        <DatePicker
          label="Date From"
          value={dateFrom}
          onChange={onDateFromChange}
          slotProps={{ 
            textField: { 
              fullWidth: true, 
              size: 'small',
              placeholder: 'Start date'
            } 
          }}
        />
        <DatePicker
          label="Date To"
          value={dateTo}
          onChange={onDateToChange}
          slotProps={{ 
            textField: { 
              fullWidth: true, 
              size: 'small',
              placeholder: 'End date'
            } 
          }}
        />
      </Box>
    </LocalizationProvider>
  );
}
