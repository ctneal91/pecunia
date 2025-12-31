import { render, screen } from '@testing-library/react';
import SavingsRateCards from '../SavingsRateCards';

describe('SavingsRateCards', () => {
  it('renders monthly rate and frequency', () => {
    render(
      <SavingsRateCards
        averageMonthlyRate={500}
        contributionFrequency="Weekly"
      />
    );

    expect(screen.getByText('Monthly Rate')).toBeInTheDocument();
    expect(screen.getByText('$500')).toBeInTheDocument();
    expect(screen.getByText('Frequency')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('renders zero monthly rate', () => {
    render(
      <SavingsRateCards
        averageMonthlyRate={0}
        contributionFrequency="N/A"
      />
    );

    expect(screen.getByText('$0')).toBeInTheDocument();
    expect(screen.getByText('N/A')).toBeInTheDocument();
  });
});
