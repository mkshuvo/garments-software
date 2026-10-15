'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Chip,
  FormControlLabel,
  Switch,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { taxSchemeService, TaxSchemeDto, CreateTaxSchemeDto, UpdateTaxSchemeDto } from '../../../services/taxSchemeService';
import { taxRateService, TaxRate } from '../../../services/taxRateService';
import { permissionService } from '../../../services/permissionService';

const TaxSchemesPage: React.FC = () => {
  const [taxSchemes, setTaxSchemes] = useState<TaxSchemeDto[]>([]);
  const [taxRates, setTaxRates] = useState<TaxRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTaxScheme, setEditingTaxScheme] = useState<TaxSchemeDto | null>(null);
  const [formData, setFormData] = useState<CreateTaxSchemeDto>({
    schemeName: '',
    taxRateId: '',
    description: '',
    isActive: true
  });

  // Permission states
  const [canRead, setCanRead] = useState(false);
  const [canCreate, setCanCreate] = useState(false);
  const [canUpdate, setCanUpdate] = useState(false);
  const [canDelete, setCanDelete] = useState(false);

  useEffect(() => {
    checkPermissions();
  }, []);

  useEffect(() => {
    if (canRead) {
      loadTaxSchemes();
      loadTaxRates();
    }
  }, [canRead]);

  const checkPermissions = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setError('User not authenticated');
        return;
      }

      const [readPerm, createPerm, updatePerm, deletePerm] = await Promise.all([
        permissionService.checkPermission(userId, 'TaxScheme', 'Read'),
        permissionService.checkPermission(userId, 'TaxScheme', 'Create'),
        permissionService.checkPermission(userId, 'TaxScheme', 'Update'),
        permissionService.checkPermission(userId, 'TaxScheme', 'Delete')
      ]);

      setCanRead(readPerm);
      setCanCreate(createPerm);
      setCanUpdate(updatePerm);
      setCanDelete(deletePerm);

      if (!readPerm) {
        setError('You do not have permission to view tax schemes');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Failed to check permissions');
    }
  };

  const loadTaxSchemes = async () => {
    try {
      setLoading(true);
      const data = await taxSchemeService.getAll();
      setTaxSchemes(data);
      setError(null);
    } catch (error) {
      console.error('Error loading tax schemes:', error);
      setError('Failed to load tax schemes');
    } finally {
      setLoading(false);
    }
  };

  const loadTaxRates = async () => {
    try {
      const data = await taxRateService.getAll();
      setTaxRates(data);
    } catch (error) {
      console.error('Error loading tax rates:', error);
    }
  };

  const handleOpenDialog = (taxScheme?: TaxSchemeDto) => {
    if (taxScheme) {
      setEditingTaxScheme(taxScheme);
      setFormData({
        schemeName: taxScheme.schemeName,
        taxRateId: taxScheme.taxRateId,
        description: taxScheme.description || '',
        isActive: taxScheme.isActive
      });
    } else {
      setEditingTaxScheme(null);
      setFormData({
        schemeName: '',
        taxRateId: '',
        description: '',
        isActive: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTaxScheme(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTaxScheme) {
        if (!canUpdate) {
          setError('You do not have permission to update tax schemes');
          return;
        }
        await taxSchemeService.update(editingTaxScheme.id, formData as UpdateTaxSchemeDto);
        setSuccess('Tax scheme updated successfully');
      } else {
        if (!canCreate) {
          setError('You do not have permission to create tax schemes');
          return;
        }
        await taxSchemeService.create(formData);
        setSuccess('Tax scheme created successfully');
      }
      handleCloseDialog();
      loadTaxSchemes();
    } catch (error) {
      console.error('Error saving tax scheme:', error);
      setError('Failed to save tax scheme');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete tax schemes');
      return;
    }

    if (window.confirm('Are you sure you want to delete this tax scheme?')) {
      try {
        await taxSchemeService.delete(id);
        setSuccess('Tax scheme deleted successfully');
        loadTaxSchemes();
      } catch (error) {
        console.error('Error deleting tax scheme:', error);
        setError('Failed to delete tax scheme');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading tax schemes...</Typography>
      </Box>
    );
  }

  if (!canRead) {
    return (
      <Box p={3}>
        <Alert severity="error">
          You do not have permission to view tax schemes.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h4" component="h1">
              Tax Schemes
            </Typography>
            <Box>
              <IconButton onClick={loadTaxSchemes} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Tax Scheme
                </Button>
              )}
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Scheme Name</TableCell>
                  <TableCell>Tax Rate</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {taxSchemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell>{scheme.schemeName}</TableCell>
                    <TableCell>{scheme.taxRateName || scheme.taxRateId}</TableCell>
                    <TableCell>{scheme.description || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={scheme.isActive ? 'Active' : 'Inactive'} 
                        color={scheme.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {canUpdate && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(scheme)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(scheme.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTaxScheme ? 'Edit Tax Scheme' : 'Create Tax Scheme'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <TextField
              fullWidth
              label="Scheme Name"
              value={formData.schemeName}
              onChange={(e) => setFormData({ ...formData, schemeName: e.target.value })}
              required
            />
            <FormControl fullWidth required>
              <InputLabel>Tax Rate</InputLabel>
              <Select
                value={formData.taxRateId}
                onChange={(e) => setFormData({ ...formData, taxRateId: e.target.value })}
                label="Tax Rate"
              >
                {taxRates.map((rate) => (
                  <MenuItem key={rate.id} value={rate.id}>
                    {rate.taxName} ({rate.taxPercentage}%)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
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
          <Button onClick={handleSubmit} variant="contained">
            {editingTaxScheme ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TaxSchemesPage;
