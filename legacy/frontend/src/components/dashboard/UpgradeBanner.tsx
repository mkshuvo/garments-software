'use client'

import React from 'react'
import { Box, Typography, Paper } from '@mui/material'

interface UpgradeBannerProps {
    title?: string
    subtitle?: string
    buttonText?: string
    onButtonClick?: () => void
}

export default function UpgradeBanner({
    title = 'Upgrade Plan For Better Financial Forecast',
    subtitle = 'You can back to your previous plan anytime.',
    buttonText = 'Upgrade Now',
    onButtonClick,
}: UpgradeBannerProps) {
    return (
        <Paper
            sx={{
                p: 3,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #2B3674 0%, #1A202C 100%)',
                color: 'white',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Decorative elements */}
            <Box
                sx={{
                    position: 'absolute',
                    right: -20,
                    bottom: 30,
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    right: 60,
                    bottom: -20,
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                }}
            />

            {/* Rocket icon area */}
            <Box
                sx={{
                    width: 60,
                    height: 60,
                    borderRadius: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 3,
                    fontSize: '2rem',
                }}
            >
                🚀
            </Box>

            <Box>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700,
                        color: 'white',
                        fontSize: '1.125rem',
                        lineHeight: 1.4,
                        mb: 1,
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="body2"
                    sx={{
                        color: 'rgba(255, 255, 255, 0.7)',
                        fontSize: '0.8125rem',
                        mb: 3,
                    }}
                >
                    {subtitle}
                </Typography>

                <Box
                    component="button"
                    onClick={onButtonClick}
                    sx={{
                        width: '100%',
                        py: 1.5,
                        px: 3,
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #4318FF 0%, #7551FF 100%)',
                        color: 'white',
                        border: 'none',
                        fontWeight: 600,
                        fontSize: '0.875rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0px 8px 20px rgba(67, 24, 255, 0.4)',
                        },
                    }}
                >
                    {buttonText}
                </Box>
            </Box>
        </Paper>
    )
}
