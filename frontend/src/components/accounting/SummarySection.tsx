import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Skeleton,
  Chip
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon
} from '@mui/icons-material';

interface SummaryInfo {
  totalEntries: number;
  totalDebits: number;
  totalCredits: number;
  balance: number;
}

interface SummarySectionProps {
  summary: SummaryInfo | null;
  loading: boolean;
  error?: string;
}

export function SummarySection({ summary, loading, error }: SummarySectionProps) {
  if (loading) {
    return (
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {[1, 2, 3, 4].map((item) => (
          <Grid key={item} component="div" size={{ xs: 12, sm: 6, md: 3 }}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={24} />
                <Skeleton variant="text" width="40%" height={20} />
                <Skeleton variant="text" width="80%" height={32} />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error || !summary) {
    return null;
  }

  const formatCurrency = (amount: number) => `৳${Math.abs(amount).toFixed(2)}`;
  const isPositiveBalance = summary.balance >= 0;

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {/* Total Entries */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ReceiptIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Entries
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold">
              {summary.totalEntries.toLocaleString()}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Journal entries
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Credits */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUpIcon color="success" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Credits
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold" color="success.main">
              {formatCurrency(summary.totalCredits)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Money In
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Total Debits */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingDownIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Total Debits
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold" color="error.main">
              {formatCurrency(summary.totalDebits)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Money Out
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Balance */}
      <Grid component="div" size={{ xs: 12, sm: 6, md: 3 }}>
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalanceIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                Net Balance
              </Typography>
            </Box>
            <Typography variant="h4" component="div" fontWeight="bold" color={isPositiveBalance ? 'success.main' : 'error.main'}>
              {isPositiveBalance ? '+' : '-'}{formatCurrency(summary.balance)}
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Chip
                label={isPositiveBalance ? 'Positive' : 'Negative'}
                color={isPositiveBalance ? 'success' : 'error'}
                size="small"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

export default SummarySection;
