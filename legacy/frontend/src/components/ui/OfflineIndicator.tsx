'use client'

import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  AlertTitle,
  IconButton,
  Collapse,
  Typography,
  Chip
} from '@mui/material';
import {
  WifiOff as WifiOffIcon,
  Wifi as WifiIcon,
  Close as CloseIcon,
  Sync as SyncIcon,
  CloudOff as CloudOffIcon
} from '@mui/icons-material';
import { serviceWorkerManager } from '@/utils/serviceWorker';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom';
  dismissible?: boolean;
  showDetails?: boolean;
}

export function OfflineIndicator({ 
  position = 'top', 
  dismissible = true, 
  showDetails = false 
}: OfflineIndicatorProps) {
  const [isOffline, setIsOffline] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [showFullDetails, setShowFullDetails] = useState(false);
  const [cacheInfo, setCacheInfo] = useState<{ name: string; size: number }[]>([]);

  useEffect(() => {
    // Check initial online status
    setIsOffline(serviceWorkerManager.isOffline());

    // Listen for online/offline changes
    const cleanup = serviceWorkerManager.onOnlineStatusChange((isOnline) => {
      setIsOffline(!isOnline);
      if (isOnline) {
        // Reset dismissed state when coming back online
        setIsDismissed(false);
      }
    });

    // Get cache info
    serviceWorkerManager.getCacheInfo().then(setCacheInfo);

    return cleanup;
  }, []);

  // Don't show if online or dismissed
  if (!isOffline || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
  };

  const handleRetry = async () => {
    // Try to refresh the page or sync data
    if (navigator.onLine) {
      window.location.reload();
    } else {
      // Request background sync when online
      await serviceWorkerManager.requestBackgroundSync();
    }
  };

  const handleToggleDetails = () => {
    setShowFullDetails(!showFullDetails);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        [position]: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        p: 2
      }}
    >
      <Alert
        severity="warning"
        icon={<WifiOffIcon />}
        action={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {showDetails && (
              <IconButton
                size="small"
                onClick={handleToggleDetails}
                color="inherit"
              >
                <SyncIcon />
              </IconButton>
            )}
            {dismissible && (
              <IconButton
                size="small"
                onClick={handleDismiss}
                color="inherit"
              >
                <CloseIcon />
              </IconButton>
            )}
          </Box>
        }
        sx={{
          boxShadow: 3,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WifiOffIcon />
            You're currently offline
            <Chip
              label="Offline Mode"
              size="small"
              color="warning"
              variant="outlined"
            />
          </Box>
        </AlertTitle>
        
        <Typography variant="body2" sx={{ mb: 1 }}>
          Some features may be limited. Your data will sync when you're back online.
        </Typography>

        <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
          <IconButton
            size="small"
            onClick={handleRetry}
            disabled={!navigator.onLine}
            sx={{ 
              bgcolor: 'warning.light', 
              color: 'warning.contrastText',
              '&:hover': {
                bgcolor: 'warning.main'
              }
            }}
          >
            <SyncIcon fontSize="small" />
          </IconButton>
          
          {showDetails && (
            <IconButton
              size="small"
              onClick={handleToggleDetails}
              color="inherit"
            >
              <CloudOffIcon fontSize="small" />
            </IconButton>
          )}
        </Box>

        {showDetails && (
          <Collapse in={showFullDetails}>
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Offline Status Details:
              </Typography>
              
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WifiOffIcon fontSize="small" color="warning" />
                  <Typography variant="body2">
                    Network Status: {navigator.onLine ? 'Online' : 'Offline'}
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CloudOffIcon fontSize="small" color="info" />
                  <Typography variant="body2">
                    Service Worker: {serviceWorkerManager.isServiceWorkerSupported() ? 'Active' : 'Not Supported'}
                  </Typography>
                </Box>

                {cacheInfo.length > 0 && (
                  <Box>
                    <Typography variant="body2" gutterBottom>
                      Cached Data:
                    </Typography>
                    {cacheInfo.map((cache) => (
                      <Chip
                        key={cache.name}
                        label={`${cache.name}: ${cache.size} items`}
                        size="small"
                        variant="outlined"
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))}
                  </Box>
                )}
              </Box>

              <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                💡 Tip: Journal entries created while offline will be synced automatically when you reconnect.
              </Typography>
            </Box>
          </Collapse>
        )}
      </Alert>
    </Box>
  );
}

export default OfflineIndicator;

