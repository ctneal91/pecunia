import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Chip,
  Divider,
  Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RepeatIcon from '@mui/icons-material/Repeat';
import { RecurringContribution, FREQUENCY_LABELS } from '../../types/goal';

interface RecurringContributionListProps {
  recurringContributions: RecurringContribution[];
  onToggleActive: (id: number, isActive: boolean) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function RecurringContributionList({
  recurringContributions,
  onToggleActive,
  onDelete,
}: RecurringContributionListProps) {
  if (recurringContributions.length === 0) {
    return (
      <Box sx={{ py: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No recurring contributions set up yet.
        </Typography>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {recurringContributions.map((rc, index) => (
        <Box key={rc.id}>
          {index > 0 && <Divider />}
          <ListItem
            sx={{ px: 0 }}
            secondaryAction={
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Tooltip title={rc.is_active ? 'Pause' : 'Resume'}>
                  <IconButton
                    edge="end"
                    onClick={() => onToggleActive(rc.id, !rc.is_active)}
                    color={rc.is_active ? 'default' : 'primary'}
                  >
                    {rc.is_active ? <PauseIcon /> : <PlayArrowIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton
                    edge="end"
                    onClick={() => onDelete(rc.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            }
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 1 }}>
              <RepeatIcon color={rc.is_active ? 'primary' : 'disabled'} />
            </Box>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 'bold',
                      color: rc.is_active ? 'success.main' : 'text.disabled',
                    }}
                  >
                    {formatCurrency(rc.amount)}
                  </Typography>
                  <Chip
                    label={FREQUENCY_LABELS[rc.frequency]}
                    size="small"
                    color={rc.is_active ? 'primary' : 'default'}
                    variant="outlined"
                  />
                  {!rc.is_active && (
                    <Chip
                      label="Paused"
                      size="small"
                      color="warning"
                    />
                  )}
                </Box>
              }
              secondary={
                <Box component="span">
                  <Typography variant="body2" component="span" color="text.secondary">
                    Next: {formatDate(rc.next_occurrence_at)}
                  </Typography>
                  {rc.end_date && (
                    <Typography variant="body2" component="span" color="text.secondary">
                      {' '}· Ends: {formatDate(rc.end_date)}
                    </Typography>
                  )}
                  {rc.note && (
                    <Typography variant="body2" component="span" color="text.secondary">
                      {' '}· {rc.note}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItem>
        </Box>
      ))}
    </List>
  );
}
