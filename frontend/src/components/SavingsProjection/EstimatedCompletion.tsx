import { Box, Typography } from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { formatDate } from '../../utils/formatters';

interface EstimatedCompletionProps {
  isGoalComplete: boolean;
  estimatedCompletionDate: Date | null;
  daysToComplete: number | null;
}

export default function EstimatedCompletion({
  isGoalComplete,
  estimatedCompletionDate,
  daysToComplete,
}: EstimatedCompletionProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <CalendarTodayIcon fontSize="small" color="action" />
        <Typography variant="subtitle2">
          Estimated Completion
        </Typography>
      </Box>

      {isGoalComplete ? (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CheckCircleIcon color="success" />
          <Typography variant="body1" color="success.main" fontWeight="medium">
            Goal Complete!
          </Typography>
        </Box>
      ) : estimatedCompletionDate ? (
        <Box>
          <Typography variant="h6">
            {formatDate(estimatedCompletionDate)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {daysToComplete === 1
              ? '1 day remaining'
              : `${daysToComplete} days remaining`}
            {' '}at current rate
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" color="text.secondary">
          Unable to estimate - keep contributing!
        </Typography>
      )}
    </Box>
  );
}
