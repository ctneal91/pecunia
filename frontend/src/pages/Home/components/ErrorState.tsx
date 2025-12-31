import { Alert } from '@mui/material';

interface ErrorStateProps {
  error: string;
}

export default function ErrorState({ error }: ErrorStateProps) {
  return <Alert severity="error">{error}</Alert>;
}
