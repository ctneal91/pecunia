import { Box, Paper, Typography, useTheme } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import { formatCurrency } from '../../utils/formatters';

interface SavingsRateCardsProps {
  averageMonthlyRate: number;
  contributionFrequency: string;
}

export default function SavingsRateCards({
  averageMonthlyRate,
  contributionFrequency,
}: SavingsRateCardsProps) {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minWidth: 140,
          p: 2,
          bgcolor: theme.palette.primary.main + '10',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <TrendingUpIcon fontSize="small" color="primary" />
          <Typography variant="caption" color="text.secondary">
            Monthly Rate
          </Typography>
        </Box>
        <Typography variant="h6" color="primary.main">
          {formatCurrency(averageMonthlyRate)}
        </Typography>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          flex: 1,
          minWidth: 140,
          p: 2,
          bgcolor: theme.palette.info.main + '10',
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <SavingsIcon fontSize="small" color="info" />
          <Typography variant="caption" color="text.secondary">
            Frequency
          </Typography>
        </Box>
        <Typography variant="h6" color="info.main">
          {contributionFrequency}
        </Typography>
      </Paper>
    </Box>
  );
}
