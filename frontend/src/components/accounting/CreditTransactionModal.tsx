'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Stack,
  Autocomplete,
  Typography,
  Alert
} from '@mui/material';
import {
  Save as SaveIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Modal } from '@/components/ui/Modal';
import { useModalForm } from '@/hooks/useModalForm';
import { Category as CategoryModel } from '@/services/categoryService';

interface CreditTransaction {
  id: string;
  date: Date;
  categoryName: string;
  particulars: string;
  amount: number;
  contactName?: string;
}

interface Contact {
  id: string;
  name: string;
  contactType: 'Customer' | 'Supplier' | 'Both';
}

interface CreditTransactionModalProps {
  isOpen: boolean;
  transaction?: CreditTransaction;
  categories: CategoryModel[];
  contacts: Contact[];
  onSave: (transaction: CreditTransaction) => void;
  onCancel: () => void;
}

const initialFormValues: Omit<CreditTransaction, 'id'> = {
  date: new Date(),
  categoryName: '',
  particulars: '',
  amount: 0,
  contactName: ''
};

export const CreditTransactionModal: React.FC<CreditTransactionModalProps> = ({
  isOpen,
  transaction,
  categories,
  contacts,
  onSave,
  onCancel
}) => {
  const [formErrors, setFormErrors] = useState<string[]>([]);
  
  // Initialize form values based on whether we're editing or creating
  const getInitialValues = () => {
    if (transaction) {
      return {
        date: transaction.date,
        categoryName: transaction.categoryName,
        particulars: transaction.particulars,
        amount: transaction.amount,
        contactName: transaction.contactName || ''
      };
    }
    return initialFormValues;
  };

  const {
    values,
    errors,
    isSubmitting,
    isDirty,
    setValue,
    setError,
    clearAllErrors,
    handleSubmit,
    handleClose,
    reset
  } = useModalForm({
    initialValues: getInitialValues(),
    onSubmit: async (formValues) => {
      try {
        // Clear any previous errors
        setFormErrors([]);
        clearAllErrors();

        // Validate form
        const validationErrors = validateForm(formValues);
        if (validationErrors.length > 0) {
          setFormErrors(validationErrors);
          throw new Error('Validation failed');
        }

        // Create transaction object
        const transactionData: CreditTransaction = {
          id: transaction?.id || Date.now().toString(),
          date: formValues.date,
          categoryName: formValues.categoryName.trim(),
          particulars: formValues.particulars.trim(),
          amount: Number(formValues.amount),
          contactName: formValues.contactName?.trim() || undefined
        };

        // Call parent save handler
        await onSave(transactionData);
        
        // Success - modal will be closed by parent component
      } catch (error) {
        // If validation failed, don't close modal
        if (error instanceof Error && error.message === 'Validation failed') {
          return;
        }
        
        // Handle other errors
        setFormErrors(['Failed to save transaction. Please try again.']);
        throw error;
      }
    },
    onClose: onCancel,
    resetOnClose: true,
    resetOnSubmit: !transaction // Only reset on submit if creating new transaction
  });

  // Reset form when modal opens/closes or transaction changes
  useEffect(() => {
    if (isOpen) {
      // Reset form with appropriate initial values
      reset();
      setFormErrors([]);
      clearAllErrors();
    } else {
      // Clear form when modal closes
      setFormErrors([]);
      clearAllErrors();
    }
  }, [isOpen, transaction, reset, clearAllErrors]);

  const validateForm = (formValues: typeof values): string[] => {
    const errors: string[] = [];

    if (!formValues.date) {
      errors.push('Date is required');
    }

    if (!formValues.categoryName.trim()) {
      errors.push('Category is required');
    }

    if (!formValues.particulars.trim()) {
      errors.push('Particulars is required');
    }

    if (!formValues.amount || formValues.amount <= 0) {
      errors.push('Amount must be greater than zero');
    }

    // Validate that the category exists in credit categories
    if (formValues.categoryName && categories.length > 0) {
      const categoryExists = categories.some(c => c.name === formValues.categoryName);
      if (!categoryExists) {
        errors.push(`"${formValues.categoryName}" is not a valid Credit category`);
      }
    }

    return errors;
  };

  // Real-time field validation
  const validateField = (fieldName: keyof typeof values, value: string | number | Date) => {
    switch (fieldName) {
      case 'date':
        if (!value) {
          setError('date', 'Date is required');
        }
        break;
      case 'categoryName':
        if (!value || (typeof value === 'string' && !value.trim())) {
          setError('categoryName', 'Category is required');
        } else if (categories.length > 0 && typeof value === 'string') {
          const categoryExists = categories.some(c => c.name === value);
          if (!categoryExists) {
            setError('categoryName', `"${value}" is not a valid Credit category`);
          }
        }
        break;
      case 'particulars':
        if (!value || (typeof value === 'string' && !value.trim())) {
          setError('particulars', 'Particulars is required');
        }
        break;
      case 'amount':
        if (!value || value === 0) {
          setError('amount', 'Amount is required');
        } else if (typeof value === 'number') {
          if (isNaN(value)) {
            setError('amount', 'Amount must be a valid number');
          } else if (value <= 0) {
            setError('amount', 'Amount must be greater than zero');
          } else if (value > 999999999) {
            setError('amount', 'Amount is too large');
          }
        }
        break;
    }
  };

  // Enhanced setValue with real-time validation
  const setValueWithValidation = (field: keyof typeof values, value: string | number | Date) => {
    setValue(field, value as typeof values[typeof field]);
    // Validate field immediately without setTimeout to avoid test hanging
    validateField(field, value);
  };

  const handleCancel = useCallback(() => {
    // Check if form has meaningful changes (not just default values)
    const hasChanges = isDirty && (
      values.categoryName.trim() !== '' ||
      values.particulars.trim() !== '' ||
      values.amount > 0 ||
      (values.contactName && values.contactName.trim() !== '') ||
      (transaction && (
        values.date.getTime() !== transaction.date.getTime() ||
        values.categoryName !== transaction.categoryName ||
        values.particulars !== transaction.particulars ||
        values.amount !== transaction.amount ||
        values.contactName !== (transaction.contactName || '')
      ))
    );

    if (hasChanges) {
      const confirmClose = window.confirm(
        'You have unsaved changes. Are you sure you want to close without saving?'
      );
      if (!confirmClose) return;
    }
    
    // Clear any errors and close
    setFormErrors([]);
    clearAllErrors();
    handleClose();
  }, [isDirty, values, transaction, clearAllErrors, handleClose]);

  // Check if form is valid for enabling/disabling save button
  const isFormValid = useCallback(() => {
    return values.date && 
           values.categoryName.trim() && 
           values.particulars.trim() && 
           values.amount > 0 && 
           Object.keys(errors).length === 0;
  }, [values, errors]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    // Ctrl+S or Cmd+S to save
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault();
      if (isFormValid() && !isSubmitting) {
        handleSubmit();
      }
    }
    
    // Escape to cancel (if not disabled)
    if (event.key === 'Escape' && !isDirty) {
      event.preventDefault();
      handleCancel();
    }
  }, [isOpen, isFormValid, isSubmitting, handleSubmit, isDirty, handleCancel]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const modalActions = (
    <>
      <Button
        variant="outlined"
        onClick={handleCancel}
        disabled={isSubmitting}
        startIcon={<CancelIcon />}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={handleSubmit}
        disabled={isSubmitting || !isFormValid()}
        startIcon={<SaveIcon />}
      >
        {isSubmitting ? 'Saving...' : 'Save Credit Transaction'}
      </Button>
    </>
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Modal
        open={isOpen}
        onClose={handleCancel}
        title={transaction ? 'Edit Credit Transaction' : 'Add Credit Transaction'}
        actions={modalActions}
        maxWidth="md"
        disableBackdropClick={isDirty}
        disableEscapeKeyDown={isDirty}
      >
        <Box sx={{ minWidth: 400 }}>
          {/* Form Errors */}
          {formErrors.length > 0 && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Please fix the following errors:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {formErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Loading State */}
          {isSubmitting && (
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                Saving credit transaction...
              </Typography>
            </Alert>
          )}

          <Stack spacing={3}>
            {/* Date and Amount Row */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <Box sx={{ flex: 1 }}>
                <DatePicker
                  label="Transaction Date"
                  value={values.date}
                  onChange={(date) => setValueWithValidation('date', date || new Date())}
                  slotProps={{ 
                    textField: { 
                      fullWidth: true,
                      error: !!errors.date,
                      helperText: errors.date || 'Select the transaction date'
                    } 
                  }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <TextField
                  fullWidth
                  label="Amount (৳)"
                  type="number"
                  value={values.amount || ''}
                  onChange={(e) => {
                    const numValue = parseFloat(e.target.value) || 0;
                    setValueWithValidation('amount', numValue);
                  }}
                  onBlur={(e) => {
                    const numValue = parseFloat(e.target.value) || 0;
                    validateField('amount', numValue);
                  }}
                  error={!!errors.amount}
                  helperText={errors.amount || 'Enter the credit amount (must be positive)'}
                  InputProps={{ 
                    inputProps: { min: 0, step: 0.01 } 
                  }}
                />
              </Box>
            </Stack>

            {/* Category Selection */}
            <Autocomplete
              freeSolo
              options={categories.map(c => c.name)}
              value={values.categoryName}
              onChange={(_, value) => setValueWithValidation('categoryName', value || '')}
              onInputChange={(_, value) => setValueWithValidation('categoryName', value || '')}
              onBlur={() => validateField('categoryName', values.categoryName)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Credit Category"
                  placeholder="e.g., Loan A/C Chairman, Received: Customer Name"
                  error={!!errors.categoryName}
                  helperText={errors.categoryName || 'Select or type a credit category (required)'}
                  required
                />
              )}
              renderOption={(props, option) => {
                const category = categories.find(c => c.name === option);
                const { key, ...otherProps } = props;
                return (
                  <li key={key} {...otherProps}>
                    <Box>
                      <Typography variant="body2">{option}</Typography>
                      {category?.description && (
                        <Typography variant="caption" color="text.secondary">
                          {category.description}
                        </Typography>
                      )}
                    </Box>
                  </li>
                );
              }}
            />

            {/* Particulars */}
            <TextField
              fullWidth
              label="Particulars"
              multiline
              rows={2}
              value={values.particulars}
              onChange={(e) => setValueWithValidation('particulars', e.target.value)}
              onBlur={(e) => validateField('particulars', e.target.value)}
              error={!!errors.particulars}
              helperText={errors.particulars || 'Describe the transaction details (required)'}
              placeholder="Transaction description"
              required
            />

            {/* Contact Selection (Optional) */}
            <Autocomplete
              freeSolo
              options={contacts.map(c => c.name)}
              value={values.contactName || ''}
              onChange={(_, value) => setValue('contactName', value || '')}
              onInputChange={(_, value) => setValue('contactName', value || '')}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Contact (Optional)"
                  placeholder="Customer or supplier name"
                  error={!!errors.contactName}
                  helperText={errors.contactName || 'Optional: Select or type a contact name'}
                />
              )}
              renderOption={(props, option) => {
                const contact = contacts.find(c => c.name === option);
                return (
                  <li {...props}>
                    <Box>
                      <Typography variant="body2">{option}</Typography>
                      {contact && (
                        <Typography variant="caption" color="text.secondary">
                          {contact.contactType}
                        </Typography>
                      )}
                    </Box>
                  </li>
                );
              }}
            />
          </Stack>

          {/* Help Text */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.dark">
              💡 <strong>Credit Transaction:</strong> Money received or income. 
              This increases your cash balance or represents money coming into the business.
            </Typography>
            <Typography variant="caption" color="info.dark" sx={{ mt: 1, display: 'block' }}>
              💾 <strong>Tip:</strong> Use Ctrl+S (Cmd+S on Mac) to save quickly
            </Typography>
          </Box>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
};

export default CreditTransactionModal;