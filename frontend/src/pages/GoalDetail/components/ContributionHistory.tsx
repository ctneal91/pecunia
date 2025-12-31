import { Paper, Typography, List, ListItem, ListItemText, IconButton, Box, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Contribution } from '../../../types/goal';
import { formatCurrency, formatDate } from '../../../utils/formatters';
import { SPACING } from '../../../constants/ui';

interface ContributionHistoryProps {
  contributions: Contribution[];
  onDelete: (contributionId: number) => Promise<void>;
}

export default function ContributionHistory({
  contributions,
  onDelete,
}: ContributionHistoryProps) {
  if (contributions.length === 0) return null;

  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD }}>
      <Typography variant="h6" gutterBottom>
        Contribution History
      </Typography>
      <List>
        {contributions.map((contribution, index) => (
          <Box key={contribution.id}>
            {index > 0 && <Divider />}
            <ListItem
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="delete"
                  onClick={() => onDelete(contribution.id as number)}
                >
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP }}>
                    <Typography
                      variant="body1"
                      sx={{ color: contribution.amount >= 0 ? 'success.main' : 'error.main', fontWeight: 'bold' }}
                    >
                      {contribution.amount >= 0 ? '+' : ''}{formatCurrency(contribution.amount)}
                    </Typography>
                    {contribution.note && (
                      <Typography variant="body2" color="text.secondary">
                        — {contribution.note}
                      </Typography>
                    )}
                  </Box>
                }
                secondary={formatDate(contribution.contributed_at)}
              />
            </ListItem>
          </Box>
        ))}
      </List>
    </Paper>
  );
}
