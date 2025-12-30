class RecurringContributionSerializer
  attr_reader :recurring_contribution

  def initialize(recurring_contribution)
    @recurring_contribution = recurring_contribution
  end

  def as_json
    {
      id: recurring_contribution.id,
      goal_id: recurring_contribution.goal_id,
      user_id: recurring_contribution.user_id,
      amount: recurring_contribution.amount.to_f,
      frequency: recurring_contribution.frequency,
      next_occurrence_at: recurring_contribution.next_occurrence_at,
      end_date: recurring_contribution.end_date,
      is_active: recurring_contribution.is_active,
      note: recurring_contribution.note,
      created_at: recurring_contribution.created_at
    }
  end
end
