import { render, screen } from '@testing-library/react';
import EstimatedCompletion from '../EstimatedCompletion';

describe('EstimatedCompletion', () => {
  it('renders goal complete state', () => {
    render(
      <EstimatedCompletion
        isGoalComplete={true}
        estimatedCompletionDate={null}
        daysToComplete={null}
      />
    );

    expect(screen.getByText('Goal Complete!')).toBeInTheDocument();
  });

  it('renders estimated completion date with multiple days remaining', () => {
    const futureDate = new Date('2025-12-31');
    render(
      <EstimatedCompletion
        isGoalComplete={false}
        estimatedCompletionDate={futureDate}
        daysToComplete={30}
      />
    );

    expect(screen.getByText(/Dec 3\d, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/30 days remaining/i)).toBeInTheDocument();
  });

  it('renders estimated completion date with one day remaining', () => {
    const futureDate = new Date('2025-12-31');
    render(
      <EstimatedCompletion
        isGoalComplete={false}
        estimatedCompletionDate={futureDate}
        daysToComplete={1}
      />
    );

    expect(screen.getByText(/1 day remaining/i)).toBeInTheDocument();
  });

  it('renders unable to estimate state', () => {
    render(
      <EstimatedCompletion
        isGoalComplete={false}
        estimatedCompletionDate={null}
        daysToComplete={null}
      />
    );

    expect(screen.getByText(/Unable to estimate/i)).toBeInTheDocument();
  });
});
