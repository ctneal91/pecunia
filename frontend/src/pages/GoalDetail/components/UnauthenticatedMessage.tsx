import { Alert } from '@mui/material';

export default function UnauthenticatedMessage() {
  return (
    <Alert severity="info">
      Sign up to track your contribution history and sync across devices.
    </Alert>
  );
}
