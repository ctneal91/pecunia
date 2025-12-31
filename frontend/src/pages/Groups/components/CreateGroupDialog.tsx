import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Alert } from '@mui/material';

interface CreateGroupDialogProps {
  open: boolean;
  newGroupName: string;
  submitting: boolean;
  dialogError: string | null;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onCreate: () => void;
}

export default function CreateGroupDialog({
  open,
  newGroupName,
  submitting,
  dialogError,
  onClose,
  onNameChange,
  onCreate,
}: CreateGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        {dialogError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {dialogError}
          </Alert>
        )}
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          value={newGroupName}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder="e.g., Family, Roommates, Couple"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onCreate} variant="contained" disabled={submitting || !newGroupName.trim()}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
