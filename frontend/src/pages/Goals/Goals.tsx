import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  LinearProgress,
  IconButton,
  Alert,
  Skeleton,
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Goal, GOAL_TYPE_LABELS, GOAL_TYPE_ICONS } from '../../types/goal';
import ExportDialog from '../../components/ExportDialog';

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function GoalCard({ goal, onClick, onEdit, onDelete }: { goal: Goal; onClick: () => void; onEdit: () => void; onDelete: () => void }) {
  const progressColor = goal.completed ? 'success' : 'primary';

  return (
    <Paper
      sx={{ p: 3, mb: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" component="span">
            {GOAL_TYPE_ICONS[goal.goal_type]}
          </Typography>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" component="h2">
                {goal.title}
              </Typography>
              {goal.group_name && (
                <Chip label={goal.group_name} size="small" variant="outlined" />
              )}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {GOAL_TYPE_LABELS[goal.goal_type]}
            </Typography>
          </Box>
        </Box>
        <Box onClick={(e) => e.stopPropagation()}>
          <IconButton size="small" onClick={onEdit} aria-label="edit">
            <EditIcon />
          </IconButton>
          <IconButton size="small" onClick={onDelete} aria-label="delete" color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      {goal.description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {goal.description}
        </Typography>
      )}

      <Box sx={{ mb: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="body2">
            {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {goal.progress_percentage}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={Math.min(goal.progress_percentage, 100)}
          color={progressColor}
          sx={{ height: 8, borderRadius: 1 }}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          {goal.completed ? 'Goal reached!' : `${formatCurrency(goal.remaining_amount)} to go`}
        </Typography>
        {goal.target_date && (
          <Typography variant="body2" color="text.secondary">
            Target: {new Date(goal.target_date).toLocaleDateString()}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}

function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  const { user } = useAuth();

  return (
    <Paper sx={{ p: 6, textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>
        No goals yet
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Start tracking your financial goals today.
        {!user && ' Your goals will be saved in your browser until you create an account.'}
      </Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={onCreateClick}>
        Create Your First Goal
      </Button>
    </Paper>
  );
}

export default function Goals() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, loading, error, deleteGoal } = useGoals();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  const handleCreateClick = () => navigate('/goals/new');
  const handleEditClick = (goal: Goal) => navigate(`/goals/${goal.id}/edit`);

  const handleDeleteClick = async (goal: Goal) => {
    if (!window.confirm(`Delete "${goal.title}"? This cannot be undone.`)) return;
    await deleteGoal(goal.id);
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Your Goals
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {user && goals.length > 0 && (
              <>
                <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon />}
                  onClick={() => setExportDialogOpen(true)}
                >
                  Export
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CategoryIcon />}
                  onClick={() => navigate('/goals/categories')}
                >
                  By Category
                </Button>
              </>
            )}
            {goals.length > 0 && (
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleCreateClick}>
                New Goal
              </Button>
            )}
          </Box>
        </Box>

        {!user && goals.length > 0 && (
          <Alert severity="info" sx={{ mb: 3 }}>
            Your goals are saved locally. Sign up to sync across devices and never lose your progress.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {goals.length === 0 ? (
          <EmptyState onCreateClick={handleCreateClick} />
        ) : (
          goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onClick={() => navigate(`/goals/${goal.id}`)}
              onEdit={() => handleEditClick(goal)}
              onDelete={() => handleDeleteClick(goal)}
            />
          ))
        )}
      </Box>

      <ExportDialog
        open={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
      />
    </Container>
  );
}
