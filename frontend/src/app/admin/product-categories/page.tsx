'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
  Chip,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { productCategoryService } from '@/services/productCategoryService';
import { permissionService } from '@/services/permissionService';

interface ProductCategory {
  id: string;
  categoryName: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

interface ProductCategoryFormData {
  categoryName: string;
  description: string;
  isActive: boolean;
}

const ProductCategoriesPage = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategory | null>(null);
  const [formData, setFormData] = useState<ProductCategoryFormData>({
    categoryName: '',
    description: '',
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  const checkPermissions = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const [canRead, canCreate, canUpdate, canDelete] = await Promise.all([
        permissionService.checkPermission(userId, 'ProductCategory', 'Read'),
        permissionService.checkPermission(userId, 'ProductCategory', 'Create'),
        permissionService.checkPermission(userId, 'ProductCategory', 'Update'),
        permissionService.checkPermission(userId, 'ProductCategory', 'Delete'),
      ]);

      setPermissions({
        canRead,
        canCreate,
        canUpdate,
        canDelete,
      });
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Failed to check permissions');
    }
  }, []);

  const loadCategories = useCallback(async () => {
    if (!permissions.canRead) {
      setError('You do not have permission to view product categories');
      return;
    }

    setLoading(true);
    try {
      const data = await productCategoryService.getAll();
      setCategories(data);
      setError(null);
    } catch (error) {
      setError('Failed to load product categories');
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    if (permissions.canRead) {
      loadCategories();
    }
  }, [permissions.canRead, loadCategories]);

  const handleOpenDialog = (category?: ProductCategory) => {
    if (category) {
      if (!permissions.canUpdate) {
        setError('You do not have permission to edit product categories');
        return;
      }
      setEditingCategory(category);
      setFormData({
        categoryName: category.categoryName,
        description: category.description || '',
        isActive: category.isActive,
      });
    } else {
      if (!permissions.canCreate) {
        setError('You do not have permission to create product categories');
        return;
      }
      setEditingCategory(null);
      setFormData({
        categoryName: '',
        description: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      categoryName: '',
      description: '',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        categoryName: formData.categoryName,
        description: formData.description || undefined,
        isActive: formData.isActive,
      };

      if (editingCategory) {
        await productCategoryService.update(editingCategory.id, submitData);
        setSuccess('Product category updated successfully');
      } else {
        await productCategoryService.create(submitData);
        setSuccess('Product category created successfully');
      }
      
      handleCloseDialog();
      loadCategories();
    } catch (error) {
      setError('Failed to save product category');
      console.error('Error saving category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!permissions.canDelete) {
      setError('You do not have permission to delete product categories');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this product category?')) {
      return;
    }

    try {
      await productCategoryService.delete(id);
      setSuccess('Product category deleted successfully');
      loadCategories();
    } catch (error) {
      setError('Failed to delete product category');
      console.error('Error deleting category:', error);
    }
  };

  if (!permissions.canRead) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Product Categories
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCategories}
            disabled={loading}
          >
            Refresh
          </Button>
          {permissions.canCreate && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              Add Category
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Category Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {category.categoryName}
                    </Typography>
                  </TableCell>
                  <TableCell>{category.description || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={category.isActive ? 'Active' : 'Inactive'}
                      color={category.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(category.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {permissions.canUpdate && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(category)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {permissions.canDelete && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No product categories found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingCategory ? 'Edit Product Category' : 'Add New Product Category'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Category Name"
              value={formData.categoryName}
              onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
              required
              fullWidth
            />
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.categoryName.trim()}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProductCategoriesPage;
