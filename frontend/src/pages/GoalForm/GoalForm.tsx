import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Box, Paper } from '@mui/material';
import { useGoals } from '../../contexts/GoalsContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { GoalType, GoalInput } from '../../types/goal';
import { Group } from '../../types/group';
import { GoalTemplate } from '../../data/goalTemplates';
import { TemplateStep, FormStep } from '../../components/GoalForm';
import { SPACING } from '../../constants/ui';
import { PageHeader } from './components';

const steps = ['Choose Template', 'Customize Goal'];

export default function GoalForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { goals, createGoal, updateGoal } = useGoals();
  const isEditing = Boolean(id);

  const [activeStep, setActiveStep] = useState(isEditing ? 1 : 0);
  const [selectedTemplate, setSelectedTemplate] = useState<GoalTemplate | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [goalType, setGoalType] = useState<GoalType>('savings');
  const [targetDate, setTargetDate] = useState('');
  const [groupId, setGroupId] = useState<number | ''>('');
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      api.getGroups().then((response) => {
        if (response.data) {
          setGroups(response.data.groups);
        }
      });
    }
  }, [user]);

  useEffect(() => {
    if (isEditing && id) {
      const goal = goals.find((g) => String(g.id) === id);
      if (goal) {
        setTitle(goal.title);
        setDescription(goal.description || '');
        setTargetAmount(String(goal.target_amount));
        setCurrentAmount(String(goal.current_amount));
        setGoalType(goal.goal_type);
        setTargetDate(goal.target_date || '');
        setGroupId(goal.group_id || '');
      }
    }
  }, [isEditing, id, goals]);

  const handleSelectTemplate = (template: GoalTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.name);
    setDescription(template.description);
    setTargetAmount(String(template.suggestedAmount));
    setGoalType(template.goalType);

    if (template.suggestedMonths) {
      const date = new Date();
      date.setMonth(date.getMonth() + template.suggestedMonths);
      setTargetDate(date.toISOString().split('T')[0]);
    }
  };

  const handleNextStep = () => {
    setActiveStep(1);
  };

  const handleBackStep = () => {
    setActiveStep(0);
  };

  const handleSkipTemplate = () => {
    setSelectedTemplate(null);
    setActiveStep(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    const target = parseFloat(targetAmount);
    if (isNaN(target) || target <= 0) {
      setError('Target amount must be greater than 0');
      return;
    }

    const current = currentAmount ? parseFloat(currentAmount) : 0;
    if (isNaN(current) || current < 0) {
      setError('Current amount cannot be negative');
      return;
    }

    setLoading(true);

    const input: GoalInput = {
      title: title.trim(),
      description: description.trim() || undefined,
      target_amount: target,
      current_amount: current,
      goal_type: goalType,
      target_date: targetDate || undefined,
      group_id: groupId || undefined,
    };

    let result;
    if (isEditing && id) {
      result = await updateGoal(id, input);
    } else {
      result = await createGoal(input);
    }

    setLoading(false);

    if (result) {
      navigate('/goals');
    } else {
      setError('Failed to save goal. Please try again.');
    }
  };

  return (
    <Container maxWidth={isEditing ? 'sm' : 'md'}>
      <Box sx={{ mt: SPACING.SECTION_MARGIN_BOTTOM }}>
        <Paper sx={{ p: SPACING.SECTION_MARGIN_BOTTOM }}>
          <PageHeader
            isEditing={isEditing}
            activeStep={activeStep}
            steps={steps}
            error={error}
          />

          {!isEditing && activeStep === 0 ? (
            <TemplateStep
              selectedTemplate={selectedTemplate}
              onSelectTemplate={handleSelectTemplate}
              onNext={handleNextStep}
              onSkip={handleSkipTemplate}
              onCancel={() => navigate('/goals')}
            />
          ) : (
            <FormStep
              selectedTemplate={selectedTemplate}
              isEditing={isEditing}
              loading={loading}
              title={title}
              description={description}
              targetAmount={targetAmount}
              currentAmount={currentAmount}
              goalType={goalType}
              targetDate={targetDate}
              groupId={groupId}
              groups={groups}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onTargetAmountChange={setTargetAmount}
              onCurrentAmountChange={setCurrentAmount}
              onGoalTypeChange={setGoalType}
              onTargetDateChange={setTargetDate}
              onGroupIdChange={setGroupId}
              onBack={handleBackStep}
              onCancel={() => navigate('/goals')}
              onSubmit={handleSubmit}
            />
          )}
        </Paper>
      </Box>
    </Container>
  );
}
