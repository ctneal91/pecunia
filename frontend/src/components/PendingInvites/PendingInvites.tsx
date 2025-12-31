import { Paper, Typography, List, ListItem, ListItemText, Button } from '@mui/material';
import { GroupInvite } from '../../types/group';
import { SPACING } from '../../constants/ui';

interface PendingInvitesProps {
  invites: GroupInvite[];
  onResend: (invite: GroupInvite) => void;
}

export default function PendingInvites({ invites, onResend }: PendingInvitesProps) {
  const pendingInvites = invites.filter(i => i.status === 'pending');

  if (pendingInvites.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Typography variant="h6" gutterBottom>
        Pending Invites
      </Typography>
      <List dense>
        {pendingInvites.map((invite) => (
          <ListItem key={invite.id}>
            <ListItemText
              primary={invite.email}
              secondary={invite.expired ? 'Expired' : `Sent ${new Date(invite.invited_at).toLocaleDateString()}`}
            />
            <Button
              size="small"
              onClick={() => onResend(invite)}
            >
              Resend
            </Button>
          </ListItem>
        ))}
      </List>
    </Paper>
  );
}
