require "csv"

class ExportService
  GOAL_HEADERS = %w[
    id title description type target_amount current_amount progress_percentage
    remaining_amount completed target_date group_name created_at
  ].freeze

  CONTRIBUTION_HEADERS = %w[
    id goal_title amount note contributed_at
  ].freeze

  def initialize(user)
    @user = user
  end

  def goals_csv
    goals = accessible_goals.includes(:group)
    generate_csv(GOAL_HEADERS) do |csv|
      goals.each { |goal| csv << goal_row(goal) }
    end
  end

  def goals_json
    goals = accessible_goals.includes(:group, :milestones)
    goals.map { |g| GoalSerializer.new(g).as_json }
  end

  def contributions_csv(goal_id = nil)
    contributions = goal_id ? contributions_for_goal(goal_id) : all_contributions
    generate_csv(CONTRIBUTION_HEADERS) do |csv|
      contributions.each { |c| csv << contribution_row(c) }
    end
  end

  def contributions_json(goal_id = nil)
    contributions = goal_id ? contributions_for_goal(goal_id) : all_contributions
    contributions.map { |c| ContributionSerializer.new(c).as_json.merge(goal_title: c.goal.title) }
  end

  def summary_report
    goals = accessible_goals.includes(:group, :contributions, :milestones)
    {
      generated_at: Time.current.iso8601,
      user: { email: user.email, name: user.name },
      summary: build_summary(goals),
      by_category: CategoryAggregator.new(goals).aggregate,
      goals: goals.map { |g| GoalSerializer.new(g).as_json }
    }
  end

  def goal_report(goal_id)
    goal = accessible_goals.includes(:contributions, :milestones, :recurring_contributions).find(goal_id)
    {
      generated_at: Time.current.iso8601,
      goal: GoalSerializer.new(goal).as_json,
      contributions: goal.contributions.order(contributed_at: :desc).map { |c| ContributionSerializer.new(c).as_json },
      recurring_contributions: goal.recurring_contributions.map { |rc| RecurringContributionSerializer.new(rc).as_json },
      statistics: goal_statistics(goal)
    }
  end

  private

  attr_reader :user

  def accessible_goals
    personal_goals = user.goals.where(group_id: nil)
    group_goal_ids = Goal.joins(group: :memberships)
                         .where(memberships: { user_id: user.id })
                         .pluck(:id)
    Goal.where(id: personal_goals.pluck(:id) + group_goal_ids).order(created_at: :desc)
  end

  def contributions_for_goal(goal_id)
    goal = accessible_goals.find(goal_id)
    goal.contributions.includes(:goal).order(contributed_at: :desc)
  end

  def all_contributions
    Contribution.includes(:goal)
                .where(goal_id: accessible_goals.pluck(:id))
                .order(contributed_at: :desc)
  end

  def generate_csv(headers)
    CSV.generate do |csv|
      csv << headers
      yield csv
    end
  end

  def goal_row(goal)
    [
      goal.id,
      goal.title,
      goal.description,
      goal.goal_type,
      goal.target_amount.to_f,
      goal.current_amount.to_f,
      goal.progress_percentage,
      goal.remaining_amount.to_f,
      goal.completed?,
      goal.target_date,
      goal.group&.name,
      goal.created_at.iso8601
    ]
  end

  def contribution_row(contribution)
    [
      contribution.id,
      contribution.goal.title,
      contribution.amount.to_f,
      contribution.note,
      contribution.contributed_at.iso8601
    ]
  end

  def build_summary(goals)
    total_saved = goals.sum(&:current_amount)
    total_target = goals.sum(&:target_amount)
    completed_count = goals.count(&:completed?)

    {
      total_goals: goals.size,
      total_saved: total_saved.to_f,
      total_target: total_target.to_f,
      overall_progress: total_target.positive? ? ((total_saved / total_target) * 100).round(1) : 0,
      completed_count: completed_count,
      active_count: goals.size - completed_count
    }
  end

  def goal_statistics(goal)
    contributions = goal.contributions
    amounts = contributions.map(&:amount)

    {
      total_contributions: contributions.size,
      total_contributed: contributions.sum(&:amount).to_f,
      average_contribution: amounts.any? ? (amounts.sum / amounts.size).to_f.round(2) : 0,
      largest_contribution: amounts.max&.to_f || 0,
      smallest_contribution: amounts.min&.to_f || 0,
      first_contribution_date: contributions.minimum(:contributed_at),
      last_contribution_date: contributions.maximum(:contributed_at),
      milestones_achieved: goal.milestones.count,
      days_since_start: goal.created_at ? (Date.current - goal.created_at.to_date).to_i : 0
    }
  end
end
