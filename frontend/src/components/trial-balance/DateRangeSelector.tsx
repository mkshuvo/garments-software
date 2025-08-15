'use client'

import React, { useState, useCallback, useMemo, useEffect } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  Paper,
  Stack,
  Typography,
  useTheme,
  useMediaQuery,
  Alert,
  Fade,
  Tooltip
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
  differenceInDays,
  format
} from 'date-fns'
import { DateRangePreset } from '@/types/trialBalance'
import { TrialBalanceFormValidator, ValidationUtils } from '@/utils/trialBalanceValidation'
import { ValidationResult } from '@/services/validationService'

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
  
  // Enhanced validation state
  const [validationResult, setValidationResult] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  })
  const [startDateValidation, setStartDateValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  })
  const [endDateValidation, setEndDateValidation] = useState<ValidationResult>({
    isValid: true,
    errors: [],
    warnings: []
  })
  
  // Enhanced validation function
  const validateDateRange = useCallback((start: Date, end: Date): ValidationResult => {
    const result = TrialBalanceFormValidator.validateDateRange({ startDate: start, endDate: end })
    
    // Add maxRange validation if specified
    if (maxRange && result.isValid) {
      const daysDiff = differenceInDays(end, start)
      if (daysDiff > maxRange) {
        result.errors.push({
          field: 'dateRange',
          message: `Date range cannot exceed ${maxRange} days`
        })
        result.isValid = false
      }
    }
    
    return result
  }, [maxRange])
  
  // Validate individual dates
  const validateStartDate = useCallback((date: Date): ValidationResult => {
    return TrialBalanceFormValidator.validateStartDate(date, endDate)
  }, [endDate])
  
  const validateEndDate = useCallback((date: Date): ValidationResult => {
    return TrialBalanceFormValidator.validateEndDate(date, startDate)
  }, [startDate])
  
  // Validate on prop changes
  useEffect(() => {
    const rangeResult = validateDateRange(startDate, endDate)
    const startResult = validateStartDate(startDate)
    const endResult = validateEndDate(endDate)
    
    setValidationResult(rangeResult)
    setStartDateValidation(startResult)
    setEndDateValidation(endResult)
  }, [startDate, endDate, validateDateRange, validateStartDate, validateEndDate])
  
  // Handle start date change with enhanced validation
  const handleStartDateChange = useCallback((newStartDate: Date | null) => {
    if (!newStartDate) return
    
    // Validate the new start date
    const startResult = TrialBalanceFormValidator.validateStartDate(newStartDate, endDate)
    const rangeResult = validateDateRange(newStartDate, endDate)
    
    setStartDateValidation(startResult)
    setValidationResult(rangeResult)
    
    // Always call onDateChange to allow parent to handle validation
    onDateChange(newStartDate, endDate)
  }, [endDate, onDateChange, validateDateRange])
  
  // Handle end date change with enhanced validation
  const handleEndDateChange = useCallback((newEndDate: Date | null) => {
    if (!newEndDate) return
    
    // Validate the new end date
    const endResult = TrialBalanceFormValidator.validateEndDate(newEndDate, startDate)
    const rangeResult = validateDateRange(startDate, newEndDate)
    
    setEndDateValidation(endResult)
    setValidationResult(rangeResult)
    
    // Always call onDateChange to allow parent to handle validation
    onDateChange(startDate, newEndDate)
  }, [startDate, onDateChange, validateDateRange])
  
  // Handle preset selection with enhanced validation
  const handlePresetClick = useCallback((preset: DateRangePreset) => {
    const rangeResult = validateDateRange(preset.startDate, preset.endDate)
    const startResult = TrialBalanceFormValidator.validateStartDate(preset.startDate, preset.endDate)
    const endResult = TrialBalanceFormValidator.validateEndDate(preset.endDate, preset.startDate)
    
    setValidationResult(rangeResult)
    setStartDateValidation(startResult)
    setEndDateValidation(endResult)
    
    // Always call onDateChange to allow parent to handle validation
    onDateChange(preset.startDate, preset.endDate)
  }, [onDateChange, validateDateRange])
  
  // Get current error and warning messages
  const hasValidationErrors = !validationResult.isValid || !startDateValidation.isValid || !endDateValidation.isValid
  const hasValidationWarnings = validationResult.warnings.length > 0 || startDateValidation.warnings.length > 0 || endDateValidation.warnings.length > 0
  const currentError = error || (hasValidationErrors ? ValidationUtils.getFieldError(validationResult, 'dateRange') || ValidationUtils.getFieldError(startDateValidation, 'startDate') || ValidationUtils.getFieldError(endDateValidation, 'endDate') : undefined)
  
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
            <Tooltip 
              title="Select the beginning date for your trial balance report"
              arrow
              placement="top"
            >
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
            </Tooltip>
            
            <Tooltip 
              title="Select the ending date for your trial balance report"
              arrow
              placement="top"
            >
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
            </Tooltip>
          </Box>
          
          {/* Error Messages */}
          {currentError && (
            <Fade in={true}>
              <Alert severity="error" sx={{ mt: 2 }}>
                {currentError}
              </Alert>
            </Fade>
          )}
          
          {/* Warning Messages */}
          {!currentError && hasValidationWarnings && (
            <Fade in={true}>
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Stack spacing={1}>
                  {validationResult.warnings.map((warning, index) => (
                    <Typography key={`range-${index}`} variant="body2">
                      {warning.message}
                    </Typography>
                  ))}
                  {startDateValidation.warnings.map((warning, index) => (
                    <Typography key={`start-${index}`} variant="body2">
                      <strong>Start Date:</strong> {warning.message}
                    </Typography>
                  ))}
                  {endDateValidation.warnings.map((warning, index) => (
                    <Typography key={`end-${index}`} variant="body2">
                      <strong>End Date:</strong> {warning.message}
                    </Typography>
                  ))}
                </Stack>
              </Alert>
            </Fade>
          )}
          
          {/* Helper Text */}
          {helperText && !currentError && !hasValidationWarnings && (
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