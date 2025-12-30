class RecurringContributionProcessor
  attr_reader :recurring_contribution

  def self.process_for_goal(goal)
    results = { created: [], milestones: [] }

    goal.recurring_contributions.active.due.find_each do |rc|
      processor = new(rc)
      result = processor.process
      results[:created] << result[:contribution] if result[:contribution]
      results[:milestones].concat(result[:milestones]) if result[:milestones]
    end

    results
  end

  def self.process_all
    results = { processed: 0, created: 0 }

    RecurringContribution.active.due.find_each do |rc|
      processor = new(rc)
      result = processor.process
      results[:processed] += 1
      results[:created] += 1 if result[:contribution]
    end

    results
  end

  def initialize(recurring_contribution)
    @recurring_contribution = recurring_contribution
  end

  def process
    result = { contribution: nil, milestones: [] }

    ActiveRecord::Base.transaction do
      contribution = create_contribution
      result[:contribution] = contribution

      milestones = MilestoneTracker.new(recurring_contribution.goal).check_and_record
      result[:milestones] = milestones.map(&:percentage)

      advance_schedule
    end

    result
  end

  private

  def create_contribution
    recurring_contribution.goal.contributions.create!(
      user: recurring_contribution.user,
      amount: recurring_contribution.amount,
      note: recurring_contribution.note.presence || "Recurring contribution",
      contributed_at: recurring_contribution.next_occurrence_at
    )
  end

  def advance_schedule
    next_date = recurring_contribution.calculate_next_occurrence

    if recurring_contribution.should_deactivate?
      recurring_contribution.update!(is_active: false)
    else
      recurring_contribution.update!(next_occurrence_at: next_date)
    end
  end
end
