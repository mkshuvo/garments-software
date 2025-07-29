'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AuthDebug from '@/components/debug/AuthDebug';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Chip,
  CircularProgress,
  Stack,
  Card,
  CardContent,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  Category as CategoryIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

import { 
  categoryService, 
  categoryHelpers, 
  Category, 
  CategoryType, 
  CreateCategoryRequest, 
  UpdateCategoryRequest 
} from '@/services/categoryService';
import { PermissionGuard } from '@/components/auth/PermissionGuard';
import { ApiError } from '@/config/api';

// Form data interfaces
interface CategoryFormData {
  name: string;
  description: string;
  type: CategoryType;
  isActive: boolean;
}

// Helper functions for error handling
const getPermissionErrorMessage = (action: string): string => {
  switch (action.toLowerCase()) {
    case 'create':
      return 'You do not have permission to create categories. Please contact your administrator.';
    case 'update':
    case 'edit':
      return 'You do not have permission to edit categories. Please contact your administrator.';
    case 'delete':
      return 'You do not have permission to delete categories. Please contact your administrator.';
    case 'view':
      return 'You do not have permission to view categories. Please contact your administrator.';
    default:
      return 'You do not have permission to perform this action. Please contact your administrator.';
  }
};

const formatApiError = (error: unknown, action?: string): string => {
  if (typeof error === 'object' && error !== null && 'status' in error) {
    const apiError = error as ApiError;
    
    switch (apiError.status) {
      case 403:
        return action ? getPermissionErrorMessage(action) : 'Access denied. You do not have permission to perform this action.';
      case 401:
        return 'Your session has expired. Please log in again.';
      case 404:
        return 'The requested category was not found. It may have been deleted.';
      case 409:
        return 'A category with this name already exists. Please choose a different name.';
      case 422:
        return apiError.message || 'Please check your input and try again.';
      case 500:
        return 'A server error occurred. Please try again later.';
      default:
        return apiError.message || 'An unexpected error occurred. Please try again.';
    }
  }
  
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as { message: string }).message;
  }
  
  return 'An unexpected error occurred. Please try again.';
};

const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<CategoryType | ''>('');

  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form data
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    type: CategoryType.Credit,
    isActive: true,
  });

  // Load categories from API
  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      setFilteredCategories(data);
      setError(null);
    } catch (error) {
      const errorMessage = formatApiError(error, 'view');
      setError(errorMessage);
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter categories based on search term and type
  const filterCategories = useCallback(() => {
    let filtered = categories;

    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (category) =>
          category.name.toLowerCase().includes(searchLower) ||
          (category.description && category.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by type
    if (typeFilter !== '') {
      filtered = filtered.filter((category) => category.type === typeFilter);
    }

    setFilteredCategories(filtered);
  }, [categories, searchTerm, typeFilter]);

  // Load categories on component mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Apply filters when search term or type filter changes
  useEffect(() => {
    filterCategories();
  }, [filterCategories]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleTypeFilterChange = (event: { target: { value: unknown } }) => {
    const value = event.target.value as '' | CategoryType;
    setTypeFilter(value);
  };

  // Dialog handlers
  const handleCreateCategory = () => {
    setFormData({
      name: '',
      description: '',
      type: CategoryType.Credit,
      isActive: true,
    });
    setCreateDialogOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      type: category.type,
      isActive: category.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    setCategoryToDelete(category);
    setDeleteDialogOpen(true);
  };

  const handleCloseDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setEditingCategory(null);
    setCategoryToDelete(null);
    setFormData({
      name: '',
      description: '',
      type: CategoryType.Credit,
      isActive: true,
    });
  };

  // Form handlers
  const handleFormChange = (field: keyof CategoryFormData, value: string | boolean | CategoryType) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Category name is required');
      return;
    }

    setSubmitting(true);
    setError(null); // Clear previous errors
    try {
      const createRequest: CreateCategoryRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        type: formData.type,
      };

      const newCategory = await categoryService.create(createRequest);
      setCategories(prev => [...prev, newCategory]);
      setSuccess('Category created successfully');
      handleCloseDialogs();
    } catch (error) {
      const errorMessage = formatApiError(error, 'create');
      setError(errorMessage);
      console.error('Error creating category:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!formData.name.trim() || !editingCategory) {
      setError('Category name is required');
      return;
    }

    setSubmitting(true);
    setError(null); // Clear previous errors
    try {
      const updateRequest: UpdateCategoryRequest = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        isActive: formData.isActive,
      };

      const updatedCategory = await categoryService.update(editingCategory.id, updateRequest);
      setCategories(prev => 
        prev.map(cat => cat.id === editingCategory.id ? updatedCategory : cat)
      );
      setSuccess('Category updated successfully');
      handleCloseDialogs();
    } catch (error) {
      const errorMessage = formatApiError(error, 'update');
      setError(errorMessage);
      console.error('Error updating category:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSubmit = async () => {
    if (!categoryToDelete) return;

    setSubmitting(true);
    setError(null); // Clear previous errors
    try {
      await categoryService.delete(categoryToDelete.id);
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete.id));
      setSuccess('Category deleted successfully');
      handleCloseDialogs();
    } catch (error) {
      const errorMessage = formatApiError(error, 'delete');
      setError(errorMessage);
      console.error('Error deleting category:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getCategoryTypeColor = (type: CategoryType): 'success' | 'warning' => {
    return categoryHelpers.getTypeColor(type);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Box sx={{ p: 3 }}>
      <AuthDebug />
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Category Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your cashbook categories for credit and debit transactions
          </Typography>
        </Box>
        <PermissionGuard 
          resource={"Category"} 
          action={"Create"}
          fallback={
            <Tooltip title="You need 'Create Category' permission to add new categories">
              <span>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled
                  sx={{ borderRadius: 2, opacity: 0.6 }}
                >
                  Create Category
                </Button>
              </span>
            </Tooltip>
          }
        >
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateCategory}
            sx={{ borderRadius: 2 }}
          >
            Create Category
          </Button>
        </PermissionGuard>
      </Box>

      {/* Search and Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
            <TextField
              label="Search categories"
              variant="outlined"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by name or description..."
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ flexGrow: 1 }}
            />
            
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Category Type</InputLabel>
              <Select
                value={typeFilter}
                onChange={handleTypeFilterChange}
                label="Category Type"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value={CategoryType.Credit}>Credit (Money In)</MenuItem>
                <MenuItem value={CategoryType.Debit}>Debit (Money Out)</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={loadCategories}
              disabled={loading}
              sx={{ borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Error and Success Messages */}
      {error && (
        <Alert 
          severity={error.includes('permission') || error.includes('Access denied') ? 'warning' : 'error'} 
          sx={{ mb: 2 }} 
          onClose={() => setError(null)}
          variant={error.includes('permission') || error.includes('Access denied') ? 'filled' : 'standard'}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Results Summary */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {loading ? 'Loading...' : `Showing ${filteredCategories.length} of ${categories.length} categories`}
        </Typography>
      </Box>

      {/* Categories Table */}
      <Card>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell><strong>Usage Count</strong></TableCell>
                <TableCell><strong>Created</strong></TableCell>
                <TableCell align="center"><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : filteredCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <CategoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      No categories found
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {searchTerm || typeFilter !== '' 
                        ? 'Try adjusting your search criteria' 
                        : 'Start by creating your first category'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCategories.map((category) => (
                  <TableRow key={category.id} hover>
                    <TableCell>
                      <Typography variant="subtitle2" fontWeight="bold">
                        {category.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.typeName}
                        color={getCategoryTypeColor(category.type)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ 
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {category.description || '-'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={category.isActive ? 'Active' : 'Inactive'}
                        color={category.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {category.usageCount}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {formatDate(category.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <PermissionGuard 
                          resource={"Category"} 
                          action={"Update"}
                          fallback={
                            <Tooltip title="You need 'Update Category' permission to edit categories">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled
                                  sx={{ opacity: 0.4 }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          }
                        >
                          <Tooltip title="Edit Category">
                            <IconButton
                              size="small"
                              onClick={() => handleEditCategory(category)}
                              color="primary"
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </PermissionGuard>
                        
                        <PermissionGuard 
                          resource={"Category"} 
                          action={"Delete"}
                          fallback={
                            <Tooltip title="You need 'Delete Category' permission to remove categories">
                              <span>
                                <IconButton
                                  size="small"
                                  disabled
                                  sx={{ opacity: 0.4 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </span>
                            </Tooltip>
                          }
                        >
                          <Tooltip title="Delete Category">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </PermissionGuard>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Create Category Dialog */}
      <Dialog open={createDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
              fullWidth
              placeholder="e.g., Fabric Purchase, Received: Urbo ltd"
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
              placeholder="Optional description for this category"
            />
            
            <FormControl fullWidth required>
              <InputLabel>Category Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => handleFormChange('type', e.target.value)}
                label="Category Type"
              >
                <MenuItem value={CategoryType.Credit}>Credit (Money In)</MenuItem>
                <MenuItem value={CategoryType.Debit}>Debit (Money Out)</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button
            onClick={handleCreateSubmit}
            variant="contained"
            disabled={!formData.name.trim() || submitting}
          >
            {submitting ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Category Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseDialogs} maxWidth="md" fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Category Name"
              value={formData.name}
              onChange={(e) => handleFormChange('name', e.target.value)}
              required
              fullWidth
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleFormChange('description', e.target.value)}
              multiline
              rows={3}
              fullWidth
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleFormChange('isActive', e.target.checked)}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={!formData.name.trim() || submitting}
          >
            {submitting ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCloseDialogs} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Are you sure you want to delete this category?
          </Typography>
          {categoryToDelete && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                {categoryToDelete.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type: {categoryToDelete.typeName}
              </Typography>
              {categoryToDelete.description && (
                <Typography variant="body2" color="text.secondary">
                  Description: {categoryToDelete.description}
                </Typography>
              )}
            </Box>
          )}
          {categoryToDelete && categoryToDelete.usageCount > 0 && (
            <Alert severity="warning" sx={{ mt: 2 }} icon={<WarningIcon />}>
              This category is currently used in {categoryToDelete.usageCount} transaction(s). 
              Deleting it may affect existing records.
            </Alert>
          )}
          <Alert severity="error" sx={{ mt: 2 }}>
            This action cannot be undone. The category will be permanently deleted.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogs}>Cancel</Button>
          <Button
            onClick={handleDeleteSubmit}
            color="error"
            variant="contained"
            disabled={submitting}
          >
            {submitting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoriesPage;