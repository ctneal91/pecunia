import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Collapse,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { goalTemplates, GoalTemplate, TemplateCategory } from '../../data/goalTemplates';

interface GoalTemplatesProps {
  onSelectTemplate: (template: GoalTemplate) => void;
  selectedTemplateId?: string;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
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
  const [showTips, setShowTips] = useState(false);

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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          {template.name}
        </Typography>
        {isSelected && (
          <CheckCircleOutlineIcon color="primary" fontSize="small" />
        )}
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {template.description}
      </Typography>

      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
        <Chip
          label={formatCurrency(template.suggestedAmount)}
          size="small"
          color="primary"
          variant="outlined"
        />
        {template.suggestedMonths && (
          <Chip
            label={`${template.suggestedMonths} months`}
            size="small"
            variant="outlined"
          />
        )}
      </Box>

      {template.tips.length > 0 && (
        <Box sx={{ mt: 1 }}>
          <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setShowTips(!showTips);
            }}
            endIcon={showTips ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            sx={{ textTransform: 'none', p: 0 }}
          >
            {showTips ? 'Hide tips' : 'Show tips'}
          </Button>
          <Collapse in={showTips}>
            <List dense sx={{ mt: 1 }}>
              {template.tips.map((tip, index) => (
                <ListItem key={index} sx={{ py: 0, px: 0 }}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <CheckCircleOutlineIcon fontSize="small" color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary={tip}
                    primaryTypographyProps={{ variant: 'body2' }}
                  />
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      )}
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
      <Button
        fullWidth
        onClick={() => setIsExpanded(!isExpanded)}
        sx={{
          justifyContent: 'space-between',
          textTransform: 'none',
          py: 1.5,
          px: 2,
          bgcolor: 'action.hover',
          borderRadius: 1,
          '&:hover': {
            bgcolor: 'action.selected',
          },
        }}
        endIcon={isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h6" component="span">
            {category.icon}
          </Typography>
          <Typography variant="subtitle1" fontWeight="medium">
            {category.name}
          </Typography>
          <Chip
            label={category.templates.length}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
      </Button>

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
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose a template to get started quickly, or skip to create a custom goal.
      </Typography>

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
