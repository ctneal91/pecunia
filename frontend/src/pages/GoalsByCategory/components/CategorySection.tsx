import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  LinearProgress,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  CategoryStats,
  Goal,
  GOAL_TYPE_LABELS,
  GOAL_TYPE_ICONS,
  GOAL_TYPE_COLORS,
} from '../../../types/goal';
import { formatCurrency } from '../../../utils/formatters';
import GoalItem from './GoalItem';

interface CategorySectionProps {
  category: CategoryStats;
  expanded: boolean;
  onToggle: () => void;
  onGoalClick: (goal: Goal) => void;
}

export default function CategorySection({
  category,
  expanded,
  onToggle,
  onGoalClick,
}: CategorySectionProps) {
  const hasGoals = category.goal_count > 0;
  const color = GOAL_TYPE_COLORS[category.goal_type];

  return (
    <Accordion
      expanded={expanded && hasGoals}
      onChange={hasGoals ? onToggle : undefined}
      disabled={!hasGoals}
      sx={{
        mb: 1,
        '&:before': { display: 'none' },
        borderLeft: `4px solid ${color}`,
      }}
    >
      <AccordionSummary
        expandIcon={hasGoals ? <ExpandMoreIcon /> : null}
        sx={{ '&:hover': hasGoals ? { bgcolor: 'action.hover' } : {} }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Typography variant="h5" component="span">
            {GOAL_TYPE_ICONS[category.goal_type]}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {GOAL_TYPE_LABELS[category.goal_type]}
              </Typography>
              <Chip
                label={`${category.goal_count} goal${category.goal_count !== 1 ? 's' : ''}`}
                size="small"
                color={hasGoals ? 'primary' : 'default'}
                variant="outlined"
              />
              {category.completed_count > 0 && (
                <Chip
                  label={`${category.completed_count} completed`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
            {hasGoals && (
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(category.total_saved)} of {formatCurrency(category.total_target)} saved
              </Typography>
            )}
          </Box>
          {hasGoals && (
            <Box sx={{ textAlign: 'right', minWidth: 80 }}>
              <Typography variant="h6" color="primary">
                {category.progress}%
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionSummary>
      {hasGoals && (
        <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(category.progress, 100)}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          {category.goals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onClick={() => onGoalClick(goal)}
            />
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}
