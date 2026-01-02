import {
  calculateDaysSinceFirst,
  calculateSavingsRates,
  determineContributionFrequency,
  calculateEstimatedCompletion,
  calculateTargetDateRequirements,
} from '../contributionCalculations';

describe('contributionCalculations', () => {
  describe('calculateDaysSinceFirst', () => {
    it('calculates days since first contribution', () => {
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

      const days = calculateDaysSinceFirst(tenDaysAgo);

      expect(days).toBeGreaterThanOrEqual(10);
      expect(days).toBeLessThanOrEqual(11); // Allow for rounding
    });

    it('returns minimum of 1 day', () => {
      const now = new Date();
      const days = calculateDaysSinceFirst(now);

      expect(days).toBe(1);
    });
  });

  describe('calculateSavingsRates', () => {
    it('calculates daily, weekly, and monthly rates', () => {
      const totalAmount = 300;
      const daysSinceFirst = 30;

      const rates = calculateSavingsRates(totalAmount, daysSinceFirst);

      expect(rates.dailyRate).toBe(10);
      expect(rates.weeklyRate).toBe(70);
      expect(rates.monthlyRate).toBe(300);
    });
  });

  describe('determineContributionFrequency', () => {
    const createContribution = (daysAgo: number) => ({
      id: 1,
      goal_id: 1,
      user_id: 1,
      amount: 100,
      contributed_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
      note: null,
      created_at: '',
      updated_at: '',
    });

    it('returns "Just started" for single contribution', () => {
      const contributions = [createContribution(0)];
      const firstDate = new Date(contributions[0].contributed_at);
      const lastDate = new Date(contributions[0].contributed_at);

      const frequency = determineContributionFrequency(contributions, firstDate, lastDate);

      expect(frequency).toBe('Just started');
    });

    it('returns "Daily" for daily contributions', () => {
      const contributions = [createContribution(2), createContribution(1), createContribution(0)];
      const firstDate = new Date(contributions[0].contributed_at);
      const lastDate = new Date(contributions[2].contributed_at);

      const frequency = determineContributionFrequency(contributions, firstDate, lastDate);

      expect(frequency).toBe('Daily');
    });

    it('returns "Weekly" for weekly contributions', () => {
      const contributions = [createContribution(14), createContribution(7), createContribution(0)];
      const firstDate = new Date(contributions[0].contributed_at);
      const lastDate = new Date(contributions[2].contributed_at);

      const frequency = determineContributionFrequency(contributions, firstDate, lastDate);

      expect(frequency).toBe('Weekly');
    });

    it('returns "Monthly" for monthly contributions', () => {
      const contributions = [createContribution(60), createContribution(30), createContribution(0)];
      const firstDate = new Date(contributions[0].contributed_at);
      const lastDate = new Date(contributions[2].contributed_at);

      const frequency = determineContributionFrequency(contributions, firstDate, lastDate);

      expect(frequency).toBe('Monthly');
    });

    it('returns "Bi-weekly" for bi-weekly contributions', () => {
      const contributions = [createContribution(26), createContribution(13), createContribution(0)];
      const firstDate = new Date(contributions[0].contributed_at);
      const lastDate = new Date(contributions[2].contributed_at);

      const frequency = determineContributionFrequency(contributions, firstDate, lastDate);

      expect(frequency).toBe('Bi-weekly');
    });

    it('returns "Occasional" for infrequent contributions (line 38)', () => {
      // Test contributions more than 31 days apart on average
      const contributions = [createContribution(90), createContribution(45), createContribution(0)];
      const firstDate = new Date(contributions[0].contributed_at);
      const lastDate = new Date(contributions[2].contributed_at);

      const frequency = determineContributionFrequency(contributions, firstDate, lastDate);

      expect(frequency).toBe('Occasional');
    });

    it('returns "Occasional" for very infrequent contributions', () => {
      // Test with only 2 contributions 60 days apart (avg = 60 days)
      const contributions = [createContribution(60), createContribution(0)];
      const firstDate = new Date(contributions[0].contributed_at);
      const lastDate = new Date(contributions[1].contributed_at);

      const frequency = determineContributionFrequency(contributions, firstDate, lastDate);

      expect(frequency).toBe('Occasional');
    });
  });

  describe('calculateEstimatedCompletion', () => {
    it('returns 0 days when remaining amount is 0', () => {
      const result = calculateEstimatedCompletion(10, 0);

      expect(result.daysToComplete).toBe(0);
      expect(result.estimatedCompletionDate).toBeInstanceOf(Date);
    });

    it('calculates completion date based on daily rate', () => {
      const dailyRate = 10;
      const remainingAmount = 100;

      const result = calculateEstimatedCompletion(dailyRate, remainingAmount);

      expect(result.daysToComplete).toBe(10);
      expect(result.estimatedCompletionDate).toBeInstanceOf(Date);
    });

    it('returns null when daily rate is 0', () => {
      const result = calculateEstimatedCompletion(0, 100);

      expect(result.daysToComplete).toBeNull();
      expect(result.estimatedCompletionDate).toBeNull();
    });
  });

  describe('calculateTargetDateRequirements', () => {
    it('returns null when remaining amount is 0', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = calculateTargetDateRequirements(futureDate.toISOString(), 0, 10);

      expect(result.requiredMonthlyForTarget).toBeNull();
      expect(result.isOnTrack).toBeNull();
    });

    it('calculates required monthly rate for future target date', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = calculateTargetDateRequirements(futureDate.toISOString(), 300, 10);

      expect(result.requiredMonthlyForTarget).toBe(300);
      expect(result.isOnTrack).toBe(true);
    });

    it('marks as not on track when daily rate is too low', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 30);

      const result = calculateTargetDateRequirements(futureDate.toISOString(), 600, 10);

      expect(result.isOnTrack).toBe(false);
    });

    it('handles past target dates', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30);

      const result = calculateTargetDateRequirements(pastDate.toISOString(), 300, 10);

      expect(result.requiredMonthlyForTarget).toBe(300);
      expect(result.isOnTrack).toBe(false);
    });
  });
});
