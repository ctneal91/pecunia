import { Dialog, DialogTitle, DialogContent, DialogActions, Typography, Button } from '@mui/material';

interface DeleteGroupDialogProps {
  open: boolean;
  groupName: string;
  submitting: boolean;
  onClose: () => void;
  onDelete: () => void;
}

export default function DeleteGroupDialog({
  open,
  groupName,
  submitting,
  onClose,
  onDelete,
}: DeleteGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Group?</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete "{groupName}"? This will remove all members and unassign all goals from this group. This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onDelete} color="error" variant="contained" disabled={submitting}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
