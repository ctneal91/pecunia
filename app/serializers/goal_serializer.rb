class GoalSerializer
  attr_reader :goal

  def initialize(goal)
    @goal = goal
  end

  def as_json
    base_attributes.merge(contributor_attributes).merge(milestone_attributes)
  end

  private

  def base_attributes
    {
      id: goal.id,
      title: goal.title,
      description: goal.description,
      target_amount: goal.target_amount.to_f,
      current_amount: goal.current_amount.to_f,
      goal_type: goal.goal_type,
      target_date: goal.target_date,
      icon: goal.icon,
      color: goal.color,
      progress_percentage: goal.progress_percentage,
      remaining_amount: goal.remaining_amount.to_f,
      completed: goal.completed?,
      group_id: goal.group_id,
      group_name: goal.group&.name,
      created_at: goal.created_at,
      updated_at: goal.updated_at
    }
  end

  def contributor_attributes
    return {} unless goal.group_id.present?

    {
      contributors: build_contributors,
      contributor_count: goal.contributions.where.not(user_id: nil).select(:user_id).distinct.count
    }
  end

  def build_contributors
    contributions_by_user = goal.contributions
      .where.not(user_id: nil)
      .includes(:user)
      .group_by(&:user_id)

    contributions_by_user.map do |_user_id, user_contributions|
      user = user_contributions.first.user
      total = user_contributions.sum(&:amount)

      {
        user_id: user.id,
        user_name: user.name || user.email,
        total_amount: total.to_f,
        contribution_count: user_contributions.size,
        percentage: calculate_percentage(total)
      }
    end.sort_by { |c| -c[:total_amount] }
  end

  def calculate_percentage(amount)
    return 0.0 if goal.current_amount.zero?

    ((amount / goal.current_amount) * 100).round(1)
  end

  def milestone_attributes
    {
      milestones: goal.milestones.ordered.map do |m|
        { percentage: m.percentage, achieved_at: m.achieved_at }
      end
    }
  end
end
