import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider, createTheme } from '@mui/material';
import GoalTemplates from '../GoalTemplates';
import { GoalTemplate } from '../../../data/goalTemplates';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{component}</ThemeProvider>);
};

describe('GoalTemplates', () => {
  const mockOnSelectTemplate = jest.fn();

  beforeEach(() => {
    mockOnSelectTemplate.mockClear();
  });

  it('renders template categories', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    expect(screen.getByText('Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('Travel & Vacation')).toBeInTheDocument();
    expect(screen.getByText('Home & Housing')).toBeInTheDocument();
    expect(screen.getByText('Education')).toBeInTheDocument();
    expect(screen.getByText('Vehicle')).toBeInTheDocument();
    expect(screen.getByText('Lifestyle & Fun')).toBeInTheDocument();
  });

  it('expands category when clicked', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    const emergencyButton = screen.getByText('Emergency Fund').closest('button');
    fireEvent.click(emergencyButton!);

    expect(screen.getByText('Starter Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('3-Month Emergency Fund')).toBeInTheDocument();
    expect(screen.getByText('6-Month Emergency Fund')).toBeInTheDocument();
  });

  it('calls onSelectTemplate when template is clicked', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    const emergencyButton = screen.getByText('Emergency Fund').closest('button');
    fireEvent.click(emergencyButton!);

    const starterTemplate = screen.getByText('Starter Emergency Fund').closest('div[class*="MuiPaper"]');
    fireEvent.click(starterTemplate!);

    expect(mockOnSelectTemplate).toHaveBeenCalledTimes(1);
    expect(mockOnSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'emergency-starter',
        name: 'Starter Emergency Fund',
        suggestedAmount: 1000,
      })
    );
  });

  it('displays suggested amount on template card', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    const emergencyButton = screen.getByText('Emergency Fund').closest('button');
    fireEvent.click(emergencyButton!);

    // Use getAllByText since amounts may appear in multiple places
    expect(screen.getAllByText('$1,000').length).toBeGreaterThan(0);
    expect(screen.getAllByText('$7,500').length).toBeGreaterThan(0);
  });

  it('displays suggested months on template card', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    const emergencyButton = screen.getByText('Emergency Fund').closest('button');
    fireEvent.click(emergencyButton!);

    // Use getAllByText since months may appear in multiple categories
    expect(screen.getAllByText('3 months').length).toBeGreaterThan(0);
    expect(screen.getAllByText('12 months').length).toBeGreaterThan(0);
  });

  it('shows tips when Show tips button is clicked', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    const emergencyButton = screen.getByText('Emergency Fund').closest('button');
    fireEvent.click(emergencyButton!);

    const showTipsButtons = screen.getAllByText('Show tips');
    fireEvent.click(showTipsButtons[0]);

    expect(screen.getByText(/Start with \$1,000/)).toBeInTheDocument();
  });

  it('highlights selected template', () => {
    const selectedTemplate: GoalTemplate = {
      id: 'emergency-starter',
      name: 'Starter Emergency Fund',
      description: 'A $1,000 buffer for unexpected expenses',
      goalType: 'emergency_fund',
      suggestedAmount: 1000,
      suggestedMonths: 3,
      tips: [],
    };

    renderWithTheme(
      <GoalTemplates
        onSelectTemplate={mockOnSelectTemplate}
        selectedTemplateId={selectedTemplate.id}
      />
    );

    // The category should auto-expand if it contains the selected template
    expect(screen.getByText('Starter Emergency Fund')).toBeInTheDocument();
  });

  it('displays description text', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    expect(
      screen.getByText(/choose a template to get started quickly/i)
    ).toBeInTheDocument();
  });

  it('shows template count chips for each category', () => {
    renderWithTheme(
      <GoalTemplates onSelectTemplate={mockOnSelectTemplate} />
    );

    // Each category has a count chip showing number of templates
    const chips = screen.getAllByText('3');
    expect(chips.length).toBeGreaterThan(0);
  });
});
