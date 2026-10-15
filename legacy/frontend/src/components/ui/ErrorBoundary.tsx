import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  AlertTitle,
  Stack
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

interface RouterProps {
  router: {
    push: (path: string) => void;
  };
}

class ErrorBoundaryClass extends Component<Props & RouterProps, State> {
  constructor(props: Props & RouterProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Log error to external service (e.g., Sentry, LogRocket)
    // logErrorToService(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    this.props.router.push('/');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <Card sx={{ maxWidth: 600, width: '100%' }}>
            <CardContent>
              <Stack spacing={3} alignItems="center" textAlign="center">
                <ErrorIcon color="error" sx={{ fontSize: 64 }} />
                
                <Box>
                  <Typography variant="h4" component="h1" gutterBottom color="error">
                    Something went wrong
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    We encountered an unexpected error while processing your request.
                  </Typography>
                </Box>

                <Alert severity="error" sx={{ width: '100%' }}>
                  <AlertTitle>Error Details</AlertTitle>
                  {this.state.error?.message || 'An unknown error occurred'}
                  {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="caption" component="pre" sx={{ whiteSpace: 'pre-wrap', fontSize: '10px' }}>
                        {this.state.errorInfo.componentStack}
                      </Typography>
                    </Box>
                  )}
                </Alert>

                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                    color="primary"
                  >
                    Try Again
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={this.handleGoHome}
                  >
                    Go Home
                  </Button>
                </Stack>

                <Typography variant="caption" color="text.secondary">
                  If this problem persists, please contact support with the error details above.
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      );
    }

    return this.props.children;
  }
}

// Wrapper component to provide router context
export function ErrorBoundary({ children, fallback }: Props) {
  const router = useRouter();
  return <ErrorBoundaryClass router={router} fallback={fallback}>{children}</ErrorBoundaryClass>;
}

export default ErrorBoundary;
