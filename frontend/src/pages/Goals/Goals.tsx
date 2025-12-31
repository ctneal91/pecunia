import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Box, Alert } from '@mui/material';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { Goal } from '../../types/goal';
import ExportDialog from '../../components/ExportDialog';
import { SPACING } from '../../constants/ui';
import { LoadingState, PageHeader, GoalCard, EmptyState } from './components';

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
    return <LoadingState />;
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: SPACING.PAGE_TOP_MARGIN }}>
        <PageHeader
          hasGoals={goals.length > 0}
          isAuthenticated={!!user}
          onCreateClick={handleCreateClick}
          onExportClick={() => setExportDialogOpen(true)}
          onCategoryClick={() => navigate('/goals/categories')}
        />

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
          <EmptyState isAuthenticated={!!user} onCreateClick={handleCreateClick} />
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
