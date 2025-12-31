import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';

interface PageHeaderProps {
  onListView: () => void;
  onNewGoal: () => void;
}

export default function PageHeader({ onListView, onNewGoal }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1">
        Goals by Category
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<ViewListIcon />}
          onClick={onListView}
        >
          List View
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onNewGoal}
        >
          New Goal
        </Button>
      </Box>
    </Box>
  );
}
