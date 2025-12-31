import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

interface EditGroupDialogProps {
  open: boolean;
  groupName: string;
  editName: string;
  submitting: boolean;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onSave: () => void;
}

export default function EditGroupDialog({
  open,
  groupName,
  editName,
  submitting,
  onClose,
  onNameChange,
  onSave,
}: EditGroupDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Group</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Group Name"
          fullWidth
          value={editName}
          onChange={(e) => onNameChange(e.target.value)}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onSave} variant="contained" disabled={submitting || !editName.trim()}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
