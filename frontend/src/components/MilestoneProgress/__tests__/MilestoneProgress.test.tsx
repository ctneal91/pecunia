import { render, screen } from '@testing-library/react';
import MilestoneProgress from '../MilestoneProgress';
import { Milestone } from '../../../types/goal';

describe('MilestoneProgress', () => {
  const mockMilestones: Milestone[] = [
    { percentage: 25, achieved_at: '2025-01-15T00:00:00Z' },
    { percentage: 50, achieved_at: '2025-01-20T00:00:00Z' },
  ];

  it('renders milestone header', () => {
    render(<MilestoneProgress milestones={[]} progressPercentage={0} />);
    expect(screen.getByText('Milestones')).toBeInTheDocument();
  });

  it('renders all four milestone percentages', () => {
    render(<MilestoneProgress milestones={[]} progressPercentage={0} />);
    expect(screen.getByText('25%')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('shows achieved milestones with check icons', () => {
    render(<MilestoneProgress milestones={mockMilestones} progressPercentage={50} />);
    const checkIcons = screen.getAllByTestId('CheckCircleIcon');
    expect(checkIcons).toHaveLength(2);
  });

  it('shows unachieved milestones with circle icons', () => {
    render(<MilestoneProgress milestones={mockMilestones} progressPercentage={50} />);
    const uncheckedIcons = screen.getAllByTestId('RadioButtonUncheckedIcon');
    expect(uncheckedIcons).toHaveLength(2);
  });

  it('shows all milestones as unachieved when empty', () => {
    render(<MilestoneProgress milestones={[]} progressPercentage={10} />);
    const uncheckedIcons = screen.getAllByTestId('RadioButtonUncheckedIcon');
    expect(uncheckedIcons).toHaveLength(4);
  });

  it('shows all milestones as achieved when goal is complete', () => {
    const allMilestones: Milestone[] = [
      { percentage: 25, achieved_at: '2025-01-15T00:00:00Z' },
      { percentage: 50, achieved_at: '2025-01-20T00:00:00Z' },
      { percentage: 75, achieved_at: '2025-01-25T00:00:00Z' },
      { percentage: 100, achieved_at: '2025-01-30T00:00:00Z' },
    ];
    render(<MilestoneProgress milestones={allMilestones} progressPercentage={100} />);
    const checkIcons = screen.getAllByTestId('CheckCircleIcon');
    expect(checkIcons).toHaveLength(4);
  });
});
