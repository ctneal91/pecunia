import { Box, Typography } from '@mui/material';

export default function EmptyState() {
  return (
    <Box sx={{ textAlign: 'center', py: 3 }}>
      <Typography variant="body2" color="text.secondary">
        Add contributions to see savings projections and estimated completion date.
      </Typography>
    </Box>
  );
}
