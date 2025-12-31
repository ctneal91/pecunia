import { Paper, Typography, Box, LinearProgress } from '@mui/material';
import { CategoryStats } from '../../../types/goal';
import { formatCurrency } from '../../../utils/formatters';

interface OverallStatsProps {
  categories: CategoryStats[];
}

export default function OverallStats({ categories }: OverallStatsProps) {
  const totalSaved = categories.reduce((sum, c) => sum + c.total_saved, 0);
  const totalTarget = categories.reduce((sum, c) => sum + c.total_target, 0);
  const totalGoals = categories.reduce((sum, c) => sum + c.goal_count, 0);
  const completedGoals = categories.reduce((sum, c) => sum + c.completed_count, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Overall Progress
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total Saved
          </Typography>
          <Typography variant="h5" color="success.main">
            {formatCurrency(totalSaved)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total Target
          </Typography>
          <Typography variant="h5">
            {formatCurrency(totalTarget)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Goals
          </Typography>
          <Typography variant="h5">
            {totalGoals}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Completed
          </Typography>
          <Typography variant="h5" color="success.main">
            {completedGoals}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(overallProgress, 100)}
          sx={{ flexGrow: 1, height: 10, borderRadius: 1 }}
        />
        <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 50 }}>
          {overallProgress}%
        </Typography>
      </Box>
    </Paper>
  );
}
