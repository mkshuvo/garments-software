import React, { useState, useCallback } from 'react';
import {
    Box,
    Button,
    ButtonGroup,
    Paper,
    Typography,
    LinearProgress,
    Alert,
    Snackbar,
    IconButton,
    Tooltip,
    Stack,
    Chip
} from '@mui/material';
import {
    GetApp as DownloadIcon,
    PictureAsPdf as PdfIcon,
    TableChart as CsvIcon,
    Refresh as RetryIcon,
    CheckCircle as SuccessIcon,
    Error as ErrorIcon
} from '@mui/icons-material';
import { ExportFormat } from '../../types/trialBalance';

interface ExportOptionsProps {
    onExport: (format: ExportFormat, options?: ExportRequestOptions) => Promise<void>;
    isExporting: boolean;
    exportProgress?: number;
    disabled?: boolean;
    showProgress?: boolean;
    variant?: 'standard' | 'compact';
}

interface ExportRequestOptions {
    includeCalculationDetails?: boolean;
    includeZeroBalances?: boolean;
    customFilename?: string;
}

interface ExportState {
    format: ExportFormat | null;
    error: string | null;
    success: boolean;
    retryCount: number;
}

export const ExportOptions: React.FC<ExportOptionsProps> = ({
    onExport,
    isExporting,
    exportProgress = 0,
    disabled = false,
    showProgress = true,
    variant = 'standard'
}) => {
    const [exportState, setExportState] = useState<ExportState>({
        format: null,
        error: null,
        success: false,
        retryCount: 0
    });

    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);

    const handleExport = useCallback(async (format: ExportFormat, options?: ExportRequestOptions) => {
        setExportState(prev => ({
            ...prev,
            format,
            error: null,
            success: false
        }));

        try {
            await onExport(format, options);

            // Show success notification
            setExportState(prev => ({
                ...prev,
                success: true,
                retryCount: 0
            }));
            setShowSuccessMessage(true);

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Export failed';
            setExportState(prev => ({
                ...prev,
                error: errorMessage,
                success: false
            }));
            setShowErrorMessage(true);
        }
    }, [onExport]);

    const handleRetry = async () => {
        if (exportState.format && exportState.retryCount < 3) {
            const newRetryCount = exportState.retryCount + 1;
            setExportState(prev => ({
                ...prev,
                retryCount: newRetryCount,
                error: null
            }));

            try {
                await onExport(exportState.format);

                // Show success notification
                setExportState(prev => ({
                    ...prev,
                    success: true,
                    retryCount: 0
                }));
                setShowSuccessMessage(true);

            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Export failed';
                setExportState(prev => ({
                    ...prev,
                    error: errorMessage,
                    success: false,
                    retryCount: newRetryCount
                }));
                setShowErrorMessage(true);
            }
        }
    };

    const getProgressMessage = () => {
        if (!isExporting) return '';

        if (exportProgress < 25) return 'Preparing data...';
        if (exportProgress < 50) return 'Processing calculations...';
        if (exportProgress < 75) return 'Formatting report...';
        if (exportProgress < 95) return 'Generating file...';
        return 'Finalizing export...';
    };

    const isButtonDisabled = disabled || isExporting;

    if (variant === 'compact') {
        return (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Tooltip 
                    title={
                        isButtonDisabled 
                            ? 'Export is currently disabled' 
                            : 'Export as PDF (Ctrl+E for quick export)'
                    }
                    arrow
                >
                    <span>
                        <IconButton
                            onClick={() => handleExport(ExportFormat.PDF)}
                            disabled={isButtonDisabled}
                            color="primary"
                            size="small"
                        >
                            <PdfIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip 
                    title={
                        isButtonDisabled 
                            ? 'Export is currently disabled' 
                            : 'Export as CSV for spreadsheet analysis'
                    }
                    arrow
                >
                    <span>
                        <IconButton
                            onClick={() => handleExport(ExportFormat.CSV)}
                            disabled={isButtonDisabled}
                            color="primary"
                            size="small"
                        >
                            <CsvIcon />
                        </IconButton>
                    </span>
                </Tooltip>

                {isExporting && (
                    <Chip
                        icon={<DownloadIcon />}
                        label={`${Math.round(exportProgress)}%`}
                        size="small"
                        color="primary"
                        variant="outlined"
                    />
                )}
            </Box>
        );
    }

    return (
        <Paper
            elevation={1}
            sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider'
            }}
        >
            <Stack spacing={2}>
                {/* Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <DownloadIcon color="primary" />
                    <Typography variant="h6" component="h3">
                        Export Options
                    </Typography>
                </Box>

                {/* Export Buttons */}
                <ButtonGroup
                    variant="contained"
                    disabled={isButtonDisabled}
                    fullWidth
                    sx={{ gap: 1 }}
                >
                    <Tooltip 
                        title={
                            isButtonDisabled 
                                ? 'Export is currently disabled' 
                                : 'Export as PDF with professional formatting and company header (Ctrl+E for quick export)'
                        }
                        arrow
                        placement="top"
                    >
                        <span style={{ flex: 1 }}>
                            <Button
                                startIcon={<PdfIcon />}
                                onClick={() => handleExport(ExportFormat.PDF, {
                                    includeCalculationDetails: true,
                                    includeZeroBalances: false
                                })}
                                disabled={isButtonDisabled}
                                sx={{
                                    width: '100%',
                                    backgroundColor: '#d32f2f',
                                    '&:hover': {
                                        backgroundColor: '#b71c1c'
                                    }
                                }}
                            >
                                Export PDF
                            </Button>
                        </span>
                    </Tooltip>

                    <Tooltip 
                        title={
                            isButtonDisabled 
                                ? 'Export is currently disabled' 
                                : 'Export as CSV for spreadsheet analysis with all account details and calculations'
                        }
                        arrow
                        placement="top"
                    >
                        <span style={{ flex: 1 }}>
                            <Button
                                startIcon={<CsvIcon />}
                                onClick={() => handleExport(ExportFormat.CSV, {
                                    includeCalculationDetails: true,
                                    includeZeroBalances: false
                                })}
                                disabled={isButtonDisabled}
                                sx={{
                                    width: '100%',
                                    backgroundColor: '#2e7d32',
                                    '&:hover': {
                                        backgroundColor: '#1b5e20'
                                    }
                                }}
                            >
                                Export CSV
                            </Button>
                        </span>
                    </Tooltip>
                </ButtonGroup>

                {/* Progress Indicator */}
                {isExporting && showProgress && (
                    <Box sx={{ width: '100%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
                                {getProgressMessage()}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {Math.round(exportProgress)}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={exportProgress}
                            sx={{
                                height: 6,
                                borderRadius: 3,
                                backgroundColor: 'grey.200',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 3
                                }
                            }}
                        />
                    </Box>
                )}

                {/* Error State with Retry */}
                {exportState.error && (
                    <Alert
                        severity="error"
                        sx={{ borderRadius: 1 }}
                        action={
                            exportState.retryCount < 3 ? (
                                <Tooltip title="Retry export">
                                    <IconButton
                                        color="inherit"
                                        size="small"
                                        onClick={handleRetry}
                                        disabled={isExporting}
                                    >
                                        <RetryIcon />
                                    </IconButton>
                                </Tooltip>
                            ) : null
                        }
                    >
                        <Typography variant="body2">
                            Export failed: {exportState.error}
                        </Typography>
                        {exportState.retryCount > 0 && (
                            <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                                Retry attempt {exportState.retryCount} of 3
                            </Typography>
                        )}
                    </Alert>
                )}

                {/* Export Status Info */}
                {!isExporting && !exportState.error && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                        Choose a format to export your trial balance report
                    </Typography>
                )}
            </Stack>

            {/* Success Notification */}
            <Snackbar
                open={showSuccessMessage}
                autoHideDuration={4000}
                onClose={() => setShowSuccessMessage(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setShowSuccessMessage(false)}
                    severity="success"
                    sx={{ width: '100%' }}
                    icon={<SuccessIcon />}
                >
                    <Typography variant="body2">
                        Trial balance exported successfully as {exportState.format?.toUpperCase()}
                    </Typography>
                </Alert>
            </Snackbar>

            {/* Error Notification */}
            <Snackbar
                open={showErrorMessage}
                autoHideDuration={6000}
                onClose={() => setShowErrorMessage(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    onClose={() => setShowErrorMessage(false)}
                    severity="error"
                    sx={{ width: '100%' }}
                    icon={<ErrorIcon />}
                >
                    <Typography variant="body2">
                        {exportState.error}
                    </Typography>
                    {exportState.retryCount < 3 && (
                        <Button
                            color="inherit"
                            size="small"
                            onClick={handleRetry}
                            sx={{ mt: 1 }}
                            startIcon={<RetryIcon />}
                        >
                            Retry
                        </Button>
                    )}
                </Alert>
            </Snackbar>
        </Paper>
    );
};

export default ExportOptions;