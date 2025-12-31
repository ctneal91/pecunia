import { Box, Button, Alert } from '@mui/material';
import { GoalType } from '../../types/goal';
import { Group } from '../../types/group';
import { GoalTemplate } from '../../data/goalTemplates';
import GoalFormFields from './GoalFormFields';
import { SPACING } from '../../constants/ui';

interface FormStepProps {
  selectedTemplate: GoalTemplate | null;
  isEditing: boolean;
  loading: boolean;
  title: string;
  description: string;
  targetAmount: string;
  currentAmount: string;
  goalType: GoalType;
  targetDate: string;
  groupId: number | '';
  groups: Group[];
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTargetAmountChange: (value: string) => void;
  onCurrentAmountChange: (value: string) => void;
  onGoalTypeChange: (value: GoalType) => void;
  onTargetDateChange: (value: string) => void;
  onGroupIdChange: (value: number | '') => void;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export default function FormStep({
  selectedTemplate,
  isEditing,
  loading,
  title,
  description,
  targetAmount,
  currentAmount,
  goalType,
  targetDate,
  groupId,
  groups,
  onTitleChange,
  onDescriptionChange,
  onTargetAmountChange,
  onCurrentAmountChange,
  onGoalTypeChange,
  onTargetDateChange,
  onGroupIdChange,
  onBack,
  onCancel,
  onSubmit,
}: FormStepProps) {
  return (
    <Box component="form" onSubmit={onSubmit}>
      {selectedTemplate && (
        <Alert severity="info" sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          Using template: <strong>{selectedTemplate.name}</strong>. Customize the details below.
        </Alert>
      )}

      <GoalFormFields
        title={title}
        description={description}
        targetAmount={targetAmount}
        currentAmount={currentAmount}
        goalType={goalType}
        targetDate={targetDate}
        groupId={groupId}
        groups={groups}
        onTitleChange={onTitleChange}
        onDescriptionChange={onDescriptionChange}
        onTargetAmountChange={onTargetAmountChange}
        onCurrentAmountChange={onCurrentAmountChange}
        onGoalTypeChange={onGoalTypeChange}
        onTargetDateChange={onTargetDateChange}
        onGroupIdChange={onGroupIdChange}
      />

      <Box sx={{ display: 'flex', gap: SPACING.SECTION_MARGIN_BOTTOM_SMALL, mt: SPACING.PADDING_STANDARD }}>
        {!isEditing && (
          <Button variant="outlined" onClick={onBack} disabled={loading}>
            Back
          </Button>
        )}
        <Button variant="outlined" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ flex: 1 }}
        >
          {loading ? 'Saving...' : isEditing ? 'Update Goal' : 'Create Goal'}
        </Button>
      </Box>
    </Box>
  );
}
