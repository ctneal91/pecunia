import { render, screen } from '@testing-library/react';
import StatsSummary from '../StatsSummary';

describe('StatsSummary', () => {
  it('renders stats with multiple contributions and days', () => {
    render(
      <StatsSummary
        totalContributions={5}
        daysSinceFirstContribution={30}
        averageWeeklyRate={125}
      />
    );

    expect(screen.getByText(/5 contributions over 30 days/i)).toBeInTheDocument();
    expect(screen.getByText(/\$125\/week/i)).toBeInTheDocument();
  });

  it('renders stats with single contribution and day', () => {
    render(
      <StatsSummary
        totalContributions={1}
        daysSinceFirstContribution={1}
        averageWeeklyRate={50}
      />
    );

    expect(screen.getByText(/1 contribution over 1 day/i)).toBeInTheDocument();
    expect(screen.getByText(/\$50\/week/i)).toBeInTheDocument();
  });

  it('handles zero values', () => {
    render(
      <StatsSummary
        totalContributions={0}
        daysSinceFirstContribution={0}
        averageWeeklyRate={0}
      />
    );

    expect(screen.getByText(/0 contributions over 0 days/i)).toBeInTheDocument();
    expect(screen.getByText(/\$0\/week/i)).toBeInTheDocument();
  });
});
