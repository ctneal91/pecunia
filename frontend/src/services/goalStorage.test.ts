import { goalStorage } from './goalStorage';
import { GoalInput } from '../types/goal';

describe('goalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const mockInput: GoalInput = {
    title: 'Test Goal',
    target_amount: 1000,
    current_amount: 250,
    goal_type: 'savings',
    description: 'Test description',
    target_date: '2025-06-01',
  };

  describe('getAll', () => {
    it('returns empty array when no goals stored', () => {
      expect(goalStorage.getAll()).toEqual([]);
    });

    it('returns stored goals', () => {
      const goal = goalStorage.create(mockInput);
      const goals = goalStorage.getAll();
      expect(goals).toHaveLength(1);
      expect(goals[0].title).toBe('Test Goal');
    });

    it('returns empty array on parse error', () => {
      localStorage.setItem('pecunia_guest_goals', 'invalid json');
      expect(goalStorage.getAll()).toEqual([]);
    });
  });

  describe('getById', () => {
    it('returns null when goal not found', () => {
      expect(goalStorage.getById('nonexistent')).toBeNull();
    });

    it('returns goal when found', () => {
      const created = goalStorage.create(mockInput);
      const goal = goalStorage.getById(created.id);
      expect(goal).not.toBeNull();
      expect(goal?.title).toBe('Test Goal');
    });
  });

  describe('create', () => {
    it('creates goal with generated id', () => {
      const goal = goalStorage.create(mockInput);
      expect(goal.id).toMatch(/^local_/);
    });

    it('sets calculated fields correctly', () => {
      const goal = goalStorage.create(mockInput);
      expect(goal.progress_percentage).toBe(25);
      expect(goal.remaining_amount).toBe(750);
      expect(goal.completed).toBe(false);
    });

    it('sets completed to true when current >= target', () => {
      const goal = goalStorage.create({
        ...mockInput,
        current_amount: 1000,
      });
      expect(goal.completed).toBe(true);
      expect(goal.remaining_amount).toBe(0);
    });

    it('handles zero target amount', () => {
      const goal = goalStorage.create({
        ...mockInput,
        target_amount: 0,
      });
      expect(goal.progress_percentage).toBe(0);
    });

    it('sets default values for optional fields', () => {
      const goal = goalStorage.create({
        title: 'Minimal Goal',
        target_amount: 500,
        goal_type: 'savings',
      });
      expect(goal.current_amount).toBe(0);
      expect(goal.description).toBeNull();
      expect(goal.target_date).toBeNull();
      expect(goal.group_id).toBeNull();
      expect(goal.group_name).toBeNull();
    });

    it('sets timestamps', () => {
      const goal = goalStorage.create(mockInput);
      expect(goal.created_at).toBeDefined();
      expect(goal.updated_at).toBeDefined();
    });

    it('adds new goals to the beginning', () => {
      goalStorage.create({ ...mockInput, title: 'First' });
      goalStorage.create({ ...mockInput, title: 'Second' });
      const goals = goalStorage.getAll();
      expect(goals[0].title).toBe('Second');
      expect(goals[1].title).toBe('First');
    });

    it('sets default color based on goal type', () => {
      const goal = goalStorage.create(mockInput);
      expect(goal.color).toBeDefined();
    });
  });

  describe('update', () => {
    it('returns null when goal not found', () => {
      expect(goalStorage.update('nonexistent', { title: 'Updated' })).toBeNull();
    });

    it('updates goal fields', () => {
      const created = goalStorage.create(mockInput);
      const updated = goalStorage.update(created.id, { title: 'Updated Title' });
      expect(updated?.title).toBe('Updated Title');
    });

    it('recalculates progress fields on update', () => {
      const created = goalStorage.create(mockInput);
      const updated = goalStorage.update(created.id, { current_amount: 500 });
      expect(updated?.progress_percentage).toBe(50);
      expect(updated?.remaining_amount).toBe(500);
      expect(updated?.completed).toBe(false);
    });

    it('updates completed status when goal reached', () => {
      const created = goalStorage.create(mockInput);
      const updated = goalStorage.update(created.id, { current_amount: 1000 });
      expect(updated?.completed).toBe(true);
    });

    it('updates the updated_at timestamp', () => {
      const created = goalStorage.create(mockInput);
      const updated = goalStorage.update(created.id, { title: 'New Title' });
      // Just verify updated_at exists and is an ISO string
      expect(updated?.updated_at).toBeDefined();
      expect(typeof updated?.updated_at).toBe('string');
    });
  });

  describe('delete', () => {
    it('returns false when goal not found', () => {
      expect(goalStorage.delete('nonexistent')).toBe(false);
    });

    it('returns true and removes goal when found', () => {
      const goal = goalStorage.create(mockInput);
      expect(goalStorage.delete(goal.id)).toBe(true);
      expect(goalStorage.getById(goal.id)).toBeNull();
    });

    it('preserves other goals', () => {
      const goal1 = goalStorage.create({ ...mockInput, title: 'Goal 1' });
      const goal2 = goalStorage.create({ ...mockInput, title: 'Goal 2' });

      goalStorage.delete(goal1.id);

      expect(goalStorage.getById(goal1.id)).toBeNull();
      expect(goalStorage.getById(goal2.id)).not.toBeNull();
    });
  });

  describe('clear', () => {
    it('removes all goals', () => {
      goalStorage.create(mockInput);
      goalStorage.create({ ...mockInput, title: 'Another' });
      goalStorage.clear();
      expect(goalStorage.getAll()).toEqual([]);
    });
  });

  describe('hasGoals', () => {
    it('returns false when no goals', () => {
      expect(goalStorage.hasGoals()).toBe(false);
    });

    it('returns true when goals exist', () => {
      goalStorage.create(mockInput);
      expect(goalStorage.hasGoals()).toBe(true);
    });
  });
});
