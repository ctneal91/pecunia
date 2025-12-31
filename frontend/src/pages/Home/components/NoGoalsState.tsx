import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

interface NoGoalsStateProps {
  onCreateGoal: () => void;
}

export default function NoGoalsState({ onCreateGoal }: NoGoalsStateProps) {
  return (
    <Box sx={{ textAlign: 'center', py: 4 }}>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        No goals yet
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateGoal}>
        Create Goal
      </Button>
    </Box>
  );
}
