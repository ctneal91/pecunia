module Api
  module V1
    class DashboardController < ApplicationController
      before_action :authenticate_user!

      def index
        goals = current_user.goals
        contributions = Contribution.joins(:goal).where(goals: { user_id: current_user.id })

        total_saved = goals.sum(:current_amount)
        total_target = goals.sum(:target_amount)
        completed_count = goals.select(&:completed?).count
        recent_contributions = contributions.order(contributed_at: :desc).limit(5)

        render json: {
          stats: {
            total_saved: total_saved.to_f,
            total_target: total_target.to_f,
            overall_progress: total_target.positive? ? ((total_saved / total_target) * 100).round(1) : 0,
            goal_count: goals.count,
            completed_count: completed_count,
            active_count: goals.count - completed_count
          },
          recent_contributions: recent_contributions.map do |c|
            {
              id: c.id,
              amount: c.amount.to_f,
              note: c.note,
              contributed_at: c.contributed_at,
              goal: {
                id: c.goal.id,
                title: c.goal.title,
                goal_type: c.goal.goal_type
              }
            }
          end,
          goals_summary: goals.order(created_at: :desc).limit(5).map do |g|
            GoalSerializer.new(g).as_json
          end
        }
      end
    end
  end
end
