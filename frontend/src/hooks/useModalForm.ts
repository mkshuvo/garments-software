'use client';

import { useState, useCallback, useEffect, useRef } from 'react';

interface UseModalFormOptions<T> {
  initialValues: T;
  onSubmit: (values: T) => Promise<void> | void;
  onClose?: () => void;
  resetOnClose?: boolean;
  resetOnSubmit?: boolean;
}

interface UseModalFormReturn<T> {
  values: T;
  errors: Record<keyof T, string>;
  isSubmitting: boolean;
  isDirty: boolean;
  setValue: (field: keyof T, value: T[keyof T]) => void;
  setValues: (values: Partial<T>) => void;
  setError: (field: keyof T, error: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
  handleSubmit: () => Promise<void>;
  handleClose: () => void;
  reset: () => void;
}

export const useModalForm = <T extends Record<string, unknown>>({
  initialValues,
  onSubmit,
  onClose,
  resetOnClose = true,
  resetOnSubmit = true
}: UseModalFormOptions<T>): UseModalFormReturn<T> => {
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const setValue = useCallback((field: keyof T, value: T[keyof T]) => {
    setValuesState(prev => ({
      ...prev,
      [field]: value
    }));
    setIsDirty(true);
    
    // Clear error for this field when value changes
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, [errors]);

  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
    setIsDirty(true);
  }, []);

  const setError = useCallback((field: keyof T, error: string) => {
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>);
  }, []);

  const reset = useCallback(() => {
    setValuesState(initialValues);
    setErrors({} as Record<keyof T, string>);
    setIsDirty(false);
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    clearAllErrors();
    
    try {
      await onSubmit(values);
      if (resetOnSubmit) {
        reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle submission errors here if needed
    } finally {
      setIsSubmitting(false);
    }
  }, [values, onSubmit, resetOnSubmit, reset, clearAllErrors]);

  const handleClose = useCallback(() => {
    if (resetOnClose) {
      reset();
    }
    onClose?.();
  }, [reset, resetOnClose, onClose]);

  // Use ref to track previous initialValues to prevent infinite re-renders
  const prevInitialValuesRef = useRef<T>(initialValues);
  
  // Reset form when initialValues change (for edit mode)
  useEffect(() => {
    // Deep comparison to prevent unnecessary updates
    const hasChanged = JSON.stringify(prevInitialValuesRef.current) !== JSON.stringify(initialValues);
    
    if (hasChanged) {
      setValuesState(initialValues);
      setIsDirty(false);
      prevInitialValuesRef.current = initialValues;
    }
  }, [initialValues]);

  return {
    values,
    errors,
    isSubmitting,
    isDirty,
    setValue,
    setValues,
    setError,
    clearError,
    clearAllErrors,
    handleSubmit,
    handleClose,
    reset
  };
};

export default useModalForm;