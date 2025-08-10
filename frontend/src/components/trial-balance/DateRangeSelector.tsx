'use client'

import React, { useState, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Paper,
  Stack,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import {
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  subQuarters,
  subYears,
  isAfter,
  differenceInDays,
  format
} from 'date-fns'
import { DateRangePreset } from '@/types/trialBalance'

export interface DateRangeSelectorProps {
  startDate: Date
  endDate: Date
  onDateChange: (startDate: Date, endDate: Date) => void
  maxRange?: number // Maximum days allowed
  presets?: DateRangePreset[]
  disabled?: boolean
  error?: string
  helperText?: string
}

// Default preset options for common date ranges
const createDefaultPresets = (): DateRangePreset[] => {
  const now = new Date()
  
  return [
    {
      label: 'This Month',
      startDate: startOfMonth(now),
      endDate: endOfMonth(now)
    },
    {
      label: 'Last Month',
      startDate: startOfMonth(subMonths(now, 1)),
      endDate: endOfMonth(subMonths(now, 1))
    },
    {
      label: 'This Quarter',
      startDate: startOfQuarter(now),
      endDate: endOfQuarter(now)
    },
    {
      label: 'Last Quarter',
      startDate: startOfQuarter(subQuarters(now, 1)),
      endDate: endOfQuarter(subQuarters(now, 1))
    },
    {
      label: 'This Year',
      startDate: startOfYear(now),
      endDate: endOfYear(now)
    },
    {
      label: 'Last Year',
      startDate: startOfYear(subYears(now, 1)),
      endDate: endOfYear(subYears(now, 1))
    }
  ]
}

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  startDate,
  endDate,
  onDateChange,
  maxRange = 365, // Default to 1 year max range
  presets,
  disabled = false,
  error,
  helperText
}) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme?.breakpoints?.down('sm') || '(max-width: 600px)')
  
  // Use provided presets or default ones
  const datePresets = useMemo(() => presets || createDefaultPresets(), [presets])
  
  // Local state for validation errors
  const [validationError, setValidationError] = useState<string>('')
  
  // Validate date range
  const validateDateRange = useCallback((start: Date, end: Date): string => {
    if (isAfter(start, end)) {
      return 'Start date cannot be later than end date'
    }
    
    if (maxRange && differenceInDays(end, start) > maxRange) {
      return `Date range cannot exceed ${maxRange} days`
    }
    
    return ''
  }, [maxRange])
  
  // Validate initial props
  React.useEffect(() => {
    const initialError = validateDateRange(startDate, endDate)
    setValidationError(initialError)
  }, [startDate, endDate, validateDateRange])
  
  // Handle start date change
  const handleStartDateChange = useCallback((newStartDate: Date | null) => {
    if (!newStartDate) return
    
    const validationErr = validateDateRange(newStartDate, endDate)
    setValidationError(validationErr)
    
    if (!validationErr) {
      onDateChange(newStartDate, endDate)
    }
  }, [endDate, onDateChange, validateDateRange])
  
  // Handle end date change
  const handleEndDateChange = useCallback((newEndDate: Date | null) => {
    if (!newEndDate) return
    
    const validationErr = validateDateRange(startDate, newEndDate)
    setValidationError(validationErr)
    
    if (!validationErr) {
      onDateChange(startDate, newEndDate)
    }
  }, [startDate, onDateChange, validateDateRange])
  
  // Handle preset selection
  const handlePresetClick = useCallback((preset: DateRangePreset) => {
    const validationErr = validateDateRange(preset.startDate, preset.endDate)
    setValidationError(validationErr)
    
    if (!validationErr) {
      onDateChange(preset.startDate, preset.endDate)
    }
  }, [onDateChange, validateDateRange])
  
  // Get current error message (validation error takes precedence)
  const currentError = validationError || error
  
  // Format date range for display
  const formatDateRange = useCallback((start: Date, end: Date): string => {
    return `${format(start, 'MMM dd, yyyy')} - ${format(end, 'MMM dd, yyyy')}`
  }, [])
  
  return (
    <Paper
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 2,
        border: currentError ? `1px solid ${theme?.palette?.error?.main || '#f44336'}` : undefined
      }}
    >
        <Stack spacing={3}>
          {/* Header */}
          <Typography variant="h6" component="h3">
            Select Date Range
          </Typography>
          
          {/* Current Selection Display */}
          <Box
            sx={{
              p: 2,
              backgroundColor: theme?.palette?.grey?.[50] || '#fafafa',
              borderRadius: 1,
              border: `1px solid ${theme?.palette?.grey?.[200] || '#eeeeee'}`
            }}
          >
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Selected Range:
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {formatDateRange(startDate, endDate)}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {differenceInDays(endDate, startDate) + 1} days
            </Typography>
          </Box>
          
          {/* Date Pickers */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth error={!!currentError}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={handleStartDateChange}
                  disabled={disabled}
                  maxDate={endDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!currentError,
                      inputProps: {
                        'aria-label': 'Start date',
                        'aria-describedby': currentError ? 'date-range-error' : undefined
                      }
                    }
                  }}
                />
              </FormControl>
            </Box>
            
            <Box sx={{ flex: 1 }}>
              <FormControl fullWidth error={!!currentError}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={handleEndDateChange}
                  disabled={disabled}
                  minDate={startDate}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      error: !!currentError,
                      inputProps: {
                        'aria-label': 'End date',
                        'aria-describedby': currentError ? 'date-range-error' : undefined
                      }
                    }
                  }}
                />
              </FormControl>
            </Box>
          </Box>
          
          {/* Error Message */}
          {currentError && (
            <FormHelperText 
              error 
              id="date-range-error"
              sx={{ fontSize: '0.875rem', mt: 1 }}
            >
              {currentError}
            </FormHelperText>
          )}
          
          {/* Helper Text */}
          {helperText && !currentError && (
            <FormHelperText sx={{ fontSize: '0.875rem', mt: 1 }}>
              {helperText}
            </FormHelperText>
          )}
          
          {/* Preset Buttons */}
          {datePresets.length > 0 && (
            <Box>
              <Typography variant="subtitle2" gutterBottom color="text.secondary">
                Quick Select:
              </Typography>
              
              {isMobile ? (
                // Stack buttons vertically on mobile
                <Stack spacing={1}>
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outlined"
                      size="small"
                      onClick={() => handlePresetClick(preset)}
                      disabled={disabled}
                      fullWidth
                      sx={{
                        justifyContent: 'flex-start',
                        textTransform: 'none'
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Stack>
              ) : (
                // Use button groups on desktop
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {datePresets.map((preset) => (
                    <Button
                      key={preset.label}
                      variant="outlined"
                      size="small"
                      onClick={() => handlePresetClick(preset)}
                      disabled={disabled}
                      sx={{
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 2
                      }}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </Box>
              )}
            </Box>
          )}
          
          {/* Range Information */}
          {maxRange && (
            <Typography variant="caption" color="text.secondary">
              Maximum range: {maxRange} days
            </Typography>
          )}
        </Stack>
      </Paper>
  )
}

export default DateRangeSelector