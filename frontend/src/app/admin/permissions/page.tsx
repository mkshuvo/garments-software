'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
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
  Alert,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { permissionService, Permission, CreatePermissionDto, UpdatePermissionDto } from '@/services/permissionService';

const PermissionsPage = () => {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [formData, setFormData] = useState<CreatePermissionDto>({
    name: '',
    resource: '',
    action: '',
    description: '',
    isActive: true,
  });

  useEffect(() => {
    loadPermissions();
  }, []);

  const loadPermissions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await permissionService.getAllPermissions();
      setPermissions(data);
    } catch (error) {
      const errorResponse = error as { response?: { status?: number } };
      if (errorResponse.response?.status === 403) {
        setError('You do not have permission to view permissions');
      } else {
        console.error('Error loading permissions:', error);
        setError('Failed to load permissions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      if (editingPermission) {
        // Update
        const updateDto: UpdatePermissionDto = { ...formData };
        await permissionService.updatePermission(editingPermission.id, updateDto);
      } else {
        // Create
        await permissionService.createPermission(formData);
      }
      
      await loadPermissions();
      handleCloseDialog();
    } catch (error) {
      const errorResponse = error as { response?: { status?: number } };
      if (errorResponse.response?.status === 403) {
        if (editingPermission) {
          setError('You do not have permission to update permissions');
        } else {
          setError('You do not have permission to create permissions');
        }
      } else {
        console.error('Error saving permission:', error);
        setError('Failed to save permission');
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this permission?')) return;
    
    try {
      setError(null);
      await permissionService.deletePermission(id);
      await loadPermissions();
    } catch (error) {
      const errorResponse = error as { response?: { status?: number } };
      if (errorResponse.response?.status === 403) {
        setError('You do not have permission to delete permissions');
      } else {
        console.error('Error deleting permission:', error);
        setError('Failed to delete permission');
      }
    }
  };

  const handleEdit = (permission: Permission) => {
    setEditingPermission(permission);
    setFormData({
      name: permission.name,
      resource: permission.resource,
      action: permission.action,
      description: permission.description || '',
      isActive: permission.isActive,
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingPermission(null);
    setFormData({
      name: '',
      resource: '',
      action: '',
      description: '',
      isActive: true,
    });
  };

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography>Loading permissions...</Typography>
      </Container>
    );
  }

  if (error && error.includes('permission')) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          You do not have permission to view permissions.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={4}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <AdminIcon color="primary" sx={{ fontSize: 40 }} />
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Permissions
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage system permissions for users and roles
              </Typography>
            </Box>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            size="large"
          >
            Add Permission
          </Button>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Permissions Table */}
        <Card>
          <CardContent>
            <TableContainer component={Paper} elevation={0}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Resource</strong></TableCell>
                    <TableCell><strong>Action</strong></TableCell>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {permissions.map((permission) => (
                    <TableRow key={permission.id} hover>
                      <TableCell>{permission.name}</TableCell>
                      <TableCell>
                        <Chip label={permission.resource} variant="outlined" size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={permission.action} 
                          color={
                            permission.action === 'Create' ? 'success' :
                            permission.action === 'Read' ? 'info' :
                            permission.action === 'Update' ? 'warning' :
                            permission.action === 'Delete' ? 'error' : 'default'
                          }
                          variant="outlined" 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{permission.description}</TableCell>
                      <TableCell>
                        <Chip 
                          label={permission.isActive ? 'Active' : 'Inactive'} 
                          color={permission.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <IconButton
                          onClick={() => handleEdit(permission)}
                          color="primary"
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(permission.id)}
                          color="error"
                          size="small"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Add/Edit Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            {editingPermission ? 'Edit Permission' : 'Add New Permission'}
          </DialogTitle>
          <DialogContent>
            <Stack spacing={3} sx={{ mt: 1 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
              
              <TextField
                label="Resource"
                value={formData.resource}
                onChange={(e) => setFormData({ ...formData, resource: e.target.value })}
                fullWidth
                required
                placeholder="e.g., Currency, ProductCategory"
              />
              
              <FormControl fullWidth required>
                <InputLabel>Action</InputLabel>
                <Select
                  value={formData.action}
                  onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                  label="Action"
                >
                  <MenuItem value="Create">Create</MenuItem>
                  <MenuItem value="Read">Read</MenuItem>
                  <MenuItem value="Update">Update</MenuItem>
                  <MenuItem value="Delete">Delete</MenuItem>
                </Select>
              </FormControl>
              
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                fullWidth
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
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained"
              disabled={!formData.name || !formData.resource || !formData.action}
            >
              {editingPermission ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Stack>
    </Container>
  );
};

export default PermissionsPage;
