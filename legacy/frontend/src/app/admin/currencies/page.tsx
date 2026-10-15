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
import { currencyService } from '@/services/currencyService';
import { permissionService } from '@/services/permissionService';

interface Currency {
  id: string;
  currencyCode: string;
  currencyName: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CurrencyFormData {
  currencyCode: string;
  currencyName: string;
  symbol: string;
  isBaseCurrency: boolean;
  isActive: boolean;
}

const CurrenciesPage = () => {
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCurrency, setEditingCurrency] = useState<Currency | null>(null);
  const [formData, setFormData] = useState<CurrencyFormData>({
    currencyCode: '',
    currencyName: '',
    symbol: '',
    isBaseCurrency: false,
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
      if (!userId) return;

      const [canRead, canCreate, canUpdate, canDelete] = await Promise.all([
        permissionService.checkPermission(userId, 'Currency', 'Read'),
        permissionService.checkPermission(userId, 'Currency', 'Create'),
        permissionService.checkPermission(userId, 'Currency', 'Update'),
        permissionService.checkPermission(userId, 'Currency', 'Delete'),
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

  const loadCurrencies = useCallback(async () => {
    if (!permissions.canRead) {
      setError('You do not have permission to view currencies');
      return;
    }

    setLoading(true);
    try {
      const data = await currencyService.getAll();
      setCurrencies(data);
      setError(null);
    } catch (error) {
      setError('Failed to load currencies');
      console.error('Error loading currencies:', error);
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    if (permissions.canRead) {
      loadCurrencies();
    }
  }, [permissions.canRead, loadCurrencies]);

  const handleOpenDialog = (currency?: Currency) => {
    if (currency) {
      if (!permissions.canUpdate) {
        setError('You do not have permission to edit currencies');
        return;
      }
      setEditingCurrency(currency);
      setFormData({
        currencyCode: currency.currencyCode,
        currencyName: currency.currencyName,
        symbol: currency.symbol,
        isBaseCurrency: currency.isBaseCurrency,
        isActive: currency.isActive,
      });
    } else {
      if (!permissions.canCreate) {
        setError('You do not have permission to create currencies');
        return;
      }
      setEditingCurrency(null);
      setFormData({
        currencyCode: '',
        currencyName: '',
        symbol: '',
        isBaseCurrency: false,
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCurrency(null);
    setFormData({
      currencyCode: '',
      currencyName: '',
      symbol: '',
      isBaseCurrency: false,
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      if (editingCurrency) {
        await currencyService.update(editingCurrency.id, formData);
        setSuccess('Currency updated successfully');
      } else {
        await currencyService.create(formData);
        setSuccess('Currency created successfully');
      }
      
      handleCloseDialog();
      loadCurrencies();
    } catch (error) {
      setError('Failed to save currency');
      console.error('Error saving currency:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!permissions.canDelete) {
      setError('You do not have permission to delete currencies');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this currency?')) {
      return;
    }

    try {
      await currencyService.delete(id);
      setSuccess('Currency deleted successfully');
      loadCurrencies();
    } catch (error) {
      setError('Failed to delete currency');
      console.error('Error deleting currency:', error);
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
          Currency Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCurrencies}
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
              Add Currency
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
                <TableCell>Currency Code</TableCell>
                <TableCell>Currency Name</TableCell>
                <TableCell>Symbol</TableCell>
                <TableCell>Base Currency</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currencies.map((currency) => (
                <TableRow key={currency.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {currency.currencyCode}
                    </Typography>
                  </TableCell>
                  <TableCell>{currency.currencyName}</TableCell>
                  <TableCell>
                    <Typography variant="h6">{currency.symbol}</Typography>
                  </TableCell>
                  <TableCell>
                    {currency.isBaseCurrency && (
                      <Chip label="Base Currency" color="primary" size="small" />
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={currency.isActive ? 'Active' : 'Inactive'}
                      color={currency.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(currency.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell align="right">
                    {permissions.canUpdate && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(currency)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {permissions.canDelete && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(currency.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {currencies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No currencies found
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
          {editingCurrency ? 'Edit Currency' : 'Add New Currency'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Currency Code"
              value={formData.currencyCode}
              onChange={(e) => setFormData({ ...formData, currencyCode: e.target.value })}
              required
              fullWidth
              inputProps={{ maxLength: 3 }}
              helperText="3-letter currency code (e.g., USD, EUR)"
            />
            
            <TextField
              label="Currency Name"
              value={formData.currencyName}
              onChange={(e) => setFormData({ ...formData, currencyName: e.target.value })}
              required
              fullWidth
            />
            
            <TextField
              label="Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              required
              fullWidth
              inputProps={{ maxLength: 5 }}
              helperText="Currency symbol (e.g., $, €, £)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={formData.isBaseCurrency}
                  onChange={(e) => setFormData({ ...formData, isBaseCurrency: e.target.checked })}
                />
              }
              label="Base Currency"
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
            disabled={!formData.currencyCode || !formData.currencyName || !formData.symbol}
          >
            {editingCurrency ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CurrenciesPage;
