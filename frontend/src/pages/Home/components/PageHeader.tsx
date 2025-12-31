import { Typography } from '@mui/material';

interface PageHeaderProps {
  isAuthenticated: boolean;
  userName?: string | null;
  userEmail?: string;
}

export default function PageHeader({ isAuthenticated, userName, userEmail }: PageHeaderProps) {
  const displayName = isAuthenticated && userName
    ? userName
    : isAuthenticated && userEmail
    ? userEmail.split('@')[0]
    : null;

  return (
    <Typography variant="h4" component="h1" gutterBottom>
      {isAuthenticated && displayName
        ? `Welcome back, ${displayName}!`
        : 'Welcome to Pecunia'}
    </Typography>
  );
}
