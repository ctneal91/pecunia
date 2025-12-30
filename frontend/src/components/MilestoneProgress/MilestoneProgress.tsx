import { Box, Typography, Tooltip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { Milestone, MILESTONE_PERCENTAGES } from '../../types/goal';

interface MilestoneProgressProps {
  milestones: Milestone[];
  progressPercentage: number;
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export default function MilestoneProgress({
  milestones,
  progressPercentage,
}: MilestoneProgressProps) {
  const achievedPercentages = new Set(milestones.map((m) => m.percentage));
  const milestoneMap = new Map(milestones.map((m) => [m.percentage, m]));

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Milestones
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {MILESTONE_PERCENTAGES.map((percentage) => {
          const isAchieved = achievedPercentages.has(percentage);
          const milestone = milestoneMap.get(percentage);
          const isNext = !isAchieved && progressPercentage < percentage;

          return (
            <Tooltip
              key={percentage}
              title={
                isAchieved && milestone
                  ? `Achieved on ${formatDate(milestone.achieved_at)}`
                  : isNext
                    ? `${percentage - progressPercentage}% to go`
                    : ''
              }
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  opacity: isAchieved ? 1 : 0.5,
                }}
              >
                {isAchieved ? (
                  <CheckCircleIcon
                    sx={{
                      fontSize: 28,
                      color: percentage === 100 ? 'warning.main' : 'success.main',
                    }}
                  />
                ) : (
                  <RadioButtonUncheckedIcon sx={{ fontSize: 28, color: 'text.disabled' }} />
                )}
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: isAchieved ? 'bold' : 'normal',
                    color: isAchieved ? 'text.primary' : 'text.secondary',
                  }}
                >
                  {percentage}%
                </Typography>
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
