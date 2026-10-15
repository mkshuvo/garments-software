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
  Snackbar
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { warehouseService, WarehouseResponseDto, CreateWarehouseDto, UpdateWarehouseDto } from '../../../services/warehouseService';
import { permissionService } from '../../../services/permissionService';

const WarehousesPage: React.FC = () => {
  const [warehouses, setWarehouses] = useState<WarehouseResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<WarehouseResponseDto | null>(null);
  const [formData, setFormData] = useState<CreateWarehouseDto>({
    warehouseName: '',
    warehouseCode: '',
    address: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    phone: '',
    email: '',
    managerName: '',
    isActive: true,
    description: ''
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
      loadWarehouses();
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
        permissionService.checkPermission(userId, 'Warehouse', 'Read'),
        permissionService.checkPermission(userId, 'Warehouse', 'Create'),
        permissionService.checkPermission(userId, 'Warehouse', 'Update'),
        permissionService.checkPermission(userId, 'Warehouse', 'Delete')
      ]);

      setCanRead(readPerm);
      setCanCreate(createPerm);
      setCanUpdate(updatePerm);
      setCanDelete(deletePerm);

      if (!readPerm) {
        setError('You do not have permission to view warehouses');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Failed to check permissions');
    }
  };

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const data = await warehouseService.getAll();
      setWarehouses(data);
      setError(null);
    } catch (error) {
      console.error('Error loading warehouses:', error);
      setError('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (warehouse?: WarehouseResponseDto) => {
    if (warehouse) {
      setEditingWarehouse(warehouse);
      setFormData({
        warehouseName: warehouse.warehouseName,
        warehouseCode: warehouse.warehouseCode,
        address: warehouse.address || '',
        city: warehouse.city || '',
        state: warehouse.state || '',
        country: warehouse.country || '',
        postalCode: warehouse.postalCode || '',
        phone: warehouse.phone || '',
        email: warehouse.email || '',
        managerName: warehouse.managerName || '',
        isActive: warehouse.isActive,
        description: warehouse.description || ''
      });
    } else {
      setEditingWarehouse(null);
      setFormData({
        warehouseName: '',
        warehouseCode: '',
        address: '',
        city: '',
        state: '',
        country: '',
        postalCode: '',
        phone: '',
        email: '',
        managerName: '',
        isActive: true,
        description: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingWarehouse(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingWarehouse) {
        if (!canUpdate) {
          setError('You do not have permission to update warehouses');
          return;
        }
        await warehouseService.update(editingWarehouse.id, formData as UpdateWarehouseDto);
        setSuccess('Warehouse updated successfully');
      } else {
        if (!canCreate) {
          setError('You do not have permission to create warehouses');
          return;
        }
        await warehouseService.create(formData);
        setSuccess('Warehouse created successfully');
      }
      handleCloseDialog();
      loadWarehouses();
    } catch (error) {
      console.error('Error saving warehouse:', error);
      setError('Failed to save warehouse');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete warehouses');
      return;
    }

    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      try {
        await warehouseService.delete(id);
        setSuccess('Warehouse deleted successfully');
        loadWarehouses();
      } catch (error) {
        console.error('Error deleting warehouse:', error);
        setError('Failed to delete warehouse');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading warehouses...</Typography>
      </Box>
    );
  }

  if (!canRead) {
    return (
      <Box p={3}>
        <Alert severity="error">
          You do not have permission to view warehouses.
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
              Warehouses
            </Typography>
            <Box>
              <IconButton onClick={loadWarehouses} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Warehouse
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
                  <TableCell>Name</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell>City</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {warehouses.map((warehouse) => (
                  <TableRow key={warehouse.id}>
                    <TableCell>{warehouse.warehouseName}</TableCell>
                    <TableCell>{warehouse.warehouseCode}</TableCell>
                    <TableCell>{warehouse.city || '-'}</TableCell>
                    <TableCell>{warehouse.managerName || '-'}</TableCell>
                    <TableCell>
                      <Chip 
                        label={warehouse.isActive ? 'Active' : 'Inactive'} 
                        color={warehouse.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {canUpdate && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(warehouse)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(warehouse.id)}
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

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingWarehouse ? 'Edit Warehouse' : 'Create Warehouse'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Warehouse Name"
                value={formData.warehouseName}
                onChange={(e) => setFormData({ ...formData, warehouseName: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Warehouse Code"
                value={formData.warehouseCode}
                onChange={(e) => setFormData({ ...formData, warehouseCode: e.target.value })}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <TextField
                fullWidth
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Country"
              value={formData.country}
              onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <TextField
                fullWidth
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                type="email"
              />
            </Box>
            <TextField
              fullWidth
              label="Manager Name"
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
            />
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
            {editingWarehouse ? 'Update' : 'Create'}
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

export default WarehousesPage;
