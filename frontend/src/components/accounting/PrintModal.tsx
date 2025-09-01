import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Typography,
  Box,
  Grid,
  Paper,
  Divider
} from '@mui/material';
import {
  Print as PrintIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { JournalEntry } from '@/services/journalEntryService';

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: JournalEntry[];
  filters: {
    dateFrom?: Date | null;
    dateTo?: Date | null;
    transactionType?: 'All' | 'Credit' | 'Debit';
    category?: string;
    status?: string;
    amountMin?: number;
    amountMax?: number;
    referenceNumber?: string;
    contactName?: string;
    description?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  };
  totalEntries: number;
}

interface PrintOptions {
  pageSize: 'A4' | 'Letter' | 'Legal';
  orientation: 'portrait' | 'landscape';
  includeFilters: boolean;
  includeSummary: boolean;
  includeHeaders: boolean;
  compactMode: boolean;
}

const DEFAULT_PRINT_OPTIONS: PrintOptions = {
  pageSize: 'A4',
  orientation: 'portrait',
  includeFilters: true,
  includeSummary: true,
  includeHeaders: true,
  compactMode: false
};

export function PrintModal({ isOpen, onClose, entries, filters, totalEntries }: PrintModalProps) {
  const [printOptions, setPrintOptions] = useState<PrintOptions>(DEFAULT_PRINT_OPTIONS);
  const handlePrintOptionsChange = (field: keyof PrintOptions, value: string | boolean) => {
    setPrintOptions(prev => ({ ...prev, [field]: value }));
  };

  const formatCurrency = (amount: number) => `৳${amount.toFixed(2)}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const calculateSummary = () => {
    const totalDebits = entries
      .filter(entry => entry.type === 'Debit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    const totalCredits = entries
      .filter(entry => entry.type === 'Credit')
      .reduce((sum, entry) => sum + entry.amount, 0);
    
    return {
      totalEntries: entries.length,
      totalDebits,
      totalCredits,
      balance: totalCredits - totalDebits
    };
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const summary = calculateSummary();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Journal Entries Report</title>
          <style>
            @media print {
              @page {
                size: ${printOptions.pageSize} ${printOptions.orientation};
                margin: 1in;
              }
            }
            body {
              font-family: Arial, sans-serif;
              font-size: ${printOptions.compactMode ? '10px' : '12px'};
              line-height: 1.4;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 20px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .filters {
              margin-bottom: 20px;
              padding: 15px;
              background-color: #f5f5f5;
              border-radius: 5px;
            }
            .summary {
              margin-bottom: 20px;
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 15px;
            }
            .summary-card {
              padding: 15px;
              background-color: #f9f9f9;
              border: 1px solid #ddd;
              border-radius: 5px;
              text-align: center;
            }
            .summary-value {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .summary-label {
              font-size: 12px;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: ${printOptions.compactMode ? '4px 6px' : '8px 12px'};
              text-align: left;
            }
            th {
              background-color: #f2f2f2;
              font-weight: bold;
            }
            .credit { color: #2e7d32; }
            .debit { color: #d32f2f; }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 10px;
              color: #666;
              border-top: 1px solid #ddd;
              padding-top: 10px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Journal Entries Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
          </div>

          ${printOptions.includeFilters ? `
            <div class="filters">
              <h3>Applied Filters</h3>
                             <p><strong>Date Range:</strong> ${filters.dateFrom ? formatDate(filters.dateFrom.toISOString()) : 'All'} - ${filters.dateTo ? formatDate(filters.dateTo.toISOString()) : 'All'}</p>
              <p><strong>Type:</strong> ${filters.transactionType || 'All'}</p>
              <p><strong>Category:</strong> ${filters.category || 'All'}</p>
              <p><strong>Status:</strong> ${filters.status || 'All'}</p>
            </div>
          ` : ''}

          ${printOptions.includeSummary ? `
            <div class="summary">
              <div class="summary-card">
                <div class="summary-value">${summary.totalEntries}</div>
                <div class="summary-label">Total Entries</div>
              </div>
              <div class="summary-card">
                <div class="summary-value credit">${formatCurrency(summary.totalCredits)}</div>
                <div class="summary-label">Total Credits</div>
              </div>
              <div class="summary-card">
                <div class="summary-value debit">${formatCurrency(summary.totalDebits)}</div>
                <div class="summary-label">Total Debits</div>
              </div>
              <div class="summary-card">
                <div class="summary-value ${summary.balance >= 0 ? 'credit' : 'debit'}">${summary.balance >= 0 ? '+' : '-'}${formatCurrency(Math.abs(summary.balance))}</div>
                <div class="summary-label">Net Balance</div>
              </div>
            </div>
          ` : ''}

          <table>
            <thead>
              <tr>
                <th>Journal #</th>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Particulars</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Contact</th>
              </tr>
            </thead>
            <tbody>
              ${entries.map(entry => `
                <tr>
                  <td>${entry.journalNumber}</td>
                  <td>${formatDate(entry.transactionDate)}</td>
                  <td><span class="${entry.type.toLowerCase()}">${entry.type}</span></td>
                  <td>${entry.categoryName}</td>
                  <td>${entry.particulars}</td>
                  <td class="${entry.type.toLowerCase()}">${formatCurrency(entry.amount)}</td>
                  <td>${entry.referenceNumber}</td>
                  <td>${entry.contactName || '-'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>Report generated from Garments ERP System</p>
            <p>Total entries: ${entries.length} of ${totalEntries}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Wait for content to load then print
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  };

  const summary = calculateSummary();

  return (
    <>
      <Dialog 
        open={isOpen} 
        onClose={onClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PrintIcon />
            Print Journal Entries
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Grid container spacing={3}>
            {/* Print Options */}
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>Print Options</Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Page Size</InputLabel>
                <Select
                  value={printOptions.pageSize}
                  label="Page Size"
                  onChange={(e) => handlePrintOptionsChange('pageSize', e.target.value)}
                >
                  <MenuItem value="A4">A4</MenuItem>
                  <MenuItem value="Letter">Letter</MenuItem>
                  <MenuItem value="Legal">Legal</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Orientation</InputLabel>
                <Select
                  value={printOptions.orientation}
                  label="Orientation"
                  onChange={(e) => handlePrintOptionsChange('orientation', e.target.value)}
                >
                  <MenuItem value="portrait">Portrait</MenuItem>
                  <MenuItem value="landscape">Landscape</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.includeFilters}
                    onChange={(e) => handlePrintOptionsChange('includeFilters', e.target.checked)}
                  />
                }
                label="Include applied filters"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.includeSummary}
                    onChange={(e) => handlePrintOptionsChange('includeSummary', e.target.checked)}
                  />
                }
                label="Include summary"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.includeHeaders}
                    onChange={(e) => handlePrintOptionsChange('includeHeaders', e.target.checked)}
                  />
                }
                label="Include headers"
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={printOptions.compactMode}
                    onChange={(e) => handlePrintOptionsChange('compactMode', e.target.checked)}
                  />
                }
                label="Compact mode"
              />
            </Grid>

            {/* Preview */}
            <Grid component="div" size={{ xs: 12, md: 6 }}>
              <Typography variant="h6" gutterBottom>Preview</Typography>
              
              <Paper sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {entries.length} entries will be printed
                </Typography>
                
                                 {printOptions.includeSummary && (
                   <Box sx={{ mb: 2 }}>
                     <Typography variant="subtitle2" gutterBottom>Summary</Typography>
                     <Grid container spacing={1}>
                       <Grid component="div" size={{ xs: 6 }}>
                         <Typography variant="body2">Total: {summary.totalEntries}</Typography>
                       </Grid>
                       <Grid component="div" size={{ xs: 6 }}>
                         <Typography variant="body2" color="success.main">
                           Credits: {formatCurrency(summary.totalCredits)}
                         </Typography>
                       </Grid>
                       <Grid component="div" size={{ xs: 6 }}>
                         <Typography variant="body2" color="error.main">
                           Debits: {formatCurrency(summary.totalDebits)}
                         </Typography>
                       </Grid>
                       <Grid component="div" size={{ xs: 6 }}>
                         <Typography variant="body2" color={summary.balance >= 0 ? 'success.main' : 'error.main'}>
                           Balance: {summary.balance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(summary.balance))}
                         </Typography>
                       </Grid>
                     </Grid>
                   </Box>
                 )}

                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" color="text.secondary">
                  Page Size: {printOptions.pageSize} ({printOptions.orientation})
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Compact Mode: {printOptions.compactMode ? 'Yes' : 'No'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose} startIcon={<CloseIcon />}>
            Cancel
          </Button>
          <Button 
            onClick={handlePrint} 
            startIcon={<PrintIcon />}
            variant="contained"
            color="primary"
          >
            Print
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default PrintModal;
