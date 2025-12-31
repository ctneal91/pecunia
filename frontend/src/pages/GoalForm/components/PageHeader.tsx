import { Typography, Stepper, Step, StepLabel, Alert } from '@mui/material';
import { SPACING } from '../../../constants/ui';

interface PageHeaderProps {
  isEditing: boolean;
  activeStep: number;
  steps: string[];
  error: string | null;
}

export default function PageHeader({ isEditing, activeStep, steps, error }: PageHeaderProps) {
  return (
    <>
      <Typography variant="h5" component="h1" gutterBottom>
        {isEditing ? 'Edit Goal' : 'Create New Goal'}
      </Typography>

      {!isEditing && (
        <Stepper activeStep={activeStep} sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          {error}
        </Alert>
      )}
    </>
  );
}
