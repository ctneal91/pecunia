module Api
  module V1
    class GroupInvitesController < ApplicationController
      before_action :authenticate_user!, except: [ :show ]
      before_action :set_group, only: [ :index, :create, :resend ]
      before_action :require_admin, only: [ :create, :resend ]

      def index
        invites = @group.group_invites.order(created_at: :desc)
        render json: { invites: invites.map { |i| serialize_invite(i) } }
      end

      def create
        email = params[:email]&.strip&.downcase

        if @group.members.exists?(email: email)
          render json: { error: "This person is already a member of the group" }, status: :unprocessable_entity
          return
        end

        existing = @group.group_invites.find_by(email: email)
        if existing&.pending?
          render json: { error: "An invitation has already been sent to this email" }, status: :unprocessable_entity
          return
        end

        invite = @group.group_invites.build(
          email: email,
          invited_by: current_user
        )

        if invite.save
          GroupInviteMailer.invite(invite).deliver_later
          render json: { invite: serialize_invite(invite) }, status: :created
        else
          render json: { errors: invite.errors.full_messages }, status: :unprocessable_entity
        end
      end

      def resend
        invite = @group.group_invites.pending.find(params[:id])

        if invite.expired?
          invite.update!(token: SecureRandom.urlsafe_base64(32), created_at: Time.current)
        end

        GroupInviteMailer.invite(invite).deliver_later
        render json: { invite: serialize_invite(invite), message: "Invitation resent" }
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Invite not found" }, status: :not_found
      end

      def show
        invite = GroupInvite.includes(:group).find_by(token: params[:token])

        if invite.nil?
          render json: { error: "Invalid invitation" }, status: :not_found
          return
        end

        if invite.expired? && invite.pending?
          render json: { error: "This invitation has expired" }, status: :gone
          return
        end

        render json: {
          invite: {
            id: invite.id,
            status: invite.status,
            group_name: invite.group.name,
            inviter_name: invite.invited_by.name || invite.invited_by.email.split("@").first,
            expired: invite.expired?
          }
        }
      end

      def accept
        invite = GroupInvite.find_by(token: params[:token])

        if invite.nil?
          render json: { error: "Invalid invitation" }, status: :not_found
          return
        end

        if !invite.pending?
          render json: { error: "This invitation has already been #{invite.status}" }, status: :unprocessable_entity
          return
        end

        if invite.expired?
          render json: { error: "This invitation has expired" }, status: :gone
          return
        end

        if invite.accept!(current_user)
          render json: { group: GroupSerializer.new(invite.group, current_user: current_user).as_json }
        else
          render json: { error: "Unable to accept invitation" }, status: :unprocessable_entity
        end
      end

      def decline
        invite = GroupInvite.find_by(token: params[:token])

        if invite.nil?
          render json: { error: "Invalid invitation" }, status: :not_found
          return
        end

        if invite.decline!
          render json: { message: "Invitation declined" }
        else
          render json: { error: "Unable to decline invitation" }, status: :unprocessable_entity
        end
      end

      def pending
        invites = GroupInvite.pending
                             .where(email: current_user.email)
                             .includes(:group, :invited_by)
                             .where("created_at > ?", 7.days.ago)

        render json: {
          invites: invites.map do |invite|
            {
              token: invite.token,
              group_name: invite.group.name,
              inviter_name: invite.invited_by.name || invite.invited_by.email.split("@").first,
              invited_at: invite.created_at
            }
          end
        }
      end

      private

      def set_group
        @group = current_user.groups.find(params[:group_id])
      rescue ActiveRecord::RecordNotFound
        render json: { error: "Group not found" }, status: :not_found
      end

      def require_admin
        return if @group.admin?(current_user)

        render json: { error: "You must be an admin to send invites" }, status: :forbidden
      end

      def serialize_invite(invite)
        {
          id: invite.id,
          email: invite.email,
          status: invite.status,
          expired: invite.expired?,
          invited_at: invite.created_at,
          accepted_at: invite.accepted_at
        }
      end
    end
  end
end
