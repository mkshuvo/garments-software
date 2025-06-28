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
  Business as BusinessIcon,
} from '@mui/icons-material';
import { companyService } from '@/services/companyService';
import { permissionService } from '@/services/permissionService';

interface Company {
  id: string;
  companyName: string;
  legalName: string;
  taxId?: string;
  address?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  email?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
}

interface CompanyFormData {
  companyName: string;
  legalName: string;
  taxId: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  isActive: boolean;
}

const CompaniesPage = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: '',
    legalName: '',
    taxId: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    email: '',
    website: '',
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
        permissionService.checkPermission(userId, 'Company', 'Read'),
        permissionService.checkPermission(userId, 'Company', 'Create'),
        permissionService.checkPermission(userId, 'Company', 'Update'),
        permissionService.checkPermission(userId, 'Company', 'Delete'),
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

  const loadCompanies = useCallback(async () => {
    if (!permissions.canRead) {
      setError('You do not have permission to view companies');
      return;
    }

    setLoading(true);
    try {
      const data = await companyService.getAll();
      setCompanies(data);
      setError(null);
    } catch (error) {
      setError('Failed to load companies');
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  }, [permissions.canRead]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  useEffect(() => {
    if (permissions.canRead) {
      loadCompanies();
    }
  }, [permissions.canRead, loadCompanies]);

  const handleOpenDialog = (company?: Company) => {
    if (company) {
      if (!permissions.canUpdate) {
        setError('You do not have permission to edit companies');
        return;
      }
      setEditingCompany(company);
      setFormData({
        companyName: company.companyName,
        legalName: company.legalName,
        taxId: company.taxId || '',
        address: company.address || '',
        city: company.city || '',
        state: company.state || '',
        postalCode: company.postalCode || '',
        country: company.country || '',
        phone: company.phone || '',
        email: company.email || '',
        website: company.website || '',
        isActive: company.isActive,
      });
    } else {
      if (!permissions.canCreate) {
        setError('You do not have permission to create companies');
        return;
      }
      setEditingCompany(null);
      setFormData({
        companyName: '',
        legalName: '',
        taxId: '',
        address: '',
        city: '',
        state: '',
        postalCode: '',
        country: '',
        phone: '',
        email: '',
        website: '',
        isActive: true,
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCompany(null);
    setFormData({
      companyName: '',
      legalName: '',
      taxId: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
      email: '',
      website: '',
      isActive: true,
    });
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        companyName: formData.companyName,
        legalName: formData.legalName,
        taxId: formData.taxId || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        postalCode: formData.postalCode || undefined,
        country: formData.country || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        website: formData.website || undefined,
        isActive: formData.isActive,
      };

      if (editingCompany) {
        await companyService.update(editingCompany.id, submitData);
        setSuccess('Company updated successfully');
      } else {
        await companyService.create(submitData);
        setSuccess('Company created successfully');
      }
      
      handleCloseDialog();
      loadCompanies();
    } catch (error) {
      setError('Failed to save company');
      console.error('Error saving company:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!permissions.canDelete) {
      setError('You do not have permission to delete companies');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this company?')) {
      return;
    }

    try {
      await companyService.delete(id);
      setSuccess('Company deleted successfully');
      loadCompanies();
    } catch (error) {
      setError('Failed to delete company');
      console.error('Error deleting company:', error);
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
          Companies
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadCompanies}
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
              Add Company
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
                <TableCell>Company</TableCell>
                <TableCell>Legal Name</TableCell>
                <TableCell>Tax ID</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BusinessIcon color="primary" />
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {company.companyName}
                        </Typography>
                        {company.website && (
                          <Typography variant="caption" color="primary">
                            {company.website}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{company.legalName}</TableCell>
                  <TableCell>{company.taxId || '-'}</TableCell>
                  <TableCell>
                    {company.email && (
                      <Typography variant="body2">{company.email}</Typography>
                    )}
                    {company.phone && (
                      <Typography variant="caption" color="text.secondary">
                        {company.phone}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {company.city && company.state 
                      ? `${company.city}, ${company.state}${company.country ? `, ${company.country}` : ''}`
                      : company.country || '-'
                    }
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.isActive ? 'Active' : 'Inactive'}
                      color={company.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {permissions.canUpdate && (
                      <IconButton
                        size="small"
                        onClick={() => handleOpenDialog(company)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {permissions.canDelete && (
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(company.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {companies.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    <Typography variant="body2" color="text.secondary">
                      No companies found
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="lg" fullWidth>
        <DialogTitle>
          {editingCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Company Name"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Legal Name"
                value={formData.legalName}
                onChange={(e) => setFormData({ ...formData, legalName: e.target.value })}
                required
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Tax ID"
                value={formData.taxId}
                onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                fullWidth
              />
              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                fullWidth
              />
              <TextField
                label="Website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                fullWidth
              />
            </Box>
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              fullWidth
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                fullWidth
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                fullWidth
              />
              <TextField
                label="Postal Code"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                fullWidth
              />
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <TextField
                label="Country"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
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
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!formData.companyName.trim() || !formData.legalName.trim()}
          >
            {editingCompany ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CompaniesPage;
