'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  IconButton,
  useTheme
} from '@mui/material'
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Help as HelpIcon,
  Keyboard as KeyboardIcon,
  Assessment as AssessmentIcon,
  GetApp as ExportIcon,
  Compare as CompareIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material'

interface TrialBalanceHelpProps {
  open: boolean
  onClose: () => void
}

export const TrialBalanceHelp: React.FC<TrialBalanceHelpProps> = ({
  open,
  onClose
}) => {
  const theme = useTheme()
  const [expandedPanel, setExpandedPanel] = useState<string | false>('overview')

  const handleAccordionChange = (panel: string) => (
    event: React.SyntheticEvent,
    isExpanded: boolean
  ) => {
    setExpandedPanel(isExpanded ? panel : false)
  }

  const keyboardShortcuts = [
    { key: 'Ctrl + R', description: 'Refresh the current report' },
    { key: 'Ctrl + E', description: 'Export report (defaults to PDF)' },
    { key: 'Ctrl + C', description: 'Compare periods (Admin only)' },
    { key: 'Ctrl + G', description: 'Generate comparison (on comparison page)' },
    { key: 'Escape', description: 'Close open modals or dialogs' }
  ]

  const features = [
    {
      icon: <AssessmentIcon color="primary" />,
      title: 'Trial Balance Generation',
      description: 'Generate comprehensive trial balance reports for any date range'
    },
    {
      icon: <AccountBalanceIcon color="primary" />,
      title: 'Account Categorization',
      description: 'View accounts organized by Assets, Liabilities, Equity, Income, and Expenses'
    },
    {
      icon: <ExportIcon color="primary" />,
      title: 'Export Options',
      description: 'Export reports as PDF for printing or CSV for spreadsheet analysis'
    },
    {
      icon: <CompareIcon color="primary" />,
      title: 'Period Comparison',
      description: 'Compare trial balances across different periods (Admin only)'
    }
  ]

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        pb: 1
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon color="primary" />
          <Typography variant="h6" component="h2">
            Trial Balance Help
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ px: 3, py: 2 }}>
        {/* Overview */}
        <Accordion 
          expanded={expandedPanel === 'overview'} 
          onChange={handleAccordionChange('overview')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">What is a Trial Balance?</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              A trial balance is a fundamental accounting report that lists all accounts with their 
              debit and credit balances. It serves as a verification tool to ensure that total 
              debits equal total credits, confirming the accuracy of your double-entry bookkeeping system.
            </Typography>
            <Typography variant="body2" paragraph>
              In this system, debits are represented as negative values and credits as positive values. 
              The final calculation shows the mathematical expression and resulting trial balance total.
            </Typography>
            <Box sx={{ 
              p: 2, 
              backgroundColor: theme.palette.grey[50], 
              borderRadius: 1,
              border: `1px solid ${theme.palette.grey[200]}`
            }}>
              <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                Example: 1000 - 1100 + 11000 - 1000 = 9900
              </Typography>
            </Box>
          </AccordionDetails>
        </Accordion>

        {/* Features */}
        <Accordion 
          expanded={expandedPanel === 'features'} 
          onChange={handleAccordionChange('features')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Key Features</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {features.map((feature, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {feature.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={feature.title}
                    secondary={feature.description}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* How to Use */}
        <Accordion 
          expanded={expandedPanel === 'usage'} 
          onChange={handleAccordionChange('usage')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">How to Use</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom>
              1. Select Date Range
            </Typography>
            <Typography variant="body2" paragraph>
              Choose your desired start and end dates using the date pickers, or select from 
              preset options like &ldquo;This Month&rdquo; or &ldquo;Last Quarter&rdquo;.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              2. Generate Report
            </Typography>
            <Typography variant="body2" paragraph>
              The report will automatically generate when you change the date range. You can 
              also manually refresh using the refresh button or Ctrl+R.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              3. Review Results
            </Typography>
            <Typography variant="body2" paragraph>
              Review the categorized account balances and the final calculation. Click on any 
              account to drill down into detailed transactions.
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              4. Export or Compare
            </Typography>
            <Typography variant="body2" paragraph>
              Export your report as PDF or CSV, or use the comparison feature to analyze 
              changes between different periods.
            </Typography>
          </AccordionDetails>
        </Accordion>

        {/* Keyboard Shortcuts */}
        <Accordion 
          expanded={expandedPanel === 'shortcuts'} 
          onChange={handleAccordionChange('shortcuts')}
          sx={{ mb: 1 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <KeyboardIcon />
              <Typography variant="h6">Keyboard Shortcuts</Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            <List dense>
              {keyboardShortcuts.map((shortcut, index) => (
                <ListItem key={index} sx={{ px: 0 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Chip 
                          label={shortcut.key} 
                          size="small" 
                          variant="outlined"
                          sx={{ fontFamily: 'monospace', minWidth: 80 }}
                        />
                        <Typography variant="body2">
                          {shortcut.description}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>

        {/* Troubleshooting */}
        <Accordion 
          expanded={expandedPanel === 'troubleshooting'} 
          onChange={handleAccordionChange('troubleshooting')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">Troubleshooting</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="subtitle2" gutterBottom>
              Report Not Loading
            </Typography>
            <Typography variant="body2" paragraph>
              • Check your internet connection
              • Verify the date range is valid (start date before end date)
              • Try refreshing the page or using Ctrl+R
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Export Not Working
            </Typography>
            <Typography variant="body2" paragraph>
              • Ensure pop-ups are not blocked in your browser
              • Check if you have sufficient permissions
              • Try a different export format (PDF vs CSV)
            </Typography>

            <Typography variant="subtitle2" gutterBottom>
              Missing Data
            </Typography>
            <Typography variant="body2" paragraph>
              • Verify transactions exist for the selected date range
              • Check if &ldquo;Show Zero Balance Accounts&rdquo; is enabled
              • Ensure you have proper access permissions
            </Typography>
          </AccordionDetails>
        </Accordion>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} variant="contained" color="primary">
          Got it!
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TrialBalanceHelp