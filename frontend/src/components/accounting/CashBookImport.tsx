import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  LinearProgress,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  CloudUpload,
  FileDownload,
  CheckCircle,
  Error,
  ExpandMore,
  ExpandLess,
  ArrowBack as ArrowBackIcon,
  Home as HomeIcon,
  AccountBalance as AccountBalanceIcon,
  Upload as UploadIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface ImportResult {
  isSuccess: boolean;
  message: string;
  accountsCreated: number;
  contactsCreated: number;
  transactionsImported: number;
  trialBalanceValidated: boolean;
}

interface SampleFormat {
  supported_categories?: {
    credit?: string[];
    debit?: string[];
  };
}

export default function CashBookImportPage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [sampleFormat, setSampleFormat] = useState<SampleFormat | null>(null);
  const [loadingSample, setLoadingSample] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    setImporting(true);
    try {
      const formData = new FormData();
      formData.append('csvFile', selectedFile);

      const response = await fetch('/api/CashBookImport/import-csv', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      const result = await response.json();
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        isSuccess: false,
        message: 'Import failed: ' + (error as Error).message,
        accountsCreated: 0,
        contactsCreated: 0,
        transactionsImported: 0,
        trialBalanceValidated: false
      });
    } finally {
      setImporting(false);
    }
  };

  const handleGetSampleFormat = async () => {
    setLoadingSample(true);
    try {
      const response = await fetch('/api/CashBookImport/sample-format', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const sample = await response.json();
      setSampleFormat(sample);
    } catch (error) {
      console.error('Failed to get sample format:', error);
    } finally {
      setLoadingSample(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
      {/* Navigation Breadcrumbs */}
      <Breadcrumbs sx={{ mb: 3 }}>
        <Link 
          color="inherit" 
          href="/" 
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Home
        </Link>
        <Link 
          color="inherit" 
          href="/admin/accounting" 
          sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}
        >
          <AccountBalanceIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Accounting
        </Link>
        <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
          <UploadIcon sx={{ mr: 0.5 }} fontSize="inherit" />
          Cash Book Import
        </Typography>
      </Breadcrumbs>

      {/* Header with Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            📊 Cash Book Import
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Import MM Fashion cash book data from CSV files into the accounting system
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push('/admin/accounting')}
          sx={{ minWidth: 120 }}
        >
          Back to Accounting
        </Button>
      </Box>

      <Stack spacing={3}>
        {/* File Upload Section */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Upload Cash Book CSV
                </Typography>
                
                <Box sx={{ mb: 3 }}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                    id="csv-file-input"
                  />
                  <label htmlFor="csv-file-input">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<CloudUpload />}
                      fullWidth
                      sx={{ py: 2 }}
                    >
                      Select CSV File
                    </Button>
                  </label>
                </Box>

                {selectedFile && (
                  <Box sx={{ mb: 2 }}>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <strong>File Selected:</strong> {selectedFile.name}<br />
                      <strong>Size:</strong> {(selectedFile.size / 1024).toFixed(1)} KB
                    </Alert>
                  </Box>
                )}

                <Button
                  variant="contained"
                  onClick={handleImport}
                  disabled={!selectedFile || importing}
                  fullWidth
                  sx={{ py: 1.5 }}
                >
                  {importing ? 'Importing...' : 'Import Cash Book'}
                </Button>

                {importing && (
                  <Box sx={{ mt: 2 }}>
                    <LinearProgress />
                    <Typography variant="body2" sx={{ mt: 1, textAlign: 'center' }}>
                      Processing cash book data...
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>

          {/* Sample Format Section */}
          <Box sx={{ flex: 1 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  CSV Format Guide
                </Typography>
                
                <Button
                  variant="outlined"
                  onClick={handleGetSampleFormat}
                  startIcon={<FileDownload />}
                  disabled={loadingSample}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  {loadingSample ? 'Loading...' : 'Get Format Details'}
                </Button>

                {sampleFormat && (
                  <Box>
                    <Alert severity="info" sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        MM Fashion Cash Book Format
                      </Typography>
                      <Typography variant="body2">
                        The CSV should contain both credit (money in) and debit (money out) transactions
                        with categories, suppliers, buyers, and amounts.
                      </Typography>
                    </Alert>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Supported Credit Categories:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {sampleFormat.supported_categories?.credit?.map((category: string, index: number) => (
                          <Chip key={index} label={category} size="small" color="success" />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" gutterBottom>
                        Supported Debit Categories:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {sampleFormat.supported_categories?.debit?.slice(0, 8).map((category: string, index: number) => (
                          <Chip key={index} label={category} size="small" color="warning" />
                        ))}
                        {(sampleFormat.supported_categories?.debit?.length ?? 0) > 8 && (
                          <Chip label={`+${(sampleFormat.supported_categories?.debit?.length ?? 0) - 8} more`} size="small" />
                        )}
                      </Box>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Box>
        </Stack>

        {/* Import Results Section */}
        {importResult && (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">
                  Import Results
                </Typography>
                <IconButton onClick={() => setShowDetails(!showDetails)}>
                  {showDetails ? <ExpandLess /> : <ExpandMore />}
                </IconButton>
              </Box>

              <Alert
                severity={importResult.isSuccess ? 'success' : 'error'}
                icon={importResult.isSuccess ? <CheckCircle /> : <Error />}
                sx={{ mb: 2 }}
              >
                {importResult.message}
              </Alert>

              {importResult.isSuccess && (
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <Typography variant="h4" color="primary.main">
                      {importResult.accountsCreated}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accounts Created
                    </Typography>
                  </Box>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <Typography variant="h4" color="secondary.main">
                      {importResult.contactsCreated}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Contacts Created
                    </Typography>
                  </Box>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <Typography variant="h4" color="success.main">
                      {importResult.transactionsImported}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transactions Imported
                    </Typography>
                  </Box>
                  <Box textAlign="center" sx={{ flex: 1 }}>
                    <Typography variant="h4" color={importResult.trialBalanceValidated ? 'success.main' : 'warning.main'}>
                      {importResult.trialBalanceValidated ? '✓' : '?'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Trial Balance
                    </Typography>
                  </Box>
                </Stack>
              )}

              <Collapse in={showDetails}>
                <Divider sx={{ mb: 2 }} />
                <Typography variant="subtitle2" gutterBottom>
                  Import Details:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Chart of Accounts"
                      secondary={`${importResult.accountsCreated} new accounts created with proper categorization`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Contacts"
                      secondary={`${importResult.contactsCreated} suppliers and customers created`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Journal Entries"
                      secondary={`${importResult.transactionsImported} double-entry transactions recorded`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Trial Balance Validation"
                      secondary={importResult.trialBalanceValidated ? 'Validated against provided trial balance' : 'Manual validation recommended'}
                    />
                  </ListItem>
                </List>
              </Collapse>
            </CardContent>
          </Card>
        )}
      </Stack>

      {/* Instructions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Import Instructions
          </Typography>
          <List>
            <ListItem>
              <ListItemText
                primary="1. Prepare CSV File"
                secondary="Ensure your CSV follows the MM Fashion cash book format with credit and debit sections"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="2. Upload and Import"
                secondary="Select your CSV file and click Import. The system will create accounts, contacts, and transactions automatically"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="3. Review Results"
                secondary="Check the import results and verify the created accounts and transactions in the respective modules"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="4. Post Processing"
                secondary="Review and approve journal entries, reconcile accounts, and generate reports as needed"
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
