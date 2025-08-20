// Test script to verify enhanced validation error logging
const { ErrorHandler, ErrorCategory, ErrorSeverity } = require('./src/utils/errorHandling');

// Mock validation errors
const mockValidationErrors = [
  { field: 'startDate', message: 'Start date cannot be in the future' },
  { field: 'endDate', message: 'End date must be after start date' }
];

// Mock context
const mockContext = {
  dateRange: {
    startDate: '2025-01-01',
    endDate: '2024-12-31'
  },
  userId: 'test-user',
  component: 'TrialBalanceReport'
};

console.log('Testing enhanced validation error logging...');

// Create validation error
const enhancedError = ErrorHandler.handleValidationError(mockValidationErrors, mockContext);

console.log('Enhanced error created:');
console.log('Code:', enhancedError.code);
console.log('Category:', enhancedError.category);
console.log('User Message:', enhancedError.userMessage);
console.log('Context keys:', Object.keys(enhancedError.context || {}));
console.log('Details keys:', Object.keys(enhancedError.details || {}));

if (enhancedError.details) {
  console.log('Validation Error Count:', enhancedError.details.validationErrorCount);
  console.log('Affected Fields:', enhancedError.details.affectedFields);
  console.log('Validation Messages:', enhancedError.details.validationMessages);
}

console.log('Test completed.');