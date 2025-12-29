class GoalSerializer
  attr_reader :goal

  def initialize(goal)
    @goal = goal
  end

  def as_json
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
      created_at: goal.created_at,
      updated_at: goal.updated_at
    }
  end
end
