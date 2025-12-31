import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

interface LeaveGroupDialogProps {
  open: boolean;
  groupName: string;
  submitting: boolean;
  onClose: () => void;
  onLeave: () => void;
}

export default function LeaveGroupDialog({
  open,
  groupName,
  submitting,
  onClose,
  onLeave,
}: LeaveGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Leave Group?</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to leave "{groupName}"? You will no longer have access to shared goals.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onLeave} color="error" variant="contained" disabled={submitting}>
          Leave
        </Button>
      </DialogActions>
    </Dialog>
  );
}
