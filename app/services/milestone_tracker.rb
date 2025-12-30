class MilestoneTracker
  attr_reader :goal

  def initialize(goal)
    @goal = goal
  end

  def check_and_record
    return [] if goal.target_amount.zero?

    newly_achieved = []
    current_progress = goal.progress_percentage

    Milestone::PERCENTAGES.each do |percentage|
      next if current_progress < percentage
      next if already_achieved?(percentage)

      milestone = record_milestone(percentage)
      newly_achieved << milestone if milestone
    end

    newly_achieved
  end

  private

  def already_achieved?(percentage)
    goal.milestones.exists?(percentage: percentage)
  end

  def record_milestone(percentage)
    goal.milestones.create(
      percentage: percentage,
      achieved_at: Time.current
    )
  rescue ActiveRecord::RecordNotUnique
    nil
  end
end
