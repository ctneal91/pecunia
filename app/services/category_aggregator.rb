class CategoryAggregator
  def initialize(goals)
    @goals = goals
  end

  def aggregate
    Goal::GOAL_TYPES.map do |goal_type|
      category_goals = goals.select { |g| g.goal_type == goal_type }
      build_category_stats(goal_type, category_goals)
    end
  end

  private

  attr_reader :goals

  def build_category_stats(goal_type, category_goals)
    total_saved = category_goals.sum(&:current_amount)
    total_target = category_goals.sum(&:target_amount)
    completed_count = category_goals.count(&:completed?)

    {
      goal_type: goal_type,
      goal_count: category_goals.size,
      total_saved: total_saved.to_f,
      total_target: total_target.to_f,
      progress: total_target.positive? ? ((total_saved / total_target) * 100).round(1) : 0,
      completed_count: completed_count,
      active_count: category_goals.size - completed_count,
      goals: category_goals.map { |g| GoalSerializer.new(g).as_json }
    }
  end
end
