import { Paper, Box, Typography, Chip } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import { Group } from '../../../types/group';

interface GroupCardProps {
  group: Group;
  onClick: () => void;
}

export default function GroupCard({ group, onClick }: GroupCardProps) {
  return (
    <Paper
      sx={{ p: 3, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <GroupIcon fontSize="large" color="primary" />
          <Box>
            <Typography variant="h6">{group.name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {group.member_count} {group.member_count === 1 ? 'member' : 'members'} · {group.goal_count} {group.goal_count === 1 ? 'goal' : 'goals'}
            </Typography>
          </Box>
        </Box>
        {group.is_admin && (
          <Chip label="Admin" size="small" color="primary" variant="outlined" />
        )}
      </Box>
    </Paper>
  );
}
