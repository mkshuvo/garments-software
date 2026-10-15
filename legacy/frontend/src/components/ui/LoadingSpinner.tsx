import React from 'react';
import {
  Box,
  CircularProgress,
  Typography,
  Fade
} from '@mui/material';

interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
}

export function LoadingSpinner({ 
  size = 40, 
  message = 'Loading...', 
  fullScreen = false,
  overlay = false 
}: LoadingSpinnerProps) {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullScreen && {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
        }),
        ...(overlay && {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
        }),
      }}
    >
      <Fade in={true} style={{ transitionDelay: '200ms' }}>
        <CircularProgress size={size} />
      </Fade>
      {message && (
        <Fade in={true} style={{ transitionDelay: '400ms' }}>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Fade>
      )}
    </Box>
  );

  return content;
}

export default LoadingSpinner;
