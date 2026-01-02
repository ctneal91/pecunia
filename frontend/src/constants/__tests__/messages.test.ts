import { CONFIRMATION_MESSAGES, SUCCESS_MESSAGES, ERROR_MESSAGES, LOADING_MESSAGES } from '../messages';

describe('messages', () => {
  describe('CONFIRMATION_MESSAGES', () => {
    it('has static DELETE_CONTRIBUTION message', () => {
      expect(CONFIRMATION_MESSAGES.DELETE_CONTRIBUTION).toBe('Delete this contribution?');
    });

    it('has static DELETE_RECURRING message', () => {
      expect(CONFIRMATION_MESSAGES.DELETE_RECURRING).toBe('Delete this recurring contribution?');
    });

    // Tests for lines 8-12: Dynamic message functions
    describe('dynamic message functions (lines 8-12)', () => {
      it('generates DELETE_GOAL message with goal title (line 8)', () => {
        const message = CONFIRMATION_MESSAGES.DELETE_GOAL('Emergency Fund');
        expect(message).toBe('Delete "Emergency Fund"? This cannot be undone.');
      });

      it('generates DELETE_GOAL message with special characters', () => {
        const message = CONFIRMATION_MESSAGES.DELETE_GOAL('Vacation to Hawaii & Japan');
        expect(message).toBe('Delete "Vacation to Hawaii & Japan"? This cannot be undone.');
      });

      it('generates DELETE_GROUP message with group name (line 10)', () => {
        const message = CONFIRMATION_MESSAGES.DELETE_GROUP('Family Savings');
        expect(message).toBe('Delete "Family Savings"? This cannot be undone.');
      });

      it('generates DELETE_GROUP message with special characters', () => {
        const message = CONFIRMATION_MESSAGES.DELETE_GROUP('Team "Alpha" Budget');
        expect(message).toBe('Delete "Team "Alpha" Budget"? This cannot be undone.');
      });

      it('generates LEAVE_GROUP message with group name (line 11)', () => {
        const message = CONFIRMATION_MESSAGES.LEAVE_GROUP('Monthly Contributors');
        expect(message).toBe('Leave "Monthly Contributors"?');
      });

      it('generates LEAVE_GROUP message with empty string', () => {
        const message = CONFIRMATION_MESSAGES.LEAVE_GROUP('');
        expect(message).toBe('Leave ""?');
      });

      it('generates REMOVE_MEMBER message with member name (line 12)', () => {
        const message = CONFIRMATION_MESSAGES.REMOVE_MEMBER('John Doe');
        expect(message).toBe('Remove John Doe from this group?');
      });

      it('generates REMOVE_MEMBER message with single name', () => {
        const message = CONFIRMATION_MESSAGES.REMOVE_MEMBER('Alice');
        expect(message).toBe('Remove Alice from this group?');
      });
    });
  });

  describe('SUCCESS_MESSAGES', () => {
    it('has all success messages defined', () => {
      expect(SUCCESS_MESSAGES.GOAL_CREATED).toBe('Goal created successfully!');
      expect(SUCCESS_MESSAGES.GOAL_UPDATED).toBe('Goal updated successfully!');
      expect(SUCCESS_MESSAGES.CONTRIBUTION_ADDED).toBe('Contribution added!');
      expect(SUCCESS_MESSAGES.RECURRING_CREATED).toBe('Recurring contribution created!');
    });
  });

  describe('ERROR_MESSAGES', () => {
    it('has all error messages defined', () => {
      expect(ERROR_MESSAGES.GOAL_NOT_FOUND).toBe('Goal not found');
      expect(ERROR_MESSAGES.NETWORK_ERROR).toBe('Network error. Please try again.');
      expect(ERROR_MESSAGES.UNAUTHORIZED).toBe('You must be logged in to perform this action.');
    });
  });

  describe('LOADING_MESSAGES', () => {
    it('has all loading messages defined', () => {
      expect(LOADING_MESSAGES.LOADING).toBe('Loading...');
      expect(LOADING_MESSAGES.EXPORTING).toBe('Exporting...');
      expect(LOADING_MESSAGES.SUBMITTING).toBe('Submitting...');
      expect(LOADING_MESSAGES.SAVING).toBe('Saving...');
    });
  });
});
