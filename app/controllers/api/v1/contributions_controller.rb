module Api
  module V1
    class ContributionsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_goal
      before_action :set_contribution, only: [ :update, :destroy ]

      def index
        contributions = @goal.contributions
        render json: { contributions: contributions.map { |c| ContributionSerializer.new(c).as_json } }
      end

      def create
        contribution = @goal.contributions.build(contribution_params)
        contribution.user = current_user

        if contribution.save
          @goal.reload
          new_milestones = MilestoneTracker.new(@goal).check_and_record

          # Send email notifications for newly achieved milestones
          new_milestones.each do |milestone|
            MilestoneMailer.achievement(@goal.user, @goal, milestone.percentage).deliver_later
          end

          render json: {
            contribution: ContributionSerializer.new(contribution).as_json,
            goal: GoalSerializer.new(@goal).as_json,
            new_milestones: new_milestones.map(&:percentage)
          }, status: :created
        else
          render json: { errors: contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @contribution.update(contribution_params)
          render json: {
            contribution: ContributionSerializer.new(@contribution).as_json,
            goal: GoalSerializer.new(@goal.reload).as_json
          }
        else
          render json: { errors: @contribution.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @contribution.destroy
        render json: { goal: GoalSerializer.new(@goal.reload).as_json }
      end

      private

      def set_goal
        @goal = current_user.goals.find(params[:goal_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Goal not found" }, status: :not_found
      end

      def set_contribution
        @contribution = @goal.contributions.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Contribution not found" }, status: :not_found
      end

      def contribution_params
        params.permit(:amount, :note, :contributed_at)
      end
    end
  end
end
