import { Box, Typography, Divider } from '@mui/material';
import { formatCurrency } from '../../utils/formatters';

interface StatsSummaryProps {
  totalContributions: number;
  daysSinceFirstContribution: number;
  averageWeeklyRate: number;
}

export default function StatsSummary({
  totalContributions,
  daysSinceFirstContribution,
  averageWeeklyRate,
}: StatsSummaryProps) {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1 }}>
        <Typography variant="caption" color="text.secondary">
          {totalContributions} contribution{totalContributions !== 1 ? 's' : ''} over {daysSinceFirstContribution} day{daysSinceFirstContribution !== 1 ? 's' : ''}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          ~{formatCurrency(averageWeeklyRate)}/week
        </Typography>
      </Box>
    </>
  );
}
