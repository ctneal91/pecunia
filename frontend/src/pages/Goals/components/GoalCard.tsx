import { Paper, Box, Typography, LinearProgress, IconButton, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { Goal, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS } from '../../../types/goal';
import { formatCurrency } from '../../../utils/formatters';

interface GoalCardProps {
  goal: Goal;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function GoalCard({ goal, onClick, onEdit, onDelete }: GoalCardProps) {
  const progressColor = goal.completed ? 'success' : 'primary';

  return (
    <Paper
      sx={{ p: 3, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" component="span">
            {GOAL_TYPE_ICONS[goal.goal_type]}
          </Typography>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="h2">
                {goal.title}
              </Typography>
              {goal.group_name && (
                <Chip label={goal.group_name} size="small" variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {GOAL_TYPE_LABELS[goal.goal_type]}
            </Typography>
          </Box>
        </Box>
        <Box onClick={(e) => e.stopPropagation()}>
          <IconButton size="small" onClick={onEdit} aria-label="edit">
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={onDelete} aria-label="delete" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {goal.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {goal.description}
        </Typography>
      )}

      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">
            {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {goal.progress_percentage}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(goal.progress_percentage, 100)}
          color={progressColor}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {goal.completed ? 'Goal reached!' : `${formatCurrency(goal.remaining_amount)} to go`}
        </Typography>
        {goal.target_date && (
          <Typography variant="body2" color="text.secondary">
            Target: {new Date(goal.target_date).toLocaleDateString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
