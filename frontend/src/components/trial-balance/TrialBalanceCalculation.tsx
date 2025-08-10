import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Collapse,
  Tooltip,
  Snackbar,
  Alert,
  Chip,
  Divider,
  Stack
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  ContentCopy as ContentCopyIcon,
  Calculate as CalculateIcon
} from '@mui/icons-material';
import { TrialBalanceData } from '../../types/trialBalance';

interface TrialBalanceCalculationProps {
  data: TrialBalanceData;
  showDetailedBreakdown?: boolean;
  variant?: 'standard' | 'compact';
}

interface CalculationStep {
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category?: string;
}

export const TrialBalanceCalculation: React.FC<TrialBalanceCalculationProps> = ({
  data,
  showDetailedBreakdown = true,
  variant = 'standard'
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  // Parse the calculation expression to create detailed steps
  const parseCalculationSteps = (): CalculationStep[] => {
    const steps: CalculationStep[] = [];
    
    // Add category subtotals as calculation steps
    data.categories.forEach(category => {
      if (category.subtotal !== 0) {
        steps.push({
          description: `${category.name} Total`,
          amount: category.subtotal,
          type: category.subtotal >= 0 ? 'credit' : 'debit',
          category: category.name
        });
      }
    });

    return steps;
  };

  const calculationSteps = parseCalculationSteps();

  const handleToggleExpanded = () => {
    setExpanded(!expanded);
  };

  const handleCopyToClipboard = async () => {
    try {
      const textToCopy = expanded 
        ? `Trial Balance Calculation:\n${data.calculationExpression}\n\nDetailed Breakdown:\n${calculationSteps.map(step => 
            `${step.description}: ${step.amount >= 0 ? '+' : ''}${step.amount.toLocaleString()}`
          ).join('\n')}\n\nFinal Balance: ${data.finalBalance.toLocaleString()}`
        : data.calculationExpression;
      
      await navigator.clipboard.writeText(textToCopy);
      setCopySuccess(true);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const formatCalculationExpression = (expression: string) => {
    // Split the expression by operators while keeping them
    const parts = expression.split(/(\s*[+\-=]\s*)/).filter(part => part.trim() !== '');
    
    return parts.map((part, index) => {
      const trimmedPart = part.trim();
      
      if (trimmedPart === '+' || trimmedPart === '-') {
        return (
          <Typography
            key={index}
            component="span"
            sx={{
              mx: 1,
              color: trimmedPart === '+' ? 'success.main' : 'error.main',
              fontWeight: 'bold',
              fontSize: variant === 'compact' ? '1rem' : '1.2rem'
            }}
          >
            {trimmedPart}
          </Typography>
        );
      } else if (trimmedPart === '=') {
        return (
          <Typography
            key={index}
            component="span"
            sx={{
              mx: 2,
              color: 'primary.main',
              fontWeight: 'bold',
              fontSize: variant === 'compact' ? '1.1rem' : '1.3rem'
            }}
          >
            {trimmedPart}
          </Typography>
        );
      } else {
        // This is a number
        const isNegative = trimmedPart.startsWith('-');
        const number = parseFloat(trimmedPart.replace(/,/g, ''));
        
        return (
          <Typography
            key={index}
            component="span"
            sx={{
              color: isNegative ? 'error.main' : 'success.main',
              fontWeight: 'medium',
              fontSize: variant === 'compact' ? '0.95rem' : '1.1rem',
              fontFamily: 'monospace'
            }}
          >
            {number.toLocaleString()}
          </Typography>
        );
      }
    });
  };

  const getFinalBalanceColor = (balance: number) => {
    if (balance > 0) return 'success.main';
    if (balance < 0) return 'error.main';
    return 'text.primary';
  };

  if (variant === 'compact') {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <CalculateIcon color="primary" fontSize="small" />
        <Typography variant="body2" component="div" sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {formatCalculationExpression(data.calculationExpression)}
        </Typography>
        <Tooltip title="Copy calculation">
          <IconButton size="small" onClick={handleCopyToClipboard}>
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalculateIcon color="primary" />
          <Typography variant="h6" component="h3">
            Trial Balance Calculation
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title="Copy calculation to clipboard">
            <IconButton onClick={handleCopyToClipboard} size="small">
              <ContentCopyIcon />
            </IconButton>
          </Tooltip>
          
          {showDetailedBreakdown && calculationSteps.length > 0 && (
            <Tooltip title={expanded ? "Hide detailed breakdown" : "Show detailed breakdown"}>
              <IconButton onClick={handleToggleExpanded} size="small">
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Main Calculation Expression */}
      <Box
        sx={{
          p: 2,
          backgroundColor: 'grey.50',
          borderRadius: 1,
          border: '1px solid',
          borderColor: 'grey.200',
          mb: 2
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 0.5,
            fontFamily: 'monospace',
            letterSpacing: '0.5px'
          }}
        >
          {formatCalculationExpression(data.calculationExpression)}
        </Typography>
      </Box>

      {/* Final Balance Summary */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Chip
          label={`Final Balance: ${data.finalBalance.toLocaleString()}`}
          sx={{
            fontSize: '1rem',
            fontWeight: 'bold',
            color: getFinalBalanceColor(data.finalBalance),
            backgroundColor: data.finalBalance === 0 ? 'success.light' : 'grey.100',
            '& .MuiChip-label': {
              px: 2,
              py: 1
            }
          }}
        />
      </Box>

      {/* Expandable Detailed Breakdown */}
      {showDetailedBreakdown && calculationSteps.length > 0 && (
        <Collapse in={expanded}>
          <Divider sx={{ mb: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'medium' }}>
            Detailed Breakdown by Category
          </Typography>
          
          <Stack spacing={1}>
            {calculationSteps.map((step, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 1.5,
                  backgroundColor: step.type === 'credit' ? 'success.light' : 'error.light',
                  borderRadius: 1,
                  border: '1px solid',
                  borderColor: step.type === 'credit' ? 'success.main' : 'error.main',
                  opacity: 0.8
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                  {step.description}
                </Typography>
                
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 'bold',
                    color: step.type === 'credit' ? 'success.dark' : 'error.dark'
                  }}
                >
                  {step.amount >= 0 ? '+' : ''}{step.amount.toLocaleString()}
                </Typography>
              </Box>
            ))}
          </Stack>

          <Box sx={{ mt: 2, p: 1.5, backgroundColor: 'primary.light', borderRadius: 1, opacity: 0.9 }}>
            <Typography variant="body2" sx={{ textAlign: 'center', fontWeight: 'medium' }}>
              Total Transactions Processed: {data.totalTransactions.toLocaleString()}
            </Typography>
          </Box>
        </Collapse>
      )}

      {/* Copy Success Snackbar */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={() => setCopySuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setCopySuccess(false)} severity="success" sx={{ width: '100%' }}>
          Calculation copied to clipboard!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default TrialBalanceCalculation;