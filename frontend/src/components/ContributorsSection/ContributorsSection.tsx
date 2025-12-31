import { Box, Typography, Paper, List, ListItem, ListItemText, Divider } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import { Contributor } from '../../types/goal';
import { formatCurrency } from '../../utils/formatters';
import { SPACING } from '../../constants/ui';

interface ContributorsSectionProps {
  contributors: Contributor[];
  contributorCount: number;
}

export default function ContributorsSection({
  contributors,
  contributorCount,
}: ContributorsSectionProps) {
  if (!contributors || contributors.length === 0) {
    return null;
  }

  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP, mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
        <GroupIcon color="primary" />
        <Typography variant="h6">
          Contributors ({contributorCount})
        </Typography>
      </Box>
      <List disablePadding>
        {contributors.map((contributor, index) => (
          <Box key={contributor.user_id}>
            {index > 0 && <Divider />}
            <ListItem sx={{ px: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mr: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
                <PersonIcon color="action" />
              </Box>
              <ListItemText
                primary={contributor.user_name}
                secondary={`${contributor.contribution_count} contribution${contributor.contribution_count !== 1 ? 's' : ''}`}
              />
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body1" fontWeight="bold" color="success.main">
                  {formatCurrency(contributor.total_amount)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {contributor.percentage}%
                </Typography>
              </Box>
            </ListItem>
          </Box>
        ))}
      </List>
    </Paper>
  );
}
