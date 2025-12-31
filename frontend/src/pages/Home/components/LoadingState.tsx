import { Grid, Skeleton } from '@mui/material';

export default function LoadingState() {
  return (
    <>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={i}>
            <Skeleton variant="rectangular" height={100} />
          </Grid>
        ))}
      </Grid>
      <Skeleton variant="rectangular" height={200} />
    </>
  );
}
