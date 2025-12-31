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
        contribution = build_contribution

        if contribution.save
          process_successful_contribution(contribution)
          render_created_contribution(contribution)
        else
          render_contribution_errors(contribution)
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

      GOAL_COMPLETION_PERCENTAGE = 100

      def build_contribution
        @goal.contributions.build(contribution_params).tap do |contribution|
          contribution.user = current_user
        end
      end

      def process_successful_contribution(contribution)
        @goal.reload
        @new_milestones = track_milestones
        notify_milestone_achievements
        notify_group_members(contribution)
      end

      def track_milestones
        MilestoneTracker.new(@goal).check_and_record
      end

      def notify_milestone_achievements
        return unless @goal.user.present?

        @new_milestones.each do |milestone|
          MilestoneMailer.achievement(@goal.user, @goal, milestone.percentage).deliver_later
        end
      end

      def notify_group_members(contribution)
        return unless @goal.group.present?

        notify_group_of_contribution(contribution)
        notify_group_of_completion if goal_completed?
      end

      def notify_group_of_contribution(contribution)
        group_members_except_current.each do |membership|
          GroupActivityMailer.new_contribution(membership.user, contribution, @goal).deliver_later
        end
      end

      def notify_group_of_completion
        group_members.each do |membership|
          GroupActivityMailer.goal_completed(membership.user, @goal).deliver_later
        end
      end

      def goal_completed?
        @new_milestones.any? { |m| m.percentage == GOAL_COMPLETION_PERCENTAGE }
      end

      def group_members
        @goal.group.memberships.includes(:user)
      end

      def group_members_except_current
        group_members.where.not(user: current_user)
      end

      def render_created_contribution(contribution)
        render json: {
          contribution: ContributionSerializer.new(contribution).as_json,
          goal: GoalSerializer.new(@goal).as_json,
          new_milestones: @new_milestones.map(&:percentage)
        }, status: :created
      end

      def render_contribution_errors(contribution)
        render json: { errors: contribution.errors.full_messages }, status: :unprocessable_entity
      end

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
