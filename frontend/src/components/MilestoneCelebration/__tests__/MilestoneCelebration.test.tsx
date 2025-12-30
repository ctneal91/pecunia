import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MilestoneCelebration from '../MilestoneCelebration';

describe('MilestoneCelebration', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders milestone celebration dialog', () => {
    render(
      <MilestoneCelebration
        milestones={[25]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('25% Milestone!')).toBeInTheDocument();
    expect(screen.getByText('Test Goal')).toBeInTheDocument();
  });

  it('shows correct message for 25% milestone', () => {
    render(
      <MilestoneCelebration
        milestones={[25]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText("You're 25% there! Great start!")).toBeInTheDocument();
  });

  it('shows correct message for 50% milestone', () => {
    render(
      <MilestoneCelebration
        milestones={[50]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Halfway to your goal!')).toBeInTheDocument();
  });

  it('shows correct message for 75% milestone', () => {
    render(
      <MilestoneCelebration
        milestones={[75]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Almost there! Just 25% to go!')).toBeInTheDocument();
  });

  it('shows correct message for 100% milestone', () => {
    render(
      <MilestoneCelebration
        milestones={[100]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Congratulations! Goal reached!')).toBeInTheDocument();
  });

  it('shows Next button when multiple milestones', () => {
    render(
      <MilestoneCelebration
        milestones={[25, 50]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Next')).toBeInTheDocument();
  });

  it('shows Continue button for last milestone', () => {
    render(
      <MilestoneCelebration
        milestones={[25]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );
    expect(screen.getByText('Continue')).toBeInTheDocument();
  });

  it('advances to next milestone on Next click', () => {
    render(
      <MilestoneCelebration
        milestones={[25, 50]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('25% Milestone!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('50% Milestone!')).toBeInTheDocument();
  });

  it('calls onClose after last milestone', () => {
    render(
      <MilestoneCelebration
        milestones={[25]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );

    fireEvent.click(screen.getByText('Continue'));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('auto-advances after timeout', async () => {
    render(
      <MilestoneCelebration
        milestones={[25, 50]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('25% Milestone!')).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(screen.getByText('50% Milestone!')).toBeInTheDocument();
    });
  });

  it('calls onClose after auto-advance through all milestones', async () => {
    render(
      <MilestoneCelebration
        milestones={[25]}
        goalTitle="Test Goal"
        onClose={mockOnClose}
      />
    );

    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
