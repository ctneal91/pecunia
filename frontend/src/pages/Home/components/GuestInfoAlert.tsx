import { Alert } from '@mui/material';

export default function GuestInfoAlert() {
  return (
    <Alert severity="info" sx={{ mb: 3 }}>
      Your data is saved locally. Sign up to sync across devices and track contribution history.
    </Alert>
  );
}
