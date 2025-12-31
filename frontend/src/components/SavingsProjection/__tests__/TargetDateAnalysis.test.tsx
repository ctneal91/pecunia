import { render, screen } from '@testing-library/react';
import TargetDateAnalysis from '../TargetDateAnalysis';

describe('TargetDateAnalysis', () => {
  const targetDate = '2025-12-31';

  it('renders on track state', () => {
    render(
      <TargetDateAnalysis
        targetDate={targetDate}
        isOnTrack={true}
        requiredMonthlyForTarget={400}
        averageMonthlyRate={500}
      />
    );

    expect(screen.getByText(/Dec 3\d, 2025/i)).toBeInTheDocument();
    expect(screen.getByText(/on track to reach your goal/i)).toBeInTheDocument();
  });

  it('renders not on track state with required monthly amount', () => {
    render(
      <TargetDateAnalysis
        targetDate={targetDate}
        isOnTrack={false}
        requiredMonthlyForTarget={600}
        averageMonthlyRate={300}
      />
    );

    expect(screen.getByText(/To reach your goal by the target date/i)).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === '$600/month';
    })).toBeInTheDocument();
    expect(screen.getByText(/Currently saving/i)).toBeInTheDocument();
  });

  it('handles null required monthly for target', () => {
    render(
      <TargetDateAnalysis
        targetDate={targetDate}
        isOnTrack={false}
        requiredMonthlyForTarget={null}
        averageMonthlyRate={300}
      />
    );

    expect(screen.getByText((content, element) => {
      return element?.textContent === '$0/month';
    })).toBeInTheDocument();
  });
});
