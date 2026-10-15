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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { taxRateService } from '@/services/taxRateService';
import { permissionService } from '@/services/permissionService';

interface TaxRate {
  id: string;
  taxName: string;
  taxPercentage: number;
  taxType: string;
  description?: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
  createdAt: string;
}

interface TaxRateFormData {
  taxName: string;
  taxPercentage: number;
  taxType: string;
  description: string;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo: string;
}

const TaxRatesPage = () => {
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTaxRate, setEditingTaxRate] = useState<TaxRate | null>(null);
  const [formData, setFormData] = useState<TaxRateFormData>({
    taxName: '',
    taxPercentage: 0,
    taxType: 'VAT',
    description: '',
    isActive: true,
    effectiveFrom: new Date().toISOString().split('T')[0],
    effectiveTo: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [permissions, setPermissions] = useState({
    canRead: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  });

  const taxTypes = ['VAT', 'GST', 'Sales Tax', 'Service Tax', 'Excise', 'Other'];

  const checkPermissions = useCallback(async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const [canRead, canCreate, canUpdate, canDelete] = await Promise.all([
        permissionService.checkPermission(userId, 'TaxRate', 'Read'),
        permissionService.checkPermission(userId, 'TaxRate', 'Create'),
        permissionService.checkPermission(userId, 'TaxRate', 'Update'),
        permissionService.checkPermission(userId, 'TaxRate', 'Delete'),
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

  const loadTaxRates = useCallback(async () => {
    if (!permissions.canRead) {
      setError('You do not have permission to view tax rates');
      return;
    }

    setLoading(true);
    try {
      const data = await taxRateService.getAll();
      setTaxRates(data);
      setError(null);
    } catch (error) {
      setError('Failed to load tax rates');
      console.error('Error loading tax rates:', error);
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    if (permissions.canRead) {
      loadTaxRates();
    }
  }, [permissions.canRead, loadTaxRates]);

  const handleOpenDialog = (taxRate?: TaxRate) => {
    if (taxRate) {
      if (!permissions.canUpdate) {
        setError('You do not have permission to edit tax rates');
        return;
      }
      setEditingTaxRate(taxRate);
      setFormData({
        taxName: taxRate.taxName,
        taxPercentage: taxRate.taxPercentage,
        taxType: taxRate.taxType,
        description: taxRate.description || '',
        isActive: taxRate.isActive,
        effectiveFrom: taxRate.effectiveFrom.split('T')[0],
        effectiveTo: taxRate.effectiveTo ? taxRate.effectiveTo.split('T')[0] : '',
      });
    } else {
      if (!permissions.canCreate) {
        setError('You do not have permission to create tax rates');
        return;
      }
      setEditingTaxRate(null);
      setFormData({
        taxName: '',
        taxPercentage: 0,
        taxType: 'VAT',
        description: '',
        isActive: true,
        effectiveFrom: new Date().toISOString().split('T')[0],
        effectiveTo: '',
      });
    }
    setDialogOpen(true);
    setError(null);
    setSuccess(null);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingTaxRate(null);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (field: keyof TaxRateFormData, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (editingTaxRate) {
        await taxRateService.update(editingTaxRate.id, formData);
        setSuccess('Tax rate updated successfully');
      } else {
        await taxRateService.create(formData);
        setSuccess('Tax rate created successfully');
      }
      loadTaxRates();
      handleCloseDialog();
    } catch (error) {
      setError(editingTaxRate ? 'Failed to update tax rate' : 'Failed to create tax rate');
      console.error('Error saving tax rate:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!permissions.canDelete) {
      setError('You do not have permission to delete tax rates');
      return;
    }

    if (!confirm('Are you sure you want to delete this tax rate?')) {
      return;
    }

    try {
      await taxRateService.delete(id);
      setSuccess('Tax rate deleted successfully');
      loadTaxRates();
    } catch (error) {
      setError('Failed to delete tax rate');
      console.error('Error deleting tax rate:', error);
    }
  };

  if (!permissions.canRead) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to view tax rates.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tax Rates
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadTaxRates}
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
              Add Tax Rate
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
                <TableCell>Tax Name</TableCell>
                <TableCell>Percentage</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Effective From</TableCell>
                <TableCell>Effective To</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {taxRates.map((taxRate) => (
                <TableRow key={taxRate.id}>
                  <TableCell>{taxRate.taxName}</TableCell>
                  <TableCell>{taxRate.taxPercentage}%</TableCell>
                  <TableCell>
                    <Chip 
                      label={taxRate.taxType} 
                      size="small" 
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{taxRate.description || '-'}</TableCell>
                  <TableCell>
                    {new Date(taxRate.effectiveFrom).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {taxRate.effectiveTo 
                      ? new Date(taxRate.effectiveTo).toLocaleDateString()
                      : '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={taxRate.isActive ? 'Active' : 'Inactive'}
                      color={taxRate.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {permissions.canUpdate && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(taxRate)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {permissions.canDelete && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(taxRate.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {taxRates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No tax rates found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTaxRate ? 'Edit Tax Rate' : 'Add Tax Rate'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Tax Name"
              value={formData.taxName}
              onChange={(e) => handleInputChange('taxName', e.target.value)}
              fullWidth
              required
            />
            
            <TextField
              label="Tax Percentage"
              type="number"
              value={formData.taxPercentage}
              onChange={(e) => handleInputChange('taxPercentage', parseFloat(e.target.value))}
              fullWidth
              required
              inputProps={{ min: 0, step: 0.01 }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Tax Type</InputLabel>
              <Select
                value={formData.taxType}
                label="Tax Type"
                onChange={(e) => handleInputChange('taxType', e.target.value)}
              >
                {taxTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
            
            <TextField
              label="Effective From"
              type="date"
              value={formData.effectiveFrom}
              onChange={(e) => handleInputChange('effectiveFrom', e.target.value)}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="Effective To"
              type="date"
              value={formData.effectiveTo}
              onChange={(e) => handleInputChange('effectiveTo', e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                />
              }
              label="Active"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTaxRate ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default TaxRatesPage;
