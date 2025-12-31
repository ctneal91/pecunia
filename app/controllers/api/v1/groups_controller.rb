module Api
  module V1
    class GroupsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_group, only: [ :show, :update, :destroy, :regenerate_invite ]
      before_action :require_admin, only: [ :update, :destroy, :regenerate_invite ]

      def index
        groups = current_user.groups.includes(:memberships)
        render json: { groups: groups.map { |g| GroupSerializer.new(g, current_user: current_user).as_json } }
      end

      def show
        render json: { group: GroupSerializer.new(@group, current_user: current_user).as_json_with_members }
      end

      def create
        group = Group.new(group_params)
        group.created_by = current_user

        if group.save
          render json: { group: GroupSerializer.new(group, current_user: current_user).as_json }, status: :created
        else
          render json: { errors: group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def update
        if @group.update(group_params)
          render json: { group: GroupSerializer.new(@group, current_user: current_user).as_json }
        else
          render json: { errors: @group.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        @group.destroy
        head :no_content
      end

      def regenerate_invite
        @group.regenerate_invite_code!
        render json: { group: GroupSerializer.new(@group, current_user: current_user).as_json }
      end

      def join
        group = find_group_by_invite_code
        return if group.nil?
        return if already_member?(group)

        create_membership_and_notify(group)
      end

      private

      def find_group_by_invite_code
        Group.find_by(invite_code: params[:invite_code]).tap do |group|
          render_invalid_invite_code if group.nil?
        end
      end

      def already_member?(group)
        if group.member?(current_user)
          render json: { error: "You are already a member of this group" }, status: :unprocessable_entity
          true
        else
          false
        end
      end

      def create_membership_and_notify(group)
        membership = build_membership(group)

        if membership.save
          notify_existing_members(group)
          render_created_group(group)
        else
          render_membership_errors(membership)
        end
      end

      def build_membership(group)
        group.memberships.build(user: current_user, role: "member")
      end

      def notify_existing_members(group)
        existing_members(group).each do |existing_membership|
          GroupActivityMailer.new_member(existing_membership.user, current_user, group).deliver_later
        end
      end

      def existing_members(group)
        group.memberships.includes(:user).where.not(user: current_user)
      end

      def render_invalid_invite_code
        render json: { error: "Invalid invite code" }, status: :not_found
      end

      def render_created_group(group)
        render json: { group: GroupSerializer.new(group, current_user: current_user).as_json }, status: :created
      end

      def render_membership_errors(membership)
        render json: { errors: membership.errors.full_messages }, status: :unprocessable_entity
      end

      def set_group
        @group = current_user.groups.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Group not found" }, status: :not_found
      end

      def require_admin
        return if @group.admin?(current_user)

        render json: { error: "You must be an admin to perform this action" }, status: :forbidden
      end

      def group_params
        params.permit(:name)
      end
    end
  end
end
