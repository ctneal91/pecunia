module Api
  module V1
    class UsersController < ApplicationController
      before_action :authenticate_user!, only: [ :update ]

      def me
        if logged_in?
          render json: { user: UserSerializer.new(current_user).as_json }
        else
          render json: { user: nil }
        end
      end

      def update
        if current_user.update(user_params)
          render json: { user: UserSerializer.new(current_user).as_json }
        else
          render json: { errors: current_user.errors.full_messages }, status: :unprocessable_entity
        end
      end

      private

      def user_params
        params.permit(:name, :avatar_url, :password, :password_confirmation)
      end
    end
  end
end
