import { useState } from 'react';
import { Paper, Box, Typography, Button } from '@mui/material';
import RepeatIcon from '@mui/icons-material/Repeat';
import AddIcon from '@mui/icons-material/Add';
import RecurringContributionForm from '../../../components/RecurringContributionForm';
import RecurringContributionList from '../../../components/RecurringContributionList';
import { RecurringContribution, RecurringContributionInput } from '../../../types/goal';
import { SPACING } from '../../../constants/ui';

interface RecurringContributionsSectionProps {
  recurringContributions: RecurringContribution[];
  onCreateRecurring: (data: RecurringContributionInput) => Promise<void>;
  onToggleActive: (rcId: number, isActive: boolean) => Promise<void>;
  onDelete: (rcId: number) => Promise<void>;
}

export default function RecurringContributionsSection({
  recurringContributions,
  onCreateRecurring,
  onToggleActive,
  onDelete,
}: RecurringContributionsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async (data: RecurringContributionInput) => {
    setLoading(true);
    await onCreateRecurring(data);
    setShowForm(false);
    setLoading(false);
  };

  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP }}>
          <RepeatIcon color="primary" />
          <Typography variant="h6">
            Recurring Contributions
          </Typography>
        </Box>
        {!showForm && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={() => setShowForm(true)}
          >
            Add Recurring
          </Button>
        )}
      </Box>

      {showForm && (
        <Box sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          <RecurringContributionForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={loading}
          />
        </Box>
      )}

      <RecurringContributionList
        recurringContributions={recurringContributions}
        onToggleActive={onToggleActive}
        onDelete={onDelete}
      />
    </Paper>
  );
}
