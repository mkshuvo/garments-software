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
import { reportTemplateService, ReportTemplateDto, CreateReportTemplateDto, UpdateReportTemplateDto } from '../../../services/reportTemplateService';
import { permissionService } from '../../../services/permissionService';

const ReportTemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<ReportTemplateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ReportTemplateDto | null>(null);
  const [formData, setFormData] = useState<CreateReportTemplateDto>({
    templateName: '',
    reportType: '',
    templateContent: '',
    description: '',
    isActive: true,
    isSystem: false,
    parameters: ''
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
      loadTemplates();
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
        permissionService.checkPermission(userId, 'ReportTemplate', 'Read'),
        permissionService.checkPermission(userId, 'ReportTemplate', 'Create'),
        permissionService.checkPermission(userId, 'ReportTemplate', 'Update'),
        permissionService.checkPermission(userId, 'ReportTemplate', 'Delete')
      ]);

      setCanRead(readPerm);
      setCanCreate(createPerm);
      setCanUpdate(updatePerm);
      setCanDelete(deletePerm);

      if (!readPerm) {
        setError('You do not have permission to view report templates');
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
      setError('Failed to check permissions');
    }
  };

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportTemplateService.getAll();
      setTemplates(data);
      setError(null);
    } catch (error) {
      console.error('Error loading report templates:', error);
      setError('Failed to load report templates');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (template?: ReportTemplateDto) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        templateName: template.templateName,
        reportType: template.reportType,
        templateContent: template.templateContent,
        description: template.description || '',
        isActive: template.isActive,
        isSystem: template.isSystem,
        parameters: template.parameters || ''
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        templateName: '',
        reportType: '',
        templateContent: '',
        description: '',
        isActive: true,
        isSystem: false,
        parameters: ''
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingTemplate(null);
  };

  const handleSubmit = async () => {
    try {
      if (editingTemplate) {
        if (!canUpdate) {
          setError('You do not have permission to update report templates');
          return;
        }
        await reportTemplateService.update(editingTemplate.id, formData as UpdateReportTemplateDto);
        setSuccess('Report template updated successfully');
      } else {
        if (!canCreate) {
          setError('You do not have permission to create report templates');
          return;
        }
        await reportTemplateService.create(formData);
        setSuccess('Report template created successfully');
      }
      handleCloseDialog();
      loadTemplates();
    } catch (error) {
      console.error('Error saving report template:', error);
      setError('Failed to save report template');
    }
  };

  const handleDelete = async (id: string) => {
    if (!canDelete) {
      setError('You do not have permission to delete report templates');
      return;
    }

    if (window.confirm('Are you sure you want to delete this report template?')) {
      try {
        await reportTemplateService.delete(id);
        setSuccess('Report template deleted successfully');
        loadTemplates();
      } catch (error) {
        console.error('Error deleting report template:', error);
        setError('Failed to delete report template');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Typography>Loading report templates...</Typography>
      </Box>
    );
  }

  if (!canRead) {
    return (
      <Box p={3}>
        <Alert severity="error">
          You do not have permission to view report templates.
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
              Report Templates
            </Typography>
            <Box>
              <IconButton onClick={loadTemplates} sx={{ mr: 1 }}>
                <RefreshIcon />
              </IconButton>
              {canCreate && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog()}
                >
                  Add Template
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
                  <TableCell>Template Name</TableCell>
                  <TableCell>Report Type</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>System</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {templates.map((template) => (
                  <TableRow key={template.id}>
                    <TableCell>{template.templateName}</TableCell>
                    <TableCell>
                      <Chip label={template.reportType} size="small" />
                    </TableCell>
                    <TableCell>{template.createdByName || template.createdBy}</TableCell>
                    <TableCell>
                      <Chip 
                        label={template.isActive ? 'Active' : 'Inactive'} 
                        color={template.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={template.isSystem ? 'System' : 'User'} 
                        color={template.isSystem ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {canUpdate && (
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(template)}
                          sx={{ mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                      {canDelete && !template.isSystem && (
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(template.id)}
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
          {editingTemplate ? 'Edit Report Template' : 'Create Report Template'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mt: 1 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                label="Template Name"
                value={formData.templateName}
                onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                  required
                >
                  <MenuItem value="Financial">Financial</MenuItem>
                  <MenuItem value="Inventory">Inventory</MenuItem>
                  <MenuItem value="Sales">Sales</MenuItem>
                  <MenuItem value="Purchase">Purchase</MenuItem>
                  <MenuItem value="Tax">Tax</MenuItem>
                  <MenuItem value="Custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="Template Content"
              value={formData.templateContent}
              onChange={(e) => setFormData({ ...formData, templateContent: e.target.value })}
              required
              multiline
              rows={8}
              placeholder="Enter template content (HTML, JSON, or other format)"
            />
            <TextField
              fullWidth
              label="Parameters"
              value={formData.parameters}
              onChange={(e) => setFormData({ ...formData, parameters: e.target.value })}
              multiline
              rows={3}
              placeholder="Template parameters (JSON format)"
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
                label="System Template"
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingTemplate ? 'Update' : 'Create'}
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

export default ReportTemplatesPage;
