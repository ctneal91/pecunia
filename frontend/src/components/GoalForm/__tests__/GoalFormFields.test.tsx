import { render, screen, fireEvent } from '@testing-library/react';
import GoalFormFields from '../GoalFormFields';
import { GoalType } from '../../../types/goal';
import { Group } from '../../../types/group';

describe('GoalFormFields', () => {
  const mockOnTitleChange = jest.fn();
  const mockOnDescriptionChange = jest.fn();
  const mockOnTargetAmountChange = jest.fn();
  const mockOnCurrentAmountChange = jest.fn();
  const mockOnGoalTypeChange = jest.fn();
  const mockOnTargetDateChange = jest.fn();
  const mockOnGroupIdChange = jest.fn();

  const mockGroups: Group[] = [
    {
      id: 1,
      name: 'Test Group 1',
      invite_code: 'ABC123',
      member_count: 3,
      goal_count: 5,
      is_admin: true,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    },
    {
      id: 2,
      name: 'Test Group 2',
      invite_code: 'XYZ789',
      member_count: 2,
      goal_count: 3,
      is_admin: false,
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
    },
  ];

  const defaultProps = {
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    goalType: 'savings' as GoalType,
    targetDate: '',
    groupId: '' as number | '',
    groups: [] as Group[],
    onTitleChange: mockOnTitleChange,
    onDescriptionChange: mockOnDescriptionChange,
    onTargetAmountChange: mockOnTargetAmountChange,
    onCurrentAmountChange: mockOnCurrentAmountChange,
    onGoalTypeChange: mockOnGoalTypeChange,
    onTargetDateChange: mockOnTargetDateChange,
    onGroupIdChange: mockOnGroupIdChange,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Title Field', () => {
    it('renders title input field', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByLabelText(/goal title/i)).toBeInTheDocument();
    });

    it('displays current title value', () => {
      render(<GoalFormFields {...defaultProps} title="Emergency Fund" />);
      const titleInput = screen.getByLabelText(/goal title/i) as HTMLInputElement;
      expect(titleInput.value).toBe('Emergency Fund');
    });

    it('calls onTitleChange when title input changes', () => {
      render(<GoalFormFields {...defaultProps} />);
      const titleInput = screen.getByLabelText(/goal title/i);
      fireEvent.change(titleInput, { target: { value: 'New Goal' } });
      expect(mockOnTitleChange).toHaveBeenCalledWith('New Goal');
    });

    it('marks title field as required', () => {
      render(<GoalFormFields {...defaultProps} />);
      const titleInput = screen.getByLabelText(/goal title/i);
      expect(titleInput).toBeRequired();
    });

    it('displays placeholder for title field', () => {
      render(<GoalFormFields {...defaultProps} />);
      const titleInput = screen.getByPlaceholderText(/e.g., Emergency Fund/i);
      expect(titleInput).toBeInTheDocument();
    });
  });

  describe('Goal Type Field', () => {
    it('renders goal type select field', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByLabelText(/goal type/i)).toBeInTheDocument();
    });

    it('displays current goal type value', () => {
      render(<GoalFormFields {...defaultProps} goalType="emergency_fund" />);
      fireEvent.mouseDown(screen.getByLabelText(/goal type/i));
      const options = screen.getAllByText('🛡️ Emergency Fund');
      expect(options.length).toBeGreaterThan(0);
    });

    it('calls onGoalTypeChange when type changes', () => {
      render(<GoalFormFields {...defaultProps} />);
      const typeInput = screen.getByLabelText(/goal type/i);
      fireEvent.mouseDown(typeInput);
      fireEvent.click(screen.getByText('🏖️ Retirement'));
      expect(mockOnGoalTypeChange).toHaveBeenCalledWith('retirement');
    });

    it('marks goal type field as required', () => {
      render(<GoalFormFields {...defaultProps} />);
      const typeInput = screen.getByLabelText(/goal type/i);
      expect(typeInput).toBeRequired();
    });
  });

  describe('Target Amount Field', () => {
    it('renders target amount input field', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByLabelText(/target amount/i)).toBeInTheDocument();
    });

    it('displays current target amount value', () => {
      render(<GoalFormFields {...defaultProps} targetAmount="5000" />);
      const targetInput = screen.getByLabelText(/target amount/i) as HTMLInputElement;
      expect(targetInput.value).toBe('5000');
    });

    it('calls onTargetAmountChange when target amount changes', () => {
      render(<GoalFormFields {...defaultProps} />);
      const targetInput = screen.getByLabelText(/target amount/i);
      fireEvent.change(targetInput, { target: { value: '10000' } });
      expect(mockOnTargetAmountChange).toHaveBeenCalledWith('10000');
    });

    it('marks target amount field as required', () => {
      render(<GoalFormFields {...defaultProps} />);
      const targetInput = screen.getByLabelText(/target amount/i);
      expect(targetInput).toBeRequired();
    });

    it('has number type for target amount field', () => {
      render(<GoalFormFields {...defaultProps} />);
      const targetInput = screen.getByLabelText(/target amount/i);
      expect(targetInput).toHaveAttribute('type', 'number');
    });

    it('displays dollar sign adornment for target amount', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getAllByText('$').length).toBeGreaterThan(0);
    });
  });

  describe('Current Amount Field', () => {
    it('renders current amount input field', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByLabelText(/current amount/i)).toBeInTheDocument();
    });

    it('displays current amount value', () => {
      render(<GoalFormFields {...defaultProps} currentAmount="1500" />);
      const currentInput = screen.getByLabelText(/current amount/i) as HTMLInputElement;
      expect(currentInput.value).toBe('1500');
    });

    it('calls onCurrentAmountChange when current amount changes', () => {
      render(<GoalFormFields {...defaultProps} />);
      const currentInput = screen.getByLabelText(/current amount/i);
      fireEvent.change(currentInput, { target: { value: '2000' } });
      expect(mockOnCurrentAmountChange).toHaveBeenCalledWith('2000');
    });

    it('has number type for current amount field', () => {
      render(<GoalFormFields {...defaultProps} />);
      const currentInput = screen.getByLabelText(/current amount/i);
      expect(currentInput).toHaveAttribute('type', 'number');
    });

    it('displays helper text for current amount', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByText(/how much have you saved so far\?/i)).toBeInTheDocument();
    });
  });

  describe('Target Date Field', () => {
    it('renders target date input field', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByLabelText(/target date/i)).toBeInTheDocument();
    });

    it('displays current target date value', () => {
      render(<GoalFormFields {...defaultProps} targetDate="2025-12-31" />);
      const dateInput = screen.getByLabelText(/target date/i) as HTMLInputElement;
      expect(dateInput.value).toBe('2025-12-31');
    });

    it('calls onTargetDateChange when date changes', () => {
      render(<GoalFormFields {...defaultProps} />);
      const dateInput = screen.getByLabelText(/target date/i);
      fireEvent.change(dateInput, { target: { value: '2026-01-01' } });
      expect(mockOnTargetDateChange).toHaveBeenCalledWith('2026-01-01');
    });

    it('has date type for target date field', () => {
      render(<GoalFormFields {...defaultProps} />);
      const dateInput = screen.getByLabelText(/target date/i);
      expect(dateInput).toHaveAttribute('type', 'date');
    });

    it('displays helper text for target date', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByText(/optional: when do you want to reach this goal\?/i)).toBeInTheDocument();
    });
  });

  describe('Description Field', () => {
    it('renders description textarea field', () => {
      render(<GoalFormFields {...defaultProps} />);
      expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    });

    it('displays current description value', () => {
      render(<GoalFormFields {...defaultProps} description="Save for rainy days" />);
      const descInput = screen.getByLabelText(/description/i);
      expect(descInput).toHaveValue('Save for rainy days');
    });

    it('calls onDescriptionChange when description changes', () => {
      render(<GoalFormFields {...defaultProps} />);
      const descInput = screen.getByLabelText(/description/i);
      fireEvent.change(descInput, { target: { value: 'New description' } });
      expect(mockOnDescriptionChange).toHaveBeenCalledWith('New description');
    });

    it('displays placeholder for description field', () => {
      render(<GoalFormFields {...defaultProps} />);
      const descInput = screen.getByPlaceholderText(/optional: add notes about this goal/i);
      expect(descInput).toBeInTheDocument();
    });
  });

  describe('Group Selection Field', () => {
    it('does not render group field when no groups available', () => {
      render(<GoalFormFields {...defaultProps} groups={[]} />);
      expect(screen.queryByLabelText(/share with group/i)).not.toBeInTheDocument();
    });

    it('renders group field when groups are available', () => {
      render(<GoalFormFields {...defaultProps} groups={mockGroups} />);
      expect(screen.getByLabelText(/share with group/i)).toBeInTheDocument();
    });

    it('displays current group selection', () => {
      render(<GoalFormFields {...defaultProps} groups={mockGroups} groupId={1} />);
      fireEvent.mouseDown(screen.getByLabelText(/share with group/i));
      const options = screen.getAllByText('Test Group 1');
      expect(options.length).toBeGreaterThan(0);
    });

    it('displays personal option as default', () => {
      render(<GoalFormFields {...defaultProps} groups={mockGroups} />);
      fireEvent.mouseDown(screen.getByLabelText(/share with group/i));
      expect(screen.getByText(/personal \(not shared\)/i)).toBeInTheDocument();
    });

    it('calls onGroupIdChange with number when group is selected', () => {
      render(<GoalFormFields {...defaultProps} groups={mockGroups} />);
      const groupInput = screen.getByLabelText(/share with group/i);
      fireEvent.mouseDown(groupInput);
      fireEvent.click(screen.getByText('Test Group 2'));
      expect(mockOnGroupIdChange).toHaveBeenCalledWith(2);
    });

    it('calls onGroupIdChange with empty string when personal is selected', () => {
      render(<GoalFormFields {...defaultProps} groups={mockGroups} groupId={1} />);
      const groupInput = screen.getByLabelText(/share with group/i);
      fireEvent.mouseDown(groupInput);
      fireEvent.click(screen.getByText(/personal \(not shared\)/i));
      expect(mockOnGroupIdChange).toHaveBeenCalledWith('');
    });

    it('displays helper text for group field', () => {
      render(<GoalFormFields {...defaultProps} groups={mockGroups} />);
      expect(screen.getByText(/optional: assign this goal to a group so all members can see it/i)).toBeInTheDocument();
    });
  });

  describe('All Fields with Values', () => {
    it('displays all field values correctly', () => {
      render(
        <GoalFormFields
          {...defaultProps}
          title="Vacation Fund"
          description="Trip to Hawaii"
          targetAmount="8000"
          currentAmount="2500"
          goalType="vacation"
          targetDate="2026-06-15"
          groupId={1}
          groups={mockGroups}
        />
      );

      expect(screen.getByLabelText(/goal title/i)).toHaveValue('Vacation Fund');
      expect(screen.getByLabelText(/description/i)).toHaveValue('Trip to Hawaii');
      expect(screen.getByLabelText(/target amount/i)).toHaveValue(8000);
      expect(screen.getByLabelText(/current amount/i)).toHaveValue(2500);
      expect(screen.getByLabelText(/target date/i)).toHaveValue('2026-06-15');

      fireEvent.mouseDown(screen.getByLabelText(/goal type/i));
      expect(screen.getAllByText('✈️ Vacation').length).toBeGreaterThan(0);

      fireEvent.mouseDown(screen.getByLabelText(/share with group/i));
      expect(screen.getAllByText('Test Group 1').length).toBeGreaterThan(0);
    });
  });

  describe('All Callback Functions', () => {
    it('triggers all callbacks correctly', () => {
      render(<GoalFormFields {...defaultProps} groups={mockGroups} />);

      fireEvent.change(screen.getByLabelText(/goal title/i), { target: { value: 'Test' } });
      fireEvent.change(screen.getByLabelText(/description/i), { target: { value: 'Desc' } });
      fireEvent.change(screen.getByLabelText(/target amount/i), { target: { value: '1000' } });
      fireEvent.change(screen.getByLabelText(/current amount/i), { target: { value: '500' } });

      fireEvent.mouseDown(screen.getByLabelText(/goal type/i));
      fireEvent.click(screen.getByText('🏠 Home'));

      fireEvent.change(screen.getByLabelText(/target date/i), { target: { value: '2025-12-31' } });

      fireEvent.mouseDown(screen.getByLabelText(/share with group/i));
      fireEvent.click(screen.getByText('Test Group 1'));

      expect(mockOnTitleChange).toHaveBeenCalledWith('Test');
      expect(mockOnDescriptionChange).toHaveBeenCalledWith('Desc');
      expect(mockOnTargetAmountChange).toHaveBeenCalledWith('1000');
      expect(mockOnCurrentAmountChange).toHaveBeenCalledWith('500');
      expect(mockOnGoalTypeChange).toHaveBeenCalledWith('home');
      expect(mockOnTargetDateChange).toHaveBeenCalledWith('2025-12-31');
      expect(mockOnGroupIdChange).toHaveBeenCalledWith(1);
    });
  });
});
