import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';

interface JoinGroupDialogProps {
  open: boolean;
  inviteCode: string;
  submitting: boolean;
  dialogError: string | null;
  onClose: () => void;
  onInviteCodeChange: (code: string) => void;
  onJoin: () => void;
}

export default function JoinGroupDialog({
  open,
  inviteCode,
  submitting,
  dialogError,
  onClose,
  onInviteCodeChange,
  onJoin,
}: JoinGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Join Group</DialogTitle>
      <DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {dialogError}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Invite Code"
          fullWidth
          value={inviteCode}
          onChange={(e) => onInviteCodeChange(e.target.value)}
          placeholder="Paste the invite code here"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onJoin} variant="contained" disabled={submitting || !inviteCode.trim()}>
          Join
        </Button>
      </DialogActions>
    </Dialog>
  );
}
