import { Paper, Typography, List, ListItem, ListItemText, Box, Divider, Chip, IconButton } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Membership } from '../../types/group';
import { SPACING } from '../../constants/ui';

interface MembersListProps {
  members: Membership[];
  currentUserId: number;
  isAdmin: boolean;
  onMemberMenuOpen: (anchor: HTMLElement, member: Membership) => void;
}

export default function MembersList({
  members,
  currentUserId,
  isAdmin,
  onMemberMenuOpen,
}: MembersListProps) {
  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD }}>
      <Typography variant="h6" gutterBottom>
        Members
      </Typography>
      <List>
        {members.map((member, index) => (
          <Box key={member.id}>
            {index > 0 && <Divider />}
            <ListItem>
              <ListItemText
                primary={member.user_name}
                secondary={member.user_email}
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP }}>
                {member.role === 'admin' && (
                  <Chip label="Admin" size="small" color="primary" variant="outlined" />
                )}
                {isAdmin && member.user_id !== currentUserId && (
                  <IconButton
                    size="small"
                    onClick={(e) => onMemberMenuOpen(e.currentTarget, member)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
              </Box>
            </ListItem>
          </Box>
        ))}
      </List>
    </Paper>
  );
}
