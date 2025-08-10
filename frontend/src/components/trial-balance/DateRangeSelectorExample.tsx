'use client'

import React, { useState } from 'react'
import { Container, Typography, Box, Alert } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { startOfMonth, endOfMonth } from 'date-fns'
import DateRangeSelector from './DateRangeSelector'
import { DateRange } from '@/types/trialBalance'

/**
 * Example component demonstrating the DateRangeSelector usage
 * This shows how to integrate the DateRangeSelector in a real application
 */
export const DateRangeSelectorExample: React.FC = () => {
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  })

  const handleDateChange = (startDate: Date, endDate: Date) => {
    setDateRange({ startDate, endDate })
    console.log('Date range changed:', { startDate, endDate })
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          DateRangeSelector Example
        </Typography>
        
        <Typography variant="body1" paragraph>
          This example demonstrates the DateRangeSelector component with various features:
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Basic Usage
          </Typography>
          <DateRangeSelector
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            helperText="Select a date range for your trial balance report"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            With Maximum Range Limit (30 days)
          </Typography>
          <DateRangeSelector
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            maxRange={30}
            helperText="This selector has a 30-day maximum range limit"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Disabled State
          </Typography>
          <DateRangeSelector
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            disabled
            helperText="This selector is disabled"
          />
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            With Custom Error
          </Typography>
          <DateRangeSelector
            startDate={dateRange.startDate}
            endDate={dateRange.endDate}
            onDateChange={handleDateChange}
            error="This is a custom error message"
          />
        </Box>

        <Alert severity="info" sx={{ mt: 4 }}>
          <Typography variant="body2">
            <strong>Current Selection:</strong><br />
            Start Date: {dateRange.startDate.toLocaleDateString()}<br />
            End Date: {dateRange.endDate.toLocaleDateString()}
          </Typography>
        </Alert>
      </Container>
    </LocalizationProvider>
  )
}

export default DateRangeSelectorExample