import { Box, Typography, Paper, IconButton, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { GroupWithMembers } from '../../types/group';
import { SPACING } from '../../constants/ui';

interface GroupHeaderProps {
  group: GroupWithMembers;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onLeave: () => void;
}

export default function GroupHeader({
  group,
  isAdmin,
  onEdit,
  onDelete,
  onLeave,
}: GroupHeaderProps) {
  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
        <Box>
          <Typography variant="h4" component="h1">
            {group.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {group.member_count} {group.member_count === 1 ? 'member' : 'members'} · {group.goal_count} {group.goal_count === 1 ? 'goal' : 'goals'}
          </Typography>
        </Box>
        <Box>
          {isAdmin ? (
            <>
              <IconButton onClick={onEdit} aria-label="Edit group">
                <EditIcon />
              </IconButton>
              <IconButton color="error" onClick={onDelete} aria-label="Delete group">
                <DeleteIcon />
              </IconButton>
            </>
          ) : (
            <Button
              color="error"
              startIcon={<ExitToAppIcon />}
              onClick={onLeave}
            >
              Leave Group
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
}
