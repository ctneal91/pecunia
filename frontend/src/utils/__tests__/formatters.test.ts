import {
  formatCurrency,
  formatDate,
  formatDateShort,
  formatPercentage,
  formatCompactNumber,
} from '../formatters';

describe('formatters', () => {
  describe('formatCurrency', () => {
    it('formats whole numbers without decimals', () => {
      expect(formatCurrency(1000)).toBe('$1,000');
    });

    it('formats numbers with decimals when needed', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('$0');
    });

    it('formats negative numbers', () => {
      expect(formatCurrency(-500.5)).toBe('-$500.5');
    });

    it('formats large numbers with thousands separators', () => {
      expect(formatCurrency(1234567.89)).toBe('$1,234,567.89');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date string', () => {
      const result = formatDate('2024-01-15T00:00:00.000Z');
      expect(result).toMatch(/Jan 1[45], 2024/); // Account for timezone differences
    });

    it('formats Date object', () => {
      const date = new Date('2024-03-20T12:00:00.000Z');
      const result = formatDate(date);
      expect(result).toMatch(/Mar 20, 2024/);
    });
  });

  describe('formatDateShort', () => {
    it('formats ISO date string to short format', () => {
      const result = formatDateShort('2024-01-15T00:00:00.000Z');
      expect(result).toMatch(/1\/1[45]\/2024/); // Account for timezone differences
    });

    it('formats Date object to short format', () => {
      const date = new Date('2024-03-20T12:00:00.000Z');
      const result = formatDateShort(date);
      expect(result).toMatch(/3\/20\/2024/);
    });
  });

  describe('formatPercentage', () => {
    it('formats percentage with default 1 decimal place', () => {
      expect(formatPercentage(85.5)).toBe('85.5%');
    });

    it('formats percentage with 0 decimal places', () => {
      expect(formatPercentage(85.5, 0)).toBe('86%');
    });

    it('formats percentage with 2 decimal places', () => {
      expect(formatPercentage(85.567, 2)).toBe('85.57%');
    });

    it('formats whole numbers', () => {
      expect(formatPercentage(100)).toBe('100.0%');
    });

    it('formats zero', () => {
      expect(formatPercentage(0)).toBe('0.0%');
    });

    it('formats negative percentages', () => {
      expect(formatPercentage(-5.5)).toBe('-5.5%');
    });
  });

  describe('formatCompactNumber', () => {
    it('formats billions', () => {
      expect(formatCompactNumber(1_500_000_000)).toBe('1.5B');
    });

    it('formats exact billion', () => {
      expect(formatCompactNumber(1_000_000_000)).toBe('1.0B');
    });

    it('formats millions', () => {
      expect(formatCompactNumber(3_500_000)).toBe('3.5M');
    });

    it('formats exact million', () => {
      expect(formatCompactNumber(1_000_000)).toBe('1.0M');
    });

    it('formats thousands', () => {
      expect(formatCompactNumber(1_200)).toBe('1.2K');
    });

    it('formats exact thousand', () => {
      expect(formatCompactNumber(1_000)).toBe('1.0K');
    });

    it('formats numbers under 1000 as-is', () => {
      expect(formatCompactNumber(999)).toBe('999');
    });

    it('formats zero', () => {
      expect(formatCompactNumber(0)).toBe('0');
    });

    it('formats small numbers', () => {
      expect(formatCompactNumber(42)).toBe('42');
    });

    it('formats large billions', () => {
      expect(formatCompactNumber(9_999_999_999)).toBe('10.0B');
    });
  });
});
