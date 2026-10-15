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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import { businessSettingService, BusinessSettingDto, CreateBusinessSettingDto, UpdateBusinessSettingDto } from '../../../services/businessSettingService';
import { permissionService } from '../../../services/permissionService';

const BusinessSettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<BusinessSettingDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSetting, setEditingSetting] = useState<BusinessSettingDto | null>(null);
  const [formData, setFormData] = useState<CreateBusinessSettingDto>({
    settingKey: '',
    value: '',
    category: '',
    description: '',
    dataType: 'string',
    isSystem: false,
    isActive: true,
    validationRules: ''
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
      loadSettings();
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
        permissionService.checkPermission(userId, 'BusinessSetting', 'Read'),
        permissionService.checkPermission(userId, 'BusinessSetting', 'Create'),
        permissionService.checkPermission(userId, 'BusinessSetting', 'Update'),
        permissionService.checkPermission(userId, 'BusinessSetting', 'Delete')
      ]);

      setCanRead(readPerm);
      setCanCreate(createPerm);
      setCanUpdate(updatePerm);
      setCanDelete(deletePerm);

      if (!readPerm) {
        setError('You do not have permission to view business settings');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Failed to check permissions');
    }
  };

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await businessSettingService.getAll();
      setSettings(data);
      setError(null);
    } catch (error) {
      console.error('Error loading business settings:', error);
      setError('Failed to load business settings');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (setting?: BusinessSettingDto) => {
    if (setting) {
      setEditingSetting(setting);
      setFormData({
        settingKey: setting.settingKey,
        value: setting.value,
        category: setting.category,
        description: setting.description || '',
        dataType: setting.dataType,
        isSystem: setting.isSystem,
        isActive: setting.isActive,
        validationRules: setting.validationRules || ''
      });
    } else {
      setEditingSetting(null);
      setFormData({
        settingKey: '',
        value: '',
        category: '',
        description: '',
        dataType: 'string',
        isSystem: false,
        isActive: true,
        validationRules: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSetting(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingSetting) {
        if (!canUpdate) {
          setError('You do not have permission to update business settings');
          return;
        }
        await businessSettingService.update(editingSetting.id, formData as UpdateBusinessSettingDto);
        setSuccess('Business setting updated successfully');
      } else {
        if (!canCreate) {
          setError('You do not have permission to create business settings');
          return;
        }
        await businessSettingService.create(formData);
        setSuccess('Business setting created successfully');
      }
      handleCloseDialog();
      loadSettings();
    } catch (error) {
      console.error('Error saving business setting:', error);
      setError('Failed to save business setting');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete business settings');
      return;
    }

    if (window.confirm('Are you sure you want to delete this business setting?')) {
      try {
        await businessSettingService.delete(id);
        setSuccess('Business setting deleted successfully');
        loadSettings();
      } catch (error) {
        console.error('Error deleting business setting:', error);
        setError('Failed to delete business setting');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading business settings...</Typography>
      </Box>
    );
  }

  if (!canRead) {
    return (
      <Box p={3}>
        <Alert severity="error">
          You do not have permission to view business settings.
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
              Business Settings
            </Typography>
            <Box>
              <IconButton onClick={loadSettings} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Setting
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
                  <TableCell>Key</TableCell>
                  <TableCell>Value</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Data Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {settings.map((setting) => (
                  <TableRow key={setting.id}>
                    <TableCell>{setting.settingKey}</TableCell>
                    <TableCell>{setting.value}</TableCell>
                    <TableCell>
                      <Chip label={setting.category} size="small" />
                    </TableCell>
                    <TableCell>{setting.dataType}</TableCell>
                    <TableCell>
                      <Chip 
                        label={setting.isActive ? 'Active' : 'Inactive'} 
                        color={setting.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={setting.isSystem ? 'System' : 'User'} 
                        color={setting.isSystem ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {canUpdate && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(setting)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete && !setting.isSystem && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(setting.id)}
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
          {editingSetting ? 'Edit Business Setting' : 'Create Business Setting'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Setting Key"
                value={formData.settingKey}
                onChange={(e) => setFormData({ ...formData, settingKey: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <MenuItem value="General">General</MenuItem>
                  <MenuItem value="System">System</MenuItem>
                  <MenuItem value="Security">Security</MenuItem>
                  <MenuItem value="UI">UI</MenuItem>
                  <MenuItem value="Business">Business</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Value"
              value={formData.value}
              onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Data Type</InputLabel>
                <Select
                  value={formData.dataType}
                  onChange={(e) => setFormData({ ...formData, dataType: e.target.value })}
                >
                  <MenuItem value="string">String</MenuItem>
                  <MenuItem value="int">Integer</MenuItem>
                  <MenuItem value="decimal">Decimal</MenuItem>
                  <MenuItem value="bool">Boolean</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="json">JSON</MenuItem>
                </Select>
              </FormControl>
              <TextField
                fullWidth
                label="Validation Rules"
                value={formData.validationRules}
                onChange={(e) => setFormData({ ...formData, validationRules: e.target.value })}
              />
            </Box>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
            />
            <Box sx={{ display: 'flex', gap: 4 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isSystem}
                    onChange={(e) => setFormData({ ...formData, isSystem: e.target.checked })}
                  />
                }
                label="System Setting"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSetting ? 'Update' : 'Create'}
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

export default BusinessSettingsPage;
