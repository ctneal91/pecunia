import { getTemplateById, getTemplatesByType, goalTemplates } from '../goalTemplates';
import { GoalType } from '../../types/goal';

describe('goalTemplates', () => {
  describe('getTemplateById', () => {
    it('returns template when found in first category', () => {
      const template = getTemplateById('emergency-starter');

      expect(template).toBeDefined();
      expect(template?.id).toBe('emergency-starter');
      expect(template?.name).toBe('Starter Emergency Fund');
    });

    it('returns template when found in later category (line 301-302)', () => {
      // Find a template that's not in the first category
      const secondCategoryTemplateId = goalTemplates[1]?.templates[0]?.id;
      if (!secondCategoryTemplateId) {
        throw new Error('Test setup failed: no second category template found');
      }

      const template = getTemplateById(secondCategoryTemplateId);

      expect(template).toBeDefined();
      expect(template?.id).toBe(secondCategoryTemplateId);
    });

    it('returns undefined when template not found (line 304)', () => {
      const template = getTemplateById('nonexistent-template');

      expect(template).toBeUndefined();
    });
  });

  describe('getTemplatesByType', () => {
    it('returns templates matching the goal type (line 310)', () => {
      const emergencyTemplates = getTemplatesByType('emergency_fund' as GoalType);

      expect(emergencyTemplates.length).toBeGreaterThan(0);
      emergencyTemplates.forEach(template => {
        expect(template.goalType).toBe('emergency_fund');
      });
    });

    it('returns templates from multiple categories (line 310)', () => {
      const vacationTemplates = getTemplatesByType('vacation' as GoalType);

      expect(vacationTemplates.length).toBeGreaterThan(0);
      vacationTemplates.forEach(template => {
        expect(template.goalType).toBe('vacation');
      });
    });

    it('returns empty array when no templates match (line 312)', () => {
      const debtPayoffTemplates = getTemplatesByType('debt_payoff' as GoalType);

      expect(debtPayoffTemplates).toEqual([]);
    });
  });
});
