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
            if @goal.user.present?
              MilestoneMailer.achievement(@goal.user, @goal, milestone.percentage).deliver_later
            end
          end

          # Send email notifications to group members for group goals
          if @goal.group.present?
            @goal.group.memberships.includes(:user).each do |membership|
              # Don't send notification to the person who made the contribution
              next if membership.user == current_user

              GroupActivityMailer.new_contribution(membership.user, contribution, @goal).deliver_later
            end

            # Check if goal was just completed and notify group members
            if new_milestones.any? { |m| m.percentage == 100 }
              @goal.group.memberships.includes(:user).each do |membership|
                GroupActivityMailer.goal_completed(membership.user, @goal).deliver_later
              end
            end
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
        # Find personal goals or group goals where user is a member
        @goal = Goal.joins("LEFT JOIN memberships ON goals.group_id = memberships.group_id")
                    .where("goals.user_id = ? OR (goals.group_id IS NOT NULL AND memberships.user_id = ?)",
                           current_user.id, current_user.id)
                    .find(params[:goal_id])
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
