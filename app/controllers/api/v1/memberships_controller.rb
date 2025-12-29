module Api
  module V1
    class MembershipsController < ApplicationController
      before_action :authenticate_user!
      before_action :set_group
      before_action :require_admin, only: [ :update, :destroy ]
      before_action :set_membership, only: [ :update, :destroy ]

      def update
        if @membership.user == @group.created_by
          render json: { error: "Cannot change the role of the group creator" }, status: :forbidden
          return
        end

        if @membership.update(role: params[:role])
          render json: { membership: MembershipSerializer.new(@membership).as_json }
        else
          render json: { errors: @membership.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def destroy
        if @membership.user == @group.created_by
          render json: { error: "Cannot remove the group creator" }, status: :forbidden
          return
        end

        @membership.destroy
        head :no_content
      end

      def leave
        membership = @group.memberships.find_by(user: current_user)

        if membership.nil?
          render json: { error: "You are not a member of this group" }, status: :not_found
          return
        end

        if @group.created_by == current_user
          render json: { error: "Group creator cannot leave. Delete the group instead." }, status: :forbidden
          return
        end

        membership.destroy
        head :no_content
      end

      private

      def set_group
        @group = current_user.groups.find(params[:group_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Group not found" }, status: :not_found
      end

      def set_membership
        @membership = @group.memberships.find(params[:id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Member not found" }, status: :not_found
      end

      def require_admin
        return if @group.admin?(current_user)

        render json: { error: "You must be an admin to perform this action" }, status: :forbidden
      end
    end
  end
end
