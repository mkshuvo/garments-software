// Tests for Trial Balance Validation Utilities
import { TrialBalanceFormValidator, ValidationUtils } from '@/utils/trialBalanceValidation';
import { AccountCategoryType } from '@/types/trialBalance';
import { addDays, subDays, subYears } from 'date-fns';

describe('TrialBalanceFormValidator', () => {
  const today = new Date();
  const yesterday = subDays(today, 1);
  const tomorrow = addDays(today, 1);
  const oneYearAgo = subYears(today, 1);

  describe('validateStartDate', () => {
    it('should validate valid start date', () => {
      const result = TrialBalanceFormValidator.validateStartDate(yesterday, today);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null start date', () => {
      const result = TrialBalanceFormValidator.validateStartDate(null, today);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('required');
    });

    it('should reject future start date', () => {
      const result = TrialBalanceFormValidator.validateStartDate(tomorrow, addDays(tomorrow, 1));
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('future');
    });

    it('should reject start date after end date', () => {
      const result = TrialBalanceFormValidator.validateStartDate(today, yesterday);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('after end date');
    });

    it('should warn for very old start dates', () => {
      const result = TrialBalanceFormValidator.validateStartDate(oneYearAgo, today);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].message).toContain('performance');
    });
  });

  describe('validateEndDate', () => {
    it('should validate valid end date', () => {
      const result = TrialBalanceFormValidator.validateEndDate(today, yesterday);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject null end date', () => {
      const result = TrialBalanceFormValidator.validateEndDate(null, yesterday);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('required');
    });

    it('should reject future end date', () => {
      const result = TrialBalanceFormValidator.validateEndDate(tomorrow, today);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('future');
    });

    it('should reject end date before start date', () => {
      const result = TrialBalanceFormValidator.validateEndDate(yesterday, today);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('before start date');
    });
  });

  describe('validateDateRange', () => {
    it('should validate valid date range', () => {
      const dateRange = { startDate: yesterday, endDate: today };
      const result = TrialBalanceFormValidator.validateDateRange(dateRange);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject date range exceeding 365 days', () => {
      const startDate = subDays(today, 400);
      const dateRange = { startDate, endDate: today };
      const result = TrialBalanceFormValidator.validateDateRange(dateRange);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('365 days'))).toBe(true);
    });

    it('should warn for large date ranges', () => {
      const startDate = subDays(today, 100);
      const dateRange = { startDate, endDate: today };
      const result = TrialBalanceFormValidator.validateDateRange(dateRange);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('longer to process'))).toBe(true);
    });

    it('should warn for single day ranges', () => {
      const dateRange = { startDate: today, endDate: today };
      const result = TrialBalanceFormValidator.validateDateRange(dateRange);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings.some(w => w.message.includes('limited data'))).toBe(true);
    });

    it('should combine individual date validation errors', () => {
      const dateRange = { startDate: tomorrow, endDate: addDays(tomorrow, 1) };
      const result = TrialBalanceFormValidator.validateDateRange(dateRange);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateTrialBalanceRequest', () => {
    it('should validate valid request', () => {
      const request = {
        startDate: yesterday.toISOString(),
        endDate: today.toISOString(),
        groupByCategory: true,
        includeZeroBalances: false
      };
      
      const result = TrialBalanceFormValidator.validateTrialBalanceRequest(request);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject request without start date', () => {
      const request = {
        endDate: today.toISOString(),
        groupByCategory: true,
        includeZeroBalances: false
      };
      
      const result = TrialBalanceFormValidator.validateTrialBalanceRequest(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'startDate')).toBe(true);
    });

    it('should reject request without end date', () => {
      const request = {
        startDate: yesterday.toISOString(),
        groupByCategory: true,
        includeZeroBalances: false
      };
      
      const result = TrialBalanceFormValidator.validateTrialBalanceRequest(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'endDate')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      const request = {
        startDate: 'invalid-date',
        endDate: 'also-invalid',
        groupByCategory: true,
        includeZeroBalances: false
      };
      
      const result = TrialBalanceFormValidator.validateTrialBalanceRequest(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.message.includes('Invalid start date format'))).toBe(true);
      expect(result.errors.some(e => e.message.includes('Invalid end date format'))).toBe(true);
    });

    it('should validate category filter', () => {
      const request = {
        startDate: yesterday.toISOString(),
        endDate: today.toISOString(),
        categoryFilter: [AccountCategoryType.ASSETS, AccountCategoryType.LIABILITIES]
      };
      
      const result = TrialBalanceFormValidator.validateTrialBalanceRequest(request);
      
      expect(result.isValid).toBe(true);
    });

    it('should reject invalid category filter', () => {
      const request = {
        startDate: yesterday.toISOString(),
        endDate: today.toISOString(),
        categoryFilter: ['InvalidCategory', 'AnotherInvalid']
      };
      
      const result = TrialBalanceFormValidator.validateTrialBalanceRequest(request);
      
      expect(result.isValid).toBe(false);
      expect(result.errors.some(e => e.field === 'categoryFilter')).toBe(true);
    });
  });
});

describe('ValidationUtils', () => {
  const mockValidationResult = {
    isValid: false,
    errors: [
      { field: 'startDate', message: 'Start date is required' },
      { field: 'endDate', message: 'End date is required' }
    ],
    warnings: [
      { field: 'dateRange', message: 'Large date range may affect performance' }
    ]
  };

  describe('formatErrorsForForm', () => {
    it('should format errors for form display', () => {
      const formatted = ValidationUtils.formatErrorsForForm(mockValidationResult);
      
      expect(formatted).toEqual({
        startDate: 'Start date is required',
        endDate: 'End date is required'
      });
    });

    it('should handle empty errors', () => {
      const result = { isValid: true, errors: [], warnings: [] };
      const formatted = ValidationUtils.formatErrorsForForm(result);
      
      expect(formatted).toEqual({});
    });
  });

  describe('hasFieldError', () => {
    it('should detect field errors', () => {
      expect(ValidationUtils.hasFieldError(mockValidationResult, 'startDate')).toBe(true);
      expect(ValidationUtils.hasFieldError(mockValidationResult, 'nonexistent')).toBe(false);
    });
  });

  describe('getFieldError', () => {
    it('should return field error message', () => {
      expect(ValidationUtils.getFieldError(mockValidationResult, 'startDate')).toBe('Start date is required');
      expect(ValidationUtils.getFieldError(mockValidationResult, 'nonexistent')).toBeUndefined();
    });
  });

  describe('getFieldWarning', () => {
    it('should return field warning message', () => {
      expect(ValidationUtils.getFieldWarning(mockValidationResult, 'dateRange')).toBe('Large date range may affect performance');
      expect(ValidationUtils.getFieldWarning(mockValidationResult, 'nonexistent')).toBeUndefined();
    });
  });

  describe('combineResults', () => {
    it('should combine multiple validation results', () => {
      const result1 = {
        isValid: false,
        errors: [{ field: 'field1', message: 'Error 1' }],
        warnings: []
      };
      
      const result2 = {
        isValid: true,
        errors: [],
        warnings: [{ field: 'field2', message: 'Warning 1' }]
      };
      
      const combined = ValidationUtils.combineResults(result1, result2);
      
      expect(combined.isValid).toBe(false);
      expect(combined.errors).toHaveLength(1);
      expect(combined.warnings).toHaveLength(1);
    });

    it('should be valid only when all results are valid', () => {
      const result1 = { isValid: true, errors: [], warnings: [] };
      const result2 = { isValid: true, errors: [], warnings: [] };
      const result3 = { isValid: false, errors: [{ field: 'test', message: 'Error' }], warnings: [] };
      
      const combined = ValidationUtils.combineResults(result1, result2, result3);
      
      expect(combined.isValid).toBe(false);
    });
  });
});