import { render, screen } from '@testing-library/react';
import StatsGrid from '../StatsGrid';

describe('StatsGrid', () => {
  describe('Stat Display', () => {
    it('renders all stat cards', () => {
      render(
        <StatsGrid
          totalSaved={5000}
          totalTarget={10000}
          activeCount={3}
          completedCount={2}
        />
      );

      expect(screen.getByText('Total Saved')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Active Goals')).toBeInTheDocument();
      expect(screen.getByText('Completed')).toBeInTheDocument();
    });

    it('displays total saved amount with currency formatting', () => {
      render(
        <StatsGrid
          totalSaved={5000}
          totalTarget={10000}
          activeCount={3}
          completedCount={2}
        />
      );

      expect(screen.getByText('$5,000')).toBeInTheDocument();
    });

    it('displays active goals count', () => {
      render(
        <StatsGrid
          totalSaved={5000}
          totalTarget={10000}
          activeCount={3}
          completedCount={2}
        />
      );

      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('displays completed goals count', () => {
      render(
        <StatsGrid
          totalSaved={5000}
          totalTarget={10000}
          activeCount={3}
          completedCount={2}
        />
      );

      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('calculates progress percentage when target is positive', () => {
      render(
        <StatsGrid
          totalSaved={5000}
          totalTarget={10000}
          activeCount={3}
          completedCount={2}
        />
      );

      expect(screen.getByText('50.0%')).toBeInTheDocument();
      expect(screen.getByText('of $10,000')).toBeInTheDocument();
    });

    it('shows 0.0% progress when target is zero', () => {
      render(
        <StatsGrid
          totalSaved={0}
          totalTarget={0}
          activeCount={0}
          completedCount={0}
        />
      );

      expect(screen.getByText('0.0%')).toBeInTheDocument();
      expect(screen.getByText('of $0')).toBeInTheDocument();
    });

    it('shows 0.0% progress when target is negative', () => {
      render(
        <StatsGrid
          totalSaved={100}
          totalTarget={-100}
          activeCount={1}
          completedCount={0}
        />
      );

      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('calculates progress correctly for partial completion', () => {
      render(
        <StatsGrid
          totalSaved={3333.33}
          totalTarget={10000}
          activeCount={2}
          completedCount={1}
        />
      );

      expect(screen.getByText('33.3%')).toBeInTheDocument();
    });

    it('calculates progress correctly for over 100%', () => {
      render(
        <StatsGrid
          totalSaved={15000}
          totalTarget={10000}
          activeCount={1}
          completedCount={2}
        />
      );

      expect(screen.getByText('150.0%')).toBeInTheDocument();
    });

    it('shows progress with one decimal place', () => {
      render(
        <StatsGrid
          totalSaved={1234.56}
          totalTarget={10000}
          activeCount={1}
          completedCount={0}
        />
      );

      expect(screen.getByText('12.3%')).toBeInTheDocument();
    });
  });

  describe('Zero Values', () => {
    it('handles zero saved amount', () => {
      render(
        <StatsGrid
          totalSaved={0}
          totalTarget={10000}
          activeCount={5}
          completedCount={0}
        />
      );

      expect(screen.getByText('$0')).toBeInTheDocument();
      expect(screen.getByText('0.0%')).toBeInTheDocument();
    });

    it('handles zero active and completed counts', () => {
      render(
        <StatsGrid
          totalSaved={1000}
          totalTarget={5000}
          activeCount={0}
          completedCount={0}
        />
      );

      expect(screen.getAllByText('0')).toHaveLength(2);
    });
  });

  describe('Large Values', () => {
    it('formats large saved amounts correctly', () => {
      render(
        <StatsGrid
          totalSaved={1234567.89}
          totalTarget={2000000}
          activeCount={10}
          completedCount={5}
        />
      );

      expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
    });

    it('formats large target amounts correctly', () => {
      render(
        <StatsGrid
          totalSaved={500000}
          totalTarget={1000000}
          activeCount={8}
          completedCount={3}
        />
      );

      expect(screen.getByText('of $1,000,000')).toBeInTheDocument();
    });

    it('handles large goal counts', () => {
      render(
        <StatsGrid
          totalSaved={10000}
          totalTarget={50000}
          activeCount={25}
          completedCount={15}
        />
      );

      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('15')).toBeInTheDocument();
    });
  });

  describe('Decimal Values', () => {
    it('handles decimal saved amounts', () => {
      render(
        <StatsGrid
          totalSaved={123.45}
          totalTarget={500}
          activeCount={2}
          completedCount={1}
        />
      );

      expect(screen.getByText('$123.45')).toBeInTheDocument();
    });

    it('rounds progress percentage to one decimal place', () => {
      render(
        <StatsGrid
          totalSaved={123.456}
          totalTarget={1000}
          activeCount={1}
          completedCount={0}
        />
      );

      expect(screen.getByText('12.3%')).toBeInTheDocument();
    });
  });
});
