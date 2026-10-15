import { renderHook, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useModalForm } from '../../src/hooks/useModalForm';

describe('useModalForm Hook', () => {
  const initialValues = { name: '', amount: 0, description: '' };
  const onSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct initial values', () => {
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it('should update values and mark as dirty', () => {
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.setValue('name', 'Test Name');
    });

    expect(result.current.values.name).toBe('Test Name');
    expect(result.current.isDirty).toBe(true);
  });

  it('should set and clear errors', () => {
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.setError('name', 'Name is required');
    });

    expect(result.current.errors.name).toBe('Name is required');

    act(() => {
      result.current.clearError('name');
    });

    expect(result.current.errors.name).toBeUndefined();
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.setError('name', 'Name is required');
      result.current.setError('amount', 'Amount is required');
    });

    expect(result.current.errors.name).toBe('Name is required');
    expect(result.current.errors.amount).toBe('Amount is required');

    act(() => {
      result.current.clearAllErrors();
    });

    expect(result.current.errors).toEqual({});
  });

  it('should handle form submission', async () => {
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.setValue('name', 'Test Name');
    });

    await act(async () => {
      await result.current.handleSubmit();
    });

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Name',
        amount: 0,
        description: ''
      })
    );
  });

  it('should reset form values', () => {
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.setValue('name', 'Test Name');
      result.current.setError('name', 'Some error');
    });

    expect(result.current.values.name).toBe('Test Name');
    expect(result.current.isDirty).toBe(true);
    expect(result.current.errors.name).toBe('Some error');

    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it('should handle close with reset', () => {
    const onClose = jest.fn();
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
        onClose,
        resetOnClose: true
      })
    );

    act(() => {
      result.current.setValue('name', 'Test Name');
    });

    act(() => {
      result.current.handleClose();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('should update values in batch', () => {
    const { result } = renderHook(() => 
      useModalForm({
        initialValues,
        onSubmit,
      })
    );

    act(() => {
      result.current.setValues({
        name: 'Batch Name',
        amount: 100
      });
    });

    expect(result.current.values.name).toBe('Batch Name');
    expect(result.current.values.amount).toBe(100);
    expect(result.current.values.description).toBe(''); // unchanged
    expect(result.current.isDirty).toBe(true);
  });
});