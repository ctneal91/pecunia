import { Box, Button, Divider } from '@mui/material';
import GoalTemplates from '../GoalTemplates';
import { GoalTemplate } from '../../data/goalTemplates';
import { SPACING } from '../../constants/ui';

interface TemplateStepProps {
  selectedTemplate: GoalTemplate | null;
  onSelectTemplate: (template: GoalTemplate) => void;
  onNext: () => void;
  onSkip: () => void;
  onCancel: () => void;
}

export default function TemplateStep({
  selectedTemplate,
  onSelectTemplate,
  onNext,
  onSkip,
  onCancel,
}: TemplateStepProps) {
  return (
    <Box>
      <GoalTemplates
        onSelectTemplate={onSelectTemplate}
        selectedTemplateId={selectedTemplate?.id}
      />

      <Divider sx={{ my: SPACING.PADDING_STANDARD }} />

      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Box sx={{ display: 'flex', gap: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          <Button variant="text" onClick={onSkip}>
            Skip - Create Custom Goal
          </Button>
          <Button
            variant="contained"
            onClick={onNext}
            disabled={!selectedTemplate}
          >
            Continue with Template
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
