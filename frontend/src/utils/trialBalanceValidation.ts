// Enhanced Trial Balance Validation Utilities
import { ValidationRules, ValidationContext, ValidationResult, ValidationRule } from '@/services/validationService';
import { DateRange, TrialBalanceRequestDto, AccountCategoryType } from '@/types/trialBalance';
import { differenceInDays, isAfter, isBefore, startOfDay, endOfDay } from 'date-fns';

/**
 * Enhanced validation rules specific to trial balance functionality
 */
export class TrialBalanceValidationRules {
  /**
   * Validate date range for trial balance reports
   */
  static dateRange(options: {
    maxRangeDays?: number;
    allowFutureDates?: boolean;
    minDate?: Date;
    maxDate?: Date;
  } = {}): ValidationRule {
    const {
      maxRangeDays = 365,
      allowFutureDates = false,
      minDate,
      maxDate
    } = options;

    return ValidationRules.custom(
      (value: unknown) => {
        if (!value || typeof value !== 'object') return false;
        
        const dateRange = value as DateRange;
        
        // Check if both dates are provided
        if (!dateRange.startDate || !dateRange.endDate) return false;
        
        // Check if dates are valid
        if (!(dateRange.startDate instanceof Date) || !(dateRange.endDate instanceof Date)) return false;
        if (isNaN(dateRange.startDate.getTime()) || isNaN(dateRange.endDate.getTime())) return false;
        
        // Check if start date is not after end date
        if (isAfter(dateRange.startDate, dateRange.endDate)) return false;
        
        // Check future dates if not allowed
        if (!allowFutureDates) {
          const today = endOfDay(new Date());
          if (isAfter(dateRange.startDate, today) || isAfter(dateRange.endDate, today)) return false;
        }
        
        // Check minimum date constraint
        if (minDate && isBefore(dateRange.startDate, startOfDay(minDate))) return false;
        
        // Check maximum date constraint
        if (maxDate && isAfter(dateRange.endDate, endOfDay(maxDate))) return false;
        
        // Check maximum range
        const daysDiff = differenceInDays(dateRange.endDate, dateRange.startDate);
        if (daysDiff > maxRangeDays) return false;
        
        return true;
      },
      'Invalid date range. Please ensure dates are valid, start date is not after end date, and range does not exceed limits.',
      'DATE_RANGE_VALIDATION'
    );
  }

  /**
   * Validate individual date inputs
   */
  static dateInput(options: {
    allowFuture?: boolean;
    minDate?: Date;
    maxDate?: Date;
    required?: boolean;
  } = {}): ValidationRule {
    const {
      allowFuture = false,
      minDate,
      maxDate,
      required = true
    } = options;

    return ValidationRules.custom(
      (value: unknown) => {
        // Handle required validation
        if (required && (!value || value === '')) return false;
        if (!required && (!value || value === '')) return true;
        
        // Parse date
        let date: Date;
        if (value instanceof Date) {
          date = value;
        } else if (typeof value === 'string') {
          date = new Date(value);
        } else {
          return false;
        }
        
        // Check if date is valid
        if (isNaN(date.getTime())) return false;
        
        // Check future dates
        if (!allowFuture && isAfter(date, endOfDay(new Date()))) return false;
        
        // Check minimum date
        if (minDate && isBefore(date, startOfDay(minDate))) return false;
        
        // Check maximum date
        if (maxDate && isAfter(date, endOfDay(maxDate))) return false;
        
        return true;
      },
      'Please enter a valid date within the allowed range.',
      'DATE_INPUT_VALIDATION'
    );
  }

  /**
   * Validate account category filter
   */
  static categoryFilter(): ValidationRule {
    return ValidationRules.custom(
      (value: unknown) => {
        if (!value) return true; // Optional field
        
        if (!Array.isArray(value)) return false;
        
        // Check if all values are valid account category types
        return value.every(category => 
          typeof category === 'string' && 
          Object.values(AccountCategoryType).includes(category as AccountCategoryType)
        );
      },
      'Invalid account category selection. Please select valid categories.',
      'CATEGORY_FILTER_VALIDATION'
    );
  }

  /**
   * Validate export format selection
   */
  static exportFormat(): ValidationRule {
    const validFormats = ['pdf', 'csv'];
    
    return ValidationRules.custom(
      (value: unknown) => {
        if (!value) return false;
        return typeof value === 'string' && validFormats.includes(value.toLowerCase());
      },
      'Please select a valid export format (PDF or CSV).',
      'EXPORT_FORMAT_VALIDATION'
    );
  }

  /**
   * Validate comparison periods (for period comparison feature)
   */
  static comparisonPeriods(): ValidationRule {
    return ValidationRules.custom(
      (value: unknown) => {
        if (!value || typeof value !== 'object') return false;
        
        const periods = value as { period1: DateRange; period2: DateRange };
        
        // Validate both periods individually
        if (!periods.period1 || !periods.period2) return false;
        
        // Both periods should be valid date ranges
        const period1Valid = TrialBalanceFormValidator.validateDateRange(periods.period1).isValid;
        const period2Valid = TrialBalanceFormValidator.validateDateRange(periods.period2).isValid;
        
        if (!period1Valid || !period2Valid) return false;
        
        // Periods should not overlap for meaningful comparison
        const period1End = periods.period1.endDate;
        const period2Start = periods.period2.startDate;
        const period2End = periods.period2.endDate;
        const period1Start = periods.period1.startDate;
        
        // Check for overlap
        const hasOverlap = (
          (period1Start <= period2End && period2Start <= period1End) ||
          (period2Start <= period1End && period1Start <= period2End)
        );
        
        return !hasOverlap;
      },
      'Comparison periods should not overlap for meaningful analysis.',
      'COMPARISON_PERIODS_VALIDATION'
    );
  }
}

/**
 * Pre-configured validation contexts for trial balance forms
 */
export const TrialBalanceFormValidation = new ValidationContext()
  .addRule('startDate', TrialBalanceValidationRules.dateInput({ required: true }))
  .addRule('endDate', TrialBalanceValidationRules.dateInput({ required: true }))
  .addRule('dateRange', TrialBalanceValidationRules.dateRange())
  .addRule('categoryFilter', TrialBalanceValidationRules.categoryFilter());

export const TrialBalanceExportValidation = new ValidationContext()
  .addRule('format', TrialBalanceValidationRules.exportFormat())
  .addRule('dateRange', TrialBalanceValidationRules.dateRange());

export const TrialBalanceComparisonValidation = new ValidationContext()
  .addRule('periods', TrialBalanceValidationRules.comparisonPeriods());

/**
 * Real-time validation functions for form fields
 */
export class TrialBalanceFormValidator {
  /**
   * Validate start date in real-time
   */
  static validateStartDate(startDate: Date | null, endDate?: Date | null): ValidationResult {
    if (!startDate) {
      return {
        isValid: false,
        errors: [{ field: 'startDate', message: 'Start date is required' }],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Check if date is in the future
    if (isAfter(startDate, new Date())) {
      errors.push({
        field: 'startDate',
        message: 'Start date cannot be in the future'
      });
    }

    // Check if start date is after end date
    if (endDate && isAfter(startDate, endDate)) {
      errors.push({
        field: 'startDate',
        message: 'Start date cannot be after end date'
      });
    }

    // Warning for very old dates
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (isBefore(startDate, oneYearAgo)) {
      warnings.push({
        field: 'startDate',
        message: 'Start date is more than one year ago. This may affect performance.'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate end date in real-time
   */
  static validateEndDate(endDate: Date | null, startDate?: Date | null): ValidationResult {
    if (!endDate) {
      return {
        isValid: false,
        errors: [{ field: 'endDate', message: 'End date is required' }],
        warnings: []
      };
    }

    const errors = [];
    const warnings = [];

    // Check if date is in the future
    if (isAfter(endDate, new Date())) {
      errors.push({
        field: 'endDate',
        message: 'End date cannot be in the future'
      });
    }

    // Check if end date is before start date
    if (startDate && isBefore(endDate, startDate)) {
      errors.push({
        field: 'endDate',
        message: 'End date cannot be before start date'
      });
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate date range in real-time
   */
  static validateDateRange(dateRange: DateRange): ValidationResult {
    const errors = [];
    const warnings = [];

    // Validate individual dates first
    const startDateResult = this.validateStartDate(dateRange.startDate, dateRange.endDate);
    const endDateResult = this.validateEndDate(dateRange.endDate, dateRange.startDate);

    errors.push(...startDateResult.errors, ...endDateResult.errors);
    warnings.push(...startDateResult.warnings, ...endDateResult.warnings);

    // Additional range-specific validations
    if (startDateResult.isValid && endDateResult.isValid) {
      const daysDiff = differenceInDays(dateRange.endDate, dateRange.startDate);

      // Check maximum range
      if (daysDiff > 365) {
        errors.push({
          field: 'dateRange',
          message: 'Date range cannot exceed 365 days for performance reasons'
        });
      }

      // Warning for large ranges
      if (daysDiff > 90) {
        warnings.push({
          field: 'dateRange',
          message: 'Large date ranges may take longer to process'
        });
      }

      // Warning for very small ranges
      if (daysDiff < 1) {
        warnings.push({
          field: 'dateRange',
          message: 'Single day reports may have limited data'
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate trial balance request DTO
   */
  static validateTrialBalanceRequest(request: Partial<TrialBalanceRequestDto>): ValidationResult {
    const errors = [];
    const warnings = [];

    // Validate required fields
    if (!request.startDate) {
      errors.push({ field: 'startDate', message: 'Start date is required' });
    }

    if (!request.endDate) {
      errors.push({ field: 'endDate', message: 'End date is required' });
    }

    // Validate date format if provided
    if (request.startDate) {
      const startDate = new Date(request.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push({ field: 'startDate', message: 'Invalid start date format' });
      }
    }

    if (request.endDate) {
      const endDate = new Date(request.endDate);
      if (isNaN(endDate.getTime())) {
        errors.push({ field: 'endDate', message: 'Invalid end date format' });
      }
    }

    // Validate date range if both dates are valid
    if (request.startDate && request.endDate) {
      const startDate = new Date(request.startDate);
      const endDate = new Date(request.endDate);

      if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        const rangeResult = this.validateDateRange({ startDate, endDate });
        errors.push(...rangeResult.errors);
        warnings.push(...rangeResult.warnings);
      }
    }

    // Validate category filter if provided
    if (request.categoryFilter && Array.isArray(request.categoryFilter)) {
      const invalidCategories = request.categoryFilter.filter(
        category => !Object.values(AccountCategoryType).includes(category as AccountCategoryType)
      );

      if (invalidCategories.length > 0) {
        errors.push({
          field: 'categoryFilter',
          message: `Invalid category types: ${invalidCategories.join(', ')}`
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

/**
 * Utility functions for validation error handling
 */
export const ValidationUtils = {
  /**
   * Format validation errors for display in forms
   */
  formatErrorsForForm(result: ValidationResult): Record<string, string> {
    const formattedErrors: Record<string, string> = {};
    
    result.errors.forEach(error => {
      if (!formattedErrors[error.field]) {
        formattedErrors[error.field] = error.message;
      }
    });

    return formattedErrors;
  },

  /**
   * Check if a specific field has errors
   */
  hasFieldError(result: ValidationResult, fieldName: string): boolean {
    return result.errors.some(error => error.field === fieldName);
  },

  /**
   * Get error message for a specific field
   */
  getFieldError(result: ValidationResult, fieldName: string): string | undefined {
    const error = result.errors.find(error => error.field === fieldName);
    return error?.message;
  },

  /**
   * Get warning message for a specific field
   */
  getFieldWarning(result: ValidationResult, fieldName: string): string | undefined {
    const warning = result.warnings.find(warning => warning.field === fieldName);
    return warning?.message;
  },

  /**
   * Combine multiple validation results
   */
  combineResults(...results: ValidationResult[]): ValidationResult {
    return {
      isValid: results.every(result => result.isValid),
      errors: results.flatMap(result => result.errors),
      warnings: results.flatMap(result => result.warnings)
    };
  }
};