import { useState } from 'react';
import { Box, Paper, Collapse, useTheme } from '@mui/material';
import { goalTemplates, GoalTemplate, TemplateCategory } from '../../data/goalTemplates';
import {
  TemplateChips,
  TipsSection,
  CategoryHeader,
  IntroText,
  TemplateCardHeader,
} from './components';

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
  selectedTemplateId?: string;
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: {
  template: GoalTemplate;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const theme = useTheme();

  return (
    <Paper
      elevation={isSelected ? 3 : 1}
      sx={{
        p: 2,
        cursor: 'pointer',
        border: isSelected ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: theme.palette.primary.light,
          transform: 'translateY(-2px)',
        },
      }}
      onClick={onSelect}
    >
      <TemplateCardHeader
        name={template.name}
        description={template.description}
        isSelected={isSelected}
      />

      <TemplateChips
        suggestedAmount={template.suggestedAmount}
        suggestedMonths={template.suggestedMonths}
      />

      <TipsSection tips={template.tips} />
    </Paper>
  );
}

function CategorySection({
  category,
  selectedTemplateId,
  onSelectTemplate,
}: {
  category: TemplateCategory;
  selectedTemplateId?: string;
  onSelectTemplate: (template: GoalTemplate) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(
    category.templates.some(t => t.id === selectedTemplateId)
  );

  return (
    <Box sx={{ mb: 2 }}>
      <CategoryHeader
        icon={category.icon}
        name={category.name}
        templateCount={category.templates.length}
        isExpanded={isExpanded}
        onToggle={() => setIsExpanded(!isExpanded)}
      />

      <Collapse in={isExpanded}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
            gap: 2,
            mt: 2,
          }}
        >
          {category.templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              isSelected={template.id === selectedTemplateId}
              onSelect={() => onSelectTemplate(template)}
            />
          ))}
        </Box>
      </Collapse>
    </Box>
  );
}

export default function GoalTemplates({
  onSelectTemplate,
  selectedTemplateId,
}: GoalTemplatesProps) {
  return (
    <Box>
      <IntroText />

      {goalTemplates.map((category) => (
        <CategorySection
          key={category.id}
          category={category}
          selectedTemplateId={selectedTemplateId}
          onSelectTemplate={onSelectTemplate}
        />
      ))}
    </Box>
  );
}
