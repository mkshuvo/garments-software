'use client';

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Switch,
  FormControlLabel,
  Alert
} from '@mui/material';
import { AddTransactionButtons } from './AddTransactionButtons';

/**
 * Example component demonstrating the AddTransactionButtons component
 * This shows how the component would be integrated into a cashbook entry page
 */
export const AddTransactionButtonsExample: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lastAction, setLastAction] = useState<string>('');

  const handleAddCredit = () => {
    setLastAction('Add Credit Transaction clicked');
    // In real implementation, this would open the CreditTransactionModal
    console.log('Opening Credit Transaction Modal...');
  };

  const handleAddDebit = () => {
    setLastAction('Add Debit Transaction clicked');
    // In real implementation, this would open the DebitTransactionModal
    console.log('Opening Debit Transaction Modal...');
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        Add Transaction Buttons Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        This demonstrates the AddTransactionButtons component that will be used in the cashbook entry interface.
      </Typography>

      {/* Demo Controls */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Demo Controls
        </Typography>
        
        <FormControlLabel
          control={
            <Switch
              checked={isModalOpen}
              onChange={(e) => setIsModalOpen(e.target.checked)}
            />
          }
          label="Simulate modal open (disables buttons)"
        />
        
        {lastAction && (
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Last Action:</strong> {lastAction}
          </Alert>
        )}
      </Paper>

      {/* AddTransactionButtons Component */}
      <Paper sx={{ p: 2 }}>
        <AddTransactionButtons
          onAddCredit={handleAddCredit}
          onAddDebit={handleAddDebit}
          disabled={isModalOpen}
        />
      </Paper>

      {/* Usage Information */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom>
          Component Features
        </Typography>
        
        <Box component="ul" sx={{ pl: 2 }}>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Prominent Design:</strong> Large, visually distinct buttons that clearly indicate their purpose
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Appropriate Icons:</strong> TrendingUp icon for credits (money in) and TrendingDown icon for debits (money out)
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Disabled State:</strong> Buttons are disabled when modals are open to prevent multiple modal instances
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Accessibility:</strong> Proper ARIA labels, descriptions, and keyboard navigation support
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Material-UI Design:</strong> Follows Material-UI design system with consistent theming and responsive behavior
            </Typography>
          </li>
          <li>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Responsive:</strong> Adapts to mobile devices with stacked layout and appropriate sizing
            </Typography>
          </li>
        </Box>
      </Paper>

      {/* Integration Notes */}
      <Paper sx={{ p: 3, mt: 4, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom color="info.dark">
          Integration Notes
        </Typography>
        
        <Typography variant="body2" color="info.dark" sx={{ mb: 2 }}>
          In the actual cashbook entry page, this component would be integrated as follows:
        </Typography>
        
        <Box component="pre" sx={{ 
          bgcolor: 'background.paper', 
          p: 2, 
          borderRadius: 1, 
          overflow: 'auto',
          fontSize: '0.875rem',
          fontFamily: 'monospace'
        }}>
{`// In the main cashbook entry page
const [modals, setModals] = useState({
  creditModal: { isOpen: false },
  debitModal: { isOpen: false }
});

const handleAddCredit = () => {
  setModals(prev => ({
    ...prev,
    creditModal: { isOpen: true }
  }));
};

const handleAddDebit = () => {
  setModals(prev => ({
    ...prev,
    debitModal: { isOpen: true }
  }));
};

const isAnyModalOpen = modals.creditModal.isOpen || modals.debitModal.isOpen;

return (
  <AddTransactionButtons
    onAddCredit={handleAddCredit}
    onAddDebit={handleAddDebit}
    disabled={isAnyModalOpen}
  />
);`}
        </Box>
      </Paper>
    </Container>
  );
};

export default AddTransactionButtonsExample;