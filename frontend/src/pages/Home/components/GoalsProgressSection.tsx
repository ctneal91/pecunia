import { Paper, Box, Typography, Button } from '@mui/material';
import { Goal } from '../../../types/goal';
import { GoalProgressItem } from '../../../components/Home';
import NoGoalsState from './NoGoalsState';

interface GoalsProgressSectionProps {
  goals: Goal[];
  onViewAll: () => void;
  onGoalClick: (goalId: string) => void;
  onCreateGoal: () => void;
}

export default function GoalsProgressSection({
  goals,
  onViewAll,
  onGoalClick,
  onCreateGoal,
}: GoalsProgressSectionProps) {
  return (
    <Paper sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Goals Progress</Typography>
        <Button size="small" onClick={onViewAll}>
          View All
        </Button>
      </Box>
      {goals.length === 0 ? (
        <NoGoalsState onCreateGoal={onCreateGoal} />
      ) : (
        goals.map((goal) => (
          <GoalProgressItem
            key={goal.id}
            goal={goal}
            onClick={() => onGoalClick(String(goal.id))}
            showAmounts
          />
        ))
      )}
    </Paper>
  );
}
