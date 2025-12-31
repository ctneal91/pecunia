import { Box, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LinkIcon from '@mui/icons-material/Link';

interface PageHeaderProps {
  onJoinGroup: () => void;
  onCreateGroup: () => void;
}

export default function PageHeader({ onJoinGroup, onCreateGroup }: PageHeaderProps) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
      <Typography variant="h4" component="h1">
        Groups
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button
          variant="outlined"
          startIcon={<LinkIcon />}
          onClick={onJoinGroup}
        >
          Join Group
        </Button>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onCreateGroup}
        >
          Create Group
        </Button>
      </Box>
    </Box>
  );
}
