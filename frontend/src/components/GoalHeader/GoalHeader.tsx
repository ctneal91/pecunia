import { Box, Typography, Paper, Button, LinearProgress } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import GroupIcon from '@mui/icons-material/Group';
import { Goal, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS } from '../../types/goal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import MilestoneProgress from '../MilestoneProgress';
import { SPACING, PROGRESS_BAR } from '../../constants/ui';
import { LOADING_MESSAGES } from '../../constants/messages';

interface GoalHeaderProps {
  goal: Goal;
  showExport: boolean;
  exporting: boolean;
  onExport: () => Promise<void>;
  onEdit: () => void;
}

export default function GoalHeader({
  goal,
  showExport,
  exporting,
  onExport,
  onEdit,
}: GoalHeaderProps) {
  const progressColor = goal.completed ? 'success' : 'primary';

  return (
    <Paper sx={{ p: SPACING.PADDING_STANDARD, mb: SPACING.SECTION_MARGIN_BOTTOM }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.ITEM_GAP }}>
          <Typography variant="h3" component="span">
            {GOAL_TYPE_ICONS[goal.goal_type]}
          </Typography>
          <Box>
            <Typography variant="h4" component="h1">
              {goal.title}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {GOAL_TYPE_LABELS[goal.goal_type]}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: SPACING.BUTTON_GAP }}>
          {showExport && (
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={onExport}
              disabled={exporting}
            >
              {exporting ? LOADING_MESSAGES.EXPORTING : 'Export'}
            </Button>
          )}
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={onEdit}
          >
            Edit
          </Button>
        </Box>
      </Box>

      {goal.description && (
        <Typography variant="body1" color="text.secondary" sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM }}>
          {goal.description}
        </Typography>
      )}

      <Box sx={{ mb: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h5">
            {formatCurrency(goal.current_amount)}
          </Typography>
          <Typography variant="h5" color="text.secondary">
            {formatCurrency(goal.target_amount)}
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(goal.progress_percentage, PROGRESS_BAR.MAX_PERCENTAGE)}
          color={progressColor}
          sx={{ height: PROGRESS_BAR.HEIGHT_LARGE, borderRadius: PROGRESS_BAR.BORDER_RADIUS }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {goal.progress_percentage}% complete
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {goal.completed ? 'Goal reached!' : `${formatCurrency(goal.remaining_amount)} to go`}
          </Typography>
        </Box>
      </Box>

      {goal.milestones && (
        <MilestoneProgress
          milestones={goal.milestones}
          progressPercentage={goal.progress_percentage}
        />
      )}

      {goal.target_date && (
        <Typography variant="body2" color="text.secondary">
          Target date: {formatDate(goal.target_date)}
        </Typography>
      )}

      {goal.group_id && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: SPACING.BUTTON_GAP, mt: SPACING.SECTION_MARGIN_BOTTOM_SMALL }}>
          <GroupIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            Shared goal in {goal.group_name}
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
