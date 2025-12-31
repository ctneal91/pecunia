import { Box, Typography, LinearProgress } from '@mui/material';
import { Goal, GOAL_TYPE_ICONS } from '../../types/goal';
import { formatCurrency } from '../../utils/formatters';

interface GoalProgressItemProps {
  goal: Goal;
  onClick: () => void;
  showAmounts?: boolean;
}

export default function GoalProgressItem({
  goal,
  onClick,
  showAmounts = false,
}: GoalProgressItemProps) {
  return (
    <Box sx={{ mb: 2, cursor: 'pointer' }} onClick={onClick}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography variant="body1">
          {GOAL_TYPE_ICONS[goal.goal_type]} {goal.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {showAmounts
            ? `${formatCurrency(goal.current_amount)} / ${formatCurrency(goal.target_amount)}`
            : `${goal.progress_percentage}%`}
        </Typography>
      </Box>
      <LinearProgress
        variant="determinate"
        value={Math.min(goal.progress_percentage, 100)}
        color={goal.completed ? 'success' : 'primary'}
        sx={{ height: 6, borderRadius: 1 }}
      />
    </Box>
  );
}
