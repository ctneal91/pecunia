import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Button,
  LinearProgress,
  Skeleton,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import ViewListIcon from '@mui/icons-material/ViewList';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import {
  CategoryStats,
  Goal,
  GOAL_TYPE_LABELS,
  GOAL_TYPE_ICONS,
  GOAL_TYPE_COLORS,
} from '../../types/goal';
import { formatCurrency } from '../../utils/formatters';

function GoalItem({ goal, onClick }: { goal: Goal; onClick: () => void }) {
  return (
    <Paper
      sx={{
        p: 2,
        mb: 1,
        cursor: 'pointer',
        '&:hover': { bgcolor: 'action.hover' },
      }}
      onClick={onClick}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            {goal.title}
          </Typography>
          {goal.group_name && (
            <Chip label={goal.group_name} size="small" variant="outlined" />
          )}
        </Box>
        <Typography variant="body2" fontWeight="bold">
          {goal.progress_percentage}%
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
        </Typography>
        <LinearProgress
          variant="determinate"
          value={Math.min(goal.progress_percentage, 100)}
          color={goal.completed ? 'success' : 'primary'}
          sx={{ width: 100, height: 6, borderRadius: 1 }}
        />
      </Box>
    </Paper>
  );
}

function CategorySection({
  category,
  expanded,
  onToggle,
  onGoalClick,
}: {
  category: CategoryStats;
  expanded: boolean;
  onToggle: () => void;
  onGoalClick: (goal: Goal) => void;
}) {
  const hasGoals = category.goal_count > 0;
  const color = GOAL_TYPE_COLORS[category.goal_type];

  return (
    <Accordion
      expanded={expanded && hasGoals}
      onChange={hasGoals ? onToggle : undefined}
      disabled={!hasGoals}
      sx={{
        mb: 1,
        '&:before': { display: 'none' },
        borderLeft: `4px solid ${color}`,
      }}
    >
      <AccordionSummary
        expandIcon={hasGoals ? <ExpandMoreIcon /> : null}
        sx={{ '&:hover': hasGoals ? { bgcolor: 'action.hover' } : {} }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
          <Typography variant="h5" component="span">
            {GOAL_TYPE_ICONS[category.goal_type]}
          </Typography>
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" fontWeight="medium">
                {GOAL_TYPE_LABELS[category.goal_type]}
              </Typography>
              <Chip
                label={`${category.goal_count} goal${category.goal_count !== 1 ? 's' : ''}`}
                size="small"
                color={hasGoals ? 'primary' : 'default'}
                variant="outlined"
              />
              {category.completed_count > 0 && (
                <Chip
                  label={`${category.completed_count} completed`}
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
            {hasGoals && (
              <Typography variant="body2" color="text.secondary">
                {formatCurrency(category.total_saved)} of {formatCurrency(category.total_target)} saved
              </Typography>
            )}
          </Box>
          {hasGoals && (
            <Box sx={{ textAlign: 'right', minWidth: 80 }}>
              <Typography variant="h6" color="primary">
                {category.progress}%
              </Typography>
            </Box>
          )}
        </Box>
      </AccordionSummary>
      {hasGoals && (
        <AccordionDetails sx={{ bgcolor: 'grey.50' }}>
          <Box sx={{ mb: 2 }}>
            <LinearProgress
              variant="determinate"
              value={Math.min(category.progress, 100)}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
          {category.goals.map((goal) => (
            <GoalItem
              key={goal.id}
              goal={goal}
              onClick={() => onGoalClick(goal)}
            />
          ))}
        </AccordionDetails>
      )}
    </Accordion>
  );
}

function OverallStats({ categories }: { categories: CategoryStats[] }) {
  const totalSaved = categories.reduce((sum, c) => sum + c.total_saved, 0);
  const totalTarget = categories.reduce((sum, c) => sum + c.total_target, 0);
  const totalGoals = categories.reduce((sum, c) => sum + c.goal_count, 0);
  const completedGoals = categories.reduce((sum, c) => sum + c.completed_count, 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        Overall Progress
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap', mb: 2 }}>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total Saved
          </Typography>
          <Typography variant="h5" color="success.main">
            {formatCurrency(totalSaved)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Total Target
          </Typography>
          <Typography variant="h5">
            {formatCurrency(totalTarget)}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Goals
          </Typography>
          <Typography variant="h5">
            {totalGoals}
          </Typography>
        </Box>
        <Box>
          <Typography variant="body2" color="text.secondary">
            Completed
          </Typography>
          <Typography variant="h5" color="success.main">
            {completedGoals}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <LinearProgress
          variant="determinate"
          value={Math.min(overallProgress, 100)}
          sx={{ flexGrow: 1, height: 10, borderRadius: 1 }}
        />
        <Typography variant="body1" fontWeight="bold" sx={{ minWidth: 50 }}>
          {overallProgress}%
        </Typography>
      </Box>
    </Paper>
  );
}

export default function GoalsByCategory() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      const response = await api.getGoalsByCategory();
      if (response.data) {
        setCategories(response.data.categories);
        // Expand categories that have goals by default
        const withGoals = response.data.categories
          .filter((c) => c.goal_count > 0)
          .map((c) => c.goal_type);
        setExpandedCategories(new Set(withGoals));
      } else if (response.error) {
        setError(response.error);
      }
      setLoading(false);
    };

    fetchCategories();
  }, [user]);

  const toggleCategory = (goalType: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(goalType)) {
        next.delete(goalType);
      } else {
        next.add(goalType);
      }
      return next;
    });
  };

  const handleGoalClick = (goal: Goal) => {
    navigate(`/goals/${goal.id}`);
  };

  if (!user) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Alert severity="info">
            Please log in to view your goals by category.
          </Alert>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ mt: 4 }}>
          <Skeleton variant="rectangular" height={150} sx={{ mb: 3 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={60} sx={{ mb: 1 }} />
        </Box>
      </Container>
    );
  }

  const hasAnyGoals = categories.some((c) => c.goal_count > 0);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Goals by Category
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<ViewListIcon />}
              onClick={() => navigate('/goals')}
            >
              List View
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/goals/new')}
            >
              New Goal
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!hasAnyGoals ? (
          <Paper sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h5" gutterBottom>
              No goals yet
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start tracking your financial goals today.
            </Typography>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/goals/new')}>
              Create Your First Goal
            </Button>
          </Paper>
        ) : (
          <>
            <OverallStats categories={categories} />

            <Typography variant="h6" gutterBottom>
              Categories
            </Typography>

            {categories.map((category) => (
              <CategorySection
                key={category.goal_type}
                category={category}
                expanded={expandedCategories.has(category.goal_type)}
                onToggle={() => toggleCategory(category.goal_type)}
                onGoalClick={handleGoalClick}
              />
            ))}
          </>
        )}
      </Box>
    </Container>
  );
}
