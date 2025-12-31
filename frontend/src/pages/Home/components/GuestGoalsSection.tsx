import { Paper, Box, Typography, Button } from '@mui/material';
import { Goal } from '../../../types/goal';
import { GoalProgressItem } from '../../../components/Home';

interface GuestGoalsSectionProps {
  goals: Goal[];
  onViewAll: () => void;
  onGoalClick: (goalId: string) => void;
}

export default function GuestGoalsSection({ goals, onViewAll, onGoalClick }: GuestGoalsSectionProps) {
  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Your Goals</Typography>
        <Button size="small" onClick={onViewAll}>
          View All
        </Button>
      </Box>
      {goals.slice(0, 3).map((goal) => (
        <GoalProgressItem
          key={goal.id}
          goal={goal}
          onClick={() => onGoalClick(String(goal.id))}
        />
      ))}
    </Paper>
  );
}
