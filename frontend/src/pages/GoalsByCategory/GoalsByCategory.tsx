import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Alert } from '@mui/material';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { CategoryStats, Goal } from '../../types/goal';
import {
  UnauthenticatedState,
  LoadingState,
  EmptyState,
  PageHeader,
  CategorySection,
  OverallStats,
} from './components';

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
    return <UnauthenticatedState />;
  }

  if (loading) {
    return <LoadingState />;
  }

  const hasAnyGoals = categories.some((c) => c.goal_count > 0);

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4 }}>
        <PageHeader
          onListView={() => navigate('/goals')}
          onNewGoal={() => navigate('/goals/new')}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!hasAnyGoals ? (
          <EmptyState onCreateGoal={() => navigate('/goals/new')} />
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
