import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, TextField, Button } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { SPACING } from '../../constants/ui';

interface InviteEmailDialogProps {
  open: boolean;
  groupName: string;
  inviteEmail: string;
  sendingInvite: boolean;
  onClose: () => void;
  onEmailChange: (email: string) => void;
  onSendInvite: () => void;
}

export default function InviteEmailDialog({
  open,
  groupName,
  inviteEmail,
  sendingInvite,
  onClose,
  onEmailChange,
  onSendInvite,
}: InviteEmailDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite by Email</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          Send an email invitation to join {groupName}. They'll receive a link to accept the invitation.
        </Typography>
        <TextField
          autoFocus
          margin="dense"
          label="Email Address"
          type="email"
          fullWidth
          value={inviteEmail}
          onChange={(e) => onEmailChange(e.target.value)}
          placeholder="friend@example.com"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onSendInvite}
          variant="contained"
          disabled={sendingInvite || !inviteEmail.trim()}
          startIcon={<SendIcon />}
        >
          {sendingInvite ? 'Sending...' : 'Send Invite'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
