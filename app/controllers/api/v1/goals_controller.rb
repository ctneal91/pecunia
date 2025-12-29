module Api
  module V1
    class GoalsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_goal, only: [ :show, :update, :destroy ]

      def index
        goals = current_user.goals.order(created_at: :desc)
        render json: { goals: goals.map { |g| GoalSerializer.new(g).as_json } }
      end

      def show
        render json: { goal: GoalSerializer.new(@goal).as_json }
      end

      def create
        goal = current_user.goals.build(goal_params)

        if goal.save
          render json: { goal: GoalSerializer.new(goal).as_json }, status: :created
        else
          render json: { errors: goal.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @goal.update(goal_params)
          render json: { goal: GoalSerializer.new(@goal).as_json }
        else
          render json: { errors: @goal.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @goal.destroy
        head :no_content
      end

      def bulk_create
        goals_data = params[:goals] || []
        created_goals = []

        ActiveRecord::Base.transaction do
          goals_data.each do |goal_data|
            goal = current_user.goals.build(
              title: goal_data[:title],
              description: goal_data[:description],
              target_amount: goal_data[:target_amount],
              current_amount: goal_data[:current_amount] || 0,
              goal_type: goal_data[:goal_type],
              target_date: goal_data[:target_date],
              icon: goal_data[:icon],
              color: goal_data[:color]
            )
            goal.save!
            created_goals << goal
          end
        end

        render json: { goals: created_goals.map { |g| GoalSerializer.new(g).as_json } }, status: :created
      rescue ActiveRecord::RecordInvalid => e
        render json: { errors: [ e.message ] }, status: :unprocessable_entity
      end

      private

      def set_goal
        @goal = current_user.goals.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Goal not found" }, status: :not_found
      end

      def goal_params
        params.permit(:title, :description, :target_amount, :current_amount, :goal_type, :target_date, :icon, :color)
      end
    end
  end
end
