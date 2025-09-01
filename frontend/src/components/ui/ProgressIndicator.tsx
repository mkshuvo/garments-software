import React from 'react';
import {
  Box,
  LinearProgress,
  Typography,
  Paper,
  Stack
} from '@mui/material';
import {
  Download as DownloadIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon
} from '@mui/icons-material';

interface ProgressIndicatorProps {
  current: number;
  total: number;
  message?: string;
  status?: 'processing' | 'completed' | 'error';
  showPercentage?: boolean;
  variant?: 'linear' | 'circular';
}

export function ProgressIndicator({
  current,
  total,
  message = 'Processing...',
  status = 'processing',
  showPercentage = true,
  variant = 'linear'
}: ProgressIndicatorProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  const isCompleted = status === 'completed';
  const hasError = status === 'error';

  const getStatusIcon = () => {
    if (hasError) return <ErrorIcon color="error" />;
    if (isCompleted) return <CheckCircleIcon color="success" />;
    return <DownloadIcon color="primary" />;
  };

  const getStatusColor = () => {
    if (hasError) return 'error.main';
    if (isCompleted) return 'success.main';
    return 'primary.main';
  };

  const getStatusMessage = () => {
    if (hasError) return 'Export failed';
    if (isCompleted) return 'Export completed';
    return message;
  };

  return (
    <Paper sx={{ p: 2, minWidth: 300 }}>
      <Stack spacing={2} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getStatusIcon()}
          <Typography variant="h6" color={getStatusColor()}>
            {getStatusMessage()}
          </Typography>
        </Box>

        {variant === 'linear' && (
          <Box sx={{ width: '100%' }}>
            <LinearProgress
              variant="determinate"
              value={percentage}
              color={hasError ? 'error' : isCompleted ? 'success' : 'primary'}
              sx={{ height: 8, borderRadius: 4 }}
            />
          </Box>
        )}

        {showPercentage && (
          <Typography variant="body2" color="text.secondary">
            {current} of {total} ({percentage}%)
          </Typography>
        )}

        {status === 'processing' && (
          <Typography variant="caption" color="text.secondary" textAlign="center">
            Please wait while we prepare your export...
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

export default ProgressIndicator;
