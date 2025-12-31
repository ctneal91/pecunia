import { List, ListItem, ListItemText, Typography, Box } from '@mui/material';
import { RecentContribution } from '../../services/api';
import { formatCurrency, formatDateShort } from '../../utils/formatters';

interface RecentActivityListProps {
  contributions: RecentContribution[];
}

export default function RecentActivityList({ contributions }: RecentActivityListProps) {
  if (contributions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No contributions yet. Add to a goal to see activity here.
      </Typography>
    );
  }

  return (
    <List dense disablePadding>
      {contributions.map((contribution) => (
        <ListItem key={contribution.id} disablePadding sx={{ py: 1 }}>
          <ListItemText
            primary={
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">{contribution.goal.title}</Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: contribution.amount >= 0 ? 'success.main' : 'error.main',
                    fontWeight: 'bold',
                  }}
                >
                  {contribution.amount >= 0 ? '+' : ''}
                  {formatCurrency(contribution.amount)}
                </Typography>
              </Box>
            }
            secondary={
              <Typography variant="caption" color="text.secondary">
                {formatDateShort(contribution.contributed_at)}
                {contribution.note && ` — ${contribution.note}`}
              </Typography>
            }
          />
        </ListItem>
      ))}
    </List>
  );
}
