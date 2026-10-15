import { apiService } from './apiService';
import { ApiError } from '@/config/api';
import React from 'react';

// Enums and interfaces matching the backend design
export enum CategoryType {
  Credit = 0,
  Debit = 1,
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  type: CategoryType;
  typeName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
  usageCount: number;
}

export interface CreateCategoryRequest {
  name: string;
  description?: string;
  type: CategoryType;
}

export interface UpdateCategoryRequest {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CategorySearchParams {
  searchTerm?: string;
  type?: CategoryType;
}

// Loading state interface for UI components
export interface CategoryServiceState {
  loading: boolean;
  error: string | null;
}

// Custom error class for category operations
export class CategoryServiceError extends Error {
  public readonly status?: number;
  public readonly errors?: string[];

  constructor(message: string, status?: number, errors?: string[]) {
    super(message);
    this.name = 'CategoryServiceError';
    this.status = status;
    this.errors = errors;
  }
}

// Error handling utility
const handleApiError = (error: unknown, defaultMessage: string): never => {
  if (error && typeof error === 'object' && 'message' in error) {
    const apiError = error as ApiError;
    throw new CategoryServiceError(
      apiError.message || defaultMessage,
      apiError.status,
      apiError.errors
    );
  }

  if (error instanceof Error) {
    throw new CategoryServiceError(error.message);
  }

  throw new CategoryServiceError(defaultMessage);
};

// Service implementation with proper error handling and loading states
// Mock categories for fallback mode
const MOCK_CATEGORIES: Category[] = [
  // Credit Categories (Money In)
  {
    id: 'credit-1',
    name: 'Sales Revenue',
    description: 'Income from product sales',
    type: CategoryType.Credit,
    typeName: 'Credit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 15
  },
  {
    id: 'credit-2',
    name: 'Service Income',
    description: 'Income from services provided',
    type: CategoryType.Credit,
    typeName: 'Credit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 8
  },
  {
    id: 'credit-3',
    name: 'Interest Income',
    description: 'Interest earned on investments',
    type: CategoryType.Credit,
    typeName: 'Credit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 3
  },
  {
    id: 'credit-4',
    name: 'Customer Payments',
    description: 'Payments received from customers',
    type: CategoryType.Credit,
    typeName: 'Credit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 25
  },
  // Debit Categories (Money Out)
  {
    id: 'debit-1',
    name: 'Office Supplies',
    description: 'Stationery and office materials',
    type: CategoryType.Debit,
    typeName: 'Debit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 12
  },
  {
    id: 'debit-2',
    name: 'Raw Materials',
    description: 'Materials for production',
    type: CategoryType.Debit,
    typeName: 'Debit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 20
  },
  {
    id: 'debit-3',
    name: 'Utilities',
    description: 'Electricity, water, internet bills',
    type: CategoryType.Debit,
    typeName: 'Debit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 6
  },
  {
    id: 'debit-4',
    name: 'Transportation',
    description: 'Vehicle fuel and maintenance',
    type: CategoryType.Debit,
    typeName: 'Debit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 9
  },
  {
    id: 'debit-5',
    name: 'Employee Salaries',
    description: 'Staff wages and salaries',
    type: CategoryType.Debit,
    typeName: 'Debit',
    isActive: true,
    createdAt: new Date().toISOString(),
    usageCount: 18
  }
];

export const categoryService = {
  /**
   * Check if we should use fallback mode
   */
  shouldUseFallback(): boolean {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const isFallbackMode = typeof window !== 'undefined' && 
                          localStorage.getItem('auth_fallback_mode') === 'true';
    const shouldBypassAuth = process.env.NEXT_PUBLIC_BYPASS_AUTH === 'true';
    
    return isDevelopment && (isFallbackMode || shouldBypassAuth);
  },

  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    // Check if we should use fallback mode
    if (this.shouldUseFallback()) {
      // Simulate API delay for development
      await new Promise(resolve => setTimeout(resolve, 200));
      return [...MOCK_CATEGORIES];
    }

    try {
      const categories = await apiService.get<Category[]>('/api/category');
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      
      // If we're in development and the error is auth-related, try fallback
      if (this.shouldUseFallback() && error && typeof error === 'object' && 'status' in error && error.status === 401) {

        await new Promise(resolve => setTimeout(resolve, 200));
        return [...MOCK_CATEGORIES];
      }
      
      return handleApiError(error, 'Failed to fetch categories. Please try again.');
    }
  },

  /**
   * Get category by ID
   */
  async getById(id: string): Promise<Category> {
    if (!id?.trim()) {
      throw new CategoryServiceError('Category ID is required');
    }

    // Check if we should use fallback mode
    if (this.shouldUseFallback()) {
      console.log('🔄 Using mock category by ID (fallback mode)');
      await new Promise(resolve => setTimeout(resolve, 100));
      const category = MOCK_CATEGORIES.find(c => c.id === id);
      if (!category) {
        throw new CategoryServiceError('Category not found', 404);
      }
      return { ...category };
    }

    try {
      return await apiService.get<Category>(`/api/category/${id}`);
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error);
      return handleApiError(error, 'Failed to fetch category. The category may not exist.');
    }
  },

  /**
   * Get categories by type (Credit or Debit)
   */
  async getByType(type: CategoryType): Promise<Category[]> {
    if (type !== CategoryType.Credit && type !== CategoryType.Debit) {
      throw new CategoryServiceError('Invalid category type provided');
    }

    // Check if we should use fallback mode
    if (this.shouldUseFallback()) {
      console.log(`🔄 Using mock categories by type ${type} (fallback mode)`);
      await new Promise(resolve => setTimeout(resolve, 150));
      return MOCK_CATEGORIES.filter(c => c.type === type);
    }

    try {
      const categories = await apiService.get<Category[]>(`/api/category/type/${type}`);
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error(`Error fetching categories by type ${type}:`, error);
      
      // If we're in development and the error is auth-related, try fallback
      if (this.shouldUseFallback() && error && typeof error === 'object' && 'status' in error && error.status === 401) {
        console.log(`🔄 API failed, falling back to mock categories by type ${type}`);
        await new Promise(resolve => setTimeout(resolve, 150));
        return MOCK_CATEGORIES.filter(c => c.type === type);
      }
      
      return handleApiError(error, `Failed to fetch ${type === CategoryType.Credit ? 'credit' : 'debit'} categories.`);
    }
  },

  /**
   * Search categories by name or description
   */
  async search(searchTerm: string): Promise<Category[]> {
    if (!searchTerm?.trim()) {
      return [];
    }

    // Check if we should use fallback mode
    if (this.shouldUseFallback()) {
      console.log(`🔄 Using mock category search for "${searchTerm}" (fallback mode)`);
      await new Promise(resolve => setTimeout(resolve, 100));
      const term = searchTerm.toLowerCase().trim();
      return MOCK_CATEGORIES.filter(c => 
        c.name.toLowerCase().includes(term) || 
        (c.description && c.description.toLowerCase().includes(term))
      );
    }

    try {
      const params = new URLSearchParams({ q: searchTerm.trim() });
      const categories = await apiService.get<Category[]>(`/api/category/search?${params}`);
      return Array.isArray(categories) ? categories : [];
    } catch (error) {
      console.error(`Error searching categories with term "${searchTerm}":`, error);
      
      // If we're in development and the error is auth-related, try fallback
      if (this.shouldUseFallback() && error && typeof error === 'object' && 'status' in error && error.status === 401) {
        console.log(`🔄 API failed, falling back to mock category search for "${searchTerm}"`);
        await new Promise(resolve => setTimeout(resolve, 100));
        const term = searchTerm.toLowerCase().trim();
        return MOCK_CATEGORIES.filter(c => 
          c.name.toLowerCase().includes(term) || 
          (c.description && c.description.toLowerCase().includes(term))
        );
      }
      
      return handleApiError(error, 'Failed to search categories. Please try again.');
    }
  },

  /**
   * Create a new category
   */
  async create(data: CreateCategoryRequest): Promise<Category> {
    // Validate required fields
    if (!data.name?.trim()) {
      throw new CategoryServiceError('Category name is required and cannot be empty');
    }

    if (data.name.trim().length > 200) {
      throw new CategoryServiceError('Category name cannot exceed 200 characters');
    }

    if (data.description && data.description.trim().length > 500) {
      throw new CategoryServiceError('Category description cannot exceed 500 characters');
    }

    if (data.type !== CategoryType.Credit && data.type !== CategoryType.Debit) {
      throw new CategoryServiceError('Invalid category type. Must be Credit or Debit');
    }

    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        type: data.type,
      };

      return await apiService.post<Category>('/api/category', payload);
    } catch (error) {
      console.error('Error creating category:', error);
      return handleApiError(error, 'Failed to create category. The category name may already exist.');
    }
  },

  /**
   * Update an existing category
   */
  async update(id: string, data: UpdateCategoryRequest): Promise<Category> {
    if (!id?.trim()) {
      throw new CategoryServiceError('Category ID is required');
    }

    // Validate required fields
    if (!data.name?.trim()) {
      throw new CategoryServiceError('Category name is required and cannot be empty');
    }

    if (data.name.trim().length > 200) {
      throw new CategoryServiceError('Category name cannot exceed 200 characters');
    }

    if (data.description && data.description.trim().length > 500) {
      throw new CategoryServiceError('Category description cannot exceed 500 characters');
    }

    try {
      const payload = {
        name: data.name.trim(),
        description: data.description?.trim() || undefined,
        isActive: data.isActive,
      };

      return await apiService.put<Category>(`/api/category/${id}`, payload);
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      return handleApiError(error, 'Failed to update category. The category name may already exist or the category may not be found.');
    }
  },

  /**
   * Delete a category
   */
  async delete(id: string): Promise<void> {
    if (!id?.trim()) {
      throw new CategoryServiceError('Category ID is required');
    }

    try {
      await apiService.delete(`/api/category/${id}`);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      handleApiError(error, 'Failed to delete category. The category may be in use by existing transactions or may not exist.');
    }
  },

  /**
   * Toggle category active status
   */
  async toggleActiveStatus(id: string): Promise<Category> {
    if (!id?.trim()) {
      throw new CategoryServiceError('Category ID is required');
    }

    try {
      return await apiService.patch<Category>(`/api/category/${id}/toggle-status`);
    } catch (error) {
      console.error(`Error toggling category ${id} status:`, error);
      return handleApiError(error, 'Failed to toggle category status. The category may not exist.');
    }
  },

  /**
   * Check if category name is unique within its type
   */
  async isNameUnique(name: string, type: CategoryType, excludeId?: string): Promise<boolean> {
    if (!name?.trim()) {
      return false;
    }

    if (type !== CategoryType.Credit && type !== CategoryType.Debit) {
      return false;
    }

    try {
      const params = new URLSearchParams({
        name: name.trim(),
        type: type.toString(),
      });

      if (excludeId?.trim()) {
        params.append('excludeId', excludeId.trim());
      }

      const response = await apiService.get<{ isUnique: boolean }>(`/api/category/check-unique?${params}`);
      return response?.isUnique ?? false;
    } catch (error) {
      console.error('Error checking category name uniqueness:', error);
      // Return false on error to be safe (assume not unique)
      return false;
    }
  },

  /**
   * Get category usage count (number of transactions using this category)
   */
  async getUsageCount(id: string): Promise<number> {
    if (!id?.trim()) {
      throw new CategoryServiceError('Category ID is required');
    }

    try {
      const response = await apiService.get<{ count: number }>(`/api/category/${id}/usage-count`);
      return response?.count ?? 0;
    } catch (error) {
      console.error(`Error fetching usage count for category ${id}:`, error);
      return handleApiError(error, 'Failed to fetch category usage count.');
    }
  },

  /**
   * Get active categories only
   */
  async getActive(): Promise<Category[]> {
    try {
      const allCategories = await this.getAll();
      return allCategories.filter(category => category.isActive);
    } catch (error) {
      console.error('Error fetching active categories:', error);
      return handleApiError(error, 'Failed to fetch active categories.');
    }
  },

  /**
   * Get active categories by type
   */
  async getActiveByType(type: CategoryType): Promise<Category[]> {
    if (type !== CategoryType.Credit && type !== CategoryType.Debit) {
      throw new CategoryServiceError('Invalid category type provided');
    }

    try {
      const categoriesByType = await this.getByType(type);
      return categoriesByType.filter(category => category.isActive);
    } catch (error) {
      console.error(`Error fetching active categories by type ${type}:`, error);
      return handleApiError(error, `Failed to fetch active ${type === CategoryType.Credit ? 'credit' : 'debit'} categories.`);
    }
  },

  /**
   * Batch operations for better performance
   */
  async getActiveByTypes(): Promise<{ credit: Category[]; debit: Category[] }> {
    try {
      const [creditCategories, debitCategories] = await Promise.all([
        this.getActiveByType(CategoryType.Credit),
        this.getActiveByType(CategoryType.Debit),
      ]);

      return {
        credit: creditCategories,
        debit: debitCategories,
      };
    } catch (error) {
      console.error('Error fetching active categories by types:', error);
      return handleApiError(error, 'Failed to fetch active categories.');
    }
  },

  /**
   * Validate category data before submission
   */
  validateCategoryData(data: CreateCategoryRequest | UpdateCategoryRequest): string[] {
    const errors: string[] = [];

    if (!data.name?.trim()) {
      errors.push('Category name is required');
    } else if (data.name.trim().length > 200) {
      errors.push('Category name cannot exceed 200 characters');
    }

    if (data.description && data.description.trim().length > 500) {
      errors.push('Category description cannot exceed 500 characters');
    }

    if ('type' in data && data.type !== CategoryType.Credit && data.type !== CategoryType.Debit) {
      errors.push('Invalid category type');
    }

    return errors;
  },
};

// Loading state management utility
export const createCategoryServiceState = (): CategoryServiceState => ({
  loading: false,
  error: null,
});

// Hook-like utility for managing service state (can be used with React state)
export const useCategoryServiceState = () => {
  const [state, setState] = React.useState<CategoryServiceState>(createCategoryServiceState);

  const setLoading = (loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null) => {
    setState(prev => ({ ...prev, error }));
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  const reset = () => {
    setState(createCategoryServiceState());
  };

  return {
    ...state,
    setLoading,
    setError,
    clearError,
    reset,
  };
};

// Service wrapper with loading state management
export const createCategoryServiceWithState = () => {
  let currentState: CategoryServiceState = createCategoryServiceState();
  const listeners: Array<(state: CategoryServiceState) => void> = [];

  const updateState = (updates: Partial<CategoryServiceState>) => {
    currentState = { ...currentState, ...updates };
    listeners.forEach(listener => listener(currentState));
  };

  const subscribe = (listener: (state: CategoryServiceState) => void) => {
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  };

  const withLoadingState = async <T>(operation: () => Promise<T>): Promise<T> => {
    updateState({ loading: true, error: null });
    try {
      const result = await operation();
      updateState({ loading: false, error: null });
      return result;
    } catch (error) {
      const errorMessage = error instanceof CategoryServiceError
        ? error.message
        : 'An unexpected error occurred';
      updateState({ loading: false, error: errorMessage });
      throw error;
    }
  };

  return {
    getState: () => currentState,
    subscribe,
    withLoadingState,
  };
};

// Helper functions for UI components
export const categoryHelpers = {
  /**
   * Get category type display name
   */
  getTypeDisplayName(type: CategoryType): string {
    return type === CategoryType.Credit ? 'Credit (Money In)' : 'Debit (Money Out)';
  },

  /**
   * Get category type color for UI components
   */
  getTypeColor(type: CategoryType): 'success' | 'warning' {
    return type === CategoryType.Credit ? 'success' : 'warning';
  },

  /**
   * Format category for display in dropdowns
   */
  formatForDropdown(category: Category): { value: string; label: string; type: string } {
    return {
      value: category.id,
      label: category.name,
      type: category.typeName,
    };
  },

  /**
   * Sort categories by name
   */
  sortByName(categories: Category[]): Category[] {
    return [...categories].sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * Group categories by type
   */
  groupByType(categories: Category[]): { credit: Category[]; debit: Category[] } {
    return categories.reduce(
      (groups, category) => {
        if (category.type === CategoryType.Credit) {
          groups.credit.push(category);
        } else {
          groups.debit.push(category);
        }
        return groups;
      },
      { credit: [] as Category[], debit: [] as Category[] }
    );
  },

  /**
   * Filter categories by search term
   */
  filterBySearchTerm(categories: Category[], searchTerm: string): Category[] {
    if (!searchTerm?.trim() || !Array.isArray(categories)) return categories;

    const term = searchTerm.toLowerCase().trim();
    return categories.filter(
      category =>
        category.name.toLowerCase().includes(term) ||
        (category.description && category.description.toLowerCase().includes(term))
    );
  },

  /**
   * Get category statistics
   */
  getCategoryStats(categories: Category[]): {
    total: number;
    active: number;
    inactive: number;
    credit: number;
    debit: number;
    totalUsage: number;
  } {
    if (!Array.isArray(categories)) {
      return { total: 0, active: 0, inactive: 0, credit: 0, debit: 0, totalUsage: 0 };
    }

    return categories.reduce(
      (stats, category) => ({
        total: stats.total + 1,
        active: stats.active + (category.isActive ? 1 : 0),
        inactive: stats.inactive + (category.isActive ? 0 : 1),
        credit: stats.credit + (category.type === CategoryType.Credit ? 1 : 0),
        debit: stats.debit + (category.type === CategoryType.Debit ? 1 : 0),
        totalUsage: stats.totalUsage + (category.usageCount || 0),
      }),
      { total: 0, active: 0, inactive: 0, credit: 0, debit: 0, totalUsage: 0 }
    );
  },

  /**
   * Validate category name format
   */
  isValidCategoryName(name: string): boolean {
    if (!name?.trim()) return false;

    const trimmedName = name.trim();

    // Check length
    if (trimmedName.length === 0 || trimmedName.length > 200) return false;

    // Check for invalid characters (basic validation)
    const invalidChars = /[<>\"'&]/;
    if (invalidChars.test(trimmedName)) return false;

    return true;
  },

  /**
   * Format error message for display
   */
  formatErrorMessage(error: unknown): string {
    if (error instanceof CategoryServiceError) {
      return error.message;
    }

    if (error instanceof Error) {
      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred';
  },

  /**
   * Get category type badge color for UI
   */
  getTypeBadgeColor(type: CategoryType): string {
    return type === CategoryType.Credit ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  },

  /**
   * Get status badge color for UI
   */
  getStatusBadgeColor(isActive: boolean): string {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  },

  /**
   * Create category display name with type
   */
  createDisplayName(category: Category): string {
    const typePrefix = category.type === CategoryType.Credit ? '[Credit]' : '[Debit]';
    return `${typePrefix} ${category.name}`;
  },

  /**
   * Check if category can be deleted
   */
  canDelete(category: Category): { canDelete: boolean; reason?: string } {
    if (!category.isActive) {
      return { canDelete: true };
    }

    if (category.usageCount > 0) {
      return {
        canDelete: false,
        reason: `Category is used in ${category.usageCount} transaction${category.usageCount === 1 ? '' : 's'}`
      };
    }

    return { canDelete: true };
  },
};

// Constants for UI components
export const CATEGORY_CONSTANTS = {
  MAX_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 500,
  SEARCH_DEBOUNCE_MS: 300,
  DEFAULT_PAGE_SIZE: 20,
} as const;

// Type guards
export const isCategoryType = (value: unknown): value is CategoryType => {
  return value === CategoryType.Credit || value === CategoryType.Debit;
};

export const isCategory = (value: unknown): value is Category => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'type' in value &&
    'isActive' in value &&
    typeof (value as Category).id === 'string' &&
    typeof (value as Category).name === 'string' &&
    isCategoryType((value as Category).type) &&
    typeof (value as Category).isActive === 'boolean'
  );
};

// Default category objects
export const createDefaultCategory = (type: CategoryType): Partial<Category> => ({
  name: '',
  description: '',
  type,
  isActive: true,
  usageCount: 0,
});

export const createDefaultCreateRequest = (type: CategoryType): CreateCategoryRequest => ({
  name: '',
  description: '',
  type,
});

export const createDefaultUpdateRequest = (category: Category): UpdateCategoryRequest => ({
  name: category.name,
  description: category.description,
  isActive: category.isActive,
});

// Export the main service as default
export default categoryService;