import { Box, Typography, Divider } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface TargetDateAnalysisProps {
  targetDate: string;
  isOnTrack: boolean | null;
  requiredMonthlyForTarget: number | null;
  averageMonthlyRate: number;
}

export default function TargetDateAnalysis({
  targetDate,
  isOnTrack,
  requiredMonthlyForTarget,
  averageMonthlyRate,
}: TargetDateAnalysisProps) {
  return (
    <>
      <Divider sx={{ my: 2 }} />
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          {isOnTrack ? (
            <CheckCircleIcon fontSize="small" color="success" />
          ) : (
            <WarningIcon fontSize="small" color="warning" />
          )}
          <Typography variant="subtitle2">
            Target Date: {formatDate(new Date(targetDate))}
          </Typography>
        </Box>

        {isOnTrack ? (
          <Typography variant="body2" color="success.main">
            You're on track to reach your goal before the target date!
          </Typography>
        ) : (
          <Box>
            <Typography variant="body2" color="warning.main" sx={{ mb: 1 }}>
              To reach your goal by the target date, you need to save:
            </Typography>
            <Typography variant="h6" color="warning.main">
              {formatCurrency(requiredMonthlyForTarget || 0)}/month
            </Typography>
            <Typography variant="caption" color="text.secondary">
              (Currently saving {formatCurrency(averageMonthlyRate)}/month)
            </Typography>
          </Box>
        )}
      </Box>
    </>
  );
}
