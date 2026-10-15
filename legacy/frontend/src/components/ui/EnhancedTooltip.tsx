import React from 'react';
import {
  Tooltip,
  TooltipProps,
  Box,
  Typography,
  Chip,
  Stack
} from '@mui/material';
import { Info as InfoIcon } from '@mui/icons-material';

interface EnhancedTooltipProps extends Omit<TooltipProps, 'title'> {
  title: string | React.ReactNode;
  description?: string;
  shortcuts?: string[];
  showIcon?: boolean;
}

export function EnhancedTooltip({
  children,
  title,
  description,
  shortcuts,
  showIcon = false,
  ...tooltipProps
}: EnhancedTooltipProps) {
  const getTooltipContent = () => {
    if (typeof title === 'string') {
      return (
        <Box sx={{ maxWidth: 300 }}>
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {showIcon && <InfoIcon fontSize="small" />}
              <Typography variant="body2" fontWeight="medium">
                {title}
              </Typography>
            </Box>
            
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
            
            {shortcuts && shortcuts.length > 0 && (
              <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                {shortcuts.map((shortcut, index) => (
                  <Chip
                    key={index}
                    label={shortcut}
                    size="small"
                    variant="outlined"
                    sx={{ 
                      fontSize: '0.7rem',
                      height: 20,
                      '& .MuiChip-label': { px: 1 }
                    }}
                  />
                ))}
              </Box>
            )}
          </Stack>
        </Box>
      );
    }
    
    return title;
  };

  return (
    <Tooltip
      title={getTooltipContent()}
      arrow
      placement="top"
      enterDelay={500}
      leaveDelay={200}
      {...tooltipProps}
      componentsProps={{
        tooltip: {
          sx: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            fontSize: '0.875rem',
            padding: 2,
            borderRadius: 2,
            boxShadow: 3,
            ...tooltipProps.componentsProps?.tooltip?.sx
          }
        },
        arrow: {
          sx: {
            color: 'rgba(0, 0, 0, 0.9)'
          }
        }
      }}
    >
      {children}
    </Tooltip>
  );
}

export default EnhancedTooltip;
