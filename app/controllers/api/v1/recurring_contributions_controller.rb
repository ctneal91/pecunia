module Api
  module V1
    class RecurringContributionsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_goal
      before_action :set_recurring_contribution, only: [ :update, :destroy ]

      def index
        recurring_contributions = @goal.recurring_contributions
        render json: {
          recurring_contributions: recurring_contributions.map { |rc| RecurringContributionSerializer.new(rc).as_json }
        }
      end

      def create
        recurring_contribution = @goal.recurring_contributions.build(recurring_contribution_params)
        recurring_contribution.user = current_user

        if recurring_contribution.save
          render json: {
            recurring_contribution: RecurringContributionSerializer.new(recurring_contribution).as_json
          }, status: :created
        else
          render json: { errors: recurring_contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @recurring_contribution.update(recurring_contribution_params)
          render json: {
            recurring_contribution: RecurringContributionSerializer.new(@recurring_contribution).as_json
          }
        else
          render json: { errors: @recurring_contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @recurring_contribution.destroy
        render json: { message: "Recurring contribution deleted" }
      end

      private

      def set_goal
        @goal = current_user.goals.find(params[:goal_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Goal not found" }, status: :not_found
      end

      def set_recurring_contribution
        @recurring_contribution = @goal.recurring_contributions.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Recurring contribution not found" }, status: :not_found
      end

      def recurring_contribution_params
        params.permit(:amount, :frequency, :next_occurrence_at, :end_date, :is_active, :note)
      end
    end
  end
end
