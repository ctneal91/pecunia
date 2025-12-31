import { Paper, Box, Typography, LinearProgress, Chip } from '@mui/material';
import { Goal } from '../../../types/goal';
import { formatCurrency } from '../../../utils/formatters';

interface GoalItemProps {
  goal: Goal;
  onClick: () => void;
}

export default function GoalItem({ goal, onClick }: GoalItemProps) {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {goal.title}
          </Typography>
          {goal.group_name && (
            <Chip label={goal.group_name} size="small" variant="outlined" />
          )}
        </Box>
        <Typography variant="body2" fontWeight="bold">
          {goal.progress_percentage}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(goal.progress_percentage, 100)}
          color={goal.completed ? 'success' : 'primary'}
          sx={{ width: 100, height: 6, borderRadius: 1 }}
        />
      </Box>
    </Paper>
  );
}
